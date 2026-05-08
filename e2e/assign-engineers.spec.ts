import { test, expect } from '@playwright/test'

test.describe('Assign Engineers to Project', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button:has-text("Login")')
    await page.waitForURL('/dashboard')
  })

  test('should open assign engineers dialog when button is clicked', async ({
    page,
  }) => {
    // Navigate to project detail
    await page.goto('/projects/proj-001')

    // Find and click assign engineers button
    const assignButton = page.locator('button:has-text("Assign Engineers")')
    await expect(assignButton).toBeVisible()
    await assignButton.click()

    // Dialog should open
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()
  })

  test('should show validation errors for required fields', async ({
    page,
  }) => {
    // Navigate to project detail
    await page.goto('/projects/proj-001')

    // Open dialog
    await page.locator('button:has-text("Assign Engineers")').click()

    // Try to submit empty form
    await page.locator('button:has-text("Save")').click()

    // Should show validation errors
    const errors = page.locator('.text-destructive')
    await expect(errors.first()).toBeVisible()
  })

  test('should validate that same engineer cannot be assigned to both roles', async ({
    page,
  }) => {
    // Navigate to project detail
    await page.goto('/projects/proj-001')

    // Open dialog
    await page.locator('button:has-text("Assign Engineers")').click()

    // Select same engineer for both roles
    const supervisorSelect = page.locator('[id="supervisor"]').first()
    await supervisorSelect.click()
    await page.locator('button:has-text("Ahmed Engineer")').first().click()

    const fieldSelect = page.locator('[id="field"]').first()
    await fieldSelect.click()
    await page.locator('button:has-text("Ahmed Engineer")').nth(1).click()

    // Submit
    await page.locator('button:has-text("Save")').click()

    // Should show same engineer error
    const error = page.locator('text=Cannot assign the same engineer')
    await expect(error).toBeVisible()
  })

  test('should successfully assign engineers', async ({ page }) => {
    // Navigate to project detail
    await page.goto('/projects/proj-001')

    // Open dialog
    await page.locator('button:has-text("Assign Engineers")').click()

    // Select different engineers
    const supervisorSelect = page.locator('[id="supervisor"]').first()
    await supervisorSelect.click()
    await page.locator('button:has-text("Ahmed Engineer")').first().click()

    const fieldSelect = page.locator('[id="field"]').first()
    await fieldSelect.click()
    await page.locator('button:has-text("Fatima Engineer")').first().click()

    // Submit
    await page.locator('button:has-text("Save")').click()

    // Should close dialog and show success
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).not.toBeVisible()

    // Toast should show success message
    const toast = page.locator('text=Engineers assigned successfully')
    await expect(toast).toBeVisible()
  })
})
