import { i18n } from '../services/i18n'
import { calculateTotalPrice } from '../services/utilities'
import { PackagedItem } from '../types/item'
import { LabelGenerator } from '../labelGenerator'
import { UINotification } from '../services/notification'
import modalHTML from '../html/weightModal.html'
import { ModalService } from '../services/modal'
import { LabelerController } from '../labelerController'

export class WeightLabelModal {
  modalScope: {
    item: PackagedItem | null,
    weight: string,
    virtualKeyboardVisible: boolean,
    addButton: boolean,
    hideVirtualKeyboard: () => void,
    handleWeightChange: () => void,
    key: (input: string) => void,
    add: () => void,
    print: () => void,
    picker: (event: PointerEvent) => void,
    i18n: (key: string) => string,
  }
  constructor(
    private modalService: ModalService, 
    private notifier: UINotification,
    private controller?: LabelerController
  ) {
    this.modalScope =  {
      item: null,
      weight: '',
      virtualKeyboardVisible: this.controller !== undefined,
      addButton: this.controller !== undefined,
      hideVirtualKeyboard: this.hideVirtualKeyboard.bind(this),
      handleWeightChange: this.handleWeightChange.bind(this),
      key: this.key.bind(this),
      add: this.add.bind(this),
      print: this.print.bind(this),
      picker: this.showPicker.bind(this),
      i18n: i18n
    }
  }
    
  hideVirtualKeyboard(): void {
    this.modalScope.virtualKeyboardVisible = false
  }

  key(input: string): void {
    if (!this.modalScope.item) {
      return
    }
    if (input === 'd' && this.modalScope.item.weight) {
      this.modalScope.item.weight = parseInt(this.modalScope.item.weight.toString().slice(0, -1))
    } else if (input === 'c') {
      this.modalScope.item.weight = '' // clear the weight
    } else {
      this.modalScope.item.weight += input
    }

    this.modalScope.handleWeightChange()
  }

  show(item: PackagedItem): Promise<void> {
    if (!item || !item.name || !item.priceWithVat) {
      this.notifier.error(i18n('noData'))
      return Promise.reject()
    }

    this.setupModalItem(item)

    return this.modalService.showModal({
      template: modalHTML(i18n),
      scopeProperties: this.modalScope,
      size: 'md',
      windowClass: 'weight-label-modal',
    })

  }

  setupModalItem(item: PackagedItem): void {
    this.modalScope.item = {
      ...item,
      weight: '',
      addManufacturer: false,
      addPackageFee: true,
    }
  }

  getWeightItem(): PackagedItem | null {
    const item = { ...this.modalScope.item }

    if (!item || !item.weight) {
      this.notifier.error(i18n('missingWeight'))
      return null
    }
    item.weight = item.measurementUnitCanBeWeighed ? this.gToKg(parseFloat(item.weight.toString())) : parseFloat(item.weight.toString())
    if (item.weight > 9.999) {
      this.notifier.error(i18n('maxWeight'))
      return null
    }

    item.addManufacturer =
      !!item.addManufacturer && !!item.manufacturerName?.length

    return item
  }

  add(): void {
    if (this.controller !== undefined) {
      const item = this.getWeightItem()
      if (item) {
        void this.controller?.processItem(item, true)
      }
    }
  }

  print(): void {
    const item = this.getWeightItem()
    if (item) {
      this.notifier.success({
        title: i18n('printJobIsSent'),
        message: `${item.weight}${item.measurementUnitName}`,
      })
      new LabelGenerator([item])
    }
  }

  handleWeightChange(): void {
    if (!this.modalScope.item) {
      return
    }
    this.modalScope.item.totalPrice = calculateTotalPrice(
      this.modalScope.item.priceWithVat,
      this.modalScope.item.measurementUnitCanBeWeighed ? 
        this.gToKg(Number(this.modalScope.item.weight || 0)) : Number(this.modalScope.item.weight || 0),
    )
  }

  gToKg(weight: number): number {
    return weight / 1000
  }

  showPicker(event: PointerEvent): void {
    const target = event.target as HTMLInputElement
    if (target?.showPicker) {
      target.showPicker()
    }
  }
}
