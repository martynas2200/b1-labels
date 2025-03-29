export interface Item {
  attributeId: number;
  barcode: string;
  code: string;
  departmentNumber: number;
  description: string;
  id: string;
  isActive: boolean;
  isRefundable: boolean;
  leftover: number;
  manufacturerName: string;
  measurementUnitCanBeWeighed: boolean;
  measurementUnitId: number;
  measurementUnitName: string;
  name: string;
  packageCode: string;
  packageQuantity: number;
  priceWithoutVat: number;
  priceWithVat: number;
  retrievedAt?: Date;
  stock: number;
  vatRate?: number;
}

export interface PackagedItem extends Item {
  addPackageFee?: boolean;
  addManufacturer?: boolean;
  expiryDate?: string;
  totalPrice?: number;
  weight?: number | string;
}
