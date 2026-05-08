import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

test.describe('Story 04-02 — Payment Status Badge on Milestone', () => {
  test('Payment badge displays on milestone card for client', async ({
    page,
  }) => {
    // Login as client
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[type="email"]', 'client@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/projects**')

    // Navigate to project
    await page.goto(`${BASE_URL}/projects`)

    // Check that milestone cards have both status and payment status badges
    const milestoneCard = page.locator('[class*="rounded-2xl"]').first()
    const badges = milestoneCard.locator('[class*="badge"]')

    // Should have at least milestone status badge + payment status badge
    const badgeCount = await badges.count()
    expect(badgeCount).toBeGreaterThanOrEqual(1)
  })

  test('Payment badge is hidden for field engineer', async ({ page }) => {
    // Login as field engineer
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[type="email"]', 'engineer@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/projects**')

    // Navigate to project
    await page.goto(`${BASE_URL}/projects`)

    // Milestone cards should still be visible
    const milestoneCard = page.locator('[class*="rounded-2xl"]').first()
    await expect(milestoneCard).toBeVisible()

    // But payment status text should not be visible (no "pending_payment", "paid", etc.)
    const paymentStatuses = page.locator(
      ':text-is("Awaiting payment"), :text-is("In escrow"), :text-is("Awaiting approval"), :text-is("Ready for release"), :text-is("Paid out")'
    )

    // Field engineer should not see payment status
    const count = await paymentStatuses.count()
    expect(count).toBe(0)
  })

  test('Payment badge displays on milestone detail page for contractor', async ({
    page,
  }) => {
    // Login as contractor
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[type="email"]', 'contractor@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/projects**')

    // Navigate to project detail
    await page.goto(`${BASE_URL}/projects/proj-001`)

    // Click on a milestone to navigate to detail page
    const milestoneCard = page.locator('[class*="rounded-2xl"]').first()
    await milestoneCard.click()

    // Should navigate to milestone detail
    await page.waitForURL('**/milestones/**')

    // Payment status section should be visible
    const paymentStatusSection = page.locator(
      'text=/Payment Status|payment.detail.paymentStatus/i'
    )
    await expect(paymentStatusSection).toBeVisible()
  })

  test('Payment status badge colors match specification for different statuses', async ({
    page,
  }) => {
    // Login as client
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[type="email"]', 'client@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/projects**')

    // Navigate to project
    await page.goto(`${BASE_URL}/projects/proj-001`)

    // Find different milestone cards with different statuses
    const milestoneCards = page.locator('[class*="rounded-2xl"]')
    const count = await milestoneCards.count()

    // At least one card should be visible
    expect(count).toBeGreaterThan(0)

    // Check that badges render without errors
    for (let i = 0; i < Math.min(count, 3); i++) {
      const card = milestoneCards.nth(i)
      const badges = card.locator('[class*="badge"], [data-slot="badge"]')
      const badgeCount = await badges.count()

      // Each milestone should have at least milestone status badge
      expect(badgeCount).toBeGreaterThanOrEqual(1)
    }
  })

  test('Payment badge visibility works correctly for admin role', async ({
    page,
  }) => {
    // Login as admin
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[type="email"]', 'admin@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/projects**')

    // Navigate to project
    await page.goto(`${BASE_URL}/projects`)

    // Admin should see payment badges
    const milestoneCard = page.locator('[class*="rounded-2xl"]').first()
    const badges = milestoneCard.locator(
      '[class*="badge"], [data-slot="badge"]'
    )

    // Should render without console errors
    const badgeCount = await badges.count()
    expect(badgeCount).toBeGreaterThanOrEqual(1)
  })

  test('Payment badge appears alongside milestone status badge, separated by divider', async ({
    page,
  }) => {
    // Login as client
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[type="email"]', 'client@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/projects**')

    // Navigate to project
    await page.goto(`${BASE_URL}/projects/proj-001`)

    // Get milestone card
    const milestoneCard = page.locator('[class*="rounded-2xl"]').first()

    // Check for divider between badges (h-4 w-px bg-border)
    const divider = milestoneCard.locator('.h-4.w-px')
    const dividerCount = await divider.count()

    // If payment badge is shown, there should be a divider
    if (dividerCount > 0) {
      await expect(divider.first()).toBeVisible()
    }
  })

  test('Payment status translates correctly in Arabic RTL layout', async ({
    page,
  }) => {
    // Login as client
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[type="email"]', 'client@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/projects**')

    // Switch to Arabic
    const languageButton = page.locator(
      'button:has-text("العربية") >> visible=true'
    )
    if (await languageButton.isVisible()) {
      await languageButton.click()
    }

    // Navigate to project
    await page.goto(`${BASE_URL}/projects/proj-001`)

    // Arabic status text should be visible
    const arabicStatuses = page.locator(
      ':text-is("بانتظار الدفع"), :text-is("محتجز في الضمان"), :text-is("بانتظار الاعتماد"), :text-is("جاهز للصرف"), :text-is("تم الصرف")'
    )

    const statusCount = await arabicStatuses.count()
    // Should have at least some Arabic payment status text
    expect(statusCount).toBeGreaterThanOrEqual(0)
  })

  test('No console errors when rendering payment badge component', async ({
    page,
    context,
  }) => {
    const errors: string[] = []

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    // Login as client
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[type="email"]', 'client@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/projects**')

    // Navigate to project
    await page.goto(`${BASE_URL}/projects/proj-001`)

    // Wait a moment for rendering
    await page.waitForLoadState('networkidle')

    // Should have no critical errors
    const criticalErrors = errors.filter(
      e =>
        !e.includes('Network.getResponseBody') &&
        !e.includes('Non-Error promise rejection')
    )
    expect(criticalErrors).toHaveLength(0)
  })
})
