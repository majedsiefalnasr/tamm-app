# build-order.md — TAMM Frontend Build Order & Parallel Execution

> This document defines the order to implement all epics and stories,
> how to split work across any number of developers, and the rules that
> prevent conflicts when multiple branches are active simultaneously.
> Base branch: `develop`

---

## Branch naming convention

```
feature/<epic-number>-<story-number>-<short-slug>

Examples:
  feature/01-01-login-page
  feature/03-04-supervisor-approval
  feature/07-02-contractor-proposal
```

- Branch from `develop`, merge back to `develop` via pull request
- Never commit directly to `develop`
- One story = one branch = one PR
- PR title format: `feat(epic-NN): short description [Story NN-NN]`
- Sync from develop daily: `git fetch origin && git rebase origin/develop`

---

## File ownership — who touches what

Ownership is by **domain**, not by person. Whoever picks up a story owns its files for that story's lifetime. The rules below define which files belong to which domain so two developers never edit the same file simultaneously.

### Domain map

| Domain            | Files owned                                                                                                                                                                | Stories               |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| **Auth**          | `app/pages/login.vue`, `app/pages/403.vue`, `app/composables/useAuth.ts`, `app/middleware/auth.ts`, `app/middleware/role.ts`, `app/stores/auth.ts`, `app/layouts/auth.vue` | Epic 01               |
| **Shared UI**     | `app/components/ui/*`, `app/components/common/*`, `app/components/layout/*`, `app/assets/css/main.css`, `app/lib/utils.ts`                                                 | Design system stories |
| **Admin**         | `app/pages/admin/*`, `app/components/layout/Sidebar.vue`                                                                                                                   | Epic 06               |
| **Projects**      | `app/pages/projects/*`, `app/components/project/*`, `app/composables/useProjects.ts`, `app/stores/projects.ts`                                                             | Epic 02               |
| **Proposals**     | `app/components/project/ProposalCard.vue`, `app/components/project/ProposalList.vue`, `app/composables/useProposals.ts`, `app/stores/proposals.ts`                         | Epic 07               |
| **Milestones**    | `app/pages/projects/[id]/milestones/*`, `app/components/milestone/*`, `app/composables/useMilestones.ts`, `app/stores/milestones.ts`                                       | Epic 03               |
| **Payments**      | `app/pages/payments/*`, `app/components/payment/*`, `app/composables/usePayments.ts`, `app/stores/payments.ts`                                                             | Epic 04               |
| **Notifications** | `app/components/notifications/*`, `app/composables/useNotifications.ts`, `app/stores/notifications.ts`                                                                     | Epic 05               |
| **Dashboards**    | `app/pages/dashboard.vue`, `app/pages/assignments.vue`                                                                                                                     | Epic 08               |

### Shared files — coordination required

These files are touched by multiple domains. Follow the rule beside each:

| File                               | Rule                                                                                            |
| ---------------------------------- | ----------------------------------------------------------------------------------------------- |
| `utils/statusMachine.ts`           | Milestones domain owns it. Others read-only. Need a change? Open a PR targeting Milestones dev. |
| `utils/permissions.ts`             | Auth domain owns it. Others read-only.                                                          |
| `utils/formatters.ts`              | Any dev can add a formatter. Never modify an existing one without team sync.                    |
| `shared/types/*.ts`                | Any dev can add new types. Never modify existing type shapes without team sync.                 |
| `docs/api-contracts.md`            | Updated as a team when Laravel delivers endpoints. Never edit alone.                            |
| `i18n/locales/ar.json` + `en.json` | Any dev adds their own keys. Never remove or rename existing keys.                              |
| `app/assets/css/main.css`          | Shared UI domain owns tokens. Other domains may add component-scoped styles only.               |

---

## Shared component contracts

These components are built early (Phase 1–2) and consumed everywhere. Any developer can code against these contracts from day one — before the component exists, use the stub below.

### `StatusTag`

```ts
// app/components/common/StatusTag.vue
interface Props {
  status: MilestoneStatus | PaymentStatus | ProjectStatus
  size?: 'sm' | 'md' // default: 'md'
}
```

```vue
<StatusTag :status="milestone.status" />
<StatusTag :status="project.status" size="sm" />
```

Stub until delivered:

```vue
<span class="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium">
  {{ status }}
</span>
```

### `EmptyState`

```ts
interface Props {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}
```

### `ErrorState`

```ts
interface Props {
  message?: string
  onRetry?: () => void
}
```

### `usePermission()`

```ts
// app/composables/usePermission.ts — owned by Auth domain
const { can } = usePermission()
can('approve_milestone', milestone.allowedActions)
can('create_project')
```

Stub until delivered:

```ts
// Temporary — replace when Auth domain delivers usePermission
const can = (_action: string, _allowed?: string[]) => true
```

### Skeleton variants

Built by Shared UI domain, consumed by all:

- `ProjectCardSkeleton` — used in project list
- `MilestoneCardSkeleton` — used in project detail + milestone views
- `TableRowSkeleton` — used in admin tables
- `PageHeaderSkeleton` — used everywhere

---

## Phase 1 — Foundation (sequential, no parallelism)

Auth is the only unblocked entry point. Everything else depends on it.
Whoever is available takes Phase 1. A second developer can use this time to build the
dependency-free foundation layer (see "What to do while blocked on auth" below).

| Order | Epic    | Story | Description                       | Branch                              | Blocks               |
| ----- | ------- | ----- | --------------------------------- | ----------------------------------- | -------------------- |
| 1.1   | Epic 01 | 01-01 | Login page                        | `feature/01-01-login-page`          | All other stories    |
| 1.2   | Epic 01 | 01-02 | Session persistence & auto-logout | `feature/01-02-session-persistence` | All protected routes |
| 1.3   | Epic 01 | 01-03 | Role-based redirect after login   | `feature/01-03-role-redirect`       | All dashboards       |
| 1.4   | Epic 01 | 01-04 | Topbar user menu                  | `feature/01-04-topbar-user-menu`    | Layout shell         |

### What to do while blocked on auth (parallel foundation work)

Any developer not on auth can build the dependency-free foundation layer.
These have zero Vue dependencies — pure TypeScript, testable immediately with Vitest.

```
shared/types/project.ts       — Project, ProjectStatus, ProjectSummary
shared/types/milestone.ts     — Milestone, MilestoneStatus, Report
shared/types/payment.ts       — Payment, PaymentStatus
shared/types/user.ts          — User, UserRole
shared/types/api.ts           — ApiResponse<T>, PaginatedResponse<T>, ApiError

utils/statusMachine.ts        — canTransition(), all valid transitions
utils/permissions.ts          — role → allowed actions map
utils/formatters.ts           — formatCurrency(), formatDate(), formatRelativeTime()

app/composables/__mocks__/    — mock composable for every domain
  useProjects.mock.ts
  useMilestones.mock.ts
  usePayments.mock.ts
  useProposals.mock.ts
  useNotifications.mock.ts
```

Run `pnpm test` on all of these as you write them. They should be 100% testable with no app running.

---

## Phase 2 — User management (sequential, enables end-to-end role testing)

| Order | Epic    | Story | Description         | Branch                          | Blocks           |
| ----- | ------- | ----- | ------------------- | ------------------------------- | ---------------- |
| 2.1   | Epic 06 | 06-01 | Admin user list     | `feature/06-01-admin-user-list` | Story 06-02      |
| 2.2   | Epic 06 | 06-02 | Create user (admin) | `feature/06-02-create-user`     | All role testing |

---

## Phase 3 — Projects core (sequential)

| Order | Epic    | Story | Description                       | Branch                         | Blocks                        |
| ----- | ------- | ----- | --------------------------------- | ------------------------------ | ----------------------------- |
| 3.1   | Epic 02 | 02-01 | Project list page                 | `feature/02-01-project-list`   | Story 02-03                   |
| 3.2   | Epic 02 | 02-02 | Create project (client)           | `feature/02-02-create-project` | Epic 07                       |
| 3.3   | Epic 02 | 02-03 | Project detail page               | `feature/02-03-project-detail` | Stories 02-04, 02-05, Epic 07 |
| 3.4   | Epic 02 | 02-05 | Project status management (admin) | `feature/02-05-project-status` | Epic 07                       |

---

## Phase 4 — Proposals & contractor selection (parallel after 3.3)

Two tracks can run simultaneously once the project detail page exists as a container.

```
Phase 3.3 done
     │
     ├── Track A: Admin proposal controls ─────────────────────────────────┐
     │                                                                      │
     └── Track B: Contractor + Client flow ──────────────────────────────┐ │
                                                                          ▼ ▼
                                                              Phase 5 can begin
```

### Track A — Admin controls

| Order | Story | Description                               | Branch                           |
| ----- | ----- | ----------------------------------------- | -------------------------------- |
| 4A.1  | 07-01 | Admin opens bidding + invites contractors | `feature/07-01-open-bidding`     |
| 4A.2  | 07-03 | Admin closes bidding for review           | `feature/07-03-close-bidding`    |
| 4A.3  | 07-06 | Admin assigns engineers                   | `feature/07-06-assign-engineers` |

### Track B — Contractor + Client flow

| Order | Story | Description                 | Branch                            |
| ----- | ----- | --------------------------- | --------------------------------- |
| 4B.1  | 07-02 | Contractor submits proposal | `feature/07-02-submit-proposal`   |
| 4B.2  | 07-04 | Client reviews proposals    | `feature/07-04-review-proposals`  |
| 4B.3  | 07-05 | Client selects contractor   | `feature/07-05-select-contractor` |

---

## Phase 5 — Milestones (sequential, depends on Phase 4 complete)

| Order | Epic    | Story | Description                               | Branch                               | Blocks           |
| ----- | ------- | ----- | ----------------------------------------- | ------------------------------------ | ---------------- |
| 5.1   | Epic 02 | 02-04 | Milestone definition (admin + contractor) | `feature/02-04-milestone-definition` | All of Epic 03   |
| 5.2   | Epic 03 | 03-01 | Milestone card component                  | `feature/03-01-milestone-card`       | Stories 03-02→07 |
| 5.3   | Epic 03 | 03-02 | Milestone detail page                     | `feature/03-02-milestone-detail`     | Stories 03-03→05 |

---

## Phase 6 — Approval flow (parallel after 5.3)

```
Phase 5.3 done
     │
     ├── Track A: Report submission ──────────────────────────────────────┐
     │                                                                     │
     └── Track B: Supervisor + Client approval ────────────────────────┐  │
                                                                        ▼  ▼
                                                             Phase 7 can begin
```

### Track A — Report submission

| Order | Story | Description                   | Branch                                |
| ----- | ----- | ----------------------------- | ------------------------------------- |
| 6A.1  | 03-03 | Field engineer submits report | `feature/03-03-submit-report`         |
| 6A.2  | 03-07 | Client approval queue         | `feature/03-07-client-approval-queue` |

### Track B — Supervisor + Client approval

| Order | Story | Description                               | Branch                                  |
| ----- | ----- | ----------------------------------------- | --------------------------------------- |
| 6B.1  | 03-04 | Supervisor reviews and approves milestone | `feature/03-04-supervisor-approval`     |
| 6B.2  | 03-05 | Client gives final approval               | `feature/03-05-client-final-approval`   |
| 6B.3  | 03-06 | Pending reviews page (supervisor)         | `feature/03-06-supervisor-reviews-page` |

**Store coordination note:** Track B's `approveMilestone()` in the milestones store must call the payments store after client approval:

```ts
// stores/milestones.ts (Track B)
async approveMilestone(id: string, role: 'supervisor' | 'client') {
  // ... optimistic update + API call
  if (role === 'client') {
    usePaymentsStore().onMilestoneApproved(id)
  }
}
```

Coordinate the interface with whoever is on Track A before starting 6B.2.

---

## Phase 7 — Payments (sequential, depends on Phase 6 complete)

| Order | Epic    | Story | Description                 | Branch                                     | Blocks              |
| ----- | ------- | ----- | --------------------------- | ------------------------------------------ | ------------------- |
| 7.1   | Epic 04 | 04-02 | Payment status badge        | `feature/04-02-payment-status-badge`       | All payment stories |
| 7.2   | Epic 04 | 04-01 | Client pays for a milestone | `feature/04-01-client-pays-milestone`      | Story 04-05         |
| 7.3   | Epic 04 | 04-03 | Admin releases payment      | `feature/04-03-admin-release-payment`      | Story 04-04         |
| 7.4   | Epic 04 | 04-04 | Contractor payment history  | `feature/04-04-contractor-payment-history` | —                   |
| 7.5   | Epic 04 | 04-05 | Client payment overview     | `feature/04-05-client-payment-overview`    | —                   |

---

## Phase 8 — Notifications + Dashboards (fully parallel, depends on Phase 7)

Two fully independent tracks — assign simultaneously.

```
Phase 7 done
     │
     ├── Track A: Notifications ──────────────────────────────────────────┐
     │                                                                     │
     └── Track B: Dashboards ──────────────────────────────────────────┐  │
                                                                        ▼  ▼
                                                             Phase 9 can begin
```

### Track A — Notifications

| Order | Story | Description                        | Branch                               |
| ----- | ----- | ---------------------------------- | ------------------------------------ |
| 8A.1  | 05-01 | Notification bell and unread count | `feature/05-01-notification-bell`    |
| 8A.2  | 05-02 | Notification drawer                | `feature/05-02-notification-drawer`  |
| 8A.3  | 05-03 | Mark notification as read          | `feature/05-03-mark-as-read`         |
| 8A.4  | 05-04 | Notification content per event     | `feature/05-04-notification-content` |

### Track B — Dashboards

| Order | Story | Description                             | Branch                                   |
| ----- | ----- | --------------------------------------- | ---------------------------------------- |
| 8B.1  | 08-03 | Field engineer dashboard + /assignments | `feature/08-03-field-engineer-dashboard` |
| 8B.2  | 08-04 | Supervisor engineer dashboard           | `feature/08-04-supervisor-dashboard`     |
| 8B.3  | 08-01 | Client dashboard                        | `feature/08-01-client-dashboard`         |
| 8B.4  | 08-02 | Contractor dashboard                    | `feature/08-02-contractor-dashboard`     |
| 8B.5  | 08-05 | Admin / Super Admin dashboard           | `feature/08-05-admin-dashboard`          |

---

## Phase 9 — Admin completion (sequential, depends on Phase 8)

| Order | Epic    | Story | Description                 | Branch                                 |
| ----- | ------- | ----- | --------------------------- | -------------------------------------- |
| 9.1   | Epic 06 | 06-03 | Assign engineers to project | `feature/06-03-assign-engineers`       |
| 9.2   | Epic 06 | 06-04 | Admin project overview      | `feature/06-04-admin-project-overview` |

> Story 06-05 (Admin dashboard) is covered by Epic 08 Story 08-05 — do not duplicate.

---

## Full dependency tree

```
Phase 1: Auth (sequential)
  └── Phase 2: User management (sequential)
        └── Phase 3: Projects core (sequential)
              └── Phase 4: Proposals
                    ├── Track A: Admin controls  (07-01 → 07-03 → 07-06)
                    └── Track B: Proposal flow   (07-02 → 07-04 → 07-05)
                          └── Phase 5: Milestones (sequential)
                                └── Phase 6: Approval flow
                                      ├── Track A: Reports        (03-03 → 03-07)
                                      └── Track B: Approvals      (03-04 → 03-05 → 03-06)
                                            └── Phase 7: Payments (sequential)
                                                  └── Phase 8
                                                        ├── Track A: Notifications (05-01 → 05-04)
                                                        └── Track B: Dashboards    (08-03 → 08-05)
                                                              └── Phase 9: Admin completion
```

---

## What to do when blocked

| Blocked on                     | Action                                                                                               |
| ------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Auth not merged yet            | Build foundation layer: `shared/types/`, `utils/`, `__mocks__/`                                      |
| Shared component not delivered | Use the stub defined in "Shared component contracts" above                                           |
| API endpoint not available     | Build against mock in `app/composables/__mocks__/`, add `// TODO: replace mock — <endpoint>` comment |
| Another domain's store action  | Write a stub action with the agreed interface, coordinate in PR                                      |
| Conflict in a shared file      | Raise immediately — never force-push. Rebase and resolve together.                                   |

---

## Story count summary

| Phase                                | Stories | Max parallel tracks |
| ------------------------------------ | ------- | ------------------- |
| Phase 1 — Auth                       | 4       | 1                   |
| Phase 2 — User management            | 2       | 1                   |
| Phase 3 — Projects core              | 4       | 1                   |
| Phase 4 — Proposals                  | 6       | 2                   |
| Phase 5 — Milestones                 | 3       | 1                   |
| Phase 6 — Approval flow              | 5       | 2                   |
| Phase 7 — Payments                   | 5       | 1                   |
| Phase 8 — Notifications + Dashboards | 9       | 2                   |
| Phase 9 — Admin completion           | 2       | 1                   |
| **Total**                            | **40**  | —                   |

---

_Last updated: 2026-05-05_
_Stack: Nuxt 4 · Vue 3.5 · Tailwind v4 · shadcn-vue · Pinia 3_
