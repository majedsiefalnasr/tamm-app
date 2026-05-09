# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/e2e/story-07-01-open-for-bids.spec.ts >> Story 07-01 — Admin Opens Bidding and Invites Contractors >> Dialog contains contractor selection
- Location: tests/e2e/story-07-01-open-for-bids.spec.ts:38:3

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
  3   | test.describe('Story 07-01 — Admin Opens Bidding and Invites Contractors', () => {
  4   |   test.beforeEach(async ({ page }) => {
  5   |     // Login as admin
> 6   |     await page.goto('/login')
      |                ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  7   |     await page.fill('input[name="identifier"]', 'admin@tamm.local')
  8   |     await page.fill('input[name="password"]', 'admin123456')
  9   |     await page.click('button[type="submit"]')
  10  |     await page.waitForURL('/')
  11  |   })
  12  |
  13  |   test('Button is visible only to admin when project status is "new"', async ({
  14  |     page,
  15  |   }) => {
  16  |     // Navigate to project with status = new
  17  |     await page.goto('/projects/proj-003')
  18  |     await page.waitForLoadState('networkidle')
  19  |
  20  |     // Check that button is visible
  21  |     const openBidsButton = page.locator('button:has-text("Open for Bids")')
  22  |     await expect(openBidsButton).toBeVisible()
  23  |     await expect(openBidsButton).not.toBeDisabled()
  24  |   })
  25  |
  26  |   test('Dialog opens when button is clicked', async ({ page }) => {
  27  |     await page.goto('/projects/proj-003')
  28  |     await page.waitForLoadState('networkidle')
  29  |
  30  |     const openBidsButton = page.locator('button:has-text("Open for Bids")')
  31  |     await openBidsButton.click()
  32  |
  33  |     // Check dialog is visible
  34  |     const dialog = page.locator('[role="dialog"]')
  35  |     await expect(dialog).toBeVisible()
  36  |   })
  37  |
  38  |   test('Dialog contains contractor selection', async ({ page }) => {
  39  |     await page.goto('/projects/proj-003')
  40  |     await page.waitForLoadState('networkidle')
  41  |
  42  |     const openBidsButton = page.locator('button:has-text("Open for Bids")')
  43  |     await openBidsButton.click()
  44  |
  45  |     // Wait for contractors to load
  46  |     await page.waitForTimeout(500)
  47  |
  48  |     // Check for contractor items
  49  |     const contractorItems = page.locator(
  50  |       '[role="dialog"] input[type="checkbox"]'
  51  |     )
  52  |     const count = await contractorItems.count()
  53  |
  54  |     expect(count).toBeGreaterThan(0)
  55  |   })
  56  |
  57  |   test('Confirm button is disabled when no contractors selected', async ({
  58  |     page,
  59  |   }) => {
  60  |     await page.goto('/projects/proj-003')
  61  |     await page.waitForLoadState('networkidle')
  62  |
  63  |     const openBidsButton = page.locator('button:has-text("Open for Bids")')
  64  |     await openBidsButton.click()
  65  |
  66  |     await page.waitForTimeout(500)
  67  |
  68  |     // Find confirm button
  69  |     const confirmButton = page.locator(
  70  |       '[role="dialog"] button:has-text("Open for Bids")'
  71  |     )
  72  |     await expect(confirmButton).toBeDisabled()
  73  |   })
  74  |
  75  |   test('Confirm button is enabled after selecting contractors', async ({
  76  |     page,
  77  |   }) => {
  78  |     await page.goto('/projects/proj-003')
  79  |     await page.waitForLoadState('networkidle')
  80  |
  81  |     const openBidsButton = page.locator('button:has-text("Open for Bids")')
  82  |     await openBidsButton.click()
  83  |
  84  |     await page.waitForTimeout(500)
  85  |
  86  |     // Select first contractor
  87  |     const firstCheckbox = page
  88  |       .locator('[role="dialog"] input[type="checkbox"]')
  89  |       .first()
  90  |     await firstCheckbox.click()
  91  |
  92  |     // Find confirm button
  93  |     const confirmButton = page.locator(
  94  |       '[role="dialog"] button:has-text("Open for Bids")'
  95  |     )
  96  |     await expect(confirmButton).not.toBeDisabled()
  97  |   })
  98  |
  99  |   test('Completes open for bids workflow', async ({ page }) => {
  100 |     await page.goto('/projects/proj-003')
  101 |     await page.waitForLoadState('networkidle')
  102 |
  103 |     // Open dialog
  104 |     const openBidsButton = page.locator('button:has-text("Open for Bids")')
  105 |     await openBidsButton.click()
  106 |
```
