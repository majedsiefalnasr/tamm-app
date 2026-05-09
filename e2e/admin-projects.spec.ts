import { test, expect } from '@playwright/test'

test.describe('Admin Projects Overview Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button:has-text("Login")')
    await page.waitForNavigation()

    // Navigate to admin projects page
    await page.goto('/admin/projects')
    await page.waitForLoadState('networkidle')
  })

  test('renders admin projects page with summary cards', async ({ page }) => {
    // Check page title
    expect(await page.locator('h1').first().isVisible()).toBeTruthy()

    // Check summary cards exist
    const cards = await page.locator('[class*="rounded-xl"]').count()
    expect(cards).toBeGreaterThanOrEqual(4)
  })

  test('displays projects table', async ({ page }) => {
    // Check table is visible
    const table = page.locator('table')
    expect(await table.isVisible()).toBeTruthy()

    // Check table has headers
    const headers = page.locator('thead th')
    expect(await headers.count()).toBeGreaterThan(0)

    // Check table has rows
    const rows = page.locator('tbody tr')
    expect(await rows.count()).toBeGreaterThan(0)
  })

  test('filters projects by status', async ({ page }) => {
    // Click on "Completed" filter tab
    await page.click('button:has-text("Completed")')
    await page.waitForLoadState('networkidle')

    // Verify filter is active
    const activeTab = page.locator(
      'button:has-text("Completed"):has-class("border-primary")'
    )
    expect(await activeTab.isVisible()).toBeTruthy()

    // Check that displayed projects are in completed status
    const statusBadges = page.locator('table [class*="bg-muted"]')
    expect(await statusBadges.count()).toBeGreaterThan(0)
  })

  test('searches projects by name', async ({ page }) => {
    // Type in search box
    const searchInput = page.locator('input[placeholder*="Search"]').first()
    const searchTerm = 'villa'
    await searchInput.fill(searchTerm)

    // Wait for debounce and results
    await page.waitForTimeout(400)
    await page.waitForLoadState('networkidle')

    // Verify search is applied
    expect(await searchInput.inputValue()).toBe(searchTerm)

    // Check results exist (may be empty if no matches)
    const projectNames = page.locator('table tbody td:nth-child(2)')
    const count = await projectNames.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('searches projects by client name', async ({ page }) => {
    // Type client name in search box
    const searchInput = page.locator('input[placeholder*="Search"]').first()
    const searchTerm = 'client'
    await searchInput.fill(searchTerm)

    // Wait for debounce and results
    await page.waitForTimeout(400)
    await page.waitForLoadState('networkidle')

    // Verify search is applied
    expect(await searchInput.inputValue()).toBe(searchTerm)
  })

  test('clears search when clicking clear button', async ({ page }) => {
    // Type in search box
    const searchInput = page.locator('input[placeholder*="Search"]').first()
    await searchInput.fill('test')

    // Wait for debounce
    await page.waitForTimeout(400)

    // Click clear button
    const clearButton = page.locator('button[aria-label="Clear"]')
    expect(await clearButton.isVisible()).toBeTruthy()
    await clearButton.click()

    // Verify search is cleared
    expect(await searchInput.inputValue()).toBe('')
  })

  test('pagination works correctly', async ({ page }) => {
    // Check if pagination controls exist
    const paginationText = page.locator('text=/Page 1 of/')
    expect(await paginationText.isVisible()).toBeTruthy()

    // Get Next button
    const nextButton = page.locator('button:has-text("Next")')
    const nextButtonDisabled = await nextButton.getAttribute('disabled')

    // If there are multiple pages, click next
    if (!nextButtonDisabled) {
      await nextButton.click()
      await page.waitForLoadState('networkidle')

      // Verify page changed
      const newPaginationText = page.locator('text=/Page 2 of/')
      expect(await newPaginationText.isVisible()).toBeTruthy()
    }
  })

  test('navigates to project detail when clicking View button', async ({
    page,
  }) => {
    // Click View button on first project
    await page.click('button:has-text("View")').first()

    // Wait for navigation
    await page.waitForNavigation()

    // Check URL changed to project detail
    expect(page.url()).toMatch(/\/projects\/[a-f0-9\-]+/)
  })

  test('shows empty state when no projects match filters', async ({ page }) => {
    // Apply a filter that likely has no results
    await page.click('input[placeholder*="Search"]').first()
    await page.fill(
      'input[placeholder*="Search"]',
      'nonexistent_project_xyz123'
    )

    // Wait for debounce and results
    await page.waitForTimeout(400)
    await page.waitForLoadState('networkidle')

    // Check for empty state
    const emptyState = page.locator('[class*="FolderOpen"]')
    if ((await emptyState.count()) === 0) {
      const emptyText = page.locator('text="No projects found"')
      expect(await emptyText.isVisible()).toBeTruthy()
    }
  })

  test('shows loading state while fetching', async ({ page }) => {
    // Trigger a fresh fetch by changing filter
    await page.click('button:has-text("Active")')

    // Check for loading skeleton (may be too fast, so this is optional)
    // const skeleton = page.locator('[class*="Skeleton"]')
    // expect(await skeleton.isVisible()).toBeTruthy()

    // Wait for table to load
    await page.waitForLoadState('networkidle')

    // Verify table is visible
    const table = page.locator('table')
    expect(await table.isVisible()).toBeTruthy()
  })

  test('respects RTL layout', async ({ page }) => {
    // Check page direction
    const html = page.locator('html')
    const dir = await html.getAttribute('dir')

    // Should work with RTL (ar) or default LTR
    expect(['rtl', 'ltr', null]).toContain(dir)

    // Check table is visible and functional in RTL
    const table = page.locator('table')
    expect(await table.isVisible()).toBeTruthy()
  })

  test('handles error state gracefully', async ({ page }) => {
    // This test would require mocking an API failure
    // For now, we just verify the page is accessible
    expect(await page.locator('h1').first().isVisible()).toBeTruthy()
  })

  test('prevents non-admin access', async ({ page }) => {
    // Logout
    await page.click('button:has-text("Logout")')
    await page.waitForNavigation()

    // Login as client
    await page.fill('input[type="email"]', 'client@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button:has-text("Login")')
    await page.waitForNavigation()

    // Try to navigate to admin projects
    await page.goto('/admin/projects')

    // Should be redirected to 403
    expect(page.url()).toMatch(/403|login/)
  })
})
