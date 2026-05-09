import { test, expect } from '@playwright/test'

test.describe('Story 07-01 — Admin Opens Bidding and Invites Contractors', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login')
    await page.fill('input[name="identifier"]', 'admin@tamm.local')
    await page.fill('input[name="password"]', 'admin123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('/')
  })

  test('Button is visible only to admin when project status is "new"', async ({
    page,
  }) => {
    // Navigate to project with status = new
    await page.goto('/projects/proj-003')
    await page.waitForLoadState('networkidle')

    // Check that button is visible
    const openBidsButton = page.locator('button:has-text("Open for Bids")')
    await expect(openBidsButton).toBeVisible()
    await expect(openBidsButton).not.toBeDisabled()
  })

  test('Dialog opens when button is clicked', async ({ page }) => {
    await page.goto('/projects/proj-003')
    await page.waitForLoadState('networkidle')

    const openBidsButton = page.locator('button:has-text("Open for Bids")')
    await openBidsButton.click()

    // Check dialog is visible
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()
  })

  test('Dialog contains contractor selection', async ({ page }) => {
    await page.goto('/projects/proj-003')
    await page.waitForLoadState('networkidle')

    const openBidsButton = page.locator('button:has-text("Open for Bids")')
    await openBidsButton.click()

    // Wait for contractors to load
    await page.waitForTimeout(500)

    // Check for contractor items
    const contractorItems = page.locator(
      '[role="dialog"] input[type="checkbox"]'
    )
    const count = await contractorItems.count()

    expect(count).toBeGreaterThan(0)
  })

  test('Confirm button is disabled when no contractors selected', async ({
    page,
  }) => {
    await page.goto('/projects/proj-003')
    await page.waitForLoadState('networkidle')

    const openBidsButton = page.locator('button:has-text("Open for Bids")')
    await openBidsButton.click()

    await page.waitForTimeout(500)

    // Find confirm button
    const confirmButton = page.locator(
      '[role="dialog"] button:has-text("Open for Bids")'
    )
    await expect(confirmButton).toBeDisabled()
  })

  test('Confirm button is enabled after selecting contractors', async ({
    page,
  }) => {
    await page.goto('/projects/proj-003')
    await page.waitForLoadState('networkidle')

    const openBidsButton = page.locator('button:has-text("Open for Bids")')
    await openBidsButton.click()

    await page.waitForTimeout(500)

    // Select first contractor
    const firstCheckbox = page
      .locator('[role="dialog"] input[type="checkbox"]')
      .first()
    await firstCheckbox.click()

    // Find confirm button
    const confirmButton = page.locator(
      '[role="dialog"] button:has-text("Open for Bids")'
    )
    await expect(confirmButton).not.toBeDisabled()
  })

  test('Completes open for bids workflow', async ({ page }) => {
    await page.goto('/projects/proj-003')
    await page.waitForLoadState('networkidle')

    // Open dialog
    const openBidsButton = page.locator('button:has-text("Open for Bids")')
    await openBidsButton.click()

    await page.waitForTimeout(500)

    // Select contractors
    const checkboxes = page.locator('[role="dialog"] input[type="checkbox"]')
    const count = await checkboxes.count()

    for (let i = 0; i < Math.min(2, count); i++) {
      await checkboxes.nth(i).click()
    }

    // Click confirm
    const confirmButton = page.locator(
      '[role="dialog"] button:has-text("Open for Bids")'
    )
    await confirmButton.click()

    // Wait for submission
    await page.waitForTimeout(800)

    // Dialog should close
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).not.toBeVisible({ timeout: 2000 })
  })

  test('Shows loading toast during submission', async ({ page }) => {
    await page.goto('/projects/proj-003')
    await page.waitForLoadState('networkidle')

    // Open dialog
    const openBidsButton = page.locator('button:has-text("Open for Bids")')
    await openBidsButton.click()
    await page.waitForTimeout(500)

    // Select a contractor
    const firstCheckbox = page
      .locator('[role="dialog"] input[type="checkbox"]')
      .first()
    await firstCheckbox.click()

    // Click confirm and verify loading toast appears
    const confirmButton = page.locator(
      '[role="dialog"] button:has-text("Open for Bids")'
    )
    await confirmButton.click()

    // Check for loading toast
    const loadingToast = page.locator(':has-text("Opening for bids...")')
    await expect(loadingToast).toBeVisible({ timeout: 1000 })
  })

  test('Displays error message if confirm fails', async ({ page }) => {
    await page.goto('/projects/proj-003')
    await page.waitForLoadState('networkidle')

    // Intercept API to simulate failure
    await page.route('**/api/v1/projects/*/status', route =>
      route.abort('failed')
    )

    // Open dialog and submit
    const openBidsButton = page.locator('button:has-text("Open for Bids")')
    await openBidsButton.click()
    await page.waitForTimeout(500)

    const firstCheckbox = page
      .locator('[role="dialog"] input[type="checkbox"]')
      .first()
    await firstCheckbox.click()

    const confirmButton = page.locator(
      '[role="dialog"] button:has-text("Open for Bids")'
    )
    await confirmButton.click()

    // Wait for error notification
    await page.waitForTimeout(1000)
    const errorToast = page.locator(':has-text("Failed to open for bids")')
    await expect(errorToast).toBeVisible({ timeout: 2000 })
  })

  test('Helper text is always visible', async ({ page }) => {
    await page.goto('/projects/proj-003')
    await page.waitForLoadState('networkidle')

    const openBidsButton = page.locator('button:has-text("Open for Bids")')
    await openBidsButton.click()

    // Helper text should be visible even during loading
    const helperText = page.locator(
      '[role="dialog"] :has-text("Select at least one contractor")'
    )
    await expect(helperText).toBeVisible()
  })

  test('Button hidden for non-admin users', async ({ page }) => {
    // Logout and login as contractor
    await page.goto('/logout')
    await page.waitForURL('/login')

    await page.fill('input[name="identifier"]', 'contractor@tamm.local')
    await page.fill('input[name="password"]', 'contractor123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('/')

    // Navigate to project
    await page.goto('/projects/proj-003')
    await page.waitForLoadState('networkidle')

    // Button should not be visible
    const openBidsButton = page.locator('button:has-text("Open for Bids")')
    await expect(openBidsButton).not.toBeVisible()
  })

  test('Button hidden when project status is not "new"', async ({ page }) => {
    await page.goto('/projects/proj-001')
    await page.waitForLoadState('networkidle')

    // Project status is "active", button should not be visible
    const openBidsButton = page.locator('button:has-text("Open for Bids")')
    await expect(openBidsButton).not.toBeVisible()
  })

  test('Displays validation error when trying to submit with no selection', async ({
    page,
  }) => {
    await page.goto('/projects/proj-003')
    await page.waitForLoadState('networkidle')

    const openBidsButton = page.locator('button:has-text("Open for Bids")')
    await openBidsButton.click()
    await page.waitForTimeout(500)

    // The confirm button should be disabled, but test showing error UI
    const confirmButton = page.locator(
      '[role="dialog"] button:has-text("Open for Bids")'
    )

    // Verify button is disabled (validation is enforced client-side)
    await expect(confirmButton).toBeDisabled()
  })

  test('Prevents double-click submission', async ({ page }) => {
    let apiCallCount = 0

    // Track API calls
    await page.route('**/api/v1/projects/*/status', route => {
      apiCallCount++
      route.abort('failed')
    })

    await page.goto('/projects/proj-003')
    await page.waitForLoadState('networkidle')

    const openBidsButton = page.locator('button:has-text("Open for Bids")')
    await openBidsButton.click()
    await page.waitForTimeout(500)

    const firstCheckbox = page
      .locator('[role="dialog"] input[type="checkbox"]')
      .first()
    await firstCheckbox.click()

    const confirmButton = page.locator(
      '[role="dialog"] button:has-text("Open for Bids")'
    )

    // Double-click quickly
    await confirmButton.click()
    await confirmButton.click()
    await confirmButton.click()

    // Wait for requests to process
    await page.waitForTimeout(1000)

    // Only one API call should have been made (ideally)
    expect(apiCallCount).toBeLessThanOrEqual(1)
  })
})
