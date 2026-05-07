# Epic 07 — Proposals & Contractor Selection

> **BMAD context:** This epic covers the entire bidding phase between project creation and execution.
> Bidding is invite-only — admin selects which contractors can bid.
> Proposals contain price + timeline only (no milestone breakdown).
> Only client + admin can see proposals — contractors cannot see competing bids.
> Read `docs/status-flows.md §2` and `CLAUDE.md §6` before implementing.

---

## Design reference

> Full spec: `docs/design-spec.md` — read §9 (project detail), §5.5–5.6 (button styles), §5.3 (Pill).

### Contractor project list — open bids (Story 07-02)

In the contractor's "مشاريعي" section, projects with `open_for_bids` status appear with:
- Status pill: `Pill` accent tone — "مفتوح للعروض"
- Prominent "تقديم عرض" CTA button on the project card
- After submission: pill changes to "تم تقديم العرض" (primary tone), button removed

### Proposal submission dialog (Story 07-02)

shadcn-vue `Dialog`:
- Title: "تقديم عرض لـ [project name]"
- Fields (VeeValidate + Zod):
  - السعر الإجمالي: `MoneyInput` (required, positive, formatted with `formatCurrency()`)
  - المدة التقديرية بالأيام: `Input` type=number (required, positive integer)
  - الملاحظات: `Textarea` max 500 chars (optional)
- Character counter below notes: `text-[10px] text-muted-foreground text-end`
- Submit: "تقديم العرض" primary button
- After submission: dialog closes, card shows read-only proposal summary

### Proposal cards (client view — Story 07-04)

Inside project detail, "العروض" tab (visible to client and admin when status ≥ `under_review`):

Each proposal card (`SectionCard` variant):
```
rounded-2xl border border-border bg-card p-5 shadow-card
```
- Contractor name: `text-base font-extrabold text-ink`
- Price: `text-2xl font-extrabold text-primary`
- Timeline: `text-sm text-muted-foreground` — "{N} يوم"
- Notes: `text-sm text-foreground/80 mt-2` (collapsible if long)
- Submitted date: `text-[11px] text-muted-foreground`
- "اختيار هذا المقاول" button: primary button style — only shown when status is `under_review`
- After another contractor is selected: card dims (`opacity-60`) + "لم يتم الاختيار" muted pill

### Contractor selection confirmation (Story 07-05)

shadcn-vue `AlertDialog` (not regular Dialog — has stronger destructive pattern):
- Body: contractor name + price + timeline as a summary block
- Warning: "ستُرفض جميع العروض الأخرى تلقائياً"
- Confirm: "تأكيد الاختيار" primary button
- Cancel: outline button

### Engineer assignment dialog (Story 07-06)

shadcn-vue `Dialog`:
- Two `Select` components: "المهندس المشرف" + "المهندس الميداني"
- Each shows pool of available engineers (loaded from API)
- Currently assigned shown as selected default
- Submit: "حفظ التعيين" primary button

### RTL notes

- Proposal cards: all text `text-start`, price `text-start`
- Character counter in notes: `text-end` (logical)
- AlertDialog buttons: cancel start side, confirm end side

---

## Epic goal

Admin opens a project for bidding and invites specific contractors.
Contractors submit proposals.
Client reviews proposals and selects a contractor.
Project transitions to contractor_selected and setup begins.

---

## Project status progression in this epic

```
new → open_for_bids → under_review → contractor_selected
```

---

## Stories

---

### Story 07-01 — Admin opens bidding and invites contractors

**As an** admin,
**I want to** open a project for bidding and invite specific contractors,
**so that** only vetted contractors can submit proposals.

#### Acceptance criteria

- [ ] "Open for bids" button visible to `admin` / `super_admin` only when project is `new`
- [ ] Clicking opens "Open for Bids" dialog with:
  - Contractor multi-select: fetches `GET /admin/users?role=contractor`, shows name list
  - At least one contractor must be selected to proceed
- [ ] On confirm:
  - Calls `POST /projects/:id/invitations` with selected contractor IDs
  - Calls `PATCH /projects/:id/status` with `{ status: 'open_for_bids' }`
  - Project status badge updates to "Open for Bids"
  - Each invited contractor receives in-app notification
- [ ] Optimistic update on project status
- [ ] Rollback on API error
- [ ] Admin can add more contractors later while status is still `open_for_bids` (re-open dialog)
- [ ] `canTransition('project', 'new', 'open_for_bids')` validated before API call

---

### Story 07-02 — Contractor submits proposal

**As an** invited contractor,
**I want to** submit a proposal for a project I've been invited to bid on,
**so that** the client can consider my offer.

#### Acceptance criteria

- [ ] Invited contractor sees the project in their project list with status "Open for Bids"
- [ ] Project detail page shows "Submit proposal" button to invited contractor only
- [ ] Button only visible when:
  - Project status is `open_for_bids`
  - Contractor is in the invited list
  - Contractor has not yet submitted a proposal for this project
- [ ] Clicking opens proposal form dialog with fields:
  - Total price (required, positive number)
  - Estimated timeline in days (required, positive integer)
  - Notes / description (optional, max 500 chars)
- [ ] Form validates with Zod before submit
- [ ] On submit: calls `POST /projects/:id/proposals`
- [ ] On success: button replaced by "Proposal submitted" badge — no editing after submission
- [ ] On error: inline error, form stays open
- [ ] Contractor sees their own submitted proposal (price, timeline, notes) in read-only view
- [ ] Contractor cannot see other contractors' proposals
- [ ] Amount formatted with `formatCurrency()`
- [ ] RTL verified

---

### Story 07-03 — Admin closes bidding for review

**As an** admin,
**I want to** close the bidding phase and move the project to client review,
**so that** the client can start comparing proposals.

#### Acceptance criteria

- [ ] "Close bidding" button visible to `admin` / `super_admin` only when project is `open_for_bids`
- [ ] Button disabled if zero proposals have been submitted
- [ ] Clicking shows confirmation dialog: "Close bidding? [n] proposals received. The client will be notified to review."
- [ ] On confirm:
  - Calls `PATCH /projects/:id/status` with `{ status: 'under_review' }`
  - Project status badge updates to "Under Review"
  - Client receives in-app notification: "Proposals are ready for your review"
- [ ] Admin can also see the invitation list and how many contractors have responded
- [ ] `canTransition('project', 'open_for_bids', 'under_review')` validated before API call
- [ ] Optimistic update + rollback on error

---

### Story 07-04 — Client reviews proposals

**As a** client,
**I want to** compare all submitted proposals for my project,
**so that** I can make an informed decision about which contractor to hire.

#### Acceptance criteria

- [ ] Proposals section visible in project detail to `client` (project owner) and `admin` only
- [ ] Section only shown when project status is `under_review` or `contractor_selected`
- [ ] Each proposal card shows:
  - Contractor name
  - Total price (formatted with `formatCurrency()`)
  - Estimated timeline (e.g. "90 days")
  - Notes (if provided)
  - Submission date (formatted with `formatDate()`)
  - "Select this contractor" button (client only, only when status is `under_review`)
- [ ] Proposals are sorted by submission date (oldest first)
- [ ] Client can view all proposals before deciding — no limit
- [ ] "Select this contractor" button is prominent on each card
- [ ] RTL verified

---

### Story 07-05 — Client selects a contractor

**As a** client,
**I want to** select the contractor whose proposal I accept,
**so that** the project can move forward to execution.

#### Acceptance criteria

- [ ] "Select this contractor" button visible on each proposal card only to the project owner (`client`) when project status is `under_review`
- [ ] Clicking shows confirmation dialog:
  ```
  ┌──────────────────────────────────────────────┐
  │  Select contractor                           │
  │                                              │
  │  Contractor: Mohammed Al-Rashid              │
  │  Price: SAR 250,000                          │
  │  Timeline: 90 days                           │
  │                                              │
  │  All other proposals will be declined.       │
  │                                              │
  │  [Cancel]           [Confirm selection →]    │
  └──────────────────────────────────────────────┘
  ```
- [ ] On confirm: calls `POST /projects/:id/proposals/:proposalId/select`
- [ ] On success:
  - Project status updates to `contractor_selected`
  - Selected proposal card shows "Selected" badge
  - Other proposal cards show "Not selected" badge
  - Selected contractor receives in-app notification
  - Admin receives in-app notification
- [ ] `canTransition('project', 'under_review', 'contractor_selected')` validated before API call
- [ ] Optimistic update + rollback on error
- [ ] After selection: "Select this contractor" buttons removed from all cards
- [ ] RTL verified

---

### Story 07-06 — Admin assigns engineers after contractor selection

**As an** admin,
**I want to** assign a supervisor engineer and field engineer to the project after a contractor is selected,
**so that** the right team is in place before work begins.

#### Acceptance criteria

- [ ] "Assign engineers" button visible to `admin` / `super_admin` in project detail when status is `contractor_selected`
- [ ] Opens dialog with two selects:
  - Supervisor Engineer (required) — fetches `GET /admin/users?role=supervisor_engineer`
  - Field Engineer (required) — fetches `GET /admin/users?role=field_engineer`
- [ ] Currently assigned engineers (if any) shown as default selection
- [ ] On save: calls assignment endpoint (add to `api-contracts.md` when available from Laravel team)
- [ ] On success: project detail updates with new engineer names
- [ ] Engineers section updates immediately — no full page reload
- [ ] Engineers can be reassigned — previous assignment is replaced
- [ ] Assignment is a prerequisite for admin to activate the project (Story 02-05)

---

## Epic done when

- [ ] All 6 stories complete
- [ ] Full bidding lifecycle tested: `new` → `open_for_bids` → `under_review` → `contractor_selected`
- [ ] Contractor cannot see competing proposals — verified
- [ ] Contractor sees only their own proposal after submission
- [ ] Client sees all proposals, can select one
- [ ] All other proposals marked "Not selected" after client selects
- [ ] Notifications fired at: invitation, bidding closed, contractor selected, project activated
- [ ] `canTransition()` called before every project status change
- [ ] Optimistic updates + rollbacks verified
- [ ] RTL verified for proposal cards, dialogs, and forms
- [ ] Mocks replaced as proposal endpoints become available from Laravel team
