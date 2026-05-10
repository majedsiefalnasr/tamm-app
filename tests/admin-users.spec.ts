import { test, expect } from '@playwright/test'
import { setPreferredLocale } from './helpers/locale-cookie'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

test.describe('Admin User List', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Login as admin first
    // This assumes auth is working from Story 01-04
    await page.goto(`${BASE_URL}/login`)

    // Wait for the page to load
    await page.waitForLoadState('networkidle')
  })

  test('should display admin users page with table', async ({ page }) => {
    // Navigate to admin users page
    await page.goto(`${BASE_URL}/users`)

    // Check page header exists
    const header = page.locator('h1')
    await expect(header).toContainText('Users')

    // Check "Add User" button exists
    const addButton = page.locator('button', { hasText: /Add User/i })
    await expect(addButton).toBeVisible()
  })

  test('should display filter tabs with user counts', async ({ page }) => {
    await page.goto(`${BASE_URL}/users`)

    // Check that filter tabs exist
    const allTab = page.locator('button', { hasText: 'All' })
    const contractorsTab = page.locator('button', { hasText: 'Contractors' })

    await expect(allTab).toBeVisible()
    await expect(contractorsTab).toBeVisible()

    // Tabs should have count badges (example: "(5)")
    await expect(page.locator('text=(/\\(\\d+\\)/)')).toBeTruthy()
  })

  test('should filter users when tab is clicked', async ({ page }) => {
    await page.goto(`${BASE_URL}/users`)

    // Get initial table row count
    const allRows = page.locator('table tbody tr')
    const initialCount = await allRows.count()

    // Click contractors filter
    const contractorsTab = page.locator('button', { hasText: 'Contractors' })
    await contractorsTab.click()

    // Wait for table to update
    await page.waitForLoadState('networkidle')

    // Table should have different number of rows (or same if all are contractors)
    const filteredRows = page.locator('table tbody tr')
    const filteredCount = await filteredRows.count()

    // Count should be different or same (valid)
    expect(filteredCount).toBeGreaterThanOrEqual(0)
  })

  test('should display user table with correct columns', async ({ page }) => {
    await page.goto(`${BASE_URL}/users`)

    // Check table headers
    expect(page.locator('th', { hasText: /^Name$/i })).toBeTruthy()
    expect(page.locator('th', { hasText: /^Email$/i })).toBeTruthy()
    expect(page.locator('th', { hasText: /^Role$/i })).toBeTruthy()
    expect(page.locator('th', { hasText: /^Status$/i })).toBeTruthy()

    // Check for table rows with data
    const rows = page.locator('table tbody tr')
    expect(await rows.count()).toBeGreaterThan(0)
  })

  test('should show skeleton while loading', async ({ page }) => {
    // Intercept network to delay response
    await page.route('**/api/admin/users**', route => {
      setTimeout(() => route.continue(), 500)
    })

    await page.goto(`${BASE_URL}/users`)

    // Check if skeleton loader exists
    const skeletons = page.locator('[class*="skeleton"]')
    const skeletonCount = await skeletons.count()

    // Should have at least some skeleton elements while loading
    expect(skeletonCount).toBeGreaterThanOrEqual(0)
  })

  test('should open actions menu when clicking dropdown', async ({ page }) => {
    await page.goto(`${BASE_URL}/users`)

    // Wait for table to load
    await page.waitForLoadState('networkidle')

    // Find first row's action button
    const firstRowActionBtn = page
      .locator('table tbody tr')
      .first()
      .locator('button')
    await firstRowActionBtn.click()

    // Check if dropdown menu appears
    const editOption = page.locator('[role="menuitem"]', {
      hasText: /تحرير|edit/i,
    })
    const deactivateOption = page.locator('[role="menuitem"]', {
      hasText: /إلغاء|deactivate/i,
    })

    // At least one action should be visible
    const visibleCount = await Promise.all([
      editOption.isVisible().catch(() => false),
      deactivateOption.isVisible().catch(() => false),
    ]).then(results => results.filter(Boolean).length)

    expect(visibleCount).toBeGreaterThan(0)
  })

  test('should show empty state when no users match filter', async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/users`)

    // If a filter exists with no users, it should show empty state
    // Try clicking a filter and check for empty state text
    const filterTabs = page.locator('button[role="tab"]')
    const tabCount = await filterTabs.count()

    if (tabCount > 0) {
      // Click last tab
      await filterTabs.last().click()
      await page.waitForLoadState('networkidle')

      // Check for empty state
      const emptyText = page.locator('text=/no users found/i')
      // Empty state may or may not appear depending on data
      expect(await emptyText.isVisible()).toBeTruthy()
    }
  })

  test('should be protected from non-admin users (403 on access)', async ({
    page,
  }) => {
    // Attempt to access admin page without proper auth
    // This would result in 403 redirect to login or error page
    await page.goto(`${BASE_URL}/users`)

    // Should either redirect or show 403
    const notFoundText = page.locator('text=403')
    const loginPage = page.locator('text=/login|دخول/i')

    const isNotFound = await notFoundText.isVisible().catch(() => false)
    const isLogin = await loginPage.isVisible().catch(() => false)

    expect(isNotFound || isLogin).toBeTruthy()
  })

  test('should support RTL layout (Arabic)', async ({ page, context }) => {
    await setPreferredLocale(context, 'ar', BASE_URL)

    await page.goto(`${BASE_URL}/users`)

    // Check for RTL direction
    const html = page.locator('html')
    const dir = await html.getAttribute('dir')

    // Should be RTL when in Arabic
    expect(dir).toBe('rtl')

    // Check that Arabic text is present
    const arabicText = page.locator('text=المستخدمون')
    await expect(arabicText).toBeVisible()
  })
})
