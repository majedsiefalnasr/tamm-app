# CLAUDE.md — TAMM Frontend Deep Dive

> **For all AI tools:** Start with [AGENTS.md](./AGENTS.md) — the single source of truth.
> 
> **For Claude Code users:** This file provides deep-dive context beyond AGENTS.md.
> - Detailed architecture explanations
> - Extensive code examples and patterns
> - Design system specifications
> - Full project context
> 
> Read in order: [AGENTS.md](./AGENTS.md) → then this file if you need more context.

---

## 0. Behavioral guidelines — read before every task

These rules prevent the most common and costly AI coding mistakes.
They bias toward caution over speed. For trivial tasks, use judgment.

### 0.1 Think before coding — surface tradeoffs, don't hide confusion

Before writing a single line:

- **State your assumptions explicitly.** If you are uncertain about scope, ask.
- **If multiple interpretations exist, present them.** Do not pick silently and hope.
- **If a simpler approach exists, say so.** Push back when the task is overcomplicated.
- **If something is unclear, stop.** Name exactly what is confusing. Ask before proceeding.

```
❌ Assume the task means X and implement quietly
✅ "I'm reading this as X. If you mean Y, let me know before I start."

❌ Pick one of three valid approaches without saying so
✅ "There are two ways to do this — A (simpler, less flexible) or B (more robust, more code).
    Which fits better?"
```

### 0.2 Simplicity first — minimum code that solves the problem

Ask before every implementation: *"Would a senior engineer say this is overcomplicated?"*

- No features beyond what was asked
- No abstractions for single-use code
- No "flexibility" or "configurability" that wasn't requested
- No error handling for impossible scenarios
- If you write 200 lines and it could be 50 — rewrite it

```ts
// ❌ over-engineered for a one-time use
class MilestoneApprovalStrategyFactory {
  createStrategy(type: string): ApprovalStrategy { ... }
}

// ✅ just what was asked
async function approveMilestone(id: string) { ... }
```

### 0.3 Surgical changes — touch only what you must

When editing existing code:

- **Do not "improve" adjacent code**, comments, or formatting you weren't asked to touch
- **Do not refactor things that aren't broken**
- **Match existing style**, even if you'd write it differently
- **If you notice unrelated dead code** — mention it in a comment, do not delete it

When your changes create orphans:

- **Remove** imports, variables, and functions that **your changes** made unused
- **Do not remove** pre-existing dead code unless explicitly asked

The test: *every changed line should trace directly to the user's request.*

```ts
// User asked: "add loading state to the approve button"

// ❌ wrong — you also renamed variables, reorganized imports, changed error message wording
// ✅ right — you added isLoading ref, disabled the button, nothing else changed
```

### 0.4 Goal-driven execution — define success before starting

Transform every task into verifiable goals before touching code.

| Vague | Verifiable |
|---|---|
| "Add validation" | "Write tests for invalid inputs, then make them pass" |
| "Fix the bug" | "Write a test that reproduces it, then make it pass" |
| "Refactor X" | "Ensure tests pass before and after, diff shows only internal changes" |

For multi-step tasks, state a brief plan first and get confirmation:

```
Plan for: "Add milestone rejection flow"

1. Add canTransition('milestone', status, 'rejected') guard → verify: throws on invalid state
2. Add reject action to useMilestones composable → verify: optimistic update + rollback works
3. Add RejectDialog component with reason field → verify: form validates, emits on submit
4. Wire to MilestoneActions — show only when can('reject_milestone') → verify: hidden for client before supervisor_approved

Confirm this plan before I start?
```

Strong success criteria let you loop independently.
Weak criteria ("make it work") require constant clarification.

---

## 1. Project identity

**TAMM** is a construction project management platform built as a web application.
It has three independent systems:

| System | Tech | Owned by |
|---|---|---|
| Construction management (core) | Nuxt 4 + Laravel REST API | Frontend + Laravel teams |
| Store (products) | WordPress + WooCommerce | WordPress team |
| Solar products | WordPress + WooCommerce | WordPress team |

You are responsible for the **Nuxt 4 frontend only**.
Never touch, reference, or import anything from the WordPress system.
The two systems are fully isolated — no shared state, no shared auth, no cross-calls.

---

## 2. Tech stack — locked, no alternatives

| Concern | Choice | Version |
|---|---|---|
| Framework | Nuxt | 4.x (latest stable) |
| UI layer | Vue | 3.5.x (Vue 4 does not exist yet) |
| Language | TypeScript | strict mode, no `any` |
| State management | Pinia | 3.x |
| Styling | Tailwind CSS | v4.x — CSS-first config, no tailwind.config.js |
| UI components | shadcn-vue | via `shadcn-nuxt` module |
| API calls | `$fetch` / `useFetch` | never axios |
| Forms | VeeValidate + Zod | schema-first validation |
| i18n | @nuxtjs/i18n | Arabic default (RTL), English secondary (LTR) |
| Icons | Heroicons | via `@heroicons/vue` |
| Testing | Vitest (unit) + Playwright (e2e) | — |
| Package manager | pnpm | — |

**Do not install any package not listed here without explicit approval.**
If a task seems to require a new package — stop, name the package, explain why, ask.

---

## 3. Key decisions about the stack

### Nuxt 4 — what changed from Nuxt 3
All application code lives inside the `app/` directory. This is the most important structural change:
- `app/pages/` not `pages/`
- `app/components/` not `components/`
- `app/composables/` not `composables/`
- `app/layouts/` not `layouts/`
- `app/middleware/` not `middleware/`
- `app/assets/` not `assets/`

Data fetching is improved — `useAsyncData` and `useFetch` with same key share refs.
TypeScript projects are now separated: app code, server code, shared/ folder.

### Tailwind v4 — what changed from v3
- No `tailwind.config.js` — all config lives in CSS using `@theme`
- No `@tailwind` directives — just `@import "tailwindcss"`
- No content array — auto-detects template files
- Logical properties built-in — `ms-4` = `margin-inline-start: 1rem` (RTL-safe by default)
- Config via Vite plugin: `@tailwindcss/vite` (not PostCSS)
- Colors use OKLCH color space

```css
/* app/assets/css/main.css */
@import "tailwindcss";

@theme {
  --color-primary-50: oklch(0.97 0.02 250);
  --color-primary-500: oklch(0.55 0.20 250);
  --color-primary-900: oklch(0.25 0.12 250);
  --font-sans: "Inter", sans-serif;
}
```

### shadcn-vue — how it works
- Components are **copied into your project** via CLI, not installed as a package
- They live in `app/components/ui/` — you fully own and modify them
- Install: `pnpm dlx shadcn-vue@latest add button`
- Never import from a `shadcn` package path — always `~/components/ui/`

```ts
// ✅ correct
import { Button } from '~/components/ui/button'

// ❌ never
import { Button } from 'shadcn-vue'
```

---

## 4. Project structure — follow exactly

```
tamm-frontend/
├── CLAUDE.md                        ← you are here
├── docs/
│   ├── api-contracts.md             ← API endpoints (added as Laravel delivers)
│   ├── coding-standards.md          ← detailed code rules
│   ├── status-flows.md              ← all state machines
│   └── frontend-spec.md             ← design system
├── .claude/
│   └── commands/                    ← custom slash commands
├── app/                             ← ALL application code lives here (Nuxt 4)
│   ├── assets/
│   │   └── css/
│   │       ├── main.css             ← @import "tailwindcss" + @theme tokens
│   │       └── transitions.css
│   ├── components/
│   │   ├── ui/                      ← shadcn-vue components (CLI-generated, owned by us)
│   │   ├── common/                  ← StatusTag, EmptyState, ErrorState, PageSkeleton
│   │   ├── layout/                  ← Sidebar, Topbar, NotificationBell
│   │   ├── project/                 ← ProjectCard, ProjectHeader
│   │   ├── milestone/               ← MilestoneCard, MilestoneActions, ApprovalFlow
│   │   ├── payment/                 ← EscrowBadge, PaymentStatusTag
│   │   ├── report/                  ← ReportForm, ReportViewer
│   │   └── notifications/           ← NotificationItem, NotificationDrawer
│   ├── composables/
│   │   ├── useAuth.ts
│   │   ├── useProjects.ts
│   │   ├── useMilestones.ts         ← state machine logic lives here
│   │   ├── useReports.ts
│   │   ├── usePayments.ts
│   │   ├── useNotifications.ts
│   │   ├── usePermission.ts         ← role-aware capability checks
│   │   └── __mocks__/              ← mocks for endpoints not yet available
│   ├── layouts/
│   │   ├── default.vue              ← authenticated shell
│   │   ├── admin.vue
│   │   └── auth.vue
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── role.ts
│   └── pages/
│       ├── login.vue
│       ├── dashboard.vue
│       ├── projects/
│       │   ├── index.vue
│       │   └── [id]/
│       │       ├── index.vue
│       │       └── milestones/[mid].vue
│       ├── reports/[id].vue
│       ├── admin/
│       │   ├── users.vue
│       │   └── projects.vue
│       └── 403.vue
├── server/
├── shared/
│   └── types/
│       ├── project.ts
│       ├── milestone.ts
│       ├── user.ts
│       └── api.ts
├── stores/
│   ├── auth.ts
│   ├── projects.ts
│   ├── milestones.ts
│   ├── payments.ts
│   └── notifications.ts
└── utils/
    ├── statusMachine.ts             ← valid transitions — single source of truth
    ├── permissions.ts               ← role → allowed actions map
    ├── api.ts                       ← base $fetch wrapper
    └── formatters.ts
```

---

## 5. API integration rules

### Current state
The Laravel API is **not yet available**. Endpoints are delivered incrementally.
Check `docs/api-contracts.md` before every API integration task.

### Handling missing endpoints — exact process

1. Check `docs/api-contracts.md` — is the endpoint marked ✅ Available?
2. **If yes** → implement against the contract exactly
3. **If no** → build UI + composable fully, create mock in `app/composables/__mocks__/`, add `// TODO: replace mock — <endpoint name>` comment
4. When endpoint is delivered → update `docs/api-contracts.md` first, then swap the mock

Never block progress waiting for the API.
Never assume an API shape that isn't in the contract — ask the Laravel team.

### API call rules

```ts
// ✅ always through the wrapper
const { data } = await useApi('/projects')

// ❌ never directly from a component
const data = await $fetch('/api/projects')
```

The `useApi` wrapper handles: base URL, Bearer token, 401 auto-logout, error normalization.

### Response contract

```ts
// Success:  { data: T, message?: string }
// Error:    { message: string, errors?: Record<string, string[]> }
```

---

## 6. User roles — always enforce

Exactly **6 roles** exist. No others.

| Role | Constant | Key capability |
|---|---|---|
| Super Admin | `super_admin` | Full system access |
| Admin | `admin` | Manage users + projects |
| Client | `client` | Create projects, final approval, payment |
| Contractor | `contractor` | Execute work, receive payment |
| Field Engineer | `field_engineer` | Submit reports |
| Supervisor Engineer | `supervisor_engineer` | Review reports, first-level approval |

### Permission rule — never check role strings in templates

```ts
// ✅ correct — API-driven, permission-abstracted
const { can } = usePermission()
// template: v-if="can('approve_milestone', milestone.allowedActions)"

// ❌ never — role string in template
// v-if="auth.role === 'supervisor_engineer'"
```

---

## 7. Status system — the most critical rules

All valid transitions are in `utils/statusMachine.ts`.
**Never hardcode a status string anywhere else.**

### Milestone flow
```
not_started → in_progress → under_review → supervisor_approved → approved
                                          ↘ rejected → in_progress  (auto, immediate)
```

`rejected` is **not a terminal state**. It always bounces back to `in_progress`.
Never leave a milestone visually stuck in `rejected`.

### Payment flow
```
pending_payment → paid → awaiting_approval → ready_for_payout → paid_out
```

Payment status is **derived** from milestone status — never the source of truth.

### Always validate before calling the API

```ts
import { canTransition } from '~/utils/statusMachine'

if (!canTransition('milestone', milestone.status, 'supervisor_approved')) {
  // surface this to the user — don't silently swallow it
  notify.error(t('errors.invalid_transition'))
  return
}
```

---

## 8. State management rules (Pinia)

- One store = one domain — never mix concerns
- All mutations through store actions — never directly from components
- Optimistic updates for all status changes — store first, rollback on error
- Never store derived data — use `computed` / `getters`

```ts
// ✅ optimistic update pattern — always this shape
async function approveMilestone(id: string) {
  const prev = store.getById(id).status
  store.setStatus(id, 'supervisor_approved')        // optimistic
  try {
    await useApi(`/milestones/${id}/approve`, { method: 'POST' })
  } catch {
    store.setStatus(id, prev)                        // rollback
    notify.error(t('errors.approval_failed'))
  }
}
```

---

## 9. Internationalization — RTL first

- Default locale: **Arabic (ar)** — RTL
- Secondary locale: **English (en)** — LTR
- All UI strings in `i18n/ar.json` and `i18n/en.json` — never hardcode text
- Tailwind v4 logical properties are mandatory everywhere

```vue
<!-- ✅ correct -->
<div class="ms-4 ps-2 border-s-2">...</div>

<!-- ❌ never — breaks RTL -->
<div class="ml-4 pl-2 border-l-2">...</div>
```

Logical property map:
- `ms-*` / `me-*` → replaces `ml-*` / `mr-*`
- `ps-*` / `pe-*` → replaces `pl-*` / `pr-*`
- `border-s-*` / `border-e-*` → replaces `border-l-*` / `border-r-*`
- `start-*` / `end-*` → replaces `left-*` / `right-*`
- `text-start` / `text-end` → replaces `text-left` / `text-right`

Test every layout in RTL before marking a task done.

---

## 10. shadcn-vue component rules

- shadcn-vue is the base layer for all UI primitives
- Customize by editing `app/components/ui/` directly — you own these files
- Use `cn()` from `lib/utils.ts` for all Tailwind class merging

MVP components to install:
`button`, `badge`, `card`, `dialog`, `dropdown-menu`, `form`, `input`,
`label`, `select`, `separator`, `sheet`, `skeleton`, `table`,
`tabs`, `textarea`, `toast`, `tooltip`

---

## 11. Component rules

### Every `.vue` file follows this section order

```vue
<script setup lang="ts">
// 1. imports
// 2. props + emits (TypeScript types required)
// 3. store access
// 4. composables
// 5. computed
// 6. methods
// 7. lifecycle hooks (rare — prefer useAsyncData)
</script>

<template>
  <!-- single root element -->
</template>
```

### Hard rules
- `<script setup lang="ts">` always — no Options API
- Props must be TypeScript-typed — never untyped
- No logic in templates — computed or methods only
- No `v-html` — ever
- No direct API calls from components — always through composables

---

## 12. What you must never do

| Never | Because |
|---|---|
| Start implementing without stating assumptions | Leads to wrong solution, wasted work |
| Write 200 lines when 50 would do | Overcomplication creates maintenance debt |
| Edit code outside the scope of the task | Breaks diffs, risks regressions |
| Install unlisted packages | Breaks team consistency |
| Use Options API | Project is Composition API only |
| Use `any` in TypeScript | Defeats type safety |
| Hardcode status strings outside `statusMachine.ts` | Single source of truth |
| Call API from a component directly | Always via composables |
| Use `ml-*` / `pl-*` / `left-*` / `right-*` | Breaks RTL |
| Hardcode UI text in templates | Must go through i18n |
| Check role strings in templates | Use `usePermission().can()` |
| Cross-call WordPress system | Fully isolated |
| Skip `canTransition()` before approve/reject | Invalid state transitions |
| Use `v-html` | XSS risk |
| Import shadcn from a package path | Lives in `app/components/ui/` |
| Create `tailwind.config.js` | Tailwind v4 uses CSS `@theme` |

---

## 13. Definition of done — every task

A task is complete only when **all** of the following are true:

**Behavioral (§0)**
- [ ] Assumptions were stated before implementation
- [ ] Plan was presented for multi-step tasks
- [ ] No code was changed outside the scope of the request
- [ ] Unused imports/variables created by this change are removed

**Functional**
- [ ] Feature works correctly for all relevant roles
- [ ] Status transitions validated via `canTransition()`
- [ ] Permissions checked via `usePermission().can()`
- [ ] Optimistic update + rollback implemented for mutations

**Quality**
- [ ] RTL layout tested and verified in Arabic
- [ ] All UI strings use i18n keys — no hardcoded text
- [ ] Only logical CSS properties used
- [ ] Error states handled and shown to user
- [ ] Loading states use shadcn `Skeleton` component
- [ ] TypeScript — no errors, no `any`
- [ ] No console errors or warnings
- [ ] Mock removed if endpoint is now available

---

## 14. Docs to read for specific tasks

| Task type | Read first |
|---|---|
| Any task | This file (CLAUDE.md) — especially §0 |
| API integration | `docs/api-contracts.md` |
| Status / approval flow | `docs/status-flows.md` |
| **Dashboard layout, shell, sidebar** | **`docs/design-spec.md` §3, §6** |
| **Colors, tokens, dark mode** | **`docs/design-spec.md` §1** |
| **Typography, fonts, spacing** | **`docs/design-spec.md` §2** |
| **Any UI component or primitive** | **`docs/design-spec.md` §4, §5** |
| **Per-role dashboard overview** | **`docs/design-spec.md` §7** |
| **Projects list or project detail** | **`docs/design-spec.md` §8, §9** |
| **Reports section** | **`docs/design-spec.md` §10** |
| **Payments or withdrawals** | **`docs/design-spec.md` §11** |
| **Settings page** | **`docs/design-spec.md` §12** |
| **Messages / chat** | **`docs/design-spec.md` §13** |
| **shadcn-vue configuration** | **`docs/design-spec.md` §14** |
| Code patterns | `docs/coding-standards.md` |
| User story details | `_bmad-output/planning-artifacts/epic-*.md` |

---

*Stack: Nuxt 4.x · Vue 3.5.x · Tailwind CSS 4.x · shadcn-vue · Pinia 3.x*
*Behavioral guidelines adapted from Karpathy's LLM coding principles.*
*Last updated: MVP v1.0 — Frontend team*
*Any changes to this file must be reviewed and approved by the team lead.*

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **tamm-app** (6742 symbols, 8456 relationships, 36 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/tamm-app/context` | Codebase overview, check index freshness |
| `gitnexus://repo/tamm-app/clusters` | All functional areas |
| `gitnexus://repo/tamm-app/processes` | All execution flows |
| `gitnexus://repo/tamm-app/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
