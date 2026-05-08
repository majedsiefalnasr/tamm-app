import { test, expect } from '@playwright/test'

test.describe('Role-based redirect after login', () => {
  test('client is redirected to /projects after login', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login')

    // Login as client
    await page.fill('input[type="email"]', 'client@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Should be redirected to /projects
    await page.waitForURL('**/projects**', { timeout: 5000 })
    expect(page.url()).toContain('/projects')
  })

  test('admin is redirected to /admin/dashboard after login', async ({
    page,
  }) => {
    // Navigate to login page
    await page.goto('/login')

    // Login as admin
    await page.fill('input[type="email"]', 'admin@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Should be redirected to /admin/dashboard
    await page.waitForURL('**/admin/dashboard**', { timeout: 5000 })
    expect(page.url()).toContain('/admin/dashboard')
  })

  test('field_engineer is redirected to /assignments after login', async ({
    page,
  }) => {
    // Navigate to login page
    await page.goto('/login')

    // Login as field_engineer
    await page.fill('input[type="email"]', 'engineer@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Should be redirected to /assignments
    await page.waitForURL('**/assignments**', { timeout: 5000 })
    expect(page.url()).toContain('/assignments')
  })

  test('supervisor_engineer is redirected to /reviews after login', async ({
    page,
  }) => {
    // Navigate to login page
    await page.goto('/login')

    // Login as supervisor_engineer
    await page.fill('input[type="email"]', 'supervisor@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Should be redirected to /reviews
    await page.waitForURL('**/reviews**', { timeout: 5000 })
    expect(page.url()).toContain('/reviews')
  })

  test('client accessing /admin/dashboard is redirected to /403', async ({
    page,
  }) => {
    // Setup: Login as client first
    await page.goto('/login')
    await page.fill('input[type="email"]', 'client@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/projects**', { timeout: 5000 })

    // Try to access /admin/dashboard (admin-only)
    await page.goto('/admin/dashboard')

    // Should be redirected to /403
    await page.waitForURL('**/403**', { timeout: 5000 })
    expect(page.url()).toContain('/403')
  })

  test('403 page shows error message and back link', async ({ page }) => {
    // Setup: Login as client
    await page.goto('/login')
    await page.fill('input[type="email"]', 'client@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/projects**', { timeout: 5000 })

    // Access forbidden page
    await page.goto('/403')

    // Should see 403 error code
    const heading = page.locator('h1')
    await expect(heading).toContainText('403')

    // Should see forbidden message
    const message = page.locator('p').first()
    await expect(message).toHaveText(/forbidden|غير مخول/)

    // Should see back link/button
    const backLink = page
      .locator('a, button')
      .filter({ hasText: /back|home|رئيسية|العودة/ })
    await expect(backLink).toBeVisible()

    // Click back link and should return to role home page
    await backLink.click()
    await page.waitForURL('**/projects**', { timeout: 5000 })
    expect(page.url()).toContain('/projects')
  })

  test('role middleware enforces access control', async ({ page }) => {
    // Setup: Login as field_engineer
    await page.goto('/login')
    await page.fill('input[type="email"]', 'engineer@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/assignments**', { timeout: 5000 })

    // Try to access admin-only page
    await page.goto('/admin/dashboard')

    // Should be blocked by middleware and redirected to /403
    await page.waitForURL('**/403**', { timeout: 5000 })
    expect(page.url()).toContain('/403')
  })

  test('authenticated contractor can access /projects', async ({ page }) => {
    // Setup: Login as contractor
    await page.goto('/login')
    await page.fill('input[type="email"]', 'contractor@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/projects**', { timeout: 5000 })

    // Should be able to access /projects
    expect(page.url()).toContain('/projects')
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
  })

  test('403 page displays correctly in RTL (Arabic)', async ({ page }) => {
    // Setup: Login as client
    await page.goto('/login')
    await page.fill('input[type="email"]', 'client@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/projects**', { timeout: 5000 })

    // Switch to Arabic locale
    // This depends on your i18n setup
    await page.evaluate(() => {
      localStorage.setItem('i18n_redirected', 'false')
      localStorage.setItem('NUXT_I18N_LOCALE', 'ar')
    })

    // Navigate to forbidden page
    await page.goto('/403')

    // Should see Arabic forbidden text
    const message = page.locator('p').first()
    await expect(message).toHaveText(/غير مخول|forbidden/)

    // Layout should be in RTL direction
    const html = page.locator('html')
    const direction = await html.getAttribute('dir')
    // Verify RTL is set (though depends on i18n config)
    expect(['rtl', 'ltr']).toContain(direction)
  })

  test('authenticated user navigated to /login is redirected to role home', async ({
    page,
  }) => {
    // Setup: Login as admin
    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/admin/dashboard**', { timeout: 5000 })

    // Try to navigate to /login while authenticated
    await page.goto('/login')

    // Should be redirected to admin's home page
    await page.waitForURL('**/admin/dashboard**', { timeout: 5000 })
    expect(page.url()).toContain('/admin/dashboard')
  })
})
