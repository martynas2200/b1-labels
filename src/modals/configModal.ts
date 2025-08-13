// src/modals/configModal.ts
import { DeviceConfig, DeviceType } from '../deviceClient';
import { i18n } from '../services/i18n'
import { ModalService } from '../services/modal'
declare let GM: any

export class ConfigModal {
  constructor(private modalService: ModalService) { }
   
  async show(): Promise<void> {
    await this.modalService.showModal({
      template: `
      <div class="modal-header">
        <h5 class="modal-title">Configuration</h5>
      </div>
      <div class="modal-body">
      <div class="btn-group-vertical w-100">
      <button ng-click="closeModal()" class="btn btn-danger mb-2 w-100">
        <i class="fa fa-sign-out"></i> ${i18n('logout')}
      </button>
        <button ng-click="updateVoiceApi()" class="btn btn-primary mb-2 w-100">Update Voice API Key</button>
        <button ng-click="updateMarkdownsUrl()" class="btn btn-secondary mb-2 w-100">Update Markdown URL</button>
        <button ng-click="updateLogin()" class="btn btn-secondary mb-2 w-100">Update Login Details</button>
        <button ng-click="updateDevices()" class="btn btn-info w-100">Update Devices (Printer/Scanner/Scales)</button>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn" ng-click="closeModal()">
          <i class="fa fa-times"></i>${i18n('close')}
        </button>
      </div>`,
      scopeProperties: {
        typeId: null,
        openForSelect: false,
        closeModal: () => this.modalService.modalInstance?.close(),
        updateVoiceApi: () => this.updateVoiceApi(),
        updateLogin: () => this.updateLogin(),
        updateDevices: () => this.updateDevices(),
        updateMarkdownsUrl: () => this.updateMarkdownsUrl(),
      },
    })
  }
  private async updateVoiceApi() {
    const apiKey = prompt('Enter new Voice API Key:')
    if (apiKey === null) {
      return
    }
    await GM.setValue('api-key', apiKey)
    alert('API key saved')
  }
  private async updateLogin() {
    const username = prompt('Enter new Username:')
    const password = prompt('Enter new Password:')
    if (username != null && password != null) {
      await GM.setValue('username', username)
      await GM.setValue('password', password)
      alert('Login details saved')
    }
  }
  private async updateDevice(type: string) {
    const config = prompt(`Should ${type} use WebSocket or Serial Port? Type ws link for WebSocket or 'COM' for Serial communication or 'none':`, 'none')
    if (config?.includes('ws')) {
        await this.saveConfig(`devices.${type}`, config)
    } else if (config === 'serial') {
      await this.saveConfig(`devices.${type}`, 'COM')
      window.alert('Serial Port configuration Browser API will follow soon.')
      // Implement Serial Port configuration logic here
    } else if (config === 'none') {
      await this.saveConfig(`devices.${type}`, '')
      window.alert(`${type} device configuration cleared.`)
    } else {
      window.alert('Cancelled device configuration update.')
    }
  }
  async updateMarkdownsUrl(): Promise<void> { //not clear what this function does
    const url = window.prompt('Enter the URL')
    if (url === null) {
      return
    }
    await GM.setValue('url', url)
    alert('URL saved')
  }
  private async updateDevices() {
    const devices = ['barcode', 'scales', 'printer']
    for (const device of devices) {
      await this.updateDevice(device)
    }
    window.alert('Device configuration updated!')
  }
  private closeModal() {
    this.modalService.modalInstance?.close()
  }
  private async saveConfig(key: string, value: string): Promise<void> {
    if (!key || !value) {
      alert('Invalid configuration data.')
      return
    }
    await GM.setValue(key, value)
  }
}
export default ConfigModal