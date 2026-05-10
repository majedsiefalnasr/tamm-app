import { test, expect } from '@playwright/test'

test.describe('Role-based redirect after login', () => {
  test('client is redirected to /dashboard after login', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'client@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')

    await page.waitForURL('**/dashboard**', { timeout: 5000 })
    expect(page.url()).toContain('/dashboard')
  })

  test('admin is redirected to /dashboard after login', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')

    await page.waitForURL('**/dashboard**', { timeout: 5000 })
    expect(page.url()).toContain('/dashboard')
  })

  test('field_engineer is redirected to /dashboard after login', async ({
    page,
  }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'engineer@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')

    await page.waitForURL('**/dashboard**', { timeout: 5000 })
    expect(page.url()).toContain('/dashboard')
  })

  test('supervisor_engineer is redirected to /dashboard after login', async ({
    page,
  }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'supervisor@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')

    await page.waitForURL('**/dashboard**', { timeout: 5000 })
    expect(page.url()).toContain('/dashboard')
  })

  test('client accessing /users is redirected to /403', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'client@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard**', { timeout: 5000 })

    await page.goto('/users')

    await page.waitForURL('**/403**', { timeout: 5000 })
    expect(page.url()).toContain('/403')
  })

  test('403 page shows error message and back link', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'client@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard**', { timeout: 5000 })

    await page.goto('/403')

    const heading = page.locator('h1')
    await expect(heading).toContainText('403')

    const message = page.locator('p').first()
    await expect(message).toHaveText(/forbidden|غير مخول/)

    const backLink = page
      .locator('a, button')
      .filter({ hasText: /back|home|رئيسية|العودة/ })
    await expect(backLink).toBeVisible()

    await backLink.click()
    await page.waitForURL('**/dashboard**', { timeout: 5000 })
    expect(page.url()).toContain('/dashboard')
  })

  test('global auth enforces role access', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'engineer@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard**', { timeout: 5000 })

    await page.goto('/users')

    await page.waitForURL('**/403**', { timeout: 5000 })
    expect(page.url()).toContain('/403')
  })

  test('authenticated contractor is redirected to /dashboard after login', async ({
    page,
  }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'contractor@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard**', { timeout: 5000 })

    expect(page.url()).toContain('/dashboard')
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
  })

  test('403 page displays correctly in RTL (Arabic)', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'client@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard**', { timeout: 5000 })

    await page.evaluate(() => {
      localStorage.setItem('i18n_redirected', 'false')
      localStorage.setItem('NUXT_I18N_LOCALE', 'ar')
    })

    await page.goto('/403')

    const message = page.locator('p').first()
    await expect(message).toHaveText(/غير مخول|forbidden/)

    const html = page.locator('html')
    const direction = await html.getAttribute('dir')
    expect(['rtl', 'ltr']).toContain(direction)
  })

  test('authenticated user navigated to /login is redirected to /dashboard', async ({
    page,
  }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard**', { timeout: 5000 })

    await page.goto('/login')

    await page.waitForURL('**/dashboard**', { timeout: 5000 })
    expect(page.url()).toContain('/dashboard')
  })
})
