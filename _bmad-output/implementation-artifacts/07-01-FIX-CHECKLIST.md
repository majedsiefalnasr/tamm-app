# Story 07-01 — Fix & Verification Checklist

Use this checklist to track fixes and ensure all issues are addressed before re-submitting for review.

---

## Phase 1: Critical Blockers (40 min)

### ✋ CRITICAL #1: Hardcoded Error Message
- [ ] Add i18n key `projects.openForBids.noContractorsAvailable` to `en.json`
- [ ] Add Arabic translation to `ar.json`
- [ ] Update `OpenForBidsDialog.vue` line 118 to use `t()` function
- [ ] Test in English: Should see "No contractors available"
- [ ] Test in Arabic: Should see Arabic translation
- [ ] Verify no console errors

**Time:** 5 min

---

### ✋ CRITICAL #2: Helper Text Not Always Visible
- [ ] Remove conditional `v-if="!loading && contractors.length > 0"` from helper text
- [ ] Make helper text always visible (even when loading)
- [ ] Adjust CSS to show count only when contractors exist:
  ```vue
  <p class="text-muted-foreground text-xs">
    {{ t('projects.openForBids.helperText') }}
    <span v-if="contractors.length > 0" class="ms-2">
      ({{ selectedContractors.length }}/{{ contractors.length }})
    </span>
  </p>
  ```
- [ ] Test: Helper text visible immediately when dialog opens
- [ ] Test: Count updates as selections change
- [ ] Verify layout doesn't break

**Time:** 10 min

---

### ✋ CRITICAL #3: No Loading Toast
- [ ] Add loading toast before API calls in `handleOpenForBidsSubmitted`:
  ```ts
  useNotification().info(t('projects.openForBids.loadingMessage'))
  ```
- [ ] Verify key exists in i18n (`projects.openForBids.loadingMessage`)
- [ ] Test: Toast appears when confirm button clicked
- [ ] Test: Toast disappears after success
- [ ] Test: Toast dismissed if user closes dialog during loading
- [ ] Verify timing (should appear immediately)

**Time:** 15 min

---

### ✋ CRITICAL #4: Race Condition on Double-Click
- [ ] Add guard in `handleOpenForBidsSubmitted`:
  ```ts
  if (isSubmittingBids.value) return
  ```
- [ ] Set `isSubmittingBids.value = true` BEFORE any state changes
- [ ] Disable confirm button while submitting:
  ```vue
  :disabled="!canConfirm || isSubmittingBids"
  ```
- [ ] Test: Double-click confirm button quickly
- [ ] Verify: Only one API request is made
- [ ] Verify: Button stays disabled throughout
- [ ] Test: Dialog closes only once on success

**Time:** 10 min

---

## Phase 2: High Priority Issues (50 min)

### 🟠 HIGH #5: Missing Subtitle Element
- [ ] Add subtitle section in DialogHeader:
  ```vue
  <DialogHeader>
    <DialogTitle>
      {{ t('projects.openForBids.dialogTitle') }}{{ projectName }}
    </DialogTitle>
    <p class="text-muted-foreground text-sm mt-2">
      {{ t('projects.openForBids.selectContractorsSubtitle') }}
    </p>
  </DialogHeader>
  ```
- [ ] Add i18n key: `projects.openForBids.selectContractorsSubtitle`
- [ ] Test: Subtitle appears distinct below title
- [ ] Verify: No duplication of instructional text
- [ ] Check: RTL alignment correct in Arabic

**Time:** 5 min

---

### 🟠 HIGH #6: Checkbox Component Consistency
- [ ] Import `Checkbox` from shadcn-vue:
  ```ts
  import { Checkbox } from '~/components/ui/checkbox'
  ```
- [ ] Replace raw `<input>` with `<Checkbox>` component (lines 125-130)
- [ ] Update event binding to use `@update:checked`:
  ```vue
  <Checkbox
    :id="`contractor-${contractor.id}`"
    :checked="isSelected(contractor.id)"
    @update:checked="toggleContractor(contractor.id)"
  />
  ```
- [ ] Test: Checkbox works correctly (toggle on/off)
- [ ] Test: Visual styling matches other form components
- [ ] Test: Accessibility (keyboard navigation, labels)
- [ ] Verify: Consistent with `AssignEngineersForm` component

**Time:** 15 min

---

### 🟠 HIGH #7: No Validation Error Display
- [ ] Add error ref in component:
  ```ts
  const validationError = ref<string | null>(null)
  ```
- [ ] Update `handleConfirm` to show error if validation fails:
  ```ts
  const handleConfirm = () => {
    validationError.value = null
    if (selectedContractors.value.length === 0) {
      validationError.value = t('projects.openForBids.helperText')
      return
    }
    emit('submitted', selectedContractors.value)
  }
  ```
- [ ] Add error display in template (before or after contractor list)
- [ ] Test: Error message appears if user tries to confirm with 0 selected
- [ ] Test: Error clears when user selects a contractor
- [ ] Verify: Error message is i18n'ed

**Time:** 10 min

---

### 🟠 HIGH #8: Unsafe API Error Handling
- [ ] Update `inviteContractors` call to properly handle errors:
  ```ts
  try {
    await useProjects().inviteContractors(id, contractorIds)
  } catch (err) {
    // Check if truly 404 (endpoint doesn't exist)
    const is404 = 
      (err instanceof Error && err.message.includes('404')) ||
      (err?.response?.status === 404)
    
    if (!is404) {
      throw err  // Re-throw non-404 errors to abort transaction
    }
    // Continue only for 404 (endpoint doesn't exist)
  }
  ```
- [ ] Test: If endpoint returns 500, transaction is aborted
- [ ] Test: If endpoint returns 404, transaction continues to status update
- [ ] Test: Success message only shows if both API calls succeed
- [ ] Test: Error toast shows with appropriate message if either call fails
- [ ] Verify: Comment explains the 404 check

**Time:** 10 min

---

## Phase 3: Test Updates (30 min)

### 📝 E2E Test Coverage
- [ ] Add test: Loading toast appears during API call
  ```ts
  test('shows loading toast during submission', async ({ page }) => {
    // Open dialog, select contractors, click confirm
    // Check that loading toast appears
    // Wait for success toast
  })
  ```

- [ ] Add test: Error handling when API fails
  ```ts
  test('shows error toast when API fails', async ({ page }) => {
    // Mock API failure
    // Click confirm
    // Verify error toast appears
    // Verify dialog remains open for retry
  })
  ```

- [ ] Add test: Helper text always visible
  ```ts
  test('helper text is always visible', async ({ page }) => {
    const openBidsButton = page.locator('button:has-text("Open for Bids")')
    await openBidsButton.click()
    
    // Check helper text visible during loading
    const helperText = page.locator('[class*="text-xs"]')
    await expect(helperText).toContainText('Select at least one contractor')
  })
  ```

- [ ] Add test: Non-admin users cannot see button
  ```ts
  test('button hidden for non-admin users', async ({ page }) => {
    // Login as contractor (not admin)
    // Navigate to project
    // Verify "Open for Bids" button is NOT visible
  })
  ```

- [ ] Add test: Button hidden when status ≠ "new"
  ```ts
  test('button hidden when project status is not "new"', async ({ page }) => {
    // Navigate to project with status = "active"
    // Verify "Open for Bids" button is NOT visible
  })
  ```

**Time:** 30 min

---

## Phase 4: RTL Verification (15 min)

### 🌐 Arabic RTL Testing
- [ ] Switch app to Arabic locale
- [ ] Open project detail page (status = "new")
- [ ] Click "فتح باب العروض" (Open for Bids) button
- [ ] Verify dialog layout:
  - [ ] Title reads right-to-left correctly
  - [ ] Subtitle positioned properly
  - [ ] Contractor list items are right-aligned
  - [ ] Checkboxes positioned on correct side
  - [ ] Button order: Cancel → Confirm (left-to-right in RTL = right-to-left visually)
- [ ] Select contractors, click confirm
- [ ] Verify all text is Arabic (no English leaking through)
- [ ] Test: Dialog closes after success
- [ ] Test: Status badge updates to Arabic "مفتوح للعروض"

**Time:** 15 min

---

## Phase 5: Final Checks (10 min)

### ✅ Code Quality
- [ ] No console errors or warnings
- [ ] TypeScript strict mode — no `any` types
- [ ] No unused imports
- [ ] No commented-out code
- [ ] Formatting follows project style

### ✅ Accessibility
- [ ] Labels associated with checkboxes (`:for` attribute)
- [ ] Dialog has proper `role="dialog"`
- [ ] Keyboard navigation works (Tab through checkboxes)
- [ ] Error messages are announced to screen readers

### ✅ Browser Testing
- [ ] Chrome: Works correctly
- [ ] Firefox: Works correctly
- [ ] Safari: Works correctly (if available)
- [ ] Mobile responsive: Dialog adapts to small screens

**Time:** 10 min

---

## Sign-Off Checklist

Before re-submitting for code review:

- [ ] All CRITICAL issues (#1-4) fixed and tested
- [ ] All HIGH issues (#5-8) fixed and tested
- [ ] E2E tests updated with new coverage
- [ ] RTL tested in Arabic
- [ ] No console errors
- [ ] TypeScript strict mode passes
- [ ] All i18n keys added (EN + AR)
- [ ] Git history is clean (logical commits)

---

## Commit Strategy

After fixes are complete, create commits like this:

```bash
git add app/components/project/OpenForBidsDialog.vue
git commit -m "fix: Story 07-01 — Address critical issues #1-4

- Add i18n key for 'No contractors available' (fixes hardcoded text)
- Always show helper text (violates AC, now fixed)
- Show loading toast during API call (improves UX)
- Add guard against double-click race condition

Fixes: #1, #2, #3, #4"

git add app/pages/projects/[id].vue
git commit -m "fix: Story 07-01 — Address high-priority issues #5-8

- Add subtitle element to dialog (AC requirement)
- Improve API error handling (check actual status, not just message)
- Add validation error display on confirm

Fixes: #5, #8"

git add app/components/project/OpenForBidsDialog.vue
git commit -m "fix: Story 07-01 — Replace checkbox with shadcn-vue component

- Use <Checkbox> component instead of raw <input>
- Consistent with other admin forms (AssignEngineersForm pattern)

Fixes: #6, #7"

git add tests/e2e/story-07-01-open-for-bids.spec.ts
git commit -m "test: Story 07-01 — Add test coverage for error handling

- Add test: loading toast during submission
- Add test: error handling when API fails
- Add test: helper text always visible
- Add test: non-admin users cannot see button
- Add test: button hidden when status != 'new'"
```

---

## Re-Review Process

Once all fixes are complete:

1. Push fixes to `lovable` branch
2. Create new git range (e.g., `develop...lovable` again)
3. Run code review again: `/bmad-code-review`
4. Spot-check fixes against original findings
5. Verify test additions pass
6. Mark story as `done` in sprint status

---

**Estimated Total Fix Time:** 2–2.5 hours  
**Start Time:** [Your time]  
**Target Completion:** [Estimated completion]

Good luck! 🚀
