# Epic 03 — Milestones, Reports & Approval Flow

> **BMAD context:** This is the operational heart of TAMM.
> The milestone lifecycle drives everything — reports, approvals, and payments.
> Read `docs/status-flows.md §1` in full before implementing any story here.
> Every state transition must use `canTransition()`. Every action must check `usePermission().can()`.

---

## Design reference

> Full spec: `docs/design-spec.md` — read §9 (project detail), §9.1 (phase list), §9.2 (task list), §10 (reports), §5.3 (status pills).

### Milestone / phase card visual (Story 03-01)

Each milestone rendered as an expandable card inside the project detail Phases tab:

```
rounded-2xl border border-border bg-card p-4 transition
[expanded state]: border-primary/40 shadow-card
```

**Header row (always visible):**
- Phase number badge: `h-7 w-7 rounded-full bg-muted text-xs font-bold flex items-center justify-center`
- Phase name: `text-sm font-extrabold text-ink`
- Budget: `text-xs font-bold text-muted-foreground`
- Status pill: `Pill` component — tone by status:
  - `not_started` → muted
  - `in_progress` → accent
  - `under_review` → info
  - `supervisor_approved` → info (with "action required" indicator for client)
  - `approved` → primary
  - `rejected` → danger (flash state only — immediately transitions to `in_progress`)
- Progress bar: `§5.8` pattern, shown only when `in_progress` or higher
- Expand/collapse chevron: end-aligned, rotates on open

**Expanded content:**
- Task list: `§9.2` pattern
- Action buttons for the current role + status (see action matrix in Story 03-01 above)
- Payment status badge (client, contractor, admin only): `PaymentStatusTag` — see Epic 04

### Action button styles

- Primary action (Approve, Submit): primary button style `§5.5`
- Destructive action (Reject): `rounded-full border border-destructive text-destructive px-4 py-2 text-xs font-bold hover:bg-destructive hover:text-destructive-foreground`
- Secondary (View report): outline button `§5.6`

### Supervisor approval flow dialog (Story 03-04)

shadcn-vue `Dialog`, full content:
- Title: "مراجعة المرحلة — [name]"
- Report content (scrollable): full note text + image grid `grid grid-cols-2 md:grid-cols-3 gap-2`
- Each image: `rounded-xl overflow-hidden aspect-video object-cover`
- Footer buttons: "رفض" (destructive outline) + "اعتماد المرحلة" (primary)
- Reject path opens a second dialog step with reason `Textarea` (required, min 10 chars)

### Client final approval dialog (Story 03-05)

- `Dialog` with prominent warning: "هذا الإجراء نهائي ويُحرّر الدفعة للمقاول"
- Highlighted amount: `text-2xl font-extrabold text-primary`
- "تأكيد الاعتماد" primary button + "إلغاء" ghost button

### Report form (Story 03-03)

- Opens as `Dialog` (not a page navigation) from milestone card
- Type selector: `Select` (يومي / أسبوعي / نهاية مرحلة)
- Notes: `Textarea`, min-height `h-32`
- Photo upload zone: dashed border `rounded-2xl border-dashed border-border p-6 text-center`
  - Drag & drop hint text
  - File input `<input type="file" multiple accept="image/*">` (hidden, triggered by click)
  - Preview grid: `grid grid-cols-3 gap-2` — each thumbnail `rounded-xl aspect-square object-cover`
  - Remove button: `absolute top-1 end-1 h-5 w-5 rounded-full bg-card/80`
- Footer: "حفظ كمسودة" (outline) + "رفع التقرير" (primary)

### RTL notes

- Phase number badge: no directional dependency (centered)
- Progress bar: fill runs from inline-start (right in RTL)
- Dialog action buttons: "Cancel" on start side, "Confirm" on end side
- Image thumbnails: grid, no directional dependency
- Remove button on photo: `end-1 top-1` (logical) not `right-1 top-1`

---

## Epic goal

Field engineers submit reports. Supervisors review and approve or reject.
Clients give final approval. The full cycle is transparent to all parties.

---

## Stories

---

### Story 03-01 — Milestone card

**As a** user,
**I want to** see each milestone's current status and available actions,
**so that** I know what stage the work is at and what I need to do.

#### Acceptance criteria

- [ ] `MilestoneCard` renders inside project detail page
- [ ] Shows: order number, title, amount, status badge, latest report summary
- [ ] Status badge uses `StatusTag` component — never raw text
- [ ] Action buttons are role-aware AND status-aware (see matrix below)
- [ ] Payment badge shown on milestone — reflects current payment status
- [ ] Clicking card or "View details" navigates to `/projects/:id/milestones/:mid`
- [ ] RTL verified

#### Action button visibility matrix

| Button | `field_engineer` | `supervisor_engineer` | `client` | `contractor` | `admin` |
|---|---|---|---|---|---|
| Submit report | `in_progress` only | — | — | — | — |
| Review report | — | `under_review` only | — | — | — |
| Approve (supervisor) | — | `under_review` only | — | — | — |
| Reject (supervisor) | — | `under_review` only | — | — | — |
| Approve (client) | — | — | `supervisor_approved` only | — | — |
| Reject (client) | — | — | `supervisor_approved` only | — | — |
| Pay milestone | — | — | `not_started` only | — | — |

All buttons hidden unless `usePermission().can(action, milestone.allowedActions)` returns true.

---

### Story 03-02 — Milestone detail page

**As a** user,
**I want to** see the full details of a milestone,
**so that** I can review the report and take action.

#### Acceptance criteria

- [ ] Route: `/projects/:id/milestones/:mid`
- [ ] Fetches milestone + latest report
- [ ] Shows: title, status, amount, order, description
- [ ] Shows complete report (content + all images) if one exists
- [ ] Shows report history — list of all past reports (archived rejected ones)
- [ ] Shows approval timeline: who approved/rejected at each stage, with timestamps
- [ ] All action buttons from Story 03-01 available here too
- [ ] Back navigation to project detail
- [ ] Breadcrumb: Home > Projects > [Project name] > [Milestone name]

---

### Story 03-03 — Field engineer submits report

**As a** field engineer,
**I want to** submit a progress report for a milestone,
**so that** the supervisor can review the work done.

#### Acceptance criteria

- [ ] "Submit report" button visible only to `field_engineer` when milestone is `in_progress`
- [ ] Opens a full-screen dialog or navigates to report form page
- [ ] Form fields:
  - Content / notes: textarea (required, min 20 chars)
  - Images: file upload, multiple, max 10 files, max 5MB each, jpg/png/webp only
- [ ] Images show preview thumbnails after selection
- [ ] Images can be removed before submission
- [ ] "Save draft" saves without submitting — status stays `draft`
- [ ] "Submit" sends the report — changes milestone to `under_review`
- [ ] Once submitted, report is locked — no edits allowed
- [ ] Submit calls `POST /milestones/:id/reports` then `POST /reports/:id/submit`
- [ ] On success: milestone status updates optimistically to `under_review`
- [ ] Supervisor notified via in-app notification (backend concern — verify trigger)
- [ ] Form validates before submission

#### Technical notes
- File upload uses `multipart/form-data` — see `api-contracts.md`
- Images displayed in grid of thumbnails with remove button on each
- Draft auto-saved to local state (not API) to survive accidental navigation

---

### Story 03-04 — Supervisor reviews and approves milestone

**As a** supervisor engineer,
**I want to** review the field report and approve or reject the milestone,
**so that** the work can proceed to client approval or be returned for rework.

#### Acceptance criteria

- [ ] "Review" action visible only to `supervisor_engineer` when milestone is `under_review`
- [ ] Opens `ApprovalFlow` component (see `frontend-spec.md §6`)
- [ ] Shows full report: content + images
- [ ] **Approve path:**
  - Single "Approve milestone" button
  - Confirmation dialog: "This will notify the client for final approval"
  - On confirm: calls `POST /milestones/:id/approve` with `{ role: 'supervisor' }`
  - Milestone status updates to `supervisor_approved` optimistically
  - Client receives in-app notification
- [ ] **Reject path:**
  - "Reject" button opens rejection reason dialog
  - Reason field: required, min 10 chars
  - On confirm: calls `POST /milestones/:id/reject` with `{ reason: '...' }`
  - Milestone briefly shows `rejected`, then immediately `in_progress`
  - Contractor notified
  - Old report is archived, new report cycle begins
- [ ] `canTransition('milestone', status, targetStatus)` validated before both calls
- [ ] Rollback on API error for both paths
- [ ] Supervisor cannot approve their own project (admin-level guard — backend enforces, frontend respects `allowedActions`)

---

### Story 03-05 — Client gives final approval

**As a** client,
**I want to** review the supervisor-approved milestone and give my final approval,
**so that** the contractor can receive payment for completed work.

#### Acceptance criteria

- [ ] "Approve" / "Reject" actions visible only to `client` when milestone is `supervisor_approved`
- [ ] Client sees: "✓ Approved by [Supervisor name]" confirmation
- [ ] Client can view full report before deciding
- [ ] **Approve path:**
  - "Final approval" button
  - Confirmation dialog: "This will release payment to the contractor"
  - On confirm: calls `POST /milestones/:id/approve` with `{ role: 'client' }`
  - Milestone status → `approved`
  - Payment status → `ready_for_payout`
  - Contractor notified
- [ ] **Reject path:**
  - "Reject" button with required reason
  - On confirm: calls `POST /milestones/:id/reject` with `{ reason: '...' }`
  - Milestone → `rejected` → `in_progress` (automatic)
  - Contractor notified with reason
- [ ] Both paths validated with `canTransition()` before API call
- [ ] Clear visual indicator that client approval is final and triggers payment

---

### Story 03-06 — Pending reviews dashboard (supervisor)

**As a** supervisor engineer,
**I want to** see all milestones waiting for my review in one place,
**so that** I never miss a pending action.

#### Acceptance criteria

- [ ] Route: `/reviews`
- [ ] Only accessible to `supervisor_engineer` role
- [ ] Shows all milestones with status `under_review` assigned to this supervisor
- [ ] Each item shows: project name, milestone name, submission date, field engineer name
- [ ] Sorted by oldest first (longest waiting at top)
- [ ] "Review" button on each item → opens `ApprovalFlow`
- [ ] Count badge in sidebar nav reflects number of pending reviews
- [ ] Empty state when no pending reviews
- [ ] Refreshes after each action (approve/reject) without full page reload

---

### Story 03-07 — Client approval queue

**As a** client,
**I want to** see all milestones awaiting my final approval,
**so that** I can process them quickly without hunting through projects.

#### Acceptance criteria

- [ ] Dashboard widget or dedicated section showing `supervisor_approved` milestones
- [ ] Each item shows: project name, milestone name, amount, supervisor approval date
- [ ] "Approve" and "Reject" actions directly accessible from this view
- [ ] Count shown in dashboard summary card
- [ ] Navigates to milestone detail on item click

---

## Epic done when

- [ ] All 7 stories complete
- [ ] Full milestone lifecycle tested end-to-end: `not_started` → `approved`
- [ ] Rejection flow tested: supervisor reject + client reject both bounce to `in_progress`
- [ ] All role/status combinations tested for button visibility
- [ ] `canTransition()` called before every approval/rejection
- [ ] Optimistic updates + rollbacks verified
- [ ] Notifications triggered at correct points (coordinate with backend)
- [ ] RTL verified for report form, approval dialog, and all cards
- [ ] Mocks replaced as endpoints become available
