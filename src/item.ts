interface item {
  id?: string
  name: string
  barcode?: string
  priceWithVat: number
  code?: string
  departmentNumber?: number
  isActive?: boolean
  packageCode?: string
  packageQuantity?: number
  measurementUnitName?: string
  clickCount?: number
};

interface packagedItem extends item {
  finalPrice?: number
  weight?: number
};

export type { item, packagedItem }
