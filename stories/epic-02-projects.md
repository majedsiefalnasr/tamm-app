# Epic 02 — Project Management

> **BMAD context:** Projects are the core entity of TAMM.
> A project has milestones, a contractor, engineers, and a client.
> All users are added by admin — no self-assignment.
> Read `docs/status-flows.md` §2 and `CLAUDE.md §6` before implementing.

---

## Epic goal

Clients can create and track construction projects.
Admins assign contractors and engineers.
All roles see their relevant project view with correct status and actions.

---

## Stories

---

### Story 02-01 — Project list page

**As a** user,
**I want to** see all projects relevant to my role,
**so that** I can track what I'm responsible for.

#### Acceptance criteria

- [ ] Route: `/projects`
- [ ] Page title: i18n key `nav.projects`
- [ ] Fetches projects via `GET /projects` (filtered server-side by role)
- [ ] Renders `ProjectCard` for each project
- [ ] Shows skeleton (3 cards) while loading
- [ ] Shows `EmptyState` when no projects exist
- [ ] Shows `ErrorState` with retry when fetch fails
- [ ] Client sees "Create project" button — other roles do not
- [ ] Cards link to `/projects/:id`
- [ ] Status badge on each card reflects current project status
- [ ] Progress bar shows milestone completion ratio
- [ ] Currency amounts formatted with `formatCurrency()`
- [ ] Page is responsive: 1 column mobile, 2 columns desktop
- [ ] RTL layout verified

#### Role-specific behaviour
- `client` → sees only their own projects
- `contractor` → sees only assigned projects
- `field_engineer` / `supervisor_engineer` → sees only assigned projects
- `admin` / `super_admin` → sees all projects, with filter tabs by status

---

### Story 02-02 — Create project (client)

**As a** client,
**I want to** create a new construction project,
**so that** I can start managing the work through TAMM.

#### Acceptance criteria

- [ ] "Create project" button opens a dialog (not a new page)
- [ ] Form fields: title (required), description, address (required), contractor (required — select from list)
- [ ] Contractor select: fetches `GET /admin/users?role=contractor`, shows name list
- [ ] Form validates with Zod schema before submit
- [ ] On submit: calls `POST /projects`
- [ ] On success: dialog closes, new project card appears in list (optimistic or refresh), success toast
- [ ] On validation error from API: field errors shown inline
- [ ] Submit button disabled during request
- [ ] Form resets on successful close
- [ ] Milestone creation is a separate flow (Story 02-04) — not part of project creation form

#### Technical notes
- Dialog uses shadcn `Dialog` component
- Project starts with status `new` — client cannot change this
- Milestone creation happens after project is created

---

### Story 02-03 — Project detail page

**As a** user,
**I want to** see all details of a project,
**so that** I can understand the current state and take relevant action.

#### Acceptance criteria

- [ ] Route: `/projects/:id`
- [ ] Fetches `GET /projects/:id`
- [ ] Shows skeleton while loading, ErrorState on fetch failure
- [ ] Header: project title, status badge, client name, address, assigned contractor
- [ ] Progress section: milestone count, completion percentage, visual progress bar
- [ ] Financial summary: total amount, paid amount, remaining
- [ ] Milestone list section: renders `MilestoneCard` for each milestone (Story 03-01)
- [ ] Team section: shows assigned engineers (supervisor + field)
- [ ] Admin sees "Assign engineers" action — other roles do not
- [ ] All amounts formatted with `formatCurrency()`
- [ ] All dates formatted with `formatDate()`
- [ ] RTL verified

#### Role-specific sections visible
| Section | Client | Contractor | Field Eng | Supervisor | Admin |
|---|---|---|---|---|---|
| Project details | ✅ | ✅ | ✅ | ✅ | ✅ |
| Financial summary | ✅ | ✅ | ❌ | ❌ | ✅ |
| Team assignment | ❌ | ❌ | ❌ | ❌ | ✅ |
| Milestone actions | ✅ | ✅ | ✅ | ✅ | view only |

---

### Story 02-04 — Add milestones to a project (admin/client)

**As an** admin or client,
**I want to** define the milestones of a project,
**so that** the work is divided into trackable, payable phases.

#### Acceptance criteria

- [ ] "Add milestone" button visible to `admin`, `client` only
- [ ] Opens a dialog with fields: title (required), description, amount (required, positive number), order
- [ ] Order field auto-increments — user can override
- [ ] On submit: calls `POST /projects/:id/milestones` (or equivalent endpoint)
- [ ] New milestone appears in list with status `not_started`
- [ ] Total project amount updates after milestone added
- [ ] Milestone cannot be added if project is `completed`
- [ ] Form validates with Zod — amount must be a positive number

---

### Story 02-05 — Project status management (admin)

**As an** admin,
**I want to** activate, pause, or complete a project,
**so that** the system reflects the current real-world project state.

#### Acceptance criteria

- [ ] Admin sees status action buttons in project detail header
- [ ] `new` → `active`: "Activate project" button
- [ ] `active` → `on_hold`: "Pause project" button
- [ ] `on_hold` → `active`: "Resume project" button
- [ ] `active` → `completed`: only when all milestones are `approved` (button disabled otherwise)
- [ ] Each transition shows confirmation dialog before execution
- [ ] `canTransition('project', from, to)` validated before API call
- [ ] Status badge updates optimistically
- [ ] Rollback on API error
- [ ] Other roles: status badge is read-only, no action buttons

---

## Epic done when

- [ ] All 5 stories complete
- [ ] Project CRUD tested for `client` and `admin` roles
- [ ] List, detail, and create flows tested in RTL
- [ ] Correct role-based UI visibility confirmed for all 6 roles
- [ ] Mocks replaced as `GET /projects`, `POST /projects`, `GET /projects/:id` become available
