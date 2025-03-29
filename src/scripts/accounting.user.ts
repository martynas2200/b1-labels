/* eslint-disable @typescript-eslint/no-confusing-void-expression */
/* eslint-disable @typescript-eslint/unbound-method */
import { ModalService } from '../services/modal'
import { Request } from '../services/request'
import adminCSS from '../styles/admin.scss'
import { UINotification } from '../services/notification'
declare const angular: angular.IAngularStatic
declare let window: Window

class AdminExtraFunctionality {
  private wereButtonsAdded: boolean = false
  private readonly notification = new UINotification()
  private currentUrl: string

  constructor () {
    this.currentUrl = window.location.pathname
    this.init()
    void this.handleUrlChange(null, this.currentUrl)
    
  }

  private init (): void {
    void this.handleUrlChange(null, this.currentUrl)
    this.addStyles()
  }
  private async handleUrlChange (previousUrl: string | null, currentUrl: string, tries: number = 0): Promise<void> {
    if (this.currentUrl != '/login' && !this.wereButtonsAdded) {
        this.wereButtonsAdded = this.addButton('Rodyti antkainius', this.listMarkup.bind(this)) && this.addButton('Peržiūrėti prekės judėjimą', this.goToItemMovement.bind(this))
        if (!this.wereButtonsAdded && tries < 5) {
          setTimeout(() => {
            void this.handleUrlChange(null, this.currentUrl, tries + 1)
          }, 600)
        }
    }
  }

  private getDataRows (): HTMLElement {
    const dataRows = document.querySelector('.data-rows') as HTMLElement
    if (dataRows == null) {
      this.notification.error("Įvyko klaida: nepavyko rasti duomenų eilučių")
      throw new Error('Data rows not found')
    }
    return dataRows
  }

  goToItemMovement (): void {
    const dataRows = this.getDataRows()
    const controller = angular.element(dataRows).controller()
    const item = (controller.data ?? controller.grid.data).filter((item: any) => item._select).pop()
    if (item == null) {
      this.notification.error('Pasirinkite prekę')
      return
    }
    if (item.id == null && item.itemId == null) {
      this.notification.error('Prekės ID nerastas')
      return
    }
    const url = new URL('/warehouse/item-movement', window.location.origin)
    url.searchParams.append('itemId', item.itemId ?? item.id)
    url.searchParams.append('itemName', item.name ?? item.itemName)
    url.searchParams.append('warehouseId', '1')
    url.searchParams.append('warehouseName', 'Pagrindinis')
    window.open(url.toString(), '_blank')
    
  }

  calculateMarkup (price: number, cost: number): number {
    return ((price - cost) / cost) * 100
  }

  //TODO: add a markup slider of the reccomended price column
  async listMarkup (): Promise<void> {
    //check if it is a purchase view
    if (window.location.pathname !== '/en/warehouse/purchases/edit' && window.location.pathname !== '/warehouse/purchases/edit') {
      this.notification.error("Įvyko klaida: ši funkcija veikia tik pirkimo sąskaitų peržiūros lange")
      return
    }
    const controller = angular.element(this.getDataRows()).controller()
    const modal  = new ModalService()
    void modal.showModal({
      template: `
      <div class="modal-header">
        <button type="button" class="close" ng-click="closeModal()">&times;</button>
        <h4 class="modal-title">Antkainių sąrašas</h4>
      </div>
      <div class="modal-body extd-grid">
        <table class="table table-bordered">
          <thead>
            <tr>
              <th>Pavadinimas</th>
              <th class="width-100-strict">Kaina be PVM</th>
              <th class="width-100-strict">Antkainis</th>
              <th class="width-130-strict">Pardavimo kaina su PVM</th>
              <th class="width-100-strict">Min. kaina 20%</th>
            </tr>
          </thead>
          <tbody>
            <tr ng-repeat="item in data">
              <td>{{ item.itemName }}</td>
              <td>{{ item.priceWithoutVatWithDiscount.toFixed(3) }}</td>
              <td ng-class="{ 'background-white-red': calculateMarkup(item.itemPriceWithVat, item.priceWithoutVatWithDiscount * (1 + (item.vatRate / 100))) < 19.5 }">{{ calculateMarkup(item.itemPriceWithVat, item.priceWithoutVatWithDiscount * (1 + (item.vatRate / 100))).toFixed(2) }}%</td>
              <td>
                <span>{{ item.itemPriceWithVat == null ? "-" : item.itemPriceWithVat }}</span>
                <button class="btn btn-xs btn-primary pull-right" style="margin-left: 10px;" ng-click="editPrice(item)">Keisti</button>
              </td>
              <td>{{ (item.priceWithoutVatWithDiscount * (1 + (item.vatRate / 100)) * 1.2).toFixed(3) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" ng-click="closeModal()">Uždaryti</button>
      </div>
      `,
      scopeProperties: {
        data: controller.data,
        calculateMarkup: this.calculateMarkup,
        editPrice: this.editPrice.bind(this)
      },
      size: 'lg',
      backdrop: 'static',
      onClose: () => {
        console.log('Modal closed')
      }
    })
  }

  addButton (text: string, callback: () => void): boolean {
    const navbarShortcuts = document.querySelector('.breadcrumbs')
    if (navbarShortcuts != null) {
      const button = document.createElement('button')
      button.textContent = text
      button.className = 'btn btn-sm'
      button.addEventListener('click', callback)
      navbarShortcuts.appendChild(button)
    }
    return navbarShortcuts != null
  }

  //TODO: refactor this function to use the Request class
  async editPrice (item: { itemPriceWithVat: number, itemId: number}): Promise<void> {
    const prompt = window.prompt('Įveskite naują kainą', item.itemPriceWithVat?.toString() ?? '')
    if (prompt == null) {
      return
    }
    const newPrice = parseFloat(prompt.replace(',', '.'))
    if (newPrice <= 0) {
      this.notification.error('Neteisinga kaina')
      return
    } else {
      item.itemPriceWithVat = newPrice
      let priceWithoutVat = newPrice / 1.21
      priceWithoutVat = Math.round((priceWithoutVat + Number.EPSILON) * 10000) / 10000

      const req = new Request(this.notification)
      const data = {
        isActive: true,
        priceWithVat: newPrice,
        priceWithoutVat: priceWithoutVat
      } 
      void req.saveItem(item.itemId.toString(), data)
    }
  }

  private addStyles (): void {
    const styles = document.createElement('style') as HTMLStyleElement
    styles.innerHTML = adminCSS
    document.head.appendChild(styles)
  }
}

window.addEventListener('load', () => {
  void new AdminExtraFunctionality()
})
