# Story 07-01 — Deep Dive Analysis & Architecture Review

**Purpose:** Beyond the findings report, understand the systemic patterns and architectural implications.

---

## Part 1: Pattern Analysis — Why These Issues Exist

### Root Cause #1: i18n Implementation Gap

**Pattern:** Multiple hardcoded strings found in templates

**Affected Locations:**
- `OpenForBidsDialog.vue:118` — "No contractors available"
- `OpenForBidsDialog.vue:44` — Generic catch error message

**Root Cause:**
- Developers are adding new i18n keys as needed (reactive approach)
- No validation that all UI strings are i18n'ed at commit time
- CLAUDE.md § 0.2 requires "no hardcoded strings" but no linting enforces it

**Why It Matters:**
- Arabic users see partial English UI (poor experience)
- Violates project rules explicitly stated in CLAUDE.md
- Creates maintenance debt (future translations incomplete)

**System-Level Fix (Beyond Story 07-01):**
1. Add ESLint rule to flag hardcoded strings in Vue templates
2. Add pre-commit hook to validate i18n keys
3. Create i18n audit in CI/CD pipeline

**For This Story:**
- Add missing key: `projects.openForBids.noContractorsAvailable`
- Audit component for any other hardcoded text

---

### Root Cause #2: Incomplete Acceptance Criteria Translation

**Pattern:** Spec AC not fully implemented in code

**Affected ACs:**
- Line 45: "Helper text below select" — not always visible
- Line 68: "Display toast: 'جاري فتح باب العروض...'" — missing
- Line 39: "Subtitle (body secondary)" — missing semantic distinction

**Root Cause:**
- Spec written at high level (intent-focused)
- Developers implemented "close enough" version
- No systematic cross-check: spec AC vs. implemented code

**Why It Matters:**
- AC failures are regression risks
- Future stories built on this may assume AC is met
- Story 07-02, 07-03 depend on this working correctly

**System-Level Pattern:**
- AC checklist in story file not synchronized with implementation
- No automated verification that AC = code

**For This Story:**
- Mark each AC explicitly: ✅ DONE or ⚠️ PENDING in story file
- Before closing story, verify each AC with working code

---

### Root Cause #3: Concurrency Not Considered

**Pattern:** Race conditions in async operations

**Affected Issues:**
- #4: Double-click on confirm button
- #9: Concurrent dialog opens
- #12: Project ID changes during async operation

**Root Cause:**
- Developer focused on happy path (user selects, clicks confirm, API succeeds)
- Edge cases (rapid clicks, prop changes during async) not tested
- No guards (`isSubmitting` flag) on async mutations

**Why It Matters:**
- User can accidentally trigger duplicate API calls
- Data consistency risk (optimistic update rollback issues)
- Real-world usage: users double-click buttons, networks are slow

**System-Level Pattern:**
- Need async race condition checklist in code review
- Test strategy missing coverage for concurrent actions

**For This Story:**
- Add `isSubmittingBids` guard (block concurrent calls)
- Disable button during submission
- Test double-click scenario in E2E

---

### Root Cause #4: Component Library Consistency Drift

**Pattern:** Some components use shadcn-vue, some use raw HTML

**Example:**
- `AssignEngineersForm.vue` uses `<Checkbox>` component
- `OpenForBidsDialog.vue` uses `<input type="checkbox">`

**Root Cause:**
- Developers cherry-pick what to use
- No automated check: "all form inputs must be shadcn-vue"
- CLAUDE.md § 10 recommends shadcn-vue but doesn't enforce

**Why It Matters:**
- Inconsistent styling/theming
- Maintenance burden (if shadcn-vue Checkbox changes, raw inputs don't update)
- Accessibility gaps (shadcn components have ARIA labels built-in)

**System-Level Fix:**
- Create component linting rule: no raw form elements in admin components
- Update CLAUDE.md to say "MUST use shadcn-vue" not "use"

**For This Story:**
- Replace `<input type="checkbox">` with `<Checkbox>` component

---

## Part 2: Architectural Implications

### Issue A: State Machine Validation Incomplete

**Current Implementation:**
```ts
// In component:
if (!canTransition('project', 'new', 'open_for_bids')) {
  return  // Silent failure
}
```

**Problem:**
- Validation happens in component (presentation layer)
- State is mutated immediately after check
- No transaction semantics (API call could fail, state already changed)

**Better Pattern:**
```ts
// Move validation to composable (business logic layer)
const handleOpenForBidsSubmitted = async (contractorIds: string[]) => {
  try {
    const result = await useProjects().openForBidding(
      projectId,
      contractorIds
    )
    if (result.success) {
      // state already updated by composable
      dialog.close()
    }
  } catch (err) {
    // error already logged, user already notified
  }
}

// In composable:
export const openForBidding = async (projectId: string, contractorIds: string[]) => {
  // Validation
  if (!canTransition('project', 'new', 'open_for_bids')) {
    throw new TransitionError('Invalid status transition')
  }
  
  // Optimistic update
  const prev = getProject(projectId)
  setStatus(projectId, 'open_for_bids')
  
  try {
    // API calls with proper error handling
    await inviteContractors(projectId, contractorIds)
    await updateStatus(projectId, 'open_for_bids')
    return { success: true }
  } catch (err) {
    // Rollback
    setStatus(projectId, prev.status)
    throw err
  }
}
```

**Why This Matters:**
- Separates business logic from presentation
- Composable can be tested without Vue components
- Reusable across components
- Clearer error handling (one place to catch)

**For Story 07-01:**
Consider extracting orchestration to composable method:
```ts
// In useProjects.ts
async function openForBidding(projectId: string, contractorIds: string[]) {
  // All logic here: validation, API calls, rollback
}

// In component
const handleSubmit = async (contractorIds) => {
  try {
    await useProjects().openForBidding(projectId, contractorIds)
    notify.success(t('success'))
    dialog.close()
  } catch (err) {
    notify.error(err.message)
  }
}
```

---

### Issue B: Error Handling Strategy Unclear

**Current Approach:**
- Try/catch with optimistic update + rollback
- Generic error messages ("Failed to open for bids")
- Silent skipping of 404 errors

**Problems:**
1. **Distinction Lost:** User doesn't know if error is 404, 500, timeout, validation
2. **Retry Guidance:** What should user do? Retry? Contact support? Try different data?
3. **Logging:** Error logged only to console, no structured logging for ops

**Better Pattern:**
```ts
class APIError extends Error {
  constructor(
    public statusCode: number,
    public endpoint: string,
    public details?: Record<string, any>
  ) {
    super()
    this.name = 'APIError'
  }
}

// In composable
try {
  const response = await $fetch(`/api/v1/projects/${projectId}`, {
    method: 'PATCH',
    body: { status: 'open_for_bids' }
  })
} catch (err) {
  if (err.response?.status === 404) {
    throw new APIError(404, 'PATCH /projects/:id', {
      projectId,
      message: 'Project not found (might have been deleted)'
    })
  } else if (err.response?.status === 422) {
    throw new APIError(422, 'PATCH /projects/:id', {
      projectId,
      validationErrors: err.response.data.errors
    })
  } else if (err.code === 'ECONNABORTED') {
    throw new APIError(408, 'PATCH /projects/:id', {
      projectId,
      message: 'Request timed out'
    })
  }
  throw err
}

// In component
try {
  await useProjects().openForBidding(projectId, contractorIds)
} catch (err) {
  if (err instanceof APIError) {
    if (err.statusCode === 404) {
      notify.error(t('errors.projectNotFound'))
    } else if (err.statusCode === 422) {
      notify.error(t('errors.validationFailed'))
    } else if (err.statusCode === 408) {
      notify.error(t('errors.timeout'))
    }
  } else {
    notify.error(t('errors.unknown'))
  }
}
```

**For Story 07-01:**
- Create specific error messages for each failure mode
- Guide user on recovery action (retry, contact admin, etc.)
- Log errors with context for debugging

---

### Issue C: Form Validation Pattern Not Centralized

**Current Approach:**
- Validation logic scattered: computed properties, methods, conditionals
- No single source of truth for "can confirm?"

**Example:**
```ts
// Current: validation is implicit
const canConfirm = computed(
  () => selectedContractors.value.length > 0 && !loading.value
)

// Component logic
const handleConfirm = () => {
  if (!canConfirm.value) return  // Silent failure
}
```

**Better Pattern:**
```ts
// Single validation function
const validateSelection = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (selectedContractors.value.length === 0) {
    errors.push(t('projects.openForBids.helperText'))
  }
  
  if (loading.value) {
    errors.push(t('validation.stillLoading'))
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// Use in template & handler
<Button 
  :disabled="!validateSelection().valid"
  @click="handleConfirm"
>

const handleConfirm = () => {
  const { valid, errors } = validateSelection()
  if (!valid) {
    errors.forEach(err => notify.error(err))
    return
  }
  emit('submitted', selectedContractors.value)
}
```

**For Story 07-01:**
- Create explicit `validateSelection()` method
- Show ALL errors (not just disabled state)
- Reuse validation in both template and handler

---

## Part 3: Testing Strategy Gaps

### Gap 1: Happy Path Only

**Current E2E Tests:**
```ts
test('Button is visible only to admin when project status is "new"')
test('Dialog opens when button is clicked')
test('Dialog contains contractor selection')
test('Confirm button is disabled when no contractors selected')
test('Confirm button is enabled after selecting contractors')
test('Completes open for bids workflow')
```

**Missing:**
- ❌ Loading states (toast appears)
- ❌ Error handling (API fails, user sees error, can retry)
- ❌ Edge cases (empty contractor list, timeout)
- ❌ Accessibility (keyboard nav, screen reader)
- ❌ Race conditions (double-click, rapid prop changes)
- ❌ RTL (layout correct in Arabic)
- ❌ Permissions (non-admin cannot use)

**Recommended Additions:**
```ts
// Error handling
test('shows error toast when API fails', async ({ page }) => {
  // Mock API to return 500
  // Click confirm
  // Expect error toast
  // Expect dialog to stay open for retry
})

// Race conditions
test('prevents double-click race condition', async ({ page }) => {
  // Click confirm twice rapidly
  // Expect only one API call
  // Expect button to stay disabled
})

// Empty state
test('handles empty contractor list gracefully', async ({ page }) => {
  // Mock contractor endpoint to return []
  // Open dialog
  // Expect "No contractors available" message
  // Expect retry button or helpful text
})

// Loading feedback
test('shows loading toast during submission', async ({ page }) => {
  // Click confirm
  // Expect loading toast to appear
  // Wait for success
})

// Accessibility
test('keyboard navigation works', async ({ page }) => {
  // Tab through checkboxes
  // Space to toggle
  // Tab to confirm button
  // Enter to submit
})

// RTL
test('layout correct in Arabic RTL', async ({ page }) => {
  // Switch locale to Arabic
  // Open dialog
  // Expect text right-aligned
  // Expect buttons in RTL order
})

// Permissions
test('hides button for non-admin users', async ({ page }) => {
  // Login as contractor
  // Navigate to project
  // Expect button NOT visible
})
```

**Implementation Priority:**
1. Error handling (critical path)
2. Race conditions (data integrity)
3. Empty state (UX)
4. RTL (spec requirement)
5. Accessibility (compliance)
6. Permissions (security)

---

### Gap 2: Unit Test Coverage

**What's Missing:**
- ❌ `useProjects.openForBidding()` logic
- ❌ `useAdminUsers.getContractorsList()` error cases
- ❌ `validateSelection()` validation logic
- ❌ Dialog state management (reset on close, etc.)

**Recommended Unit Tests:**

```ts
// tests/unit/composables/useProjects-openForBidding.spec.ts
describe('useProjects.openForBidding()', () => {
  it('validates transition before API call', async () => {
    const projects = useProjects()
    // Mock canTransition to return false
    expect(() => projects.openForBidding('proj-1', ['cont-1']))
      .toThrow('Invalid transition')
  })

  it('optimistically updates status', async () => {
    const projects = useProjects()
    const promise = projects.openForBidding('proj-1', ['cont-1'])
    // Status should be updated immediately
    expect(projects.getStatus('proj-1')).toBe('open_for_bids')
  })

  it('rolls back on API error', async () => {
    const projects = useProjects()
    // Mock API to fail
    try {
      await projects.openForBidding('proj-1', ['cont-1'])
    } catch (err) {
      // Status should be rolled back
      expect(projects.getStatus('proj-1')).toBe('new')
    }
  })

  it('invites contractors before updating status', async () => {
    const projects = useProjects()
    const calls: string[] = []
    
    // Spy on API calls
    projects.inviteContractors = async () => calls.push('invite')
    projects.updateProjectStatus = async () => calls.push('status')
    
    await projects.openForBidding('proj-1', ['cont-1'])
    
    // Verify order
    expect(calls).toEqual(['invite', 'status'])
  })

  it('continues if invitation endpoint 404', async () => {
    const projects = useProjects()
    // Mock invitation to 404, status to succeed
    const result = await projects.openForBidding('proj-1', ['cont-1'])
    expect(result.success).toBe(true)
  })

  it('fails if status update 500', async () => {
    const projects = useProjects()
    // Mock status update to 500
    expect(() => projects.openForBidding('proj-1', ['cont-1']))
      .rejects.toThrow()
  })
})
```

---

## Part 4: Performance & Scalability Notes

### Consideration 1: Contractor List Fetching

**Current Approach:**
- Fetch on each dialog open
- No caching

**Scenarios:**
- User opens/closes dialog multiple times → multiple API calls
- If contractor list has 1000+ items → slow rendering

**Optimization Options:**
1. **Client-side cache:** Cache contractor list for 5 minutes
2. **Server-side pagination:** Load first 100, lazy-load more
3. **Search/filter:** Let user narrow list before selection

**For Story 07-01:**
- Add 5-minute TTL cache to `getContractorsList()`
- Consider pagination if list grows large
- Document expected list size constraints

---

### Consideration 2: Dialog State Management

**Current Approach:**
- Parent component manages dialog state
- Dialog resets selections on close

**Risk:**
- If parent re-renders, selections lost (even if dialog still open)
- No persistence (user refreshes page → selections lost)

**For Story 07-01:**
- Document that selections are session-only
- Consider adding "Keep dialog open" option if user navigates away

---

## Part 5: Recommended Follow-Up Stories

After fixing Story 07-01, consider these related work items:

### 🔧 Technical Debt

1. **Add ESLint i18n Rule**
   - Flag hardcoded strings in templates
   - Prevent future regressions
   - Estimated: 1-2 hours

2. **Create Component Linting Rules**
   - Enforce shadcn-vue for all form inputs
   - Check AC completeness
   - Estimated: 2-3 hours

3. **Centralize Error Handling**
   - Create custom error classes (APIError, ValidationError, etc.)
   - Standardize error handling across composables
   - Estimated: 4-5 hours

4. **Async Race Condition Guards**
   - Create helper to prevent concurrent async calls
   - Add to form submission handlers
   - Estimated: 2-3 hours

### 📝 Documentation

1. **Form Validation Best Practices**
   - Document pattern: validation function + computed + method
   - Add to CLAUDE.md
   - Estimated: 1 hour

2. **Error Handling Strategy**
   - Document API error types
   - Guide: which errors to retry, which to show user
   - Add to coding standards
   - Estimated: 2 hours

3. **E2E Test Pattern Library**
   - Reusable test scenarios (error, race condition, RTL, etc.)
   - Save time on future stories
   - Estimated: 3-4 hours

### 🧪 Quality Improvements

1. **Comprehensive E2E Test Suite for Proposals**
   - Cover all stories 07-01 to 07-06
   - Unified testing strategy
   - Estimated: 8-10 hours

2. **Accessibility Audit**
   - Full WCAG 2.1 AA compliance check
   - Focus on Arabic RTL accessibility
   - Estimated: 6-8 hours

---

## Part 6: Decision Record — Design Choices

### Decision: Where Should Validation Live?

**Options:**
1. Component only (current approach)
2. Composable only
3. Both (component for UX feedback, composable for safety)

**Recommendation:** Option 3
- **Component:** Validation for immediate UX feedback (enable/disable buttons)
- **Composable:** Validation as guard before API calls (safety net)
- **Pattern:** Composable is source of truth; component mirrors it

---

### Decision: How to Handle 404 vs Other Errors?

**Options:**
1. Silently skip 404 (current approach)
2. Treat all errors the same
3. Distinguish by status code with specific handling

**Recommendation:** Option 3
- Check actual HTTP status code (not just error message)
- 404 → endpoint doesn't exist, continue
- 500 → server error, abort transaction
- 422 → validation error, show to user
- Timeout → suggest retry

---

### Decision: Component vs Composable Orchestration?

**Options:**
1. Component orchestrates (current: invite → status)
2. Composable orchestrates
3. Separate composable method for entire flow

**Recommendation:** Option 3
- Extract `openForBidding(projectId, contractorIds)` as composable method
- Handles: validation, API calls, rollback, error handling
- Component calls this one method, handles result
- Benefit: testable, reusable, clearer separation

---

## Summary: Architectural Recommendations

| Area | Current State | Recommended | Priority |
|------|---------------|-------------|----------|
| i18n | Reactive (add as needed) | Proactive (lint enforces) | High |
| Error Handling | Generic messages | Specific by error type | High |
| State Management | Component-orchestrated | Composable-orchestrated | Medium |
| Form Validation | Scattered | Centralized function | Medium |
| Race Conditions | Not guarded | Guards on async ops | High |
| Component Usage | Mixed (shadcn + raw HTML) | Consistent (all shadcn) | Medium |
| Test Coverage | Happy path only | Happy + error + race + RTL | High |
| Logging | Console only | Structured logging | Low |

---

**This analysis should inform:**
1. Fix implementation for Story 07-01 (use recommendations)
2. Future story development (establish patterns)
3. Team discussion about standards
4. Backlog prioritization (technical debt)

