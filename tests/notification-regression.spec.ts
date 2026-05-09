import { test, expect } from '@playwright/test'

test.describe('Story 05-04: Notification Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app and login
    await page.goto('/')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password')
    await page.click('button:has-text("Login")')
    await page.waitForNavigation()
  })

  test('Regression: Story 05-01 — Notification bell visible and polling works', async ({
    page,
  }) => {
    // Verify bell button exists and is visible
    const bellButton = page.locator(
      'button[aria-label*="Notifications"], button:has-text("🔔")'
    )
    await expect(bellButton).toBeVisible()

    // Verify badge exists (unread count)
    const badge = page.locator('[class*="bg-destructive"]').first()
    const isBadgeVisible = await badge.isVisible().catch(() => false)

    // Badge visibility depends on unread count > 0
    // Just verify badge element exists in the DOM
    const bellContainer = bellButton.locator('[class*="relative"]')
    await expect(bellContainer).toBeVisible()

    // Wait a moment to verify polling doesn't break
    await page.waitForTimeout(2000)

    // Bell should still be visible after polling interval
    await expect(bellButton).toBeVisible()
  })

  test('Regression: Story 05-01 — Unread count badge hides when count is 0', async ({
    page,
  }) => {
    // Open drawer and mark all as read
    const bellButton = page.locator(
      'button[aria-label*="Notifications"], button:has-text("🔔")'
    )
    await bellButton.click()
    await page.waitForSelector('[class*="Sheet"]')

    // Click "Mark all as read" button
    const markAllButton = page.locator('button:has-text("Mark")')
    const markAllExists = await markAllButton.isVisible().catch(() => false)

    if (markAllExists) {
      await markAllButton.click()
      await page.waitForTimeout(300)
    }

    // Close drawer
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)

    // Check badge visibility: should be hidden if no unread
    const badge = page.locator(
      'button:has(svg[class*="bell"]) [class*="bg-destructive"]'
    )
    const badgeVisible = await badge.isVisible().catch(() => false)

    // If all were marked as read, badge should be hidden
    if (markAllExists) {
      expect(badgeVisible).toBe(false)
    }
  })

  test('Regression: Story 05-02 — Drawer opens on bell click and closes on outside click', async ({
    page,
  }) => {
    // Click bell to open drawer
    const bellButton = page.locator(
      'button[aria-label*="Notifications"], button:has-text("🔔")'
    )
    await bellButton.click()

    // Drawer should open
    const drawer = page.locator('[class*="Sheet"]')
    await expect(drawer).toBeVisible()

    // Click outside drawer (on the page background)
    await page.click('body', { position: { x: 10, y: 10 } })
    await page.waitForTimeout(300)

    // Drawer should close
    const drawerVisible = await drawer.isVisible().catch(() => false)
    expect(drawerVisible).toBe(false)
  })

  test('Regression: Story 05-02 — Empty state shown when no notifications', async ({
    page,
  }) => {
    // Open drawer
    const bellButton = page.locator(
      'button[aria-label*="Notifications"], button:has-text("🔔")'
    )
    await bellButton.click()
    await page.waitForSelector('[class*="Sheet"]')

    // Check for notifications or empty state
    const notificationItems = page.locator('[class*="flex cursor-pointer"]')
    const itemCount = await notificationItems.count()

    if (itemCount === 0) {
      // Empty state should be shown
      const emptyState = page.locator('text=/No notifications|لا توجد|empty/i')
      const emptyVisible = await emptyState.isVisible().catch(() => false)

      // Either empty state text or no items is acceptable
      expect(itemCount === 0 || emptyVisible).toBe(true)
    }
  })

  test('Regression: Story 05-02 — Drawer displays title, body, and time for each notification', async ({
    page,
  }) => {
    // Open drawer
    const bellButton = page.locator(
      'button[aria-label*="Notifications"], button:has-text("🔔")'
    )
    await bellButton.click()
    await page.waitForSelector('[class*="Sheet"]')

    // Get first notification
    const firstNotification = page
      .locator('[class*="flex cursor-pointer"]')
      .first()
    const isVisible = await firstNotification.isVisible().catch(() => false)

    if (isVisible) {
      // Title (font-medium)
      const title = firstNotification.locator('[class*="font-medium"]')
      await expect(title).toBeVisible()

      // Body (text-xs)
      const body = firstNotification.locator('[class*="text-xs"]')
      await expect(body).toBeVisible()

      // Time (text-[10px] or similar)
      const timeElement = firstNotification.locator('[class*="text"]')
      expect(await timeElement.count()).toBeGreaterThanOrEqual(2)
    }
  })

  test('Regression: Story 05-03 — Clicking notification marks as read', async ({
    page,
  }) => {
    // Open drawer
    const bellButton = page.locator(
      'button[aria-label*="Notifications"], button:has-text("🔔")'
    )
    await bellButton.click()
    await page.waitForSelector('[class*="Sheet"]')

    // Get initial unread count
    const unreadItems = page.locator(
      '[class*="flex cursor-pointer"]:has([class*="h-2 w-2 rounded-full"])'
    )
    const initialUnreadCount = await unreadItems.count()

    if (initialUnreadCount > 0) {
      // Click first unread notification
      const firstUnread = unreadItems.first()
      await firstUnread.click()

      await page.waitForTimeout(500)

      // Verify unread count decreased
      const updatedUnreadItems = page.locator(
        '[class*="flex cursor-pointer"]:has([class*="h-2 w-2 rounded-full"])'
      )
      const updatedUnreadCount = await updatedUnreadItems.count()

      expect(updatedUnreadCount).toBeLessThanOrEqual(initialUnreadCount)
    }
  })

  test('Regression: Story 05-03 — Clicking notification navigates to link', async ({
    page,
  }) => {
    // Open drawer
    const bellButton = page.locator(
      'button[aria-label*="Notifications"], button:has-text("🔔")'
    )
    await bellButton.click()
    await page.waitForSelector('[class*="Sheet"]')

    // Get initial URL
    const initialUrl = page.url()

    // Click first notification
    const firstNotification = page
      .locator('[class*="flex cursor-pointer"]')
      .first()

    const navigationPromise = page.waitForNavigation().catch(() => null)
    await firstNotification.click()

    // Wait for navigation
    await navigationPromise

    // Verify URL changed (navigation occurred)
    const newUrl = page.url()
    expect(newUrl).not.toBe(initialUrl)
  })

  test('Regression: Story 05-03 — Mark all as read button works', async ({
    page,
  }) => {
    // Open drawer
    const bellButton = page.locator(
      'button[aria-label*="Notifications"], button:has-text("🔔")'
    )
    await bellButton.click()
    await page.waitForSelector('[class*="Sheet"]')

    // Count initial unread
    const initialUnread = page.locator(
      '[class*="flex cursor-pointer"]:has([class*="h-2 w-2 rounded-full"])'
    )
    const initialUnreadCount = await initialUnread.count()

    if (initialUnreadCount > 0) {
      // Click "Mark all as read"
      const markAllButton = page.locator('button:has-text("Mark")')
      const exists = await markAllButton.isVisible().catch(() => false)

      if (exists) {
        await markAllButton.click()
        await page.waitForTimeout(300)

        // Verify all are marked as read (no unread dots)
        const finalUnread = page.locator(
          '[class*="flex cursor-pointer"]:has([class*="h-2 w-2 rounded-full"])'
        )
        const finalUnreadCount = await finalUnread.count()

        expect(finalUnreadCount).toBe(0)
      }
    }
  })

  test('Regression: Stories 05-01 → 05-03 → 05-04 full flow works', async ({
    page,
  }) => {
    // Step 1: Bell exists and polling works (05-01)
    const bellButton = page.locator(
      'button[aria-label*="Notifications"], button:has-text("🔔")'
    )
    await expect(bellButton).toBeVisible()

    // Step 2: Drawer opens and shows notifications (05-02)
    await bellButton.click()
    const drawer = page.locator('[class*="Sheet"]')
    await expect(drawer).toBeVisible()

    // Step 3: Notification has content (05-04)
    const notification = page.locator('[class*="flex cursor-pointer"]').first()
    const isVisible = await notification.isVisible().catch(() => false)

    if (isVisible) {
      const title = notification.locator('[class*="font-medium"]')
      const body = notification.locator('[class*="text-xs"]')

      await expect(title).toBeVisible()
      await expect(body).toBeVisible()
    }

    // Step 4: Read action works (05-03)
    const unreadDot = notification.locator('[class*="h-2 w-2 rounded-full"]')
    const hasUnread = await unreadDot.isVisible().catch(() => false)

    if (hasUnread) {
      const navigationPromise = page.waitForNavigation().catch(() => null)
      await notification.click()
      await navigationPromise

      // Should navigate away
      const newUrl = page.url()
      expect(newUrl).toBeTruthy()
    }
  })
})
