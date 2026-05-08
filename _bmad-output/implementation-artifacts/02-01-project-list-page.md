# Story 02-01 — Project List Page

**Status:** ready-for-dev  
**Epic:** 02 — Project Management  
**Story ID:** 2.1  
**Priority:** 🔴 CRITICAL — MVP foundational  
**Complexity:** Medium  
**Estimated Effort:** 6–8 hours  

---

## 📋 User Story

**As a** user,  
**I want to** see all projects relevant to my role,  
**so that** I can track what I'm responsible for.

---

## ✅ Acceptance Criteria

- [ ] Route: `/projects` with breadcrumb/navigation
- [ ] Page title: uses i18n key `pages.projects` (already added in stories 01-03, 01-04)
- [ ] Fetches projects via `GET /projects` (filtered server-side by role)
- [ ] Renders `ProjectCard` component for each project
- [ ] Shows 3 skeleton cards while loading (using shadcn `Skeleton`)
- [ ] Shows `EmptyState` when no projects exist
- [ ] Shows `ErrorState` with retry button when fetch fails
- [ ] Client role only: shows "Create project" button (Story 02-02 dialog, not built yet)
- [ ] Other roles: no "Create project" button visible
- [ ] Cards are clickable links to `/projects/:id` (Story 02-03, not built yet)
- [ ] Status badge on each card reflects current project status
- [ ] Progress bar shows milestone completion ratio (hidden when no milestones yet)
- [ ] Currency amounts formatted with `formatCurrency()` (hidden when no milestones yet)
- [ ] Page is responsive: 1 column mobile, 2 columns on desktop
- [ ] RTL layout verified in Arabic

### Role-Specific Behavior

| Role | View | Filters | Notes |
|------|------|---------|-------|
| `client` | Own projects only | None | Shows "Create project" button |
| `contractor` | Projects where assigned | None | Read-only |
| `field_engineer` | Assigned projects | None | Read-only |
| `supervisor_engineer` | Assigned projects | None | Read-only |
| `admin` / `super_admin` | All projects | Status tabs (All / Active / Pending / Completed / On Hold) | Filter tabs optional for first build |

---

## 🏗️ Developer Context

### Architecture & Tech Stack Requirements

**Framework & Stack (Locked — from CLAUDE.md §2):**
- Nuxt 4.x (all code in `app/` directory)
- Vue 3.5.x — `<script setup lang="ts">` only
- TypeScript — strict mode, no `any`
- Tailwind CSS v4.x — CSS-first, logical properties (`ms-*`, `start-*`, `ps-*`, `pe-*`)
- shadcn-vue: `Button`, `Card`, `Skeleton`, `Tabs` (for admin filter tabs, optional)
- Heroicons for icons (not needed for this story yet)
- Pinia — auth store already populated from stories 01-01 to 01-04
- i18n — all text from `i18n/ar.json` and `i18n/en.json`
- `$fetch` / `useFetch` — never axios

**Never Use:**
- Options API, `any` types, hardcoded strings
- Physical CSS directions (`ml-*`, `mr-*`, `left-*`, `right-*`) — breaks RTL
- Direct API calls from component — always via composables

---

### Current Project State (From Stories 01-01 to 01-04)

**Auth Store Status (✅ Complete):**
- `useAuthStore()` fully initialized with user data
- User object has: `id`, `name`, `email`, `phone`, `role`, `status`, `avatar_url`
- Auth middleware (`auth.ts`) ensures all protected routes require authentication
- Role middleware (`role.ts`) protects routes per `definePageMeta({ roles: [...] })`
- `/403` page exists for unauthorized access
- Topbar component with logout exists in `app/layouts/default.vue`

**i18n Status (✅ From Stories 01-02, 01-03, 01-04):**
- Both `i18n/ar.json` and `i18n/en.json` have:
  - `pages.projects` key
  - `errors.forbidden` and `errors.access_denied`
  - `roles.*` translations for all 6 roles
  - `common.*` keys (logout, back to home, etc.)
- Arabic is default (RTL), English is secondary (LTR)

**Component Patterns (✅ From Stories 01-01 to 01-04):**
- Layout pattern: `app/layouts/default.vue` is authenticated shell with Topbar
- Form pattern: shadcn-vue Form + VeeValidate + Zod (from login)
- Loading states: skeleton cards (from design-spec §5.6)
- Error states: `ErrorState` component (from design-spec §5.7)
- Status badges: `Pill` component with tone mapping (from design-spec §1.4)

---

### Files Affected

**NEW FILES:**
- `app/pages/projects/index.vue` — project list page
- `app/components/project/ProjectCard.vue` — reusable card component
- `app/composables/useProjects.ts` — project state and API logic
- `tests/pages/projects.spec.ts` — e2e tests for list page
- `tests/unit/composables/useProjects.spec.ts` — unit tests for composable

**MODIFIED FILES:**
- None expected — this is a standalone feature

---

### API Contract (From `docs/api-contracts.md`)

**Endpoint:** `GET /projects`  
**Status:** ❌ NOT YET AVAILABLE  
**Expected Response:**
```json
{
  "data": [
    {
      "id": "proj-123",
      "name": "Villa Project A",
      "description": "Modern villa in New Cairo",
      "city": "Cairo",
      "area_m2": 400,
      "budget": 250000,
      "currency": "EGP",
      "status": "active",
      "contractor_id": "cont-456",
      "contractor_name": "Elite Builders",
      "created_at": "2026-04-15T10:30:00Z",
      "completed_milestones": 2,
      "total_milestones": 5
    }
  ],
  "message": "Projects retrieved successfully"
}
```

**ACTION:** Since endpoint is not available, build UI + composable fully and create mock at `app/composables/__mocks__/useProjects.ts`. Add comment: `// TODO: replace mock — GET /projects endpoint`. When backend delivers, replace mock and update contract file.

---

### Design System Requirements

**From `docs/design-spec.md §8` (Projects List):**

**Page Layout:**
- Page header with title `pages.projects` + optional CTA
- Grid container: `grid gap-4 lg:grid-cols-2` (1 col mobile, 2 col desktop)
- Empty state when no projects: dashed border pattern (§5.7)
- Loading skeleton: 3 ghost cards (§5.6)

**ProjectCard Visual (§8.2):**
```css
rounded-2xl border border-border bg-card p-5 shadow-card
hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elevated
transition-all duration-200
```

**Card Content (top to bottom):**
1. **Project name:** `text-base font-extrabold text-ink`
2. **Status pill:** `Pill` component, tone mapped from status (§1.4 tone map):
   - `new` → `default` tone
   - `active` → `success` tone
   - `completed` → `success` tone
   - `on_hold` → `warning` tone
3. **Metadata row:** city + budget, `text-xs text-muted-foreground flex items-center gap-2`
4. **Progress bar (§5.8):** shown only when milestones exist
5. **Bottom row:** contractor name (if assigned) + "عرض التفاصيل" / "View details" link, `text-xs font-bold text-primary`

**Admin Filter Tabs (Optional for first release):**
- If implementing: use shadcn-vue `Tabs` above grid
- Options: All / Active / Pending / Completed / On Hold
- Tab content dynamically filtered (client-side or server-side TBD)

**RTL Notes:**
- Project card text: `text-start` (RTL-safe)
- Status pill: `inline-flex` (no directional dependency)
- Progress bar: uses Tailwind logical properties (not `left-*` / `right-*`)
- Avatar in contractor name: `ms-*` for margin-inline-start (RTL-safe)

---

### Data Shapes

**ProjectCard Props:**
```ts
interface Project {
  id: string
  name: string
  description: string
  city: string
  area_m2: number
  budget: number
  currency: string
  status: 'new' | 'open_for_bids' | 'under_review' | 'contractor_selected' | 'active' | 'on_hold' | 'completed'
  contractor_id?: string
  contractor_name?: string
  created_at: string
  completed_milestones: number
  total_milestones: number
}
```

**useProjects Composable Return:**
```ts
const projects = ref<Project[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const fetchProjects = async () => { ... }
const retryFetch = () => fetchProjects()
```

---

### Implementation Approach

**Step 1: Create `useProjects` composable**
- Define `Project` type in `shared/types/project.ts`
- Implement `useProjects()` with `fetchProjects()` function
- Create mock at `app/composables/__mocks__/useProjects.ts` (5-10 mock projects)
- Mock returns role-filtered results:
  - `client`: 2-3 projects they created
  - `contractor`: 1-2 projects where they're assigned
  - `field_engineer`: 1-2 projects where they're assigned
  - `admin`: all 10 mock projects

**Step 2: Create `ProjectCard` component**
- Receive `project: Project` as prop
- Render status pill with `cn()` for conditional styling
- Format currency with `formatCurrency()`
- Calculate progress ratio: `completed_milestones / total_milestones`
- Show progress bar only if `total_milestones > 0`
- Link to `/projects/:id` (page not built yet, but link is harmless)
- No logic in template — use computed properties

**Step 3: Create `/projects` page**
- Use `default` layout (includes Topbar)
- Define page meta: `definePageMeta({ roles: ['client', 'contractor', 'field_engineer', 'supervisor_engineer', 'admin', 'super_admin'] })`
- Call `useProjects().fetchProjects()` on mount
- Render 3 `Skeleton` cards while `loading.value === true`
- Render `EmptyState` if `projects.length === 0`
- Render `ErrorState` with retry if `error.value` is set
- Render ProjectCards in grid: `grid gap-4 lg:grid-cols-2`
- Client role only: show "Create project" button (disabled, Story 02-02 not built yet)

**Step 4: Handle loading states**
- Loading: `Skeleton` component (from shadcn-vue, already available)
- Error retry: `ErrorState` component with retry button calling `fetchProjects()`
- Async state: `useAsyncData('projects', () => useProjects().fetchProjects())`

**Step 5: Test RTL**
- Test in Arabic locale
- Verify: card text direction, progress bar fill, button alignment
- No physical directions in CSS

---

### Previous Story Intelligence

**Story 01-04 (Topbar User Menu — ✅ Complete in Review):**
- Established page layout pattern: `default` layout with Topbar
- Established i18n pattern: all text via keys
- Established authentication pattern: all routes require `auth` middleware
- Established role-based access pattern: `definePageMeta({ roles: [...] })`

**Learning from 01-03 + 01-04:**
- Role utilities (`getHomePageForRole()`) already exist in `app/utils/roleRoutes.ts`
- Permission checks should use `usePermission()` composable (from story 01-03)
- Status mapping exists in `utils/statusMachine.ts` for milestone states, need similar for projects

**Common Issues Found & Solved:**
- Logical properties mandatory (`ms-*` not `ml-*`)
- i18n keys must match exactly (typo in key = blank text)
- Skeleton states important for perceived performance

---

### Git Insights (Last 5 Commits)

**Recent Patterns:**
1. `fc707e2` (stories 01-03, 01-04): New page components + middleware
   - Files created: `app/pages/403.vue`, `app/layouts/default.vue`, `app/components/layout/Topbar.vue`
   - Pattern: pages live in `app/pages/`, layouts in `app/layouts/`, components in `app/components/`
   - Middleware registered in `app/middleware/`
2. `c149a50` (story 01-02): Store mutations + i18n additions
   - Pattern: auth store mutations are functions calling `const { ... } = useApi()`
   - i18n: both `ar.json` and `en.json` updated in parallel
3. `63893bf` (story 01-01): Initial auth flow
   - Pattern: shadcn-vue Form + VeeValidate setup established

**Actionable Takeaway:** Follow established file structure (app/ subdirectories). Composables at `app/composables/`, not `composables/`. Keep tests parallel: `tests/` for e2e, `tests/unit/` for unit.

---

### Testing Strategy

**Unit Tests (`tests/unit/composables/useProjects.spec.ts`):**
- Mock `useApi` to return mock data
- Test `fetchProjects()` updates `projects.value`
- Test `error.value` set on API failure
- Test `loading.value` toggled during request
- Test role-filtered results (via mock)

**E2E Tests (`tests/pages/projects.spec.ts`):**
- Navigate to `/projects`
- Verify page title renders
- Verify skeleton cards shown while loading
- Verify project cards render with correct data
- Verify "Create project" button visible for client only
- Verify error retry works
- Test RTL layout (if playwright supports)

**Manual Testing Checklist:**
- [ ] Login as `client` — see own projects + "Create project" button
- [ ] Login as `contractor` — see assigned projects, no button
- [ ] Login as `admin` — see all projects (optionally with filter tabs)
- [ ] Verify no console errors or warnings
- [ ] Test in Arabic and English
- [ ] Test on mobile, tablet, desktop
- [ ] Verify links don't 404 (pages not built yet)

---

### Component Dependencies

**shadcn-vue Components Already Installed (from 01-01 to 01-04):**
- `Button`
- `Card`
- `Skeleton`
- `DropdownMenu`

**New Components Needed (install via CLI):**
- None! All dependencies already available.

**Internal Component Dependencies:**
- `Pill` component (from design-spec, used for status badges) — likely already exists in `app/components/common/`
- `EmptyState` component — verify exists in `app/components/common/`
- `ErrorState` component — verify exists in `app/components/common/`

If any are missing, create minimal stubs first (under 100 lines each).

---

### No Blocking Dependencies

✅ Auth system ready (stories 01-01 to 01-04 complete)  
✅ Layout shell ready (`default` layout from 01-04)  
✅ i18n system ready (keys added in 01-03, 01-04)  
✅ Role middleware ready (01-03)  
✅ Design system available (colors, typography, spacing via Tailwind)  

⚠️ Backend endpoint `GET /projects` NOT YET AVAILABLE — use mock  
⚠️ Project detail page (`/projects/:id`) not built yet — links are safe (page will be built in 02-03)  
⚠️ Create project dialog not built yet — button disabled/hidden for now (02-02)

---

### Definition of Done

A story is complete when:

**Behavioral (CLAUDE.md §0):**
- [ ] Assumptions stated explicitly before implementation
- [ ] No code outside scope of this story
- [ ] Unused imports/variables removed

**Functional:**
- [ ] All acceptance criteria verified
- [ ] Role-specific behavior tested (all 6 roles)
- [ ] Permissions checked via `usePermission().can()` (not hardcoded roles)
- [ ] Optimistic update + rollback pattern (not applicable here, but if implemented later)

**Quality:**
- [ ] RTL layout tested and verified in Arabic
- [ ] All UI strings use i18n keys — no hardcoded text
- [ ] Only logical CSS properties used (`ms-*`, `text-start`, etc.)
- [ ] Error states handled and shown to user
- [ ] Loading states use `Skeleton` component
- [ ] TypeScript — no errors, no `any`
- [ ] No console errors or warnings
- [ ] Mock removed comment added: `// TODO: replace mock — GET /projects`

---

## 📝 Notes for Developer

**Start Here:**
1. Read `docs/design-spec.md §8` (Projects List) for visual spec
2. Read `docs/status-flows.md §1` (Project statuses) to understand states
3. Check `app/utils/statusMachine.ts` for status enums
4. Verify `Pill` and `EmptyState` components exist

**Key Decisions Made:**
- Admin filter tabs deferred (optional for MVP) — can be added in second pass
- Client "Create project" button disabled visually (story 02-02 builds the dialog)
- Currency formatting uses `formatCurrency()` utility — verify it exists or create simple wrapper

**Tricky Parts:**
- Mock must return role-filtered results — not all projects to all users
- Progress calculation: only show if `total_milestones > 0`
- Status tone mapping: use same map as design-spec §1.4

---

## ✨ Status

- **Story Status:** ready-for-dev
- **Analysis Completed:** 2026-05-08
- **Ready for:** `bmad-dev-story` agent
- **Next Step:** Implement, test, then run `/bmad-code-review` before marking done

