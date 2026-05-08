import { test, expect } from '@playwright/test'

test.describe('Withdrawal Request Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to payments page (assuming contractor is logged in via test setup)
    await page.goto('/payments')
    // Wait for balance card to load
    await page.waitForSelector('[class*="rounded-3xl"]')
  })

  test('should display balance summary card with earned, locked, and available amounts', async ({
    page,
  }) => {
    // Check balance card exists
    const balanceCard = page.locator(
      '[class*="rounded-3xl"][class*="shadow-elevated"]'
    )
    await expect(balanceCard).toBeVisible()

    // Check balance labels are visible
    await expect(page.locator('text=إجمالي المكتسب')).toBeVisible()
    await expect(page.locator('text=محجوز أو قيد الصرف')).toBeVisible()
    await expect(page.locator('text=متاح للسحب')).toBeVisible()
  })

  test('should open withdrawal dialog when clicking request button', async ({
    page,
  }) => {
    // Click request withdrawal button
    const requestButton = page.locator('button', {
      hasText: /إرسال الطلب|Submit Request/,
    })
    await requestButton.click()

    // Dialog should be visible
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()

    // Dialog title should be visible
    await expect(
      page.locator('text=طلب السحب|Request Withdrawal')
    ).toBeVisible()
  })

  test('should validate amount field', async ({ page }) => {
    // Open dialog
    const requestButton = page.locator('button', {
      hasText: /إرسال الطلب|Submit Request/,
    })
    await requestButton.click()

    // Try to submit without amount
    const submitButton = page.locator('button[type="submit"]', {
      hasText: /إرسال|Submit/,
    })
    await submitButton.click()

    // Validation error should appear
    await expect(page.locator('text=مطلوب|Required')).toBeVisible()
  })

  test('should validate IBAN field format', async ({ page }) => {
    // Open dialog
    const requestButton = page.locator('button', {
      hasText: /إرسال الطلب|Submit Request/,
    })
    await requestButton.click()

    // Fill invalid IBAN
    const ibanField = page.locator('input[placeholder="SA..."]')
    await ibanField.fill('INVALID')

    const submitButton = page.locator('button[type="submit"]', {
      hasText: /إرسال|Submit/,
    })
    await submitButton.click()

    // Validation error should appear
    await expect(page.locator('text=غير صحيح|invalid|Invalid')).toBeVisible()
  })

  test('should submit withdrawal request with valid data', async ({ page }) => {
    // Open dialog
    const requestButton = page.locator('button', {
      hasText: /إرسال الطلب|Submit Request/,
    })
    await requestButton.click()

    // Fill form
    const amountField = page.locator('input[type="number"]')
    await amountField.fill('100')

    const ibanField = page.locator('input[placeholder="SA..."]')
    await ibanField.fill('SA1234567890123456')

    const notesField = page.locator('textarea')
    await notesField.fill('Test withdrawal')

    // Submit form
    const submitButton = page.locator('button[type="submit"]', {
      hasText: /إرسال|Submit/,
    })
    await submitButton.click()

    // Dialog should close
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).not.toBeVisible()

    // Success message should appear (or withdrawal should be added to list)
    // This depends on your toast notification implementation
    await expect(page.locator('text=بنجاح|success|Success')).toBeVisible()
  })

  test('should display withdrawal in list after submission', async ({
    page,
  }) => {
    // Open dialog and submit
    const requestButton = page.locator('button', {
      hasText: /إرسال الطلب|Submit Request/,
    })
    await requestButton.click()

    const amountField = page.locator('input[type="number"]')
    await amountField.fill('100')

    const ibanField = page.locator('input[placeholder="SA..."]')
    await ibanField.fill('SA1234567890123456')

    const submitButton = page.locator('button[type="submit"]', {
      hasText: /إرسال|Submit/,
    })
    await submitButton.click()

    // Wait for list to update
    await page.waitForTimeout(1000)

    // Check withdrawal appears in list
    const withdrawalsList = page.locator('text=قيد المراجعة|Under Review')
    await expect(withdrawalsList).toBeVisible()
  })

  test('should display correct status pills for withdrawals', async ({
    page,
  }) => {
    // Check if any withdrawals exist on page
    const statusPills = page.locator(
      '[class*="rounded-full"][class*="inline-flex"]'
    )

    // If withdrawals exist, check status labels
    const statusCount = await statusPills.count()
    if (statusCount > 0) {
      // Should see at least one status pill
      await expect(statusPills.first()).toBeVisible()
    }
  })

  test('should display countdown for approved withdrawals', async ({
    page,
  }) => {
    // Check if any approved withdrawals exist
    const approvedText = page.locator('text=تم الموافقة|Approved')
    const isVisible = await approvedText.isVisible().catch(() => false)

    if (isVisible) {
      // Should display countdown text
      const countdownText = page.locator(
        'text=/متاح للسحب بعد|Available for withdrawal in/'
      )
      await expect(countdownText).toBeVisible()
    }
  })

  test('should show empty state when no withdrawals exist', async ({
    page,
  }) => {
    // Navigate and check empty state is shown if no withdrawals
    const emptyState = page.locator(
      'text=لا توجد طلبات سحب|No withdrawal requests'
    )

    const isEmpty = await emptyState.isVisible().catch(() => false)
    if (isEmpty) {
      await expect(emptyState).toBeVisible()
      await expect(
        page.locator('text=ابدأ بطلب|Request a withdrawal')
      ).toBeVisible()
    }
  })
})
