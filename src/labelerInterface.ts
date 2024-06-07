import { i18n, lettersToNumbers } from './i18n'
import { Request } from './request.js'
import { LabelGenerator } from './labelGenerator'
import { type item, type packagedItem } from './item'
import { UINotification } from './ui-notification'

declare let GM: any
export class LabelerInterface {
  notification = new UINotification()
  req: Request = new Request()
  items: item[] = []
  active: boolean = false
  settings: {
    alternativeLabelFormat: boolean
    sayOutLoud: boolean
    packagedGoods: boolean
  }

  searchResultsElement: HTMLElement | null = null
  loadingIndicator: HTMLElement | null = null
  nameInput: HTMLInputElement | null = null
  itemList: HTMLElement | null = null
  apiKey: string | null = null
  infoModal: HTMLElement | null | undefined

  constructor () {
    this.settings = {
      alternativeLabelFormat: false,
      sayOutLoud: true,
      packagedGoods: false
    }
    void this.checkApiKey()
  }

  async checkApiKey (): Promise<void> {
    this.apiKey = await GM.getValue('api-key', null)
    if (this.apiKey != null && this.apiKey.length < 20) {
      this.apiKey = null
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

    this.hideDropdownMenuItems()
    this.injectHtml(mainPage)
    this.removeElements(navbarShortcuts, footer, mainPage)

    this.bindEvents()
    this.cacheElements()
    this.changeDocumentTitle()
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
    mainPage.insertAdjacentHTML('beforebegin', `
        <style>
        body {
          background: #eee;
        }
        .look-up-container .load-data {
          padding: 10px;
        }
        .look-up-container .load-overlay {
          background: rgb(238 238 238 / 75%)
        }
        .form-section {
          padding: 10px;
          border: 1px solid #ddd;
          margin-top: 10px;
        }
        span.item-price {
          font-weight: bold;
          background: var(--theme-blue--dark-bg);
          color: white;
          padding: 2px 8px;
          margin-right: 4px;
          border-radius: 4px;
        }
        .item-list {
          max-height: calc(100vh - 60px);
          overflow: auto;
        }
        .item {
          font-size: 1.1em;
          border: 1px solid #ddd;
          padding: 10px;
          margin-bottom: 5px;
          cursor: pointer;
          position: relative;
          animation: highlight 0.5s ease-out;
        }
        .item.inactive {
          background-color: #f8d7da;
        }
        .item:hover {
          background-color: #f1f1f1;
        }
        .item-labels {
          font-size: 0.8em;
          color: #666;
        }
        .item *:empty:not(i) {
          display: none;
        }
        .item-labels span {
          margin-right: 10px;
        }
        .corner-button {
          position: absolute;
          bottom: 0;
          right: 0;
          border-radius: 4px;
          border: none;
          margin: 5px;
        }
        .modal-body .form-group {
            margin-bottom: 1rem;
        }
        @keyframes highlight {
          from {     
            background-color: var(--theme-blue--dark-bg);
            color: white;
            filter: opacity(0.5);
          }
        }
        #barcode:focus {
            background-color: hsl(85 60% 74% / 1);
        }
        #barcode {
            transition: background-color 0.3s;
        }
        .look-up-container .form-section, .item:not(.mark):not(.inactive), #barcode {
          background: white;
        }
    </style>
    <div class="container look-up-container">
        <div class="row">
            <!-- Left Column: Form Section -->
            <div class="col-md-4 form-section">
            <h5 class="header blue">${i18n('labelsAndPrices')}</h5>
                <div class="form-group">
                    <label for="barcode" class="label-text">${i18n('fullBarcode')}</label>
                    <input type="text" class="form-control" id="barcode" placeholder="${i18n('enterBarcode')}">
                </div>
                <div class="form-group">
                <button type="button" class="btn btn-primary mb-2" id="searchBarcodeButton">${i18n('search')}</button>
                <button type="button" class="btn btn-secondary mb-2" data-toggle="modal" data-target="#searchByNameModal">${i18n('searchByName')}</button>
                </div>
                <div class="form-group">
                <!-- // Alternative Label Format -->
                <div class="checkbox-form">
                    <label>
                        <input type="checkbox" class="ace" id="alternativeLabelFormat">
                        <span class="lbl display-inline">&nbsp;${i18n('alternativeLabelFormat')}</span>
                    </label>
                </div>
                <div class="checkbox-form">
                    <label>
                        <input type="checkbox" class="ace" id="sayOutLoud" checked>
                        <span class="lbl display-inline">&nbsp;${i18n('sayOutLoud')}</span>
                    </label>
                </div>
                <div class="checkbox-form">
                    <label>
                        <input type="checkbox" class="ace" id="packagedGoods">
                        <span class="lbl display-inline">&nbsp;${i18n('packagedGoodsWillBeScanned')}</span>
                    </label>
                </div>
                </div>
                <div class="clearfix">
                  <div class="pull-right">
                    <button type="button" class="btn btn-purple" id="printButton">
                    <i class="fa fa-print"></i>&nbsp;${i18n('print')}</button>
                    <button type="button" class="btn btn-danger" id="cleanAllButton">${i18n('cleanAll')}</button>
                  </div>
                </div>
            </div>
            <div class="col-md-8 load-data">
              <div class="load-overlay" style="display:none" id="loadingOverlay">
                <div>
                  <i class="fa fa-5x fa-b1-loader blue"></i>
                </div>
              </div>
              <div class="item-list">
              <div class="alert alert-info alert-xs text-center">${i18n('noItemsScanned')}</div>
              <div class="alert-xs grey text-center">${i18n('help')}</div>
              </div>
            </div>
            </div>
        </div>
    </div>
    <div class="modal fade" id="searchByNameModal" tabindex="-1" role="dialog" aria-labelledby="searchByNameModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title inline" id="searchByNameModalLabel">${i18n('searchByName')}</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                        <div class="form-group">
                            <label for="nameInput">Name</label>
                            <input type="text" class="form-control" id="name" placeholder="${i18n('enterName')}">
                        </div>
                        <button type="button" class="btn btn-primary" id="searchNameButton">${i18n('search')}</button>
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">${i18n('done')}</button>
                    <div id="search-results" class="margin-top-10"></div>
                </div>
            </div>
        </div>
    </div>
    <div class="modal fade" id="itemDetails" tabindex="-1" role="dialog" aria-labelledby="itemDetailsLabel" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title inline" id="itemDetailsLabel">${i18n('itemDetails')}</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body" data></div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary btn-sm" data-dismiss="modal">${i18n('close')}</button>
      </div>
    </div>
  </div>
</div>
  `)
  }

  bindEvents (): void {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    document.getElementById('searchNameButton')?.addEventListener('click', this.searchByName.bind(this))
    document.getElementById('cleanAllButton')?.addEventListener('click', this.cleanAll.bind(this))
    document.getElementById('printButton')?.addEventListener('click', this.print.bind(this))

    const barcodeInput = document.getElementById('barcode') as HTMLInputElement
    if (barcodeInput != null) {
      barcodeInput.addEventListener('keypress', this.handleEnterPress(this.searchByBarcode.bind(this, barcodeInput)))
      document.getElementById('searchBarcodeButton')?.addEventListener('click', this.searchByBarcode.bind(this, barcodeInput))
      barcodeInput.focus()
      const modals = document.querySelectorAll('.modal')
      document.addEventListener('click', (event) => {
        let clickedInsideModal = false
        modals.forEach(modal => {
          if (modal.contains(event.target as Node)) {
            clickedInsideModal = true
          }
        })

        if (!clickedInsideModal) {
          barcodeInput.focus()
        }
      })
    }

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    document.getElementById('name')?.addEventListener('keypress', this.handleEnterPress(this.searchByName.bind(this)))

    this.bindCheckboxChange('alternativeLabelFormat', 'alternativeLabelFormat')
    this.bindCheckboxChange('sayOutLoud', 'sayOutLoud')
    this.bindCheckboxChange('packagedGoods', 'packagedGoods')
  }

  handleEnterPress (callback: () => void): (event: KeyboardEvent) => void {
    return (event) => {
      if (event.key == 'Enter') callback()
    }
  }

  changeBackgroundColor (color: string): (event: FocusEvent) => void {
    return (event) => {
      if (event.target instanceof HTMLInputElement) {
        event.target.style.backgroundColor = color
      }
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
    this.searchResultsElement = document.getElementById('search-results')
    this.nameInput = document.getElementById('name') as HTMLInputElement
    this.loadingIndicator = document.getElementById('loadingOverlay')
    this.infoModal = document.getElementById('itemDetails')
  }

  async showLoading (): Promise<void> {
    if (this.loadingIndicator != null) {
      this.loadingIndicator.style.display = 'flex'
    }
  }

  async hideLoading (): Promise<void> {
    if (this.loadingIndicator != null) {
      this.loadingIndicator.style.display = 'none'
    }
  }

  print (): void {
    this.items = this.items.filter(item => item)
    // if there are no items, show an alert
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
    this.itemList.innerHTML = `<div class="alert alert-info alert-xs text-center">${i18n('noItemsScanned')}</div>`
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

    const cornerButton = this.createCornerButton()
    cornerButton.addEventListener('click', () => { this.removeItem(itemElement, item.id) })
    itemElement.appendChild(cornerButton)
    itemElement.addEventListener('click', () => { this.showDetails(item) })

    if (item.barcode == null || item.isActive == false) itemElement.classList.add('inactive')
    if (item.weight != null) itemElement.classList.add('mark')

    return itemElement
  }

  getItemHtml (item: packagedItem): string {
    return `
      <div class="item-main">
        ${item.priceWithVat > 0 ? `<span class="item-price">${(item.finalPrice ?? item.priceWithVat).toFixed(2)}</span>` : ''}
        <span class="item-name">${item.name}</span>
      </div>
      <div class="item-labels">
        ${this.getItemLabelsHtml(item)}
      </div>
    `
  }

  getItemLabelsHtml (item: packagedItem): string {
    const labels = ['packageCode', 'weight', 'departmentNumber', 'packageQuantity'] as const
    const labelHtml = labels.map(label => item[label] != null ? `<span>${i18n(label)}: ${item[label]}</span>` : '').join('')
    return `${item.weight != null ? `<span>${i18n('kiloPrice')}: ${item.priceWithVat}</span>` : ''}
            ${item.measurementUnitName === 'kg' ? `<span>${i18n('weightedItem')}</span>` : ''}
            ${labelHtml}`
  }

  createCornerButton (): HTMLButtonElement {
    const button = document.createElement('button')
    button.className = 'btn btn-sm corner-button btn-yellow'
    button.type = 'button'
    const i = document.createElement('i')
    i.className = 'fa fa-trash'
    button.appendChild(i)
    return button
  }

  removeItem (element: HTMLElement, itemId?: string): void {
    element.remove()
    this.items = this.items.filter(item => item.id !== itemId)
  }

  showDetails (item: packagedItem): void {
    const clickCount = (item.clickCount ?? 0) + 1
    item.clickCount = clickCount
    // filter out the undefined or null values
    if (clickCount > 2) {
      item.clickCount = 0
      const filteredItem = Object.fromEntries(
        // is null or the string contains `id`
        Object.entries(item).filter(([key, value]) => value !== null && !key.toString().toLowerCase().includes('id') && !key.toString().includes('cost'))
      )
      const resultString = Object.entries(filteredItem)
        .map(([key, value]) => `<div class="row col-xs-12"><div class="col-sm-5">${key}:</div><div class="col-sm-7">${value}</div></div>`)
        .join('')

      if (this.infoModal != null) {
        const modalBody = this.infoModal.querySelector('.modal-body')
        if (modalBody != null) {
          modalBody.innerHTML = `<div class="container width-auto">${resultString}</div>`
        }
      }
      // show the modal by using jQuery
      $(this.infoModal).modal('show')
    }
  }

  addItemToView (item: packagedItem): void {
    const itemElement = this.createItemElement(item)
    if (this.itemList != null) {
      this.itemList.appendChild(itemElement)
      itemElement.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }

  newItem (item: packagedItem): void {
    // to enable distinguishing between duplicate items, we need to assign a unique id
    item.id = 'item-' + Math.random().toString(36).substring(7)
    if (item.priceWithVat == null) {
      console.error('priceWithVat is not defined')
      item.priceWithVat = 0
      item.isActive = false
    }
    if (this.items.length > 0 && (this.items[this.items.length - 1]).barcode == item.barcode) {
      void this.playAudio('Kaip ir sakiau, kaina yra ' + this.digitsToPrice(item.finalPrice ?? item.priceWithVat) + (item.weight !== undefined ? '. Svoris ' + this.numberToWords(item.weight) + ' g.' : '') + ' Tai ' + item.name)
    } else if (item.priceWithVat !== 0) {
      void this.playAudio('Kaina ' + this.digitsToPrice(item.finalPrice ?? item.priceWithVat))
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
    // if it is below 4kg or starts with 2, 3,
    return barcode.toString().length === 13 && parseInt(barcode.slice(0, 1)) < 4 && parseInt(barcode.slice(8, 12), 10) < 4000
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

    if (this.settings.packagedGoods) {
      void this.searchforAPackagedItem(barcode)
    } else {
      void this.searchItem(barcode)
    }
  }

  async searchByName (): Promise<void> {
    const name = this.nameInput?.value
    if (name == null || name.length == 0) {
      this.notification.error(i18n('missingName'))
      return
    }
    if ((this.nameInput == null) || (this.searchResultsElement == null)) {
      this.active = false // TODO: write a function to check if the interface consists of all the elements
      this.notification.error(i18n('missingElements'))
      return
    }
    this.nameInput.disabled = true
    this.notification.info(i18n('searchingFor') + ' ' + name)
    const items: item[] = await this.req.getItemsByName(name)
    if (this.searchResultsElement != null) {
      this.searchResultsElement.innerHTML = items.length > 0 ? `<div class="alert alert-info">${i18n('searchSuccessful')} "${name}". ${items.length} ${i18n('itemsFound')} <br>${i18n('clickToAdd')}</div>` : `<div class="alert alert-warning">${i18n('noItemsFound')} "${name}"</div>`
    }
    items.forEach(item => {
      if (this.searchResultsElement != null) {
        this.searchResultsElement.appendChild(this.createSearchResultItem(item))
      }
    })
    this.nameInput.disabled = false
    this.nameInput.value = ''
  }

  createSearchResultItem (item: item): HTMLElement {
    const newItem = document.createElement('div')
    newItem.className = 'item'
    newItem.innerHTML = `<span class="item-name">${item.name}</span><span class="item-price
            pull-right">${item.priceWithVat}</span>`
    newItem.addEventListener('click', () => {
      this.newItem(item)
      newItem.style.backgroundColor = '#b0d877'
    })
    return newItem
  }

  async searchforAPackagedItem (barcode: string): Promise<void> {
    let item = null
    const barcodePart = barcode.slice(0, 8)
    const weightPart = parseInt(barcode.slice(8, 12), 10) / 1000
    if (this.canItBePackaged(barcode)) {
      await this.showLoading()
      item = await this.req.getItem(barcodePart) as packagedItem
      await this.hideLoading()
    }
    if (item != null) {
      const totalPrice = item.priceWithVat * weightPart
      const totalFinalPrice = Math.round((totalPrice + Number.EPSILON) * 100) / 100

      item.weight = weightPart
      item.finalPrice = totalFinalPrice
      this.newItem(item)
    } else {
      void this.searchItem(barcode)
    }
  }

  async searchItem (barcode: string): Promise<void> {
    await this.showLoading()
    let item = await this.req.getItem(barcode) as item
    await this.hideLoading()
    if (item == null) {
      item = {
        name: i18n('itemNotFound') + ': ' + barcode,
        priceWithVat: 0,
        isActive: false,
        barcode
      }
      // skip adding to the list, only add to the view
      this.addItemToView(item)
    } else {
      this.newItem(item)
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

  changeDocumentTitle (): void {
    document.title = i18n('labelsAndPrices')
  }
}
