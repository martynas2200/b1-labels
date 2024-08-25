
import { i18n } from './i18n'
import { Request } from './request'

export class MarkdownModal {
  modal = document.getElementById('markdownModal') as HTMLDivElement
  modalTitle = this.modal.querySelector('.modal-title') as HTMLHeadingElement
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
    const span = document.createElement('span')
    span.textContent = date
    span.className = 'text-info margin-left-10'
    this.modalTitle.appendChild(span)
    this.loadButton.style.visibility = 'visible'
    const items = await this.request.getSaleItems(id)
    if (items == null) {
      this.table.innerHTML = 'No data found'
    } else {
      this.table.innerHTML = ''
    }
    const headerHead = this.table.createTHead()
    const headerRow = headerHead.insertRow()
    const idHeader = headerRow.insertCell()
    idHeader.textContent = 'ID'
    const nameHeader = headerRow.insertCell()
    nameHeader.textContent = i18n('name')
    const quantityHeader = headerRow.insertCell()
    quantityHeader.textContent = i18n('quantity')
    const total = headerRow.insertCell()
    total.textContent = i18n('total')
    const priceHeader = headerRow.insertCell()
    priceHeader.textContent = i18n('discount')
    const discountRateHeader = headerRow.insertCell()
    discountRateHeader.textContent = i18n('discountRate')
    this.table.createTBody()
    items.data.forEach((item: any) => {
      if (item.discount != 0) {
        const row = this.table.tBodies[0].insertRow()
        const idCell = row.insertCell()
        idCell.textContent = item.itemId
        const nameCell = row.insertCell()
        nameCell.textContent = item.virtualName
        const quantityCell = row.insertCell()
        quantityCell.textContent = item.quantity + ' ' + item.virtualUnit.measurementUnitName
        const totalCell = row.insertCell()
        const totalSum = item.sumWithoutVat + item.vat
        totalCell.textContent = totalSum.toFixed(2) 
        const priceCell = row.insertCell()
        priceCell.textContent = item.discount
        const discountRateCell = row.insertCell()
        discountRateCell.textContent = item.discountRate + '%'
      }
    })
  }

  public async load(): Promise<void> {
    const items = await this.request.getSales('nur')
    if (items == null) {
      this.table.innerHTML = 'No data found'
    }
    this.loadButton.style.visibility = 'hidden'
    this.render(items)
  }
  private render (sales: any): void {
    this.modalTitle.textContent = i18n('markdowns')
    this.table.innerHTML = ''
    const header = this.table.createTHead()
    const headerRow = header.insertRow()
    const dateHeader = headerRow.insertCell()
    dateHeader.textContent = i18n('number')
    const clientHeader = headerRow.insertCell()
    clientHeader.textContent = i18n('date')
    const totalHeader = headerRow.insertCell()
    totalHeader.textContent = i18n('discount')
    const emptyHeader = headerRow.insertCell()
    emptyHeader.textContent = ''
    const body = this.table.createTBody()
    sales.data.forEach((sale: any) => {
      const row = body.insertRow()
      const dateCell = row.insertCell()
      dateCell.textContent = sale.series + ' ' + sale.number
      const clientCell = row.insertCell()
      clientCell.textContent = sale.saleDate
      const totalCell = row.insertCell()
      totalCell.textContent = sale.discount;
      const buttonCell = row.insertCell()
      const showRow = document.createElement('button')
      showRow.textContent = i18n('show')
      showRow.className = 'btn btn-block btn-white btn-xs'
      buttonCell.appendChild(showRow)
      buttonCell.addEventListener('click', () => { 
        this.showSaleItems(sale.id, sale.saleDate) 
      })
    })
  }
  
}