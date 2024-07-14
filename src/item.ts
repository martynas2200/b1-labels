import { i18n } from "./i18n"
import { Request } from "./request"

interface item {
  attributeId: number
  barcode: string
  code: string
  departmentNumber: number
  description: string
  id: string
  isActive: boolean
  isRefundable: boolean
  leftover: number
  manufacturerName: string
  measurementUnitCanBeWeighed: boolean
  measurementUnitId: number
  measurementUnitName: string
  name: string
  packageCode: string
  packageQuantity: number
  priceWithoutVat: number
  priceWithVat: number
  retrievedAt?: Date
  stock: number
};

interface packagedItem extends item {
  addPackageFeeNote?: boolean
  addManufacturer?: boolean
  batchNumber?: string
  expiryDate?: string
  totalPrice?: number
  weight?: number
};

export type { item, packagedItem }

declare let $: any

export class newItem {
  private req: Request
  barcode: string | null
  priceWithVat: number = 0
  priceWithoutVat: number = 0
  packageQuantity: number = 0
  private modal: {
    nameInput: HTMLInputElement
    price: HTMLInputElement
    barcode: HTMLInputElement
    packages: HTMLInputElement
    canBeWeighed: HTMLInputElement
    alcohol: HTMLInputElement
    saveButton: HTMLButtonElement
  }
  constructor(r: Request) {
    this.req = r
    this.barcode = null
    this.modal = {
      nameInput: document.querySelector('#newItemName') as HTMLInputElement,
      barcode: document.querySelector('#newItemBarcode') as HTMLInputElement,
      price: document.querySelector('#newItemPrice') as HTMLInputElement,
      packages: document.querySelector('#newItemPackageQuantity') as HTMLInputElement,
      canBeWeighed: document.querySelector('#newItemCanBeWeighed') as HTMLInputElement,
      alcohol: document.querySelector('#newItemAlcohol') as HTMLInputElement,
      saveButton: document.querySelector('#saveNewItem') as HTMLButtonElement
    }
    this.bindEvents()
  }

  private bindEvents(): void {
    this.modal.saveButton.addEventListener('click', this.save.bind(this))
  }

  calculatePriceWithoutVat(): number {
    const priceWithoutVat = this.priceWithVat / 1.21
    return Math.round((priceWithoutVat + Number.EPSILON) * 10000) / 10000
  }

  openModal(item: item): void {
    if (item.id != null) {
      // this.notification.error(i18n('itemAlreadyExists'))
      return;
    }
    this.barcode = item.barcode
    this.modal.barcode.value = item.barcode
    this.modal.nameInput.value = ''
    this.modal.price.value = ''
    this.modal.packages.value = '0'
    this.modal.canBeWeighed.checked = false
    this.modal.alcohol.checked = false
    $('#newItemModal').modal('show')
  }

  save(): void {
    // get all values from the modal
    if (this.barcode == null) {
      // this.notification.error(i18n('barcodeNotFound'))
      return
    }
    let item = new Object() as item
    item.name = (this.modal.nameInput.value.length > 2) ? this.modal.nameInput.value : i18n('newItem') + ' ' + this.barcode
    this.priceWithVat = parseFloat(this.modal.price.value.replace(',', '.'))
    if (this.priceWithVat > 0) {
      item.priceWithVat = this.priceWithVat
      item.priceWithoutVat = this.calculatePriceWithoutVat()
    }
    this.packageQuantity = parseInt(this.modal.packages.value)
    if (this.packageQuantity > 0) {
      item.packageQuantity = this.packageQuantity
      item.packageCode = '1100'
    }
    if (this.modal.alcohol.checked) {
      item.departmentNumber = 2
    }
    if (this.modal.canBeWeighed.checked) {
      item.measurementUnitId = 6
    } else {
      item.measurementUnitId = 3
    }
    item.isActive = true
    item.attributeId = 1
    item.barcode = this.barcode
    item.description = i18n('itemAdded') + ' ' + new Date().toLocaleString()

    if (this.modal.alcohol.checked) {
      item.departmentNumber = 2
    }
    console.info(item)
    //close the modal
    $('#newItemModal').modal('hide')
    void this.req.createItem(item)
  }

}