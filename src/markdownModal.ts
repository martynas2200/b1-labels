
import { i18n } from './i18n'
import { Request } from './request'

export class MarkdownModal {
  loadButton = document.getElementById('loadMarkdowns') as HTMLButtonElement
  table = document.getElementById('markdownTable') as HTMLTableElement
  private request: Request
  constructor (r: Request) {
    this.request = r
    this.bindEvents()
  }
  private bindEvents (): void {
    this.loadButton.addEventListener('click', this.load.bind(this))
  }
  private async showSaleItems(id: string, date: string): Promise<void> {
    const items = await this.request.getSaleItems(id)
    if (items == null) {
      this.table.innerHTML = 'No data found'
    } else {
      this.table.innerHTML = ''
    }
    const resultCell = this.table.insertRow().insertCell()
    resultCell.colSpan = 4
    resultCell.textContent = date
    // add header
    const header = this.table.insertRow()
    const nameHeader = header.insertCell()
    nameHeader.textContent = i18n('name')
    const quantityHeader = header.insertCell()
    quantityHeader.textContent = i18n('quantity')
    const priceHeader = header.insertCell()
    priceHeader.textContent = i18n('discount')
    const discountRateHeader = header.insertCell()
    discountRateHeader.textContent = i18n('discountRate')
    items.data.forEach((item: any) => {
      if (item.discount != 0) {
        const row = this.table.insertRow()
        const nameCell = row.insertCell()
        nameCell.textContent = item.virtualName + ' (ID: ' + item.itemId + ')'
        const quantityCell = row.insertCell()
        quantityCell.textContent = item.quantity
        const priceCell = row.insertCell()
        priceCell.textContent = item.discount
        const discountRateCell = row.insertCell()
        discountRateCell.textContent = item.discountRate + '%'
      }
    })
  }

  private async load(): Promise<void> {
    const items = await this.request.getSales('nur')
    if (items == null) {
      this.table.innerHTML = 'No data found'
    }
    this.render(items)
  }
  private render (sales: any): void {
    this.table.innerHTML = ''
    sales.data.forEach((sale: any) => {
      const row = this.table.insertRow()
      const dateCell = row.insertCell()
      dateCell.textContent = sale.series + sale.number
      const clientCell = row.insertCell()
      clientCell.textContent = sale.saleDate
      const totalCell = row.insertCell()
      totalCell.textContent = sale.discount;
      row.addEventListener('click', () => { this.showSaleItems(sale.id, sale.saleDate) })
    })
  }
  
}