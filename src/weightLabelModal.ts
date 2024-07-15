import { i18n } from "./i18n"
import { packagedItem } from "./item"
import { LabelGenerator } from "./labelGenerator"
import { LabelerInterface } from "./labelerInterface"
import { NotificationService } from "./ui-notification"

declare const $: any

export class WeightLabelModal {
  addManufacturer = document.getElementById('addManufacturer') as HTMLInputElement
  addPackageFeeNote = document.getElementById('addPackageFeeNote') as HTMLInputElement
  addButton = document.getElementById('addWeightedItem') as HTMLButtonElement
  batchNumber = document.getElementById('batchNumber') as HTMLInputElement
  expiryDate = document.getElementById('expiryDate') as HTMLInputElement
  kgPrice = document.getElementById('kgPrice') as HTMLInputElement
  manufacturerField = document.getElementById('manufacturerField')
  parent = document.getElementById('weightLabelModal')
  printButton = document.getElementById('printWeightLabel') as HTMLButtonElement
  productName = document.getElementById('productName') as HTMLInputElement
  productWeight = document.getElementById('productWeight') as HTMLInputElement
  totalPrice = document.getElementById('totalPrice') as HTMLInputElement
  keyboard = document.getElementById('keyboard')
  toggleButton = document.getElementById('toggleKeyboard') as HTMLButtonElement
  keys = document.querySelectorAll('.key');
  private activeInput: HTMLInputElement | null = this.productWeight
  private currentItem: null | packagedItem = null
  private readonly notifier: NotificationService
  private readonly interface: LabelerInterface
  constructor(notifier: NotificationService, ui: LabelerInterface) {
    this.notifier = notifier
    this.interface = ui
    this.bindEvents()
  }

  private bindEvents(): void {
    this.addButton.addEventListener('click', this.add.bind(this))
    this.printButton.addEventListener('click', this.print.bind(this))
    this.productWeight.addEventListener('keypress', this.interface.handleEnterPress(() => { this.add() }))
    this.productWeight.addEventListener('input', this.handleWeightChange.bind(this))
    this.toggleButton.addEventListener('click', this.toggleKeyboard.bind(this))
    const fields = [this.productWeight, this.batchNumber];
    fields.forEach(field => {
      field.addEventListener('click', () => {
        this.activeInput = field;
      });
    });
    this.keys.forEach(key => {
      key.addEventListener('click', () => {
        const keyValue = key.getAttribute('data-key');
        if (this.activeInput == null && keyValue == null) {
          this.notifier.error(i18n('noActiveInput'));
          return
          // TODO: unnecessary null checks (linter...)
        } else if (this.activeInput != null && keyValue == 'del' && this.activeInput?.value.length > 0) {
          this.activeInput.value = this.activeInput.value.slice(0, -1);
        } else if (this.activeInput != null) {
          this.activeInput.value += keyValue;
        }
        this.handleWeightChange();
      });
    });
  }

  public openWeightModal(item: packagedItem): void {
    if (item == null || this.productWeight == null || this.kgPrice == null || this.expiryDate == null || this.addManufacturer == null || this.manufacturerField == null) {
      this.notifier.error(i18n('missingElements'))
      return
    }
    this.currentItem = JSON.parse(JSON.stringify(item))
    this.productName.value = item.name
    this.kgPrice.value = item.priceWithVat.toString()
    this.expiryDate.min = new Date().toISOString().split('T')[0]
    this.expiryDate.value = ''
    this.addManufacturer.style.display = item.manufacturerName != null ? 'block' : 'none'
    this.manufacturerField.innerHTML = item.manufacturerName ?? ''
    $(this.parent).modal('show')
    this.productWeight.focus()
  }

  public getWeightItem(): packagedItem | null {
    if (this.currentItem?.weight == null || isNaN(this.currentItem.weight)) {
      this.notifier.error(i18n('missingWeight'))
      return null
    } else if (this.currentItem?.weight > 9.999) {
      this.notifier.error(i18n('maxWeight'))
      return null
    }
    this.currentItem.expiryDate = (this.expiryDate?.value != null && this.expiryDate.value.length > 0) ? this.expiryDate.value.slice(5) : undefined
    this.currentItem.batchNumber = (this.batchNumber?.value != null && this.batchNumber.value.length > 0) ? this.batchNumber.value : undefined
    this.currentItem.addManufacturer = this.addManufacturer?.checked && this.currentItem.manufacturerName != null
    this.currentItem.addPackageFeeNote = this.addPackageFeeNote?.checked
    this.notifier.info({
      title: i18n('weightedItemAdded'),
      message: this.currentItem.weight + this.currentItem.measurementUnitName
    })
    // copy current item to a new object, so that the original object is not modified
    this.currentItem = JSON.parse(JSON.stringify(this.currentItem))

    return this.currentItem
  }

  private add(): void {
    const item = this.getWeightItem()
    if (item != null) {
      this.interface.proccessItem(item)
    }
  }

  private print(): void {
    const item = this.getWeightItem()
    if (item != null) {
      void new LabelGenerator([item], this.interface.settings.alternativeLabelFormat)
    }
  }
  debounce(func: Function, wait: number): Function {
    let timeout: any
    return (...args: any) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
  private handleWeightChange(): void {
    if (this.currentItem == null) {
      return
    }
    this.currentItem.weight = (this.productWeight?.value != null) ? parseInt(this.productWeight.value) / 1000 : 0
    this.currentItem.totalPrice = this.interface.calculateTotalPrice(this.currentItem)
    if (this.totalPrice != null) {
      this.totalPrice.value = this.currentItem.totalPrice.toFixed(2)
    }
  }

  private toggleKeyboard(): void {
    if (this.keyboard != null) {
      this.keyboard.classList.toggle('hidden')
    }
    if (this.productWeight != null) {
      this.productWeight.focus()
    }
  }

}