/* eslint-disable @typescript-eslint/no-unused-expressions */
import { i18n } from './services/i18n'
import { calculateTotalPrice, getFriendlyTime, isItRecent } from './services/utilities'
import { type Item, type PackagedItem } from './types/item'
import { ItemDetailsModal } from './modals/ItemDetailsModal'
import { LabelGenerator } from './labelGenerator'
import { ModalService } from './services/modal'
import { Request } from './services/request'
import { TextToVoice } from './services/textToVoice'
import { UINotification } from './services/notification'
import { WeightLabelModal } from './modals/weightLabelModal'
import { ReferenceBookItemsModal } from './modals/referenceBookItemsModal'
import { LabelTypeModal } from './modals/labelTypeModal'
import { TempFileListModal } from './modals/tempFileListModal'
import { MarkdownModal } from './modals/markdownModal'
import { UserSession } from './userSession'
import { DeviceClient, DeviceType } from './deviceClient'
import ConfigModal from './modals/configModal'

declare let GM: any

export type labelType = 'normal' | 'half' | 'fridge' | 'barcodeOnly'
export interface Draft {
  items: Item[],
  date: string,
  title?: string,
}

class LabelerController {
  private notification = new UINotification()
  private req = new Request(this.notification)
  private modalService = new ModalService()
  private textToVoice = new TextToVoice(this.notification)
  private modals: {
    weightLabel: WeightLabelModal
    details: ItemDetailsModal
  }
  private config: Partial<Record<DeviceType, string>> = {}
  private deviceClient: DeviceClient | undefined = undefined

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private $scope: any) {
    const weightLabelModal = new WeightLabelModal(this.modalService, this.notification, this)
    this.modals = {
      weightLabel: weightLabelModal,
      details: new ItemDetailsModal(
        this.modalService,
        this.notification,
        this.req,
        weightLabelModal
      ),
      
    }
  }
  async $onInit(): Promise<void> {
    const barcode = await GM.getValue('devices.barcode', "")
    const scales = await GM.getValue('devices.scales', "")
    const printer = await GM.getValue('devices.printer', "")

    this.config = {
      barcode,
      scales,
      printer
    }
    this.deviceClient = new DeviceClient(this.config, this.notification)
    void this.initializeScope().then(() => {
      this.$scope.$digest()
    })
    
    // Connect to barcode device and send ACTIVE message
    this.deviceClient.connectAndSend('barcode', 'ACTIVE').catch((err) => {
      console.error('Error connecting to barcode device or sending ACTIVE:', err)
    })

    // onblur send INACTIVE to barcode device
    // onfocus send ACTIVE to barcode device
    window.addEventListener('blur', () => {
      this.deviceClient?.sendToDevice('barcode', 'INACTIVE').catch((err) => {
        console.error('Error sending INACTIVE to barcode device:', err)
      })
    })
    window.addEventListener('focus', () => {
      this.deviceClient?.sendToDevice('barcode', 'ACTIVE').catch((err) => {
        console.error('Error sending ACTIVE to barcode device:', err)
      })
    })
    // send inactive before closing the window
    window.addEventListener('beforeunload', () => {
      this.deviceClient?.sendToDevice('barcode', 'INACTIVE').catch((err) => {
        console.error('Error sending INACTIVE to barcode device:', err)
      })
    })

    // subscribe to device status changes
    this.deviceClient.on('barcode', (code: string | number) => {
      const clean = code.toString().replace(/[\x00-\x1F\x7F]/g, '').replace(/[^0-9]/g, '')
      if (document.hasFocus()) {
        void this.searchBarcode(clean)
      }
    })
    //on any message from device, log it
    this.deviceClient.on('message', (deviceType: DeviceType, message: string) => {
      console.log(`Device ${deviceType} message:`, message)
    })
    // Listen for connection events
    this.deviceClient.on('connected', (deviceType: DeviceType) => {
      console.log(`Device ${deviceType} connected`)
      this.notification.success(`${deviceType} device connected`)
    })
    this.deviceClient.on('disconnected', (deviceType: DeviceType) => {
      console.log(`Device ${deviceType} disconnected`)
      this.notification.info(`${deviceType} device disconnected`)
    })
    this.deviceClient.on('error', (deviceType: DeviceType, error: Error) => {
      console.error(`Device ${deviceType} error:`, error)
      this.notification.error(`${deviceType} device error: ${error}`)
    })
  }

  private async initializeScope(): Promise<void> {
    Object.assign(this.$scope, {
      items: {
        grid: [] as Item[],
        recent: await this.req.getRecentlyModifiedItems(),
        searched: this.getRecentlySearchedItems(),
      },
      settings: {
        sayOutLoud: JSON.parse(localStorage.getItem('sayOutLoud') ?? 'true'),
        showStock: JSON.parse(localStorage.getItem('showStock') ?? 'false'),
        type: 'normal',
      },
      drafts: JSON.parse(localStorage.getItem('drafts') ?? '[]') as Item[][],
      tabs: true,
      companyName: UserSession.getCurrentCompany(),
      loading: false,
      barcode: null,
      printed: false,
      draft: false,
      currentDraft: null,
      modals: this.modals,
      activeTab: 'recentlyModified',
      scanner:  this.deviceClient?.status.barcode.connected || this.config.barcode === '',
      openMarkdowns: this.openMarkdowns.bind(this),
      openCatalog: this.openCatalog.bind(this),
      openFiles: this.openFiles.bind(this),
      logout: this.logout.bind(this),
      openTypeModal: this.openTypeModal.bind(this),
      searchBarcode: this.searchBarcode.bind(this),
      print: this.print.bind(this),
      cleanAll: this.cleanAll.bind(this),
      handleEnterPress: this.handleEnterPress.bind(this),
      removeItem: this.removeItem.bind(this),
      showDetails: this.showDetails.bind(this),
      quickPriceChange: (item: Item) => {
        void this.req.quickPriceChange(item)
      },
      getPricePerUnit: LabelGenerator.getPricePerUnit,
      getFriendlyTime: getFriendlyTime.bind(this),
      isItRecent: isItRecent.bind(this),
      showWeightModal: this.showWeightModal.bind(this),
      clearBarcodeInput: this.clearBarcodeInput.bind(this),
      refreshCurrentTab: this.refreshCurrentTab.bind(this),
      changeActiveTab: this.changeActiveTab.bind(this),
      toggleTabs: this.toggleTabs.bind(this),
      getTotalPrice: this.getTotalPrice.bind(this),
      saveDraft: this.saveDraft.bind(this),
      deleteDraft: this.deleteDraft.bind(this),
      showDraftBarcode: this.showDraftBarcode.bind(this),
      loadDraft: this.loadDraft.bind(this),
      changeQuantity: this.changeQuantity.bind(this),
    })
  }

  private openMarkdowns(): void {
    const markdownsModal = new MarkdownModal(this.req)
    void markdownsModal.show()
  }

  private openCatalog(): void {
    const referenceBookItemsModal = new ReferenceBookItemsModal(
      this.modalService,
      this.notification,
      this.modals.weightLabel,
      this
    )
    void referenceBookItemsModal.show().then(() => {
      this.$scope.$digest()
    })
  }

  private openFiles(): void {
    const filesModal = new TempFileListModal(this.modalService)
    void filesModal.show()
  }

  private logout(): void {
    //open config modal
    const configModal = new ConfigModal(this.modalService)
    void configModal.show()
  }

  private openTypeModal(): void {
    const typeModal = new LabelTypeModal(this.$scope.settings.type)
    typeModal.open().then((type: labelType) => {
      this.setType(type)
    }).catch(() => {
      this.notification.error(i18n('modalClosed'))
    })
  }
  getType(): Promise<labelType> {
    const type = this.$scope.settings.type
    if (type === undefined) {
      return new LabelTypeModal().open()
    }
    return type
  }

  setType(type: labelType): void {
    this.$scope.settings.type = type
    this.$scope.$digest()
  }

  private async searchBarcode(code?: string): Promise<void> {
    this.$scope.printed = false
    if (!this.$scope.barcode && !code) {
      this.notification.error(i18n('missingBarcode'))
      return
    }
    const barcode = ((code != undefined) ? code : this.$scope.barcode).toString().trim()
    this.clearBarcodeInput()
    this.canItBePackaged(barcode)
      ? await this.searchforAPackagedItem(barcode)
      : await this.searchItem(barcode)
  }

  private canItBePackaged(barcode: string): boolean {
    const prefix = parseInt(barcode.slice(0, 2), 10)
    return (
      (barcode.length === 13 || barcode.length === 21) &&
      prefix > 20 &&
      prefix < 30
    )
  }

  private async searchItem(barcode: string): Promise<void> {
    this.$scope.loading = true
    const item = (await this.req.getItem(barcode)) as Item
    item ? await this.processItem(item) : this.notFound(barcode)
    this.$scope.loading = false
    this.$scope.$digest()
  }

  private async searchforAPackagedItem(barcode: string): Promise<void> {
    const barcodePart = this.extractBarcodePart(barcode)
    this.$scope.loading = true
    const item = (await this.req.getItem(barcodePart)) as PackagedItem
    this.$scope.loading = false
    item
      ? await this.processPackagedItem(item, barcode)
      : this.notFound(barcode)
    this.$scope.$digest()
  }

  private extractBarcodePart(barcode: string): string {
    if (
      barcode.length === 13 &&
      ['23', '24'].includes(barcode.slice(0, 2))
    ) {
      return barcode.slice(0, 8)
    } else if (
      barcode.length === 13 &&
      ['25', '29'].includes(barcode.slice(0, 2))
    ) {
      return barcode.slice(0, 7)
    } else if (barcode.length === 21) {
      return barcode.slice(4, 17).replace(/^0+/, '')
    }
    return barcode
  }

  private async processPackagedItem(
    item: PackagedItem,
    barcode: string,
  ): Promise<void> {
    item.weight = this.calculateWeight(barcode)
    item.totalPrice = calculateTotalPrice(item.priceWithVat, item.weight)
    await this.processItem(item)
  }

  private calculateWeight(barcode: string): number {
    const weightPart =
      barcode.length > 13 ? barcode.slice(17, 21) : barcode.slice(8, 12)
    return parseInt(weightPart, 10) / 1000
  }

  async processItem(
    item: PackagedItem,
    silence: boolean = false,
  ): Promise<void> {
    this.handleNotifications(item, silence)
    this.$scope.items.grid.push(item)
    this.scrollToLastItem()
    if (!item.weight) {
      void this.saveSearchedItemLocally(item) // Printed or only searched item
    }
  }

  private handleNotifications(item: PackagedItem, silence: boolean): void {
    if (silence) {
      this.notification.success({
        title: i18n('itemAdded'),
        message: item.name,
        delay: 2000,
      })
    } else if (!this.$scope.settings.sayOutLoud) {
      return
    } else if (!item.isActive && item.priceWithVat > 0) {
      void this.textToVoice.speak(i18n('itemNotActive'))
    } else if (this.$scope.settings.showStock && item.stock != null) {
      void this.textToVoice.speak(item.stock.toString())
    } else if (this.isDuplicateItem(item)) {
      void this.textToVoice.speak(this.getDuplicateItemMessage(item))
    } else if (item.priceWithVat > 0) {
      void this.textToVoice.speak(
        i18n('price') +
        ' ' +
        this.textToVoice.digitsToPrice(item.totalPrice ?? item.priceWithVat),
      )
    } else {
      void this.textToVoice.speak(i18n('priceNotSet'))
    }
  }

  private isDuplicateItem(item: PackagedItem): boolean {
    const lastItem = this.$scope.items.grid[this.$scope.items.grid.length - 1]
    return (
      lastItem &&
      lastItem.barcode === item.barcode &&
      'weight' in lastItem &&
      'weight' in item &&
      lastItem.weight === item.weight
    )
  }

  private getDuplicateItemMessage(item: PackagedItem): string {
    return (
      i18n('asMentioned') +
      ', ' +
      i18n('price') +
      ' ' +
      this.textToVoice.digitsToPrice(item.totalPrice ?? item.priceWithVat) +
      (item.weight !== undefined
        ? '. ' +
        i18n('weight') +
        this.textToVoice.numberToWords(parseFloat(item.weight.toString())) +
        item.measurementUnitName
        : '') +
      ' ' +
      i18n('thisIs') +
      ' ' +
      item.name
    )
  }

  private scrollToLastItem(): void {
    setTimeout(() => {
      const itemElements = document.querySelectorAll('.item-list .item')
      const lastItem = itemElements[itemElements.length - 1] as HTMLElement
      lastItem?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, 0)
  }

  private notFound(barcode: string): void {
    const item: Item = {
      name: `${i18n('itemNotFound')} (${i18n('barcode')}: ${barcode})`,
      barcode,
      isActive: false,
    } as Item
    this.$scope.items.grid.push(item)
    this.notification.error(`Item not found: ${barcode}`)
  }

  private print(items: Item[] = this.$scope.items.grid.filter((item: Item) => item)): void {
    if (items.length === 0) {
      this.notification.error(i18n('noData'))
      return
    }
    const labelGenerator = new LabelGenerator(items, this.$scope.settings.type)
    if (labelGenerator.success) {
      this.cleanAll()
      this.$scope.printed = true
    }
  }

  private cleanAll(): void {
    this.$scope.items.grid = []
  }

  private async handleEnterPress(event: KeyboardEvent): Promise<void> {
    if (event.key === 'Enter') {
      await this.searchBarcode()
    }
  }

  private removeItem(index: number): void {
    this.$scope.items.grid.splice(index, 1)
  }

  private showDetails(item: Item): void {
    void this.modals.details.show(item)
  }

  private showWeightModal(i: Item): void {
    void this.modals.weightLabel.show(i).then(() => {
      this.$scope.$digest()
    })
  }

  private clearBarcodeInput(): void {
    this.$scope.barcode = null
  }

  getAgoText(retrievedAt: Date): string | null {
    const now = new Date()
    if (retrievedAt) {
      const diff = Math.abs(now.getTime() - new Date(retrievedAt).getTime())
      const seconds = Math.floor(diff / 1000)
      if (seconds < 15) {
        return null
      }
      return i18n('ago') + ' ' + seconds + ' ' + i18n('seconds')
    }
    return null
  }

  private saveSearchedItemLocally(item: Item): void {
    const items = this.getRecentlySearchedItems()
    const existingItemIndex = items.findIndex((i: Item) => i.barcode === item.barcode)
    if (existingItemIndex !== -1) {
      items.splice(existingItemIndex, 1)
    }
    item.printedAt = new Date().toISOString()
    // remove the unnecessary properties
    items.unshift(item)
    if (items.length > 50) {
      items.pop()
    }
    localStorage.setItem('items', JSON.stringify(items))
    this.$scope.items.searched = items
  }

  private getRecentlySearchedItems(): Item[] {
    const items = JSON.parse(localStorage.getItem('items') ?? '[]') as Item[]
    return items
  }

  private getRecentlySearchedItemIds(): string[] {
    const items = this.getRecentlySearchedItems()
    const itemIds = items.map((item: Item) => item.id)
    return itemIds
  }
  private async updateSearchedItems(): Promise<void> {
    const itemIds = this.getRecentlySearchedItemIds()
    const items = await this.req.getItemsByIds(itemIds)
    localStorage.setItem('items', JSON.stringify(items))
    this.$scope.items.searched = items
    this.$scope.$digest()
  }

  private async updateRecentItems(forced = false): Promise<void> {
    const items = await this.req.getRecentlyModifiedItems(forced)
    this.$scope.items.recent = items
    this.$scope.$digest()
  }

  async refreshCurrentTab(): Promise<void> {
    if (this.$scope.activeTab === 'recentlyModified') {
      void this.updateRecentItems(true)
    } else {
      void this.updateSearchedItems()
    }
  }

  changeActiveTab(tab: string): void {
    this.$scope.activeTab = tab
  }

  toggleTabs(): void {
    this.$scope.tabs = !this.$scope.tabs
  }

  private changeQuantity(index: number): void {
    const item = this.$scope.items.grid[index]
    if (!item || !item.priceWithVat) {
      this.notification.error(i18n('noData'))
      return
    }
    //use simple prompt to change the quantity
    const newQuantity = prompt(i18n('changeQuantity'), item.weight?.toString() || '1')
    if (newQuantity !== null) {
      const quantity = parseFloat(newQuantity)
      if (isNaN(quantity) || quantity <= 0) {
        this.notification.error(i18n('invalidQuantity'))
        return
      }
      item.weight = quantity
      item.totalPrice = calculateTotalPrice(item.priceWithVat, quantity)
      this.$scope.items.grid[index] = item
      this.notification.success({
        title: i18n('quantityChanged'),
        message: `${item.name} - ${quantity} ${item.measurementUnitName}`,
      })
    }
  }

  private getTotalPrice(items?: Item[]): number {
    return (items ?? this.$scope.items.grid).reduce(
      (acc: number, item: Item) =>
        acc + (item?.totalPrice ?? item.priceWithVat) +
        // TODO: ideally fetch the item, and use its price
        (item.packageCode ? item.packageQuantity * 0.1 : 0),
      0,
    )
  }

  private saveDraft(): void {
    if (this.$scope.items.grid.length === 0) {
      this.notification.error(i18n('noItems'))
      return
    }
    const draftItems = this.$scope.items.grid.map((item: Item) => ({
      ...item,
    }))
    const newDraft: Draft = {
      items: draftItems,
      date: new Date().toISOString(),
      title: (this.$scope.currentDraft == null) ? prompt(i18n('enterDraftTitle')) : this.$scope.drafts[this.$scope.currentDraft].title,
    }
    if (this.$scope.currentDraft != null && this.$scope.currentDraft >= 0) {
      this.$scope.drafts[this.$scope.currentDraft] = newDraft // update existing draft
    } else {
      this.$scope.drafts.push(newDraft)
    }
    localStorage.setItem('drafts', JSON.stringify(this.$scope.drafts))
    if (this.$scope.drafts.length > 50) {
      this.$scope.drafts.splice(0, this.$scope.drafts.length - 50) // keep only the last 50
    }
    this.$scope.items.grid = []
    this.notification.success(i18n('draftSaved'))
  }

  private deleteDraft(): void {
    if (!window.confirm(i18n('confirmDeleteDraft'))) {
      return
    }
    const index = this.$scope.currentDraft
    if (index < 0 || index >= this.$scope.drafts.length) {
      this.notification.error(i18n('invalidDraftIndex'))
      return
    }
    this.$scope.drafts.splice(index, 1)
    localStorage.setItem('drafts', JSON.stringify(this.$scope.drafts))
    this.notification.success(i18n('draftDeleted'))
    this.$scope.items.grid = []
    this.$scope.currentDraft = null
  }

  private showDraftBarcode(): void {
    // currently, draft items are printed as normal items
    if (this.$scope.items.grid.length === 0) {
      this.notification.error(i18n('noItems'))
      return
    }
    // show datamatrix code for draft items
    const labelGenerator = new LabelGenerator()
    const barcodeString = labelGenerator.createPackageBarcode(this.$scope.items.grid)
    // show the datamatrix code in a modal
    const dm = labelGenerator.createDMDiv(barcodeString, true).outerHTML
    void this.modalService.showModal({
      template: `<div class="modal-content" uib-modal-transclude="">
      <div class="modal-header">
        <h3 class="modal-title inline">${i18n('draft')}</h3>
        <button type="button" class="close" aria-label="Close" ng-click="closeModal()">
          <span aria-hidden="true">×</span>
        </button>
      </div>
      <div class="modal-body">
        <div class="datamatrix-code">
          <div style="white-space: pre-wrap;">${barcodeString}</div>
          <div class="margin-10">${dm}</div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-sm" ng-click="closeModal()">${i18n('close')}</button>
      </div>
    </div>`,
      scopeProperties: {
        closeModal: () => {
          this.modalService.modalInstance?.close()
        },
        // printBarcode: (dm: string) => {
        //   this.printBarcode(dm)
        //   this.modalService.modalInstance?.close()
        // },
      },
      size: 'md',
    })
  }

  private loadDraft(index: number): void {
    if (index < 0 || index >= this.$scope.drafts.length) {
      this.notification.error(i18n('invalidDraftIndex'))
      return
    }
    const draft = this.$scope.drafts[index]
    if (!draft || !draft.items || draft.items.length === 0) {
      this.notification.error(i18n('draftIsEmpty'))
      return
    }
    this.$scope.items.grid = draft.items.map((item: Item) => ({
      ...item,
      printedAt: new Date().toISOString(),
      retrievedAt: new Date().toISOString(),
    }))
    this.$scope.currentDraft = index
  }
}
export { LabelerController }
