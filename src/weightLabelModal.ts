import { i18n } from './i18n'
import { packagedItem } from './item'
import { LabelGenerator } from './labelGenerator'
import { LabelerInterface } from './labelerInterface'
import { NotificationService } from './ui-notification'
import modalHTML from './html/weightModal.html'
import type * as ng from 'angular'

declare const angular: ng.IAngularStatic

export class WeightLabelModal {
  notifier: NotificationService
  interface: LabelerInterface
  $uibModal: any
  modalScope: any

  constructor(
    notifier: NotificationService,
    labelerInterface: LabelerInterface,
  ) {
    this.notifier = notifier
    this.interface = labelerInterface

    const injector = angular.element(document.body).injector()
    const $rootScope = injector.get('$rootScope')
    this.$uibModal = injector.get('$uibModal')
    
    this.modalScope = Object.assign($rootScope.$new(true), {
      item: null,
      weight: '',
      virtualKeyboardVisible: true,
      hideVirtualKeyboard: this.hideVirtualKeyboard.bind(this),
      handleWeightChange: this.handleWeightChange.bind(this),
      key: this.key.bind(this),
      add: this.add.bind(this),
      print: this.print.bind(this),
      picker: this.showPicker.bind(this),
    })
  }
    
  hideVirtualKeyboard(): void {
    this.modalScope.virtualKeyboardVisible = false
  }

  key(input: string): void {
    if (input === 'd') {
      this.modalScope.item.weight = this.modalScope.item.weight.slice(0, -1)
    } else if (input === 'c') {
      this.modalScope.item.weight = ''
    } else {
      this.modalScope.item.weight += input
    }

    this.modalScope.handleWeightChange()
  }

  openWeightModal(item: packagedItem): void {
    if (!item || !item.name || !item.priceWithVat) {
      this.notifier.error(i18n('noData'))
      return
    }

    this.setupModalItem(item)

    const modalInstance = this.$uibModal.open({
      template: modalHTML(i18n),
      scope: this.modalScope,
      windowClass: 'weight-label-modal',
    })

    this.modalScope.close = () => {
      modalInstance.close()
    }
  }

  setupModalItem(item: packagedItem): void {
    this.modalScope.item = {
      ...item,
      weight: '',
      addManufacturer: false,
      addPackageFee: true,
    }
    this.modalScope.packageWeight = 0
  }

  getWeightItem(): packagedItem | null {
    const item = { ...this.modalScope.item }

    if (!item || !item.weight || isNaN(item.weight)) {
      this.notifier.error(i18n('missingWeight'))
      return null
    }
    item.weight = this.gToKg(parseFloat(item.weight))
    if (item.weight > 9.999) {
      this.notifier.error(i18n('maxWeight'))
      return null
    }

    item.addManufacturer =
      !!item.addManufacturer && !!item.manufacturerName?.length

    return item
  }

  add(): void {
    const item = this.getWeightItem()
    if (item) {
      this.interface.proccessItem(item, true)
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
    this.modalScope.item.totalPrice = this.interface.calculateTotalPrice(
      this.modalScope.item.priceWithVat,
      this.gToKg(this.modalScope.item.weight),
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
