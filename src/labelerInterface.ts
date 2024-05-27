import { i18n, lettersToNumbers } from './i18n'
import { Request } from './request.js'
import { LabelGenerator } from './labelGenerator'
import { type item, type packagedItem } from './item'

export class LabelerInterface {
  req: Request
  items: item[]
  active: boolean
  settings: { alternativeLabelFormat: boolean, sayOutLoud: boolean, packagedGoods: boolean }
  searchResultsElement: HTMLElement | null = null
  nameInput: HTMLInputElement | null = null
  itemList: HTMLElement | null = null
  constructor () {
    this.req = new Request()
    this.items = []
    this.active = false
    this.settings = {
      alternativeLabelFormat: false,
      sayOutLoud: true,
      packagedGoods: false
    }
  }

  public isActive (): boolean {
    this.active = (document.querySelector('.look-up-container') !== null)
    return this.active
  }

  public init (): boolean {
    if (this.isActive()) {
      return true
    }
    const mainPage = document.querySelector('.main-container')
    const navbarShortcuts = document.querySelector('.navbar-shortcuts')
    const footer = document.querySelector('.footer')
    if ((mainPage == null) || (navbarShortcuts == null) || (footer == null)) {
      return false
    }

    navbarShortcuts.remove()
    footer.remove()

    document.querySelectorAll('.dropdown-menu li').forEach((li, index) => {
      if (index < 9) {
        (li as HTMLElement).style.display = 'none'
      }
    })

    mainPage.insertAdjacentHTML('beforebegin', `
        <style>
        .form-section {
            padding: 10px;
            border: 1px solid #ddd;
            margin-top: 10px;
            // background-color: #eee;
        }
        span.item-price {
            font-weight: bold;
            background: var(--theme-blue--dark-bg);
            color: white;
            padding: 2px 8px;
            margin-right: 4px;
        }
        .item-list {
            padding: 10px;
            max-height: calc(100vh - 60px);
            overflow: auto;
        }
        .item {
            font-size: 1.1em;
            border: 1px solid #ddd;
            padding: 10px;
            margin-bottom: 10px;
            cursor: pointer;
            position: relative;
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
            border: none;
            margin: 5px;
        }
        .modal-body .form-group {
            margin-bottom: 1rem;
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
                <div class="pull-right">
                <button type="button" class="btn btn-purple" id="printButton">
                <i class="fa fa-print"></i>&nbsp;${i18n('print')}</button>
                <button type="button" class="btn btn-danger" id="cleanAllButton">${i18n('cleanAll')}</button>
                </div>
            </div>
            
            <div class="col-md-8 item-list">
                <!-- Items will be dynamically added here -->
            </div>
        </div>
    </div>
    
    <!-- Modal for Search by Name -->
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
                    <!-- Items will be dynamically added here -->
                    <div id="search-results" class="margin-top-10"></div>
                </div>
            </div>
        </div>
    </div>
        `)

    mainPage.remove()

    document.getElementById('searchBarcodeButton')?.addEventListener('click', this.searchByBarcode.bind(this))
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    document.getElementById('searchNameButton')?.addEventListener('click', this.searchByName.bind(this))
    document.getElementById('cleanAllButton')?.addEventListener('click', this.cleanAll.bind(this))
    // TODO: double-check if this is the correct way to handle the modal

    // bind a function to the input field, so then the user presses enter, the search will be triggered
    document.getElementById('barcode')?.addEventListener('keypress', (event) => {
      if (event.key == 'Enter') {
        this.searchByBarcode()
      }
    })
    // when out of focus -> background color white
    // otherwise -> background color light green
    document.getElementById('barcode')?.addEventListener('focus', (event) => {
      if (event.target instanceof HTMLInputElement) {
        event.target.style.backgroundColor = '#b0d877'
      }
    })
    document.getElementById('barcode')?.addEventListener('blur', (event) => {
      if (event.target instanceof HTMLInputElement) {
        event.target.style.backgroundColor = 'white'
      }
    })
    document.getElementById('name')?.addEventListener('keypress', (event) => {
      if (event.key == 'Enter') {
        void this.searchByName()
      }
    })
    document.getElementById('alternativeLabelFormat')?.addEventListener('change', (event) => {
      if (event.target instanceof HTMLInputElement) {
        this.settings.alternativeLabelFormat = event.target.checked
      }
    })
    document.getElementById('sayOutLoud')?.addEventListener('change', (event) => {
      if (event.target instanceof HTMLInputElement) {
        this.settings.sayOutLoud = event.target.checked
      }
    })
    document.getElementById('packagedGoods')?.addEventListener('change', (event) => {
      if (event.target instanceof HTMLInputElement) {
        this.settings.packagedGoods = event.target.checked
      }
    })
    document.getElementById('printButton')?.addEventListener('click', this.print.bind(this))
    this.itemList = document.querySelector('.item-list')
    this.searchResultsElement = document.getElementById('search-results')
    this.nameInput = document.getElementById('name') as HTMLInputElement
    return true
  }

  print (): void {
    this.items = this.items.filter(item => item)
    void new LabelGenerator(this.items, this.settings.alternativeLabelFormat)
  }

  cleanAll (): void {
    this.items = []
    if (this.itemList == null) {
      console.error('itemList is not defined')
      return
    }
    this.itemList.innerHTML = ''
  }

  async getAudioUrl (text: string): Promise<string | undefined> {
    const apiKey = localStorage.getItem('apiKey')
    if (apiKey == null) {
      return
    }
    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
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
    const newItem = document.createElement('div')
    newItem.className = 'item'
    newItem.id = item.id ?? ''
    const itemMain = document.createElement('div')
    itemMain.className = 'item-main'
    if (item.priceWithVat != 0) {
      const itemPrice = document.createElement('span')
      itemPrice.className = 'item-price'
      itemPrice.textContent = (item.finalPrice ?? item.priceWithVat).toString()
      itemMain.appendChild(itemPrice)
    }
    const itemName = document.createElement('span')
    itemName.className = 'item-name'
    itemName.textContent = item.name
    itemMain.appendChild(itemName)
    newItem.appendChild(itemMain)
    const itemLabels = document.createElement('div')
    itemLabels.className = 'item-labels'
    type PackagedItemKey = 'packageCode' | 'weight' | 'departmentNumber' | 'packageQuantity'
    const labels: PackagedItemKey[] = ['packageCode', 'weight', 'departmentNumber', 'packageQuantity']
    if (item.weight != null) {
      const span = document.createElement('span')
      span.textContent = i18n('kiloPrice') + ': ' + item.priceWithVat
      itemLabels.appendChild(span)
    } else if (item.measurementUnitName === 'kg') {
      const span = document.createElement('span')
      span.textContent = i18n('weightedItem')
      itemLabels.appendChild(span)
    }
    for (const label of labels) {
      // get the property of the item
      if (item[label] != null) {
        const span = document.createElement('span')
        span.textContent = i18n(label) + ': ' + item[label]
        itemLabels.appendChild(span)
      }
    }

    newItem.appendChild(itemLabels)
    const cornerButton = document.createElement('button')
    cornerButton.className = 'btn btn-sm corner-button btn-yellow'
    cornerButton.type = 'button'
    const i = document.createElement('i')
    i.className = 'fa fa-fw fa-trash'
    cornerButton.addEventListener('click', () => {
      newItem.remove()
      // eslint-disable-next-line eqeqeq
      this.items = this.items.filter(i => i.id != item.id)
    })
    cornerButton.appendChild(i)
    newItem.appendChild(cornerButton)

    if (item.barcode == '' || item.isActive == false) {
      newItem.classList.add('background-light-red')
    } if (item.weight != null) {
      newItem.classList.add('mark')
    }
    return newItem
  }

  addItemToView (item: packagedItem): void {
    if (this.itemList == null) {
      console.error('itemList is not defined')
      return
    }
    const newItem = this.createItemElement(item)
    item.id = item.id !== '' ? item.id : Math.random().toString(36).substring(7)
    this.itemList.appendChild(newItem)
    newItem.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }

  newItem (item: packagedItem): void {
    // if it is not the in the list we could add it
    if (item.priceWithVat == null) {
      console.error('priceWithVat is not defined')
      item.priceWithVat = 0
      item.isActive = false
    }
    if (this.items.length > 0 && (this.items[this.items.length - 1]).barcode == item.barcode) {
      void this.playAudio('Kaip ir sakiau, kaina yra ' + this.digitsToPrice(item.finalPrice ?? item.priceWithVat) + (item.weight !== undefined ? '. Svoris ' + this.numberToWords(item.weight) + ' g.' : '') + ' Tai ' + item.name)
    } else {
      this.items.push(item)
      if (item.priceWithVat !== 0) {
        void this.playAudio('Kaina ' + this.digitsToPrice(item.finalPrice ?? item.priceWithVat))
      } else {
        void this.playAudio('Kaina nėra nustatyta')
      }
    }
    this.addItemToView(item)
  }

  async playAudio (text: string): Promise<void> {
    if (!this.settings.sayOutLoud) {
      return
    }
    if (localStorage.getItem('apiKey') == null) {
      console.error('apiKey is not defined')
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
    // if it is above 4kg or zero weight, it is not a packaged item
    return barcode.length === 13 && barcode.slice(8, 12) !== '0000' && parseInt(barcode.slice(8, 12), 10) < 4000
  }

  searchByBarcode (): void {
    const inputField = document.getElementById('barcode') as HTMLInputElement
    if (inputField.value == null) {
      console.error('inputField.value is not defined')
      return
    }
    const barcode = lettersToNumbers(inputField.value)
    inputField.value = ''
    inputField.focus()
    if (barcode.toLowerCase() === 'stop') {
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
    if (name == null) {
      alert(i18n('missingName'))
      return
    }
    if ((this.nameInput == null) || (this.searchResultsElement == null)) {
      this.active = false
      alert(i18n('error'))
      return
    }
    this.nameInput.disabled = true
    const items: item[] = await this.req.getItemsByName(name)
    if (items.length === 0) {
      this.searchResultsElement.innerHTML = `<div class="alert alert-warning">${i18n('noItemsFound')} "${name}"</div>`
    } else {
      this.searchResultsElement.innerHTML = `<div class="alert alert-info">${i18n('searchSuccessful')} "${name}". ${items.length} ${i18n('itemsFound')} <br>${i18n('clickToAdd')}</div>`
      items.forEach(item => {
        const newItem = document.createElement('div')
        newItem.className = 'item'
        // newItem.textContent = item.name + ' ' + item.priceWithVat;
        newItem.innerHTML = `<span class="item-name">${item.name}</span><span class="item-price
                pull-right">${item.priceWithVat}</span>`
        newItem.addEventListener('click', () => {
          this.newItem(item)
          newItem.style.backgroundColor = '#b0d877'
        })
        if (this.searchResultsElement != null) {
          this.searchResultsElement.appendChild(newItem)
        } else {
          console.error('searchResultsElement is not defined')
        }
      })
    }
    this.nameInput.disabled = false
    this.nameInput.value = ''
  }

  async searchforAPackagedItem (barcode: string): Promise<void> {
    let item = null
    const barcodePart = barcode.slice(0, 8)
    const weightPart = parseInt(barcode.slice(8, 12), 10) / 1000
    if (this.canItBePackaged(barcode)) {
      item = await this.req.getItem(barcodePart) as packagedItem
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
    let item = await this.req.getItem(barcode) as item
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
      button.addEventListener('click', this.init.bind(this))
      navbarShortcuts.appendChild(button)
    }
    return navbarShortcuts != null
  }
}
