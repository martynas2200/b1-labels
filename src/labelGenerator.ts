import { i18n } from './i18n'
import { type packagedItem, type item } from './item'
import printStyles from './styles/label-print.scss'
import { Code128, getDataMatrixMat, toPath } from './barcodeGenerator'

export class LabelGenerator {
  private items: item[] = []
  private readonly alternativeLabelFormat: boolean

  constructor(data: item[] | Promise<item[]> | packagedItem[] | Promise<packagedItem[]> | undefined = undefined, alternativeLabelFormat: boolean = false) {
    this.alternativeLabelFormat = alternativeLabelFormat
    if (data == null) {
      // The constructor was called without data.
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

  print(): void {
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

  private isAllItemsActive(): boolean {
    return this.items.every(item => item.isActive)
  }

  private makeUpperCaseBold(text: string): string {
    const regex = /("[^"]+"|[A-ZŽĄČĘĖĮŠŲŪ]{3,})/g
    return text.replace(regex, '<b>$1</b>')
  }

  private generateLabel(data: packagedItem): HTMLDivElement {
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

    if (data.barcode != null) {
      const barcode = document.createElement('div')
      barcode.className = 'barcode'
      const barcodeText = document.createElement('div')
      barcodeText.innerHTML = (data.departmentNumber != null ? 'S' + data.departmentNumber + ' ' : '') + data.barcode
      barcode.appendChild(barcodeText)
      const code128 = new Code128(data.barcode)
      const p = document.createElement('p')
      p.innerHTML = code128.toHtml(code128.encode(), this.alternativeLabelFormat ? [1, 50] : [1, 15])
      barcode.appendChild(p)
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
      deposit.textContent = 'Tara +0.10'
      label.appendChild(deposit)
    } else if (data.measurementUnitCanBeWeighed == true) {
      const deposit = document.createElement('div')
      deposit.className = 'deposit'
      deposit.textContent = '/ 1 ' + data.measurementUnitName
      label.appendChild(deposit)
    }

    label.appendChild(item)
    return label
  }

  private generateWeightLabel(data: packagedItem): HTMLDivElement {
    const parent = document.createElement('div')
    if (data.weight == null || data.totalPrice == null || data.priceWithVat == null || data.barcode == null || data.barcode.length > 13) {
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
    if (data.measurementUnitCanBeWeighed == true) {
      weight.textContent = data.weight.toFixed(3)
    } else {
      weight.textContent = data.weight.toString()
    }
    label.appendChild(weight)

    const kgPrice = document.createElement('div')
    kgPrice.className = 'kg-price'
    kgPrice.textContent = data.priceWithVat.toFixed(2)
    label.appendChild(kgPrice)

    const weightText = document.createElement('div')
    weightText.className = 'weight-text'
    weightText.textContent = data.measurementUnitName
    label.appendChild(weightText)

    const kgText = document.createElement('div')
    kgText.className = 'kg-text'
    kgText.textContent = '€/' + data.measurementUnitName
    label.appendChild(kgText)

    const barcode = document.createElement('div')
    barcode.className = 'barcode'
    // Prefix 2200, then 13 digits of barcode, then 4 digits of weight
    const barcodeString = (data.addPackageFeeNote == true ? '1102\r' : '') + '2200' + '0'.repeat(13 - data.barcode.length) + data.barcode + '0'.repeat(5 - data.weight.toFixed(3).length) + data.weight.toFixed(3).replace('.', '')
    const svgNS = "http://www.w3.org/2000/svg";
    const svg: SVGSVGElement = document.createElementNS(svgNS, 'svg');
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('transform', 'scale(1)')
    svg.appendChild(path)
    barcode.appendChild(svg)
    path.setAttribute('d', toPath(getDataMatrixMat(barcodeString)))
    svg.setAttribute('class', 'datamatrix')
    svg.setAttribute('viewBox', '0 0 18 18')
    label.appendChild(barcode)

    if (data.expiryDate != null) {
      const expiryText = document.createElement('div')
      expiryText.className = 'expiracy'
      expiryText.textContent = 'Geriausia iki '
      const expiryDate = document.createElement('span')
      expiryDate.textContent = new Date(data.expiryDate).toLocaleDateString('lt-LT', { month: '2-digit', day: '2-digit' })

      expiryText.appendChild(expiryDate)
      label.appendChild(expiryText)
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

  private async printLabelsUsingBrowser(data: item[]): Promise<void> {
    const labels: HTMLElement[] = data.map(item => this.generateLabel(item))

    const popup: Window | null = window.open('', '_blank', 'width=700,height=700')
    if (popup == null) {
      alert('Please allow popups for this site')
      return
    }
    popup.document.title = `${labels.length} ${i18n('nlabelsToBePrinted')}`
    const style: HTMLStyleElement = document.createElement('style')
    style.innerHTML = `${printStyles}`
    popup.document.head.appendChild(style)

    labels.forEach(label => {
      popup.document.body.appendChild(label)
    })

    // wait for the images to load if there are any
    const images = popup.document.getElementsByTagName('img')
    const promises = Array.from(images).map(image => {
      return new Promise((resolve, reject) => {
        image.onload = resolve
        image.onerror = reject
      })
    })

    await Promise.all(promises)

    popup.addEventListener('afterprint', () => {
      popup.close()
    })
    popup.print()
  }
}
