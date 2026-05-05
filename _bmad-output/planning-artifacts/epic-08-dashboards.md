# Epic 08 — Role-Based Dashboards

> **BMAD context:** Every role has a dedicated dashboard that answers one question:
> "What do I need to act on right now?"
> Dashboards aggregate data from Epics 02–05 and 07.
> Build this epic last — after all data sources exist.
> Read `CLAUDE.md §6`, `docs/status-flows.md`, and `docs/frontend-spec.md` before implementing.

---

## Epic goal

Every user lands on a dashboard tailored to their role.
The dashboard surfaces the most urgent actions first.
No role should have to hunt through the app to find what needs their attention.

---

## Shared design rules

- Route: `/dashboard` for all roles (layout switches by role)
- Uses `default` layout (authenticated shell with sidebar + topbar)
- All dashboard data fetched via a single summary endpoint per role (preferred) or composed from existing endpoints
- Skeleton cards while loading — never blank
- All amounts formatted with `formatCurrency()`
- All dates formatted with `formatDate()`
- All strings via i18n keys — no hardcoded text
- RTL verified for every dashboard

---

## Stories

---

### Story 08-01 — Client dashboard

**As a** client,
**I want to** see a summary of my projects and what needs my action,
**so that** I can prioritize my work without navigating through every project.

#### Route
`/dashboard` (client role)

#### Acceptance criteria

- [ ] **Milestones awaiting my approval** section (highest priority):
  - Lists all milestones with status `supervisor_approved` across all client's projects
  - Each item shows: project name, milestone name, amount, supervisor approval date
  - "Approve" and "Reject" action buttons directly accessible
  - Empty state: "No milestones awaiting your approval"
  - Badge count shown in section header
- [ ] **My projects summary** section:
  - Summary cards: Total projects, Active projects, Completed projects
  - Each card links to filtered `/projects` list
- [ ] **Recent activity** section:
  - Last 5 project/milestone events relevant to client
  - Each item: event description, project name, timestamp
- [ ] Skeleton cards while loading
- [ ] RTL verified

---

### Story 08-02 — Contractor dashboard

**As a** contractor,
**I want to** see my active work and pending payments at a glance,
**so that** I know what I'm working on and what money is incoming.

#### Route
`/dashboard` (contractor role)

#### Acceptance criteria

- [ ] **Active milestones** section (highest priority):
  - Lists milestones currently `in_progress` across all contractor's projects
  - Each item shows: project name, milestone name, status, field engineer name
  - Links to milestone detail
  - Empty state when none
- [ ] **Milestones under review** section:
  - Lists milestones with status `under_review` or `supervisor_approved`
  - Shows who is reviewing (supervisor / client)
  - Read-only — contractor has no actions here
- [ ] **Payment status** section:
  - Pending total: sum of milestones in `awaiting_approval` + `ready_for_payout`
  - Recently received: sum of `paid_out` milestones in last 30 days
  - "View all payments" link → `/payments`
- [ ] **Open bids** section:
  - Projects the contractor has been invited to bid on (status `open_for_bids`)
  - "Submit proposal" CTA for projects not yet bid on
  - "View proposal" for already submitted proposals
- [ ] Skeleton cards while loading
- [ ] RTL verified

---

### Story 08-03 — Field Engineer dashboard + assignments page

**As a** field engineer,
**I want to** see my assignments and what reports I need to submit,
**so that** I never miss a deadline.

#### Dashboard route
`/dashboard` (field_engineer role)

#### Assignments route
`/assignments`

> Note: After login, field engineers are redirected to `/assignments` (Story 01-03).
> The dashboard at `/dashboard` provides broader context.

#### Dashboard acceptance criteria

- [ ] **My assignments** section (highest priority):
  - Lists all milestones assigned to this engineer with status `in_progress`
  - Each item shows: project name, milestone name, project address (if available), status badge
  - Primary CTA: "Submit report" button per item
  - Empty state: "No active assignments"
- [ ] **Recently submitted** section:
  - Last 5 reports submitted by this engineer
  - Each item shows: milestone name, project name, submission date, current milestone status
- [ ] Skeleton cards while loading
- [ ] RTL verified

#### Assignments page (`/assignments`) acceptance criteria

- [ ] Route: `/assignments` — accessible to `field_engineer` only
- [ ] Full list of all milestones assigned to this engineer
- [ ] Filter tabs: All / Active (in_progress) / Under Review / Completed
- [ ] Each assignment card shows:
  - Project name + address
  - Milestone name + order number
  - Status badge
  - "Submit report" button (only when `in_progress`)
  - "View report" button (when report submitted)
- [ ] Sorted by: active first, then under review, then completed
- [ ] Empty state per filter tab
- [ ] RTL verified

---

### Story 08-04 — Supervisor Engineer dashboard

**As a** supervisor engineer,
**I want to** see pending reviews and recent activity,
**so that** I can prioritize my review work and track what I've done.

#### Route
`/dashboard` (supervisor_engineer role)

#### Acceptance criteria

- [ ] **Pending reviews** section (highest priority):
  - Lists all milestones with status `under_review` assigned to this supervisor
  - Each item shows: project name, milestone name, field engineer name, submission date
  - Sorted by oldest submission first (longest waiting at top)
  - "Review" CTA per item → opens `ApprovalFlow` component
  - Badge count shown in section header (mirrors sidebar nav badge)
  - Empty state: "No pending reviews"
- [ ] **Recently reviewed** section:
  - Last 5 milestones this supervisor has approved or rejected
  - Each item shows: milestone name, project name, decision (approved / rejected), date
- [ ] **Optional: Assigned projects overview**:
  - Count of active projects this supervisor is assigned to
  - Link to project list filtered to supervisor's projects
- [ ] Skeleton cards while loading
- [ ] RTL verified

> Note: The dedicated `/reviews` page (Story 03-06) is the full execution view.
> The dashboard is the overview and entry point to `/reviews`.

---

### Story 08-05 — Admin dashboard

**As an** admin,
**I want to** see a high-level overview of platform activity,
**so that** I can quickly identify what needs attention across all projects and users.

#### Route
`/admin/dashboard` (admin and super_admin roles)

> Note: This story supersedes Story 06-05 — keep the same route and merge requirements here.

#### Acceptance criteria

- [ ] **Summary cards** row (top of page):
  - Total active projects → links to `/admin/projects?status=active`
  - Milestones pending review → links to `/admin/projects` filtered to under_review
  - Payments ready for release → links to payment release queue
  - Projects awaiting contractor selection → links to `/admin/projects?status=under_review`
  - New users this month → links to `/admin/users`
- [ ] **Action queues** section:
  - Projects in `new` status needing to be opened for bids
  - Projects in `contractor_selected` needing engineer assignment or activation
  - Milestones `approved` with payment `ready_for_payout` needing release
  - Each item has a direct action button — no extra navigation needed
- [ ] **Recent activity feed**:
  - Last 10 platform events (project created, milestone approved, payment released, contractor selected, etc.)
  - Each event: icon, description, project/user name, timestamp
- [ ] **Super Admin only**: additional card showing pending admin-level permissions or system flags (if applicable — coordinate with backend)
- [ ] Skeleton cards while loading
- [ ] RTL verified

---

## Epic done when

- [ ] All 5 stories complete
- [ ] Each dashboard tested for its specific role — other roles cannot access it
- [ ] Client approval queue works: milestone approved by supervisor shows up immediately
- [ ] Field engineer `/assignments` route works and filters correctly
- [ ] Supervisor pending reviews count matches sidebar badge
- [ ] Admin action queues surface the right items per project/payment state
- [ ] Super Admin sees admin dashboard (Story 08-05) with no additional changes needed
- [ ] RTL verified for all 5 dashboards
- [ ] Mocks replaced as dashboard summary endpoints become available from Laravel team
