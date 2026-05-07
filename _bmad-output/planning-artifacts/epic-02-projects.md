# Epic 02 — Project Management

> **BMAD context:** Projects are the core entity of TAMM.
> A project begins as scope only (no contractor, no milestones).
> The contractor is selected via the proposal/bidding phase (Epic 07).
> Milestones are defined collaboratively after contractor selection (Epic 07).
> Read `docs/status-flows.md §2` and `CLAUDE.md §6` before implementing.

---

## Design reference

> Full spec: `docs/design-spec.md` — read §8 (projects list), §9 (project detail), §5 (primitives).

### Projects list page (Story 02-01)

- `PageHeader` with title + optional "New project" CTA (client only)
- Grid: `grid gap-4 lg:grid-cols-2`
- Skeleton: 3 ghost cards while loading (`Skeleton` component)
- Empty state: `§5.7` dashed border pattern

**ProjectCard visual:**
```
rounded-2xl border border-border bg-card p-5 shadow-card
hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elevated transition
```
- Project name: `text-base font-extrabold text-ink`
- Status pill: `Pill` component, tone mapped from project status (see `design-spec.md §1.4`)
- City + budget metadata: `text-xs text-muted-foreground flex items-center gap-2`
- Progress bar: `§5.8` pattern — hidden when no phases yet
- Bottom: contractor name (if assigned) + "عرض التفاصيل" link, `text-xs font-bold text-primary`

**Admin extras:** filter tabs (All / Active / Pending / Completed / On Hold) above the grid, using shadcn-vue `Tabs`.

### Project detail page (Stories 02-03 to 02-05)

- **Header card:** `rounded-3xl border border-border bg-card shadow-card p-6 md:p-8`
  Background: `bg-gradient-to-[inline-start] from-primary/10 via-card to-card`
  Contains: project name (h1, `text-2xl font-extrabold`), status pill, meta (city, type, area, budget, team)
  + overall progress bar (`§5.8`)
- **Tab nav** below header: المراحل / المدفوعات / التقارير / المحادثة / السجل
  Use shadcn-vue `Tabs` component

**Phases tab:** see `design-spec.md §9.1` and `§9.2` for phase cards and task list spec.

**Timeline tab:** vertical timeline using `before:` pseudo-element for the connector line.
Each event dot color by kind: `approved`=primary, `rejected`=danger, `payment`=accent, `info`=muted.

**Chat tab:** see `design-spec.md §13`.

### New project form (Story 02-02)

- Full-page section (not a dialog — dedicated nav section)
- `SectionCard` wrapper with `PageHeader`
- Fields use shadcn-vue `Form` + VeeValidate + Zod:
  - Project name: `Input`
  - City: `Select` (dropdown)
  - Project type: `Select` (villa / apartment / commercial / other)
  - Area m²: `Input` type=number
  - Budget estimate: `MoneyInput` (numeric, formatted)
  - Description: `Textarea`
- Submit: primary button style, full-width on mobile

### RTL notes

- Project card text: `text-start`
- Progress bar fill: start from inline-start (right in RTL)
- Tab list: `dir` inherits from `html`, tabs render right-to-left naturally
- Status pill: always inline-flex, no directional dependency

---

## Epic goal

Clients can create construction projects with scope only.
All roles see their relevant project view with correct status and actions.
Admins manage project lifecycle from new through to active.

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
- [ ] Progress bar shows milestone completion ratio (hidden when no milestones yet)
- [ ] Currency amounts formatted with `formatCurrency()` (hidden when no milestones yet)
- [ ] Page is responsive: 1 column mobile, 2 columns desktop
- [ ] RTL layout verified

#### Role-specific behaviour
- `client` → sees only their own projects
- `contractor` → sees only projects where they are the selected contractor
- `field_engineer` / `supervisor_engineer` → sees only assigned projects
- `admin` / `super_admin` → sees all projects, with filter tabs by status

---

### Story 02-02 — Create project (client)

**As a** client,
**I want to** create a new construction project,
**so that** I can start the process of finding a contractor through TAMM.

#### Acceptance criteria

- [ ] "Create project" button opens a dialog (not a new page)
- [ ] Form fields: title (required), description (optional), address (required)
- [ ] No contractor field — contractor is selected later via proposals
- [ ] No milestone fields — milestones are defined after contractor selection
- [ ] Form validates with Zod schema before submit
- [ ] On submit: calls `POST /projects`
- [ ] On success: dialog closes, new project card appears in list, success toast
- [ ] On validation error from API: field errors shown inline
- [ ] Submit button disabled during request
- [ ] Form resets on successful close
- [ ] New project always starts with status `new`

#### Technical notes
- Dialog uses shadcn `Dialog` component
- Project status `new` — client cannot change this; admin opens bidding (Epic 07)

---

### Story 02-03 — Project detail page

**As a** user,
**I want to** see all details of a project,
**so that** I can understand the current state and take relevant action.

#### Acceptance criteria

- [ ] Route: `/projects/:id`
- [ ] Fetches `GET /projects/:id`
- [ ] Shows skeleton while loading, `ErrorState` on fetch failure
- [ ] Header: project title, status badge, client name, address
- [ ] Contractor section: shows selected contractor name (or "Awaiting contractor selection" badge when `new` / `open_for_bids` / `under_review`)
- [ ] Engineers section: shows assigned supervisor + field engineer (or "Not yet assigned" when pre-`active`)
- [ ] Milestone list section: renders `MilestoneCard` for each milestone (Story 03-01) — shows `EmptyState` when no milestones yet
- [ ] Progress section: shown only when milestones exist — milestone count, completion %, visual progress bar
- [ ] Financial summary: shown only when milestones exist — total amount, paid amount, remaining
- [ ] Admin sees stage-appropriate action buttons (see Story 02-05)
- [ ] All amounts formatted with `formatCurrency()`
- [ ] All dates formatted with `formatDate()`
- [ ] RTL verified

#### Role-specific sections visible
| Section | Client | Contractor | Field Eng | Supervisor | Admin |
|---|---|---|---|---|---|
| Project details | ✅ | ✅ | ✅ | ✅ | ✅ |
| Proposals section | ✅ (read) | ❌ | ❌ | ❌ | ✅ |
| Financial summary | ✅ | ✅ | ❌ | ❌ | ✅ |
| Team assignment | ❌ | ❌ | ❌ | ❌ | ✅ |
| Milestone actions | ✅ | ✅ | ✅ | ✅ | view only |

---

### Story 02-04 — Milestone definition (admin + contractor)

**As an** admin or contractor,
**I want to** define the milestones of a project after a contractor is selected,
**so that** the work is divided into trackable, payable phases before execution begins.

#### Acceptance criteria

- [ ] "Add milestone" button visible to `admin`, `super_admin`, and the selected `contractor` only
- [ ] Only available when project status is `contractor_selected`
- [ ] Opens a dialog with fields: title (required), description (optional), amount (required, positive number), order (auto-increments, user can override)
- [ ] On submit: calls `POST /projects/:id/milestones`
- [ ] New milestone appears in list with status `not_started`
- [ ] Total project amount shown and updates as milestones are added
- [ ] Admin can also edit or remove milestones that haven't started yet
- [ ] Form validates with Zod — amount must be a positive number
- [ ] Milestone definition is locked once project transitions to `active`

---

### Story 02-05 — Project status management (admin)

**As an** admin,
**I want to** move a project through its lifecycle stages,
**so that** the system reflects the current real-world state at each phase.

#### Acceptance criteria

- [ ] Admin sees stage-appropriate action button in project detail header
- [ ] `new` → `open_for_bids`: "Open for bids" button (covered in Epic 07 — Story 07-01)
- [ ] `under_review` → (client selects contractor — covered in Epic 07)
- [ ] `contractor_selected` → `active`: "Activate project" button — only enabled when: at least one milestone defined AND engineers assigned
- [ ] `active` → `on_hold`: "Pause project" button
- [ ] `on_hold` → `active`: "Resume project" button
- [ ] `active` → `completed`: automatic when all milestones are `approved` — no manual button
- [ ] Each transition shows confirmation dialog before execution
- [ ] `canTransition('project', from, to)` validated before API call
- [ ] Status badge updates optimistically
- [ ] Rollback on API error
- [ ] Other roles: status badge is read-only, no action buttons

---

## Epic done when

- [ ] All 5 stories complete
- [ ] Project creation tested for `client` role — no contractor or milestone fields in form
- [ ] Project detail shows correct sections per role and per project stage
- [ ] Milestone definition only available in `contractor_selected` state
- [ ] Admin status transitions tested for all valid paths
- [ ] List, detail, and create flows tested in RTL
- [ ] Mocks replaced as `GET /projects`, `POST /projects`, `GET /projects/:id` become available
