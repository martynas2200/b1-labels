/* eslint-disable @typescript-eslint/no-confusing-void-expression */
/* eslint-disable @typescript-eslint/unbound-method */
import { ModalService } from '../services/modal'
import { Request } from '../services/request'
import adminCSS from '../styles/admin.scss'
import { UINotification } from '../services/notification'
declare const angular: angular.IAngularStatic
declare let window: Window
declare const Chart: any

class AdminExtraFunctionality {
  private wereButtonsAdded: boolean = false
  private readonly notification = new UINotification()
  private currentUrl: string

  constructor() {
    this.currentUrl = window.location.pathname
    this.init()
    void this.handleUrlChange(null, this.currentUrl)

  }

  private init(): void {
    void this.handleUrlChange(null, this.currentUrl)
    this.addStyles()
  }
  
  private async handleUrlChange(previousUrl: string | null, currentUrl: string, tries: number = 0): Promise<void> {
    if (this.currentUrl != '/login' && !this.wereButtonsAdded) {
      this.wereButtonsAdded = this.addButton('Rodyti antkainius', this.listMarkup.bind(this)) && this.addButton('Peržiūrėti prekės judėjimą', this.goToItemMovement.bind(this))
      // if url contains sales, then we add this button
      if (currentUrl.includes('/warehouse/sales')) {
        this.addButton('Trinti pardavimus', this.deleteSales.bind(this))
      }
      if (!this.wereButtonsAdded && tries < 5) {
        setTimeout(() => {
          void this.handleUrlChange(null, this.currentUrl, tries + 1)
        }, 600)
      }
    }
    //if the url item movement, then we want to call addInsightsBlock
    if (currentUrl === '/warehouse/item-movement') {
      this.addInsightsBlock()
    }
  }

  private getDataRows(notifyOnFail = true): HTMLElement {
    const dataRows = document.querySelector('.data-rows') as HTMLElement
    if (dataRows == null) {
      if (notifyOnFail) {
        this.notification.error("Įvyko klaida: nepavyko rasti duomenų eilučių")
      }
      throw new Error('Data rows not found')
    }
    return dataRows
  }

  goToItemMovement(): void {
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

  calculateMarkup(price: number, cost: number): number {
    return ((price - cost) / cost) * 100
  }

  //TODO: add a markup slider of the reccomended price column
  async listMarkup(): Promise<void> {
    //check if it is a purchase view
    if (window.location.pathname !== '/en/warehouse/purchases/edit' && window.location.pathname !== '/warehouse/purchases/edit') {
      this.notification.error("Įvyko klaida: ši funkcija veikia tik pirkimo sąskaitų peržiūros lange")
      return
    }
    const controller = angular.element(this.getDataRows()).controller()
    const modal = new ModalService()
    void modal.showModal({
      template: `
      <div class="modal-header">
        <button type="button" class="close" ng-click="closeModal()">&times</button>
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
      backdrop: 'static'
    })
  }

  addButton(text: string, callback: () => void): boolean {
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
  async editPrice(item: { itemPriceWithVat: number, itemId: number }): Promise<void> {
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

  async deleteSales() {
    const itemBarcode = window.prompt('Įveskite prekės barkodą, kurio pardavimo prekes norite ištrinti', '')
    if (itemBarcode == null || itemBarcode.trim() === '') {
      this.notification.error('Neteisingas prekės kodas')
      return
    }
    // check if it is a sales view

    if (window.location.pathname !== '/en/warehouse/sales' && window.location.pathname !== '/warehouse/sales') {
      this.notification.error("Įvyko klaida: ši funkcija veikia tik pardavimų sąrašo peržiūros lange")
      return
    }
    // get ids of the sales
    const salesIds = angular.element(this.getDataRows()).controller().data.filter(a => a._select).map(a => a.id)

    // first search for the sale items

    const req = new Request(this.notification)
    if (salesIds.length === 0) {
      this.notification.error('Pasirinkite pardavimus')
      return
    }
    for (const saleId of salesIds) {
      const saleItems = await req.fetchData('POST', '/warehouse/sale-items/search', {
        filters: {
          rules: {
            itemBarcode: { field: 'itemBarcode', op: 'cn', data: itemBarcode },
            saleId: { field: 'saleId', op: 'eq', data: saleId }
          }
        },
        page: 1,
        pageSize: 100,
        sort: { position: 'asc' },
        asString: `[Pardavimas:${saleId}]`
      })
      if (saleItems.records === 0) {
        this.notification.error(`Nepavyko rasti pardavimo prekių su ID ${saleId} ir prekės kodu ${itemBarcode}`)
        continue
      }
      // delete each sale item
      const response = await req.fetchData('POST', '/warehouse/sale-items/delete', { ids: saleItems.data.map((saleItem: { id: number }) => saleItem.id) })
      if (response.success === false) {
        this.notification.error(`Nepavyko ištrinti pardavimo prekių su ID ${saleItems.data.map((saleItem: { id: number }) => saleItem.id).join(', ')}`)
        continue
      }
      // notify success
      saleItems.data.forEach((saleItem: { id: number }) => {
        this.notification.success(`Pardavimo prekė su ID ${saleItem.id} ištrinta sėkmingai`)
      })
    }

  }
  private addStyles(): void {
    const styles = document.createElement('style') as HTMLStyleElement
    styles.innerHTML = adminCSS
    document.head.appendChild(styles)
  }

  private inferDeliveryDays(purchaseEvents: { purchase_date: string | number | Date }[]): string[] {
    const twoMonthsAgo = new Date()
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)

    const recentPurchases = purchaseEvents.filter((entry: { purchase_date: string | number | Date }) =>
      entry.purchase_date && new Date(entry.purchase_date) >= twoMonthsAgo
    )
    // 2. Count purchases by weekday
    const weekdayCounts: { [weekday: string]: number } = {}
    recentPurchases.forEach((p: { purchase_date: string | number | Date }) => {
      const weekday = new Date(p.purchase_date).toLocaleDateString('en-US', { weekday: 'long' })
      weekdayCounts[weekday] = (weekdayCounts[weekday] || 0) + 1
    })

    return Object.entries(weekdayCounts)
      .sort((a, b) => b[1] - a[1]) // sort by frequency descending
      .map(([weekday]) => weekday) // unpack to just weekdays
      .slice(0, 3) // take top 3 weekdays
  }

  private getDayDifference(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }
  // private orderSuggestion(): void {
  //   if (window.location.pathname == '/en/warehouse/item-movement' || window.location.pathname == '/warehouse/item-movement') {
  //     this.addInsightsBlock()
  //   } else if (window.location.pathname == '/en/reference-book/items' || window.location.pathname == '/reference-book/items') {
  //     this.createOrderPDF()
  //   } else {
  //     this.notification.error("Įvyko klaida: ši funkcija veikia tik prekės judėjimo arba prekių sąrašo peržiūros lange")
  //     return
  //   }
  // }
  private addInsightsBlock(retry: number = 0): void {
    if (window.location.pathname !== '/en/warehouse/item-movement' && window.location.pathname !== '/warehouse/item-movement') {
      this.notification.error("Įvyko klaida: ši funkcija veikia tik prekės judėjimo peržiūros lange")
      return
    }
    let dataRows: HTMLElement
    try {
       dataRows = this.getDataRows(retry > 3)
    } catch (error) {
      console.error('Error getting data rows:', error)
      if (retry < 3) {
        setTimeout(() => {
          this.addInsightsBlock(++retry)
        }, 500)
      }
      return
    }
    const controller = angular.element(dataRows).controller()
    if (controller.grid.data == null || controller.grid.data.length < 2) {
      // add button to the UI
      this.addButton("Pirkimo įžvalgos", () => this.addInsightsBlock())
      this.notification.error('Nepakanka duomenų')
      return
    }
      // controller.grid.data
      const renameMap = {
        pirk_data: "purchase_date",
        // pirk_dok: "purchase_doc",
        pirk_kiekis: "purchase_qty",
        savikaina: "cost_price",
        pard_data: "sale_date",
        pard_dok: "sale_doc",
        pard_kiekis: "sale_qty",
        pard_kaina: "sale_price",
        likutis: "balance",
        kainu_skirtumas: "price_difference"
      }
      const data = controller.grid.data.map((obj: Record<string, unknown>) => {
        const newObj: Record<string, unknown> = {}
        for (const key in obj) {
          if ((Object.prototype.hasOwnProperty.call(renameMap, key))) {
            newObj[(renameMap as Record<string, string>)[key]] = obj[key]
          }
        }
        return newObj
      })
      if (data.length === 0) {
        this.notification.error('Nepavyko rasti prekės judėjimo duomenų')
        return
      }

      const saleEvents = data.filter(d => d.sale_date)
      const purchaseEvents = data.filter(d => d.purchase_date)
      const dateMap = new Map()
      let currentBalance = 0

      for (const entry of data) {
        const date = entry.sale_date || entry.purchase_date
        if (!date) {
          continue
        }

        const key = date.slice(0, 10)
        if (!dateMap.has(key)) {
          dateMap.set(key, { sales: 0, purchases: 0, balance: null })
        }

        const record = dateMap.get(key)
        if (entry.sale_date) {
          record.sales += parseFloat(entry.sale_qty)
          record.balance = parseFloat(entry.balance)
        }
        if (entry.purchase_date) {
          record.purchases += parseFloat(entry.purchase_qty)
          // After a purchase, update balance
          if (record.balance === null) { 
            record.balance = currentBalance + parseFloat(entry.purchase_qty) 
          }
        }
        if (record.balance !== null) {
          currentBalance = record.balance
        }
      }

      const labels = Array.from(dateMap.keys())
      const salesData = labels.map(k => dateMap.get(k).sales)
      const purchaseData = labels.map(k => dateMap.get(k).purchases)
      const balanceData = labels.map(k => dateMap.get(k).balance)

      // Weekly sales estimate
      const firstSaleDate = new Date(saleEvents[0].sale_date)
      const lastSaleDate = new Date(saleEvents[saleEvents.length - 1].sale_date)
      const totalWeeks = Math.max(1, Math.round((lastSaleDate.getTime() - firstSaleDate.getTime()) / (1000 * 60 * 60 * 24 * 7)))

      const totalExpired = saleEvents.reduce((sum, s) => {
        const priceDifference = parseFloat(s.price_difference)
        return priceDifference <= 0 ? sum + parseFloat(s.sale_qty) : sum
      }, 0)
      const totalSold = saleEvents.reduce((sum, s) => {
        const priceDifference = parseFloat(s.price_difference)
        return priceDifference > 0 ? sum + parseFloat(s.sale_qty) : sum
      }, 0)
      const avgWeeklySales: number = totalSold / totalWeeks
      const partOfExpired = (totalExpired / (totalSold + totalExpired)) * 100
      // Demand estimation + Order suggestion
      const deliveryDays = this.inferDeliveryDays(purchaseEvents)
      if (deliveryDays.length === 0) {
        this.notification.error('Nepavyko nustatyti pristatymo dienų')
        return
      }
      // Calculate next delivery day
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Normalize to midnight
      const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

      const upcomingDeliveryDays = deliveryDays.map(day => {
        const dayIndex = weekdays.indexOf(day)
        const daysUntilNext = (dayIndex - today.getDay() + 7) % 7
        return new Date(today.getFullYear(), today.getMonth(), today.getDate() + daysUntilNext)
      }).sort((a, b) => a.getTime() - b.getTime())

      const nextDelivery = upcomingDeliveryDays[0]
      const nextDeliveryDate: string = nextDelivery.toLocaleDateString('lt-LT', {
        month: 'long',
        day: 'numeric'
      })
      // see the following delivery day
      const followingDeliveryDay = upcomingDeliveryDays[1] || new Date(nextDelivery.getFullYear(), nextDelivery.getMonth(), nextDelivery.getDate() + 7)
      const followingDeliveryDate = followingDeliveryDay.toLocaleDateString('lt-LT', {
        month: 'long',
        day: 'numeric'
      })

      const demandBeforeNextDelivery = (avgWeeklySales / 7) * this.getDayDifference(today, nextDelivery)
      const demandUntilFollowingDelivery = (avgWeeklySales / 7) * this.getDayDifference(today, followingDeliveryDay)
      const estimatedOrder = Math.max(0, Math.ceil(demandBeforeNextDelivery + demandUntilFollowingDelivery - currentBalance))

      // COUNT DAYS WHEN THE SHELF WAS EMPTY
      const emptyDays = data.filter(d => d.balance === 0 && d.sale_date).map(d => new Date(d.sale_date))
      const emptyDaysCount = emptyDays.length
      if (emptyDaysCount > 0) {
        const firstEmptyDay = emptyDays[0].toLocaleDateString('lt-LT', {
          month: 'long',
          day: 'numeric'
        })
        const lastEmptyDay = emptyDays[emptyDays.length - 1].toLocaleDateString('lt-LT', {
          month: 'long',
          day: 'numeric'
        })
        this.notification.info(`Prekė buvo išparduota nuo ${firstEmptyDay} iki ${lastEmptyDay}. Iš viso: ${emptyDaysCount} dienų.`)
      } else {
        this.notification.info('Prekė niekada nebuvo išparduota')
      }

      // Check if the container already exists
      const existingContainer = document.querySelector('.card')
      if (existingContainer) {
        existingContainer.remove()
      }

      // Inject it
      const container = document.createElement("div")
      container.style.maxWidth = "800px"
      container.style.margin = "40px auto"
      container.innerHTML = `
      <div class="card" style="display: flex; flex-wrap: wrap;">
      <div class="card-body" style="flex: 1 1 350px; min-width: 350px;">
        <div style="margin-bottom: 16px;">
        <p><strong>Šiuo metu likutis:</strong> ${currentBalance.toFixed(2)}</p>
        <p><strong>Rekomenduojamas užsakymo kiekis:</strong> ${estimatedOrder}</p>
        </div>
        <hr>
        <p><strong>Vidutiniai savaitiniai pardavimai:</strong> ${avgWeeklySales.toFixed(2)}</p>
        <p><strong>Vidutis dienos pardavimas:</strong> ${(avgWeeklySales / 7).toFixed(2)}</p>
        <p><strong>Dalies pasibaigusių prekių:</strong> ${partOfExpired.toFixed(2)}%</p>
        <p><strong>Numatomas poreikis (iki ${nextDeliveryDate}):</strong> ${demandBeforeNextDelivery.toFixed(2)}</p>
        <p><strong>Numatomas poreikis (iki ${followingDeliveryDate}):</strong> ${demandUntilFollowingDelivery.toFixed(2)}</p>
        <p><strong>Pristatymo dienos:</strong> ${deliveryDays.join(', ')}</p>
      </div>
      <div style="flex: 1 1 350px; min-width: 350px; display: flex; align-items: center; justify-content: center;">
        <canvas id="stockChart" style="max-width: 100%; height: 320px;"></canvas>
      </div>
      </div>
    `
      //prepend to the ng-view 
      const ngView = document.querySelector('div[ng-view]')
      if (ngView == null) {
        this.notification.error('Nepavyko rasti ng-view elemento')
        return
      }
      ngView.insertAdjacentElement('beforebegin', container)
      const ctx = document.getElementById("stockChart") as HTMLCanvasElement
      if (ctx == null) {
        this.notification.error('Nepavyko rasti canvas elemento')
        return
      }
      new Chart(ctx.getContext("2d"), {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Pardavimai",
              data: salesData,
              borderColor: "rgba(255, 99, 132, 1)",
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              tension: 0.3
            },
            {
              label: "Pirkimai",
              data: purchaseData.map((value) => value > 0 ? value : null),
              borderColor: "rgba(54, 162, 235, 1)",
              backgroundColor: "rgba(54, 162, 235, 0.8)",
              type: 'bar',
              spanGaps: false
            },
            {
              label: "Likutis",
              data: balanceData,
              borderColor: "rgba(122, 170, 170, 1)",
              backgroundColor: "rgba(97, 139, 139, 0.2)",
              tension: 0.3,
              yAxisID: "y"
            }
          ]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      })
    }
  }

window.addEventListener('load', () => {
  void new AdminExtraFunctionality()
})
