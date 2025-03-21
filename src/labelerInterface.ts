import { i18n, lettersToNumbers } from './i18n'
import { LabelGenerator, labelType } from './labelGenerator'
import { type item, type packagedItem } from './item'
import { UINotification } from './ui-notification'
import mainHTML from './html/main.html'
import { TextToVoice } from './textToVoice'
import { MarkdownModal } from './markdownModal'
import { WeightLabelModal } from './weightLabelModal'
import { Request } from './request'
import { ModalService } from './modal'
import { LabelTypeModal } from './labelTypeModal'

declare let angular: any

export class LabelerInterface {
  private notification = new UINotification()
  private readonly req: Request = new Request(this.notification)
  private textToVoice = new TextToVoice(this.notification)
  private modalService = new ModalService()
  private items: packagedItem[] = []
  private active: boolean = false
  settings: {
    type: labelType,
    sayOutLoud: boolean,
    showStock: boolean
  } = {
    type: 'normal',
    sayOutLoud: true,
    showStock: false
  }
  modals: {
    type: LabelTypeModal
    weight: WeightLabelModal
    markdown: MarkdownModal
  } | undefined

  loadingIndicator: HTMLElement | null = null
  mainInput: HTMLInputElement | null = null
  itemList: HTMLElement | null = null

  constructor() {
    this.modals = {
      type: new LabelTypeModal(this),
      weight: new WeightLabelModal(this.notification, this),
      markdown: new MarkdownModal(this.req)
    }
  }

  public isActive(): boolean {
    this.active = (document.querySelector('.look-up-container') !== null)
    return this.active
  }

  public init(): boolean {
    if (this.isActive()) {return true}
    const mainPage = document.querySelector('.main-container')
    const navbarShortcuts = document.querySelector('.navbar-shortcuts')
    const footer = document.querySelector('.footer')
    if ((navbarShortcuts == null) || (footer == null) || (mainPage == null)) {
      return false
    }
    this.injectHtml(mainPage)
    this.removeElements(footer, mainPage)
    this.simplifyPage()
    this.cacheElements()
    this.bindEvents()
    return true
  }

  public simplifyPage(navAll: boolean = true): boolean {
    this.hideDropdownMenuItems()
    this.changeDocumentTitle()
    this.addNavItems(navAll)
    document.body.classList.add('labeler-interface')
    return true
  }

  hideDropdownMenuItems(): void {
    document.querySelectorAll('.dropdown-menu li').forEach((li, index) => {
      if (index < 9) {(li as HTMLElement).style.display = 'none'}
    })
  }

  removeElements(...elements: Element[]): void {
    elements.forEach((el => { el.remove() }))
  }

  injectHtml(mainPage: Element): void {
    mainPage.insertAdjacentHTML('beforebegin', mainHTML(i18n))
  }

  createNavItem(text: string, onClick: () => void, icon: string): HTMLElement {
    const li = document.createElement('li')
    const a = document.createElement('a')
    a.className = 'navbar-shortcut'
    a.href = '#'
    a.addEventListener('click', onClick)
    const i = document.createElement('i')
    i.className = 'fa fa-fw ' + icon
    a.appendChild(i)
    a.appendChild(document.createTextNode(text))
    li.appendChild(a)
    return li
  }

  addNavItems(navAll: boolean = true): void {
    const parentElement = document.querySelector('.navbar-shortcuts')
    const isNavInitialized = parentElement != null && parentElement.querySelector('.fa-upload') != null
    if (parentElement == null) {
      return
    }
    parentElement.innerHTML = ''
    const ul = document.createElement('ul')
    parentElement.appendChild(ul)
    if (navAll) {
      const markdown = this.createNavItem(i18n('markdowns'), () => {
        this.modals?.markdown.open()
      }, 'fa-book')
      markdown.setAttribute('data-toggle', 'modal')
      markdown.setAttribute('data-target', '#markdownModal')
      ul.appendChild(markdown)
      const itemsList = this.createNavItem(i18n('itemCatalog'), () => { void this.showReferenceBookItemsModal() }, 'fa-folder-open')
      ul.appendChild(itemsList)
    } else {
      const back = this.createNavItem(i18n('labelsAndPrices'), () => { window.location.href = '/' }, 'fa-arrow-left')
      ul.appendChild(back)
    }
    const fileManager = this.createNavItem(i18n('files'), () => { void this.showTempFileListModal() }, 'fa-files-o')
    ul.appendChild(fileManager)
    const logoutButtons = document.querySelectorAll('.nav-user-dropdown__title')
    if (logoutButtons != null && !isNavInitialized) {
      logoutButtons.forEach(button => {
        const i = document.createElement('i')
        i.className = 'fa fa-fw fa-power-off'
        button.appendChild(i)
        const company = button.querySelector('.nav-user-company') as HTMLDivElement
        company.style.display = 'none'
      })
    }
  }
  async showReferenceBookItemsModal() {
    await this.modalService.showModal({
      template: `
        <div class="modal-body">
          <div ng-controller="ReferenceBookItems as c" class="row">
            <div class="col-xs-12">
              <div class="margin-bottom-5 row sticky row-no-gutters">
                <button ng-show="!c.grid.config.isLoading" 
                        ng-disabled="selected(c.grid) == 0" 
                        type="button" 
                        class="btn btn-sm btn-purple" 
                        ng-click="print(c.grid.provider.getSelected())">
                  <i class="fa fa-fw fa-print"></i> ${i18n('print')}
                </button>
                <button ng-show="!c.grid.config.isLoading" 
                        ng-disabled="!isWeighted(c.grid)" 
                        type="button" 
                        class="btn btn-sm btn-pink" 
                        ng-click="weightLabel(c.grid.provider.getSelected())">
                  <i class="fa fa-fw fa-balance-scale"></i> ${i18n('weightLabel')}
                </button>
                <button ng-show="!c.grid.config.isLoading" 
                        ng-disabled="selected(c.grid) == 0" 
                        type="button" 
                        class="btn btn-sm btn-primary" 
                        ng-click="proccessItem(c.grid.provider.getSelected())">
                  <i class="fa fa-fw fa-plus"></i> ${i18n('add')}
                </button>
                <button ng-show="!c.grid.config.isLoading" 
                        type="button" 
                        class="btn btn-sm btn-white" 
                        ng-click="openTypeModal()">
                   <i class="fa fa-caret-down"></i> ${i18n('type')}
                </button>
                <button class="btn btn-sm pull-right" ng-click="closeModal()">
                  <i class="fa fa-fw fa-times"></i> ${i18n('close')}
                </button>
              </div>
              <extd-grid
                config="c.grid.config"
                filter="c.grid.filter"
                data="c.grid.data">
              </extd-grid>
            </div>
          </div>
        </div>`,
      scopeProperties: {
        weightLabel: (a: any) => {
          if (!a || a.length !== 1 || !a[0].measurementUnitCanBeWeighed) {
            this.notification.error(i18n('weightedItem') + '?')
            return
          }
          this.modals?.weight.openWeightModal(a[0])
        },
        print: (e: any) => this.print(e),
        selected: (a: any) => a.provider.getSelected().length,
        isWeighted: (a: any) => {
          const selected = a.provider.getSelected()
          return selected.length === 1 && selected[0].measurementUnitCanBeWeighed
        },
        proccessItem: (a: any) => {
          a.forEach((item: item) => {
            this.proccessItem(item, true)
          })
        },
        openTypeModal: () => {
          this.modals?.type.open()
        }
      },
      size: 'ext',
    })
  
    // Additional logic after modal is closed
    await new Promise(resolve => setTimeout(resolve, 2000))
    const dataRows = document.querySelector('.data-rows') as HTMLElement
    if (!dataRows) {
      return false
    }
    const c = angular.element(dataRows).controller().grid
    // c.config.hideTopPager = true
    // c.filter.addRule('isActive', 1)
    c.filter.sort = { id: 'desc' }
    c.reload()
  }
  setLabelType(type: labelType): void {
    this.settings.type = type
    const labelTypeElement = document.getElementById('labelType')
    if (labelTypeElement) {
      labelTypeElement.textContent = i18n(type)
    }
  }
  async showTempFileListModal(): Promise<void> {
    await this.modalService.showModal({
      template: `
        <div class="modal-body">
          <temp-file-list type-id="{{typeId}}" open-for-select="openForSelect"></temp-file-list>
        </div>
        <div class="modal-footer">
          <button class="btn" ng-click="closeModal()">
            <i class="fa fa-times"></i>${ i18n('close') }
          </button>
        </div>`,
      scopeProperties: {
        typeId: null,
        openForSelect: false,
      },
    })
  }

  bindEvents(): void {
    document.getElementById('labelType')?.addEventListener('click', () => { this.modals?.type.open() })
    document.getElementById('cleanAllButton')?.addEventListener('click', () => { this.cleanAll() })
    document.getElementById('printButton')?.addEventListener('click', () => { this.print() })
    if (this.mainInput != null) {
      this.mainInput.addEventListener('keypress', this.handleEnterPress(this.searchByBarcode.bind(this, this.mainInput)))
      document.getElementById('searchButton')?.addEventListener('click', this.searchByBarcode.bind(this, this.mainInput))
      this.mainInput.focus()
      document.addEventListener('click', (event) => {
        let clickedInsideModal = false
        const modals = document.querySelectorAll('.modal.in')
        modals.forEach(modal => {
          if (modal.contains(event.target as Node))
            {clickedInsideModal = true}
        })
        if (!clickedInsideModal && this.mainInput != null) {
          this.mainInput.focus()
        }
      })
    }
    this.bindCheckboxChange('sayOutLoud', 'sayOutLoud')
    this.bindCheckboxChange('showStock', 'showStock')
  }

  handleEnterPress(callback: () => void): (event: KeyboardEvent) => void {
    return (event) => {
      if (event.key == 'Enter') {
        callback()
      }
    }
  }

  bindCheckboxChange(elementId: string, settingKey: keyof typeof this.settings): void {
    document.getElementById(elementId)?.addEventListener('change', (event) => {
      if (event.target instanceof HTMLInputElement) {
        this.settings[settingKey] = event.target.checked
      }
    })
  }

  cacheElements(): void {
    this.itemList = document.querySelector('.item-list')
    this.mainInput = document.getElementById('barcode') as HTMLInputElement
    this.loadingIndicator = document.getElementById('loadingOverlay')
  }

  showLoading(): void {
    if (this.loadingIndicator != null) {
      this.loadingIndicator.style.display = 'flex'
    }
  }

  hideLoading(): void {
    if (this.loadingIndicator != null) {
      this.loadingIndicator.style.display = 'none'
    }
  }
  print(items: item[] = this.items.filter(item => item)): void {
    if (items.length === 0) {
      this.notification.error(i18n('noData'))
      return
    } 

    const labelGenerator = new LabelGenerator(items, this.settings.type)
    if (labelGenerator.success) {
      this.cleanAll(true)
    }
  }

  cleanAll(donePrinting: boolean = false): void {
    this.items = []
    if (this.itemList == null) {
      console.error('itemList is not defined')
      return
    }
    if (donePrinting) {
      this.itemList.innerHTML = `<div class="alert alert-success text-center">${i18n('printJobIsSent')}. ${i18n('noItemsScanned')}</div>`
    } else {
      this.itemList.innerHTML = `<div class="alert alert-info text-center">${i18n('noItemsScanned')}</div>`
    }
  }

  private createItemElement(item: packagedItem): HTMLElement {
    const itemElement = document.createElement('div')
    itemElement.className = 'item'
    itemElement.id = item.id ?? ''
    itemElement.innerHTML = this.getItemHtml(item, true)
    if (item.barcode == null || item.isActive == false) {
      itemElement.classList.add('inactive')
    }
    else if (item.weight != null) {
      itemElement.classList.add('mark')
    }
    const cornerButton = this.createItemButton('btn-yellow', 'fa-trash', () => {
      this.removeItem(itemElement, item.id)
    })
    itemElement.appendChild(cornerButton)
    if (item.measurementUnitCanBeWeighed && item.priceWithVat > 0) {
      const tagButton = this.createItemButton('btn-pink', 'fa-balance-scale', () => { this.modals?.weight.openWeightModal(item) })
      itemElement.appendChild(tagButton)
    } 
    itemElement.querySelector('.item-main')?.addEventListener('click', () => { this.showDetails(item) })
    if (item.id != null && !item.priceWithVat) {
      const priceButton = this.createItemButton('btn-danger', 'fa-euro', () => { void this.quickPriceChange(item) })
      itemElement.appendChild(priceButton)
    }
    return itemElement
  }

  getItemHtml(item: packagedItem, addLabels: boolean): string {
    return `
      <div class="item-main">
        ${(item.priceWithVat > 0 ? `<span class="item-price">${(item.totalPrice ?? item.priceWithVat).toFixed(2)}</span>` : '') + (this.settings.showStock ? `<span class="item-stock text-primary"><i class="fa fa-home margin-right-5"></i>${(item.stock || '0')}</span>` : '')}
        <span class="item-name">${item.name}</span>
      </div>` + (addLabels ? `<div class="item-labels">${this.getItemLabelsHtml(item)}</div>` : '')
  }

  getItemLabelsHtml(item: packagedItem): string {
    const labels = ['packageCode', 'weight', 'departmentNumber', 'packageQuantity'] as const
    const ago = this.getSeconds(item.retrievedAt ?? new Date())
    const pricePerUnit = LabelGenerator.getPricePerUnit(item)
    const labelHtml = labels.map(label => item[label] != null ? `<span>${i18n(label)}: ${item[label]}</span>` : '').join('')
    return labelHtml + (item.weight != null && item.priceWithVat != null ? `<span>${i18n('kiloPrice')}: <b>${item.priceWithVat.toFixed(2)}</b></span>` : '')
      + (item.measurementUnitCanBeWeighed ? `<span>${i18n('weightedItem')}</span>` : '')
      + (!item.measurementUnitCanBeWeighed && pricePerUnit != null && item.priceWithVat != null ? `<span class="pull-right text-light-grey">${pricePerUnit}</span>` : '')
      + `<span class="text-primary">${this.getAgoText(ago)}</span>`
  }

  getSeconds(date: Date): number {
    if (date == null) {
      return 0
    }
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    return seconds
  }
  getAgoText(s: number): string {
    if (s === 0) {
      return ''
    }
    return i18n('checked') + ' ' + s + ' s ' + i18n('ago')
  }
  createItemButton(buttonClass: string, iconClass: string, onClick: () => void): HTMLElement {
    const button = document.createElement('button')
    button.addEventListener('click', onClick)
    button.className = 'btn btn-sm ' + buttonClass
    button.type = 'button'
    const i = document.createElement('i')
    i.className = 'fa ' + iconClass
    button.appendChild(i)
    return button
  }

  removeItem(element: HTMLElement, itemId?: string): void {
    element.remove()
    this.items = this.items.filter(item => item.id !== itemId)
  }

  showDetails(item: packagedItem): void {
    const filteredItem = Object.fromEntries(
      Object.entries(item).filter(([key, value]) => value !== null && !key.toString().toLowerCase().includes('id') && !key.toString().toLowerCase().includes('account'))
    )
  
    const resultString = Object.entries(filteredItem)
      .map(([key, value]) => `
        <div class="row col-xs-12">
          <div class="col-sm-5" >${i18n(key)}:</div>
          <div class="col-sm-7" ${key.includes('price') ? 'ng-click="change(item)"' : ''}>${value}</div>
        </div>
      `)
      .join('')
    const modalTemplate = `
      <div class="modal-header">
        <h5 class="modal-title inline">${i18n('itemDetails')}</h5>
        <button type="button" class="close" aria-label="Close" ng-click="closeModal()">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <div class="container width-auto">${resultString}</div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-sm btn-pink" type="button" ng-click="tagModal(item)"><i class="fa fa-tag"></i> ${i18n('label')}</button>
        <button type="button" class="btn btn-sm" ng-click="closeModal()"
        >${i18n('close')}</button>
      </div>
    `
    void this.modalService.showModal({
      template: modalTemplate,
      scopeProperties: {
        item: item,
        change: (item: item) => {
          void this.quickPriceChange(item)
        },
        tagModal: (item: item) => {
          void this.modals?.weight.openWeightModal(item)
        }
      }
    })
  }

  async quickPriceChange(item: packagedItem): Promise<void> {
    const price = prompt(i18n('enterNewPrice'), (item.priceWithVat ?? 0).toString())
    if (price == null || item.id == null) {
      this.notification.info(i18n('error'))
      return
    }
    const data = new Object() as item
    data.id = item.id.split('-')[0]
    data.isActive = true
    data.priceWithVat = parseFloat(price.replace(',', '.'))
    if (data.priceWithVat <= 0) {
      this.notification.error(i18n('missingPrice'))
      return
    }
    data.priceWithoutVat = (data.priceWithVat / 1.21)
    data.priceWithoutVat = Math.round((data.priceWithoutVat + Number.EPSILON) * 10000) / 10000
    item.priceWithVat = data.priceWithVat
    item.priceWithoutVat = data.priceWithoutVat
    await this.req.saveItem(data.id, data)
    this.cleanAll()
  }

  addItemToView(item: packagedItem): void {
    const itemElement = this.createItemElement(item)
    if (this.itemList != null) {
      this.itemList.appendChild(itemElement)
      itemElement.scrollIntoView({ behavior: 'smooth', block: 'end' })
    } else {
      this.notification.error(i18n('missingElements'))
    }
  }

  proccessItem(item: packagedItem, silence: boolean = false): void {
    // we might get duplicate items, so item id or barcode is not enough
    item.id = this.generateItemId(item.id)
    if (silence) {
      this.notification.success({
        title: i18n('itemAdded'),
        message: item.name,
        delay: 2000
      })
    } else if (!this.settings.sayOutLoud) {
      // no need to say out loud
    } else if (item.isActive == false && item.priceWithVat > 0) {
      void this.textToVoice.speak(i18n('itemNotActive'))
    } else if (this.settings.showStock && this.settings.sayOutLoud && item.stock != null) {
      void this.textToVoice.speak(item.stock.toString())
      console.info('\t' + item.barcode + '\t' + item.stock)
    } else if (this.items.length > 0 && item.priceWithVat > 0 && (this.items[this.items.length - 1]).barcode == item.barcode && item.weight == this.items[this.items.length - 1].weight) {
      void this.textToVoice.speak(i18n('asMentioned') + ', ' + i18n('price') + ' ' + this.textToVoice.digitsToPrice(item.totalPrice ?? item.priceWithVat) + (item.weight !== undefined ? '. ' + i18n('weight') + this.textToVoice.numberToWords(item.weight) + item.measurementUnitName : '') + ' ' + i18n('thisIs') + ' ' + item.name)
    } else if (item.priceWithVat > 0) {
      void this.textToVoice.speak(i18n('price') + ' ' + this.textToVoice.digitsToPrice(item.totalPrice ?? item.priceWithVat))
    } else {
      void this.textToVoice.speak(i18n('priceNotSet'))
    }
    if (this.items.length === 0 && this.itemList != null) {
      this.itemList.innerHTML = ''
    }
    this.items.push(item)
    this.addItemToView(item)
  }

  canItBePackaged(barcode: string): boolean {
    const prefix = parseInt(barcode.slice(0, 2), 10)
    return (barcode.toString().length === 13 || barcode.toString().length === 21) && prefix > 20 && prefix < 30
  }

  searchByBarcode(inputField: HTMLInputElement): void {
    const barcode = lettersToNumbers(inputField.value)
    inputField.value = ''
    inputField.focus()
    if (barcode.length == 0) {
      this.notification.error(i18n('missingBarcode'))
      return
    }

    if (this.canItBePackaged(barcode)) {
      void this.searchforAPackagedItem(barcode)
    } else {
      void this.searchItem(barcode)
    }
  }

  async searchforAPackagedItem(barcode: string): Promise<void> {
    let item = null
    let barcodePart = barcode
    // long barcode: 2200 + 13 digits of barcode + 4 digits of weight
    // short barcode: 23 or 24 + 6 digits of barcode + 4 digits of weight
    // short barcode: 25 or 29 + 5 digits of barcode + 5 digits of weight
    // const barcodePart = (barcode.length > 13) ? barcode.slice(4, 17) : barcode.slice(0, 8)
    if (barcode.length === 13 && barcode.slice(0, 2) === '23' || barcode.slice(0, 2) === '24') {
      barcodePart = barcode.slice(0, 8)
    } else if (barcode.length === 13 && barcode.slice(0, 2) === '25' || barcode.slice(0, 2) === '29') {
      barcodePart = barcode.slice(0, 7)
    } else if (barcode.length === 21) {
      barcodePart = barcode.slice(4, 17)
    }
    this.showLoading()
    item = await this.req.getItem(barcodePart) as packagedItem
    this.hideLoading()
    if (item != null) {
      // TODO: function to handle weight or simple units
      // TODO: rename to quantity or packageQuantity
      item.weight = parseInt((barcode.length > 13) ? barcode.slice(17, 21) : barcode.slice(8, 12), 10) / 1000
      item.totalPrice = this.calculateTotalPrice(item.priceWithVat, item.weight)
      this.proccessItem(item)
    } else {
      this.notFound(barcode)
    }
  }

  async searchItem(barcode: string): Promise<void> {
    this.showLoading()
    const item = await this.req.getItem(barcode) as item
    this.hideLoading()
    if (item != null) {
      this.proccessItem(item)
    } else {
      this.notFound(barcode)
    }
  }

  private notFound(barcode: string): void {
    const item: item = new Object() as item
    item.name = i18n('itemNotFound') + ' (' + i18n('barcode') + ': ' + barcode + ')'
    item.barcode = barcode
    item.isActive = false
    this.addItemToView(item)
  }

  public calculateTotalPrice(priceWithVat: number, quantity: number): number {
    if (priceWithVat == null || quantity == null) {
      return 0
    }
    const totalPrice = priceWithVat * quantity
    return Math.round((totalPrice + Number.EPSILON) * 100) / 100
  }

  addActivateButton(): boolean {
    const navbarShortcuts = document.querySelector('.breadcrumbs')
    if (navbarShortcuts != null) {
      const button = document.createElement('button')
      button.textContent = i18n('labelsAndPrices')
      button.className = 'btn btn-sm'
      button.addEventListener('click', this.init.bind(this))
      navbarShortcuts.appendChild(button)
    }
    return navbarShortcuts != null
  }

  generateItemId(id: string): string {
    return id + '-' + Math.random().toString(36).substring(7)
  }

  changeDocumentTitle(): void {
    document.title = i18n('labelsAndPrices')
  }
}
