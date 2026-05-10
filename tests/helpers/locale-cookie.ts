import type { BrowserContext } from '@playwright/test'

const DEFAULT_BASE = process.env.BASE_URL || 'http://localhost:3000'

/** Cookie name must match `i18n/localeDetector.ts` and `i18n-locale-cookie.client.ts`. */
export const I18N_LOCALE_COOKIE = 'i18n_locale'

export async function setPreferredLocale(
  context: BrowserContext,
  locale: 'en' | 'ar',
  baseUrl = DEFAULT_BASE
): Promise<void> {
  const { hostname } = new URL(baseUrl)
  await context.addCookies([
    {
      name: I18N_LOCALE_COOKIE,
      value: locale,
      domain: hostname,
      path: '/',
    },
  ])
}
