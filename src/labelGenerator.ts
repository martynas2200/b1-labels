import { i18n } from './services/i18n'
import { type Item, type PackagedItem } from './types/item'
import { type LabelType } from './types/label'
import printStyles from './styles/label-print.scss'
import { Code128, getDataMatrixMat, toPath } from './services/barcodeGenerator'

export { type LabelType } from './types/label'

export class LabelGenerator {
  items: Item[] = []
  success: boolean = false
  readonly type: LabelType

  constructor(data: Item[] | Promise<Item[]> | PackagedItem[] | Promise<PackagedItem[]> | undefined = undefined, type: LabelType = 'normal') {
    this.type = type
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
    this.items = this.items.filter(
      (item) => item.barcode != null,
    )
    if (!this.isAllItemsActive()) {
      if (!confirm(i18n('notAllItemsActive'))) {
        return
      }
    }
    if (this.type == 'half' && this.items.length % 2 != 0) {
      if (!confirm(i18n('oddNumberOfItems'))) {
        return
      }
    }

    if (this.items.length > 0) {
      void this.printLabelsUsingBrowser(this.items)
    } else {
      alert(i18n('noData'))
    }
  }

  isAllItemsActive(): boolean {
    return this.items.every(item => item.isActive)
  }

  makeUpperCaseBold(text: string): string {
    const regex = /("[^"]+"|[A-ZŽĄČĘĖĮŠŲŪ]{3,})/g
    return text.replace(regex, '<b>$1</b>')
  }

  static getPricePerUnit(item: Item): string | null {
    const regex = /(?:,?\s*)?(?:(\d+)\s*x\s*)?(\d+(\.\d+)?(?:,\d+)?)[\s]*(k?g|m?l|vnt|pak|rul)\b/i
    const match = item.name.match(regex)

    if (match) {
      // if match is found, double check if there is another number in the string by removing the first match
      const match2 = item.name.replace(match[0], '').match(regex)
      if (match2) {
        return null
      }

      const multiplier = match[1] ? parseInt(match[1]) : 1 // Multiplier if "4 x" pattern exists
      const amount = parseFloat(match[2].replace(',', '.')) * multiplier // Total amount
      const unit = match[4].replace('.', '').toLowerCase() // Normalize unit
      let pricePerUnit

      if (unit === 'g' || unit === 'ml') {
        pricePerUnit = (item.priceWithVat / (amount / 1000)).toFixed(2) +
          (unit === 'ml' ? ' €/l' : ' €/kg')
      } else {
        pricePerUnit = (item.priceWithVat / amount).toFixed(2) + ' €/' + unit
      }
      if (parseFloat(pricePerUnit) === item.priceWithVat) {
        return null
      }
      return pricePerUnit
    }
    return null
  }

  generateLabel(
    data: PackagedItem,
    type: LabelType = this.type,
  ): HTMLDivElement {
    const label = document.createElement('div')
    label.className = 'label'
    if (data.weight != null) {
      return this.generateWeightLabel(data, type === 'half')
    } else if (type !== 'normal') {
      label.classList.add(type)
    }

    label.appendChild(
      this.createDivWithClass('item', this.makeUpperCaseBold(data.name), true),
    )

    if (data.barcode != null && type !== 'half') {
      label.appendChild(this.createCode123Div(data))
    } else if (data.barcode != null) {
      label.appendChild(this.createDMDiv(data))
    }

    label.appendChild(this.createDivWithClass('price', this.getItemPrice(data)))

    if (data.packageCode != null) {
      label.appendChild(this.createDivWithClass('subtext', 'Tara +0.10'))
    } else if (data.measurementUnitCanBeWeighed == true) {
      label.appendChild(
        this.createDivWithClass('subtext', '/ 1 ' + data.measurementUnitName),
      )
    }

    return label
  }

  getItemPrice(data: Item): string {
    if (data.priceWithVat == null || data.priceWithVat === 0) {
      return ''
    }
    if (typeof data.priceWithVat === 'number') {
      return data.priceWithVat.toFixed(2)
    } else {
      return parseFloat(data.priceWithVat).toFixed(2).toString()
    }
  }

  createCode123Div(data: Item): HTMLDivElement {
    const barcode = document.createElement('div')
    barcode.className = 'barcode'

    barcode.appendChild(this.createDivWithClass('barcode-text', data.barcode))

    const code128 = new Code128(data.barcode)
    const p = document.createElement('p')
    p.innerHTML = code128.toHtml(
      code128.encode(),
      this.type == 'barcodeOnly' ? [1, 50] : [1, 15],
    )
    barcode.appendChild(p)
    return barcode
  }
  generateWeightLabel(data: PackagedItem, half = false): HTMLDivElement {
    const label = document.createElement('div')

    if (
      data.weight == null ||
      data.totalPrice == null ||
      data.priceWithVat == null ||
      data.barcode == null ||
      data.barcode.length > 13
    ) {
      return label
    }
    label.className = 'label weight' + (half ? ' half' : '')

    const elements = [
      { className: 'item', text: data.name },
      {
        className: 'price',
        text:
          half && data.addPackageFee
            ? (data.totalPrice + 0.01).toFixed(2)
            : data.totalPrice.toFixed(2),
      },
      {
        className: 'weight',
        text:
          (data.measurementUnitCanBeWeighed
            ? data.weight.toFixed(3)
            : data.weight.toString()) +
          (half ? ' ' + data.measurementUnitName : ''),
      },
      {
        className: 'kg-price',
        text: data.priceWithVat.toFixed(2) + (half ? ' €/kg' : ''),
      },
      { className: 'weight-text', text: data.measurementUnitName },
      { className: 'kg-text', text: '€/' + data.measurementUnitName },
    ]
    if (data.addPackageFee && !half) {
      elements.push({ className: 'package', text: '+ 0,01 (fas. maišelis)' })
    }
    elements.forEach(({ className, text }) => {
      label.appendChild(this.createDivWithClass(className, text))
    })

    label.appendChild(this.createDMDiv(data))

    if (data.expiryDate != null) {
      const date: string = new Date(data.expiryDate).toLocaleDateString(
        'lt-LT',
        {
          month: '2-digit',
          day: '2-digit',
        },
      )
      label.appendChild(this.createDivWithClass('expiry', date))
    }

    if (data.addManufacturer == true && data.manufacturerName != null) {
      label.appendChild(
        this.createDivWithClass('manufacturer', data.manufacturerName),
      )
    }

    return label
  }

  createDivWithClass(
    className: string,
    text: string,
    raw = false,
  ): HTMLDivElement {
    const div = document.createElement('div')
    div.className = className
    if (raw) {
      div.innerHTML = text
    } else {
      div.textContent = text
    }
    return div
  }

  createDMDiv(data: PackagedItem): HTMLDivElement {
    const barcode = document.createElement('div')
    barcode.className = 'barcode dm'
    // Prefix 2200, then 13 digits of barcode, then 4 digits of weight
    if (data.barcode == null) {
      return barcode
    }
    let barcodeString = data.barcode
    if (data.weight != null) {
      barcodeString =
        // (data.addPackageFee == true ? '1102\r\n' : '') +
        // TODO: sort out the barcode format when it is fully decided on COM or USB scanner connection
        '2200' +
        '0'.repeat(13 - data.barcode.length) +
        data.barcode +
        '0'.repeat(5 - data.weight.toFixed(3).length) +
        data.weight.toFixed(3).replace('.', '')
    }
    const svgNS = 'http://www.w3.org/2000/svg'
    const svg: SVGSVGElement = document.createElementNS(svgNS, 'svg')
    const path = document.createElementNS(svgNS, 'path')
    path.setAttribute('transform', 'scale(1)')
    svg.appendChild(path)
    path.setAttribute('d', toPath(getDataMatrixMat(barcodeString)))
    svg.setAttribute('class', 'datamatrix')
    svg.setAttribute('viewBox', '0 0 18 18')
    barcode.appendChild(svg)
    return barcode
  }

  isItInAppMode(): boolean {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches
    )
  }

  async printLabelsUsingBrowser(data: Item[]): Promise<void> {
    const labels: HTMLElement[] = data.map(item => this.generateLabel(item))

    const popup: Window | null = window.open(
      '',
      '_blank',
      this.isItInAppMode() ? 'width=250,height=300' : 'width=800,height=600',
    )
    if (popup == null) {
      alert('Please allow popups for this site')
      return
    }
    popup.document.title = `${labels.length} ${i18n('nlabelsToBePrinted')}`
    popup.document.head.appendChild(this.createStyleElement())

    labels.forEach(label => {
      popup.document.body.appendChild(label)
    })

    this.success = true

    popup.addEventListener('afterprint', () => {
      popup.close()
    })
    popup.print()
  }

  createStyleElement(): HTMLStyleElement {
    const style: HTMLStyleElement = document.createElement('style')
    style.innerHTML = `${printStyles}`
    return style
  }
}
