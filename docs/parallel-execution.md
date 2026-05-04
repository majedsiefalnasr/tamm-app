# parallel-execution.md — TAMM Multi-Developer Guide

> This document defines how the frontend team works in parallel.
> It answers three questions for every developer every day:
> "What is mine to build?", "What am I blocked on?", "What must I not touch?"

---

## Core parallelization strategy

TAMM has one hard constraint and one soft constraint.

**Hard constraint:** Auth (Epic 01) + Shared UI components must be complete before
any feature story can be merged to `main`. They are the foundation every other track
stands on. Sprint 1 is therefore the only fully sequential sprint.

**Soft constraint:** After Sprint 1, the four tracks are independent 95% of the time.
The 5% where they touch are the shared component boundaries — defined precisely below.

---

## The two tracks — 2 developer setup

With 2 developers, we collapse the original 4 tracks into 2.
Each dev owns a coherent domain slice with minimal cross-track dependencies.

| Track | Developer | Epics owned | Core responsibility |
|---|---|---|---|
| A — Foundation + Admin + Notifications | Dev A | Epic 01, 06, 05 | Auth, admin panel, shared UI, notifications |
| B — Features | Dev B | Epic 02, 03, 04 | Projects, milestones, approvals, payments |

Dev A takes foundation work (auth, shared UI) plus admin and notifications.
Dev B takes all feature epics — projects and milestones are deeply coupled
so keeping them together eliminates Sprint 2 integration friction.

---

## Ownership map — who builds what

### Track A — Dev A

```
app/
├── pages/
│   ├── login.vue                     ← owns
│   ├── 403.vue                       ← owns
│   └── admin/
│       ├── users.vue                 ← owns
│       └── projects.vue              ← owns
├── composables/
│   ├── useAuth.ts                    ← owns
│   └── usePermission.ts              ← owns (critical — others consume this)
├── middleware/
│   ├── auth.ts                       ← owns
│   └── role.ts                       ← owns
├── stores/
│   └── auth.ts                       ← owns
└── components/
    └── layout/
        ├── Topbar.vue                ← owns
        └── TopbarUserMenu.vue        ← owns
```

### Track B — Dev B

```
app/
├── pages/
│   ├── projects/
│   │   ├── index.vue                 ← owns
│   │   └── [id]/index.vue           ← owns (project detail shell)
│   └── payments/
│       └── index.vue                 ← owns
├── composables/
│   ├── useProjects.ts                ← owns
│   └── usePayments.ts                ← owns
├── stores/
│   ├── projects.ts                   ← owns
│   └── payments.ts                   ← owns
└── components/
    ├── project/
    │   ├── ProjectCard.vue           ← owns
    │   ├── ProjectHeader.vue         ← owns
    │   └── MilestoneProgress.vue     ← owns (progress bar only)
    └── payment/
        ├── EscrowBadge.vue           ← owns
        └── PaymentStatusTag.vue      ← owns
```

### Track C — Dev C

```
app/
├── pages/
│   ├── projects/[id]/milestones/
│   │   └── [mid].vue                 ← owns
│   ├── reports/
│   │   └── [id].vue                  ← owns
│   └── reviews/
│       └── index.vue                 ← owns (supervisor queue)
├── composables/
│   ├── useMilestones.ts              ← owns
│   └── useReports.ts                 ← owns
├── stores/
│   └── milestones.ts                 ← owns
└── components/
    ├── milestone/
    │   ├── MilestoneCard.vue         ← owns
    │   ├── MilestoneActions.vue      ← owns
    │   └── ApprovalFlow.vue          ← owns (most critical component)
    └── report/
        ├── ReportForm.vue            ← owns
        └── ReportViewer.vue          ← owns
```

### Track D — Dev D

```
app/
├── assets/
│   └── css/
│       ├── main.css                  ← owns (design tokens)
│       └── transitions.css           ← owns
├── components/
│   ├── ui/                           ← owns all shadcn-vue installs + customization
│   ├── common/
│   │   ├── StatusTag.vue             ← owns (consumed by everyone)
│   │   ├── EmptyState.vue            ← owns
│   │   ├── ErrorState.vue            ← owns
│   │   ├── PageSkeleton.vue          ← owns
│   │   └── [all skeleton variants]   ← owns
│   ├── layout/
│   │   ├── Sidebar.vue               ← owns
│   │   └── SidebarNav.vue            ← owns
│   └── notifications/
│       ├── NotificationBell.vue      ← owns
│       ├── NotificationDrawer.vue    ← owns
│       └── NotificationItem.vue      ← owns
├── composables/
│   └── useNotifications.ts           ← owns
├── stores/
│   └── notifications.ts              ← owns
└── lib/
    └── utils.ts                      ← owns (cn() utility)
```

---

## Sprint plan

### Sprint 1 — Foundation (both devs)

Sprint 1 is special: Dev B cannot build features yet because auth isn't ready.
Dev B uses this time to build the dependency-free foundation layer.

| Dev | Stories | Output |
|---|---|---|
| A | 01-01, 01-02, 01-03, 01-04 | Full auth system, login page, role routing, topbar |
| A | Design system (Track D work) | `components/ui/`, `StatusTag`, `EmptyState`, `Sidebar` |
| B | Foundation layer | `shared/types/`, `utils/statusMachine.ts`, `utils/permissions.ts`, `utils/formatters.ts`, all `__mocks__/` |

**Sprint 1 gate:** Auth middleware works for all roles, design tokens finalized, types clean.
No Sprint 2 stories start until this gate passes — verified with `/workflow-status`.

**Dev B in Sprint 1 — exact work:**

```
/dev-story story-foundation-types

# If no story file exists yet, ask SM to create one:
/create-story
→ "Create a story for writing all shared TypeScript types in shared/types/
   and all pure utilities: statusMachine.ts, permissions.ts, formatters.ts,
   and mock composables in app/composables/__mocks__/"
```

---

### Sprint 2 — Parallel feature tracks (both devs)

Both tracks run simultaneously from here.

| Dev | Stories | Depends on |
|---|---|---|
| A | 06-01, 06-02 (Admin user management) | Sprint 1 auth |
| B | 02-01, 02-02, 02-03 (Project list, create, detail) | Sprint 1 auth + StatusTag |
| B | 03-01, 03-02 (Milestone card, milestone detail) | Sprint 1 auth + StatusTag |

Dev B takes both project and milestone stories in Sprint 2 since they're closely coupled —
the project detail page renders milestone cards. Dev B owns both domains.

**Key integration point in Sprint 2:**

Dev B's `projects/[id]/index.vue` needs to render `MilestoneCard`.
Since Dev B owns both, there's no handoff friction — build `MilestoneCard` first,
then wire it into the project detail page.

```
/dev-story story-milestone-card   ← Dev B builds this first in Sprint 2
/dev-story story-project-detail   ← then this, which already has MilestoneCard available
```

---

### Sprint 3 — Core workflows (both devs)

| Dev | Stories | Depends on |
|---|---|---|
| A | 06-03, 06-04 (Assign engineers, admin project overview) | Sprint 2 admin + project detail |
| A | 05-01, 05-02, 05-03, 05-04 (Notifications full flow) | Sprint 2 auth + layout |
| B | 02-04, 02-05 (Add milestones, project status), 04-01, 04-02 (Pay, payment badge) | Sprint 2 project detail |
| B | 03-03, 03-04, 03-05 (Report submit, supervisor approve, client approve) | Sprint 2 milestone detail |

**Critical store coordination in Sprint 3:**

Dev B's `ApprovalFlow` (milestones) and payment flow need to talk via Pinia store.
They're both owned by Dev B now — coordinate within your own code:

```ts
// milestones store (Dev B)
async approveMilestone(id: string, role: 'supervisor' | 'client') {
  // ... approve logic
  if (role === 'client') {
    usePaymentsStore().onMilestoneApproved(id)  // calls own payments store
  }
}
```

### Sprint 4 — Queues, release, polish (both devs)

| Dev | Stories | Depends on |
|---|---|---|
| A | QA + integration testing all auth + admin flows | Sprint 3 complete |
| B | 04-03, 04-05 (Admin release payment, client payment view) | Sprint 3 approvals |
| B | 03-06, 03-07 (Supervisor review queue, client approval queue) | Sprint 3 approval flows |
| B | 04-04 (Contractor payment history) | Sprint 3 payments |

---

## Shared component contract — the most important section

These components are built by Dev D and consumed by everyone else.
The contract below is what A, B, C can code against from day one — before D delivers.

### `StatusTag` — consumed by B and C constantly

```ts
// Contract: app/components/common/StatusTag.vue
interface Props {
  status: MilestoneStatus | PaymentStatus | ProjectStatus
  size?: 'sm' | 'md'   // default: 'md'
}
```

Usage:
```vue
<StatusTag :status="milestone.status" />
<StatusTag :status="project.status" size="sm" />
```

Dev D delivers this in Sprint 1 Week 1. Until then, A/B/C use this stub:
```vue
<!-- Temporary stub — replace with real StatusTag when D delivers -->
<span class="text-xs font-medium px-2 py-0.5 rounded-full bg-neutral-100">
  {{ status }}
</span>
```

### `EmptyState` — consumed by B and C

```ts
interface Props {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}
```

### `Skeleton` variants — consumed by B and C

Dev D delivers these by Sprint 1 end:
- `ProjectCardSkeleton` — used by B
- `MilestoneCardSkeleton` — used by C
- `TableRowSkeleton` — used by A (admin tables)
- `PageHeaderSkeleton` — used by all

### `usePermission()` — consumed by everyone

```ts
// Contract: app/composables/usePermission.ts
// Owned by: Dev A
const { can } = usePermission()
can('approve_milestone_supervisor', milestone.allowedActions)
can('create_project')
```

Dev A delivers this in Sprint 1 Week 1. Until then, use this stub:
```ts
// Temporary — replace when Dev A delivers usePermission
const can = (_action: string) => true  // show everything during dev, gate in review
```

---

## Branch strategy

```
main                    ← production-ready, protected
├── develop             ← integration branch, all tracks merge here
│   ├── feat/track-a-auth           ← Dev A's branch
│   ├── feat/track-b-projects       ← Dev B's branch
│   ├── feat/track-c-milestones     ← Dev C's branch
│   └── feat/track-d-shared-ui      ← Dev D's branch
```

### Rules

- Each dev works on their track branch only
- Merge to `develop` via PR — minimum 1 reviewer
- PR can only be merged when all acceptance criteria checkboxes in the story are checked
- `main` ← `develop` only after a sprint is complete and tested
- Hotfixes branch from `main`, merge back to both `main` and `develop`

### When to sync from develop

```bash
# Do this at start of every day on your track branch
git fetch origin
git rebase origin/develop

# Never: git merge develop (creates messy merge commits)
```

### Conflict prevention rules

1. Each dev touches only their owned files (see ownership map above)
2. `utils/statusMachine.ts` — owned by C, but read-only for everyone else
3. `utils/permissions.ts` — owned by A, but read-only for everyone else
4. `app/assets/css/main.css` — owned by D. If A/B/C need a new token, open a PR to D
5. `shared/types/` — any dev can add types, but must not modify existing ones without team sync
6. `docs/api-contracts.md` — updated as a team when Laravel delivers endpoints

---

## BMAD agent assignment per track

Each dev runs their own Claude Code session using BMAD v6 slash commands.
The `/dev-story` command automatically loads `dev_load_always_files` from
`_bmad/bmm/config.yaml` — no manual context needed.

| Dev | BMAD command | Story source |
|---|---|---|
| A | `/dev-story story-[slug]` | `epic-01-auth.md`, `epic-06-admin.md` |
| B | `/dev-story story-[slug]` | `epic-02-projects.md`, `epic-04-payments.md` |

**How to start a dev session (both devs, same pattern):**

```
/dev-story story-auth-login
```

BMAD's Dev agent (Amelia) activates and automatically reads:
1. `story-auth-login.md` — the story contract
2. `CLAUDE.md` — behavioral rules + stack (via dev_load_always_files)
3. `docs/coding-standards.md` — code patterns (via dev_load_always_files)
4. `docs/status-flows.md` — state machine (via dev_load_always_files)
5. `docs/api-contracts.md` — available endpoints (via dev_load_always_files)

She presents her implementation plan. **Approve the plan before she writes any code.**
This is the Karpathy rule from `CLAUDE.md §0.4`.

**To generate a new story file before implementing:**

```
/create-story
→ source: docs/stories/epic-02-projects.md
→ generate: story-project-list
→ pause after this one story for review
```

---

## Daily sync checklist

Each developer answers these three questions in the daily standup:

1. "I completed `[story-id]` — criteria all checked, merged to develop."
2. "I am currently on `[story-id]` — expected done: `[date]`."
3. "I am blocked on `[what]` — need `[from whom]` by `[when]`."

If a blocker is not resolved in 24 hours → escalate to team lead.

---

## What to do when blocked

| Blocked on | Action |
|---|---|
| Auth not ready (Sprint 1) | Build mock layer + types + utils. Write tests. |
| Shared component not ready | Use the stub defined in "Shared component contract" above |
| API endpoint not available | Build against mock in `__mocks__/`, add TODO comment |
| Depends on another track's store action | Write a stub action, coordinate interface via Pinia |
| Conflict in shared file | Raise in standup immediately — never force-push |

---

## Integration testing checkpoints

After Sprint 1: Auth flow works end-to-end for all 6 roles
After Sprint 2: Project list → detail → milestone renders correctly
After Sprint 3: Full milestone lifecycle (submit → approve → payment ready)
After Sprint 4: Complete e2e: login → create project → add milestones → full approval cycle → payment released

Each checkpoint: ask `@qa` to generate e2e tests (`"Act as @qa, generate e2e tests for the auth flow"`),
all devs run `pnpm test:e2e` before marking sprint done.

---

*Last updated: MVP v1.0 — Frontend team*
