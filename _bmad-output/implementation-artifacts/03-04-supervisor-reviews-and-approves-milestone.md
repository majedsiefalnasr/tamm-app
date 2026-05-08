# Story 03-04 — Supervisor Reviews and Approves Milestone

**Status:** review  
**Epic:** 03 — Milestones, Reports & Approval Flow  
**Story ID:** 3.4  
**Priority:** 🔴 CRITICAL — Unblocks client final approval (Story 03-05) and payment processing (Epic 04)  
**Complexity:** High  
**Estimated Effort:** 12–14 hours

---

## 📋 User Story

**As a** supervisor engineer,  
**I want to** review the field report and approve or reject the milestone,  
**so that** the work can proceed to client approval or be returned for rework.

---

## ✅ Acceptance Criteria

### Review Entry Point

- [ ] "Review" action visible **only** to `supervisor_engineer` role when milestone status is `under_review`
- [ ] Button checks permission via `usePermission().can('approve_milestone', milestone.allowedActions)` before rendering
- [ ] Clicking "Review" opens full approval dialog showing complete report
- [ ] Dialog has two action paths: Approve or Reject

### Approval Dialog (ApprovalFlow component)

- [ ] Title: "مراجعة المرحلة — [milestone name]" (Arabic first)
- [ ] Shows complete report content + all report images in grid
- [ ] Report images displayed in grid: `grid grid-cols-2 md:grid-cols-3 gap-2`
- [ ] Each image: `rounded-xl overflow-hidden aspect-video object-cover`
- [ ] Report content is scrollable (dialog body scrolls, footer buttons stay fixed)
- [ ] All UI strings use i18n keys (no hardcoded text)

### Approve Path

- [ ] "اعتماد المرحلة" (Approve milestone) button displayed prominently (primary style)
- [ ] Clicking opens confirmation dialog:
  - Title: "تأكيد الاعتماد" or similar
  - Message: "This will notify the client for final approval"
  - Two buttons: "إلغاء" (Cancel, ghost) + "اعتماد" (Confirm, primary)
- [ ] On confirm:
  - Calls `POST /milestones/:id/approve` with `{ role: 'supervisor' }`
  - **Before API call:** validates `canTransition('milestone', 'under_review', 'supervisor_approved')`
  - **Optimistically** updates milestone status to `supervisor_approved` in store
  - Dialog closes on success
  - Success toast: "تم اعتماد المرحلة بنجاح" (i18n)
  - Client receives in-app notification (backend triggers via event — verify notification system)
  - **On error:** Rolls back milestone status, shows error toast, dialog remains open
- [ ] Supervisor cannot approve their own project (API/backend enforces via `allowedActions` — frontend respects)

### Reject Path

- [ ] "رفض" (Reject) button displayed as outline/secondary style
- [ ] Clicking "Reject" opens rejection reason dialog:
  - Title: "سبب الرفض" or similar
  - Textarea for required reason text
  - Validation: required, minimum 10 characters
  - Two buttons: "إلغاء" (Cancel) + "تأكيد الرفض" (Confirm reject, destructive style)
- [ ] On confirm:
  - Calls `POST /milestones/:id/reject` with `{ reason: '...', role: 'supervisor' }` (role param for backend logging)
  - **Before API call:** validates `canTransition('milestone', 'under_review', 'rejected')`
  - Milestone status **briefly shows** `rejected`, then **immediately transitions** to `in_progress` (automatic)
  - Dialog closes on success
  - Success toast: "تم رفض المرحلة، عاد المقاول للعمل" (i18n — "Milestone rejected, contractor returned to work")
  - Contractor notified via notification system
  - Previous report automatically archived/marked as rejected (backend concern — frontend shows current report only)
  - **On error:** Rolls back status, shows error toast, dialog remains open

### Status Transitions

- [ ] Both paths validated with `canTransition('milestone', currentStatus, targetStatus)` **before** API call
- [ ] If status already changed (race condition), API error caught and shown to user
- [ ] Optimistic updates always rolled back on error
- [ ] No silent failures — all errors surfaced to user via toast

### RTL & Internationalization

- [ ] All dialog content uses logical properties (no `left-*` / `right-*`)
- [ ] Dialog buttons: Cancel on start side, primary action on end side
- [ ] Image grid naturally flows in RTL (no forced direction)
- [ ] All UI text uses i18n keys
- [ ] Dialog tested in both Arabic and English modes

### Loading States

- [ ] While API request in flight:
  - Primary action button shows loading spinner
  - Primary action button disabled (no double-click)
  - All other UI elements remain enabled
- [ ] Rejection reason textarea remains editable during submit (standard UX)

---

## 🏗️ Developer Context

### Files to Create/Modify

1. **app/components/milestone/ApprovalFlow.vue** — NEW (500–600 lines)
   - Main approval dialog component
   - Props: `milestoneId`, `projectId`, `milestoneName`, `reportContent`, `reportImages[]`
   - Emits: `@approved` (on success), `@rejected` (on success), `@cancel` (user closes)
   - Two internal routes/steps: "review" (initial) → "confirm-approve" or "confirm-reject"
   - Renders report content + images at top (scrollable body)
   - Footer buttons: "رفض" (Reject outline) + "اعتماد المرحلة" (Approve primary)
   - Handles both paths, validation, loading, and error states

2. **app/components/milestone/RejectReasonDialog.vue** — NEW (200–250 lines)
   - Standalone component for rejection reason input
   - Props: `open: boolean`, `loading: boolean`
   - Emits: `@confirm(reason)`, `@cancel`
   - Textarea with validation: required, min 10 chars
   - Shows validation error if user tries to confirm with empty or short reason
   - All text uses i18n

3. **app/components/milestone/MilestoneCard.vue** — MODIFY
   - Add "Review" button to action buttons
   - Visible only when:
     - User role is `supervisor_engineer` AND
     - Milestone status is `under_review` AND
     - `usePermission().can('review_milestone')` returns true (or use 'approve_milestone' action)
   - On click: open ApprovalFlow dialog, passing milestone data + latest report
   - After dialog closes (success): refresh milestone data, close dialog

4. **app/pages/projects/[id]/milestones/[mid].vue** — MODIFY (if not done in Story 03-02)
   - Add "Review" button to milestone detail page (same visibility rules)
   - Open ApprovalFlow dialog inline
   - On success: refresh milestone and report data

5. **app/composables/useMilestones.ts** — MODIFY
   - New function: `approveMilestone(milestoneId)` with signature:
     ```ts
     async approveMilestone(
       milestoneId: string,
       role: 'supervisor' | 'client'
     ): Promise<Milestone>
     ```
   - Implementation pattern:
     1. Get current milestone status from store
     2. Call `canTransition('milestone', status, 'supervisor_approved')`
     3. Optimistically set status to `supervisor_approved` in store
     4. POST to `/milestones/:id/approve` with `{ role }`
     5. On success: return updated milestone
     6. On error: rollback status to previous, throw error
   
   - New function: `rejectMilestone(milestoneId, reason)` with signature:
     ```ts
     async rejectMilestone(
       milestoneId: string,
       reason: string,
       role: 'supervisor' | 'client'
     ): Promise<Milestone>
     ```
   - Implementation pattern:
     1. Get current status from store
     2. Call `canTransition('milestone', status, 'rejected')` (validates transition exists)
     3. Optimistically set status to `rejected`
     4. POST to `/milestones/:id/reject` with `{ reason, role }`
     5. Backend auto-transitions `rejected` → `in_progress` (frontend sees this in response)
     6. On success: return updated milestone (should have status = `in_progress`)
     7. On error: rollback to previous status, throw error
   - All requests through `useApi` wrapper
   - No notifications from composable (let component/dialog handle toasts)

6. **app/composables/useReports.ts** — MODIFY (if it exists, otherwise skip)
   - New function: `getReportByMilestoneId(milestoneId)` to fetch latest report for approval dialog
   - Called when opening ApprovalFlow dialog to get full report content + images
   - Return type: `Report` (use existing type from Story 03-03)

7. **shared/types/milestone.ts** — VERIFY/MODIFY
   - Ensure `Milestone` interface includes `allowedActions: string[]` field
   - This array controls button visibility (backend provides per-role)
   - Ensure `Report` interface includes `images: string[]` for display

8. **utils/statusMachine.ts** — VERIFY
   - Ensure transitions exist:
     - `under_review` → `supervisor_approved` ✅
     - `under_review` → `rejected` ✅
     - `rejected` → `in_progress` ✅ (auto, not user-triggered, but verify it exists)
   - Functions `canTransition()` work correctly

9. **app/composables/usePermission.ts** — VERIFY
   - Ensure `can('approve_milestone', allowedActions)` or `can('review_milestone')` maps correctly
   - Backend provides `allowedActions` array on milestone response
   - Frontend checks this array before showing buttons

10. **i18n locales** — MODIFY (ar.json + en.json)
    - Add keys for approval flow:
      - `milestones.review_dialog.title` → "مراجعة المرحلة"
      - `milestones.review_dialog.approve_button` → "اعتماد المرحلة"
      - `milestones.review_dialog.reject_button` → "رفض"
      - `milestones.approve_confirm_dialog.title` → "تأكيد الاعتماد"
      - `milestones.approve_confirm_dialog.message` → "This will notify the client for final approval"
      - `milestones.reject_reason_dialog.title` → "سبب الرفض"
      - `milestones.reject_reason_dialog.reason_placeholder` → "اشرح سبب الرفض..."
      - `milestones.reject_reason_dialog.min_chars_error` → "الحد الأدنى 10 أحرف"
      - `success.milestone_approved` → "تم اعتماد المرحلة بنجاح"
      - `success.milestone_rejected` → "تم رفض المرحلة، عاد المقاول للعمل"
      - `errors.milestone_approval_failed` → "فشل اعتماد المرحلة: {message}"
      - `errors.milestone_rejection_failed` → "فشل رفض المرحلة: {message}"

### API Integration Points

From `docs/api-contracts.md`:

**POST /milestones/:id/approve**
- Request: `{ role: 'supervisor' | 'client' }`
- Response: Updated `Milestone` with status = `supervisor_approved` or `approved` (depending on role)
- Error: 422 if invalid transition, 403 if no permission

**POST /milestones/:id/reject**
- Request: `{ reason: string, role: 'supervisor' | 'client' }`
- Response: Updated `Milestone` with status = `in_progress` (auto-transitioned from `rejected`)
- Error: 422 if invalid transition, 403 if no permission

**GET /milestones/:id/reports** (fetch latest report for display)
- Request: none (GET)
- Response: `{ data: Report }` where Report includes `images: string[]`
- Error: 404 if no report exists

⚠️ **If endpoints not in contracts**, create mocks in `app/composables/__mocks__/`:
- `approveMilestone` mock: delay 600ms, return milestone with status = `supervisor_approved`
- `rejectMilestone` mock: delay 600ms, return milestone with status = `in_progress`
- Add TODO comments for each

### Component Communication Flow

```
MilestoneCard / MilestoneDetail
  ↓ (user clicks "Review")
  ↓ (opens ApprovalFlow dialog)
ApprovalFlow
  ↓ (renders report + images)
  ↓ (user clicks Approve OR Reject)
  ↓
(if Approve)
  useMilestones.approveMilestone()
    → optimistic update + API call
    → store updates status to supervisor_approved
    → ApprovalFlow emits @approved
    → parent closes dialog + refreshes data
  
(if Reject)
  ApprovalFlow opens RejectReasonDialog
    → user enters reason + confirms
    → useMilestones.rejectMilestone(reason)
      → optimistic update + API call
      → store updates to in_progress (auto-transitioned from rejected)
      → ApprovalFlow emits @rejected
      → parent closes dialog + refreshes data
```

---

## 🧪 Testing Checklist (Before Calling Done)

### Functional Tests

- [ ] Approval dialog opens when "Review" button clicked
- [ ] Dialog shows complete report content (scrollable)
- [ ] Dialog shows all report images in 2/3-col grid
- [ ] Dialog closes when user clicks X or Cancel
- [ ] Approve button opens confirmation dialog
- [ ] Confirmation dialog has correct text (i18n keys resolved)
- [ ] Clicking "Confirm" in approval dialog:
  - Shows loading spinner on button
  - Disables button (no double-click)
  - Calls POST /milestones/:id/approve
  - On success: milestone status updates to `supervisor_approved`, dialog closes, success toast shown
  - On error: error toast shown, dialog remains open, milestone status unchanged
- [ ] Reject button opens rejection reason dialog
- [ ] Rejection reason dialog shows textarea with placeholder
- [ ] Clicking "Confirm" in rejection dialog with empty/short reason shows validation error
- [ ] Clicking "Confirm" with valid reason (10+ chars):
  - Shows loading spinner
  - Disables button
  - Calls POST /milestones/:id/reject
  - On success: milestone status updates to `in_progress`, dialog closes, success toast shown
  - On error: error toast shown, dialog remains open, milestone status unchanged

### Permission & Status Tests

- [ ] "Review" button only visible to `supervisor_engineer` role
- [ ] "Review" button only visible when milestone status is `under_review`
- [ ] "Review" button hidden if `usePermission().can('approve_milestone')` returns false
- [ ] Approve call validates `canTransition('milestone', 'under_review', 'supervisor_approved')` before API
- [ ] Reject call validates `canTransition('milestone', 'under_review', 'rejected')` before API
- [ ] If transition invalid, API call not made and user shown error

### Status Transition Tests

- [ ] Approving milestone:
  - Status optimistically updates to `supervisor_approved`
  - API success returns milestone with `supervisor_approved` status
  - On error: status rolls back to `under_review`
- [ ] Rejecting milestone:
  - Status optimistically updates to `rejected` then immediately to `in_progress` (auto-transition visible in response)
  - API success returns milestone with `in_progress` status (not `rejected`)
  - On error: status rolls back to `under_review`

### Validation Tests

- [ ] Rejection reason dialog:
  - Validates min 10 chars
  - Shows error message if < 10 chars
  - Prevents submission with error
  - Allows submission with 10+ chars
- [ ] Confirmation dialog:
  - Cannot be submitted without confirming (only in jest tests — manual confirmation in browser)

### RTL Tests (Test in Arabic language)

- [ ] Dialog renders in RTL layout
- [ ] Image grid flows naturally (no forced left-to-right)
- [ ] Buttons in footer: Cancel on left (start in RTL), Approve/Reject on right (end in RTL)
- [ ] All strings render in Arabic
- [ ] Dialog submits successfully in RTL mode

### UX & Performance

- [ ] No console errors or warnings
- [ ] Dialog renders without layout shift
- [ ] Images load and display correctly in grid
- [ ] Loading spinner smooth (no jank)
- [ ] Report content scrolls smoothly (dialog body scrollable, footer fixed)
- [ ] Dialog works on mobile (responsive grid, buttons accessible)

### Integration Tests

- [ ] After supervisor approves:
  - Milestone card/detail shows status `supervisor_approved`
  - "Review" button disappears
  - Client can now see "Approve" button (prepared for Story 03-05)
  - Client receives in-app notification (verify via notification system)
- [ ] After supervisor rejects:
  - Milestone card/detail shows status `in_progress`
  - Field engineer can submit new report again
  - Contractor receives notification with rejection reason
- [ ] Can navigate to milestone detail and see updated status
- [ ] Refresh page: status persists (backend state correct)

---

## 📖 Technical Notes

### Optimistic Update with Auto-Transition

When rejecting, the backend auto-transitions `rejected` → `in_progress` in the response.
The frontend optimistically sets to `rejected` first, then the API response updates it to `in_progress`.

```ts
async rejectMilestone(milestoneId, reason) {
  const prev = store.getById(milestoneId).status // 'under_review'
  
  store.setStatus(milestoneId, 'rejected')  // optimistic
  
  try {
    const res = await useApi(`/milestones/${milestoneId}/reject`, {
      method: 'POST',
      body: { reason, role: 'supervisor' }
    })
    // res.data.status will be 'in_progress' (auto-transitioned by backend)
    store.setStatus(milestoneId, res.data.status)  // update to in_progress
    return res.data
  } catch {
    store.setStatus(milestoneId, prev)  // rollback to under_review
    throw error
  }
}
```

### Dialog State Management

Keep ApprovalFlow internal state simple:
- `step: 'review' | 'confirm-approve' | 'confirm-reject'`
- `loading: boolean` (during API call)
- `error: string | null`

```ts
const step = ref<'review' | 'confirm-approve' | 'confirm-reject'>('review')
const loading = ref(false)
const error = ref<string | null>(null)
```

### Rejection Reason Dialog

Extract to separate component for clarity:
```vue
<RejectReasonDialog
  :open="step === 'confirm-reject'"
  :loading="loading"
  @confirm="handleReject"
  @cancel="step = 'review'"
/>
```

### Image Grid Responsive

Use responsive grid from design spec:
```html
<div class="grid grid-cols-2 md:grid-cols-3 gap-2">
  <img v-for="url in reportImages" :key="url"
       :src="url"
       class="rounded-xl overflow-hidden aspect-video object-cover"
  />
</div>
```

### Report Content Scrolling

Dialog body is scrollable, footer (buttons) stays fixed:
```vue
<Dialog>
  <DialogContent class="max-h-screen flex flex-col">
    <DialogHeader>...</DialogHeader>
    <div class="flex-1 overflow-y-auto">
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

- [ ] Supervisor can review report in dialog
- [ ] Supervisor can approve or reject milestone
- [ ] Status transitions validated with `canTransition()`
- [ ] Optimistic updates + rollback on error working
- [ ] Rejection bounces back to `in_progress` (auto-transition visible)
- [ ] All dialogs use i18n keys
- [ ] RTL layout tested and working
- [ ] No console errors
- [ ] Permission checks via `usePermission()` and `allowedActions`
- [ ] Notifications triggered (coordinate with backend)

---

## 📚 Reference & Context

### Story 03-03 Learnings

The report submission story established these patterns:
- Report API contracts (POST /milestones/:id/reports)
- Report type definition (content + images)
- Image grid rendering (grid-cols-2 md:grid-cols-3)
- Optimistic update pattern with rollback
- Permission checks via `usePermission().can()`

**Use these exact patterns in this story** for consistency.

### Previous Stories (03-01, 03-02)

- MilestoneCard and MilestoneDetail components already exist
- Status validation via `canTransition()` established
- Button visibility matrix pattern in place
- i18n infrastructure ready

### Epic 03 Overall Flow

This story is step 2 of the approval flow:
1. **03-03:** Field engineer submits report (DONE) → `under_review`
2. **03-04 (this story):** Supervisor reviews and approves/rejects → `supervisor_approved` or `in_progress`
3. **03-05:** Client gives final approval → `approved`

Rejection flow: `under_review` → reject → `rejected` → auto → `in_progress` (new report cycle)

### Design Reference

Supervisor approval flow spec: Epic 03 design reference §3 (supervisor approval flow dialog)
- Dialog with report + images
- Two action buttons: Reject (outline) + Approve (primary)
- Rejection reason step with textarea
- All styled per design spec

### API Reference

Check `docs/api-contracts.md` for:
- `POST /milestones/:id/approve` endpoint
- `POST /milestones/:id/reject` endpoint
- Request/response schemas
- Error handling

If endpoints not available, create mocks in `app/composables/__mocks__/` with TODO comments.

### Status Machine Reference

From `utils/statusMachine.ts`:
- Verify transitions: `under_review` → `supervisor_approved`, `under_review` → `rejected`, `rejected` → `in_progress`
- All three transitions must be valid

### i18n Keys Required

Core approval dialog:
- `milestones.review_dialog.title`
- `milestones.review_dialog.approve_button`
- `milestones.review_dialog.reject_button`

Confirmation dialogs:
- `milestones.approve_confirm.title`
- `milestones.approve_confirm.message`
- `milestones.reject_reason.title`
- `milestones.reject_reason.placeholder`
- `milestones.reject_reason.error_min_chars`

Success/error notifications:
- `success.milestone_approved`
- `success.milestone_rejected`
- `errors.milestone_approval_failed`
- `errors.milestone_rejection_failed`

---

## 🔗 Dependencies & Blockers

### Unblocked By
- ✅ Story 03-01 (MilestoneCard exists)
- ✅ Story 03-02 (Milestone detail page exists)
- ✅ Story 03-03 (Reports submitted, in `under_review` status)

### Blocks
- ⏳ Story 03-05 (Client final approval — depends on `supervisor_approved` status)
- ⏳ Story 03-06 (Pending reviews dashboard — depends on approval dialog component)
- ⏳ Epic 04 (Payments — depends on approved status)

### API Dependencies
- ⏳ `POST /milestones/:id/approve` endpoint
- ⏳ `POST /milestones/:id/reject` endpoint
- ⏳ Both endpoints must transition status correctly

---

## 📝 Implementation Notes for Developer

### Key Decisions

1. **Auto-transition feedback:** Rejection briefly shows `rejected`, then `in_progress` (from API response)
   - This visual feedback is important — user sees rejection confirmed, then automatic resubmission cycle begins
2. **Dialog structure:** ApprovalFlow handles multi-step (review → confirm approve OR confirm reject)
   - Keeps parent components simple
3. **Rejection reason dialog:** Separate component for clarity and reusability (same dialog used in Story 03-05)
4. **Optimistic updates:** Always update locally, then API validates — fast feedback, rollback on error
5. **Permission gate:** `allowedActions` array from backend controls all buttons — frontend respects

### Avoid Common Mistakes

- ❌ Don't show `rejected` status permanently — auto-transition to `in_progress` must be visible
- ❌ Don't hardcode status strings — use `canTransition()` and types
- ❌ Don't forget approval confirmation dialog — don't approve without user re-confirmation
- ❌ Don't forget rejection reason validation — min 10 chars required
- ❌ Don't send reject without role field — backend needs it for logging
- ❌ Don't forget i18n keys for all dialog text
- ❌ Don't check `supervisor_engineer` in template — use `usePermission().can()`
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
1. Open browser DevTools → Network tab
2. Navigate to milestone with status `under_review`
3. Click "Review" button (supervisor_engineer role only)
4. ApprovalFlow dialog opens, shows report + images
5. **Approve path:**
   - Click "اعتماد المرحلة" (Approve)
   - Confirmation dialog opens
   - Click "اعتماد" (Confirm)
   - Network shows POST /milestones/:id/approve
   - Dialog closes, milestone status → `supervisor_approved`, success toast shown
6. **Test reject path on another milestone:**
   - Click "Review" again
   - Click "رفض" (Reject)
   - Rejection reason dialog opens
   - Enter reason (10+ chars)
   - Click "تأكيد الرفض" (Confirm reject)
   - Network shows POST /milestones/:id/reject
   - Dialog closes, milestone status → `in_progress`, success toast shown
7. Reload page: status persists
8. Test RTL: switch language to Arabic, repeat both paths

---

## ✅ Implementation Checklist

- [ ] ApprovalFlow.vue created (500–600 lines, handles both approve/reject flows)
- [ ] RejectReasonDialog.vue created (200–250 lines, separate component)
- [ ] MilestoneCard.vue updated (add Review button, open dialog)
- [ ] MilestoneDetail page updated (add Review button if needed)
- [ ] useMilestones.ts updated (approveMilestone + rejectMilestone functions)
- [ ] useReports.ts created/updated (fetch report for display)
- [ ] Status machine verified (all transitions valid)
- [ ] Permissions verified (usePermission checks working)
- [ ] i18n keys added (AR + EN, 15+ keys)
- [ ] TypeScript — no errors
- [ ] RTL tested (both approve and reject paths in Arabic)
- [ ] All tests passing (unit + integration)
- [ ] No console errors/warnings
- [ ] Browser test complete (manual QA of both paths)

---

## 📖 Files Modified Summary

| File | Action | Lines | Notes |
|------|--------|-------|-------|
| ApprovalFlow.vue | NEW | 500–600 | Main approval dialog, handles both paths |
| RejectReasonDialog.vue | NEW | 200–250 | Rejection reason input |
| MilestoneCard.vue | MODIFY | +30 | Add Review button, dialog trigger |
| MilestoneDetail.vue | MODIFY | +30 | Add Review button if needed |
| useMilestones.ts | MODIFY | +80 | approveMilestone + rejectMilestone |
| useReports.ts | MODIFY | +30 | Fetch report for approval dialog |
| statusMachine.ts | VERIFY | — | Verify all transitions |
| i18n/ar.json | MODIFY | +15 | Arabic strings |
| i18n/en.json | MODIFY | +15 | English strings |
| types/milestone.ts | VERIFY | — | Ensure allowedActions field |

---

## 📝 Implementation Ready

**Story Status:** ready-for-dev  
**Created:** 2026-05-08  
**Context Engine:** BMad Ultimate Story Creation  

This story file provides comprehensive developer guardrails for implementing supervisor milestone approval. All technical requirements, API contracts, component structure, testing criteria, and common pitfalls are documented above.

**Developer:** Follow this story exactly. Every section exists to prevent common mistakes and ensure alignment with Epic 03 lifecycle and TAMM project standards.

**Next:** Run `/bmad-dev-story` with this story file to begin implementation.
