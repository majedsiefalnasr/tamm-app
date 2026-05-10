/**
 * Persist active locale without URL prefixes (`strategy: no_prefix`).
 * Server reads the same cookie via `i18n/localeDetector.ts`.
 */

const LOCALE_COOKIE = 'i18n_locale'
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365

function isSupportedLocale(
  value: string | null | undefined
): value is 'ar' | 'en' {
  return value === 'ar' || value === 'en'
}

function readRawLocaleCookie(): 'ar' | 'en' | null {
  if (!import.meta.client) {
    return null
  }
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE}=([^;]+)`)
  )
  if (!match?.[1]) {
    return null
  }
  const value = decodeURIComponent(match[1])
  return isSupportedLocale(value) ? value : null
}

function writeLocaleCookie(value: 'ar' | 'en'): void {
  if (!import.meta.client) {
    return
  }
  document.cookie = `${LOCALE_COOKIE}=${encodeURIComponent(value)}; Path=/; Max-Age=${ONE_YEAR_IN_SECONDS}; SameSite=Lax`
}

export default defineNuxtPlugin({
  name: 'i18n-locale-cookie-sync',
  enforce: 'post',
  dependsOn: ['i18n:plugin'],
  setup(nuxtApp) {
    if (!import.meta.client) {
      return
    }

    const i18n = nuxtApp.$i18n
    const cookieLocale = readRawLocaleCookie()

    if (cookieLocale && i18n.locale.value !== cookieLocale) {
      void i18n.setLocale(cookieLocale)
    }

    watch(
      () => i18n.locale.value,
      locale => {
        if (isSupportedLocale(locale)) {
          writeLocaleCookie(locale)
        }
      },
      { immediate: true }
    )
  },
})
