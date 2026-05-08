# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/role-based-redirect.spec.ts >> Role-based redirect after login >> client is redirected to /projects after login
- Location: tests/role-based-redirect.spec.ts:4:3

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/login", waiting until "load"

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   |
  3   | test.describe('Role-based redirect after login', () => {
  4   |   test('client is redirected to /projects after login', async ({ page }) => {
  5   |     // Navigate to login page
> 6   |     await page.goto('/login')
      |                ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  7   |
  8   |     // Login as client
  9   |     await page.fill('input[type="email"]', 'client@example.com')
  10  |     await page.fill('input[type="password"]', 'password123')
  11  |     await page.click('button[type="submit"]')
  12  |
  13  |     // Should be redirected to /projects
  14  |     await page.waitForURL('**/projects**', { timeout: 5000 })
  15  |     expect(page.url()).toContain('/projects')
  16  |   })
  17  |
  18  |   test('admin is redirected to /admin/dashboard after login', async ({
  19  |     page,
  20  |   }) => {
  21  |     // Navigate to login page
  22  |     await page.goto('/login')
  23  |
  24  |     // Login as admin
  25  |     await page.fill('input[type="email"]', 'admin@example.com')
  26  |     await page.fill('input[type="password"]', 'password123')
  27  |     await page.click('button[type="submit"]')
  28  |
  29  |     // Should be redirected to /admin/dashboard
  30  |     await page.waitForURL('**/admin/dashboard**', { timeout: 5000 })
  31  |     expect(page.url()).toContain('/admin/dashboard')
  32  |   })
  33  |
  34  |   test('field_engineer is redirected to /assignments after login', async ({
  35  |     page,
  36  |   }) => {
  37  |     // Navigate to login page
  38  |     await page.goto('/login')
  39  |
  40  |     // Login as field_engineer
  41  |     await page.fill('input[type="email"]', 'engineer@example.com')
  42  |     await page.fill('input[type="password"]', 'password123')
  43  |     await page.click('button[type="submit"]')
  44  |
  45  |     // Should be redirected to /assignments
  46  |     await page.waitForURL('**/assignments**', { timeout: 5000 })
  47  |     expect(page.url()).toContain('/assignments')
  48  |   })
  49  |
  50  |   test('supervisor_engineer is redirected to /reviews after login', async ({
  51  |     page,
  52  |   }) => {
  53  |     // Navigate to login page
  54  |     await page.goto('/login')
  55  |
  56  |     // Login as supervisor_engineer
  57  |     await page.fill('input[type="email"]', 'supervisor@example.com')
  58  |     await page.fill('input[type="password"]', 'password123')
  59  |     await page.click('button[type="submit"]')
  60  |
  61  |     // Should be redirected to /reviews
  62  |     await page.waitForURL('**/reviews**', { timeout: 5000 })
  63  |     expect(page.url()).toContain('/reviews')
  64  |   })
  65  |
  66  |   test('client accessing /admin/dashboard is redirected to /403', async ({
  67  |     page,
  68  |   }) => {
  69  |     // Setup: Login as client first
  70  |     await page.goto('/login')
  71  |     await page.fill('input[type="email"]', 'client@example.com')
  72  |     await page.fill('input[type="password"]', 'password123')
  73  |     await page.click('button[type="submit"]')
  74  |     await page.waitForURL('**/projects**', { timeout: 5000 })
  75  |
  76  |     // Try to access /admin/dashboard (admin-only)
  77  |     await page.goto('/admin/dashboard')
  78  |
  79  |     // Should be redirected to /403
  80  |     await page.waitForURL('**/403**', { timeout: 5000 })
  81  |     expect(page.url()).toContain('/403')
  82  |   })
  83  |
  84  |   test('403 page shows error message and back link', async ({ page }) => {
  85  |     // Setup: Login as client
  86  |     await page.goto('/login')
  87  |     await page.fill('input[type="email"]', 'client@example.com')
  88  |     await page.fill('input[type="password"]', 'password123')
  89  |     await page.click('button[type="submit"]')
  90  |     await page.waitForURL('**/projects**', { timeout: 5000 })
  91  |
  92  |     // Access forbidden page
  93  |     await page.goto('/403')
  94  |
  95  |     // Should see 403 error code
  96  |     const heading = page.locator('h1')
  97  |     await expect(heading).toContainText('403')
  98  |
  99  |     // Should see forbidden message
  100 |     const message = page.locator('p').first()
  101 |     await expect(message).toHaveText(/forbidden|غير مخول/)
  102 |
  103 |     // Should see back link/button
  104 |     const backLink = page
  105 |       .locator('a, button')
  106 |       .filter({ hasText: /back|home|رئيسية|العودة/ })
```
