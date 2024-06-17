interface item {
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
  measurementUnitName: string
  name: string
  packageCode: string
  packageQuantity: number
  priceWithVat: number
  stock: number
};

interface packagedItem extends item {
  addDescription?: boolean
  addManufacturer?: boolean
  batchNumber?: string
  expiryDate?: string
  totalPrice?: number
  weight?: number
};

export type { item, packagedItem }
