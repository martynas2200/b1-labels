import { i18n, lettersToNumbers } from './i18n'
import { LabelGenerator } from './labelGenerator'
import { newItem, type item, type packagedItem } from './item'
import { UINotification } from './ui-notification'
import mainHTML from './html/main.html'
import { TextToVoice } from './textToVoice'
import { WriteOffModal } from './writeOffModal'
import { WeightLabelModal } from './weightLabelModal'
import { Request } from './request'

declare let $: any
declare let GM: any
declare let currentCompanyUser: any
declare let angular: any

export class LabelerInterface {
  private notification = new UINotification()
  private readonly req: Request = new Request(this.notification)
  private textToVoice = new TextToVoice(this.notification);
  private items: packagedItem[] = []
  private active: boolean = false
  settings = {
    alternativeLabelFormat: false,
    autoPrint: false,
    clearAfterPrint: true,
    sayOutLoud: true
  }

  modals: {
    weight: WeightLabelModal
    searchResults: HTMLElement | null
    writeOff: WriteOffModal 
    itemDetails: HTMLElement | null
    newItem: newItem
  } | undefined

  loadingIndicator: HTMLElement | null = null
  mainInput: HTMLInputElement | null = null
  itemList: HTMLElement | null = null

  constructor () {
  }


  public isActive (): boolean {
    this.active = (document.querySelector('.look-up-container') !== null)
    return this.active
  }

  public init (): boolean {
    if (this.isActive()) return true
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

  public simplifyPage (): boolean {
    this.hideDropdownMenuItems()
    this.changeDocumentTitle()
    this.addNavItems()
    document.body.classList.add('labeler-interface')
    return true
  }

  hideDropdownMenuItems (): void {
    document.querySelectorAll('.dropdown-menu li').forEach((li, index) => {
      if (index < 9) (li as HTMLElement).style.display = 'none'
    })
  }

  removeElements (...elements: Element[]): void {
    elements.forEach((el => { el.remove() }))
  }

  injectHtml (mainPage: Element): void {
    mainPage.insertAdjacentHTML('beforebegin', mainHTML(i18n))
  }

  createNavItem (text: string, onClick: () => void, icon: string): HTMLElement {
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

  addNavItems (): void {
    const parentElement = document.querySelector('.navbar-shortcuts')
    if (parentElement == null) {
      this.notification.error(i18n('missingElements'))
      return
    }
    parentElement.innerHTML = ''
    const ul = document.createElement('ul')
    parentElement.appendChild(ul)
    const uploadFileElement = this.createNavItem(i18n('uploadFile'), () => { this.uploadFile() }, 'fa-upload')
    const writeOff = this.createNavItem(i18n('writeOff'), () => {}, 'fa-file')
    // writeOff
    writeOff.setAttribute('data-toggle', 'modal')
    writeOff.setAttribute('data-target', '#writeOffModal')
    ul.appendChild(writeOff)
    ul.appendChild(uploadFileElement)
  }

  uploadFile (): void {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = '.pdf'
    fileInput.addEventListener('change', (event) => { this.handleFile(event) })
    fileInput.click()
  }

  async handleFile (event: Event): Promise<void> {
    const target = event.target as HTMLInputElement
    if (target.files == null || target.files.length === 0) {
      this.notification.error(i18n('noFileSelected'))
      return
    }
    const injector = angular.element(document.body).injector()
    const $uibModal = injector.get('$uibModal')
    const $controller = injector.get('$controller')

    // Create a new scope and controller instance
    const $scope = injector.get('$rootScope').$new();
    const accountFileUploadCtrl: any = $controller('AccountFileUpload', {
        $translate: injector.get('$translate'),
        $uibModal: $uibModal,
        $confirm: injector.get('$confirm'),
        util: injector.get('util'),
        notification: this.notification,
        accountFileUpload: injector.get('accountFileUpload'),
        $scope: $scope,
        socket: injector.get('socket')
    })
    
    const files = Array.from(target.files);
    console.info(files);
    accountFileUploadCtrl.uploadToCompany(files, currentCompanyUser.company.id)

    await new Promise(resolve => setTimeout(resolve, 5000))
  }

  bindEvents (): void {
    document.getElementById('cleanAllButton')?.addEventListener('click', () => { this.cleanAll() })
    document.getElementById('printButton')?.addEventListener('click', () => { this.print() })
    if (this.mainInput != null) {
      this.mainInput.addEventListener('keypress', this.handleEnterPress(this.searchByBarcode.bind(this, this.mainInput)))
      document.getElementById('searchButton')?.addEventListener('click', this.searchByBarcode.bind(this, this.mainInput))
      this.mainInput.focus()
      document.getElementById('searchNameButton')?.addEventListener('click', this.searchByName.bind(this, this.mainInput))
      const modalSearchInput = document.getElementById('searchByName') as HTMLInputElement
      modalSearchInput.addEventListener('keypress', this.handleEnterPress(this.searchByName.bind(this, modalSearchInput)))
      const modals = document.querySelectorAll('.modal')
      document.addEventListener('click', (event) => {
        let clickedInsideModal = false
        modals.forEach(modal => {
          if (modal.contains(event.target as Node))
            clickedInsideModal = true
        })
        if (!clickedInsideModal && this.mainInput != null) {
          this.mainInput.focus()
        }
      })
    }
    this.bindCheckboxChange('alternativeLabelFormat', 'alternativeLabelFormat')
    this.bindCheckboxChange('sayOutLoud', 'sayOutLoud')
    this.bindCheckboxChange('clearAfterPrint', 'clearAfterPrint')
    this.bindCheckboxChange('autoPrint', 'autoPrint')
  }

  handleEnterPress (callback: () => void): (event: KeyboardEvent) => void {
    return (event) => {
      if (event.key == 'Enter') callback()
    }
  }

  bindCheckboxChange (elementId: string, settingKey: keyof typeof this.settings): void {
    document.getElementById(elementId)?.addEventListener('change', (event) => {
      if (event.target instanceof HTMLInputElement) {
        this.settings[settingKey] = event.target.checked
      }
    })
  }

  cacheElements (): void {
    this.itemList = document.querySelector('.item-list')
    this.mainInput = document.getElementById('barcode') as HTMLInputElement
    this.loadingIndicator = document.getElementById('loadingOverlay')
    this.modals = {
      itemDetails: document.getElementById('itemDetails'),
      newItem: new newItem(this.req),
      searchResults: document.getElementById('search-results'),
      weight: new WeightLabelModal(this.notification, this),
      writeOff: new WriteOffModal(this.req)
    }
  }

  showLoading (): void {
    if (this.loadingIndicator != null) {
      this.loadingIndicator.style.display = 'flex'
    }
  }

  hideLoading (): void {
    if (this.loadingIndicator != null) {
      this.loadingIndicator.style.display = 'none'
    }
  }

  print (clearAfterPrint: boolean = this.settings.clearAfterPrint): void {
    this.items = this.items.filter(item => item)
    if (this.items.length === 0) {
      this.notification.error(i18n('noData'))
      return
    }
    if (!this.items.every(item => item.isActive == true && item.barcode != null)) {
      this.notification.warning(i18n('notAllItemsActive'))
    }
    void new LabelGenerator(this.items, this.settings.alternativeLabelFormat)
    if (clearAfterPrint) {
      this.cleanAll(true)
    }
  }

  cleanAll (donePrinting: boolean = false): void {
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

  private createItemElement (item: packagedItem): HTMLElement {
    const itemElement = document.createElement('div')
    itemElement.className = 'item'
    itemElement.id = item.id ?? ''
    itemElement.innerHTML = this.getItemHtml(item)
    if (item.barcode == null || item.isActive == false) itemElement.classList.add('inactive')
    else if (item.weight != null) itemElement.classList.add('mark')
    const cornerButton = this.createItemButton('btn-yellow', 'fa-trash', () => { 
      this.removeItem(itemElement, item.id) 
    });
    itemElement.appendChild(cornerButton)
    if (item.measurementUnitCanBeWeighed) {
      const tagButton = this.createItemButton('btn-pink', 'fa-balance-scale', () => { this.modals?.weight.openWeightModal(item) })
      itemElement.appendChild(tagButton)
    } else if (item.id == null) {
      // we can add a button to add a new item
      const addNewItemButton = this.createItemButton('btn-info', 'fa-plus', () => { this.modals?.newItem.openModal(item) })
      itemElement.appendChild(addNewItemButton)
    }
    itemElement.querySelector('.item-price')?.addEventListener('click', () => { this.showDetails(item) });
    return itemElement
  }

  getItemHtml (item: packagedItem): string {
    return `
      <div class="item-main">
        ${item.priceWithVat > 0 ? `<span class="item-price">${(item.totalPrice ?? item.priceWithVat).toFixed(2)}</span>` : ''}
        <span class="item-name">${item.name}</span>
      </div>
      <div class="item-labels">
        ${this.getItemLabelsHtml(item)}
      </div>`
  }

  getItemLabelsHtml (item: packagedItem): string {
    const labels = ['packageCode', 'weight', 'departmentNumber', 'packageQuantity'] as const
    const ago = this.getSeconds(item.retrievedAt ?? new Date())
    const labelHtml = labels.map(label => item[label] != null ? `<span>${i18n(label)}: ${item[label]}</span>` : '').join('')
    return labelHtml + (item.weight != null ? `<span>${i18n('kiloPrice')}: <b>${item.priceWithVat.toFixed(3)}</b></span>` : '') 
    + (item.measurementUnitCanBeWeighed ? `<span>${i18n('weightedItem')}</span>` : '')
    + `<span class="text-primary">${ this.getAgoText(ago) }</span>`
  }

  getSeconds(date: Date): number {
    if (date == null) return 0
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    return seconds
  }
  getAgoText (s: number): string {
    if (s === 0) return ''
    return i18n('checked') + ' ' + s + ' s ' + i18n('ago')
  }
  createItemButton (buttonClass: string, iconClass: string, onClick: () => void): HTMLElement {
    const button = document.createElement('button')
    button.addEventListener('click', onClick)
    button.className = 'btn btn-sm ' + buttonClass
    button.type = 'button'
    const i = document.createElement('i')
    i.className = 'fa ' + iconClass
    button.appendChild(i)
    return button
  }

  removeItem (element: HTMLElement, itemId?: string): void {
    element.remove()
    this.items = this.items.filter(item => item.id !== itemId)
  }

  showDetails (item: packagedItem): void {
    const filteredItem = Object.fromEntries(
      Object.entries(item).filter(([key, value]) => value !== null && !key.toString().toLowerCase().includes('id') && !key.toString().includes('cost'))
    )
    const resultString = Object.entries(filteredItem)
      .map(([key, value]) => `<div class="row col-xs-12 ${key.includes('price') ? 'price' : ''}"><div class="col-sm-5">${i18n(key)}:</div><div class="col-sm-7">${value}</div></div>`)
      .join('')

    if (this.modals?.itemDetails != null) {
      const modalBody = this.modals.itemDetails.querySelector('.modal-body')
      if (modalBody != null) {
        modalBody.innerHTML = `<div class="container width-auto">${resultString}</div>`
      }
      const button = this.modals.itemDetails.querySelectorAll('.price')
      button.forEach(e => e.addEventListener('click', () => { this.quickPriceChange(item) }))
    }
    // show the modal by using jQuery
    $(this.modals?.itemDetails).modal('show')
  }
  quickPriceChange (item: packagedItem): void {
    let price = prompt(i18n('enterNewPrice'), item.priceWithVat.toString())
    if (price == null || item.id == null) {
      this.notification.info(i18n('error'))
      return;
    } 
    let data = new Object() as item
    data.id = item.id.split('-')[0]
    data.isActive = true
    data.priceWithVat = parseFloat(price.replace(',', '.'))
    if (data.priceWithVat <= 0) {
      this.notification.error(i18n('missingPrice'))
      return;
    }
    data.priceWithoutVat = (data.priceWithVat / 1.21)
    data.priceWithoutVat = Math.round((data.priceWithoutVat + Number.EPSILON) * 10000) / 10000
    item.priceWithVat = data.priceWithVat
    item.priceWithoutVat = data.priceWithoutVat
    this.req.saveItem(data.id, data)
    $(this.modals?.itemDetails).modal('hide')
    this.cleanAll()
  }

  addItemToView (item: packagedItem): void {
    const itemElement = this.createItemElement(item)
    if (this.itemList != null) {
      this.itemList.appendChild(itemElement)
      itemElement.scrollIntoView({ behavior: 'smooth', block: 'end' })
    } else {
      this.notification.error(i18n('missingElements'))
    }
  }

  proccessItem (item: packagedItem): void {
    // we might get duplicate items, so item id or barcode is not enough
    item.id = this.generateItemId(item.id)
    if (!this.settings.sayOutLoud) {
      // Nothing
    } else if (this.items.length > 0 && item.priceWithVat > 0 && (this.items[this.items.length - 1]).barcode == item.barcode && item.weight == this.items[this.items.length - 1].weight) {
      // void this.textToVoice.speak('Kaip ir sakiau, kaina yra ' + this.textToVoice.digitsToPrice(item.totalPrice ?? item.priceWithVat) + (item.weight !== undefined ? '. Svoris ' + this.textToVoice.numberToWords(item.weight) + ' g.' : '') + ' Tai ' + item.name)
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
    if (this.settings.autoPrint) {
      this.print(true)
    }
  }

  canItBePackaged (barcode: string): boolean {
    // barcode rules: prefix is 21-29(a part of barcode) + 6 barcode digits + 4 digits for weight
    // '2200' + 13 digits of barcode + 4 digits of weight
    const prefix = parseInt(barcode.slice(0, 2), 10)
    return (barcode.toString().length === 13 || barcode.toString().length === 21) && prefix > 20 && prefix < 30 
  }

  searchByBarcode (inputField: HTMLInputElement): void {
    const barcode = lettersToNumbers(inputField.value)
    inputField.value = ''
    inputField.focus()
    if (barcode.length == 0) {
      this.notification.error(i18n('missingBarcode'))
      return
    } else if (barcode.toLowerCase() === 'stop') {
      this.print()
      return
    }

    if (this.canItBePackaged(barcode)) {
      void this.searchforAPackagedItem(barcode)
    } else {
      void this.searchItem(barcode)
    }
  }

  async searchByName (inputField: HTMLInputElement): Promise<void> {
    const name = inputField.value
    if (name == null || name.length == 0) {
      this.notification.error(i18n('missingName'))
      return
    }
    if (this.modals?.searchResults == null) {
      this.active = false
      this.notification.error(i18n('missingElements'))
      return
    }
    inputField.disabled = true
    this.notification.info(i18n('searchingFor') + ' ' + name)
    const items: item[] = await this.req.getItemsByName(name)
    this.modals.searchResults.innerHTML = items.length > 0 ? `<div class="alert alert-info">${i18n('searchSuccessful')} "${name}". ${items.length} ${i18n('results')}` : `<div class="alert alert-warning">${i18n('noItemsFound')} "${name}"</div>`
    items.forEach(item => {
      if (this.modals?.searchResults != null) {
        this.modals.searchResults.appendChild(this.createSearchResultItem(item))
      }
    })
    inputField.disabled = false
    inputField.value = ''
    inputField.focus()
  }

  createSearchResultItem (item: item): HTMLElement {
    const newItem = document.createElement('div')
    newItem.className = 'item'
    const price = document.createElement('span')
    price.className = 'item-price margin-right-5'
    price.textContent = item.priceWithVat.toString()
    newItem.appendChild(price)
    const name = document.createElement('span')
    name.className = 'item-name'
    name.textContent = item.name
    newItem.appendChild(name)
    const Addbutton = document.createElement('button')
    Addbutton.className = 'btn btn-info btn-xs margin-left-5'
    Addbutton.textContent = i18n('add')
    newItem.appendChild(Addbutton)

    Addbutton.addEventListener('click', () => {
      this.proccessItem(item)
      newItem.style.backgroundColor = '#b0d877'
    })
    if (item.measurementUnitCanBeWeighed) {
      const button = document.createElement('button')
      button.className = 'btn btn-pink btn-xs margin-left-5'
      button.textContent = i18n('weightLabel')
      newItem.appendChild(button)
      button.addEventListener('click', () => {
        this.modals?.weight.openWeightModal(item)
      })
    }
    return newItem
  }

  async searchforAPackagedItem (barcode: string): Promise<void> {
    let item = null
    const barcodePart = (barcode.length > 13) ? barcode.slice(4, 17) : barcode.slice(0, 8)
    this.showLoading()
    item = await this.req.getItem(barcodePart) as packagedItem
    this.hideLoading()
    if (item != null) {
      // TODO: function to handle weight or simple units
      // TODO: rename to quantity or packageQuantity
      item.weight = parseInt((barcode.length > 13) ? barcode.slice(17, 21) : barcode.slice(8, 12), 10) / 1000
      item.totalPrice = this.calculateTotalPrice(item)
      this.proccessItem(item)
    } else {
      this.notFound(barcode)
    }
  }

  async searchItem (barcode: string): Promise<void> {
    this.showLoading()
    const item = await this.req.getItem(barcode) as item
    this.hideLoading()
    if (item != null) {
      this.proccessItem(item)
    } else {
      this.notFound(barcode)
    }
  }

  private notFound (barcode: string): void {
    let item: item = new Object() as item
    item.name = i18n('itemNotFound') + ' (' + i18n('barcode') + ': ' + barcode + ')'
    item.barcode = barcode
    item.isActive = false
    this.addItemToView(item)
  }

  public calculateTotalPrice (item: packagedItem): number {
    if (item.weight == null) {
      return 0
    }
    const totalPrice = item.priceWithVat * item.weight
    const totalFinalPrice = Math.round((totalPrice + Number.EPSILON) * 100) / 100
    return totalFinalPrice
  }

  addActivateButton (): boolean {
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

  generateItemId (id: string): string {
    return id + '-' + Math.random().toString(36).substring(7)
  }

  changeDocumentTitle (): void {
    document.title = i18n('labelsAndPrices')
  }
}
