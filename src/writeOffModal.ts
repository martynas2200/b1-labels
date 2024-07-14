
import { i18n } from './i18n'
import { Request } from './request'

export class WriteOffModal {
  newButton = document.getElementById('newWriteOffButton') as HTMLButtonElement
  loadButton = document.getElementById('loadWriteOffs') as HTMLButtonElement
  table = document.getElementById('writeOffTable') as HTMLTableElement
  private request: Request
  constructor (r: Request) {
    this.request = r
    this.bindEvents()
  }
  private bindEvents (): void {
    this.newButton.addEventListener('click', () => this.navigateTo())
    this.loadButton.addEventListener('click', this.load.bind(this))
  }
  private navigateTo(id: string = ''): void {
    window.location.href = '/warehouse/light-sales/edit' + (id != null ? `?id=${id}` : '' )
  }

  private async load(): Promise<void> {
    // this.request.getSales('EKA')
    const items = await this.request.getSales('NUR')
    if (items == null) {
      this.table.innerHTML = 'No data found'
    }
    this.render(items)
  }
  private render (writeOffs: any): void {
    this.table.innerHTML = ''
    const resultCell = this.table.insertRow().insertCell()
    resultCell.colSpan = 3
    resultCell.textContent = writeOffs.records + i18n('itemsFound')
    writeOffs.data.forEach((writeOff: any) => {
      const row = this.table.insertRow()
      const dateCell = row.insertCell()
      dateCell.textContent = writeOff.series + writeOff.number
      const clientCell = row.insertCell()
      clientCell.textContent = writeOff.clientName
      const totalCell = row.insertCell()
      totalCell.textContent = writeOff.sumWithVat
      row.addEventListener('click', () => { this.navigateTo(writeOff.id) })
    })
  }
  
}