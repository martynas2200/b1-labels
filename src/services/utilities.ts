export function calculateTotalPrice(
  priceWithVat: number,
  quantity: number,
): number {
  if (priceWithVat == null || quantity == null) {
    return 0
  }
  const totalPrice = priceWithVat * quantity
  return Math.round((totalPrice + Number.EPSILON) * 100) / 100
}

export function lettersToNumbers(barcode: string): string {
  return barcode
    .replace(/ą/g, '1')
    .replace(/č/g, '2')
    .replace(/ę/g, '3')
    .replace(/ė/g, '4')
    .replace(/į/g, '5')
    .replace(/š/g, '6')
    .replace(/ų/g, '7')
    .replace(/ū/g, '8')
    .replace(/ž/g, '9')
}
