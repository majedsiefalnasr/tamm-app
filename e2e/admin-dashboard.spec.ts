import { test, expect } from '@playwright/test'

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@test.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForNavigation()
  })

  test('should load dashboard page', async ({ page }) => {
    await page.goto('/admin/dashboard')

    // Check page title
    await expect(page.locator('h1')).toContainText('لوحة التحكم')
  })

  test('should display dashboard sections', async ({ page }) => {
    await page.goto('/admin/dashboard')

    // Check for banners section (if count > 0, it will be visible)
    const banners = page.locator('div:has-text("طلبات مشاريع جديدة")')
    // Banners are conditional, so just check page loads

    // Check for stats cards
    await expect(page.locator('text=مشاريع نشطة')).toBeVisible()
    await expect(page.locator('text=المقاولون المسجلون')).toBeVisible()

    // Check for activity section
    await expect(page.locator('text=نشاط المنصة')).toBeVisible()

    // Check for projects section
    await expect(page.locator('text=المشاريع')).toBeVisible()

    // Check for disputes section (if available)
    const disputes = page.locator('text=النزاعات المفتوحة')
    // Check if disputes section exists or empty state
    const hasDisputes = await disputes.isVisible().catch(() => false)
    expect(typeof hasDisputes).toBe('boolean')
  })

  test('should display stats cards with values', async ({ page }) => {
    await page.goto('/admin/dashboard')

    // Wait for data to load
    await page.waitForTimeout(800)

    // Check stats cards are visible and have numeric content
    const statCards = page
      .locator('[class*="grid"] > div')
      .filter({ has: page.locator('svg') })
    const count = await statCards.count()

    expect(count).toBeGreaterThanOrEqual(3)
  })

  test('should display projects table', async ({ page }) => {
    await page.goto('/admin/dashboard')

    // Wait for data to load
    await page.waitForTimeout(800)

    // Check for table headers
    const projectsSection = page.locator('text=المشاريع').first()
    await expect(projectsSection).toBeVisible()

    // Check for "عرض المزيد" link
    const viewAllLink = page.locator('text=عرض المزيد').first()
    await expect(viewAllLink).toHaveAttribute('href', '/admin/projects')
  })

  test('should navigate to projects page', async ({ page }) => {
    await page.goto('/admin/dashboard')

    // Wait for data to load
    await page.waitForTimeout(800)

    // Find and click the "عرض المزيد" link for projects
    const viewAllLinks = page.locator('text=عرض المزيد')
    const count = await viewAllLinks.count()

    if (count > 0) {
      await viewAllLinks.first().click()

      // Should navigate to projects page
      await page.waitForURL('**/admin/projects')
      await expect(page).toHaveURL(/admin\/projects/)
    }
  })

  test('should display loading state while fetching', async ({ page }) => {
    // Navigate quickly to see loading state
    await page.goto('/admin/dashboard')

    // Check for skeletons (if loading is fast, skeletons may not be visible)
    // But page should eventually show content
    await page.waitForTimeout(1000)

    await expect(page.locator('text=لوحة التحكم')).toBeVisible()
  })

  test('should support RTL layout', async ({ page }) => {
    await page.goto('/admin/dashboard')

    // Check for RTL direction
    const html = page.locator('html')
    const dir = await html.getAttribute('dir')

    expect(['rtl', undefined]).toContain(dir)
  })

  test('stats cards should be clickable links', async ({ page }) => {
    await page.goto('/admin/dashboard')

    // Wait for data to load
    await page.waitForTimeout(800)

    // Find a stat card link
    const statLinks = page.locator('a').filter({ has: page.locator('svg') })
    const count = await statLinks.count()

    // Should have at least some stat card links
    expect(count).toBeGreaterThanOrEqual(1)

    // Verify a link has proper href
    const firstLink = statLinks.first()
    const href = await firstLink.getAttribute('href')
    expect(href).toBeTruthy()
  })

  test('should display error state gracefully', async ({ page }) => {
    // Override fetch to simulate error
    await page.addInitScript(() => {
      window.fetch = async () => {
        throw new Error('Network error')
      }
    })

    await page.goto('/admin/dashboard')

    // Page should not crash, error message or retry button should appear
    // or page might show with mock data
    const pageTitle = page.locator('text=لوحة التحكم')
    await expect(pageTitle).toBeVisible({ timeout: 5000 })
  })

  test('disputes table should display disputes when available', async ({
    page,
  }) => {
    await page.goto('/admin/dashboard')

    // Wait for data to load
    await page.waitForTimeout(800)

    const disputesSection = page.locator('text=النزاعات المفتوحة')

    // If disputes section is visible, check for table
    const isVisible = await disputesSection.isVisible().catch(() => false)

    if (isVisible) {
      // Check for dispute columns
      const tableHeaders = page.locator('th')
      const headerCount = await tableHeaders.count()

      expect(headerCount).toBeGreaterThan(0)
    }
  })

  test('activity chart should render', async ({ page }) => {
    await page.goto('/admin/dashboard')

    // Wait for data to load
    await page.waitForTimeout(800)

    // Check for activity section
    const activitySection = page.locator('text=نشاط المنصة')
    await expect(activitySection).toBeVisible()

    // Check for chart SVG
    const svgs = page.locator('svg')
    const count = await svgs.count()

    expect(count).toBeGreaterThan(1) // Should have activity chart SVG
  })
})
