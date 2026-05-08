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
