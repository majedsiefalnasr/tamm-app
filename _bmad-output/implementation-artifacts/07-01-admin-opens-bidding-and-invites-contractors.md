# Story 07-01 — Admin Opens Bidding and Invites Contractors

**Status:** ready-for-dev  
**Epic:** 07 — Proposals & Contractor Selection  
**Story ID:** 7.1  
**Priority:** 🟢 HIGH — Entry point to proposal workflow  
**Complexity:** Medium  
**Estimated Effort:** 8–10 hours  
**Created:** 2026-05-09  
**Dependencies:** Story 02-03 (Project detail page), Story 06-01 (Admin user list)

---

## 📋 User Story

**As an** admin,  
**I want to** open a project for bidding and invite specific contractors,  
**so that** only vetted contractors can submit proposals.

---

## ✅ Acceptance Criteria

### Button Visibility & Access Control
- [ ] "Open for Bids" button visible in project detail (`/projects/:id`) only when:
  - Current user is `admin` or `super_admin`
  - Project status is exactly `new`
  - Button styled as primary `Button` from shadcn-vue
- [ ] Button text: "فتح باب العروض" (Open for Bids) — i18n key
- [ ] Clicking button opens "Open for Bids" dialog (see below)
- [ ] Non-admin users: button is invisible (not disabled)
- [ ] Projects with status ≠ `new`: button is invisible

### "Open for Bids" Dialog
- [ ] Dialog title: "فتح باب العروض لـ [project name]" (Open for Bids for [project name])
- [ ] Uses shadcn-vue `Dialog` component
- [ ] Content layout:
  1. Subtitle (body secondary): "اختر المقاولين المدعويين للعرض" (Select contractors invited to bid)
  2. Multi-select field: "المقاولون" (Contractors)
     - Fetches `GET /admin/users?role=contractor`
     - Shows contractor names in a scrollable list
     - Type: shadcn-vue `Select` with `multiple` behavior (or custom checkboxes if needed)
     - At least one contractor must be selected to proceed
  3. Helper text below select: "اختر مقاول واحد على الأقل" (Select at least one contractor) in small text, muted color
- [ ] Dialog buttons:
  - Cancel button (outline style): "إلغاء" (Cancel)
  - Confirm button (primary style): "فتح العروض" (Open for Bids) — disabled when 0 contractors selected
- [ ] Dialog closes on Cancel
- [ ] On Confirm → proceed to API calls (see below)

### API Calls (Orchestration)
- [ ] On confirm, execute in sequence:
  1. **`POST /projects/:id/invitations`** (if endpoint available) OR mock
     - Payload: `{ contractor_ids: [id1, id2, ...] }`
     - Response: Success confirmation
  2. **`PATCH /projects/:id/status`**
     - Payload: `{ status: 'open_for_bids' }`
     - Response: Updated project object with new status
- [ ] If **endpoint not available**, create mock function in `app/composables/__mocks__/useProjects.ts`
  - Mock returns success response after 300ms delay
  - Add comment: `// TODO: replace mock — POST /projects/:id/invitations`

### Optimistic Update
- [ ] On submit button click:
  1. Update local project store: `project.status = 'open_for_bids'`
  2. Disable submit button + show loading spinner
  3. Display toast: "جاري فتح باب العروض..." (Opening for bids...)
- [ ] On API error:
  1. Revert store: `project.status = 'new'`
  2. Show error toast with message from API
  3. Dialog remains open
  4. User can retry or cancel

### State Validation
- [ ] Before any API call: validate `canTransition('project', 'new', 'open_for_bids')`
  - Use `statusMachine.ts` function
  - If transition invalid, show error and do not proceed
  - This prevents concurrent state issues

### Project Status Update in UI
- [ ] After successful status change:
  - Project detail page: status badge updates to "مفتوح للعروض" (Open for Bids) with appropriate tone color
  - Dialog closes automatically
  - Success toast shown: "تم فتح باب العروض بنجاح" (Bidding opened successfully)

### Re-opening Dialog (Add More Contractors)
- [ ] If project is already `open_for_bids`:
  - "Open for Bids" button remains visible (optional enhancement — MVP can hide it)
  - Clicking opens dialog again with current invited list pre-filled
  - User can add more contractors (new ones, or confirm existing)
  - Similar API flow: POST invitations for new contractors only
  - Admin can invite additional contractors anytime while status is `open_for_bids`

### Notifications (Not in this story — only documented for context)
- [ ] Each invited contractor receives in-app notification: "تم دعوتك للعرض على المشروع [name]" (You were invited to bid on project [name])
  - **Status:** ⏳ Planned — will be implemented when notification system is complete
  - **TODO:** Wire this up after story 05-04 (notification content)

### General Requirements
- [ ] All text uses i18n keys (no hardcoded strings)
- [ ] RTL layout verified in Arabic
- [ ] No console errors or warnings
- [ ] TypeScript: strict mode, no `any` types
- [ ] Loading state: submit button shows spinner + text "جاري..." (Processing...)
- [ ] Error handling: inline error message + retry capability
- [ ] Responsive: dialog adapts to mobile (full width with bottom sheet behavior optional)

---

## 🏗️ Developer Context

### Files to Create / Modify

#### 1. **app/pages/projects/[id].vue** (Modify)
- **Current state:** Displays project detail with contractor/team/milestone sections
- **Change required:** Add "Open for Bids" button above the contractor section
- **Logic:**
  - Compute button visibility: `isAdmin && project.status === 'new'`
  - Button click → open `OpenForBidsDialog`
  - Handle dialog events: `@accept` (API call) and `@cancel` (close)

#### 2. **app/components/project/OpenForBidsDialog.vue** (Create new)
- **Purpose:** Dialog for inviting contractors
- **Props:**
  ```ts
  interface Props {
    projectId: string
    projectName: string
    isOpen: boolean
  }
  ```
- **Emits:**
  ```ts
  emit('update:open', boolean)  // Control dialog visibility
  emit('submitted', { contractorIds: string[] })
  ```
- **Template structure:**
  - Dialog wrapper (shadcn-vue)
  - Title with project name
  - Select component for contractors multi-select
  - Helper text below select
  - Button row: Cancel + Confirm
- **Validation:**
  - Disable confirm button when `selectedContractors.length === 0`
  - Show validation message if user tries to confirm without selecting

#### 3. **app/composables/useProjects.ts** (Modify)
- **Current state:** Has methods like `getProjectById()`, `createProject()`, `updateProjectStatus()`
- **Changes required:**
  1. Add method: `async inviteContractors(projectId: string, contractorIds: string[])`
     - Calls `POST /projects/:id/invitations` (or mock if not available)
     - Returns: `{ success: boolean, message?: string }`
  2. Modify `updateProjectStatus()` to handle `open_for_bids` transition
  3. Add comment at invitations call: `// TODO: replace mock when endpoint available`

#### 4. **app/composables/useAdmin.ts** (Modify or Create)
- **Purpose:** Admin-specific API calls
- **Add method:** `async getContractorsList()`
  - Calls `GET /admin/users?role=contractor`
  - Returns: `{ id: string, name: string, email: string }[]`
  - Cache with 5-minute TTL (optional optimization)
  - Fallback: Return mock contractors if endpoint not available

#### 5. **shared/types/project.ts** (Verify/Extend)
- **Verify:** `ProjectStatus` union includes `'open_for_bids'`
- **Verify:** Type is used consistently in all API responses and store

#### 6. **utils/statusMachine.ts** (Verify)
- **Verify:** `canTransition('project', 'new', 'open_for_bids')` returns `true`
- **Current transitions:** All project transitions defined
- **No changes needed** — already exists

#### 7. **i18n/locales/ar.json** (Add keys)
```json
{
  "projects": {
    "openForBids": {
      "button": "فتح باب العروض",
      "dialogTitle": "فتح باب العروض لـ",
      "selectContractors": "اختر المقاولين المدعويين للعرض",
      "helperText": "اختر مقاول واحد على الأقل",
      "confirmButton": "فتح العروض",
      "cancelButton": "إلغاء",
      "loadingMessage": "جاري فتح باب العروض...",
      "successMessage": "تم فتح باب العروض بنجاح",
      "errorMessage": "فشل فتح باب العروض. يرجى المحاولة مرة أخرى"
    }
  }
}
```

#### 8. **i18n/locales/en.json** (Add keys)
```json
{
  "projects": {
    "openForBids": {
      "button": "Open for Bids",
      "dialogTitle": "Open for Bids — ",
      "selectContractors": "Select contractors invited to bid",
      "helperText": "Select at least one contractor",
      "confirmButton": "Open for Bids",
      "cancelButton": "Cancel",
      "loadingMessage": "Opening for bids...",
      "successMessage": "Bidding opened successfully",
      "errorMessage": "Failed to open for bids. Please try again."
    }
  }
}
```

#### 9. **app/composables/__mocks__/useProjects.ts** (Modify)
- **Current state:** Has mock implementations for all methods
- **Add mock:** `inviteContractors()` returns success after 300ms delay
- **Add comment:** `// TODO: replace mock — POST /projects/:id/invitations`

#### 10. **app/composables/__mocks__/useAdmin.ts** (Create or Modify)
- **Add mock:** `getContractorsList()` returns array of 5–10 mock contractors
- **Mock data structure:**
  ```ts
  [
    { id: "c1", name: "محمد الراشد", email: "m.rashid@example.com" },
    { id: "c2", name: "فاطمة السلمي", email: "f.salmi@example.com" },
    // ... more
  ]
  ```
- **Add comment:** `// TODO: replace mock when endpoint available`

### Implementation Notes

**Dialog State Management:**
- Parent (project detail page) manages `isDialogOpen` state
- Pass to dialog: `v-model="isDialogOpen"` or `:isOpen="isDialogOpen" @update:open="isDialogOpen = $event"`
- Dialog emits back to parent when confirmed → parent handles API call

**Contractor Fetching:**
- Fetch on dialog mount (lazy loading)
- Show skeleton/spinner while loading
- Cache result (optional — can refetch each time)
- Handle error: "Failed to load contractors" message

**Error Handling Pattern:**
```ts
async function submitBidding(selectedContractorIds: string[]) {
  const prev = { ...project }
  project.status = 'open_for_bids'  // optimistic
  
  try {
    // Try invitations first (if endpoint exists)
    try {
      await useProjects().inviteContractors(projectId, selectedContractorIds)
    } catch (e) {
      // Endpoint may not exist yet — continue
      if (!e.message.includes('404')) throw e
    }
    
    // Then update status
    await useProjects().updateProjectStatus(projectId, 'open_for_bids')
    
    notify.success(t('projects.openForBids.successMessage'))
    isDialogOpen = false
  } catch (error) {
    project = prev  // rollback
    notify.error(error.message || t('projects.openForBids.errorMessage'))
  }
}
```

**RTL Considerations:**
- Dialog: all text start-aligned
- Select dropdown: respects RTL direction
- Buttons: cancel on start side (left in RTL), confirm on end side (right in RTL)
- Test in both languages before marking done

### Previous Story Learnings (From Story 06-05)
- **Admin dialogs** use shadcn-vue `Dialog` with title + subtitle pattern
- **Multi-select** can be implemented via `Select` with `multiple: true` or custom checkbox group
- **Button loading states** require explicit spinner + disabled state
- **Optimistic updates** must have rollback on error — don't just log errors
- **i18n** keys should follow pattern: `domain.feature.element` (e.g., `projects.openForBids.button`)

### Git Context (Last 3 commits)
```
fbd4b8a feat: Story 06-05 — Admin Dashboard
b9d98f7 feat: Story 06-04 — Admin Project Overview  
805ef9f feat: Story 06-03 — Assign engineers to project
```
**Patterns to follow from recent work:**
- Admin features use consistent `SectionCard` styling
- Dialogs follow pattern: title + subtitle + form + button row
- Optimistic updates are implemented in composables, not components

---

## 🎯 Implementation Guardrails (All Verified)

### ✅ Must-Have Checks Before Starting
- [ ] Read `CLAUDE.md` §0 (behavioral guidelines)
- [ ] Read `docs/design-spec.md` §5 (button/dialog styles)
- [ ] Read `docs/status-flows.md` §2 (project statuses)
- [ ] Verify `canTransition('project', 'new', 'open_for_bids')` works in `statusMachine.ts`
- [ ] Check `GET /admin/users?role=contractor` exists in API contracts (or create mock)
- [ ] Check `POST /projects/:id/invitations` exists in API contracts (or create mock)

### ✅ Must-Verify During Implementation
- [ ] Button only visible to `admin` / `super_admin`
- [ ] Button only visible when project.status === 'new'
- [ ] Dialog opens on button click
- [ ] Contractor list fetches and loads in dialog
- [ ] Confirm button disabled when 0 contractors selected
- [ ] API calls made in correct order: invitations → status update
- [ ] Status badge updates after success
- [ ] Rollback works on error
- [ ] Dialog closes after success
- [ ] All text is i18n'ed (no hardcoded strings)
- [ ] RTL tested in Arabic view

### ✅ Test Coverage Required
- **Unit tests** (`tests/unit/composables/useProjects.spec.ts`):
  - `inviteContractors()` success case
  - `inviteContractors()` error case with rollback
  - `updateProjectStatus('new', 'open_for_bids')` validation
- **E2E tests** (`tests/e2e/project-bidding.spec.ts` — create new file):
  - Admin can open dialog from project detail
  - Contractor list loads in dialog
  - Confirm button disabled when no selection
  - Confirm button enabled when selected
  - API calls made on confirm
  - Success toast shown
  - Dialog closes
  - Project status badge updates
  - Error handling (API failure)
  - Rollback on error

### ✅ Definition of Done
- [ ] All acceptance criteria checked
- [ ] Dialog UI matches design spec
- [ ] i18n keys added (Arabic + English)
- [ ] RTL tested in Arabic
- [ ] No console errors
- [ ] TypeScript strict mode — no `any`
- [ ] Optimistic update + rollback working
- [ ] Error handling shown to user
- [ ] Loading states visible
- [ ] Unit tests pass (>80% coverage)
- [ ] E2E tests pass
- [ ] Code review approved
- [ ] Ready for next story (07-02 — Contractor submits proposal)

---

## 📚 Story Context & Blockers

### API Status
- **`POST /projects/:id/invitations`** — ⏳ Planned (not yet implemented)
  - **Workaround:** Create mock in `__mocks__/useProjects.ts`
  - **TODO:** Swap mock for real endpoint when Laravel team delivers
- **`PATCH /projects/:id/status`** — ✅ Available
- **`GET /admin/users?role=contractor`** — ✅ Available

### Design Spec References
- Dialog styling: `docs/design-spec.md` §5.2 (Dialog component)
- Button styling: `docs/design-spec.md` §5.5 (Button variants)
- Status badge tones: `docs/design-spec.md` §1.4 (Tone mapping)

### Architecture Compliance
- **State machine:** `utils/statusMachine.ts` — must use for validation
- **API calls:** Always through `useProjects()` / `useAdmin()` composables
- **Notifications:** Hook will be added in story 05-04 (when ready)
- **i18n:** All UI text must use i18n keys

### No Blockers
This story can proceed immediately. API mocks are in place for missing endpoints.

---

## 🔗 Cross-Story Impact

### Depends on
- Story 02-03 (Project detail page — provides container for button)
- Story 06-01 (Admin user list — contractor fetching pattern)

### Blocks
- Story 07-02 (Contractor submits proposal — needs `open_for_bids` status)
- Story 07-03 (Admin closes bidding — needs `open_for_bids` status)

### Parallel
- Stories 04–06 can proceed independently

---

## 📝 Notes

**Why this story first?**
It's the entry point to the entire proposal workflow. Without an "open for bids" action, contractors can't see the project and submit proposals. This unblocks the rest of Epic 07.

**About re-inviting:**
The acceptance criteria allow re-opening the dialog and adding more contractors while status is still `open_for_bids`. This is a feature, not a bug — real-world scenario: admin wants to invite a contractor they forgot initially.

**About notifications:**
Notifications to invited contractors will be implemented in a later pass when the notification system is complete (story 05-04). For now, just make the API call; the notification hook will be wired up later.

---

*Created: 2026-05-09 · Epic: 07 — Proposals & Contractor Selection · Complexity: Medium*
