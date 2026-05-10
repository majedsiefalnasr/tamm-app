# Story 07-03 — Admin Closes Bidding for Review

**Status:** done  
**Epic:** 07 — Proposals & Contractor Selection  
**Story ID:** 7.3  
**Priority:** 🟢 HIGH — Core bidding workflow  
**Complexity:** Medium  
**Estimated Effort:** 8–10 hours  
**Created:** 2026-05-09  
**Dependencies:** Story 07-01 (Admin opens bidding), Story 07-02 (Contractor submits proposal)

---

## 📋 User Story

**As an** admin,  
**I want to** close the bidding phase and move the project to client review,  
**so that** the client can start comparing proposals.

---

## ✅ Acceptance Criteria

### Visibility & Access Control
- [ ] "Close bidding" button visible to `admin` / `super_admin` only when project is `open_for_bids`
- [ ] Button appears in project detail page next to "Open for Bids" status badge
- [ ] Button **disabled** if zero proposals have been submitted
- [ ] Button **enabled** if at least one proposal exists
- [ ] Non-admin users cannot see this button
- [ ] Button remains disabled until at least one contractor has submitted a proposal

### Confirmation Dialog
- [ ] Clicking "Close bidding" button opens confirmation dialog
- [ ] Dialog title: "إغلاق جولة العروض" (Close bidding)
- [ ] Dialog body shows:
  - Message: "هل تريد إغلاق جولة العروض؟" (Close bidding?)
  - Count: "عدد العروض المستلمة: [n]" (Number of proposals received: [n])
  - Additional info: "سيتم إخطار العميل لمراجعة العروض" (The client will be notified to review proposals)
- [ ] Dialog buttons:
  - Cancel (outline): "إلغاء" (Cancel)
  - Confirm (primary): "تأكيد الإغلاق" (Confirm Close) or "نعم، أغلق جولة العروض" (Yes, close bidding)

### API Integration — Project Status Update
- [ ] On confirm:
  - Calls `PUT /projects/:id` with payload: `{ "status": "under_review" }`
  - Project status badge updates from "Open for Bids" to "Under Review"
  - Dialog closes on success
  - Show success toast: "تم إغلاق جولة العروض بنجاح" (Bidding closed successfully)
- [ ] If endpoint not available, use mock in composables
- [ ] Handle API errors gracefully — show error toast, dialog stays open for retry
- [ ] Validate status transition before API call: `canTransition('project', 'open_for_bids', 'under_review')`

### Admin Visibility — Invitation List (Optional Enhancement)
- [ ] Admin can see (in project detail or separate section):
  - List of invited contractors
  - Count of how many invited contractors have responded (submitted proposals)
  - Count of proposals received vs. invitations sent
  - Example: "3 out of 5 invited contractors have submitted proposals"
- [ ] This helps admin understand response rate before closing bidding

### Client Notification
- [ ] On successful status change:
  - Project owner (client) receives in-app notification
  - Notification text: "العروض جاهزة لمراجعتك" (Proposals are ready for your review)
  - Notification links to project detail (Story 07-04 — Client Reviews Proposals)
  - Notification marked as unread in notification bell
- [ ] Notification is fired via existing notification system (Story 05-04)

### Optimistic Update & Rollback
- [ ] On confirm button click:
  1. Update local project store: project status changes to `under_review`
  2. Update project detail page: status badge changes visually
  3. Hide "Close bidding" button immediately
  4. Disable confirm button + show loading state
- [ ] On API error:
  1. Revert project status in store (return to `open_for_bids`)
  2. Show error toast with message from API
  3. Dialog remains open for retry or cancel
  4. "Close bidding" button re-enabled

### General Requirements
- [ ] All text uses i18n keys (no hardcoded strings)
- [ ] RTL layout verified in Arabic
- [ ] No console errors or warnings
- [ ] TypeScript: strict mode, no `any` types
- [ ] Loading state: confirm button shows spinner
- [ ] Error handling: toast notifications
- [ ] Responsive: dialog adapts to mobile
- [ ] Component uses `<script setup lang="ts">` (Vue 3 Composition API)
- [ ] Props are TypeScript-typed

---

## 🏗️ Developer Context

### Files to Create / Modify

#### 1. **app/components/project/CloseBiddingDialog.vue** (Create new)
- **Purpose:** Dialog for admin to confirm closing bidding
- **Props:**
  ```ts
  interface Props {
    projectId: string
    projectName: string
    proposalCount: number  // count of submitted proposals
    invitedCount?: number  // count of invited contractors (optional)
    isOpen: boolean
  }
  ```
- **Emits:**
  ```ts
  emit('update:open', boolean)  // Control dialog visibility
  emit('confirmed')  // Fired when admin confirms close
  ```
- **Internal state:**
  - `isLoading` ref for confirmation button
  - Error state for retry logic
- **Template structure:**
  - Dialog wrapper (shadcn-vue)
  - Display proposal count dynamically
  - Confirm + Cancel buttons
  - Show loading spinner during API call
  - Show error toast on failure

#### 2. **app/pages/projects/[id].vue** (Modify)
- **Current state:** Project detail page displays status badge and actions
- **Changes required:**
  - Add "Close bidding" button visible only when:
    - `project.status === 'open_for_bids'`
    - User has permission: `can('manage_project')`
    - At least one proposal exists: `proposalCount > 0`
  - Button disabled if `proposalCount === 0`
  - Add state: `isCloseBiddingDialogOpen: ref(false)`
  - Handle dialog events: `@update:open="isCloseBiddingDialogOpen = $event"`
  - On confirm: call composable to update project status
  - Refresh project data after successful update
  - Pass `proposalCount` to dialog component

#### 3. **app/composables/useProjects.ts** (Modify — if not already done in 07-02)
- **Current state:** Manages project state and API calls
- **Add/Modify:**
  - Add method: `async function closeBiddingForReview(projectId: string): Promise<boolean>`
    - Calls `PUT /projects/:id` with `{ status: "under_review" }`
    - Validates: `canTransition('project', 'open_for_bids', 'under_review')`
    - Updates store on success
    - Returns success/failure boolean
  - Ensure optimistic updates are handled correctly
  - Handle rollback on API error

#### 4. **app/stores/projects.ts** (Verify/Extend)
- **Current state:** Manages project list and detail state
- **Verify/Add:**
  - Method to update project status in store: `setProjectStatus(projectId: string, status: ProjectStatus)`
  - Ensure state mutation is tracked for reactivity
  - Provide getter: `getProjectProposalCount(projectId: string): number`

#### 5. **app/composables/__mocks__/useProjects.ts** (Create if not exists)
- **Purpose:** Mock API responses for endpoints not yet available
- **Mock implementation for `closeBiddingForReview()`:**
  - Simulates 400ms API delay
  - Returns success: `{ success: true, project: { ...updatedProject } }`
  - Add comment: `// TODO: replace mock — PUT /projects/:id (close bidding)`
- **Note:** The `PUT /projects/{id}` endpoint should be available in API contracts already

#### 6. **app/composables/useNotifications.ts** (Verify)
- **Current state:** Manages in-app notifications
- **Verify:**
  - Has method to create notification for client: `createNotification()`
  - Can be called from composable when bidding closes
  - Notification payload: `{ userId: clientId, type: 'bidding_closed', message: '...', link: `/projects/${projectId}` }`

#### 7. **i18n/locales/ar.json** (Add keys)
```json
{
  "projects": {
    "closeBidding": {
      "button": "إغلاق جولة العروض",
      "dialogTitle": "إغلاق جولة العروض",
      "dialogMessage": "هل تريد إغلاق جولة العروض؟",
      "proposalCount": "عدد العروض المستلمة:",
      "info": "سيتم إخطار العميل لمراجعة العروض",
      "confirmButton": "تأكيد الإغلاق",
      "cancelButton": "إلغاء",
      "successMessage": "تم إغلاق جولة العروض بنجاح",
      "errorMessage": "فشل إغلاق جولة العروض. يرجى المحاولة مرة أخرى",
      "noProposalsError": "لا توجد عروض مستلمة حتى الآن"
    }
  }
}
```

#### 8. **i18n/locales/en.json** (Add keys)
```json
{
  "projects": {
    "closeBidding": {
      "button": "Close Bidding",
      "dialogTitle": "Close Bidding",
      "dialogMessage": "Close the bidding phase?",
      "proposalCount": "Proposals received:",
      "info": "The client will be notified to review proposals.",
      "confirmButton": "Confirm Close",
      "cancelButton": "Cancel",
      "successMessage": "Bidding closed successfully.",
      "errorMessage": "Failed to close bidding. Please try again.",
      "noProposalsError": "No proposals received yet."
    }
  }
}
```

#### 9. **shared/types/project.ts** (Verify)
- **Verify:** `ProjectStatus` union includes all statuses: `'new' | 'open_for_bids' | 'under_review' | 'contractor_selected' | 'active' | 'on_hold' | 'completed'`

#### 10. **utils/statusMachine.ts** (Verify)
- **Current state:** Defines valid status transitions
- **Verify:** Transition exists: `'open_for_bids'` → `'under_review'` for projects
- **Note:** This should already exist from Story 07-01, but confirm

---

## 🎯 Implementation Strategy

### Phase 1: Dialog Component & State Management (2-3 hours)
1. Create `CloseBiddingDialog.vue` with confirmation UI
2. Add dialog state to project detail page
3. Wire button to dialog open/close
4. Implement loading state during confirmation

### Phase 2: API Integration & Optimistic Update (3-4 hours)
1. Add `closeBiddingForReview()` method to `useProjects` composable
2. Implement optimistic update: update store immediately
3. Call `PUT /projects/:id` endpoint
4. Handle rollback on error
5. Show success/error toasts

### Phase 3: Client Notification (1-2 hours)
1. Trigger notification to project owner after successful status change
2. Use existing notification system (Story 05-04)
3. Set notification type and message from i18n

### Phase 4: Testing & Polish (2 hours)
1. Test button disabled/enabled based on proposal count
2. Test RTL layout in Arabic
3. Test error states and rollback
4. Verify console has no errors

---

## 📊 Previous Story Intelligence

### Story 07-02 Learnings
- **Dialog pattern:** Used shadcn-vue Dialog component with VeeValidate + Zod
- **Optimistic updates:** Pattern: update store first, API call second, rollback on error
- **Prop validation:** Props should be strongly typed with interfaces
- **i18n:** All text must go through i18n keys — no hardcoded strings
- **Toast notifications:** Use existing toast system for success/error feedback

### Relevant Code Patterns from 07-02
- Dialog opening/closing via `isOpen` prop + `@update:open` emit
- Form validation with VeeValidate before submission
- Loading state on buttons during async operations
- Error handling with rollback

---

## 🔌 Git Intelligence — Recent Patterns

### From 07-02 Commit
- Dialog components use shadcn-vue `Dialog` wrapper
- Status updates via composable methods
- Store mutations for optimistic updates
- Toast notifications for user feedback
- Character counter pattern for text inputs

### File Organization Pattern
- New dialogs go in `app/components/project/` (component-specific)
- Composables in `app/composables/` with optional mocks
- Store methods in `app/stores/projects.ts`
- i18n keys in `i18n/locales/{ar,en}.json`

---

## 🌐 Technical Requirements

### API Endpoint (Should be Available)
- **PUT /projects/{id}** — already in API contracts
  - Payload: `{ "status": "under_review" }`
  - Response: `{ "success": true, "data": { "id": string, "name": string, "updated_at": datetime } }`
  - Verify latest API contract for full schema

### Status Machine Validation
- Must validate before API call: `canTransition('project', 'open_for_bids', 'under_review')`
- This function should exist in `utils/statusMachine.ts` from Story 07-01
- If not available, check status-flows.md §2 for transition rules

### Permission Check
- Admin/Super Admin only: `can('manage_project')`
- This should be available from `usePermission()` composable

### Project State Requirements
- Project must have `status === 'open_for_bids'`
- At least one proposal must exist (proposal count > 0)
- Proposal count available from project store or API

---

## ✅ Definition of Done

- [x] Component: `CloseBiddingDialog.vue` created with full UI
- [x] Button visible in project detail only to admin when `open_for_bids`
- [x] Button disabled when proposal count = 0
- [x] Dialog shows confirmation with dynamic proposal count
- [x] `PUT /projects/:id` endpoint called with `{ status: "under_review" }`
- [x] Optimistic update: status changes immediately in UI
- [x] Rollback on error: status reverts if API fails
- [x] Success toast shown after status change
- [x] Client notification fired (if notification system available)
- [x] All text uses i18n keys — no hardcoded strings
- [x] RTL verified in Arabic
- [x] No TypeScript errors, no `any` types
- [x] No console errors or warnings
- [x] Responsive design verified on mobile
- [x] Component follows Vue 3 Composition API conventions
- [x] Tested: can open dialog, confirm, see loading state, see success/error states

---

### Review Findings

_Code review follow-up (2026-05-10): fixes applied on branch._

#### resolved

- [x] **Permission model** — Added `manage_project` for `admin` / `super_admin`; Open for bids, Close bidding, and Assign engineers visibility uses `can('manage_project')`.

- [x] **`updateProjectStatus` errors** — Uses `useApi`; real failures rethrow so optimistic rollback runs; mock fallback only when the endpoint is unavailable (404 / 501 / 503 / fetch failures).

- [x] **Proposal counts** — Admins load proposals while status is `open_for_bids` (`loadProposalsForBiddingAdmin`); count refreshes after contractor submission.

- [x] **Client in-app notification** — `pushLocalNotification` targets `client_id`; drawer filters by viewer so admins do not see the client’s unread item.

- [x] **Dialog loading** — Parent drives `confirmPending` during async close.

- [x] **Tests** — `CloseBiddingDialog.spec.ts` aligned with `confirmPending` and a stable dialog stub.

#### defer (unchanged)

- [x] [Review][Defer] Optional admin invitation metrics — deferred; optional AC (`invitedCount` shown when invitations exist).

- [x] [Review][Defer] `projectState` vs `getProjectById` — deferred pending unified API-backed store.

---

## 📚 Reference

| Document | Section | Use for |
|----------|---------|---------|
| docs/status-flows.md | §2 — Project status flow | Valid transitions, project statuses |
| docs/design-spec.md | §9 — Project detail | Button placement, styling |
| CLAUDE.md | §8 — State management | Pinia store patterns |
| CLAUDE.md | §7 — Status system | Status validation rules |
| docs/api-contracts.md | PUT /projects/{id} | Endpoint schema |

---

**Story complexity:** Medium (straightforward status update with optimistic UX)  
**Developer readiness:** Implemented and reviewed — post-review fixes merged into codebase.
