# AGENTS.md — TAMM Frontend AI Configuration

> **Single source of truth for all AI coding tools**
> 
> Used by: Claude Code, Cursor, Copilot, OpenCode, and other AI agents.  
> For deeper TAMM context, see [CLAUDE.md](./CLAUDE.md).  
> Last updated: 2026-05-07

---

## 1. Behavioral Guidelines (Karpathy Principles)

These rules prevent the most common AI coding mistakes. Follow them before every task.

### 1.1 Think Before Coding

Before writing a single line:
- **State assumptions explicitly** — if uncertain about scope, ask
- **If multiple interpretations exist, present them** — never pick silently
- **If a simpler approach exists, say so** — push back when overcomplicated
- **If something is unclear, stop** — name exactly what is confusing

```
❌ Assume the task means X and implement quietly
✅ "I'm reading this as X. If you mean Y, let me know before I start."
```

### 1.2 Simplicity First

Minimum code that solves the problem. Ask: *"Would a senior engineer say this is overcomplicated?"*

- No features beyond what was asked
- No abstractions for single-use code
- No "flexibility" or "configurability" not requested
- No error handling for impossible scenarios
- If you write 200 lines and it could be 50 — rewrite it

### 1.3 Surgical Changes

When editing existing code:
- **Do not "improve" adjacent code** you weren't asked to touch
- **Do not refactor things that aren't broken**
- **Match existing style**, even if you'd write it differently
- **Never remove pre-existing dead code** unless explicitly asked

When your changes create orphans:
- **Remove** imports/variables/functions **your changes** made unused
- **Do not remove** pre-existing dead code

The test: *every changed line should trace directly to the user's request.*

### 1.4 Goal-Driven Execution

Transform every task into verifiable goals before touching code.

| Vague | Verifiable |
|---|---|
| "Add validation" | "Write tests for invalid inputs, then make them pass" |
| "Fix the bug" | "Write a test that reproduces it, then make it pass" |
| "Refactor X" | "Ensure tests pass before and after, diff shows only internal changes" |

For multi-step tasks, present a brief plan first and get confirmation.

---

## 2. Tech Stack — Locked, No Alternatives

| Concern | Choice | Version |
|---|---|---|
| Framework | Nuxt | 4.x (latest stable) |
| UI layer | Vue | 3.5.x |
| Language | TypeScript | strict mode, no `any` |
| State management | Pinia | 3.x |
| Styling | Tailwind CSS | v4.x — CSS-first config, no tailwind.config.js |
| UI components | shadcn-vue | via `shadcn-nuxt` module |
| API calls | `$fetch` / `useFetch` | never axios |
| Forms | VeeValidate + Zod | schema-first validation |
| i18n | @nuxtjs/i18n | Arabic (RTL) default, English secondary |
| Icons | Heroicons | via `@heroicons/vue` |
| Testing | Vitest (unit) + Playwright (e2e) | — |
| Package manager | pnpm | — |

**Do not install any package not listed above without explicit approval.**

---

## 3. Never Do / Always Do

### Never

| Rule | Why |
|---|---|
| Start without stating assumptions | Leads to wrong solution, wasted work |
| Write 200 lines when 50 would do | Creates maintenance debt |
| Edit code outside the scope of the request | Breaks diffs, risks regressions |
| Install unlisted packages | Breaks team consistency |
| Use `any` in TypeScript | Defeats type safety |
| Hardcode status strings outside `statusMachine.ts` | Single source of truth |
| Call API from component directly | Always via composables |
| Use `ml-*` / `pl-*` / `left-*` / `right-*` CSS | Breaks RTL layout |
| Hardcode UI text in templates | Must use i18n |
| Check role strings in templates | Use `usePermission().can()` |
| Cross-call WordPress system | Fully isolated |
| Skip `canTransition()` before approve/reject | Invalid state transitions |
| Use `v-html` | XSS risk |
| Import shadcn from package path | Import from `~/components/ui/` |
| Create `tailwind.config.js` | Tailwind v4 uses CSS `@theme` only |

### Always

- Check RTL layout in Arabic before marking done
- Validate status transitions via `canTransition()`
- Use `usePermission().can()` not role checks
- Implement optimistic updates + rollback for mutations
- Import shadcn from `~/components/ui/`
- Use logical CSS properties (`ms-*`, `ps-*`, `text-start`, etc.)
- Remove unused imports/functions **you created**
- Match existing code style exactly
- State assumptions before implementing

---

## 4. TAMM Project Context

### What is TAMM?

**Construction project management platform** — three independent systems:

| System | Tech | Scope |
|---|---|---|
| Construction management (core) | Nuxt 4 + Laravel REST API | ← You are here |
| Store (products) | WordPress + WooCommerce | Separate, never touch |
| Solar products | WordPress + WooCommerce | Separate, never touch |

### Nuxt 4 Structure

All code lives inside `app/` directory:

```
app/
├── pages/          ← Route pages
├── components/     ← Vue components (ui/, common/, layout/, project/, etc.)
├── composables/    ← Business logic, API calls, state management
├── layouts/        ← Page layouts
├── middleware/     ← Route guards
└── assets/css/    ← Tailwind CSS entry point
```

### User Roles (6 total)

| Role | Constant | Key capability |
|---|---|---|
| Super Admin | `super_admin` | Full system access |
| Admin | `admin` | Manage users + projects |
| Client | `client` | Create projects, final approval, payment |
| Contractor | `contractor` | Execute work, receive payment |
| Field Engineer | `field_engineer` | Submit reports |
| Supervisor Engineer | `supervisor_engineer` | Review reports, first-level approval |

**Never hardcode role checks in templates.** Use `usePermission().can()` instead.

### Status System (Critical)

All valid transitions are in `utils/statusMachine.ts`. Never hardcode status strings.

**Milestone flow:**
```
not_started → in_progress → under_review → supervisor_approved → approved
                                           ↘ rejected → in_progress (auto, immediate)
```

`rejected` is NOT terminal — always bounces back to `in_progress`. Never leave a milestone stuck in `rejected`.

Always validate before calling the API:

```ts
import { canTransition } from '~/utils/statusMachine'

if (!canTransition('milestone', milestone.status, 'supervisor_approved')) {
  notify.error(t('errors.invalid_transition'))
  return
}
```

### State Management (Pinia)

- One store = one domain — never mix concerns
- All mutations through store actions — never directly from components
- Optimistic updates for all status changes — store first, rollback on error
- Never store derived data — use `computed` / `getters`

Optimistic update pattern (always this shape):

```ts
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

### API Integration Rules

Check `docs/api-contracts.md` before every API task.

**Handling missing endpoints:**
1. Is the endpoint in `docs/api-contracts.md` marked ✅ Available?
2. **If yes** → implement against the contract exactly
3. **If no** → build UI + composable fully, create mock in `app/composables/__mocks__/`, add `// TODO: replace mock — <endpoint name>` comment

Never block progress waiting for the API. Never assume an API shape not in the contract.

**API calls always go through composables:**

```ts
// ✅ correct
const { data } = await useApi('/projects')

// ❌ never directly
const data = await $fetch('/api/projects')
```

The `useApi` wrapper handles: base URL, Bearer token, 401 auto-logout, error normalization.

**Response contract:**
```ts
// Success:  { data: T, message?: string }
// Error:    { message: string, errors?: Record<string, string[]> }
```

### Internationalization (RTL First)

- Default locale: **Arabic (ar)** — RTL
- Secondary locale: **English (en)** — LTR
- All UI strings in `i18n/ar.json` and `i18n/en.json` — never hardcode text

**Tailwind v4 logical properties are mandatory everywhere:**

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

**Test every layout in RTL (Arabic) before marking done.**

### shadcn-vue Components

- Components are copied into your project (not a package dependency)
- They live in `app/components/ui/` — you own and modify them
- Install: `pnpm dlx shadcn-vue@latest add button`

**Always import from your local copy:**

```ts
// ✅ correct
import { Button } from '~/components/ui/button'

// ❌ never
import { Button } from 'shadcn-vue'
```

---

## 5. Context7 CLI — Library Documentation

Use `ctx7` to fetch current documentation whenever you ask about a library, framework, SDK, API, CLI tool, or cloud service — even well-known ones like React, Next.js, Prisma, Express, Tailwind, Django, or Spring Boot.

**When to use:** API syntax, configuration, version migration, library-specific debugging, setup instructions, CLI tool usage.

**When NOT to use:** Refactoring, writing scripts, debugging business logic, code review, general programming concepts.

**Steps:**

1. Resolve library: `npx ctx7@latest library "<name>" "<question>"`
   - Use official names (e.g., "Next.js" not "nextjs", "Customer.io" not "customerio")

2. Pick best match (ID format: `/org/project`)
   - Prefer: exact name match, code snippet count, reputation, benchmark score

3. Fetch docs: `npx ctx7@latest docs <libraryId> "<question>"`
   - Use the full question — specific queries return better results

4. Answer using the fetched documentation

**Quota errors:** Run `npx ctx7@latest login` or set `CONTEXT7_API_KEY` env var. Never silently fall back to training data.

---

## 6. Definition of Done

A task is complete **only when all** of the following are true:

**Behavioral (§1)**
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

## 7. Further Reading

For deeper context on TAMM-specific topics:

| Topic | Location |
|---|---|
| Full project architecture | [CLAUDE.md](./CLAUDE.md) §1-4 |
| API contracts & endpoints | [docs/api-contracts.md](./docs/api-contracts.md) |
| Status machine flows | [docs/status-flows.md](./docs/status-flows.md) |
| Component & styling guide | [docs/frontend-spec.md](./docs/frontend-spec.md) |
| Code patterns & conventions | [docs/coding-standards.md](./docs/coding-standards.md) |
| User stories & epics | [docs/stories/](./docs/stories/) |

---

## How This File Is Used

- **Claude Code**: Reads this first, then optionally reads [CLAUDE.md](./CLAUDE.md) for full context
- **Cursor**: Reads this for linting rules, refactoring safety, type enforcement
- **Copilot**: Reads this for autocomplete hints, context, and project constraints
- **OpenCode**: Reads this for agent role definitions and project scope
- **Other AI agents**: Read this as the canonical instruction source

---

## Questions?

- "What are the never/always rules?" → See §3
- "How does auth work?" → See [CLAUDE.md](./CLAUDE.md) or ask
- "What status transitions are valid?" → See [docs/status-flows.md](./docs/status-flows.md)
- "How do I add a shadcn component?" → See §4 (shadcn-vue Components)
- "How do I integrate an API endpoint?" → See §4 (API Integration Rules) or [docs/api-contracts.md](./docs/api-contracts.md)

*Stack: Nuxt 4.x · Vue 3.5.x · Tailwind CSS 4.x · shadcn-vue · Pinia 3.x · Laravel REST API*  
*Behavioral guidelines adapted from Karpathy's LLM coding principles.*
