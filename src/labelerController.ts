/* eslint-disable @typescript-eslint/no-unused-expressions */
import { i18n } from './services/i18n'
import { calculateTotalPrice } from './services/utilities'
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

export type labelType = 'normal' | 'half' | 'fridge' | 'barcodeOnly'

class LabelerController {
  private notification = new UINotification()
  private req = new Request(this.notification)
  private modalService = new ModalService()
  private textToVoice = new TextToVoice(this.notification)

  private modals: {
    weightLabel: WeightLabelModal
    details: ItemDetailsModal
  }

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
    void this.initializeScope().then(() => {
      this.$scope.$digest()
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
        sayOutLoud: true,
        showStock: false,
        type: 'normal',
      },
      tabs: true,
      companyName: UserSession.getCurrentCompany(),
      loading: false,
      barcode: null,
      printed: false,
      modals: this.modals,
      activeTab: 'recentlyModified',
      openMarkdowns: this.openMarkdowns.bind(this),
      openCatalog: this.openCatalog.bind(this),
      openFiles: this.openFiles.bind(this),
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
      showWeightModal: this.showWeightModal.bind(this),
      clearBarcodeInput: this.clearBarcodeInput.bind(this),
      getAgoText: this.getAgoText.bind(this),
      refreshCurrentTab: this.refreshCurrentTab.bind(this),
      changeActiveTab: this.changeActiveTab.bind(this),
      toggleTabs: this.toggleTabs.bind(this),
    })

    // Add watch for activeTab changes
    this.$scope.$watch('loading', (newValue: string, oldValue: string) => {
      if (newValue !== oldValue) {
        console.log('Active tab changed from', oldValue, 'to', newValue)
        void this.refreshCurrentTab()
      }
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

  private async searchBarcode(): Promise<void> {
    this.$scope.printed = false
    if (!this.$scope.barcode) {
      this.notification.error(i18n('missingBarcode'))
      return
    }
    const barcode = this.$scope.barcode.toString().trim()
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
      return barcode.slice(4, 17)
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
      this.saveSearchedItemLocally(item) // Printed or only searched item
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

  getAgoText(retrievedAt: Date): string {
    const now = new Date()
    if (retrievedAt) {
      const diff = Math.abs(now.getTime() - new Date(retrievedAt).getTime())
      const seconds = Math.floor(diff / 1000)
      if (seconds < 15) {
        return ''
      }
      return i18n('ago') + ' ' + seconds + ' ' + i18n('seconds')
    }
    return ''
  }

  private saveSearchedItemLocally(item: Item): void {
    const items = this.getRecentlySearchedItems()
    const existingItemIndex = items.findIndex((i: Item) => i.barcode === item.barcode)
    if (existingItemIndex !== -1) {
      items.splice(existingItemIndex, 1)
    }
    items.unshift(item)
    if (items.length > 10) {
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

  private async updateRecentItems(): Promise<void> {
    const items = await this.req.getRecentlyModifiedItems()
    this.$scope.items.recent = items
    this.$scope.$digest()
  }

  async refreshCurrentTab(): Promise<void> {
    if (this.$scope.activeTab === 'recentlyModifiedItems') {
      void this.updateRecentItems()
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
  
}

export { LabelerController }
