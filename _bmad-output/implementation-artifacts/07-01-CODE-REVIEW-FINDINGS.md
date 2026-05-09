# Story 07-01 Code Review — Detailed Findings Report

**Story:** Admin Opens Bidding and Invites Contractors  
**Reviewed:** 2026-05-09  
**Status:** ⚠️ **NOT READY FOR MERGE** — 8 HIGH/CRITICAL findings require fixes  
**Review Method:** Adversarial (Blind Hunter + Edge Case Hunter + Acceptance Auditor)

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Total Findings | 20 |
| CRITICAL | 3 |
| HIGH | 5 |
| MEDIUM | 8 |
| LOW | 4 |
| Spec Compliance | 3/23 AC at risk |
| Estimated Fix Time | 2–3 hours |

---

## CRITICAL FINDINGS — Must Fix Before Merge

### 🔴 CRITICAL #1: Hardcoded Error Message (Missing i18n)

**Location:** `app/components/project/OpenForBidsDialog.vue:118`

**Severity:** HIGH  
**Category:** i18n/Localization  
**AC Violated:** "All text uses i18n keys (no hardcoded strings)" (CLAUDE.md §0.2, line 101)

**Code:**
```vue
<div
  v-if="contractors.length === 0"
  class="text-muted-foreground text-center text-sm"
>
  No contractors available                          <!-- ❌ HARDCODED -->
</div>
```

**Issue:**
- English text "No contractors available" is hardcoded in template
- Violates CLAUDE.md rule: "no hardcoded UI text in templates — must go through i18n"
- Arabic users see English text when contractor list is empty

**Fix:**
1. Add i18n key to `i18n/locales/en.json`:
```json
{
  "projects": {
    "openForBids": {
      "noContractorsAvailable": "No contractors available"
    }
  }
}
```

2. Add to `i18n/locales/ar.json`:
```json
{
  "projects": {
    "openForBids": {
      "noContractorsAvailable": "لا توجد مقاولون متاحون"
    }
  }
}
```

3. Update component:
```vue
<div
  v-if="contractors.length === 0"
  class="text-muted-foreground text-center text-sm"
>
  {{ t('projects.openForBids.noContractorsAvailable') }}
</div>
```

**Impact:** Users in Arabic locale see English text; breaks CLAUDE.md compliance.

---

### 🔴 CRITICAL #2: Helper Text Not Visible Until Selection Made

**Location:** `app/components/project/OpenForBidsDialog.vue:145-150`

**Severity:** HIGH  
**Category:** Acceptance Criteria Violation  
**AC Violated:** "Helper text below select: 'اختر مقاول واحد على الأقل' (Select at least one contractor) in small text, muted color" (Story spec, line 45, AC)

**Code:**
```vue
<!-- Helper text -->
<p
  v-if="!loading && contractors.length > 0"              <!-- ❌ CONDITIONAL -->
  class="text-muted-foreground text-end text-xs"
>
  {{ selectedContractors.length }}/{{ contractors.length }}
  {{ t('projects.openForBids.helperText') }}
</p>
```

**Issue:**
- Helper text only appears when: (1) not loading AND (2) contractors exist
- Spec requires helper text to ALWAYS be visible as guidance
- User sees no validation message if they try to confirm without selecting any contractor
- Current text shows selected count ("0/5") instead of the spec-required message

**Spec Requirement (lines 45-46, AC):**
> Helper text below select: "اختر مقاول واحد على الأقل" (Select at least one contractor) in small text, muted color

**Fix:**
```vue
<!-- Helper text — always visible as guidance -->
<p
  class="text-muted-foreground text-xs"
  :class="{ 'text-danger': selectedContractors.length === 0 && !loading }"
>
  {{ t('projects.openForBids.helperText') }}
  <!-- Optional: show count -->
  <span v-if="contractors.length > 0" class="ms-2">
    ({{ selectedContractors.length }}/{{ contractors.length }})
  </span>
</p>
```

**Impact:** User guidance is hidden; violates AC; confusing UX when confirm is disabled.

---

### 🔴 CRITICAL #3: No Loading Toast During API Call

**Location:** `app/pages/projects/[id].vue:245-286`

**Severity:** MEDIUM  
**Category:** UX/User Feedback  
**AC Violated:** "Display toast: 'جاري فتح باب العروض...' (Opening for bids...)" (Story spec, line 68, AC - Optimistic Update)

**Code:**
```ts
const handleOpenForBidsSubmitted = async (contractorIds: string[]) => {
  if (!project.value || !canTransition('project', 'new', 'open_for_bids')) {
    useNotification().error(t('errors.invalid_transition'))
    return
  }

  isSubmittingBids.value = true

  const prevStatus = project.value.status
  project.value.status = 'open_for_bids'

  try {
    // NO TOAST SHOWN HERE — user has no feedback
    try {
      await useProjects().inviteContractors(id, contractorIds)
    } catch (err) {
      if (!(err instanceof Error && err.message.includes('404'))) {
        throw err
      }
    }

    await useProjects().updateProjectStatus(id, 'open_for_bids')

    useNotification().success(t('projects.openForBids.successMessage'))  // ← Only after success
    // ...
  }
}
```

**Issue:**
- Spec requires loading toast: "جاري فتح باب العروض..." (Opening for bids...)
- Current code shows success toast only AFTER API completes
- During the 300-800ms API delay, user sees no feedback
- Confirm button is disabled, but no indication that something is happening

**Spec Requirement (lines 67-68, AC - Optimistic Update):**
> 2. Disable submit button + show loading spinner
> 3. Display toast: "جاري فتح باب العروض..." (Opening for bids...)

**Fix:**
```ts
const handleOpenForBidsSubmitted = async (contractorIds: string[]) => {
  if (!project.value || !canTransition('project', 'new', 'open_for_bids')) {
    useNotification().error(t('errors.invalid_transition'))
    return
  }

  isSubmittingBids.value = true

  const prevStatus = project.value.status
  project.value.status = 'open_for_bids'

  // ✅ Show loading toast
  useNotification().info(t('projects.openForBids.loadingMessage'))

  try {
    try {
      await useProjects().inviteContractors(id, contractorIds)
    } catch (err) {
      if (!(err instanceof Error && err.message.includes('404'))) {
        throw err
      }
    }

    await useProjects().updateProjectStatus(id, 'open_for_bids')

    useNotification().success(t('projects.openForBids.successMessage'))
    isOpenForBidsDialogOpen.value = false
    await refresh()
  } catch (err) {
    project.value.status = prevStatus
    const errorMsg =
      err instanceof Error
        ? err.message
        : t('projects.openForBids.errorMessage')
    useNotification().error(errorMsg)
  } finally {
    isSubmittingBids.value = false
  }
}
```

**Impact:** No user feedback during API call; violates AC; poor UX.

---

### 🔴 CRITICAL #4: Race Condition on Double-Click Confirm Button

**Location:** `app/pages/projects/[id].vue:245-286`

**Severity:** MEDIUM  
**Category:** Concurrency/Race Condition  
**Risk:** Double API calls, confusing error messages

**Code:**
```ts
const handleOpenForBidsSubmitted = async (contractorIds: string[]) => {
  if (!project.value || !canTransition('project', 'new', 'open_for_bids')) {
    useNotification().error(t('errors.invalid_transition'))
    return
  }

  isSubmittingBids.value = true
  const prevStatus = project.value.status
  project.value.status = 'open_for_bids'  // ← Set immediately

  try {
    // API calls (300-800ms)
    // ...
  }
}
```

**Issue:**
- Status is set to `open_for_bids` immediately (optimistic update)
- If user double-clicks confirm before API completes:
  1. First click: `canTransition('project', 'new', 'open_for_bids')` → `true`, proceeds
  2. Status is set to `open_for_bids`
  3. Second click (rapid): `canTransition('project', 'open_for_bids', 'open_for_bids')` → `false`
  4. Shows error: "Invalid status transition"
- Confusing error for user; double API calls may occur

**Scenario:**
```
[Click] [Click] (rapid)
  ↓       ↓
  Validation passes, first API starts
  Status → open_for_bids
              Validation fails (already open_for_bids)
              Error shown: "Invalid transition"
```

**Fix:**
Add guard to prevent concurrent submissions:
```ts
const isSubmittingBids = ref(false)

const handleOpenForBidsSubmitted = async (contractorIds: string[]) => {
  // ✅ Guard against concurrent calls
  if (isSubmittingBids.value) {
    return
  }

  if (!project.value || !canTransition('project', 'new', 'open_for_bids')) {
    useNotification().error(t('errors.invalid_transition'))
    return
  }

  isSubmittingBids.value = true  // ← Set FIRST
  // ... rest of handler
}
```

Also disable button while submitting:
```vue
<Button 
  :disabled="!canConfirm || isSubmittingBids"  <!-- ← Add isSubmittingBids guard -->
  @click="handleConfirm"
>
  {{ t('projects.openForBids.confirmButton') }}
</Button>
```

**Impact:** Potential double API calls; confusing error messages; race condition.

---

### 🟠 HIGH #5: Missing Subtitle Element (Spec AC)

**Location:** `app/components/project/OpenForBidsDialog.vue:97-102`

**Severity:** MEDIUM  
**Category:** Acceptance Criteria / Layout  
**AC Violated:** "Content layout: 1. Subtitle (body secondary): 'اختر المقاولين المدعويين للعرض'" (Story spec, line 39, AC)

**Current Code:**
```vue
<div class="space-y-4">
  <div>
    <p class="text-muted-foreground text-sm">
      {{ t('projects.openForBids.selectContractors') }}
    </p>
  </div>
  <!-- Contractor list ... -->
</div>
```

**Issue:**
- AC requires explicit "subtitle" element with "body secondary" styling
- Current implementation treats it as regular description text
- No semantic distinction from helper text below
- Spec layout should be:
  1. Dialog title (with project name)
  2. **Subtitle** (distinct, body-secondary tone)
  3. Select field (contractors)
  4. Helper text (below select)

**Spec Requirement (lines 38-40, AC):**
> Content layout:
> 1. Subtitle (body secondary): "اختر المقاولين المدعويين للعرض" (Select contractors invited to bid)
> 2. Multi-select field: "المقاولون" (Contractors)

**Fix:**
```vue
<DialogHeader>
  <DialogTitle>
    {{ t('projects.openForBids.dialogTitle') }}{{ projectName }}
  </DialogTitle>
  <!-- ✅ Add subtitle below title -->
  <p class="text-muted-foreground text-sm mt-2">
    {{ t('projects.openForBids.selectContractorsSubtitle') }}
  </p>
</DialogHeader>

<div class="space-y-4">
  <!-- Move description elsewhere or remove -->
  <!-- Contractor list ... -->
</div>
```

Add i18n key:
```json
{
  "projects": {
    "openForBids": {
      "selectContractorsSubtitle": "Select contractors invited to bid"
    }
  }
}
```

**Impact:** UI layout does not match spec; missing semantic structure.

---

## HIGH FINDINGS — Should Fix Before Merge

### 🟠 HIGH #6: Checkbox Component Inconsistency (shadcn-vue Pattern)

**Location:** `app/components/project/OpenForBidsDialog.vue:125-130`

**Severity:** MEDIUM  
**Category:** Component Library / Architecture  
**Pattern Mismatch:** All other admin forms use shadcn-vue components

**Code:**
```vue
<input
  :id="`contractor-${contractor.id}`"
  type="checkbox"
  :checked="isSelected(contractor.id)"
  class="border-border h-4 w-4 rounded"
  @change="toggleContractor(contractor.id)"
/>
```

**Issue:**
- Raw HTML `<input type="checkbox">` instead of shadcn-vue `Checkbox` component
- Spec mentions: "Type: shadcn-vue `Select` with `multiple` behavior (or custom checkboxes if needed)" (line 42, AC)
- Other admin dialogs (CreateUserForm, AssignEngineersForm) use shadcn-vue form components
- Inconsistent with project patterns

**Compare to Story 06-03 (AssignEngineersForm):**
```vue
<!-- ✅ Uses shadcn-vue Checkbox -->
<Checkbox
  :id="`engineer-${engineer.id}`"
  :checked="isSelected(engineer.id)"
  @update:checked="toggleEngineer(engineer.id)"
/>
```

**Fix:**
Import and use shadcn-vue Checkbox:
```vue
<script setup lang="ts">
import { Checkbox } from '~/components/ui/checkbox'
// ... rest of imports
</script>

<template>
  <div
    v-for="contractor in contractors"
    :key="contractor.id"
    class="hover:bg-muted flex items-center gap-3 rounded-lg p-2"
  >
    <Checkbox
      :id="`contractor-${contractor.id}`"
      :checked="isSelected(contractor.id)"
      @update:checked="toggleContractor(contractor.id)"
    />
    <!-- rest of checkbox item -->
  </div>
</template>
```

**Impact:** Inconsistent component usage; diverges from project patterns.

---

### 🟠 HIGH #7: Missing Validation Error Display on Confirm Attempt

**Location:** `app/components/project/OpenForBidsDialog.vue:61-64`

**Severity:** MEDIUM  
**Category:** UX/Form Validation  
**Issue:** No visual feedback when user tries to confirm without selection

**Code:**
```ts
const handleConfirm = () => {
  if (!canConfirm.value) return  // ← Silent return, no feedback
  emit('submitted', selectedContractors.value)
}
```

**Issue:**
- If confirm button appears enabled but is actually disabled (edge case), user clicks and nothing happens
- No error message shown
- Silent failure is bad UX

**Fix:**
```ts
const validationError = ref<string | null>(null)

const handleConfirm = () => {
  validationError.value = null
  
  if (selectedContractors.value.length === 0) {
    validationError.value = t('projects.openForBids.helperText')
    return
  }
  
  emit('submitted', selectedContractors.value)
}
```

Add error display in template:
```vue
<div v-if="validationError" class="bg-danger/10 text-danger rounded-lg p-3 text-sm">
  {{ validationError }}
</div>
```

**Impact:** Silent failures; poor UX when validation is required.

---

### 🟠 HIGH #8: API Call Ordering Issue (500 Error Handling)

**Location:** `app/pages/projects/[id].vue:258-265`

**Severity:** MEDIUM  
**Category:** Error Handling / Robustness  
**Issue:** Unsafe assumption that invitation API failures are only 404

**Code:**
```ts
try {
  await useProjects().inviteContractors(id, contractorIds)
} catch (err) {
  // Continue even if invitations endpoint doesn't exist
  if (!(err instanceof Error && err.message.includes('404'))) {
    throw err
  }
}

// Then update status
await useProjects().updateProjectStatus(id, 'open_for_bids')
```

**Issue:**
- Code assumes: if error contains "404", endpoint doesn't exist → continue silently
- Reality: endpoint could exist but fail with 500 (server error), validation error, timeout, etc.
- If invitation endpoint exists but crashes, the code continues and updates status anyway
- Invitations are incomplete, but status says bidding is open

**Scenario:**
```
Endpoint: POST /projects/{id}/invitations
Status: 500 Internal Server Error
Message: "Database connection failed"

Current behavior:
  → Error message does NOT contain "404"
  → Throws the error, catches it
  → Error is NOT "404", so throws again
  → Handler catches and rolls back

Actually safer, but the comment is misleading.
```

**Better Fix:**
Check API response status explicitly:
```ts
try {
  await useProjects().inviteContractors(id, contractorIds)
} catch (err) {
  // If endpoint truly doesn't exist (404), continue
  // If other errors, propagate and fail the transaction
  const is404 = 
    (err instanceof Error && err.message.includes('404')) ||
    (err?.response?.status === 404)
  
  if (!is404) {
    throw err  // Re-throw non-404 errors
  }
  // Continue only for 404
}
```

**Impact:** Invitations silently skipped even if endpoint is broken.

---

## MEDIUM FINDINGS — Should Consider

### 🟡 MEDIUM #9: Race Condition in Dialog Reopening (State Reset)

**Location:** `app/components/project/OpenForBidsDialog.vue:34-55`

**Severity:** LOW-MEDIUM  
**Category:** State Management  
**Issue:** Contractor list not reset when dialog reopens; concurrent fetch requests

**Code:**
```ts
watch(
  () => props.isOpen,
  async newIsOpen => {
    if (newIsOpen) {
      loading.value = true
      error.value = null
      try {
        const list = await getContractorsList()
        contractors.value = list  // No check for concurrent calls
      } catch (err) {
        error.value = 'Failed to load contractors'
      } finally {
        loading.value = false
      }
    } else {
      selectedContractors.value = []
      error.value = null
      // contractors.value is NOT reset — old list remains
    }
  }
)
```

**Issue:**
- When dialog opens, contractors are fetched
- When dialog closes, selections are cleared but contractors list remains
- If dialog opens again (e.g., re-opening with different project):
  - Old contractors list is visible
  - New fetch request is made
  - Until fetch completes, user sees old data
- If user opens dialog twice rapidly (before first fetch completes):
  - Two concurrent `getContractorsList()` calls
  - Second response overwrites first

**Fix:**
Reset contractors on dialog close:
```ts
watch(
  () => props.isOpen,
  async newIsOpen => {
    if (newIsOpen) {
      loading.value = true
      error.value = null
      try {
        const list = await getContractorsList()
        contractors.value = list
      } catch (err) {
        error.value = 'Failed to load contractors'
      } finally {
        loading.value = false
      }
    } else {
      // ✅ Reset on close
      selectedContractors.value = []
      contractors.value = []  // ← Add this
      error.value = null
    }
  }
)
```

And add debounce guard:
```ts
let fetchInProgress = false

watch(
  () => props.isOpen,
  async newIsOpen => {
    if (newIsOpen) {
      if (fetchInProgress) return  // ← Guard concurrent calls
      fetchInProgress = true
      loading.value = true
      // ... rest of handler
    }
  }
)
```

**Impact:** Flicker when reopening dialog; potential for stale data; concurrent fetch calls.

---

### 🟡 MEDIUM #10: Empty Contractor Response — No User Guidance

**Location:** `app/components/project/OpenForBidsDialog.vue:115-119`

**Severity:** LOW-MEDIUM  
**Category:** UX / Error Handling  
**Issue:** When API returns 0 contractors, user has no way to proceed

**Scenario:**
```
User clicks "Open for Bids"
→ Dialog opens
→ Fetching contractors...
→ API returns: { data: [] }
→ Dialog shows: "No contractors available"
→ Confirm button: disabled
→ User: ??? What now?
```

**Current Behavior:**
- Error display shows: "No contractors available"
- User can click Cancel to close
- No option to retry or create contractors

**Spec doesn't explicitly address this**, but it's a UX gap.

**Suggested Fix:**
```vue
<div
  v-if="contractors.length === 0 && !loading"
  class="text-muted-foreground text-center text-sm space-y-3"
>
  <p>{{ t('projects.openForBids.noContractorsAvailable') }}</p>
  <Button variant="outline" size="sm" @click="handleRetryFetch">
    {{ t('buttons.retry') }}
  </Button>
</div>

<script setup lang="ts">
const handleRetryFetch = async () => {
  loading.value = true
  try {
    const list = await getContractorsList()
    contractors.value = list
  } catch (err) {
    error.value = t('projects.openForBids.loadError')
  } finally {
    loading.value = false
  }
}
</script>
```

**Impact:** Poor UX when no contractors exist; no retry mechanism.

---

### 🟡 MEDIUM #11: Timeout Error Not Handled Explicitly

**Location:** `app/composables/useAdminUsers.ts:28-38`

**Severity:** LOW  
**Category:** Error Handling  
**Issue:** Timeout errors not distinguished from other failures

**Code:**
```ts
function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = TIMEOUT_MS.fetch
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Operation timed out after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ])
}
```

**Issue:**
- If timeout occurs, generic error message: "Operation timed out after 10000ms"
- Dialog shows: "Failed to load contractors"
- User doesn't know if it's network timeout or API 500

**Fix:**
Custom timeout error class:
```ts
class TimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`Operation timed out after ${timeoutMs}ms`)
    this.name = 'TimeoutError'
  }
}

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = TIMEOUT_MS.fetch
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new TimeoutError(timeoutMs)), timeoutMs)
    ),
  ])
}
```

Then in dialog:
```ts
try {
  const list = await getContractorsList()
  contractors.value = list
} catch (err) {
  if (err instanceof TimeoutError) {
    error.value = t('projects.openForBids.timeoutError')
  } else {
    error.value = t('projects.openForBids.loadError')
  }
}
```

**Impact:** Generic error messages; harder to debug.

---

### 🟡 MEDIUM #12: Project ID Change While Dialog Open

**Location:** `app/components/project/OpenForBidsDialog.vue`

**Severity:** LOW  
**Category:** State Management  
**Issue:** If parent changes `projectId` prop while dialog is open, no refetch occurs

**Scenario:**
```
1. User opens OpenForBidsDialog for Project A
2. Contractors for Project A are fetched
3. Parent changes projectId prop to Project B
4. Dialog still shows contractors from Project A
5. Submitting sends Project B ID but Project A contractor IDs
```

**Current Code:**
```ts
watch(
  () => props.isOpen,
  async newIsOpen => {
    if (newIsOpen) {
      // Fetches contractors, but no check for projectId change
      const list = await getContractorsList()
      contractors.value = list
    }
  }
)
```

**Fix:**
Watch `projectId` as well:
```ts
watch(
  [() => props.isOpen, () => props.projectId],
  async ([newIsOpen, newProjectId]) => {
    if (newIsOpen && newProjectId) {
      loading.value = true
      try {
        const list = await getContractorsList()
        contractors.value = list
      } catch (err) {
        error.value = 'Failed to load contractors'
      } finally {
        loading.value = false
      }
    } else if (!newIsOpen) {
      selectedContractors.value = []
      contractors.value = []
      error.value = null
    }
  }
)
```

**Impact:** Stale data if parent component changes project ID.

---

## LOW FINDINGS — Consider for Polish

### 🟢 LOW #13: Mock API Delays Inconsistent

**Location:** `app/composables/useProjects.ts:273, 293`

**Severity:** LOW  
**Category:** Test/Mock Consistency  
**Issue:** Different delays for different mock operations

**Code:**
```ts
// Line 273 — updateProjectStatus mock
await new Promise(resolve => setTimeout(resolve, 400))

// Line 293 — inviteContractors mock
await new Promise(resolve => setTimeout(resolve, 300))
```

**Issue:**
- Inconsistent mock delays (300ms vs 400ms)
- Test timing assumptions may be fragile
- Could cause test flakiness if tests rely on timing

**Fix:**
Use consistent delays:
```ts
const MOCK_DELAY_MS = 300

const inviteContractors = async (...) => {
  try {
    // ...
  } catch (err) {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS))
  }
}

const updateProjectStatus = async (...) => {
  try {
    // ...
  } catch (err) {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS))
  }
}
```

**Impact:** Test flakiness; unpredictable mock behavior.

---

### 🟢 LOW #14: Missing Loading Skeleton Variant

**Location:** `app/components/project/OpenForBidsDialog.vue:105-107`

**Severity:** LOW  
**Category:** UX / Loading States  
**Issue:** Loading skeleton is single line; should match contractor list height

**Current Code:**
```vue
<div v-if="loading" class="space-y-2">
  <div class="bg-muted-foreground/20 h-10 w-full rounded-lg" />
</div>
```

**Issue:**
- Only shows one skeleton line
- Actual list shows ~5-10 contractors
- Visual jump when contractors load

**Best Practice** (from Story 06-05):
Show multiple skeleton placeholders matching expected list height:
```vue
<div v-if="loading" class="space-y-2">
  <div v-for="i in 6" :key="i" class="bg-muted-foreground/20 h-10 w-full rounded-lg" />
</div>
```

**Impact:** Visual flicker; poor skeleton UX.

---

### 🟢 LOW #15: No Error Boundary for Contractor Fetch

**Location:** `app/components/project/OpenForBidsDialog.vue:40-47`

**Severity:** LOW  
**Category:** Error Handling  
**Issue:** If contractor fetch throws, error message is generic

**Code:**
```ts
try {
  const list = await getContractorsList()
  contractors.value = list
} catch (err) {
  error.value = 'Failed to load contractors'  // ← Generic
  console.error('Failed to load contractors:', err)
}
```

**Issue:**
- No error details shown to user
- Hardcoded English error message (not i18n'ed)
- User has no idea if it's API 500, timeout, or permission denied

**Fix:**
```ts
catch (err) {
  let message = 'Failed to load contractors'
  
  if (err instanceof Error) {
    if (err.message.includes('timeout')) {
      message = t('errors.timeout') || 'Request timeout'
    } else if (err.message.includes('401')) {
      message = t('errors.permission_denied')
    } else if (err.message.includes('500')) {
      message = t('errors.server_error') || 'Server error'
    }
  }
  
  error.value = message
  console.error('Failed to load contractors:', err)
}
```

**Impact:** Generic error messages; no i18n; harder to debug.

---

## Test Coverage Analysis

### E2E Test Status

**File:** `tests/e2e/story-07-01-open-for-bids.spec.ts`

**Existing Coverage:**
✅ Button visibility for admin when status = "new"  
✅ Dialog opens on button click  
✅ Contractor list loads  
✅ Confirm disabled when 0 selected  
✅ Confirm enabled after selection  
✅ Workflow completion  

**Missing Coverage:**
❌ Helper text visibility (always visible)  
❌ Loading toast during API call  
❌ Error handling (API failure)  
❌ Rollback on error  
❌ Double-click race condition  
❌ RTL layout verification  
❌ Empty contractor list handling  
❌ Timeout error handling  
❌ Non-admin users cannot see button  
❌ Non-"new" status projects cannot use button  

**Recommendation:** Add tests for error cases, race conditions, and RTL.

---

## Summary Table

| # | Title | Severity | Fix Time | Category |
|---|-------|----------|----------|----------|
| 1 | Hardcoded "No contractors available" | HIGH | 5 min | i18n |
| 2 | Helper text not always visible | HIGH | 10 min | AC |
| 3 | No loading toast | HIGH | 15 min | AC/UX |
| 4 | Double-click race condition | MEDIUM | 10 min | Race |
| 5 | Missing subtitle element | MEDIUM | 5 min | AC |
| 6 | Checkbox component inconsistency | MEDIUM | 15 min | Pattern |
| 7 | No validation feedback on confirm | MEDIUM | 10 min | UX |
| 8 | API error handling unsafe | MEDIUM | 10 min | Robustness |
| 9 | Dialog reopen state reset | MEDIUM | 10 min | State |
| 10 | Empty list no guidance | MEDIUM | 15 min | UX |
| 11 | Timeout not distinguished | LOW | 10 min | Error |
| 12 | Project ID change during open | LOW | 10 min | State |
| 13 | Mock delays inconsistent | LOW | 5 min | Mocks |
| 14 | Loading skeleton too minimal | LOW | 10 min | UX |
| 15 | No error boundary | LOW | 10 min | Error |

---

## Recommendation: Approval Gate

**Do NOT merge until:**
- ✅ CRITICAL #1-4 fixed
- ✅ HIGH #5-8 fixed or explicitly deferred
- ✅ E2E tests updated for new UX (loading toast, helper text)
- ✅ RTL tested in Arabic locale

**Estimated Fix Time:** 2–3 hours

**Next Steps:**
1. Create fix commit addressing CRITICAL findings
2. Update E2E tests
3. Re-run code review
4. Mark ready for final approval

---

*Report generated: 2026-05-09*  
*Reviewer: Adversarial Code Review (Blind Hunter + Edge Case Hunter + Acceptance Auditor)*  
*Model: Claude Haiku 4.5*
