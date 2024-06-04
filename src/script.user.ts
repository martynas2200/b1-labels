/* eslint-disable @typescript-eslint/no-confusing-void-expression */
/* eslint-disable @typescript-eslint/unbound-method */

import { UserSession } from './userSession'
import { LabelerInterface } from './labelerInterface'
import { Request } from './request'
import { type item } from './item'
import { i18n } from './i18n'
import { LabelGenerator } from './labelGenerator'
import { FormSimplifier } from './formSimplifier'
interface row extends item {
  _select: boolean
}

declare const angular: angular.IAngularStatic
declare let history: History
declare let window: Window

class LabelsUserscript {
  private wasInterfaceButtonAdded: boolean = false
  private pageReady: boolean = false
  private readonly user: UserSession
  private readonly interface: LabelerInterface
  private currentUrl: string

  constructor () {
    this.user = new UserSession()
    this.interface = new LabelerInterface()
    this.currentUrl = window.location.pathname
    this.init()
    void this.handleUrlChange(null, this.currentUrl)
    console.log('Label Generator for the items in b1.lt is ready!')
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
    console.log('Url has changed')
    this.pageReady = false
    if (this.user.isLoggedIn && this.user.admin && !this.interface.isActive()) {
      if (!this.wasInterfaceButtonAdded && this.interface.addActivateButton()) {
        this.wasInterfaceButtonAdded = true
      }
      void new Promise(resolve => setTimeout(resolve, 200))
      let success = false
      switch (this.currentUrl) {
        case '/en/reference-book/items':
        case '/en/warehouse/purchases/edit':
        case '/reference-book/items':
        case '/warehouse/purchases/edit':
          success = this.addPrintButton()
          // if we add it, and the view has not yet, we need to double check after some time
          if (success) {
            setTimeout(() => {
              if (document.querySelector('.print') == null) {
                this.addPrintButton()
              }
            }, 1000)
          }
          break

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
      this.pageReady = this.interface.init()
    } else if (!this.user.isLoggedIn) {
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

  private getDataRows (): HTMLElement | null {
    return document.querySelector('.data-rows')
  }

  // reference-book/items
  private extractDataFromAngular (): item[] {
    // eslint-disable-next-line no-undef
    const dataRows = this.getDataRows()
    if (dataRows == null) {
      console.error('Data rows not found')
      return []
    }

    const selectedRows = angular.element(dataRows).controller().grid.data.filter((a: row) => a._select)
    return selectedRows.map((row: any) => ({
      name: row.name,
      barcode: row.barcode,
      code: row.code,
      priceWithVat: row.priceWithVat,
      measurementUnitName: row.measurementUnitName,
      departmentNumber: row.departmentNumber,
      packageCode: row.packageCode,
      isActive: row.isActive,
      discountStatus: row.discountStatus
    }))
  }

  async extractDataFromAngularPurchaseView (): Promise<item[]> {
    // eslint-disable-next-line no-undef
    const dataRows = this.getDataRows()
    if (dataRows == null) {
      console.error('Data rows not found')
      return []
    }
    const selectedRows = angular.element(dataRows).controller().data.filter((a: row) => a._select)
    const extractedData = []
    if (confirm(i18n('askingForPackageCode'))) { // Get full item data from the server
      window.alert(i18n('aboutToCheckPackageCode'))
      const barcodes = selectedRows.map((row: any) => row.itemBarcode)
      const req = new Request()
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
    // eslint-disable-next-line no-undef
    const form = document.querySelector('ng-form')
    if (form == null) {
      console.error('Form not found!')
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
        data = this.extractDataFromAngular()
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
  
  public addPrintButton (parentSelector: string = '.buttons-left', withName: boolean = false): boolean {
    const buttonsLeft = document.querySelector(parentSelector)
    if (buttonsLeft == null) {
      return false
    }
    const printDiv = document.createElement('div')
    printDiv.className = 'print'

    const button = document.createElement('button')
    button.title = i18n('print')
    button.type = 'button'
    button.className = 'btn btn-sm btn-purple'

    const i = document.createElement('i')
    i.className = 'fa fa-fw fa-print'
    button.appendChild(i)
    if (withName) {
      const span = document.createElement('span')
      span.className = 'margin-left-5'
      span.textContent = i18n('print')
      button.appendChild(span)
    } else {
      // make more space for the print button by removing the import button
      const icon = document.querySelector('i.fa-cloud-upload')
      if (icon != null) {
        const grandParent = icon.parentElement?.parentElement
        if (grandParent != null) {
          grandParent.remove()
        }
      }
    }
    printDiv.addEventListener('click', this.processItemsfromAngular.bind(this))
    printDiv.appendChild(button)
    buttonsLeft.appendChild(printDiv)
    return true
  }
}

window.addEventListener('load', () => {
  void new LabelsUserscript()
})
