# Story 03-07 — Client Approval Queue

**Status:** ready-for-dev  
**Epic:** 03 — Milestones, Reports & Approval Flow  
**Story ID:** 3.7  
**Priority:** 🟡 MEDIUM — Improves client workflow; depends on Stories 03-01 through 03-05 being done  
**Complexity:** Medium  
**Estimated Effort:** 6–8 hours  
**Created:** 2026-05-08

---

## 📋 User Story

**As a** client,  
**I want to** see all milestones awaiting my final approval,  
**so that** I can process them quickly without hunting through projects.

---

## ✅ Acceptance Criteria

### Dashboard Widget / Section

- [ ] Client dashboard displays a dedicated "Pending Approvals" or "Action Required" widget
- [ ] Widget shows all milestones with status `supervisor_approved` assigned to the authenticated client
- [ ] **API call:** `GET /milestones?client_id={auth.id}&status=supervisor_approved`
- [ ] Each milestone item shows:
  - Project name (clickable → `/projects/:id`)
  - Milestone name (clickable → `/projects/:id/milestones/:mid`)
  - Milestone amount (formatted as currency)
  - Supervisor approval date (formatted: "May 5 at 2:30 PM")
  - Approval indicator: "✓ Approved by [Supervisor name]"
- [ ] Items sorted by approval date (oldest first — longest waiting at top)
- [ ] Count badge in widget header shows total pending approvals
- [ ] Loading state: show skeleton cards while fetching
- [ ] Empty state: display message when no pending approvals (e.g., "All caught up!")

### Action Buttons

- [ ] **"Approve"** button on each item (primary style)
  - Clicking → opens approval confirmation dialog (see §4.2)
  - After success → item removed from list
  - After error → item remains, error toast shown
- [ ] **"View Details"** button (secondary style)
  - Navigates to milestone detail page: `/projects/:id/milestones/:mid`
- [ ] Both buttons accessible via keyboard (Tab navigation)
- [ ] Touch-friendly: min 44px tap target

### Approval Confirmation Dialog

**Reuse the approval pattern from Story 03-05:**

- Dialog title: "Final Approval — [Milestone name]"
- Shows supervisor approval confirmation: "✓ Approved by [Supervisor name] on [Date]"
- Shows milestone details:
  - Project name
  - Milestone name
  - **Amount highlighted:** `text-2xl font-extrabold text-primary`
  - Description (if available)
- Warning message: "This action is final and will release payment to the contractor"
- Action buttons:
  - "Confirm Approval" (primary) — calls API to approve
  - "Cancel" (ghost) — closes dialog
- On confirm:
  - Calls `POST /milestones/:id/approve` with `{ role: 'client' }`
  - Validates with `canTransition('milestone', 'supervisor_approved', 'approved')` first
  - Milestone status updates to `approved` optimistically
  - Item removed from pending list
  - Toast shown: "Milestone approved. Payment processing..." (i18n)
- On error:
  - Toast with error message
  - Dialog closes
  - Item remains in list for retry

### RTL & Internationalization

- [ ] All text uses i18n keys (no hardcoded strings)
- [ ] Widget title, button labels, empty state — all i18n
- [ ] Dates formatted correctly in both AR and EN locales
- [ ] Currency formatted per locale (AR uses د.إ, EN uses EGP)
- [ ] Layout flows naturally in RTL:
  - Buttons on start side (left in RTL) when stacked vertically
  - Amount highlighted text is readable in both directions
  - Supervisor name/date line reads naturally
- [ ] No rotated icons or direction-dependent visuals

### Loading & Error States

- [ ] **Initial load:** Show skeleton cards while fetching milestones
  - Use `PageSkeleton` or card skeleton component
  - Minimum 3 skeleton placeholders
- [ ] **Empty state:** Display when no pending approvals
  - Icon: inbox or checkmark
  - Title: "No pending approvals" (i18n)
  - Description: "All milestones have been approved or are awaiting supervisor review." (i18n)
- [ ] **Error state:** Display on API failure
  - Error message + "Try again" button
  - Button retriggers `loadPendingApprovals()`
- [ ] **Action error:** Show toast only, item stays in list

### Performance & Caching

- [ ] Widget loads on client dashboard initial render (via `useAsyncData`)
- [ ] After approval action, list refreshes automatically
- [ ] No full-page reload needed
- [ ] Data cached briefly to avoid refetch on sidebar navigation

---

## 🏗️ Technical Requirements

### Architecture & Patterns

**Follow the exact patterns from Stories 03-04, 03-05, and 03-06:**

- **State management:** Use `useMilestones()` composable (extend with `getPendingApprovals()` method)
- **Permission checks:** Always use `usePermission().can('approve_milestone', milestone.allowedActions)` before rendering approve button
- **Status transitions:** Call `canTransition('milestone', 'supervisor_approved', 'approved')` before approval API call
- **Optimistic updates:** Remove item from list immediately, rollback on error
- **Error handling:** Show user-facing error messages via `useNotifications().error()`
- **i18n:** All UI text through `$t()` function; keys must exist in both `ar.json` and `en.json`
- **Composable method naming:** Match the pattern from `getPendingReviews()` in Story 03-06

### Components to Build / Use

| Component | Purpose | Location | Status |
|---|---|---|---|
| `ApprovalQueueWidget` | Dashboard widget container | `app/components/client/ApprovalQueueWidget.vue` | New |
| `ApprovalQueueList` | List of pending approval items | `app/components/client/ApprovalQueueList.vue` | New |
| `ApprovalQueueItem` | Single queue item row | `app/components/client/ApprovalQueueItem.vue` | New |
| `ApprovalConfirmDialog` | Confirmation dialog (reuse/adapt from 03-05) | `app/components/milestone/ApprovalConfirmDialog.vue` | Existing/Adapt |
| `EmptyState` | No approvals placeholder | `app/components/common/EmptyState.vue` | Existing |
| `PageSkeleton` | Loading skeleton | `app/components/common/PageSkeleton.vue` | Existing |
| `ErrorState` | Error message + retry | `app/components/common/ErrorState.vue` | Existing |

### File Structure

```
app/
├── pages/
│   ├── dashboard/
│   │   └── [role]/
│   │       └── index.vue                    ← Integrate ApprovalQueueWidget
├── components/
│   ├── client/                              ← New folder
│   │   ├── ApprovalQueueWidget.vue          ← New
│   │   ├── ApprovalQueueList.vue            ← New
│   │   └── ApprovalQueueItem.vue            ← New
│   ├── milestone/
│   │   └── ApprovalConfirmDialog.vue        ← Existing (reuse from 03-05)
│   └── common/
│       ├── EmptyState.vue                   ← Existing
│       ├── PageSkeleton.vue                 ← Existing
│       └── ErrorState.vue                   ← Existing
├── composables/
│   ├── useMilestones.ts                     ← Extend with getPendingApprovals() method
│   ├── usePermission.ts                     ← Existing (use for action checks)
│   └── useNotifications.ts                  ← Existing (use for error toasts)
└── shared/types/
    └── project.ts                           ← Existing (use Milestone type)
```

### Composable Methods Required

**Extend `useMilestones.ts` with:**

```ts
// Get all milestones pending client approval
const getPendingApprovals = async (): Promise<Milestone[]> => {
  // API: GET /milestones?client_id={auth.id}&status=supervisor_approved
  // Returns: { data: Milestone[], message?: string }
  // Error: { message: string, errors?: Record<string, string[]> }
  // Sorted by approval_date (oldest first)
}

// Called after approve to refresh the list
const refreshPendingApprovals = async (): Promise<void> => {
  // Simple re-fetch without page reload
}

// Get count of pending approvals (used in dashboard badge/widget)
const pendingApprovalsCount = computed(() => {
  // Count milestones with status 'supervisor_approved' for current client
})
```

### API Contract

**Fetch pending approvals:**
```
GET /milestones?client_id={clientId}&status=supervisor_approved

Response (200 OK):
{
  "data": [
    {
      "id": "ms-2",
      "name": "Walls & Finishing",
      "project_id": "proj-001",
      "project": { "id": "proj-001", "name": "Downtown Office Tower" },
      "status": "supervisor_approved",
      "order": 2,
      "amount": 75000,
      "created_at": "2026-05-01T09:00:00Z",
      "description": "Walls, finishing, internal work",
      "supervisor_approved_at": "2026-05-06T10:15:00Z",
      "supervisor_id": "sup-001",
      "supervisor": { "id": "sup-001", "name": "Fatima Al-Mansouri" },
      "allowedActions": ["approve_milestone", "reject_milestone"]
    }
  ],
  "message": "Pending approvals loaded"
}

Error (400/500):
{
  "message": "Failed to load pending approvals",
  "errors": { ... }
}
```

Check `docs/api-contracts.md` for latest endpoint status.

### TypeScript Types

Ensure `Milestone` type in `shared/types/project.ts` includes:

```ts
interface Milestone {
  id: string
  name: string
  project_id: string
  project?: { id: string; name: string }
  status: MilestoneStatus
  order: number
  amount: number
  description?: string
  created_at: string
  supervisor_approved_at?: string
  supervisor_id?: string
  supervisor?: { id: string; name: string }
  allowedActions: string[]
  // ... other fields from API contract
}

type MilestoneStatus =
  | 'not_started'
  | 'in_progress'
  | 'under_review'
  | 'supervisor_approved'
  | 'approved'
  | 'rejected'
```

---

## 🎨 UI/UX Specification

### Widget Layout

```
┌───────────────────────────────────────────┐
│ Pending Approvals                 [3]     │
├───────────────────────────────────────────┤
│ • Downtown Office Tower / Walls & ...     │
│   EGP 75,000 · ✓ Approved 2 days ago     │
│                    [View Details] [Approve] │
│                                             │
│ • Azure Plaza Tower / Electrical ...       │
│   EGP 50,000 · ✓ Approved 5 hours ago    │
│                    [View Details] [Approve] │
│                                             │
│ • ...                                       │
└───────────────────────────────────────────┘
```

### Item Visual Specification

```vue
<!-- ApprovalQueueItem -->
<div class="flex items-start justify-between gap-4 rounded-lg border border-border bg-card p-4">
  <!-- Left side: project + milestone info -->
  <div class="flex-1 min-w-0">
    <p class="text-xs font-bold text-muted-foreground">{{ project.name }}</p>
    <p class="text-sm font-bold text-ink">{{ milestone.name }}</p>
    <p class="text-xs text-muted-foreground mt-1">{{ supervisorApprovalInfo }}</p>
  </div>

  <!-- Right side: amount + buttons -->
  <div class="flex flex-col items-end gap-2 shrink-0">
    <p class="text-lg font-extrabold text-primary">{{ formatCurrency(milestone.amount) }}</p>
    <div class="flex gap-2">
      <Button variant="outline" @click="viewDetails">{{ $t('actions.view_details') }}</Button>
      <Button :loading="approving" @click="approveClick">{{ $t('actions.approve') }}</Button>
    </div>
  </div>
</div>
```

### Approval Dialog

Reuse the `ApprovalConfirmDialog` from Story 03-05 with:
- Title: `$t('dialogs.final_approval', { milestone: milestone.name })`
- Shows supervisor approval info
- Shows amount prominently
- Warning: `$t('dialogs.approval_final_warning')`

### RTL Considerations

- Widget header: badge on start side (right in RTL)
- Item layout: amounts and buttons align to end (left in RTL)
- Dialog buttons: "Cancel" on start, "Confirm" on end
- No hard-coded left/right — use Tailwind logical properties: `ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`

### Empty State

```vue
<EmptyState
  icon="inbox" (or "checkmark")
  :title="$t('empty.no_approvals')"
  :description="$t('empty.no_approvals_desc')"
/>
```

### Loading State

```vue
<!-- 3 skeleton cards while fetching -->
<div v-for="i in 3" :key="i" class="rounded-lg border border-border bg-card p-4">
  <Skeleton class="h-4 w-1/3 mb-2" />
  <Skeleton class="h-5 w-1/2 mb-1" />
  <Skeleton class="h-3 w-2/3 mt-2" />
</div>
```

---

## 🧠 Developer Context & Guardrails

### Critical Rules

1. **Status machine first:** Always call `canTransition('milestone', 'supervisor_approved', 'approved')` before API call
2. **Optimistic updates:** Remove item from list on click, rollback only on API error
3. **Permission gate:** Check `usePermission().can('approve_milestone', milestone.allowedActions)` before rendering button
4. **i18n first:** No hardcoded strings — every label must use `$t()` with key in both `ar.json` and `en.json`
5. **RTL safe:** Use logical CSS properties everywhere — never `ml-`, `pl-`, `left-`, `right-`
6. **Mock → API:** If endpoint not available, create mock in `useMilestones.ts` with `// TODO: replace mock` comment

### Learning from Previous Stories

Story 03-06 (Pending Reviews Dashboard for Supervisors) is the closest parallel:
- Same data-loading pattern: `getPendingReviews()` composable method
- Same list refresh pattern: remove item optimistically, rollback on error
- Same count badge pattern: sidebar nav shows pending count
- Same dialog pattern: reuses `ApprovalFlow` component

**Key differences for 03-07:**
- Client role instead of supervisor
- Status filter: `supervisor_approved` instead of `under_review`
- Amount field prominence (client care more about payment than supervisors)
- Approval is final (triggers payment) vs supervisor approval (passes to client)

### Code Patterns to Reuse

From Story 03-06 `PendingReviewsList.vue`:
```ts
// Data loading
const { data: pendingReviews, pending: loading, error } = await useFetch(...)

// Optimistic update
const approveItem = async (milestone) => {
  const prev = pendingReviews.value
  pendingReviews.value = pendingReviews.value.filter(m => m.id !== milestone.id)
  try {
    await approveMilestone(milestone.id)
  } catch (err) {
    pendingReviews.value = prev
    notify.error($t('errors.approval_failed'))
  }
}
```

### Gotchas & Anti-patterns

❌ **DON'T:**
- Call API directly from component — always via composable
- Hardcode status strings — use `statusMachine.ts`
- Check role directly — use `usePermission().can()`
- Skip `canTransition()` — always validate before API
- Use `left-*` / `right-*` / `ml-*` / `mr-*` — breaks RTL
- Hardcode UI text — must be i18n
- Store derived data (pending count) — use computed getter

✅ **DO:**
- Load through composable: `useMilestones().getPendingApprovals()`
- Call `canTransition()` before state change
- Use `usePermission().can()` for visibility
- Remove item optimistically, rollback on error
- Use logical CSS (`ms-*`, `me-*`, `ps-*`, `pe-*`)
- All text through `$t()` function
- Compute counts with `computed()`

---

## 🔄 Implementation Workflow

### Step 1: Extend `useMilestones.ts`

Add three methods:
1. `getPendingApprovals()` — fetch milestones with status `supervisor_approved` for current client
2. `refreshPendingApprovals()` — re-fetch the list after approval
3. `pendingApprovalsCount` computed getter — count pending milestones

Mock API with `// TODO: replace mock — GET /milestones?client_id=... endpoint` until endpoint is available.

### Step 2: Create Components

1. **ApprovalQueueWidget.vue** — dashboard widget container
   - Calls `getPendingApprovals()` on mount
   - Shows loading/error/empty/data states
   - Passes list to `ApprovalQueueList`

2. **ApprovalQueueList.vue** — list container
   - Maps over pending approvals
   - Each item → `ApprovalQueueItem`
   - Handles list refresh after action

3. **ApprovalQueueItem.vue** — single item
   - Shows project name, milestone name, amount, approval info
   - "View Details" button → navigate to milestone
   - "Approve" button → open dialog

### Step 3: Integrate into Dashboard

Find the client dashboard page (likely `app/pages/dashboard/client/index.vue` or role-based equivalent).
- Import `ApprovalQueueWidget`
- Place it prominently in the dashboard layout (likely top-right or main content area)
- Ensure it loads data on component mount

### Step 4: Add i18n Keys

Update `i18n/ar.json` and `i18n/en.json`:
```json
{
  "pages.approvals": "معالجة الاعتمادات / Pending Approvals",
  "widgets.approval_queue": "قائمة الاعتمادات / Approval Queue",
  "empty.no_approvals": "لا توجد موافقات معلقة / No pending approvals",
  "empty.no_approvals_desc": "تم معالجة جميع المراحل / All milestones approved or pending review",
  "dialogs.final_approval": "الموافقة النهائية / Final Approval",
  "dialogs.approval_final_warning": "سيؤدي هذا الإجراء إلى إطلاق الدفعة / This will release payment to contractor",
  "actions.view_details": "عرض التفاصيل / View Details",
  "actions.approve": "الموافقة / Approve"
}
```

### Step 5: Testing

- [ ] Test approve flow: dialog opens → confirm → item removed → list refreshes
- [ ] Test error handling: API fails → error toast → item stays in list
- [ ] Test empty state: no pending approvals → empty message shown
- [ ] Test role guard: non-client cannot access widget
- [ ] Test RTL: approve button on start side, amount readable
- [ ] Test permissions: "Approve" button only shows if `can('approve_milestone')`
- [ ] Test loading state: skeleton cards shown while fetching

---

## 🎯 Definition of Done

- [ ] All i18n keys added to both `ar.json` and `en.json`
- [ ] `getPendingApprovals()` method added to `useMilestones.ts`
- [ ] `ApprovalQueueWidget`, `ApprovalQueueList`, `ApprovalQueueItem` components created
- [ ] Widget integrated into client dashboard
- [ ] `canTransition()` called before approval API
- [ ] `usePermission().can()` checks before rendering actions
- [ ] Optimistic update + rollback verified
- [ ] RTL layout tested (buttons, amounts, dates all readable in both directions)
- [ ] Loading/error/empty states all functional
- [ ] No console errors or TypeScript errors
- [ ] Approval dialog shows supervisor confirmation
- [ ] Amount displayed prominently
- [ ] Mock with `// TODO` comment if API not available
- [ ] All logical CSS properties used (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`)

---

## 📚 Reference Documentation

| Resource | Purpose | Location |
|----------|---------|----------|
| Epic 03 specs | Business requirements | `_bmad-output/planning-artifacts/epic-03-milestones.md` |
| Design spec | UI component patterns | `docs/design-spec.md §5` (status pills), §9 (milestones) |
| Status flows | Valid state transitions | `docs/status-flows.md §1` |
| API contracts | Endpoint definitions | `docs/api-contracts.md` |
| Story 03-06 | Supervisor dashboard pattern | `_bmad-output/implementation-artifacts/03-06-*.md` |
| Story 03-05 | Approval dialog pattern | `_bmad-output/implementation-artifacts/03-05-*.md` |

---

## 🔗 Dependencies

**Blocking stories (must be done first):**
- ✅ 03-01 (Milestone card)
- ✅ 03-02 (Milestone detail page)
- ✅ 03-03 (Field engineer submits report)
- ✅ 03-04 (Supervisor reviews & approves)
- ✅ 03-05 (Client gives final approval)
- ✅ 03-06 (Pending reviews dashboard)

**This story enables:**
- Epic 04 (Payments & Escrow) — client approval queue feeds payment processing

---

*Stack: Nuxt 4.x · Vue 3.5.x · Tailwind CSS 4.x · shadcn-vue · Pinia 3.x*  
*Pattern source: Story 03-06 (supervisor approval queue) — adapted for client role*  
*Created: 2026-05-08*
