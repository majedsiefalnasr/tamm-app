# Epic 06 — Admin Panel & User Management

> **BMAD context:** No self-registration in TAMM. Admin creates all users.
> Engineers belong to the platform, not to contractors — ensures neutrality.
> Read `CLAUDE.md §6` and `docs/status-flows.md` before implementing.

---

## Epic goal

Admins can manage all users, assign engineers to projects,
and have full visibility over the entire platform.

---

## Stories

---

### Story 06-01 — Admin user list

**As an** admin,
**I want to** see all users in the system with their roles and status,
**so that** I can manage who has access.

#### Acceptance criteria

- [ ] Route: `/admin/users` — accessible to `admin` and `super_admin` only
- [ ] Uses `admin` layout
- [ ] Table columns: Name, Email, Role, Status (active/inactive), Created date, Actions
- [ ] Filter tabs: All, Contractors, Engineers, Clients, Admins
- [ ] Role badge uses i18n role label
- [ ] "Add user" button opens dialog (Story 06-02)
- [ ] Each row has "Actions" dropdown: Edit, Deactivate/Activate
- [ ] Skeleton table (5 rows) while loading
- [ ] Empty state per filtered role
- [ ] Table is responsive: horizontal scroll on mobile
- [ ] RTL verified

---

### Story 06-02 — Create user (admin)

**As an** admin,
**I want to** create new user accounts,
**so that** contractors, engineers, and clients can access the system.

#### Acceptance criteria

- [ ] "Add user" opens dialog with fields:
  - Full name (required)
  - Email (required, unique — API returns 422 if duplicate)
  - Role (required — select: Client, Contractor, Field Engineer, Supervisor Engineer)
  - Phone (optional)
- [ ] On submit: calls `POST /admin/users`
- [ ] On success: new user appears in table, success toast "User created. Credentials sent via email."
- [ ] On 422: field errors shown inline (especially email already exists)
- [ ] Admin cannot create another Admin/Super Admin from this form (role select excludes admin roles)
- [ ] `super_admin` can create admin accounts (separate route or elevated permission)
- [ ] Password is auto-generated and emailed by the backend — not set in this form

---

### Story 06-03 — Assign engineers to project

**As an** admin,
**I want to** assign a supervisor engineer and field engineer to a project,
**so that** the right engineers oversee the work.

#### Acceptance criteria

- [ ] "Assign engineers" button visible only to `admin` / `super_admin` in project detail
- [ ] Opens dialog with two selects:
  - Supervisor Engineer (required) — fetches `GET /admin/users?role=supervisor_engineer`
  - Field Engineer (required) — fetches `GET /admin/users?role=field_engineer`
- [ ] Currently assigned engineers shown as default selection
- [ ] On save: calls assignment endpoint (coordinate with Laravel team — add to `api-contracts.md` when available)
- [ ] On success: project detail updates with new engineer names
- [ ] Engineers can be reassigned — previous assignment is replaced

---

### Story 06-04 — Admin project overview

**As an** admin,
**I want to** see all projects across the platform with key metrics,
**so that** I can monitor overall progress and intervene when needed.

#### Acceptance criteria

- [ ] Route: `/admin/projects`
- [ ] Shows all projects (not filtered by ownership)
- [ ] Filter by status: All / New / Active / On Hold / Completed
- [ ] Search by project name or client name
- [ ] Table columns: Project, Client, Contractor, Status, Milestones progress, Total value, Created date
- [ ] Quick actions per row: View project, Change status
- [ ] Summary cards at top: total projects, active, on hold, completed
- [ ] Skeleton and empty states
- [ ] RTL verified

---

### Story 06-05 — Admin dashboard

**As an** admin,
**I want to** see a high-level overview of platform activity,
**so that** I can quickly identify what needs attention.

#### Acceptance criteria

- [ ] Route: `/admin/dashboard`
- [ ] Summary cards:
  - Total active projects
  - Milestones pending review (links to list)
  - Payments ready for release (links to list)
  - New users this month
- [ ] Recent activity feed: last 10 events (project created, milestone approved, payment released, etc.)
- [ ] Each card is a link to the relevant section
- [ ] Data fetched efficiently — one dashboard summary endpoint preferred
- [ ] Skeleton cards while loading
- [ ] RTL verified

---

## Epic done when

- [ ] All 5 stories complete
- [ ] Admin flows tested end-to-end: create user → assign to project → monitor milestones
- [ ] Role restriction verified: non-admin users cannot access `/admin/*` routes
- [ ] RTL verified for all admin screens
- [ ] Table responsive behavior verified on mobile
- [ ] Mocks replaced as admin endpoints become available
