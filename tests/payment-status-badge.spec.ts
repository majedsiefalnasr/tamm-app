import { test, expect } from '@playwright/test'
import { setPreferredLocale } from './helpers/locale-cookie'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

interface TestUser {
  email: string
  password: string
  role: string
}

const TEST_USERS: Record<string, TestUser> = {
  client: {
    email: 'client@example.com',
    password: 'password123',
    role: 'client',
  },
  contractor: {
    email: 'contractor@example.com',
    password: 'password123',
    role: 'contractor',
  },
  admin: { email: 'admin@example.com', password: 'password123', role: 'admin' },
  field_engineer: {
    email: 'engineer@example.com',
    password: 'password123',
    role: 'field_engineer',
  },
  supervisor_engineer: {
    email: 'supervisor@example.com',
    password: 'password123',
    role: 'supervisor_engineer',
  },
}

async function loginAs(page: typeof test.page, role: string) {
  const user = TEST_USERS[role]
  if (!user) throw new Error(`Unknown role: ${role}`)

  await page.goto(`${BASE_URL}/login`)
  await page.fill('input[type="email"]', user.email)
  await page.fill('input[type="password"]', user.password)
  await page.click('button[type="submit"]')
  await page.waitForURL('**/dashboard**')
}

test.describe('Story 04-02 — Payment Status Badge on Milestone', () => {
  test('Payment badge displays on milestone card for client', async ({
    page,
  }) => {
    await loginAs(page, 'client')
    await page.goto(`${BASE_URL}/projects`)

    const paymentBadge = page
      .locator('[data-testid="payment-status-badge"]')
      .first()
    await expect(paymentBadge).toBeVisible()
  })

  test('Payment badge is hidden for field engineer', async ({ page }) => {
    await loginAs(page, 'field_engineer')
    await page.goto(`${BASE_URL}/projects`)

    const paymentBadges = page.locator('[data-testid="payment-status-badge"]')
    expect(await paymentBadges.count()).toBe(0)
  })

  test('Payment badge is hidden for supervisor engineer', async ({ page }) => {
    await loginAs(page, 'supervisor_engineer')
    await page.goto(`${BASE_URL}/projects`)

    const paymentBadges = page.locator('[data-testid="payment-status-badge"]')
    expect(await paymentBadges.count()).toBe(0)
  })

  test('Payment badge displays on milestone detail page for contractor', async ({
    page,
  }) => {
    await loginAs(page, 'contractor')
    await page.goto(`${BASE_URL}/projects/proj-001`)

    const milestoneCard = page.locator('[class*="rounded-2xl"]').first()
    await milestoneCard.click()
    await page.waitForURL('**/milestones/**')

    const paymentBadge = page.locator('[data-testid="payment-status-badge"]')
    await expect(paymentBadge).toBeVisible()
  })

  test('Payment status badge displays correct status from derived value', async ({
    page,
  }) => {
    await loginAs(page, 'client')
    await page.goto(`${BASE_URL}/projects`)

    const paymentBadge = page
      .locator('[data-testid="payment-status-badge"]')
      .first()
    const statusAttribute = await paymentBadge
      .locator('badge')
      .getAttribute('data-status')

    expect([
      'pending_payment',
      'paid',
      'awaiting_approval',
      'ready_for_payout',
      'paid_out',
    ]).toContain(statusAttribute)
  })

  test('Payment badge visibility works correctly for admin role', async ({
    page,
  }) => {
    await loginAs(page, 'admin')
    await page.goto(`${BASE_URL}/projects`)

    const paymentBadges = page.locator('[data-testid="payment-status-badge"]')
    expect(await paymentBadges.count()).toBeGreaterThan(0)
  })

  test('Divider renders between milestone and payment status badges', async ({
    page,
  }) => {
    await loginAs(page, 'client')
    await page.goto(`${BASE_URL}/projects`)

    const paymentBadge = page
      .locator('[data-testid="payment-status-badge"]')
      .first()
    const divider = paymentBadge.locator('.h-4.w-px')

    await expect(divider).toBeVisible()
  })

  test('Payment status renders correctly in English (LTR)', async ({
    page,
    context,
  }) => {
    await setPreferredLocale(context, 'en', BASE_URL)
    await loginAs(page, 'client')

    await page.goto(`${BASE_URL}/projects`)

    const paymentBadge = page
      .locator('[data-testid="payment-status-badge"]')
      .first()
    const badgeText = await paymentBadge.textContent()

    const validEnglishLabels = [
      'Awaiting payment',
      'In escrow',
      'Awaiting approval',
      'Ready for release',
      'Paid out',
    ]
    expect(validEnglishLabels.some(label => badgeText?.includes(label))).toBe(
      true
    )
  })

  test('Payment status renders correctly in Arabic (RTL)', async ({
    page,
    context,
  }) => {
    await setPreferredLocale(context, 'ar', BASE_URL)
    await loginAs(page, 'client')

    await page.goto(`${BASE_URL}/projects`)

    const paymentBadge = page
      .locator('[data-testid="payment-status-badge"]')
      .first()
    const badgeText = await paymentBadge.textContent()

    const validArabicLabels = [
      'بانتظار الدفع',
      'محتجز في الضمان',
      'بانتظار الاعتماد',
      'جاهز للصرف',
      'تم الصرف',
    ]
    expect(validArabicLabels.some(label => badgeText?.includes(label))).toBe(
      true
    )
  })

  test('No console errors when rendering payment badge component', async ({
    page,
  }) => {
    const errors: string[] = []

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await loginAs(page, 'client')
    await page.goto(`${BASE_URL}/projects/proj-001`)
    await page.waitForLoadState('networkidle')

    const criticalErrors = errors.filter(
      e =>
        !e.includes('Network.getResponseBody') &&
        !e.includes('Non-Error promise rejection')
    )
    expect(criticalErrors).toHaveLength(0)
  })

  test('showIfHidden prop does not expose badge to unauthorized roles', async ({
    page,
  }) => {
    await loginAs(page, 'field_engineer')
    await page.goto(`${BASE_URL}/projects`)

    const paymentBadges = page.locator('[data-testid="payment-status-badge"]')
    expect(await paymentBadges.count()).toBe(0)
  })
})
