# Story 03-05 — Client Gives Final Approval

**Status:** ready-for-dev  
**Epic:** 03 — Milestones, Reports & Approval Flow  
**Story ID:** 3.5  
**Priority:** 🔴 CRITICAL — Unblocks payment processing (Epic 04) and completes approval lifecycle  
**Complexity:** High  
**Estimated Effort:** 10–12 hours

---

## 📋 User Story

**As a** client,  
**I want to** review the supervisor-approved milestone and give my final approval,  
**so that** the contractor can receive payment for completed work.

---

## ✅ Acceptance Criteria

### Final Approval Entry Point

- [ ] "Approve" / "Reject" actions visible **only** to `client` role when milestone status is `supervisor_approved`
- [ ] Button checks permission via `usePermission().can('approve_milestone', milestone.allowedActions)` before rendering
- [ ] Client sees confirmation: "✓ Approved by [Supervisor name]" before their approval button
- [ ] Client can view full report and all images before deciding
- [ ] Action button text reflects finality: "Final approval" or similar (i18n key required)

### Client Approval Dialog (New Implementation)

- [ ] Opens similar to supervisor approval dialog (Story 03-04 ApprovalFlow pattern)
- [ ] Shows supervisor approval confirmation: "✓ Approved by [Supervisor name]"
- [ ] Displays complete report content + all report images in grid
- [ ] **Critical warning section:**
  - Prominent warning box: "This action is final and will release payment to the contractor"
  - Highlight payment amount: `text-2xl font-extrabold text-primary`
  - Warning uses alert/info tone (yellow/orange background)
- [ ] Dialog structure matches Story 03-04 (scrollable content, fixed footer buttons)

### Approve Path (Client Final Approval)

- [ ] "Confirm final approval" button (primary style)
- [ ] Clicking opens confirmation dialog:
  - Title: "تأكيد الاعتماد النهائي" (Final Approval Confirmation)
  - Message: "This will release payment to the contractor and complete this milestone"
  - Two buttons: "إلغاء" (Cancel, ghost) + "اعتماد نهائي" (Final Approve, primary)
- [ ] On confirm:
  - Calls `POST /milestones/:id/approve` with `{ role: 'client' }`
  - **Before API call:** validates `canTransition('milestone', 'supervisor_approved', 'approved')`
  - **Optimistically** updates milestone status to `approved` in store
  - Updates payment status to `ready_for_payout` (if using separate payment tracking)
  - Dialog closes on success
  - Success toast: "تم اعتماد المرحلة بنجاح — سيتم تحويل الدفعة للمقاول" (i18n)
  - Contractor receives in-app notification with payment details
  - **On error:** Rolls back milestone status, shows error toast, dialog remains open

### Reject Path (Client Can Still Reject)

- [ ] "Reject" button (outline/secondary style)
- [ ] Clicking "Reject" opens rejection reason dialog (reuse from Story 03-04)
- [ ] Reason validation: required, minimum 10 characters
- [ ] On confirm:
  - Calls `POST /milestones/:id/reject` with `{ reason: '...', role: 'client' }`
  - **Before API call:** validates `canTransition('milestone', 'supervisor_approved', 'rejected')`
  - Milestone status **briefly shows** `rejected`, then **immediately transitions** to `in_progress`
  - Dialog closes on success
  - Success toast: "تم رفض المرحلة، عاد المقاول للعمل" (i18n — "Milestone rejected, contractor returned to work")
  - Contractor notified with rejection reason
  - **On error:** Rolls back status, shows error toast, dialog remains open
- [ ] Note: Client rejecting bounces back to `in_progress`, allowing supervisor to review new submissions

### Status Transitions

- [ ] Both paths validated with `canTransition()` **before** API call
- [ ] Approval transition: `supervisor_approved` → `approved`
- [ ] Rejection transition: `supervisor_approved` → `rejected` → `in_progress` (auto)
- [ ] If status already changed (race condition), API error caught and shown to user
- [ ] Optimistic updates always rolled back on error

### RTL & Internationalization

- [ ] All dialog content uses logical properties (no `left-*` / `right-*`)
- [ ] Warning box flows naturally in RTL
- [ ] Dialog buttons: Cancel on start side, primary action on end side
- [ ] Image grid naturally flows in RTL (no forced direction)
- [ ] All UI text uses i18n keys
- [ ] Dialog tested in both Arabic and English modes

### Loading States

- [ ] While API request in flight:
  - Primary action button shows loading spinner
  - Primary action button disabled (no double-click)
  - All other UI elements remain enabled
- [ ] Rejection reason textarea remains editable during submit

---

## 🏗️ Developer Context

### Files to Create/Modify

1. **app/components/milestone/ClientApprovalFlow.vue** — NEW (500–600 lines)
   - Client-specific approval dialog component
   - Props: `milestoneId`, `projectId`, `milestoneName`, `reportContent`, `reportImages[]`, `supervisorName`, `milestoneAmount`
   - Emits: `@approved` (on success), `@rejected` (on success), `@cancel` (user closes)
   - Two internal routes/steps: "review" (initial) → "confirm-approve" or "confirm-reject"
   - Renders supervisor approval confirmation badge
   - Renders warning box with payment amount highlighted
   - Renders report content + images at top (scrollable body)
   - Footer buttons: "رفض" (Reject outline) + "اعتماد نهائي" (Final Approve primary)
   - Handles both paths, validation, loading, and error states
   - Reuses `RejectReasonDialog` component from Story 03-04

2. **app/components/milestone/RejectReasonDialog.vue** — VERIFY (from Story 03-04)
   - Ensure this component exists and is properly exported
   - Can be imported and reused in ClientApprovalFlow
   - No modifications needed unless it doesn't exist

3. **app/components/milestone/MilestoneCard.vue** — MODIFY
   - Add "Approve" / "Reject" buttons to action buttons
   - Visible only when:
     - User role is `client` AND
     - Milestone status is `supervisor_approved` AND
     - `usePermission().can('approve_milestone', milestone.allowedActions)` returns true
   - On click: open ClientApprovalFlow dialog, passing milestone data + supervisor name
   - After dialog closes (success): refresh milestone data, close dialog

4. **app/pages/projects/[id]/milestones/[mid].vue** — MODIFY (if not done in Story 03-02)
   - Add "Approve" / "Reject" buttons to milestone detail page (same visibility rules)
   - Open ClientApprovalFlow dialog inline
   - On success: refresh milestone and payment status data

5. **app/composables/useMilestones.ts** — VERIFY/MODIFY
   - Functions `approveMilestone(milestoneId, role)` should already exist from Story 03-04
   - Functions `rejectMilestone(milestoneId, reason, role)` should already exist from Story 03-04
   - No changes needed if they already support `role: 'client'` parameter
   - If not: extend functions to accept `role` parameter and pass to API
   - Implementation pattern (from Story 03-04, reused here):
     ```ts
     async approveMilestone(
       milestoneId: string,
       role: 'supervisor' | 'client'
     ): Promise<Milestone>
     ```

6. **shared/types/milestone.ts** — VERIFY/MODIFY
   - Ensure `Milestone` interface includes:
     - `allowedActions: string[]` (controls button visibility)
     - `supervisorApprovedAt?: string` (timestamp for display)
     - `supervisorName?: string` (optional, for display confirmation)
   - Ensure `Report` interface includes `images: string[]` for display

7. **utils/statusMachine.ts** — VERIFY
   - Ensure transitions exist:
     - `supervisor_approved` → `approved` ✅
     - `supervisor_approved` → `rejected` ✅
     - `rejected` → `in_progress` ✅ (auto, not user-triggered)
   - Functions `canTransition()` work correctly

8. **i18n locales** — MODIFY (ar.json + en.json)
   - Add keys for client approval flow:
     - `milestones.client_approval_dialog.title` → "اعتماد نهائي"
     - `milestones.client_approval_dialog.supervisor_approved_badge` → "✓ Approved by {supervisorName}"
     - `milestones.client_approval_dialog.warning_title` → "This action is final"
     - `milestones.client_approval_dialog.warning_message` → "This will release payment to the contractor"
     - `milestones.client_approval_dialog.amount_label` → "Milestone amount"
     - `milestones.client_approval_dialog.final_approve_button` → "Confirm final approval"
     - `milestones.client_approval_dialog.reject_button` → "Reject"
     - `milestones.client_approve_confirm_dialog.title` → "تأكيد الاعتماد النهائي"
     - `milestones.client_approve_confirm_dialog.message` → "This will release payment to the contractor and complete this milestone"
     - `success.client_milestone_approved` → "تم اعتماد المرحلة بنجاح — سيتم تحويل الدفعة للمقاول"
     - `success.client_milestone_rejected` → "تم رفض المرحلة، عاد المقاول للعمل"
     - `errors.client_milestone_approval_failed` → "فشل الاعتماد النهائي: {message}"
     - `errors.client_milestone_rejection_failed` → "فشل رفض المرحلة: {message}"

### API Integration Points

From `docs/api-contracts.md`:

**POST /milestones/:id/approve**
- Request: `{ role: 'supervisor' | 'client' }`
- Response: Updated `Milestone` with status = `approved` (when role is 'client')
- Error: 422 if invalid transition, 403 if no permission

**POST /milestones/:id/reject**
- Request: `{ reason: string, role: 'supervisor' | 'client' }`
- Response: Updated `Milestone` with status = `in_progress` (auto-transitioned from `rejected`)
- Error: 422 if invalid transition, 403 if no permission

Both endpoints should already be tested in Story 03-04. This story reuses them with `role: 'client'`.

⚠️ **If endpoints not available**, use mocks from Story 03-04 — they handle both `role` values.

### Component Communication Flow

```
MilestoneCard / MilestoneDetail
  ↓ (user clicks "Approve final")
  ↓ (opens ClientApprovalFlow dialog)
ClientApprovalFlow
  ↓ (renders supervisor approval badge + warning + report + images)
  ↓ (user clicks Final Approve OR Reject)
  ↓
(if Final Approve)
  useMilestones.approveMilestone(id, 'client')
    → optimistic update + API call
    → store updates status to approved
    → ClientApprovalFlow emits @approved
    → parent closes dialog + refreshes data
  
(if Reject)
  ClientApprovalFlow opens RejectReasonDialog
    → user enters reason + confirms
    → useMilestones.rejectMilestone(id, reason, 'client')
      → optimistic update + API call
      → store updates to in_progress (auto-transitioned from rejected)
      → ClientApprovalFlow emits @rejected
      → parent closes dialog + refreshes data
```

---

## 🧪 Testing Checklist (Before Calling Done)

### Functional Tests

- [ ] Approval dialog opens when "Approve final" button clicked
- [ ] Dialog shows supervisor approval confirmation: "✓ Approved by [Supervisor name]"
- [ ] Dialog shows complete report content (scrollable)
- [ ] Dialog shows all report images in 2/3-col grid
- [ ] Dialog shows warning box with payment amount highlighted
- [ ] Dialog closes when user clicks X or Cancel
- [ ] Final Approve button opens confirmation dialog
- [ ] Confirmation dialog has correct text (i18n keys resolved)
- [ ] Clicking "Confirm" in approval dialog:
  - Shows loading spinner on button
  - Disables button (no double-click)
  - Calls POST /milestones/:id/approve with `{ role: 'client' }`
  - On success: milestone status updates to `approved`, dialog closes, success toast shown
  - On error: error toast shown, dialog remains open, milestone status unchanged
- [ ] Reject button opens rejection reason dialog
- [ ] Rejection reason dialog shows textarea with placeholder
- [ ] Clicking "Confirm" in rejection dialog with empty/short reason shows validation error
- [ ] Clicking "Confirm" with valid reason (10+ chars):
  - Shows loading spinner
  - Disables button
  - Calls POST /milestones/:id/reject with `{ reason: '...', role: 'client' }`
  - On success: milestone status updates to `in_progress`, dialog closes, success toast shown
  - On error: error toast shown, dialog remains open, milestone status unchanged

### Permission & Status Tests

- [ ] "Approve final" button only visible to `client` role
- [ ] "Approve final" button only visible when milestone status is `supervisor_approved`
- [ ] "Approve final" button hidden if `usePermission().can('approve_milestone')` returns false
- [ ] Approve call validates `canTransition('milestone', 'supervisor_approved', 'approved')` before API
- [ ] Reject call validates `canTransition('milestone', 'supervisor_approved', 'rejected')` before API
- [ ] If transition invalid, API call not made and user shown error

### Status Transition Tests

- [ ] Approving milestone (client):
  - Status optimistically updates to `approved`
  - API success returns milestone with `approved` status
  - On error: status rolls back to `supervisor_approved`
- [ ] Rejecting milestone (client):
  - Status optimistically updates to `rejected` then immediately to `in_progress`
  - API success returns milestone with `in_progress` status
  - On error: status rolls back to `supervisor_approved`

### Validation Tests

- [ ] Rejection reason dialog:
  - Validates min 10 chars
  - Shows error message if < 10 chars
  - Prevents submission with error
  - Allows submission with 10+ chars
- [ ] Confirmation dialog:
  - Cannot be submitted without confirming

### RTL Tests (Test in Arabic language)

- [ ] Dialog renders in RTL layout
- [ ] Warning box and amount highlight render correctly in RTL
- [ ] Supervisor approval badge renders in RTL
- [ ] Image grid flows naturally in RTL
- [ ] Buttons in footer: Cancel on left (start in RTL), Final Approve on right (end in RTL)
- [ ] All strings render in Arabic
- [ ] Dialog submits successfully in RTL mode

### UX & Performance

- [ ] No console errors or warnings
- [ ] Dialog renders without layout shift
- [ ] Images load and display correctly in grid
- [ ] Loading spinner smooth (no jank)
- [ ] Report content scrolls smoothly (dialog body scrollable, footer fixed)
- [ ] Warning box is prominent and readable
- [ ] Payment amount is clearly visible and highlighted
- [ ] Dialog works on mobile (responsive grid, buttons accessible)

### Integration Tests

- [ ] After client approves (final):
  - Milestone card/detail shows status `approved`
  - "Approve final" button disappears
  - Payment status shows `ready_for_payout` (if tracked separately)
  - Contractor receives in-app notification with payment details
- [ ] After client rejects:
  - Milestone card/detail shows status `in_progress`
  - Supervisor can submit new report
  - Contractor receives notification with rejection reason
- [ ] Can navigate to milestone detail and see updated status
- [ ] Refresh page: status persists (backend state correct)
- [ ] Full workflow end-to-end:
  1. Field engineer submits report → `under_review`
  2. Supervisor approves → `supervisor_approved`
  3. Client approves → `approved`
  4. Payment is ready for payout (Epic 04 interaction)

---

## 📖 Technical Notes

### Difference from Story 03-04 (Supervisor Approval)

| Aspect | Supervisor (03-04) | Client (03-05) |
|--------|-------------------|---|
| Component | `ApprovalFlow.vue` | `ClientApprovalFlow.vue` |
| Entry point | "Review" button | "Approve final" button |
| Dialog title | "مراجعة المرحلة" | "اعتماد نهائي" |
| Approve result | `supervisor_approved` | `approved` |
| Contains warning | No | **Yes** — payment release |
| Shows supervisor badge | No | **Yes** — confirms supervisor approved |
| Reject bounces to | `in_progress` | `in_progress` (same) |
| Role parameter | `role: 'supervisor'` | `role: 'client'` |
| Blocks | Story 03-05 & Epic 04 | Payment payout (Epic 04) |

### Optimistic Update Pattern (Reuse from 03-04)

```ts
async approveMilestone(milestoneId, role) {
  const prev = store.getById(milestoneId).status
  const targetStatus = role === 'client' ? 'approved' : 'supervisor_approved'
  
  store.setStatus(milestoneId, targetStatus)  // optimistic
  
  try {
    const res = await useApi(`/milestones/${milestoneId}/approve`, {
      method: 'POST',
      body: { role }
    })
    store.setStatus(milestoneId, res.data.status)
    return res.data
  } catch {
    store.setStatus(milestoneId, prev)  // rollback
    throw error
  }
}
```

### Dialog State Management

Keep ClientApprovalFlow internal state simple:
- `step: 'review' | 'confirm-approve' | 'confirm-reject'`
- `loading: boolean` (during API call)
- `error: string | null`

Same pattern as Story 03-04 `ApprovalFlow`.

### Reusing RejectReasonDialog

The rejection reason dialog from Story 03-04 should be reused here:

```vue
<RejectReasonDialog
  :open="step === 'confirm-reject'"
  :loading="loading"
  @confirm="handleReject"
  @cancel="step = 'review'"
/>
```

If `RejectReasonDialog` doesn't exist (Story 03-04 not yet implemented), create it in this story and make it importable for reuse.

### Warning Box Component

Create a reusable warning box or use shadcn-vue Alert:

```vue
<div class="rounded-lg border border-warning/20 bg-warning/5 p-4">
  <p class="font-bold text-warning">This action is final</p>
  <p class="mt-2 text-sm text-muted-foreground">
    This will release payment to the contractor
  </p>
  <p class="mt-4 text-2xl font-extrabold text-primary">
    {{ milestoneAmount }} EGP
  </p>
</div>
```

### Report Content Scrolling (Reuse from 03-04)

Same as supervisor approval dialog — body scrolls, footer stays fixed:

```vue
<Dialog>
  <DialogContent class="max-h-screen flex flex-col">
    <DialogHeader>
      <h2>اعتماد نهائي</h2>
    </DialogHeader>
    <div class="flex-1 overflow-y-auto">
      <!-- Supervisor badge -->
      <!-- Warning box -->
      <!-- Report content scrolls here -->
    </div>
    <DialogFooter>
      <!-- Buttons stay visible -->
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## 🎯 Success Criteria Summary

- [ ] Client can approve or reject supervisor-approved milestone
- [ ] Approval shows confirmation dialog with clear finality message
- [ ] Status transitions validated with `canTransition()`
- [ ] Optimistic updates + rollback on error working
- [ ] Rejection bounces back to `in_progress` (auto-transition visible)
- [ ] Warning box prominently displays payment release warning
- [ ] Supervisor approval confirmation badge shown
- [ ] All dialogs use i18n keys
- [ ] RTL layout tested and working
- [ ] No console errors
- [ ] Permission checks via `usePermission()` and `allowedActions`
- [ ] Notifications triggered (coordinate with backend)

---

## 📚 Reference & Context

### Story 03-04 Dependencies

This story reuses:
- `ApprovalFlow` component pattern (but for client, not supervisor)
- `RejectReasonDialog` component
- `useMilestones.approveMilestone()` and `useMilestones.rejectMilestone()` functions
- `canTransition()` validation pattern
- Optimistic update + rollback pattern
- i18n infrastructure

**Learnings from 03-04:** Do not repeat the same approval/rejection logic. Extend existing composables to accept a `role` parameter and handle both supervisor and client in one place.

### Previous Stories (03-01, 03-02, 03-03)

- MilestoneCard and MilestoneDetail components exist
- Status validation via `canTransition()` established
- Button visibility matrix pattern in place
- Report display pattern established (from 03-03)

### Epic 03 Overall Flow

This story is step 3 of the approval flow:
1. **03-03:** Field engineer submits report → `under_review` ✅ DONE
2. **03-04:** Supervisor reviews and approves/rejects → `supervisor_approved` or `in_progress` ✅ DONE
3. **03-05 (this story):** Client gives final approval → `approved` or back to `in_progress`
4. **03-06 & 03-07:** Dashboard views for pending approvals (not this story)

Full rejection flow: `under_review` → supervisor rejects → `in_progress` → new submission
Client can also reject: `supervisor_approved` → client rejects → `in_progress` → new submission

### Design Reference

Client final approval dialog spec: Epic 03 design reference § (client approval dialog)
- Dialog with supervisor approval confirmation badge
- Warning box with payment amount
- Report + images display
- Two action buttons: Reject (outline) + Final Approve (primary)
- All styled per design spec

### API Reference

Check `docs/api-contracts.md` for:
- `POST /milestones/:id/approve` endpoint (supports `role: 'client'`)
- `POST /milestones/:id/reject` endpoint (supports `role: 'client'`)
- Request/response schemas
- Error handling

Should be same endpoints as Story 03-04, just with different `role` value.

### Status Machine Reference

From `utils/statusMachine.ts`:
- Verify transitions: `supervisor_approved` → `approved`, `supervisor_approved` → `rejected`, `rejected` → `in_progress`
- All three transitions must be valid

### i18n Keys Required

Client approval dialog:
- `milestones.client_approval_dialog.title`
- `milestones.client_approval_dialog.supervisor_approved_badge`
- `milestones.client_approval_dialog.warning_title`
- `milestones.client_approval_dialog.warning_message`
- `milestones.client_approval_dialog.amount_label`
- `milestones.client_approval_dialog.final_approve_button`

Confirmation dialogs:
- `milestones.client_approve_confirm.title`
- `milestones.client_approve_confirm.message`

Success/error notifications:
- `success.client_milestone_approved`
- `success.client_milestone_rejected`
- `errors.client_milestone_approval_failed`
- `errors.client_milestone_rejection_failed`

---

## 🔗 Dependencies & Blockers

### Unblocked By
- ✅ Story 03-01 (MilestoneCard exists)
- ✅ Story 03-02 (Milestone detail page exists)
- ✅ Story 03-03 (Reports submitted, milestone can be `under_review`)
- ✅ Story 03-04 (Supervisor approval logic exists)

### Blocks
- ⏳ Story 03-06 (Pending reviews dashboard — no direct dependency but same components)
- ⏳ Story 03-07 (Client approval queue — depends on `supervisor_approved` status)
- ⏳ Epic 04 (Payments — depends on `approved` status for payment trigger)

### API Dependencies
- ⏳ `POST /milestones/:id/approve` endpoint (with `role: 'client'` support)
- ⏳ `POST /milestones/:id/reject` endpoint (with `role: 'client'` support)
- Both endpoints must transition status correctly

---

## 📝 Implementation Notes for Developer

### Key Decisions

1. **Component reuse:** Don't duplicate supervisor approval logic — extend it with a `role` parameter
2. **Dialog structure:** ClientApprovalFlow is similar to ApprovalFlow but with payment warning
3. **Rejection reason dialog:** Reuse from Story 03-04, don't recreate
4. **Warning prominence:** Client approval is final action — warning must be prominent
5. **Supervisor badge:** Show who approved before client approval — builds trust
6. **Permission gate:** `allowedActions` array from backend controls all buttons — frontend respects

### Avoid Common Mistakes

- ❌ Don't create duplicate approval logic — reuse composables with `role` parameter
- ❌ Don't forget warning box — it's critical UX for client trust
- ❌ Don't forget supervisor badge — confirms approval chain to client
- ❌ Don't show rejected status permanently — auto-transition to `in_progress` must be visible
- ❌ Don't hardcode status strings — use `canTransition()` and types
- ❌ Don't send approve/reject without `role` field — backend needs it
- ❌ Don't forget i18n keys for all dialog text
- ❌ Don't check `client` role in template — use `usePermission().can()`
- ❌ Don't forget RTL: buttons should be Cancel (start) → Approve (end)

### Code Quality Standards (From CLAUDE.md)

- TypeScript: strict mode, no `any`
- Props: fully typed, no untyped interfaces
- Composition API: `<script setup lang="ts">` only
- State: all through Pinia store or component ref (no global vars)
- Imports: organize (1. imports, 2. props/emits, 3. store, 4. composables, 5. computed, 6. methods, 7. lifecycle)
- No `v-html` (XSS risk)
- No direct $fetch — always through composables/useApi
- Comments: only when WHY is non-obvious
- Logical properties: `ms-*` / `me-*` / `ps-*` / `pe-*` / `start-*` / `end-*`

### Testing in Browser

Before marking done:
1. Log in as client user
2. Navigate to milestone with status `supervisor_approved`
3. Click "Approve final" button (client role only)
4. ClientApprovalFlow dialog opens, shows supervisor badge + warning + report
5. **Approve path:**
   - Click "اعتماد نهائي" (Final Approve)
   - Confirmation dialog opens with warning message
   - Click "اعتماد نهائي" (Confirm)
   - Network shows POST /milestones/:id/approve with `{ role: 'client' }`
   - Dialog closes, milestone status → `approved`, success toast shown
6. **Test reject path on another milestone:**
   - Click "Approve final" again
   - Click "رفض" (Reject)
   - Rejection reason dialog opens
   - Enter reason (10+ chars)
   - Click "تأكيد الرفض" (Confirm reject)
   - Network shows POST /milestones/:id/reject with `{ role: 'client' }`
   - Dialog closes, milestone status → `in_progress`, success toast shown
7. Reload page: status persists
8. Test RTL: switch language to Arabic, repeat both paths

---

## ✅ Implementation Checklist

- [ ] ClientApprovalFlow.vue created (500–600 lines, client-specific approval dialog)
- [ ] Reuses RejectReasonDialog from Story 03-04
- [ ] MilestoneCard.vue updated (add Final Approve button, open dialog)
- [ ] MilestoneDetail page updated (add Final Approve button if needed)
- [ ] useMilestones.ts verified (approveMilestone & rejectMilestone support `role: 'client'`)
- [ ] Status machine verified (supervisor_approved → approved transition valid)
- [ ] Permissions verified (usePermission checks working for client role)
- [ ] i18n keys added (AR + EN, 15+ keys)
- [ ] TypeScript — no errors
- [ ] RTL tested (both approve and reject paths in Arabic)
- [ ] All tests passing (unit + integration)
- [ ] No console errors/warnings
- [ ] Browser test complete (manual QA of both paths)
- [ ] End-to-end workflow test (03-03 → 03-04 → 03-05 complete cycle)

---

## 📖 Files Modified Summary

| File | Action | Lines | Notes |
|------|--------|-------|-------|
| ClientApprovalFlow.vue | NEW | 500–600 | Client-specific approval dialog with warning |
| MilestoneCard.vue | MODIFY | +30 | Add Final Approve button, dialog trigger |
| MilestoneDetail.vue | MODIFY | +30 | Add Final Approve button if needed |
| useMilestones.ts | VERIFY | — | Verify `role` parameter support |
| statusMachine.ts | VERIFY | — | Verify supervisor_approved → approved transition |
| i18n/ar.json | MODIFY | +15 | Arabic strings |
| i18n/en.json | MODIFY | +15 | English strings |
| types/milestone.ts | VERIFY | — | Ensure supervisorName, supervisorApprovedAt fields |

---

## 📝 Implementation Ready

**Story Status:** ready-for-dev  
**Created:** 2026-05-08  
**Context Engine:** BMad Ultimate Story Creation  

This story completes the milestone approval lifecycle. Client final approval is the last step before payment processing (Epic 04).

**Developer:** Follow this story exactly. Reuse patterns from Story 03-04 rather than duplicating approval logic. The key difference is `role: 'client'` parameter and payment warning UI.

**Next:** Run `/bmad-dev-story` with this story file to begin implementation.
