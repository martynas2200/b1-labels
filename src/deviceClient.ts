/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { UINotification } from "./services/notification";

export type DeviceType = 'barcode' | 'scales' | 'printer'

export interface DeviceStatus {
  connected: boolean,
  lastMessage?: string,
  error?: string
}

interface Serial {
  requestPort(): Promise<SerialPort>;
}
interface SerialPort {
  open(options: { baudRate: number }): Promise<void>;
  close(): Promise<void>;
  readable: ReadableStream<Uint8Array>;
  writable: WritableStream<Uint8Array>;
}
class EventEmitter {
  private events: Record<string, Function[]> = {}
  on(event: string, listener: Function) {
    (this.events[event] ||= []).push(listener)
  }
  emit(event: string, ...args: any[]) {
    (this.events[event] || []).forEach((fn) => fn(...args))
  }
}

export class DeviceClient extends EventEmitter {
  private wsConnections: Partial<Record<DeviceType, WebSocket>> = {}
  // Use SerialPort type from Web Serial API
  private comPorts: Partial<Record<DeviceType, SerialPort>> = {}
  public status: Record<DeviceType, DeviceStatus> = {
    barcode: { connected: false },
    scales: { connected: false },
    printer: { connected: false },
  }

  constructor(private config: Partial<Record<DeviceType, string>>, private notification: UINotification) {
    super()
  }

  connect(device: DeviceType) {
    const cfg = this.config[device]
    if (cfg !== undefined && cfg.includes('ws')) {
      this.connectWebSocket(device, cfg)
    } else if (cfg !== undefined && cfg.includes('COM')) {
      void this.connectComPort(device)
    }
  }

  private connectWebSocket(device: DeviceType, url: string) {
    const ws = new WebSocket(url)
    ws.onopen = () => {
      this.status[device].connected = true
      this.status[device].error = undefined
    }
    ws.onmessage = (event) => {
      this.status[device].lastMessage = event.data
      // Handle device-specific logic here
      switch (device) {
        case 'barcode':
          void this.readBarcodeMessage(event.data)
          break
        case 'scales':
          void this.readWeightMessage(event.data)
          break
        case 'printer':
          void this.readPrinterMessage(event.data)
          break
      }
    }
    ws.onerror = (_err) => {
      this.status[device].error = 'WebSocket error'
      this.status[device].connected = false
      this.notification.error(`Error connecting to ${device} WebSocket: ${_err}`)
    }
    ws.onclose = () => {
      this.status[device].connected = false
    }
    this.wsConnections[device] = ws
  }

  async connectComPort(device: DeviceType, baudRate = 9600) {
    if (!('serial' in navigator)) {
      this.status[device].error = 'Web Serial API not supported'
      return
    }
    try {
      // Request port (user must select)
      const port: SerialPort = await (navigator as unknown as { serial: Serial }).serial.requestPort()
      await port.open({ baudRate })
      this.comPorts[device] = port
      this.status[device].connected = true
      this.status[device].error = undefined
      // Optionally, set up reading from the port
      void this.readFromComPort(device)
    } catch (err) {
      this.status[device].error = 'COM port error: ' + (err as Error).message
      this.status[device].connected = false
    }
  }

  private async readFromComPort(device: DeviceType) {
    const port = this.comPorts[device]
    if (!port) { return }
    try {
      const reader = port.readable.getReader()
      while (this.status[device].connected) {
        const { value, done } = await reader.read()
        if (done) { break }
        if (value) {
          const message = new TextDecoder().decode(value)
          this.status[device].lastMessage = message

          switch (device) {
            case 'barcode':
              void this.readBarcodeMessage(message)
              break
            case 'scales':
              void this.readWeightMessage(message)
              break
            case 'printer':
              void this.readPrinterMessage(message)
              break
          }
        }
      }
      reader.releaseLock()
    } catch (err) {
      this.status[device].error = 'Read error: ' + (err as Error).message
    }
    
  }

  private async readBarcodeMessage(barcode: string) {
    // ...read logic...
    // this.emit('barcode', barcode)
    // could be BARCODE:<barcode>
    // could be BARCODE:<CR><barcode>
    // could be STATUS:<status>
    if (barcode.startsWith('BARCODE:')) {
      const code = barcode.replace('BARCODE:', '').trim()
      // remove any trailing CR or LF
      // const cleanedCode = code.replace(/[\r\n]+$/, '')
      //leave only numbers
      const cleanedCode = code.replace(/[\x00-\x1F\x7F]/g, '').replace(/[^0-9]/g, '')
      if (cleanedCode.length === 0) {
        this.notification.error(`Invalid barcode: ${code}`)
        return
      }
      console.debug('BBBarcode read:', cleanedCode)
      this.emit('barcode', cleanedCode)
    }
    else if (barcode.startsWith('STATUS:')) {
      const status = barcode.replace('STATUS:', '').trim()
      // Improve status handling
      if (status.includes('ERROR')) {
        this.status.barcode.error = status
        this.notification.error(`Barcode device error: ${status}`)
        this.status.barcode.connected = false
      } else {
        this.status.barcode.connected = status === 'CONNECTED'
        this.status.barcode.error = undefined
        this.notification.success(`Barcode device status: ${status}`)
      }
      this.emit('status', { device: 'barcode', status })
    }
  }
  private async readWeightMessage(weight: string) {
    // ...read logic...
    this.emit('weight', weight)
  }
  private async readPrinterMessage(printer: string) {
    // ...read logic...
    this.emit('printer', printer)
  }

  async sendToDevice(device: DeviceType, data: string) {
    // Send data to device (printer, etc.)
    if (this.wsConnections[device]?.readyState === WebSocket.OPEN) {
      this.wsConnections[device]?.send(data)
    } else if (this.comPorts[device]) {
      const encoder = new TextEncoder()
      const writer = this.comPorts[device]?.writable.getWriter()
      await writer.write(encoder.encode(data))
      writer.releaseLock()
    } else {
      this.status[device].error = 'Device not connected'
    }
  }

  async disconnect(device: DeviceType) {
    if (this.wsConnections[device]) {
      this.wsConnections[device]?.close()
      delete this.wsConnections[device]
    }
    if (this.comPorts[device]) {
      await this.comPorts[device]?.close()
      delete this.comPorts[device]
    }
    this.status[device].connected = false
  }
}

