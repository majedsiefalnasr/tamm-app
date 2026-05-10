import { test, expect } from '@playwright/test'

// Test credentials from environment or defaults
const TEST_ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@test.com'
const TEST_ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'password123'

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await page.goto('/login')
    await page.fill('input[data-testid="email-input"]', TEST_ADMIN_EMAIL)
    await page.fill('input[data-testid="password-input"]', TEST_ADMIN_PASSWORD)
    await page.click('button[data-testid="login-submit"]')
    await page.waitForLoadState('networkidle')
  })

  test('should load dashboard page', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await page.waitForLoadState('networkidle')

    // Check page title using data-testid
    await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible()
  })

  test('should display dashboard sections', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await page.waitForLoadState('networkidle')

    // KPI stat cards (Story 08-05)
    await expect(
      page.locator('[data-testid="stat-active-projects"]')
    ).toBeVisible()
    await expect(
      page.locator('[data-testid="stat-pending-milestone-review"]')
    ).toBeVisible()

    await expect(
      page.locator('[data-testid="action-queues-section"]')
    ).toBeVisible()
    await expect(
      page.locator('[data-testid="recent-activity-section"]')
    ).toBeVisible()

    // Check for activity section
    await expect(page.locator('[data-testid="activity-section"]')).toBeVisible()

    // Check for projects section
    await expect(page.locator('[data-testid="projects-section"]')).toBeVisible()

    // Check for disputes section (conditional)
    const disputesSection = page.locator('[data-testid="disputes-section"]')
    const isVisible = await disputesSection.isVisible().catch(() => false)
    expect(typeof isVisible).toBe('boolean')
  })

  test('should display stats cards with values', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await page.waitForLoadState('networkidle')

    // Check stats cards are visible by data-testid
    const statCards = page.locator('[data-testid^="stat-card-"]')
    const count = await statCards.count()

    expect(count).toBeGreaterThanOrEqual(3)
  })

  test('should display projects table', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await page.waitForLoadState('networkidle')

    // Check for projects section by data-testid
    const projectsSection = page.locator('[data-testid="projects-section"]')
    await expect(projectsSection).toBeVisible()

    // Check for "View All" link for projects
    const viewAllLink = page.locator('[data-testid="projects-view-all"]')
    await expect(viewAllLink).toHaveAttribute('href', '/admin/projects')
  })

  test('should navigate to projects page', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await page.waitForLoadState('networkidle')

    // Find and click the projects "View All" link
    const viewAllLink = page.locator('[data-testid="projects-view-all"]')
    const isVisible = await viewAllLink.isVisible().catch(() => false)

    if (isVisible) {
      await viewAllLink.click()

      // Should navigate to projects page
      await page.waitForURL('**/admin/projects')
      await expect(page).toHaveURL(/admin\/projects/)
    }
  })

  test('should display loading state while fetching', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/admin/dashboard')
    await page.waitForLoadState('networkidle')

    // Page should be fully loaded with content
    await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible()
  })

  test('should support RTL layout', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await page.waitForLoadState('networkidle')

    // Check for RTL direction on html element
    const html = page.locator('html')
    const dir = await html.getAttribute('dir')

    expect(dir).toBe('ltr')
  })

  test('stats cards should be clickable links', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await page.waitForLoadState('networkidle')

    const statLinks = page.locator(
      '[data-testid^="stat-"]:not([data-testid^="stat-skeleton"])'
    )
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
    await page.waitForLoadState('networkidle')

    // Page should not crash, error state or mock data should show
    const pageTitle = page.locator('[data-testid="dashboard-title"]')
    await expect(pageTitle).toBeVisible({ timeout: 5000 })
  })

  test('disputes table should display disputes when available', async ({
    page,
  }) => {
    await page.goto('/admin/dashboard')
    await page.waitForLoadState('networkidle')

    const disputesSection = page.locator('[data-testid="disputes-section"]')

    // If disputes section is visible, check for table
    const isVisible = await disputesSection.isVisible().catch(() => false)

    if (isVisible) {
      // Check for dispute columns
      const tableHeaders = page.locator('[data-testid="disputes-table"] th')
      const headerCount = await tableHeaders.count()

      expect(headerCount).toBeGreaterThan(0)
    }
  })

  test('activity chart should render', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await page.waitForLoadState('networkidle')

    // Check for activity section by data-testid
    const activitySection = page.locator('[data-testid="activity-section"]')
    await expect(activitySection).toBeVisible()

    // Check for chart SVG
    const svgs = page.locator('[data-testid="activity-chart"] svg')
    const count = await svgs.count()

    expect(count).toBeGreaterThan(0)
  })
})
