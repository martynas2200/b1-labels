import { i18n, lettersToNumbers } from './i18n'
import { Request } from './request.js'
import { LabelGenerator } from './labelGenerator'
import { type item, type packagedItem } from './item'
import { UINotification } from './ui-notification'
import mainHTML from './html/main.html'

declare let $: any
declare let GM: any

export class LabelerInterface {
  notification = new UINotification()
  req: Request = new Request()
  items: packagedItem[] = []
  active: boolean = false
  settings: {
    alternativeLabelFormat: boolean
    sayOutLoud: boolean
  }

  modals: {
    weight: {
      currentItem: packagedItem | null
      parent: HTMLElement | null
      productName: HTMLInputElement | null
      productWeight: HTMLInputElement | null
      kgPrice: HTMLInputElement | null
      description: HTMLInputElement | null
      expiryDate: HTMLInputElement | null
      batchNumber: HTMLInputElement | null
      addManufacturer: HTMLInputElement | null
      addDescription: HTMLInputElement | null
      manufacturerField: HTMLElement | null
      descriptionField: HTMLElement | null
      addWeightedItem: HTMLButtonElement | null
      totalPrice: HTMLInputElement | null
    }
    searchResults: HTMLElement | null
    itemDetails: HTMLElement | null
  } | undefined

  loadingIndicator: HTMLElement | null = null
  mainInput: HTMLInputElement | null = null
  itemList: HTMLElement | null = null
  apiKey: string | null = null

  constructor () {
    this.settings = {
      alternativeLabelFormat: false,
      sayOutLoud: true
    }
    void this.checkApiKey()
  }

  async checkApiKey (): Promise<void> {
    this.apiKey = await GM.getValue('api-key', null)
    if (this.apiKey != null && this.apiKey.length < 20) {
      this.apiKey = null
      this.notification.error(i18n('invalidApiKey'))
    }
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
    if ((mainPage == null) || (navbarShortcuts == null) || (footer == null)) {
      return false
    }

    this.injectHtml(mainPage)
    this.removeElements(navbarShortcuts, footer, mainPage)
    this.hideDropdownMenuItems()
    this.changeDocumentTitle()
    this.cacheElements()
    this.bindEvents()
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

  bindEvents (): void {
    document.getElementById('cleanAllButton')?.addEventListener('click', this.cleanAll.bind(this))
    document.getElementById('printButton')?.addEventListener('click', this.print.bind(this))

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

    this.modals?.weight.addDescription?.addEventListener('change', () => {
      if (this.modals?.weight.descriptionField != null && this.modals.weight.addDescription != null) {
        this.modals.weight.descriptionField.style.display = this.modals.weight.addDescription.checked ? 'block' : 'none'
      }
    })
    this.modals?.weight.addWeightedItem?.addEventListener('click', () => { this.addWeightItem() })
    this.modals?.weight.productWeight?.addEventListener('keypress', this.handleEnterPress(() => { this.addWeightItem() }))
    this.modals?.weight.productWeight?.addEventListener('input', this.handleWeightChange.bind(this))

    this.bindCheckboxChange('alternativeLabelFormat', 'alternativeLabelFormat')
    this.bindCheckboxChange('sayOutLoud', 'sayOutLoud')
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
      weight: {
        currentItem: null,
        parent: document.getElementById('weightLabelModal'),
        productName: document.getElementById('productName') as HTMLInputElement,
        productWeight: document.getElementById('productWeight') as HTMLInputElement,
        kgPrice: document.getElementById('kgPrice') as HTMLInputElement,
        description: document.getElementById('description') as HTMLInputElement,
        expiryDate: document.getElementById('expiryDate') as HTMLInputElement,
        batchNumber: document.getElementById('batchNumber') as HTMLInputElement,
        addManufacturer: document.getElementById('addManufacturer') as HTMLInputElement,
        addDescription: document.getElementById('addDescription') as HTMLInputElement,
        manufacturerField: document.getElementById('manufacturerField'),
        descriptionField: document.getElementById('descriptionField'),
        addWeightedItem: document.getElementById('addWeightedItem') as HTMLButtonElement,
        totalPrice: document.getElementById('totalPrice') as HTMLInputElement
      },
      itemDetails: document.getElementById('itemDetails'),
      searchResults: document.getElementById('search-results')
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

  print (): void {
    this.items = this.items.filter(item => item)
    if (this.items.length === 0) {
      this.notification.error(i18n('noData'))
      return
    }
    if (!this.items.every(item => item.isActive == true && item.barcode != null)) {
      this.notification.warning(i18n('notAllItemsActive'))
    }
    void new LabelGenerator(this.items, this.settings.alternativeLabelFormat)
  }

  cleanAll (): void {
    this.items = []
    if (this.itemList == null) {
      console.error('itemList is not defined')
      return
    }
    this.itemList.innerHTML = `<div class="alert alert-info text-center">${i18n('noItemsScanned')}</div>`
  }

  async getAudioUrl (text: string): Promise<string | undefined> {
    if (this.apiKey == null) {
      return
    }
    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: 'lt-LT', ssmlGender: 'MALE' },
        audioConfig: { audioEncoding: 'MP3' }
      })
    })
    const data = await response.json()
    const audioContent = data.audioContent as string
    const audioBlob = new Blob([Uint8Array.from(atob(audioContent), c => c.charCodeAt(0))], { type: 'audio/mp3' })
    return URL.createObjectURL(audioBlob)
  }

  private createItemElement (item: packagedItem): HTMLElement {
    const itemElement = document.createElement('div')
    itemElement.className = 'item'
    itemElement.id = item.id ?? ''
    itemElement.innerHTML = this.getItemHtml(item)
    if (item.barcode == null || item.isActive == false) itemElement.classList.add('inactive')
    if (item.weight != null) itemElement.classList.add('mark')

    const cornerButton = this.createItemButton('btn-yellow', 'fa-trash', () => { this.removeItem(itemElement, item.id) });
    itemElement.appendChild(cornerButton)
    if (item.measurementUnitCanBeWeighed) {
      const tagButton = this.createItemButton('btn-pink', 'fa-balance-scale', () => { this.openWeightModal(item) })
      itemElement.appendChild(tagButton)
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
    const labelHtml = labels.map(label => item[label] != null ? `<span>${i18n(label)}: ${item[label]}</span>` : '').join('')
    return labelHtml + (item.weight != null ? `<span>${i18n('kiloPrice')}: ${item.priceWithVat}</span>` : '') 
    + (item.measurementUnitCanBeWeighed ? `<span>${i18n('weightedItem')}</span>` : '')
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
      .map(([key, value]) => `<div class="row col-xs-12"><div class="col-sm-5">${i18n(key)}:</div><div class="col-sm-7">${value}</div></div>`)
      .join('')

    if (this.modals?.itemDetails != null) {
      const modalBody = this.modals.itemDetails.querySelector('.modal-body')
      if (modalBody != null) {
        modalBody.innerHTML = `<div class="container width-auto">${resultString}</div>`
      }
    }
    // show the modal by using jQuery
    $(this.modals?.itemDetails).modal('show')
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

  newItem (item: packagedItem): void {
    // we might get duplicate items, so system's id or barcode is not enough
    item.id = this.generateItemId()
    if (this.items.length > 0 && (this.items[this.items.length - 1]).barcode == item.barcode && item.weight == this.items[this.items.length - 1].weight) {
      void this.playAudio('Kaip ir sakiau, kaina yra ' + this.digitsToPrice(item.totalPrice ?? item.priceWithVat) + (item.weight !== undefined ? '. Svoris ' + this.numberToWords(item.weight) + ' g.' : '') + ' Tai ' + item.name)
    } else if (item.priceWithVat > 0) {
      void this.playAudio('Kaina ' + this.digitsToPrice(item.totalPrice ?? item.priceWithVat))
    } else {
      void this.playAudio('Kaina nėra nustatyta')
    }
    if (this.items.length === 0 && this.itemList != null) {
      this.itemList.innerHTML = ''
    }
    this.items.push(item)
    this.addItemToView(item)
  }

  async playAudio (text: string): Promise<void> {
    if (!this.settings.sayOutLoud) {
      return
    }
    const audio = new Audio(await this.getAudioUrl(text))
    void audio.play()
  }

  numberToWords (number: number): string {
    const units = ['', 'vienas', 'du', 'trys', 'keturi', 'penki', 'šeši', 'septyni', 'aštuoni', 'devyni']
    const teens = ['dešimt', 'vienuolika', 'dvylika', 'trylika', 'keturiolika', 'penkiolika', 'šešiolika', 'septyniolika', 'aštuoniolika', 'devyniolika']
    const tens = ['', '', 'dvidešimt', 'trisdešimt', 'keturiasdešimt', 'penkiasdešimt', 'šešiasdešimt', 'septyniasdešimt', 'aštuoniasdešimt', 'devyniasdešimt']
    const hundreds = ['', 'šimtas', 'du šimtai', 'trys šimtai', 'keturi šimtai', 'penki šimtai', 'šeši šimtai', 'septyni šimtai', 'aštuoni šimtai', 'devyni šimtai']

    let words = []
    if (number === 0) {
      words.push('nulis')
    } else {
      const unitsPart = number % 10
      const tensPart = Math.floor(number / 10) % 10
      const hundredsPart = Math.floor(number / 100)
      if (hundredsPart > 0) {
        words.push(hundreds[hundredsPart])
      }
      if (tensPart > 1) {
        words.push(tens[tensPart])
      }
      if (tensPart === 1) {
        words.push(teens[unitsPart])
      } else {
        words.push(units[unitsPart])
      }
    }
    words = words.filter(word => word)
    return words.join(' ')
  }

  digitsToPrice (number: number): string {
    const integer = Math.floor(number)
    const decimal = Math.round((number - integer) * 100)
    let words = []
    if (integer > 0) {
      words.push(this.numberToWords(integer))
    }

    if (decimal > 0) {
      // euras, eurai, eurų
      if (integer !== 0) {
        if (integer === 1 || (integer % 10 === 1 && integer % 100 !== 11)) {
          words.push('euras')
        } else if (integer % 10 === 0 || integer % 10 >= 10 || (integer % 100 >= 10 && integer % 100 <= 20)) {
          words.push('eurų')
        } else {
          words.push('eurai')
        }
        words.push('ir')
      }
      words.push(this.numberToWords(decimal))
      // centas, centai, centų
      if (decimal === 1 || (decimal % 10 === 1 && decimal % 100 !== 11)) {
        words.push('centas')
      } else if (decimal % 10 === 0 || decimal % 10 >= 10 || (decimal % 100 >= 10 && decimal % 100 <= 20)) {
        words.push('centų')
      } else {
        words.push('centai')
      }
    }
    words = words.filter(word => word)
    return words.join(' ')
  }

  canItBePackaged (barcode: string): boolean {
    // barcode rules: prefix is 20-29, 4 digits for weight
    const prefix = parseInt(barcode.slice(0, 2), 10)
    return barcode.toString().length === 13 && prefix > 20 && prefix < 30 && parseInt(barcode.slice(8, 12), 10) < 5000
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
      this.newItem(item)
      newItem.style.backgroundColor = '#b0d877'
    })
    if (item.measurementUnitCanBeWeighed) {
      const button = document.createElement('button')
      button.className = 'btn btn-pink btn-xs margin-left-5'
      button.textContent = i18n('weightLabel')
      newItem.appendChild(button)
      button.addEventListener('click', () => {
        this.openWeightModal(item)
      })
    }
    return newItem
  }

  async searchforAPackagedItem (barcode: string): Promise<void> {
    let item = null
    const barcodePart = barcode.slice(0, 8)
    this.showLoading()
    item = await this.req.getItem(barcodePart) as packagedItem
    this.hideLoading()
    if (item != null) {
      item.weight = parseInt(barcode.slice(8, 12), 10) / 1000
      item.totalPrice = this.calculateTotalPrice(item)
      this.newItem(item)
    } else {
      this.notFound(barcode)
    }
  }

  async searchItem (barcode: string): Promise<void> {
    this.showLoading()
    const item = await this.req.getItem(barcode) as item
    this.hideLoading()
    if (item != null) {
      this.newItem(item)
    } else {
      this.notFound(barcode)
    }
  }

  notFound (barcode: string): void {
    let item: item = new Object() as item
    item.name = i18n('itemNotFound') + ' (' + i18n('barcode') + ': ' + barcode + ')'
    item.barcode = barcode
    item.isActive = false
    this.addItemToView(item)
  }

  openWeightModal (item: packagedItem): void {
    if (this.modals?.weight.productName == null || this.modals.weight.productWeight == null || this.modals.weight.kgPrice == null || this.modals.weight.expiryDate == null || this.modals.weight.addManufacturer == null || this.modals.weight.manufacturerField == null || this.modals.weight.description == null) {
      return
    }
    this.modals.weight.currentItem = item
    this.modals.weight.productName.value = item.name
    this.modals.weight.kgPrice.value = item.priceWithVat.toString()
    this.modals.weight.description.value = item.description ?? ''
    this.modals.weight.expiryDate.min = new Date().toISOString().split('T')[0]
    this.modals.weight.expiryDate.value = ''
    this.modals.weight.addManufacturer.style.display = item.manufacturerName != null ? 'block' : 'none'
    this.modals.weight.manufacturerField.innerHTML = item.manufacturerName ?? ''
    $(this.modals.weight.parent).modal('show')
    this.modals.weight.productWeight.focus()
  }

  addWeightItem (): void {
    if (this.modals?.weight.currentItem?.weight == null || isNaN(this.modals.weight.currentItem.weight)) {
      this.notification.error(i18n('missingWeight'))
      return
    }
    this.modals.weight.currentItem.expiryDate = (this.modals.weight.expiryDate?.value != null && this.modals.weight.expiryDate.value.length > 0) ? this.modals.weight.expiryDate.value.slice(5) : undefined
    this.modals.weight.currentItem.batchNumber = (this.modals.weight.batchNumber?.value != null && this.modals.weight.batchNumber.value.length > 0) ? this.modals.weight.batchNumber.value : undefined
    this.modals.weight.currentItem.addManufacturer = this.modals.weight.addManufacturer?.checked && this.modals.weight.currentItem.manufacturerName != null
    this.modals.weight.currentItem.addDescription = this.modals.weight.addDescription?.checked && this.modals.weight.currentItem.description != null
    this.modals.weight.currentItem.description = (this.modals.weight.description?.value != null && this.modals.weight.description.value.length > 0) ? this.modals.weight.description.value : ""
    this.notification.info(i18n('weightItemAdded') + ': ' + this.modals.weight.currentItem.weight + ' kg')
    this.newItem(this.modals.weight.currentItem)
    // copy current item to a new object, so that the original object is not modified
    this.modals.weight.currentItem = JSON.parse(JSON.stringify(this.modals.weight.currentItem))
  }

  calculateTotalPrice (item: packagedItem): number {
    if (item.weight == null) {
      return 0
    }
    const totalPrice = item.priceWithVat * item.weight
    const totalFinalPrice = Math.round((totalPrice + Number.EPSILON) * 100) / 100
    return totalFinalPrice
  }

  handleWeightChange (): void {
    if (this.modals?.weight.currentItem == null) {
      return
    }
    this.modals.weight.currentItem.weight = (this.modals.weight.productWeight?.value != null) ? parseInt(this.modals.weight.productWeight.value) / 1000 : 0
    this.modals.weight.currentItem.totalPrice = this.calculateTotalPrice(this.modals.weight.currentItem)
    if (this.modals.weight.totalPrice != null) {
      this.modals.weight.totalPrice.value = this.modals.weight.currentItem.totalPrice.toFixed(2)
    }
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

  generateItemId (): string {
    return 'i-' + Math.random().toString(36).substring(7)
  }

  changeDocumentTitle (): void {
    document.title = i18n('labelsAndPrices')
  }
}
