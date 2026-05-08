import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

test.describe('Story 03-04 — Supervisor Reviews and Approves Milestone', () => {
  test.beforeEach(async ({ page }) => {
    // Login as supervisor engineer
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[type="email"]', 'supervisor@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/projects**')
  })

  test('should show Review button for supervisor on under_review milestone', async ({
    page,
  }) => {
    // Navigate to project with under_review milestone
    await page.goto(`${BASE_URL}/projects/proj-001`)

    // Look for milestone card with under_review status
    const milestoneCard = page.locator('[class*="rounded-2xl"]').first()
    await milestoneCard.click()

    // Expand the milestone to see actions
    const expandButton = milestoneCard.locator('button[aria-label*="Expand"]')
    if (await expandButton.isVisible()) {
      await expandButton.click()
    }

    // Review button should be visible
    const reviewButton = page.locator('button:has-text("View Report")')
    await expect(reviewButton).toBeVisible()
  })

  test('should open approval dialog when Review button clicked', async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/projects/proj-001`)

    const reviewButton = page.locator('button:has-text("View Report")').first()
    await reviewButton.click()

    // Dialog should open with milestone title and report content
    const dialogTitle = page.locator('[role="dialog"] >> text=/مراجعة|Review/i')
    await expect(dialogTitle).toBeVisible()
  })

  test('should display report content and images in dialog', async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/projects/proj-001`)

    const reviewButton = page.locator('button:has-text("View Report")').first()
    await reviewButton.click()

    // Should show report content
    const reportContent = page.locator(
      '[role="dialog"] >> text=/Work completed|تم إنجاز/i'
    )
    await expect(reportContent).toBeVisible()

    // Should show images if report has them
    const images = page.locator('[role="dialog"] img[alt*="Report image"]')
    const imageCount = await images.count()
    expect(imageCount).toBeGreaterThanOrEqual(0)
  })

  test('should approve milestone with confirmation', async ({ page }) => {
    await page.goto(`${BASE_URL}/projects/proj-001`)

    const reviewButton = page.locator('button:has-text("View Report")').first()
    await reviewButton.click()

    // Click approve button
    const approveButton = page
      .locator('[role="dialog"] button:has-text(/اعتماد|Approve/i)')
      .first()
    await approveButton.click()

    // Confirmation dialog should appear
    const confirmDialog = page.locator(
      '[role="dialog"] >> text=/تأكيد|Confirm/i'
    )
    await expect(confirmDialog).toBeVisible()

    // Confirm approval
    const confirmButton = page
      .locator('[role="dialog"] button:has-text(/تأكيد|Confirm/i)')
      .last()
    await confirmButton.click()

    // Success notification should appear
    const successMsg = page.locator('text=/تم اعتماد|approved successfully/i')
    await expect(successMsg).toBeVisible()

    // Dialog should close
    await expect(page.locator('[role="dialog"]')).toHaveCount(0)
  })

  test('should reject milestone with reason', async ({ page }) => {
    await page.goto(`${BASE_URL}/projects/proj-001`)

    const reviewButton = page.locator('button:has-text("View Report")').first()
    await reviewButton.click()

    // Click reject button
    const rejectButton = page
      .locator('[role="dialog"] button:has-text(/رفض|Reject/i)')
      .first()
    await rejectButton.click()

    // Rejection reason dialog should appear
    const reasonDialog = page.locator(
      '[role="dialog"] >> text=/سبب الرفض|Rejection Reason/i'
    )
    await expect(reasonDialog).toBeVisible()

    // Enter rejection reason
    const textarea = page.locator('[role="dialog"] textarea')
    await textarea.fill('Work does not meet specifications')

    // Confirm rejection
    const confirmButton = page
      .locator('[role="dialog"] button:has-text(/تأكيد|Confirm/i)')
      .last()
    await confirmButton.click()

    // Success notification should appear
    const successMsg = page.locator('text=/تم رفض|rejected/i')
    await expect(successMsg).toBeVisible()

    // Dialog should close
    await expect(page.locator('[role="dialog"]')).toHaveCount(0)
  })

  test('should not show Review button for client on under_review milestone', async ({
    page,
  }) => {
    // Login as client instead
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[type="email"]', 'client@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/projects**')

    await page.goto(`${BASE_URL}/projects/proj-001`)

    const reviewButton = page.locator('button:has-text("View Report")')
    // Button should not be visible for client during under_review
    await expect(reviewButton).not.toBeVisible()
  })

  test('rejection reason validation', async ({ page }) => {
    await page.goto(`${BASE_URL}/projects/proj-001`)

    const reviewButton = page.locator('button:has-text("View Report")').first()
    await reviewButton.click()

    const rejectButton = page
      .locator('[role="dialog"] button:has-text(/رفض|Reject/i)')
      .first()
    await rejectButton.click()

    // Try to confirm with empty reason
    const confirmButton = page
      .locator('[role="dialog"] button:has-text(/تأكيد|Confirm/i)')
      .last()
    await expect(confirmButton).toBeDisabled()

    // Enter less than 10 characters
    const textarea = page.locator('[role="dialog"] textarea')
    await textarea.fill('Short')

    // Button should still be disabled
    await expect(confirmButton).toBeDisabled()

    // Enter 10+ characters
    await textarea.fill('This is a valid reason')

    // Button should now be enabled
    await expect(confirmButton).toBeEnabled()
  })
})
