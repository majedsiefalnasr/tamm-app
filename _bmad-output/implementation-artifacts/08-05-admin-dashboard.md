# Story 08.5 — Admin Dashboard (Epic 08 merge)

**Status:** done  
**Epic:** 08 — Role-Based Dashboards  
**Story key:** `08-05-admin-dashboard`  
**Priority:** High — admin / super_admin home surface  
**Complexity:** Medium–High (brownfield gap-fill on existing 06-05 implementation)  
**Estimated effort:** 12–18 hours  
**Created:** 2026-05-10  
**Dependencies:** Story 06-05 (baseline UI + `useAdminDashboard`), proposals/project flows (Epic 07), payments/release semantics (Epic 04), `docs/design-spec.md` §7.5

---

## Clarifications (read first)

1. **Route:** **`/admin/dashboard`** only — Epic 08-05 explicitly keeps this route and **merges** requirements from Story 06-05 (`_bmad-output/planning-artifacts/epic-08-dashboards.md` Story 08-05 note). Do **not** relocate admin home to `/dashboard/*`.
2. **Brownfield:** `app/pages/admin/dashboard.vue`, `useAdminDashboard`, `app/components/admin/Dashboard*.vue`, `shared/types/admin.ts`, and `app/composables/__mocks__/admin-dashboard.ts` already exist from **06-05**. This story is **gap analysis + extension**, not a greenfield page.
3. **Design vs epic wording:** `docs/design-spec.md` §7.5 lists **platform stats** (active projects, registered contractors, total tracked SAR, open disputes) and **three urgent banners** including **pending report reviews**. Epic 08-05 AC text lists a **different** stat row (pending milestones review, payments ready for release, contractor-selection backlog, new users this month). **Implement Epic 08-05 acceptance criteria** while preserving visual parity with §7.5 where possible (StatCard pattern, tones per §5.1). Where KPIs differ, prefer **epic + actionable deep-links**; retain §7.5-only metrics only if they fit without crowding (e.g. secondary row, collapsible “platform overview”, or coordinated PM decision — default: **one cohesive stats grid** that satisfies epic ACs first).
4. **Broken / risky links:** `DashboardBanners` links to `/admin/payments?status=awaiting_release`, but under `app/pages/` there is **no** `admin/payments` route today (payments live at `app/pages/payments.vue`). **Resolve links** in this story to real routes and query conventions used elsewhere (`roleRoutes`, existing admin/projects/users filters).
5. **`recent_events`:** Already modeled on `DashboardSummary` and populated in mock — **not rendered** on `dashboard.vue`. Wiring the **Recent activity feed** is in-scope for Epic 08-05.
6. **Super Admin:** Conditional UI depends on backend/API — use `GET /admin/permissions` or dashboard payload flags only if present in `docs/api-contracts.md`; otherwise **mock + TODO** with explicit coordination note.

---

## User story

**As an** admin,  
**I want** a high-level overview of platform activity and clear queues for urgent work,  
**so that** I can quickly see what needs attention across projects, payments, and onboarding without drilling randomly.

---

## Acceptance criteria

### Route & access

- [x] **`/admin/dashboard`** remains the admin/super_admin landing surface (`definePageMeta` roles unchanged).
- [x] Non-admin roles receive existing auth/role behavior (403 / redirect per middleware).

### Summary cards (top row — Epic 08-05)

Implement a **summary stats row** (StatCard / existing `DashboardStats` pattern) such that each card **deep-links** correctly:

- [x] **Total active projects** → `/admin/projects` (or equivalent) with **`status=active`** filter applied consistently with `admin/projects` implementation.
- [x] **Milestones pending review** → admin projects view filtered to milestones/projects in **`under_review`** (or dedicated queue route if one exists — document chosen URL).
- [x] **Payments ready for release** → payment release queue (correct route + query; align with milestone payment state **`ready_for_payout`** / escrow release UX from Epic 04).
- [x] **Projects awaiting contractor selection** → `/admin/projects?status=under_review` **only if** that status matches the domain model used in codebase for post–proposal-review states; otherwise use the **actual** project status key used after bidding closes (verify against `utils/statusMachine`, stores, Epic 07).
- [x] **New users this month** → `/admin/users` with filter if supported (month scope may be UI-only label until API provides count).

- [x] **Skeleton** state for all summary cards while loading — never blank blocks.
- [x] **RTL** + logical Tailwind only (`ms-*`, `ps-*`, `text-start`, …).

### Action queues section (Epic 08-05)

Below banners/stats, add an **Action queues** region listing actionable rows (table or stacked cards):

- [x] Projects in **`new`** (or equivalent “needs bid opened”) with **primary CTA** (e.g. open bidding / invite — reuse flows from Epic 07).
- [x] Projects in **`contractor_selected`** needing **engineer assignment or activation** — CTA to assignment / activation entry point (Story 07-06 patterns).
- [x] Milestones **`approved`** with payment **`ready_for_payout`** needing **release** — CTA to release action or filtered payments view.

Each row: entity label, short status context, **direct action** (button), not “navigate away blindly” only.

- [x] **Empty states** per queue when no items (i18n).
- [x] Data via **`useAdminDashboard`** extended shape **or** composed composables — **no `$fetch` in dumb components**.

### Urgent banners alignment (`design-spec.md` §7.5 + epic)

- [x] Keep **conditional banner row**; extend so **pending report reviews (cross-project)** is represented if API/mock provides count (new `urgent_actions.pending_reports` or reuse milestones aggregate — mirror API contract after updating `docs/api-contracts.md`).
- [x] Ensure banner CTAs use **valid routes**.

### Recent activity feed (Epic 08-05)

- [x] **Last 10** platform events — use `recent_events` from dashboard payload (extend union type if new event kinds needed: contractor selected, bid opened, etc.).
- [x] Each line: icon by type, description (`title` + optional secondary), related project/user name if available, **`formatDate(timestamp)`**.
- [x] Skeleton subsection while loading.

### Optional design-spec §7.5 remainder

- [x] **Activity area chart** — already `DashboardActivity`; keep wired.
- [x] **Projects table** — already `DashboardProjects`; verify columns match §7.5 (name, city, owner, progress, status, view).
- [x] **Disputes** — already `DashboardDisputes`; verify **Mediate** action routes correctly.

### Super Admin

- [x] **Additional card/section** when `super_admin`: pending admin-level permission escalations or system flags **if** backend contract exists; else placeholder behind feature flag / mock + `// TODO: replace mock — admin dashboard super-admin flags`.

### Quality

- [x] All strings in **`i18n/locales/ar.json`** + **`i18n/locales/en.json`** under `admin.dashboard.*` (extend existing keys).
- [x] TypeScript strict, no `any`; extend `shared/types/admin.ts` + mock + API contract together.
- [x] Update **`docs/api-contracts.md`** `GET /admin/dashboard` for any new fields (`action_queues`, extra `summary_stats`, `urgent_actions.pending_reports`, expanded `recent_events.type`).

---

## Tasks / subtasks

- [x] Audit **Epic 08-05 vs current UI** — checklist gap doc in PR description (stats, queues, feed, banners).
- [x] Fix **stat cards** + links + grid responsiveness (`DashboardStats` may need >4 cards or two rows).
- [x] Add **`DashboardActionQueues.vue`** (or similar) + types + mock data + composable mapping.
- [x] Add **`DashboardRecentActivity.vue`** consuming `recent_events` (limit 10, icons).
- [x] Extend **`DashboardBanners`** + `UrgentAction` type for pending reviews if required.
- [x] Align **`GET /admin/dashboard`** contract + `useAdminDashboard` parsing + `USE_MOCK` path.
- [x] **Super admin** conditional block.
- [x] i18n AR (primary RTL) + EN; manual RTL pass.
- [x] Vitest/unit for composable mappers (optional); update **`e2e/admin-dashboard.spec.ts`** if selectors change.

---

## Developer context

### Existing building blocks (reuse / extend)

| Asset | Path | Notes |
| --- | --- | --- |
| Page shell | `app/pages/admin/dashboard.vue` | Add Recent Activity + Action Queues sections |
| Data composable | `app/composables/useAdminDashboard.ts` | Extend computed stats; expose queues/events |
| Types | `shared/types/admin.ts` | Extend `DashboardSummary`, `RecentEvent`, `UrgentAction` |
| Mock | `app/composables/__mocks__/admin-dashboard.ts` | Reflect API shape |
| Banners | `app/components/admin/DashboardBanners.vue` | Optional 4th banner |
| Stats | `app/components/admin/DashboardStats.vue` | May need icon map / grid cols for 5+ cards |
| Chart / projects / disputes | `DashboardActivity`, `DashboardProjects`, `DashboardDisputes` | Verify §7.5 |

### Architecture compliance

- Nuxt 4 — pages under `app/pages/`; composables own API.
- No new npm packages without approval.
- Status/project enums — use **`statusMachine`** / shared types; no magic strings for transitions.
- **`usePermission` / `allowed_actions`** where actions depend on capability (open bids, assign engineers, release payment).

### Testing notes

- Extend **`e2e/admin-dashboard.spec.ts`** for new sections (`data-testid` hooks).
- After API switch (`VITE_API_READY`), verify timeout + abort behavior unchanged.

---

## Previous story intelligence (08-04)

From **`08-04-supervisor-engineer-dashboard.md`**:

- Keep dashboard pages **thin**; orchestrate in **container components** + composables.
- **`useAsyncData` / shared cache keys** where mirroring counts with another page — admin dashboard is hub; avoid duplicate fetches where one keyed fetch suffices.
- Section-level **error + retry** patterns match other dashboards.
- i18n namespaces: supervisor used `dashboard.supervisor.*`; admin should stay under **`admin.dashboard.*`** for consistency with existing admin copy.

---

## Git intelligence (recent commits)

Recent work on role dashboards and reviews (commits like `949b63b`, `f92ffe2`, `e0637c0`). Prefer **small scoped commits** per concern (stats, queues, activity).

---

## Latest tech notes

- Tailwind v4 logical properties mandatory for RTL.
- **`formatCurrency` / `formatDate`** from project utilities for displayed numbers/dates.

---

## Project context reference

- `AGENTS.md`, `CLAUDE.md` — composable-only API, i18n, roles.
- `docs/design-spec.md` §3 shell, §5 primitives, **§7.5 Admin overview**.
- `docs/status-flows.md` — project/milestone/payment states for filters and CTAs.
- `docs/api-contracts.md` — `GET /admin/dashboard` (must stay in sync).

---

## Open questions (for PO / backend — do not block mock-first)

1. Canonical **project status** string for “awaiting contractor selection” vs **`under_review`** in epic text — confirm against Laravel domain.
2. Whether **payment release queue** is admin-only route or shared **`/payments`** with role filter.

---

### Review Findings

- [x] [Review][Patch] Unused Lucide icons in admin stats grid [`DashboardStats.vue`] — removed dead `Users` / `TrendingUp` imports after KPI redesign.
- [x] [Review][Defer] Admin disputes routes (`/admin/disputes`, `/admin/disputes/:id`) — linked from dashboard/disputes table; no matching pages under `app/pages/admin/` yet; pre-existing gap when navigating off-dashboard.

---

## Change Log

- **2026-05-10:** Code review — tri-layer pass (blind / edge / acceptance); removed unused stat icons; recorded defer for disputes routes; story marked done.
- **2026-05-10:** Implemented Epic 08-05 admin dashboard merge — KPI stats row, action queues, recent activity feed, pending-reports banner + valid deep-links, `useAdminProjects` query filters (`status`, `milestone_review`, `payment_release`), super-admin flags section, API contract + mock updates, Vitest mock shape test, E2E selector updates.

---

## Dev Agent Record

### Agent Model Used

Composer (Cursor agent)

### Debug Log References

### Completion Notes List

- Deep-links: `/admin/projects?status=*`, `?milestone_review=1`, `?payment_release=1`; payment-release filter uses `derivePaymentStatus` ↔ milestone `approved` → `ready_for_payout`.
- `DashboardBanners` payment CTA now targets `/admin/projects?payment_release=1` (removed invalid `/admin/payments` URL).
- API responses normalized in `useAdminDashboard` when fields are omitted during Laravel rollout.
- `ProjectSearch.vue` emit binding fixed (`const emit = defineEmits`).

### File List

- `shared/types/admin.ts`
- `app/composables/__mocks__/admin-dashboard.ts`
- `app/composables/__mocks__/admin-projects.ts`
- `app/composables/useAdminDashboard.ts`
- `app/composables/useAdminProjects.ts`
- `app/pages/admin/dashboard.vue`
- `app/components/admin/DashboardStats.vue`
- `app/components/admin/DashboardBanners.vue`
- `app/components/admin/DashboardActionQueues.vue`
- `app/components/admin/DashboardRecentActivity.vue`
- `app/components/admin/DashboardSuperAdminSection.vue`
- `app/components/admin/ProjectSearch.vue`
- `i18n/locales/en.json`
- `i18n/locales/ar.json`
- `docs/api-contracts.md`
- `e2e/admin-dashboard.spec.ts`
- `tests/unit/admin-dashboard-mock-shape.spec.ts`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

---

**Completion note:** Ultimate context engine analysis completed — comprehensive developer guide created for Epic 08-05 admin dashboard merge.
