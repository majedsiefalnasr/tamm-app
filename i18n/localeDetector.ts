import { defineI18nLocaleDetector } from '#imports'
import { getCookie } from 'h3'

/** Must match `i18n-locale-cookie.client.ts` and Playwright helpers. */
const LOCALE_COOKIE = 'i18n_locale'

export default defineI18nLocaleDetector((event, config) => {
  const code = getCookie(event, LOCALE_COOKIE)
  if (code === 'ar' || code === 'en') {
    return code
  }
  return config.defaultLocale
})
