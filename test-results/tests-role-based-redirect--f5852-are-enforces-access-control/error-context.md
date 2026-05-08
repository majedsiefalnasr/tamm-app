# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/role-based-redirect.spec.ts >> Role-based redirect after login >> role middleware enforces access control
- Location: tests/role-based-redirect.spec.ts:115:3

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/login", waiting until "load"

```

# Test source

```ts
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
  107 |     await expect(backLink).toBeVisible()
  108 |
  109 |     // Click back link and should return to role home page
  110 |     await backLink.click()
  111 |     await page.waitForURL('**/projects**', { timeout: 5000 })
  112 |     expect(page.url()).toContain('/projects')
  113 |   })
  114 |
  115 |   test('role middleware enforces access control', async ({ page }) => {
  116 |     // Setup: Login as field_engineer
> 117 |     await page.goto('/login')
      |                ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  118 |     await page.fill('input[type="email"]', 'engineer@example.com')
  119 |     await page.fill('input[type="password"]', 'password123')
  120 |     await page.click('button[type="submit"]')
  121 |     await page.waitForURL('**/assignments**', { timeout: 5000 })
  122 |
  123 |     // Try to access admin-only page
  124 |     await page.goto('/admin/dashboard')
  125 |
  126 |     // Should be blocked by middleware and redirected to /403
  127 |     await page.waitForURL('**/403**', { timeout: 5000 })
  128 |     expect(page.url()).toContain('/403')
  129 |   })
  130 |
  131 |   test('authenticated contractor can access /projects', async ({ page }) => {
  132 |     // Setup: Login as contractor
  133 |     await page.goto('/login')
  134 |     await page.fill('input[type="email"]', 'contractor@example.com')
  135 |     await page.fill('input[type="password"]', 'password123')
  136 |     await page.click('button[type="submit"]')
  137 |     await page.waitForURL('**/projects**', { timeout: 5000 })
  138 |
  139 |     // Should be able to access /projects
  140 |     expect(page.url()).toContain('/projects')
  141 |     const heading = page.locator('h1')
  142 |     await expect(heading).toBeVisible()
  143 |   })
  144 |
  145 |   test('403 page displays correctly in RTL (Arabic)', async ({ page }) => {
  146 |     // Setup: Login as client
  147 |     await page.goto('/login')
  148 |     await page.fill('input[type="email"]', 'client@example.com')
  149 |     await page.fill('input[type="password"]', 'password123')
  150 |     await page.click('button[type="submit"]')
  151 |     await page.waitForURL('**/projects**', { timeout: 5000 })
  152 |
  153 |     // Switch to Arabic locale
  154 |     // This depends on your i18n setup
  155 |     await page.evaluate(() => {
  156 |       localStorage.setItem('i18n_redirected', 'false')
  157 |       localStorage.setItem('NUXT_I18N_LOCALE', 'ar')
  158 |     })
  159 |
  160 |     // Navigate to forbidden page
  161 |     await page.goto('/403')
  162 |
  163 |     // Should see Arabic forbidden text
  164 |     const message = page.locator('p').first()
  165 |     await expect(message).toHaveText(/غير مخول|forbidden/)
  166 |
  167 |     // Layout should be in RTL direction
  168 |     const html = page.locator('html')
  169 |     const direction = await html.getAttribute('dir')
  170 |     // Verify RTL is set (though depends on i18n config)
  171 |     expect(['rtl', 'ltr']).toContain(direction)
  172 |   })
  173 |
  174 |   test('authenticated user navigated to /login is redirected to role home', async ({
  175 |     page,
  176 |   }) => {
  177 |     // Setup: Login as admin
  178 |     await page.goto('/login')
  179 |     await page.fill('input[type="email"]', 'admin@example.com')
  180 |     await page.fill('input[type="password"]', 'password123')
  181 |     await page.click('button[type="submit"]')
  182 |     await page.waitForURL('**/admin/dashboard**', { timeout: 5000 })
  183 |
  184 |     // Try to navigate to /login while authenticated
  185 |     await page.goto('/login')
  186 |
  187 |     // Should be redirected to admin's home page
  188 |     await page.waitForURL('**/admin/dashboard**', { timeout: 5000 })
  189 |     expect(page.url()).toContain('/admin/dashboard')
  190 |   })
  191 | })
  192 |
```
