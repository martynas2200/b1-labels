import { i18n } from './i18n'
import { type packagedItem, type item } from './item'
import printStyles from './styles/label-print.scss'

export class LabelGenerator {
  private items: item[] = []
  private readonly allItemsActive: boolean = true
  private readonly alternativeLabelFormat: boolean

  constructor (data: item[] | Promise<item[]> | packagedItem[] | Promise<packagedItem[]> | undefined = undefined, alternativeLabelFormat: boolean = false) {
    this.alternativeLabelFormat = alternativeLabelFormat
    if (data == null) {
      // The constructor was called without data.
      // You can add your logic here.
    } else if (data instanceof Promise) {
      void data.then(data => {
        this.items = data
        this.print()
      })
    } else {
      this.items = data
      this.print()
    }
  }

  print (): void {
    this.items = this.items.filter(item => item.isActive == true && item.barcode != null)
    if (!this.isAllItemsActive() && !confirm(i18n('notAllItemsActive'))) {
      return
    }
    if (this.items.length > 0) {
      void this.printLabelsUsingBrowser(this.items)
    } else {
      alert(i18n('noData'))
    }
  }

  private isAllItemsActive (): boolean {
    return this.items.every(item => item.isActive)
  }

  private getBarcodeType (barcode: string): string {
    if (barcode.length === 8) {
      return '8'
    } else if (barcode.length === 13) {
      return '13'
    } else {
      return 'code128'
    }
  }

  private makeUpperCaseBold (text: string): string {
    const regex = /("[^"]+"|[A-ZŽĄČĘĖĮŠŲŪ]{3,})/g
    return text.replace(regex, '<b>$1</b>')
  }

  private generateLabel (data: packagedItem): HTMLDivElement {
    const label = document.createElement('div')
    label.className = 'label'
    if (this.alternativeLabelFormat) {
      label.classList.add('alternative')
    } else if (data.weight != null) {
      return this.generateWeightLabel(data)
    }

    const item = document.createElement('div')
    item.className = 'item'
    item.innerHTML = this.makeUpperCaseBold(data.name)

    if ((data.barcode != null)) {
      const barcode = document.createElement('div')
      barcode.className = 'barcode'
      const barcodeText = document.createElement('div')
      barcodeText.innerHTML = ((data.code != null) ? '<small>' + data.code + '</small>' : '') +
            (data.departmentNumber != null ? 'S' + data.departmentNumber + ' ' : '') + (data.barcode)
      const barcodeImage = document.createElement('img')
      barcodeImage.src = `https://barcodeapi.org/api/${this.getBarcodeType(data.barcode)}/${data.barcode}`
      barcode.appendChild(barcodeText)
      barcode.appendChild(barcodeImage)
      label.appendChild(barcode)
    }
    if (data.priceWithVat != 0) {
      const price = document.createElement('div')
      price.className = 'price'
      if (typeof data.priceWithVat === 'number') {
        price.textContent = data.priceWithVat.toFixed(2)
      } else {
        price.textContent = parseFloat(data.priceWithVat).toFixed(2).toString()
      }
      label.appendChild(price)
    }

    if (data.packageCode != null) {
      const deposit = document.createElement('div')
      deposit.className = 'deposit'
      deposit.textContent = 'Tara +0,10'
      label.appendChild(deposit)
    } else if (data.measurementUnitName === 'kg') {
      const deposit = document.createElement('div')
      deposit.className = 'deposit'
      deposit.textContent = '/ 1 ' + data.measurementUnitName
      label.appendChild(deposit)
    }

    label.appendChild(item)
    return label
  }

  private generateWeightLabel (data: packagedItem): HTMLDivElement {
    const parent = document.createElement('div')
    if (data.weight == null || data.totalPrice == null || data.priceWithVat == null || data.barcode == null) {
      // this.notifier.error('label data is missing')
      return parent
    }
    parent.className = 'label'
    const label = document.createElement('div')
    label.className = 'weighted'

    const item = document.createElement('div')
    item.className = 'item'
    item.innerHTML = data.name
    label.appendChild(item)

    const price = document.createElement('div')
    price.className = 'fprice'
    price.textContent = (data.totalPrice != null) ? data.totalPrice.toFixed(2) + ' €' : ''
    label.appendChild(price)

    const weight = document.createElement('div')
    weight.className = 'weight'
    weight.textContent = data.weight.toFixed(3)
    label.appendChild(weight)

    const kgPrice = document.createElement('div')
    kgPrice.className = 'kg-price'
    kgPrice.textContent = data.priceWithVat.toFixed(2)
    label.appendChild(kgPrice)

    const weightText = document.createElement('div')
    weightText.className = 'weight-text'
    weightText.textContent = 'kg'
    label.appendChild(weightText)

    const kgText = document.createElement('div')
    kgText.className = 'kg-text'
    kgText.textContent = '€/kg'
    label.appendChild(kgText)

    const barcode = document.createElement('div')
    barcode.className = 'barcode'
    const barcodeImage = document.createElement('img')
    // Prefix 2200, then 13 digits of barcode, then 4 digits of weight
    // if the barcode is shorter than 13 digits, add 0s to the end, same with weight
    const barcodeString = '2200' + '0'.repeat(13 - data.barcode.length) + data.barcode + '0'.repeat(5 - data.weight.toFixed(3).length) + data.weight.toFixed(3).replace('.', '')
    barcodeImage.src = `https://barcodeapi.org/api/dm/${barcodeString}`
    barcode.appendChild(barcodeImage)
    label.appendChild(barcode)

    if (data.expiryDate != null) {
      const expiryText = document.createElement('div')
      expiryText.className = 'expiracy-text'
      expiryText.textContent = 'Geriausia iki:'
      label.appendChild(expiryText)

      const expiry = document.createElement('div')
      expiry.className = 'expiracy'
      const expiryDate = new Date(data.expiryDate)
      expiry.textContent = expiryDate.toLocaleDateString('lt-LT', { month: '2-digit', day: '2-digit' })
      label.appendChild(expiry)
    }

    if (data.batchNumber != null) {
      const series = document.createElement('div')
      series.className = 'batch-no'
      series.textContent = `Part. nr. ${data.batchNumber}`
      label.appendChild(series)
    }

    if (data.addManufacturer == true && data.manufacturerName != null) {
      const manufacturer = document.createElement('div')
      manufacturer.className = 'manufacturer'
      manufacturer.textContent = data.manufacturerName
      label.appendChild(manufacturer)
    }
    
    if (data.addPackageFeeNote == true) {
      const packageCode = document.createElement('div')
      packageCode.className = 'package'
      packageCode.textContent = '+ 0,01 (fas. maišelis)'
      label.appendChild(packageCode)
    }
    parent.appendChild(label)
    return parent
  }

  private async printLabelsUsingBrowser (data: item[]): Promise<void> {
    const labels: HTMLElement[] = data.map(item => this.generateLabel(item))

    const popup: Window | null = window.open('', '_blank', 'width=700,height=700')
    if (popup == null) {
      alert('Please allow popups for this site')
      return
    }
    popup.document.title = `${labels.length} ${i18n('nlabelsToBePrinted')}`

    // const style: HTMLLinkElement = document.createElement('link')
    // style.rel = 'stylesheet'
    // style.href = 'https://raw.githubusercontent.com/martynas2200/b1-labels/main/dist/styles/label-print.css'
    // popup.document.head.appendChild(style)
    const style: HTMLStyleElement = document.createElement('style')
    style.innerHTML = `${printStyles}`
    style.type = 'text/css'
    popup.document.head.appendChild(style)

    labels.forEach(label => {
      popup.document.body.appendChild(label)
    })

    await new Promise<void>(resolve => {
      const images: NodeListOf<HTMLImageElement> = popup.document.querySelectorAll('.barcode img')
      let counter: number = 0
      images.forEach(image => {
        image.onload = () => {
          counter++
          if (counter === images.length) {
            resolve()
          }
        }
      })
      setTimeout(resolve, 5000) // default timeout
    })

    popup.addEventListener('afterprint', () => {
      popup.close()
    })
    popup.print()
  }
}
