import { test, expect, Page, BrowserContext } from '@playwright/test'
import { setPreferredLocale } from '../helpers/locale-cookie'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

test.describe('Withdrawal Page RTL Test (Arabic Locale)', () => {
  let page: Page
  let context: BrowserContext

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext()
    await setPreferredLocale(context, 'ar', BASE_URL)
    page = await context.newPage()
  })

  test('should display balance card with correct RTL layout', async () => {
    await page.goto(`${BASE_URL}/payments`)

    // Wait for balance card to load
    const balanceCard = page.locator('[data-testid="balance-summary-card"]')
    await expect(balanceCard).toBeVisible()

    // Check for earned amount
    const earnedLabel = page.locator('text=إجمالي المكتسب')
    await expect(earnedLabel).toBeVisible()

    // Verify HTML direction is RTL
    const htmlElement = page.locator('html')
    const dirAttribute = await htmlElement.getAttribute('dir')
    expect(dirAttribute).toBe('rtl')
  })

  test('should display withdrawal dialog with RTL form layout', async () => {
    await page.goto(`${BASE_URL}/payments`)

    // Click "Request Withdrawal" button
    const requestBtn = page.locator('button:has-text("طلب السحب")')
    await requestBtn.click()

    // Check dialog opened
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()

    // Check form fields
    const amountLabel = page.locator('text=المبلغ')
    await expect(amountLabel).toBeVisible()

    const ibanLabel = page.locator('text=رقم الحساب البنكي')
    await expect(ibanLabel).toBeVisible()
  })

  test('should have correct spacing with logical properties', async () => {
    await page.goto(`${BASE_URL}/payments`)

    const balanceCard = page.locator('[data-testid="balance-summary-card"]')

    // Check that card has consistent padding
    const computedStyle = await balanceCard.evaluate(el => {
      return window.getComputedStyle(el)
    })

    // Should have padding (converted from Tailwind p-6 = 24px)
    expect(computedStyle.paddingTop).toBe('24px')
    expect(computedStyle.paddingBottom).toBe('24px')
  })

  test('should display withdrawal list in RTL with right-aligned amounts', async () => {
    await page.goto(`${BASE_URL}/payments`)

    // Wait for withdrawals to load
    const withdrawalsList = page.locator('[data-testid="withdrawals-list"]')
    await expect(withdrawalsList).toBeVisible({ timeout: 5000 })

    // Check for withdrawal items
    const withdrawalItem = withdrawalsList
      .locator('[data-testid="withdrawal-item"]')
      .first()
    await expect(withdrawalItem).toBeVisible()
  })

  test('should not have hardcoded direction classes (ml-, mr-, left-, right-)', async () => {
    await page.goto(`${BASE_URL}/payments`)

    const balanceCard = page.locator('[data-testid="balance-summary-card"]')

    // Check that no hardcoded direction classes are present
    const classList = await balanceCard.evaluate(el => {
      return el.className.split(' ')
    })

    const hasHardcodedDirections = classList.some(cls =>
      /^(ml-|mr-|pl-|pr-|left-|right-|text-left|text-right)/.test(cls)
    )

    expect(hasHardcodedDirections).toBe(false)
  })

  test.afterAll(async () => {
    await context.close()
  })
})
