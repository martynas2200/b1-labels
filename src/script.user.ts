/* eslint-disable @typescript-eslint/no-confusing-void-expression */
/* eslint-disable @typescript-eslint/unbound-method */
import all from './styles/all.scss'
import { UserSession } from './userSession'
import { LabelerInterface } from './labelerInterface'
import { Request } from './request'
import { type item } from './item'
import { i18n } from './i18n'
import { LabelGenerator } from './labelGenerator'
import { FormSimplifier } from './formSimplifier'
import { UINotification } from './ui-notification'
interface row extends item {
  _select: boolean
}
declare const angular: angular.IAngularStatic
declare let history: History
declare let window: Window

class LabelsUserscript {
  private wereButtonsAdded: boolean = false
  private pageReady: boolean = false
  private readonly notification = new UINotification()
  private readonly user = new UserSession()
  private readonly interface = new LabelerInterface()
  private currentUrl: string

  constructor () {
    this.currentUrl = window.location.pathname
    this.init()
    void this.handleUrlChange(null, this.currentUrl)
    console.debug('LabelsUserscript initialized')
  }

  private init (): void {
    this.overrideHistoryMethods()
    this.setupPopStateListener()
    this.addStyles()
  }

  private overrideHistoryMethods (): void {
    const originalPushState = history.pushState
    history.pushState = (state, title, url) => {
      const previousUrl = this.currentUrl
      const result = originalPushState.apply(history, [state, title, url])
      this.currentUrl = window.location.pathname
      void this.handleUrlChange(previousUrl, this.currentUrl)
      return result
    }

    const originalReplaceState = history.replaceState
    history.replaceState = (state, title, url) => {
      const previousUrl = this.currentUrl
      const result = originalReplaceState.apply(history, [state, title, url])
      this.currentUrl = window.location.pathname
      void this.handleUrlChange(previousUrl, this.currentUrl)
      return result
    }
  }

  private setupPopStateListener (): void {
    window.addEventListener('popstate', () => {
      const previousUrl = this.currentUrl
      this.currentUrl = window.location.pathname
      void this.handleUrlChange(previousUrl, this.currentUrl)
    })
  }

  private async handleUrlChange (previousUrl: string | null, currentUrl: string, tries: number = 0): Promise<void> {
    console.info('Url has changed')
    this.pageReady = false
    if (this.user.isLoggedIn && this.user.admin && !this.interface.isActive()) {
      if (!this.wereButtonsAdded && this.interface.addActivateButton()) {
        this.wereButtonsAdded = true
      }
      void new Promise(resolve => setTimeout(resolve, 200))
      let success = false
      switch (this.currentUrl) {
        case '/en/reference-book/items':
        case '/en/warehouse/purchases/edit':
        case '/reference-book/items':
        case '/warehouse/purchases/edit':
          success = this.addPrintButton()
          // Check after a delay, we could have added the button to the old view
          if (success) {
            setTimeout(() => {
              if (document.querySelector('.print') == null) {
                this.addPrintButton()
              }
            }, 1000)
          }
          break
        case '/en/reference-book/items/edit':
        case '/reference-book/items/edit':
          success = this.addPrintButton('.btn-ctrl', true)
          if (success) {
            void new FormSimplifier()
          }
          break
        default:
          success = true
          break
      }
      if (success) {
        this.pageReady = true
      }
    } else if (this.user.isLoggedIn && !this.user.admin && !this.interface.isActive()) {
        switch (this.currentUrl) {
          case '/en/warehouse/light-sales/edit':
          case '/warehouse/light-sales/edit':
            this.pageReady = this.interface.simplifyPage(false) 
            break
          case '/en/reference-book/items':
          case '/en/warehouse/purchases/edit':
          case '/reference-book/items':
          case '/en/reference-book/items/edit':
          case '/reference-book/items/edit':
            this.pageReady = this.interface.simplifyPage(false) && this.addPrintButton('.buttons-left', true) && this.addFilters()
            break
          default:
            this.pageReady = this.interface.init()
            break
        }
    } else if (!this.user.isLoggedIn && this.currentUrl === '/login') {
      this.pageReady = this.user.addLoginOptions()
    } else {
      this.pageReady = true
    }

    if (!this.pageReady && tries < 5) {
      setTimeout(() => {
        void this.handleUrlChange(null, this.currentUrl, tries + 1)
      }, 600)
    }
  }

  private getDataRows (): HTMLElement {
    const dataRows = document.querySelector('.data-rows') as HTMLElement
    if (dataRows == null) {
      this.notification.error(i18n('error'))
      throw new Error('Data rows not found')
    }
    return dataRows
  }

  private extractDataFromAngularItemList (): item[] {
    const dataRows = this.getDataRows()
    return angular.element(dataRows).controller().grid.data.filter((a: row) => a._select)
  }
  async extractDataFromAngularPurchaseView (): Promise<item[]> {
    const dataRows = this.getDataRows()
    const selectedRows = angular.element(dataRows).controller().data.filter((a: row) => a._select)
    const extractedData = []
    if (confirm(i18n('askingForPackageCode'))) { // Get full item data from the server
      this.notification.primary(i18n('aboutToCheckPackageCode'))
      const barcodes = selectedRows.map((row: any) => row.itemBarcode)
      const req = new Request(this.notification)
      for (const barcode of barcodes) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const item = await req.getItem(barcode)
        if (item != null) {
          extractedData.push(item)
        }
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    } else { // Use the limited data from the view
      selectedRows.forEach((row: any) => {
        extractedData.push({
          name: row.itemName,
          barcode: row.itemBarcode,
          code: row.itemCode,
          priceWithVat: row.itemPriceWithVat,
          measurementUnitName: row.measurementUnitName,
          isActive: true
        })
      })
    }
    return extractedData
  }

  extractDataFromAngularItemView (): item[] {
    const form = document.querySelector('ng-form')
    if (form == null) {
      this.notification.error(i18n('error'))
      return []
    }
    const data = angular.element(form).controller().model
    return [data]
  }

  processItemsfromAngular (): void {
    let data: item[] | Promise<item[]> = []
    switch (window.location.pathname) {
      case '/en/reference-book/items':
      case '/reference-book/items':
        data = this.extractDataFromAngularItemList()
        break
      case '/en/warehouse/purchases/edit':
      case '/warehouse/purchases/edit':
        data = this.extractDataFromAngularPurchaseView()
        break
      case '/en/reference-book/items/edit':
      case '/reference-book/items/edit':
        data = this.extractDataFromAngularItemView()
        break
    }
    void new LabelGenerator(data)
  }
// TODO: DYI rule!
  public addPrintButton (parentSelector: string = '.buttons-left', withName: boolean = false): boolean {
    const buttonsLeft = document.querySelector(parentSelector)
    if (buttonsLeft == null) {
      return false
    }
    const icon = document.querySelector('i.fa-cloud-upload')
    if (icon != null) {
      const grandParent = icon.parentElement?.parentElement
      if (grandParent != null) {
        grandParent.remove()
      }
    }
    let printDiv = document.createElement('div')
    printDiv.className = 'print'

    let button = document.createElement('button')
    button.title = i18n('print')
    button.type = 'button'
    button.className = 'btn btn-sm btn-purple'

    let i = document.createElement('i')
    i.className = 'fa fa-fw fa-print'
    button.appendChild(i)
    if (withName) {
      let span = document.createElement('span')
      span.className = 'margin-left-5'
      span.textContent = i18n('print')
      button.appendChild(span)
    }
    button.addEventListener('click', this.processItemsfromAngular.bind(this))
    printDiv.appendChild(button)
    buttonsLeft.appendChild(printDiv)
    // Add weight label button
    button = document.createElement('button')
    button.title = i18n('weightLabel')
    button.type = 'button'
    button.className = 'btn btn-sm btn-pink'
    i = document.createElement('i')
    i.className = 'fa fa-fw fa-balance-scale'
    button.appendChild(i)
    if (withName) {
      let span = document.createElement('span')
      span.className = 'margin-left-5'
      span.textContent = i18n('weightLabel')
      button.appendChild(span)
    }
    button.addEventListener('click', this.goToWeightLabelModal.bind(this))
    printDiv = document.createElement('div')
    printDiv.appendChild(button)
    buttonsLeft.appendChild(printDiv)

    return true
  }

  goToWeightLabelModal (): void {
    const items = this.extractDataFromAngularItemList()
    if (items.length < 1) {
      this.notification.error(i18n('noItemsSelected'))
      return
    } else if (items.length > 1) {
      this.notification.error(i18n('tooManyItems'))
      return
    } else if (items[0].measurementUnitName !== 'kg' || items[0].priceWithVat < 0 || items[0].priceWithVat == null) {
      this.notification.error(i18n('error'))
      return
    }
    this.interface.init();
    this.interface.modals?.weight.openWeightModal(items[0]);
  }

  addFilters (): boolean {
    if (window.location.pathname !== '/en/reference-book/items' && window.location.pathname !== '/reference-book/items') {
      return false
    }
    const dataRows = document.querySelector('.data-rows') as HTMLElement
    if (dataRows == null) {
      return false
    }
    const controller = angular.element(dataRows).controller().grid
    controller.filter.asString = "[Aktyvi?:true] "
    controller.filter.filters.rules['isActive'] = { data: true, field: 'isActive', op: 'eq' }
    controller.filter.sort = { "id": "desc" }
    setTimeout(() => {
      controller.provider.refresh()
      this.notification.info({
        message: i18n('show') +': ' + controller.filter.asString,
        positionY: 'bottom'
      });
    }, 700);
    return true
  }

  private addStyles (): void {
    const styles = document.createElement('style') as HTMLStyleElement
    styles.innerHTML = `${all}`
    document.head.appendChild(styles)
  }
}

window.addEventListener('load', () => {
  void new LabelsUserscript()
  // Stop Clarity analytics
  setTimeout(() => {
    if ((window as any).clarity != null) {
      (window as any).clarity('stop')
    }
  }, 500)
})
