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
  vatRate?: number
}

interface packagedItem extends item {
  addPackageFeeNote?: boolean
  addManufacturer?: boolean
  batchNumber?: string
  expiryDate?: string
  totalPrice?: number
  weight?: number
}

export type { item, packagedItem }