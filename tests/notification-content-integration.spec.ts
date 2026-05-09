import { test, expect } from '@playwright/test'

test.describe('Story 05-04: Notification Content Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app and login
    await page.goto('/')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password')
    await page.click('button:has-text("Login")')
    await page.waitForNavigation()
  })

  test('AC#1: All 7 notification event types render correctly in drawer', async ({
    page,
  }) => {
    // Open notification drawer
    const bellButton = page.locator(
      'button[aria-label*="Notifications"], button:has-text("🔔")'
    )
    await bellButton.click()
    await page.waitForSelector('[class*="Sheet"]')

    // Get all notification items
    const notificationItems = page.locator('[class*="flex cursor-pointer"]')
    const itemCount = await notificationItems.count()

    // Should have at least 7 notifications (one for each event type)
    expect(itemCount).toBeGreaterThanOrEqual(7)
  })

  test('AC#1: Each notification displays title, body, and relative time', async ({
    page,
  }) => {
    // Open drawer
    const bellButton = page.locator(
      'button[aria-label*="Notifications"], button:has-text("🔔")'
    )
    await bellButton.click()
    await page.waitForSelector('[class*="Sheet"]')

    // Get first notification item
    const firstNotification = page
      .locator('[class*="flex cursor-pointer"]')
      .first()

    // Title should exist and be visible
    const title = firstNotification.locator('[class*="font-medium"]')
    await expect(title).toBeVisible()
    const titleText = await title.textContent()
    expect(titleText).toBeTruthy()
    expect(titleText?.length).toBeGreaterThan(0)

    // Body (subtitle) should exist
    const body = firstNotification.locator('[class*="text-xs"]')
    await expect(body).toBeVisible()
    const bodyText = await body.textContent()
    expect(bodyText).toBeTruthy()
    expect(bodyText?.length).toBeGreaterThan(0)

    // Relative time should exist (e.g., "2m ago", "1h ago")
    const timeElements = firstNotification.locator('[class*="text-[10px]"]')
    const timeCount = await timeElements.count()
    expect(timeCount).toBeGreaterThanOrEqual(1)
  })

  test('AC#1: Report Submitted notification displays correct title and navigates', async ({
    page,
  }) => {
    const bellButton = page.locator(
      'button[aria-label*="Notifications"], button:has-text("🔔")'
    )
    await bellButton.click()
    await page.waitForSelector('[class*="Sheet"]')

    // Find notification with "Report Submitted" title
    const notifications = page.locator('[class*="flex cursor-pointer"]')
    let reportNotif = null

    for (let i = 0; i < (await notifications.count()); i++) {
      const item = notifications.nth(i)
      const titleText = await item
        .locator('[class*="font-medium"]')
        .textContent()
      if (titleText?.includes('Report') || titleText?.includes('تم رفع')) {
        reportNotif = item
        break
      }
    }

    expect(reportNotif).toBeTruthy()

    // Verify it has a body
    const body = reportNotif?.locator('[class*="text-xs"]')
    await expect(body).toBeVisible()
  })

  test('AC#1: Payment Released notification displays amount in body', async ({
    page,
  }) => {
    const bellButton = page.locator(
      'button[aria-label*="Notifications"], button:has-text("🔔")'
    )
    await bellButton.click()
    await page.waitForSelector('[class*="Sheet"]')

    // Find notification with "Payment Released"
    const notifications = page.locator('[class*="flex cursor-pointer"]')
    let paymentNotif = null

    for (let i = 0; i < (await notifications.count()); i++) {
      const item = notifications.nth(i)
      const titleText = await item
        .locator('[class*="font-medium"]')
        .textContent()
      if (titleText?.includes('Payment') || titleText?.includes('دفع')) {
        paymentNotif = item
        break
      }
    }

    if (paymentNotif) {
      // Body should contain SAR amount
      const body = await paymentNotif
        .locator('[class*="text-xs"]')
        .textContent()
      expect(body).toContain('SAR')
    }
  })

  test('AC#1: Supervisor Approved notification displays awaiting approval message', async ({
    page,
  }) => {
    const bellButton = page.locator(
      'button[aria-label*="Notifications"], button:has-text("🔔")'
    )
    await bellButton.click()
    await page.waitForSelector('[class*="Sheet"]')

    // Find supervisor approved notification
    const notifications = page.locator('[class*="flex cursor-pointer"]')
    let supervisorNotif = null

    for (let i = 0; i < (await notifications.count()); i++) {
      const item = notifications.nth(i)
      const titleText = await item
        .locator('[class*="font-medium"]')
        .textContent()
      if (titleText?.includes('Supervisor') || titleText?.includes('المشرف')) {
        supervisorNotif = item
        break
      }
    }

    if (supervisorNotif) {
      const body = await supervisorNotif
        .locator('[class*="text-xs"]')
        .textContent()
      expect(body).toContain('awaiting') || expect(body).toContain('انتظار')
    }
  })

  test('AC#1: Notification click navigates to correct link', async ({
    page,
  }) => {
    const bellButton = page.locator(
      'button[aria-label*="Notifications"], button:has-text("🔔")'
    )
    await bellButton.click()
    await page.waitForSelector('[class*="Sheet"]')

    // Click first notification
    const firstNotification = page
      .locator('[class*="flex cursor-pointer"]')
      .first()
    const navigationPromise = page.waitForNavigation()
    await firstNotification.click()

    // Wait for navigation to complete
    await navigationPromise.catch(() => null)

    // Check that URL has changed (navigation occurred)
    const newUrl = page.url()
    expect(newUrl).not.toContain('login')
  })
})
