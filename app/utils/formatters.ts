import { useI18n } from 'vue-i18n'

export const formatCurrency = (amount: number, currency = 'EGP'): string => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '0'
  }

  const { locale } = useI18n()

  try {
    return new Intl.NumberFormat(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return amount.toString()
  }
}

export const formatDate = (isoDate: string): string => {
  if (!isoDate) return ''

  const { locale } = useI18n()

  try {
    return new Intl.DateTimeFormat(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(isoDate))
  } catch {
    return isoDate
  }
}

export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return date.toLocaleDateString()
}

export const maskIban = (iban: string): string => {
  if (!iban || iban.length < 4) return iban
  return `****${iban.slice(-4)}`
}
