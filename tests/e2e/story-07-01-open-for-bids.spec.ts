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
})
