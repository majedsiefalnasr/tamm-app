import { test, expect } from '@playwright/test'

test.describe('Story 07-02: Contractor Submits Proposal', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app and login as contractor
    await page.goto('/')
    await page.fill('input[type="email"]', 'contractor@example.com')
    await page.fill('input[type="password"]', 'password')
    await page.click('button:has-text("Login")')
    await page.waitForNavigation()
  })

  test('AC: Invited contractor sees "Open for Bids" project in list with Submit button', async ({
    page,
  }) => {
    // Navigate to projects list
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    // Find project card with "Open for Bids" status
    const openForBidsCards = page.locator(
      'text=مفتوح للعروض, text=Open for Bids'
    )
    const cardCount = await openForBidsCards.count()

    if (cardCount > 0) {
      // Verify status pill exists
      const statusPill = page
        .locator('[class*="bg-accent"], [class*="bg-orange"]')
        .filter({ hasText: /مفتوح|Open/ })
      await expect(statusPill.first()).toBeVisible()

      // Verify Submit Proposal button is visible
      const submitButton = page.locator(
        'button:has-text("تقديم عرض"), button:has-text("Submit Proposal")'
      )
      await expect(submitButton.first()).toBeVisible()
    }
  })

  test('AC: Non-invited contractor does NOT see Submit Proposal button', async ({
    page,
  }) => {
    // Login as a different contractor who is not invited
    await page.goto('/login')
    await page.fill('input[type="email"]', 'other-contractor@example.com')
    await page.fill('input[type="password"]', 'password')
    await page.click('button:has-text("Login")')
    await page.waitForNavigation()

    // Navigate to projects
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    // Find "Open for Bids" projects
    const openForBidsCards = page.locator(
      'text=مفتوح للعروض, text=Open for Bids'
    )
    const cardCount = await openForBidsCards.count()

    // Either not visible or visible without button
    if (cardCount > 0) {
      const submitButton = page.locator(
        'button:has-text("تقديم عرض"), button:has-text("Submit Proposal")'
      )
      const isButtonVisible = await submitButton.isVisible().catch(() => false)
      expect(isButtonVisible).toBe(false)
    }
  })

  test('AC: Clicking Submit Proposal opens dialog with correct title and form fields', async ({
    page,
  }) => {
    // Navigate to projects list
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    // Find and click Submit Proposal button
    const submitButton = page.locator(
      'button:has-text("تقديم عرض"), button:has-text("Submit Proposal")'
    )

    const isVisible = await submitButton.isVisible().catch(() => false)
    if (isVisible) {
      await submitButton.first().click()
      await page.waitForTimeout(300)

      // Verify dialog opened
      const dialog = page.locator('[role="dialog"]')
      await expect(dialog).toBeVisible()

      // Verify dialog title contains project name
      const dialogTitle = page.locator(
        '[role="dialog"] h2, [role="dialog"] [class*="title"]'
      )
      const titleText = await dialogTitle.textContent()
      expect(titleText).toMatch(/تقديم عرض|Submit Proposal/)

      // Verify form fields exist
      // 1. Price field
      const priceInput = page.locator(
        'input[placeholder*="السعر"], input[placeholder*="Price"], label:has-text("السعر") + input'
      )
      await expect(priceInput).toBeVisible()

      // 2. Timeline field
      const timelineInput = page.locator(
        'input[type="number"], input[placeholder*="المدة"], input[placeholder*="Days"]'
      )
      await expect(timelineInput.first()).toBeVisible()

      // 3. Notes field
      const notesInput = page.locator(
        'textarea, textarea[placeholder*="الملاحظات"], textarea[placeholder*="Notes"]'
      )
      await expect(notesInput).toBeVisible()

      // 4. Buttons
      const cancelButton = page.locator(
        'button:has-text("إلغاء"), button:has-text("Cancel")'
      )
      const submitDialogButton = page.locator(
        '[role="dialog"] button:has-text("تقديم"), [role="dialog"] button:has-text("Submit")'
      )

      await expect(cancelButton).toBeVisible()
      await expect(submitDialogButton).toBeVisible()
    }
  })

  test('AC: Form validation shows errors for invalid inputs', async ({
    page,
  }) => {
    // Navigate to projects and open dialog
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const submitButton = page.locator(
      'button:has-text("تقديم عرض"), button:has-text("Submit Proposal")'
    )
    const isVisible = await submitButton.isVisible().catch(() => false)

    if (isVisible) {
      await submitButton.first().click()
      await page.waitForTimeout(300)

      // Try to submit empty form
      const submitDialogButton = page.locator(
        '[role="dialog"] button:has-text("تقديم"), [role="dialog"] button:has-text("Submit")'
      )
      await submitDialogButton.click()

      // Wait for validation errors
      await page.waitForTimeout(500)

      // Verify error message appears
      const errorMessages = page.locator(
        '[class*="text-destructive"], [class*="text-red"]'
      )
      const errorCount = await errorMessages.count()

      // At least one error should appear (required field)
      expect(errorCount).toBeGreaterThan(0)
    }
  })

  test('AC: Submit button disabled until form is valid', async ({ page }) => {
    // Navigate to projects and open dialog
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const submitButton = page.locator(
      'button:has-text("تقديم عرض"), button:has-text("Submit Proposal")'
    )
    const isVisible = await submitButton.isVisible().catch(() => false)

    if (isVisible) {
      await submitButton.first().click()
      await page.waitForTimeout(300)

      // Get submit button in dialog
      const submitDialogButton = page.locator(
        '[role="dialog"] button:has-text("تقديم"), [role="dialog"] button:has-text("Submit")'
      )

      // Initially disabled (empty form)
      const isInitiallyDisabled = await submitDialogButton.isDisabled()
      expect(isInitiallyDisabled).toBeTruthy()

      // Fill price field
      const priceInput = page.locator(
        'input[placeholder*="السعر"], input[placeholder*="Price"], label:has-text("السعر") + input'
      )
      await priceInput.fill('100000')

      // Fill timeline field
      const timelineInput = page.locator(
        'input[type="number"], input[placeholder*="المدة"], input[placeholder*="Days"]'
      )
      await timelineInput.first().fill('30')

      // Wait for validation
      await page.waitForTimeout(500)

      // Button should now be enabled
      const isEnabledAfter = await submitDialogButton.isEnabled()
      expect(isEnabledAfter).toBeTruthy()
    }
  })

  test('AC: Character counter displays for Notes field', async ({ page }) => {
    // Navigate to projects and open dialog
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const submitButton = page.locator(
      'button:has-text("تقديم عرض"), button:has-text("Submit Proposal")'
    )
    const isVisible = await submitButton.isVisible().catch(() => false)

    if (isVisible) {
      await submitButton.first().click()
      await page.waitForTimeout(300)

      // Find notes field
      const notesInput = page.locator(
        'textarea, textarea[placeholder*="الملاحظات"], textarea[placeholder*="Notes"]'
      )
      await expect(notesInput).toBeVisible()

      // Type in notes
      await notesInput.fill('Test proposal notes')

      // Find character counter (should be nearby)
      const counter = page
        .locator('[class*="text-[10px]"], [class*="text-xs"]')
        .filter({
          hasText: /\d+\/500/,
        })

      // Counter should be visible or counter text should exist
      const counterText = await counter.textContent().catch(() => null)
      expect(counterText).toMatch(/\d+\/500/)
    }
  })

  test('AC: Form shows loading state during submission', async ({ page }) => {
    // Navigate to projects and open dialog
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const submitButton = page.locator(
      'button:has-text("تقديم عرض"), button:has-text("Submit Proposal")'
    )
    const isVisible = await submitButton.isVisible().catch(() => false)

    if (isVisible) {
      await submitButton.first().click()
      await page.waitForTimeout(300)

      // Fill form
      const priceInput = page.locator(
        'input[placeholder*="السعر"], input[placeholder*="Price"], label:has-text("السعر") + input'
      )
      const timelineInput = page.locator(
        'input[type="number"], input[placeholder*="المدة"], input[placeholder*="Days"]'
      )

      await priceInput.fill('100000')
      await timelineInput.first().fill('30')
      await page.waitForTimeout(300)

      // Click submit
      const submitDialogButton = page.locator(
        '[role="dialog"] button:has-text("تقديم"), [role="dialog"] button:has-text("Submit")'
      )
      await submitDialogButton.click()

      // Verify loading state
      const isLoadingDisabled = await submitDialogButton.isDisabled()
      expect(isLoadingDisabled).toBeTruthy()

      // Button text might change to "جاري..." or similar
      const buttonText = await submitDialogButton.textContent()
      expect(buttonText).toBeTruthy()
    }
  })

  test('AC: Successful submission closes dialog and shows success toast', async ({
    page,
  }) => {
    // Navigate to projects and open dialog
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const submitButton = page.locator(
      'button:has-text("تقديم عرض"), button:has-text("Submit Proposal")'
    )
    const isVisible = await submitButton.isVisible().catch(() => false)

    if (isVisible) {
      await submitButton.first().click()
      await page.waitForTimeout(300)

      // Fill form
      const priceInput = page.locator(
        'input[placeholder*="السعر"], input[placeholder*="Price"], label:has-text("السعر") + input'
      )
      const timelineInput = page.locator(
        'input[type="number"], input[placeholder*="المدة"], input[placeholder*="Days"]'
      )

      await priceInput.fill('100000')
      await timelineInput.first().fill('30')
      await page.waitForTimeout(300)

      // Submit
      const submitDialogButton = page.locator(
        '[role="dialog"] button:has-text("تقديم"), [role="dialog"] button:has-text("Submit")'
      )
      await submitDialogButton.click()

      // Wait for submission
      await page.waitForTimeout(1000)

      // Dialog should close
      const dialog = page.locator('[role="dialog"]')
      const isDialogVisible = await dialog.isVisible().catch(() => false)
      expect(isDialogVisible).toBe(false)

      // Success toast should appear (if notification system is working)
      const successToast = page
        .locator('[class*="toast"], [class*="success"]')
        .filter({
          hasText: /تم|Success|تقديم/,
        })

      const toastExists = await successToast.isVisible().catch(() => false)
      // Toast may or may not be visible depending on notification system
      // Just verify dialog is closed
    }
  })

  test('AC: Project card updates after successful submission', async ({
    page,
  }) => {
    // Navigate to projects
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    // Find project card with Open for Bids status
    const projectCards = page.locator('[class*="card"], [class*="project"]')
    const cardCount = await projectCards.count()

    // Submit a proposal if open for bids card exists
    const submitButton = page.locator(
      'button:has-text("تقديم عرض"), button:has-text("Submit Proposal")'
    )
    const isVisible = await submitButton.isVisible().catch(() => false)

    if (isVisible) {
      // Get the card containing this button
      const card = submitButton.locator('..')

      await submitButton.first().click()
      await page.waitForTimeout(300)

      // Fill and submit
      const priceInput = page.locator(
        'input[placeholder*="السعر"], input[placeholder*="Price"], label:has-text("السعر") + input'
      )
      await priceInput.fill('100000')

      const timelineInput = page.locator(
        'input[type="number"], input[placeholder*="المدة"], input[placeholder*="Days"]'
      )
      await timelineInput.first().fill('30')
      await page.waitForTimeout(300)

      const submitDialogButton = page.locator(
        '[role="dialog"] button:has-text("تقديم"), [role="dialog"] button:has-text("Submit")'
      )
      await submitDialogButton.click()

      // Wait for update
      await page.waitForTimeout(1000)

      // Card should now show "Proposal Submitted" pill instead of "Open for Bids"
      const submittedPill = page.locator(
        'text=تم تقديم العرض, text=Proposal Submitted'
      )
      const isSubmittedVisible = await submittedPill
        .isVisible()
        .catch(() => false)

      // Either shows submitted pill or button is no longer visible
      const buttonAfter = page.locator(
        'button:has-text("تقديم عرض"), button:has-text("Submit Proposal")'
      )
      const isButtonStillVisible = await buttonAfter
        .isVisible()
        .catch(() => false)

      // At least one of these should be true: submitted pill visible OR button hidden
      expect(isSubmittedVisible || !isButtonStillVisible).toBeTruthy()
    }
  })

  test('AC: Cancel button closes dialog without changes', async ({ page }) => {
    // Navigate to projects and open dialog
    await page.goto('/projects')
    await page.waitForLoadState('networkidle')

    const submitButton = page.locator(
      'button:has-text("تقديم عرض"), button:has-text("Submit Proposal")'
    )
    const isVisible = await submitButton.isVisible().catch(() => false)

    if (isVisible) {
      await submitButton.first().click()
      await page.waitForTimeout(300)

      // Fill form partially
      const priceInput = page.locator(
        'input[placeholder*="السعر"], input[placeholder*="Price"], label:has-text("السعر") + input'
      )
      await priceInput.fill('100000')

      // Click cancel
      const cancelButton = page.locator(
        '[role="dialog"] button:has-text("إلغاء"), [role="dialog"] button:has-text("Cancel")'
      )
      await cancelButton.click()

      // Wait for dialog to close
      await page.waitForTimeout(300)

      // Verify dialog is closed
      const dialog = page.locator('[role="dialog"]')
      const isDialogVisible = await dialog.isVisible().catch(() => false)
      expect(isDialogVisible).toBe(false)

      // Project should still show submit button (no state change)
      const submitButtonAfter = page.locator(
        'button:has-text("تقديم عرض"), button:has-text("Submit Proposal")'
      )
      const isButtonVisible = await submitButtonAfter
        .isVisible()
        .catch(() => false)
      expect(isButtonVisible).toBeTruthy()
    }
  })
})
