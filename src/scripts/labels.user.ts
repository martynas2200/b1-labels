
import { type Item } from '../types/item'
import { i18n } from '../services/i18n'
import { LabelGenerator } from '../labelGenerator'
import { UINotification } from '../services/notification'
import { WeightLabelModal } from '../modals/weightLabelModal'
import { ModalService } from '../services/modal'
interface row extends Item {
  _select: boolean
}
declare const angular: angular.IAngularStatic
declare let history: History
declare let window: Window

class AdminPrintUserscript {
  private pageReady: boolean = false
  private readonly notification = new UINotification()
  private readonly modal = new ModalService()
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
    this.pageReady = false
      void new Promise(resolve => setTimeout(resolve, 200))
      let success = false
      switch (this.currentUrl) {
        case '/en/reference-book/items':
        case '/en/warehouse/purchases/edit':
        case '/reference-book/items':
        case '/warehouse/purchases/edit':
          success = await this.addPrintButton()
          // Check after a delay, we could have added the button to the old view
          if (success) {
            setTimeout(() => {
              if (document.querySelector('.print') == null) {
                void this.addPrintButton()
              }
            }, 1000)
          }
          break
        case '/en/reference-book/items/edit':
        case '/reference-book/items/edit':
          success = await this.addPrintButton('.btn-ctrl', true)
          break
        default:
          success = true
          break
      }
      if (success) {
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

  private extractDataFromAngularItemList (): Item[] {
    const dataRows = this.getDataRows()
    return angular.element(dataRows).controller().grid.data.filter((a: row) => a._select)
  }
  async extractDataFromAngularPurchaseView (): Promise<Item[]> {
    const dataRows = this.getDataRows()
    const selectedRows = angular.element(dataRows).controller().data.filter((a: row) => a._select)
    const items: Partial<Item>[] = []
      selectedRows.forEach((row: {
        itemName: string
        itemBarcode: string
        itemCode: string
        itemId: string
        itemPriceWithVat: number
        itemPriceWithoutVat: number
        measurementUnitName: string
      }) => {
        items.push({
          name: row.itemName,
          barcode: row.itemBarcode,
          code: row.itemCode,
          id: row.itemId,
          priceWithVat: row.itemPriceWithVat,
          priceWithoutVat: row.itemPriceWithoutVat,
          measurementUnitName: row.measurementUnitName,
          isActive: true
        })
      })
    return items
  }

  extractDataFromAngularItemView (): Item[] {
    const form = document.querySelector('ng-form')
    if (form == null) {
      this.notification.error(i18n('error'))
      return []
    }
    const data = angular.element(form).controller().model
    return [data]
  }

 async getViewItems (): Promise<Item[]> {
    let items: Item[] = []
    switch (window.location.pathname) {
      case '/en/reference-book/items':
      case '/reference-book/items':
        items = this.extractDataFromAngularItemList()
        break
      case '/en/warehouse/purchases/edit':
      case '/warehouse/purchases/edit':
        items = await this.extractDataFromAngularPurchaseView()
        break
      case '/en/reference-book/items/edit':
      case '/reference-book/items/edit':
        items = this.extractDataFromAngularItemView()
        break
    }
    return items
  }

  public async addPrintButton (parentSelector: string = '.buttons-left', withName: boolean = false): Promise<boolean> {
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
      const span = document.createElement('span')
      span.className = 'margin-left-5'
      span.textContent = i18n('print')
      button.appendChild(span)
    }
    button.addEventListener('click', () => {
      void this.printLabels()
    })
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
      const span = document.createElement('span')
      span.className = 'margin-left-5'
      span.textContent = i18n('weightLabel')
      button.appendChild(span)
    }
    button.addEventListener('click', () => { void this.goToWeightLabelModal() })
    printDiv = document.createElement('div')
    printDiv.appendChild(button)
    buttonsLeft.appendChild(printDiv)

    return true
  }

  async goToWeightLabelModal (): Promise<void> {
    const items = await this.getViewItems()
    if (items.length < 1) {
      this.notification.error(i18n('noItemsSelected'))
      return
    }
    if (items.length > 1) {
      this.notification.error(i18n('onlyOneItem'))
      return
    }
    const item = items[0]
    const modal = new WeightLabelModal(this.modal, this.notification)
    void modal.show(item)
  }

  async printLabels (): Promise<void> {
    const items = await this.getViewItems()
    if (items.length < 1) {
      this.notification.error(i18n('noItemsSelected'))
      return
    }
    void new LabelGenerator(items)
  }
}

window.addEventListener('load', () => {
  void new AdminPrintUserscript()
})
