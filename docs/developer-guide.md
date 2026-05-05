# Developer Guide — TAMM Frontend

> For new developers joining the team.
> Read this document completely before writing a single line of code.
> Estimated reading time: 20 minutes.

---

## 1. What is TAMM?

TAMM is a SaaS construction project management platform. It connects clients (project owners), contractors (builders), and engineers (supervisors and field workers) through a structured workflow with escrow-based payments.

The core loop:

```
Client creates project
  ↓
Admin validates scope, invites contractors to bid (invite-only)
  ↓
Contractors submit proposals (price + timeline)
  ↓
Client selects a contractor
  ↓
Admin assigns engineers (Field + Supervisor)
  ↓
Admin + Contractor define milestones collaboratively
  ↓
Client pays first milestone → milestone becomes Active
  ↓
Contractor executes work
  ↓
Field Engineer submits report
  ↓
Supervisor reviews → Approve or Reject
  ↓
Client reviews → Approve or Reject
  ↓
Admin releases payment to contractor
```

You are building the **Nuxt 4 frontend only**. There is a separate Laravel team building the API. The two codebases are fully isolated.

---

## 2. The 6 user roles — memorize these

| Role                | Constant              | What they do                                                                   |
| ------------------- | --------------------- | ------------------------------------------------------------------------------ |
| Super Admin         | `super_admin`         | Full system access, can create admin accounts                                  |
| Admin               | `admin`               | Creates users, assigns engineers, manages project lifecycle, releases payments |
| Client              | `client`              | Creates projects, pays milestones, gives final approval                        |
| Contractor          | `contractor`          | Submits proposals, defines milestones with admin, executes work                |
| Field Engineer      | `field_engineer`      | Submits progress reports                                                       |
| Supervisor Engineer | `supervisor_engineer` | Reviews reports, first approval gate                                           |

**Important:** Engineers are neutral — assigned by admin, not affiliated with contractors.

---

## 3. Prerequisites — set up your machine

Before cloning the repo, ensure you have:

```bash
node --version   # must be 20+
pnpm --version   # install: npm install -g pnpm
git --version
```

You also need:

- **Claude Code** CLI installed and authenticated (`claude --version`)
- Access to the GitHub repository

---

## 4. Clone and install

```bash
git clone https://github.com/your-org/tamm-frontend.git
cd tamm-frontend
git checkout develop
pnpm install
```

Verify the app runs:

```bash
pnpm dev
# → http://localhost:3000
```

No errors on first run = you're set up correctly.

---

## 5. The tech stack — locked, no exceptions

| Concern         | Choice                                                          |
| --------------- | --------------------------------------------------------------- |
| Framework       | Nuxt 4 (app/ directory structure)                               |
| UI layer        | Vue 3.5 — Composition API only, no Options API                  |
| Language        | TypeScript strict mode — no `any`, ever                         |
| State           | Pinia 3 — one store per domain                                  |
| Styling         | Tailwind CSS v4 — CSS-first config, no tailwind.config.js       |
| UI components   | shadcn-vue — lives in `app/components/ui/`, you own these files |
| API calls       | `$fetch` / `useFetch` — never axios                             |
| Forms           | VeeValidate + Zod — schema-first                                |
| i18n            | @nuxtjs/i18n — Arabic default (RTL), English secondary          |
| Icons           | lucide-vue-next                                                 |
| Testing         | Vitest (unit) + Playwright (e2e)                                |
| Package manager | pnpm                                                            |

**Do not install any package not listed here.** If a task seems to require a new package — stop, ask the team lead first.

---

## 6. Project structure — where everything lives

```
tamm-frontend/
├── CLAUDE.md                        ← AI behavioral + stack rules (read this)
├── docs/                            ← all documentation
│   ├── coding-standards.md          ← how to write code
│   ├── status-flows.md              ← all state machines (single source of truth)
│   ├── api-contracts.md             ← API endpoints (check before every integration)
│   ├── frontend-spec.md             ← design system
│   ├── build-order.md               ← which epic to build when + branch names
│   └── BMAD-cheat-sheet.md          ← AI workflow reference
├── app/                             ← ALL Vue/Nuxt application code lives here
│   ├── assets/css/main.css          ← Tailwind v4 imports + @theme tokens
│   ├── components/
│   │   ├── ui/                      ← shadcn-vue components (you own these)
│   │   ├── common/                  ← StatusTag, EmptyState, ErrorState, PageSkeleton
│   │   ├── layout/                  ← Sidebar, Topbar, NotificationBell
│   │   ├── project/                 ← ProjectCard, ProjectHeader
│   │   ├── milestone/               ← MilestoneCard, MilestoneActions, ApprovalFlow
│   │   ├── payment/                 ← EscrowBadge, PaymentStatusTag
│   │   ├── report/                  ← ReportForm, ReportViewer
│   │   └── notifications/           ← NotificationItem, NotificationDrawer
│   ├── composables/
│   │   └── __mocks__/               ← mock composables for missing API endpoints
│   ├── layouts/                     ← default.vue, admin.vue, auth.vue
│   ├── middleware/                  ← auth.ts, role.ts
│   └── pages/                      ← file-based routing
├── shared/types/                    ← TypeScript types shared across app + server
├── stores/                          ← Pinia stores (one per domain)
├── utils/                           ← statusMachine.ts, permissions.ts, api.ts, formatters.ts
├── i18n/locales/                    ← ar.json (Arabic), en.json (English)
├── _bmad/                           ← BMAD runtime — never edit manually
└── _bmad-output/
    ├── planning-artifacts/          ← all 8 epics
    └── implementation-artifacts/   ← story files you work from
```

**The most important rule:** All app code lives inside `app/`. Never create `pages/` or `components/` at the project root — that's Nuxt 3 convention. TAMM uses Nuxt 4.

---

## 7. The 5 documents you must read before coding

Open each of these and read them fully before writing your first story:

| Document                   | What it covers                                            | Why it matters                                  |
| -------------------------- | --------------------------------------------------------- | ----------------------------------------------- |
| `CLAUDE.md`                | Behavioral rules + stack decisions + what never to do     | Violated rules mean rejected PRs                |
| `docs/coding-standards.md` | TypeScript patterns, composable structure, store patterns | How every file must be written                  |
| `docs/status-flows.md`     | Every state machine in the app                            | Source of truth — never hardcode status strings |
| `docs/api-contracts.md`    | All API endpoints + their status                          | Know what's real vs what needs a mock           |
| `docs/build-order.md`      | Which epics/stories to build and in what order            | Know your branch name before you start          |

---

## 8. How development works — the BMAD workflow

TAMM uses BMAD (v6.6.0) — an AI-driven agile workflow. Here's what that means day to day.

### You work from story files, not epics

Epics (`_bmad-output/planning-artifacts/epic-*.md`) define the full scope.
Story files (`_bmad-output/implementation-artifacts/story-*.md`) are what you actually implement — one story at a time.

The Scrum Master agent generates story files from epics using `/bmad-create-story`.

### Each story has a clear contract

A story file tells you exactly:

- What to build (acceptance criteria)
- What's out of scope
- What mock to use if the API isn't ready
- What depends on it

**Never implement beyond the story's acceptance criteria.** Extra features belong in new stories.

### The development cycle per story

```
1. Pick your story from the sprint plan (docs/sprint-status.yaml)
2. Create your feature branch (name is in docs/build-order.md)
3. Open Claude Code and run: /bmad-dev-story
4. Paste or reference the story file path
5. READ the implementation plan Claude presents
6. APPROVE the plan before any code is written — this is mandatory
7. Claude builds the story
8. You review the diff
9. Run: /bmad-code-review
10. Open a PR to develop
```

**Step 6 is non-negotiable.** Never let Claude start coding before you've approved the plan. This is rule §0.4 in CLAUDE.md.

---

## 9. Branch workflow

Every story has a branch name defined in `docs/build-order.md`.

```bash
# Convention: feature/<epic-number>-<story-number>-<slug>
git checkout develop
git pull
git checkout -b feature/01-01-login-page

# Work on the story...

# When done, push and open PR to develop
git push -u origin feature/01-01-login-page
```

Rules:

- Branch from `develop`, merge to `develop`
- Never commit directly to `develop`
- One story = one branch = one PR
- PR title: `feat(epic-01): login page [Story 01-01]`

---

## 10. The API — what's available and what isn't

The Laravel API is built by a separate team and delivered incrementally.

**Before implementing any API call:**

1. Open `docs/api-contracts.md`
2. Find the endpoint — is it marked ✅ Available or ⏳ Not started?
3. If ✅ → implement against the exact contract
4. If ⏳ → build the UI fully, create a mock in `app/composables/__mocks__/`, add a `// TODO: replace mock — <endpoint name>` comment

**Never block progress waiting for the API.** Build with mocks and swap when the endpoint arrives.

Mock pattern:

```ts
// app/composables/__mocks__/useProjects.mock.ts
export function useProjects() {
  return {
    projects: ref([
      { id: '1', title: 'Test Project', status: 'new', ... }
    ]),
    loading: ref(false),
    error: ref(null),
  }
}
// TODO: replace mock — GET /projects
```

---

## 11. RTL — Arabic first, always

TAMM defaults to Arabic (RTL). Every layout you build must work in RTL.

**The rule:** Never use directional CSS classes. Always use logical properties:

| Instead of                 | Use                       |
| -------------------------- | ------------------------- |
| `ml-4` / `mr-4`            | `ms-4` / `me-4`           |
| `pl-2` / `pr-2`            | `ps-2` / `pe-2`           |
| `left-0` / `right-0`       | `start-0` / `end-0`       |
| `text-left` / `text-right` | `text-start` / `text-end` |
| `border-l` / `border-r`    | `border-s` / `border-e`   |

Before marking any story done, switch the browser locale to Arabic and verify the layout. The dev server picks up locale from `?locale=ar` or the i18n switcher.

---

## 12. Permissions — never check role strings in templates

Every action in the UI must be permission-checked through `usePermission()`, not by comparing role strings directly.

```vue
<!-- ✅ correct -->
<template>
  <Button v-if="can('approve_milestone', milestone.allowedActions)">
    Approve
  </Button>
</template>

<!-- ❌ never — brittle, untestable, wrong -->
<template>
  <Button v-if="auth.user.role === 'supervisor_engineer'"> Approve </Button>
</template>
```

The `allowedActions` array comes from the API response for each resource. The backend is the source of truth for what actions a user can take.

---

## 13. Status transitions — always validate before calling the API

Every approval, rejection, or status change must be validated before the API call:

```ts
import { canTransition } from '~/utils/statusMachine'

if (!canTransition('milestone', milestone.status, 'supervisor_approved')) {
  notify.error(t('errors.invalid_transition'))
  return
}

// only then call the API
await useApi(`/milestones/${id}/approve`, { method: 'POST' })
```

Status strings live only in `utils/statusMachine.ts`. Never hardcode `'supervisor_approved'` or any other status string anywhere else.

---

## 14. Optimistic updates — required for all mutations

Every store action that changes state must optimistically update the UI and roll back on failure:

```ts
// stores/milestones.ts
async function approveMilestone(id: string) {
  const prev = getById(id).status
  setStatus(id, 'supervisor_approved') // optimistic — UI updates immediately
  try {
    await useApi(`/milestones/${id}/approve`, {
      method: 'POST',
      body: { role: 'supervisor' },
    })
  } catch {
    setStatus(id, prev) // rollback on failure
    notify.error(t('errors.approval_failed'))
  }
}
```

Never call the API from a component directly. Always go through a store action.

---

## 15. Definition of done — a story is complete only when all of this is true

**Behavioral**

- [ ] Assumptions were stated before implementation started
- [ ] Nothing was changed outside the story's scope
- [ ] Unused imports/variables introduced by this story are removed

**Functional**

- [ ] Feature works correctly for all relevant roles
- [ ] Status transitions validated via `canTransition()`
- [ ] Permissions checked via `usePermission().can()`
- [ ] Optimistic update + rollback implemented for every mutation

**Quality**

- [ ] RTL layout verified in Arabic
- [ ] All UI strings use i18n keys — no hardcoded text
- [ ] Only logical CSS properties used (`ms-`, `ps-`, `border-s-`, etc.)
- [ ] Error states handled and shown to user
- [ ] Loading states use shadcn `Skeleton` component
- [ ] TypeScript — zero errors, zero `any`
- [ ] No console errors or warnings
- [ ] Mock removed if the API endpoint is now available

---

## 16. Quick reference — where to find things

| I need to know...                   | Look here                                |
| ----------------------------------- | ---------------------------------------- |
| What to build next                  | `docs/build-order.md`                    |
| My branch name                      | `docs/build-order.md`                    |
| How a status transitions            | `docs/status-flows.md`                   |
| If an API endpoint exists           | `docs/api-contracts.md`                  |
| How to write a component            | `docs/coding-standards.md`               |
| Design system / colors / components | `docs/frontend-spec.md`                  |
| Stack decisions and rules           | `CLAUDE.md`                              |
| What stories are in my sprint       | `_bmad-output/implementation-artifacts/` |
| The full epic scope                 | `_bmad-output/planning-artifacts/`       |
| BMAD commands reference             | `docs/BMAD-cheat-sheet.md`               |

---

## 17. Common mistakes — read this before your first PR

| Mistake                                        | What to do instead                                   |
| ---------------------------------------------- | ---------------------------------------------------- |
| Used `ml-4` or `pl-2`                          | Replace with `ms-4` / `ps-2`                         |
| Hardcoded a string in a template               | Add it to `i18n/locales/ar.json` and `en.json`       |
| Called `$fetch` directly in a component        | Create a composable, call through the store          |
| Used `any` in TypeScript                       | Find the correct type in `shared/types/`             |
| Checked `auth.user.role === '...'` in template | Use `usePermission().can()`                          |
| Hardcoded `'approved'` status string           | Import constant from `utils/statusMachine.ts`        |
| Wrote a 200-line component                     | Break it into smaller composables + child components |
| Added a new npm package                        | Ask the team lead first                              |
| Committed directly to `develop`                | Never. Always use a feature branch + PR.             |
| Marked story done without RTL check            | Switch to Arabic locale and verify layout            |

---

_Stack: Nuxt 4 · Vue 3.5 · Tailwind v4 · shadcn-vue · Pinia 3 · BMAD v6.6.0_
_TAMM Frontend Team_
_Last updated: 2026-05-05_
