import { i18n } from './i18n'
import { type item } from './item'
import { labelStyles } from './styles'

export class LabelGenerator {
  private items: item[] = []
  private readonly allItemsActive: boolean = true
  private readonly alternativeLabelFormat: boolean

  constructor (data: any | Promise<any> | undefined = undefined, alternativeLabelFormat: boolean = false) {
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

  private generateLabel (data: item): HTMLDivElement {
    const label = document.createElement('div')
    label.className = 'label'
    if (this.alternativeLabelFormat) {
      label.classList.add('alternative')
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
    if (data.priceWithVat !== 0) {
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

    if (data.isActive === false) {
      const inactive = document.createElement('div')
      inactive.className = 'inactive'
      label.appendChild(inactive)
    }

    label.appendChild(item)

    return label
  }

  private async printLabelsUsingBrowser (data: item[]): Promise<void> {
    const labels: HTMLElement[] = data.map(item => this.generateLabel(item))

    const popup: Window | null = window.open('', '_blank', 'width=700,height=700')
    if (popup == null) {
      alert('Please allow popups for this site')
      return
    }
    popup.document.title = `${labels.length} ${i18n('nlabelsToBePrinted')}`

    const style: HTMLStyleElement = document.createElement('style')
    style.innerHTML = labelStyles
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

    popup.print()
    popup.addEventListener('afterprint', () => {
      popup.close()
    })
  }
}
