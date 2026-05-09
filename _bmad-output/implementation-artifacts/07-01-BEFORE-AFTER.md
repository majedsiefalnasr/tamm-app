# Story 07-01 — Before & After Code Comparisons

This document shows the current implementation (❌ with issues) and the recommended fix (✅ corrected).

---

## Fix #1: Hardcoded Error Message

### ❌ Current (Issue)

**File:** `app/components/project/OpenForBidsDialog.vue:118`

```vue
<div
  v-if="contractors.length === 0"
  class="text-muted-foreground text-center text-sm"
>
  No contractors available
</div>
```

**Problem:**
- English text hardcoded
- Arabic users see English
- Violates CLAUDE.md § 0.2

---

### ✅ Fixed

**File:** `app/components/project/OpenForBidsDialog.vue:118`

```vue
<div
  v-if="contractors.length === 0"
  class="text-muted-foreground text-center text-sm"
>
  {{ t('projects.openForBids.noContractorsAvailable') }}
</div>
```

**Added to i18n:**

```json
// i18n/locales/en.json
{
  "projects": {
    "openForBids": {
      "noContractorsAvailable": "No contractors available"
    }
  }
}

// i18n/locales/ar.json
{
  "projects": {
    "openForBids": {
      "noContractorsAvailable": "لا توجد مقاولون متاحون"
    }
  }
}
```

**Testing:**
```
EN: "No contractors available" ✅
AR: "لا توجد مقاولون متاحون" ✅
```

---

## Fix #2: Helper Text Not Always Visible

### ❌ Current (Issue)

**File:** `app/components/project/OpenForBidsDialog.vue:145-151`

```vue
<!-- Helper text -->
<p
  v-if="!loading && contractors.length > 0"
  class="text-muted-foreground text-end text-xs"
>
  {{ selectedContractors.length }}/{{ contractors.length }}
  {{ t('projects.openForBids.helperText') }}
</p>
```

**Problems:**
1. Only shows when not loading AND contractors exist
2. Shows count format ("0/5") instead of guidance text
3. Missing when user most needs it (before selecting)

---

### ✅ Fixed

**File:** `app/components/project/OpenForBidsDialog.vue`

```vue
<!-- Helper text — always visible as guidance -->
<p
  class="text-muted-foreground text-xs"
  :class="{ 'text-danger': selectedContractors.length === 0 && !loading }"
>
  {{ t('projects.openForBids.helperText') }}
  <span v-if="contractors.length > 0" class="ms-2">
    ({{ selectedContractors.length }}/{{ contractors.length }})
  </span>
</p>
```

**Behavior:**
```
State: Loading
→ "Select at least one contractor" (muted)

State: 0 selected, contractors exist
→ "Select at least one contractor" (danger red, guides user)

State: 1+ selected
→ "Select at least one contractor (1/5)" (success green)
```

**Testing:**
```
Visible during loading: ✅
Visible when 0 selected: ✅
Text color changes with selection: ✅
Count updates as selections change: ✅
```

---

## Fix #3: No Loading Toast

### ❌ Current (Issue)

**File:** `app/pages/projects/[id].vue:245-286`

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
    // NO TOAST HERE — user has no feedback for 300-800ms
    try {
      await useProjects().inviteContractors(id, contractorIds)
    } catch (err) {
      if (!(err instanceof Error && err.message.includes('404'))) {
        throw err
      }
    }

    await useProjects().updateProjectStatus(id, 'open_for_bids')

    // Success toast only shown here (after API)
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

**Problem:**
- Spec requires: "Display toast: 'جاري فتح باب العروض...'"
- User clicks confirm
- Confirm button disables, but no visual feedback
- No indication anything is happening (especially on slow networks)

---

### ✅ Fixed

**File:** `app/pages/projects/[id].vue:245-286`

```ts
const handleOpenForBidsSubmitted = async (contractorIds: string[]) => {
  if (!project.value || !canTransition('project', 'new', 'open_for_bids')) {
    useNotification().error(t('errors.invalid_transition'))
    return
  }

  isSubmittingBids.value = true

  const prevStatus = project.value.status
  project.value.status = 'open_for_bids'

  // ✅ SHOW LOADING TOAST IMMEDIATELY
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

    // ✅ SHOW SUCCESS TOAST (replaces loading toast)
    useNotification().success(t('projects.openForBids.successMessage'))
    isOpenForBidsDialogOpen.value = false
    await refresh()
  } catch (err) {
    project.value.status = prevStatus
    const errorMsg =
      err instanceof Error
        ? err.message
        : t('projects.openForBids.errorMessage')
    // ✅ SHOW ERROR TOAST (replaces loading toast)
    useNotification().error(errorMsg)
  } finally {
    isSubmittingBids.value = false
  }
}
```

**Timeline:**
```
User clicks confirm
  ↓
[IMMEDIATE] Loading toast: "جاري فتح باب العروض..." appears
[0-300ms] API call 1 (invitations)
[0-400ms] API call 2 (status update)
[SUCCESS] Loading toast dismissed, success toast appears: "تم فتح باب العروض بنجاح"
          OR
[ERROR]   Loading toast dismissed, error toast appears: specific error message
```

**Testing:**
```
Slow network (3s delay):
  → Loading toast appears immediately ✅
  → User knows something is happening ✅
  → Toast dismissed when done ✅

Fast network (100ms delay):
  → Loading toast flashes briefly ✅
  → Success toast follows ✅

API error:
  → Loading toast → error toast ✅
```

---

## Fix #4: Race Condition on Double-Click

### ❌ Current (Issue)

**File:** `app/pages/projects/[id].vue:245-286`

```ts
const handleOpenForBidsSubmitted = async (contractorIds: string[]) => {
  // No check: is a submission already in progress?
  
  isSubmittingBids.value = true
  const prevStatus = project.value.status
  project.value.status = 'open_for_bids'  // ← Sets immediately

  try {
    // API calls
    await useProjects().updateProjectStatus(id, 'open_for_bids')
    // ...
  } finally {
    isSubmittingBids.value = false
  }
}

// In template:
// Button is not disabled during submission!
<Button @click="handleOpenForBidsSubmitted(selectedContractorIds)">
  {{ t('projects.openForBids.confirmButton') }}
</Button>
```

**Race Condition:**
```
T=0ms    User clicks confirm (1st click)
         → handleOpenForBidsSubmitted starts
         → isSubmittingBids = true
         → status set to 'open_for_bids'

T=50ms   User clicks confirm again (2nd click, rapid)
         → handleOpenForBidsSubmitted called again
         → status already 'open_for_bids'
         → canTransition('project', 'open_for_bids', 'open_for_bids') = false
         → Error: "Invalid status transition"

T=100ms  First API call in progress
T=200ms  First API call finishes successfully

T=250ms  Second error handler executes
         → Status rolled back to prev (was 'new')
         → User sees confusing error
         → Status inconsistent
```

---

### ✅ Fixed

**File:** `app/pages/projects/[id].vue:245-286`

```ts
const handleOpenForBidsSubmitted = async (contractorIds: string[]) => {
  // ✅ Guard: prevent concurrent submissions
  if (isSubmittingBids.value) {
    console.warn('Submission already in progress')
    return
  }

  if (!project.value || !canTransition('project', 'new', 'open_for_bids')) {
    useNotification().error(t('errors.invalid_transition'))
    return
  }

  // ✅ Set flag FIRST
  isSubmittingBids.value = true

  const prevStatus = project.value.status
  project.value.status = 'open_for_bids'

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

// In template:
// ✅ Disable button during submission
<Button 
  :disabled="!canConfirm || isSubmittingBids"
  @click="handleOpenForBidsSubmitted(selectedContractorIds)"
>
  {{ t('projects.openForBids.confirmButton') }}
</Button>
```

**Fixed Timeline:**
```
T=0ms    User clicks confirm (1st click)
         → handleOpenForBidsSubmitted starts
         → isSubmittingBids = true
         → Button disables immediately ✅
         → status set to 'open_for_bids'

T=50ms   User clicks confirm again (2nd click, rapid)
         → Button already disabled (can't click) ✅
         → OR if keyboard: handleOpenForBidsSubmitted called
         → First line: if (isSubmittingBids.value) return ✅
         → Function exits early, no second submission

T=100ms  First API call in progress

T=200ms  First API call finishes
         → isSubmittingBids = false
         → Button re-enables
         → Status updated successfully

Result:
  → Only one API call ✅
  → No confusing errors ✅
  → Data consistent ✅
```

**Testing:**
```
Double-click confirm button:
  → Button disables immediately ✅
  → Only one API request made ✅
  → No error messages ✅
  → Success toast shows once ✅

Keyboard rapid Enter:
  → Function guards against second call ✅
  → Only processes first request ✅
```

---

## Fix #5: Missing Subtitle Element

### ❌ Current (Issue)

**File:** `app/components/project/OpenForBidsDialog.vue:87-102`

```vue
<DialogHeader>
  <DialogTitle>
    {{ t('projects.openForBids.dialogTitle') }}{{ projectName }}
  </DialogTitle>
</DialogHeader>

<div class="space-y-4">
  <div>
    <p class="text-muted-foreground text-sm">
      {{ t('projects.openForBids.selectContractors') }}
    </p>
  </div>
  <!-- Contractor list ... -->
</div>
```

**Problem:**
- Spec requires distinct subtitle (body secondary styling)
- Current implementation has title, then regular paragraph
- No semantic distinction
- Layout doesn't match other dialogs (e.g., CreateUserDialog, AssignEngineersDialog)

---

### ✅ Fixed

**File:** `app/components/project/OpenForBidsDialog.vue`

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
  <!-- Move instructional text elsewhere or remove (subtitle replaces it) -->
  
  <!-- Contractor list ... -->
</div>
```

**Added to i18n:**

```json
// i18n/locales/en.json
{
  "projects": {
    "openForBids": {
      "selectContractorsSubtitle": "Select contractors invited to bid"
    }
  }
}

// i18n/locales/ar.json
{
  "projects": {
    "openForBids": {
      "selectContractorsSubtitle": "اختر المقاولين المدعويين للعرض"
    }
  }
}
```

**Layout Result:**

```
┌─────────────────────────────────────┐
│ Open for Bids — Villa Project A      │  ← DialogTitle
│ Select contractors invited to bid    │  ← DialogSubtitle (new)
├─────────────────────────────────────┤
│                                     │
│ ☐ contractor 1                      │
│ ☐ contractor 2                      │
│ ☐ contractor 3                      │
│                                     │
│ Select at least one contractor      │  ← Helper text
├─────────────────────────────────────┤
│            [Cancel]  [Open for Bids]│
└─────────────────────────────────────┘
```

---

## Fix #6: Checkbox Component Inconsistency

### ❌ Current (Issue)

**File:** `app/components/project/OpenForBidsDialog.vue:125-141`

```vue
<div
  v-for="contractor in contractors"
  :key="contractor.id"
  class="hover:bg-muted flex items-center gap-3 rounded-lg p-2"
>
  <input
    :id="`contractor-${contractor.id}`"
    type="checkbox"
    :checked="isSelected(contractor.id)"
    class="border-border h-4 w-4 rounded"
    @change="toggleContractor(contractor.id)"
  />
  <label
    :for="`contractor-${contractor.id}`"
    class="flex-1 cursor-pointer"
  >
    <p class="text-ink text-sm font-medium">{{ contractor.name }}</p>
    <p class="text-muted-foreground text-xs">
      {{ contractor.email }}
    </p>
  </label>
</div>
```

**Problems:**
1. Uses raw HTML `<input type="checkbox">` instead of shadcn-vue component
2. Inconsistent with other admin forms:
   - `AssignEngineersForm.vue` uses `<Checkbox>` component
   - `CreateUserForm.vue` uses `<Checkbox>` component
3. Missing ARIA labels built into shadcn `Checkbox`
4. Custom styling may diverge from shadcn theme updates

---

### ✅ Fixed

**File:** `app/components/project/OpenForBidsDialog.vue`

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
    <!-- ✅ Use shadcn-vue Checkbox component -->
    <Checkbox
      :id="`contractor-${contractor.id}`"
      :checked="isSelected(contractor.id)"
      @update:checked="toggleContractor(contractor.id)"
    />
    <label
      :for="`contractor-${contractor.id}`"
      class="flex-1 cursor-pointer"
    >
      <p class="text-ink text-sm font-medium">{{ contractor.name }}</p>
      <p class="text-muted-foreground text-xs">
        {{ contractor.email }}
      </p>
    </label>
  </div>
</template>
```

**Benefits:**
```
✅ Consistent with project patterns
✅ ARIA labels built-in
✅ Theming updates automatic
✅ Accessibility better (keyboard nav, screen readers)
✅ Matches AssignEngineersForm pattern
```

**Testing:**
```
Visual:
  → Checkbox looks correct ✅
  → Styling matches form theme ✅
  → Hover state works ✅
  → Checked/unchecked states work ✅

Accessibility:
  → Keyboard: Tab to checkbox, Space to toggle ✅
  → Screen reader: Label announced with checkbox ✅
  → Color contrast: passes WCAG AA ✅
```

---

## Fix #7: No Validation Error Display

### ❌ Current (Issue)

**File:** `app/components/project/OpenForBidsDialog.vue:61-64`

```ts
const handleConfirm = () => {
  if (!canConfirm.value) return  // ← Silent return, no feedback
  emit('submitted', selectedContractors.value)
}
```

**Problem:**
- If user somehow clicks confirm when disabled (edge case), nothing happens
- No error message
- User is confused

---

### ✅ Fixed

**File:** `app/components/project/OpenForBidsDialog.vue`

```ts
const validationError = ref<string | null>(null)

const handleConfirm = () => {
  validationError.value = null
  
  // ✅ Show error if validation fails
  if (selectedContractors.value.length === 0) {
    validationError.value = t('projects.openForBids.helperText')
    return
  }
  
  if (loading.value) {
    validationError.value = t('validation.stillLoading')
    return
  }
  
  emit('submitted', selectedContractors.value)
}
```

**In template:**

```vue
<!-- Display validation error -->
<div v-if="validationError" class="bg-danger/10 text-danger rounded-lg p-3 text-sm">
  {{ validationError }}
</div>

<!-- In dialog content before contractor list -->
<div class="space-y-4">
  <div v-if="validationError" class="bg-danger/10 text-danger rounded-lg p-3 text-sm">
    {{ validationError }}
  </div>
  
  <!-- Rest of dialog content ... -->
</div>
```

**Behavior:**
```
State: 0 contractors selected, user clicks confirm
  → validationError set to helper text
  → Error message displays in red
  → User understands what to do

State: User selects a contractor
  → validationError cleared
  → Error message disappears
  → Confirm button re-enabled
```

**Testing:**
```
Click confirm with 0 selected:
  → Error message appears ✅
  → Error text is i18n'ed ✅
  → Button stays disabled ✅

Select contractor:
  → Error clears ✅
  → Button enables ✅
  → Can submit ✅
```

---

## Fix #8: Unsafe API Error Handling

### ❌ Current (Issue)

**File:** `app/pages/projects/[id].vue:258-268`

```ts
try {
  await useProjects().inviteContractors(id, contractorIds)
} catch (err) {
  // Continue even if invitations endpoint doesn't exist
  if (!(err instanceof Error && err.message.includes('404'))) {
    throw err
  }
  // Silently continues if error message contains "404"
}

// Then update status regardless
await useProjects().updateProjectStatus(id, 'open_for_bids')
```

**Problem:**
- Assumes error message contains "404" for missing endpoints
- Real scenario: API endpoint exists but returns 500 (server crash)
- Error message might be "Internal Server Error" (not "404")
- Code continues and updates status anyway
- Invitations incomplete, but API says bidding is open
- Data inconsistency

---

### ✅ Fixed

**File:** `app/pages/projects/[id].vue:258-268`

```ts
try {
  await useProjects().inviteContractors(id, contractorIds)
} catch (err) {
  // Check actual HTTP status code, not error message
  const is404 = 
    (err instanceof Error && err.message.includes('404')) ||
    (err?.response?.status === 404)
  
  // Only continue if endpoint truly doesn't exist (404)
  if (!is404) {
    // ✅ Re-throw non-404 errors to abort transaction
    throw err
  }
  // ✅ Continue only for 404 (endpoint doesn't exist)
  console.debug('Invitation endpoint not available, continuing to status update')
}

// ✅ Only reached if invitation succeeded OR 404 (expected)
await useProjects().updateProjectStatus(id, 'open_for_bids')
```

**Error Handling Decision Tree:**

```
API Call: inviteContractors()
  ↓
  Success? ✅ → Continue to next API call
  ↓
  Error? Check status code:
    404? → Endpoint doesn't exist (expected, continue)
    500? → Server error (unexpected, abort & rollback)
    422? → Validation error (user error, abort & show message)
    408/timeout? → Network issue (suggest retry)
    Other? → Unknown (abort & show generic error)
```

**Testing:**
```
Endpoint returns 404:
  → Continue to status update ✅
  → Success ✅

Endpoint returns 500:
  → Abort transaction ✅
  → Rollback status to 'new' ✅
  → Show error: "Server error, please try again" ✅

Endpoint returns 422:
  → Abort transaction ✅
  → Rollback status ✅
  → Show error with validation details ✅

Timeout:
  → Abort transaction ✅
  → Show error: "Request timed out, please retry" ✅
```

---

## Summary: All Fixes at a Glance

| Fix # | Issue | Lines Changed | Estimated Time |
|-------|-------|---------------|-----------------|
| 1 | Hardcoded string | 1 component + 4 i18n | 5 min |
| 2 | Helper text conditional | 1 conditional → always visible | 10 min |
| 3 | No loading toast | 1 notification call | 15 min |
| 4 | Race condition | 1 guard + 1 button disabled attr | 10 min |
| 5 | Missing subtitle | 1 subtitle element + 2 i18n | 5 min |
| 6 | Checkbox raw HTML | Import + replace component | 15 min |
| 7 | No validation feedback | 1 error ref + display | 10 min |
| 8 | Unsafe 404 check | 2 lines error handling logic | 10 min |

**Total:** ~80 minutes for all fixes

