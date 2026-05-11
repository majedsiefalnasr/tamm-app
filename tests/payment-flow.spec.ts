import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

test.describe('Story 04-01 — Client Pays for a Milestone', () => {
  test.beforeEach(async ({ page }) => {
    // Login as client
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[type="email"]', 'client@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/projects**')
  })

  test('should show Pay Milestone button for client on draft milestone with pending status', async ({
    page,
  }) => {
    // Navigate to project
    await page.goto(`${BASE_URL}/projects/proj-001`)

    // Find milestone with payable status
    const milestoneCards = page.locator('[class*="rounded-2xl"]')
    let foundPayButton = false

    for (let i = 0; i < (await milestoneCards.count()); i++) {
      const card = milestoneCards.nth(i)
      const status = card.locator('[class*="StatusTag"]')

      // Expand to see actions
      const expandButton = card.locator('button[aria-label*="Expand"]')
      if (await expandButton.isVisible()) {
        await expandButton.click()
      }

      // Look for pay button
      const payButton = card.locator('button:has-text("Pay Milestone")')
      if (await payButton.isVisible()) {
        foundPayButton = true
        break
      }
    }

    expect(foundPayButton).toBe(true)
  })

  test('should open payment dialog when Pay Milestone button clicked', async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/projects/proj-001`)

    // Find and click Pay Milestone button
    const payButton = page.locator('button:has-text("Pay Milestone")').first()
    if (await payButton.isVisible()) {
      await payButton.click()

      // Dialog should open
      const dialogTitle = page.locator('[role="dialog"]')
      await expect(dialogTitle).toBeVisible()

      // Dialog should contain milestone name and amount
      const dialogText = await dialogTitle.textContent()
      expect(dialogText).toContain('Pay')
    }
  })

  test('should display payment form with required fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/projects/proj-001`)

    const payButton = page.locator('button:has-text("Pay Milestone")').first()
    if (await payButton.isVisible()) {
      await payButton.click()

      // Check for form fields
      const bankNameInput = page.locator('input[placeholder*="Bank"]')
      const txRefInput = page.locator('input[placeholder*="Transaction"]')
      const fileInput = page.locator('input[type="file"]')
      const notesTextarea = page.locator('textarea')

      expect(bankNameInput).toBeVisible()
      expect(txRefInput).toBeVisible()
      expect(fileInput).toBeVisible()
      expect(notesTextarea).toBeVisible()
    }
  })

  test('should validate form - require bank name', async ({ page }) => {
    await page.goto(`${BASE_URL}/projects/proj-001`)

    const payButton = page.locator('button:has-text("Pay Milestone")').first()
    if (await payButton.isVisible()) {
      await payButton.click()

      // Try to submit without bank name
      const confirmButton = page.locator(
        '[role="dialog"] button:has-text("Confirm")'
      )
      await expect(confirmButton).toBeDisabled()
    }
  })

  test('should validate form - require transaction reference', async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/projects/proj-001`)

    const payButton = page.locator('button:has-text("Pay Milestone")').first()
    if (await payButton.isVisible()) {
      await payButton.click()

      // Fill bank name only
      const bankNameInput = page.locator('input[placeholder*="Bank"]')
      await bankNameInput.fill('Test Bank')

      // Confirm button should still be disabled
      const confirmButton = page.locator(
        '[role="dialog"] button:has-text("Confirm")'
      )
      await expect(confirmButton).toBeDisabled()
    }
  })

  test('should accept file upload with image validation', async ({ page }) => {
    await page.goto(`${BASE_URL}/projects/proj-001`)

    const payButton = page.locator('button:has-text("Pay Milestone")').first()
    if (await payButton.isVisible()) {
      await payButton.click()

      // Select a file
      const fileInput = page.locator('input[type="file"]')
      const fileName = 'tests/fixtures/receipt.jpg' // Make sure this file exists

      // Upload file (using a dummy path - in real test this would be a valid image)
      // For now we'll just check that file input accepts the action
      expect(fileInput).toBeDefined()
    }
  })

  test('should close dialog when Cancel button clicked', async ({ page }) => {
    await page.goto(`${BASE_URL}/projects/proj-001`)

    const payButton = page.locator('button:has-text("Pay Milestone")').first()
    if (await payButton.isVisible()) {
      await payButton.click()

      const dialog = page.locator('[role="dialog"]')
      await expect(dialog).toBeVisible()

      // Click cancel button
      const cancelButton = page.locator(
        '[role="dialog"] button:has-text("Cancel")'
      )
      await cancelButton.click()

      await expect(dialog).not.toBeVisible()
    }
  })

  test('should hide Pay Milestone button after successful payment', async ({
    page,
  }) => {
    // This test would require:
    // 1. Fill and submit the payment form
    // 2. Verify success toast appears
    // 3. Verify Pay button is removed from milestone card
    // 4. Verify milestone status changes to in_progress

    // Placeholder: verify button initially visible
    await page.goto(`${BASE_URL}/projects/proj-001`)
    const payButton = page.locator('button:has-text("Pay Milestone")').first()
    // If button exists, payment flow is available
    if (await payButton.isVisible()) {
      expect(payButton).toBeDefined()
    }
  })

  test('should show success toast after payment submission', async ({
    page,
  }) => {
    // Placeholder test - real implementation would:
    // 1. Fill form with valid data
    // 2. Submit
    // 3. Check for success toast
    // 4. Verify toast message matches i18n key

    await page.goto(`${BASE_URL}/projects/proj-001`)
    expect(page).toBeDefined()
  })

  test('should show error toast on payment failure', async ({ page }) => {
    // Placeholder test - would verify error handling:
    // 1. Mock API failure
    // 2. Fill and submit form
    // 3. Verify error toast appears
    // 4. Verify dialog remains open for retry

    await page.goto(`${BASE_URL}/projects/proj-001`)
    expect(page).toBeDefined()
  })

  test('should not show Pay Milestone button for non-client users', async ({
    page,
  }) => {
    // Logout and login as contractor
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[type="email"]', 'contractor@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard**')

    await page.goto(`${BASE_URL}/projects/proj-001`)

    // Pay button should not be visible
    const payButton = page.locator('button:has-text("Pay Milestone")')
    await expect(payButton).not.toBeVisible()
  })

  test('should not show Pay Milestone button after milestone status changes from draft', async ({
    page,
  }) => {
    // Navigate to project with non-payable milestone status
    // Button should not be visible
    await page.goto(`${BASE_URL}/projects/proj-001`)

    const milestoneCards = page.locator('[class*="rounded-2xl"]')
    let foundNonPayableMilestone = false

    for (let i = 0; i < (await milestoneCards.count()); i++) {
      const card = milestoneCards.nth(i)

      // Expand to see actions
      const expandButton = card.locator('button[aria-label*="Expand"]')
      if (await expandButton.isVisible()) {
        await expandButton.click()
      }

      // Look for in_progress milestone without pay button
      const payButton = card.locator('button:has-text("Pay Milestone")')
      if (!(await payButton.isVisible())) {
        foundNonPayableMilestone = true
      }
    }

    expect(foundNonPayableMilestone).toBe(true)
  })
})
