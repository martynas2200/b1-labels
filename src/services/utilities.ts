import { i18n } from './i18n'

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

export function getFriendlyTime(lastChanged: string): string | null {
  if (!lastChanged) {
    return null
  }
  const now = new Date()
  const changedDate = new Date(lastChanged)
  const diffMs = now.getTime() - changedDate.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffMs / (1000 * 60))

  if (diffDays > 60) {
    return null
  } else if (diffDays > 30) {
    return i18n('oneMonthAgo')
  } else if (diffDays > 21) {
    return i18n('threeWeeksAgo')
  } else if (diffDays > 14) {
    return i18n('twoWeeksAgo')
  } else if (diffDays > 1) {
    return i18n('daysAgo', [diffDays.toString()])
  } else if (diffDays === 1) {
    return i18n('yesterday')
  } else if (diffHours >= 1) {
    return i18n('hoursAgo', [diffHours.toString()])
  } else {
    return i18n('minutesAgo', [diffMinutes.toString()])
  }
}

export function isItRecent(lastChanged: string): boolean {
  const now = new Date()
  const changedDate = new Date(lastChanged)
  const diffMs = now.getTime() - changedDate.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  return diffDays < 1
}
