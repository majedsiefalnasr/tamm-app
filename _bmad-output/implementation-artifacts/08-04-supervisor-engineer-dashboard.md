# Story 08-04 — Supervisor Engineer Dashboard

**Status:** done  
**Epic:** 08 — Role-Based Dashboards  
**Story ID:** 8.4  
**Priority:** High — supervisor primary overview surface  
**Complexity:** Medium  
**Estimated Effort:** 10–14 hours  
**Created:** 2026-05-09  
**Dependencies:** Epic 03 (reports + `ApprovalFlow`), Story 03-06 (`/reviews`), Story 08-03 patterns — reuse dashboard composition style

---

## Clarifications (read first)

1. **Route:** Epic text says `/dashboard` generically. This codebase uses **role-specific dashboard URLs** (see `app/utils/roleRoutes.ts`): supervisor overview is **`/dashboard/supervisor`**. Implement `app/pages/dashboard/supervisor.vue` — there is currently **no** supervisor dashboard page (only `client`, `contractor`, `field_engineer` exist under `app/pages/dashboard/`).
2. **Epic markdown typo:** In `_bmad-output/planning-artifacts/epic-08-dashboards.md`, the visual-spec heading labels **Supervisor** as "Story 08-03" and **Field Engineer** as "Story 08-04". Sprint keys are correct: **08-03 = field engineer**, **08-04 = supervisor**. Follow sprint + detailed story section **Story 08-04 — Supervisor Engineer dashboard** (same file, lines ~269–297) and **design-spec §7.3**.
3. **`usePermission` gap:** `ReviewListItem.vue` calls `can('review_milestone', …)` but `app/composables/usePermission.ts` did **not** include `review_milestone` (or `reject_milestone`) for `supervisor_engineer`. **Resolved in implementation:** `allowed_actions` arrays from milestones gate capabilities when present; supervisor role matrix includes `review_milestone` / `reject_milestone` as fallback.
4. **Post-login home (product decision):** Supervisors now land on **`/dashboard/supervisor`** (via `getHomePageForRole`) so the overview matches other roles, surfaces urgent pending reviews first, shares **`pending-reviews`** cache with `/reviews`, and keeps **`/reviews`** as the full approvals workspace without duplicating navigation intent.

---

## User story

**As a** supervisor engineer,  
**I want** pending reviews and recent decisions surfaced on my dashboard,  
**so that** I can prioritize review work and reach `/reviews` or inline `ApprovalFlow` without hunting.

---

## Acceptance criteria

### Route & access

- [x] New page: **`/dashboard/supervisor`**, `definePageMeta({ roles: ['supervisor_engineer'], … })`, uses `default` layout (same shell pattern as `app/pages/dashboard/field_engineer.vue`).
- [x] Non–supervisor users hitting this URL are rejected by existing role middleware pattern used on other dashboard routes.
- [x] Nav **overview** already points to `/dashboard/supervisor` for `supervisor_engineer` — no breaking route renames.

### Pending reviews (highest priority)

- [x] **SectionCard** (or equivalent) listing milestones **`under_review`** assigned to this supervisor — data via existing **`useMilestones().getPendingReviews()`** / `pendingReviews` (extend mock + eventual API so items include **`project`**, **`project_id`**, **`field_engineer`**, report submission timestamp).
- [x] Each row: **project name**, **milestone name**, **field engineer name**, **submission date** (prefer `latest_report?.submitted_at` then `updated_at` then `created_at`; document sort field in composable).
- [x] **Sorted oldest submission first** (longest waiting at top) — align sort with `/reviews` expectations.
- [x] **Badge count** in section header = number of pending items; **must equal** `pendingReviewsCount` from `useMilestones()` so it stays consistent with **`/reviews`** and future sidebar badge wiring (`docs/design-spec.md` §6.3).
- [x] **Review CTA** per row opens **`ApprovalFlow`** (same component as `app/components/review/ReviewListItem.vue`). On approve/reject success: refresh pending list + recent decisions + stats.
- [x] Empty state: i18n key for “No pending reviews”.
- [x] Optional visual emphasis when items exist: full-width alert styling per epic/design (`rounded-2xl border border-danger/30 bg-danger/5 p-5` — see epic-08-dashboards supervisor visual block).

### Recently reviewed

- [x] Section listing **last 5** milestones this supervisor **approved or rejected** (decision + timestamp).
- [x] Each row: milestone name, project name, **decision pill** (approved / rejected), date (`formatDate()`).
- [x] New composable API suggested: `getSupervisorRecentDecisions(limit)` returning e.g. `{ milestoneId, milestoneName, projectId, projectName, decision: 'approved' | 'rejected', decidedAt }[]` — **mock first** with `// TODO: replace mock — supervisor review history endpoint`.
- [x] Empty state when no history.

### Design-spec §7.3 parity (required for TAMM dashboard UX)

Per `docs/design-spec.md` §7.3 (supervisor overview):

- [x] **Stats row — 3 KPI blocks** (same structural pattern as `ProjectSummaryCards.vue`: `rounded-2xl border bg-card …`):
  - Pending reviews count — **danger** tone if &gt; 0 (`design-spec` §5.1).
  - Active projects count (supervisor-assigned projects with `active`-relevant statuses — mirror filtering used in `useProjects()` for `supervisor_engineer`).
  - Approved **this calendar month** count (from recent decisions or milestones with `supervisor_approved_at` in range — mock acceptable with TODO).
- [x] **My projects** `SectionCard`: assigned projects with name, city, progress indication (reuse project list fields from store/composable; progress can be `completed_milestones / total_milestones` if available).
- [x] **Field team** `SectionCard`: engineers on supervisor’s projects with **last report date** (mock pipeline acceptable with TODO if no API — derive from milestones/reports mocks).

### Optional (epic)

- [x] **Assigned projects overview** compact summary + link to `/projects` (filtered list if query params exist — align with `useProjects` filters).

### Quality bar

- [x] Skeleton / `PageSkeleton` (or section skeletons) while loading — **never blank**.
- [x] All strings via **`i18n/ar.json`** + **`i18n/en.json`** under e.g. `dashboard.supervisor.*`.
- [x] **RTL:** logical Tailwind only (`ms-*`, `ps-*`, `text-start`, etc.).
- [x] **Currency:** N/A for core sections unless displaying amounts; if shown, `formatCurrency()`.
- [x] TypeScript strict, no `any`, `<script setup lang="ts">`, no API `$fetch` from presentational components — **composables only**.
- [x] `canTransition()` where mutations touch milestone status (delegated inside existing `useMilestones` approve/reject).

---

## Tasks / subtasks

- [x] Add **`review_milestone` / `reject_milestone`** (or allowed_actions-based check) to permission layer — fix supervisor review CTAs (AC: permission).
- [x] Extend **`getPendingReviews`** mock data: enrich milestones with `project`, `project_id`, `field_engineer`, `latest_report.submitted_at` for realistic dashboard + sort.
- [x] Implement **`getSupervisorRecentDecisions`** (+ mock + TODO for API).
- [x] Create **`SupervisorEngineerDashboard.vue`** (+ section subcomponents as needed).
- [x] Create **`app/pages/dashboard/supervisor.vue`** with padding aligned to other dashboards (`px-4 pb-16 pt-6 md:px-8 md:pb-20 md:pt-8` or match `field_engineer.vue`).
- [x] Fix **`PendingReviewsList.vue`** / **`ReviewListItem.vue`** issues encountered during integration:
  - `PendingReviewsList.vue`: `hasItems` references undefined `items` — use props correctly.
  - `ReviewListItem.vue`: replace hardcoded project slug/`proj-001` with **`milestone.project_id`** / **`milestone.project?.name`** for links.
- [x] i18n keys (AR primary + EN).
- [x] Manual RTL + dark mode pass (`docs/design-spec.md` §1).

---

## Developer context

### Existing building blocks

| Asset | Path | Notes |
| --- | --- | --- |
| Pending reviews fetch | `useMilestones` — `getPendingReviews`, `pendingReviews`, `pendingReviewsCount` | Extend shapes + sorting |
| Review UI pattern | `ReviewListItem.vue` + `ApprovalFlow.vue` | Reuse dialog pattern on dashboard rows |
| Full queue page | `app/pages/reviews/index.vue` | Dashboard is overview; `/reviews` remains execution view |
| Role nav | `app/utils/roleRoutes.ts` | Overview → `/dashboard/supervisor` |
| Dashboard precedent | `FieldEngineerDashboard.vue`, `app/pages/dashboard/field_engineer.vue` | Composition reference |

### New files (expected)

| File | Purpose |
| --- | --- |
| `app/pages/dashboard/supervisor.vue` | Page shell + meta |
| `app/components/dashboard/SupervisorEngineerDashboard.vue` | Data orchestration |
| `app/components/dashboard/SupervisorPendingReviewsSection.vue` (optional split) | Pending queue UI |
| `app/components/dashboard/SupervisorRecentDecisionsSection.vue` (optional split) | Recent decisions |
| `app/components/dashboard/SupervisorStatsRow.vue` (optional split) | Three KPI cards |

### Architecture compliance

- **Nuxt 4:** pages under `app/pages/`.
- **No new npm packages** without approval.
- **Status strings:** only from types / `statusMachine` — no ad-hoc literals for transitions.
- **Optimistic updates:** follow existing `useMilestones` approve/reject patterns (store rollback on failure).

### Testing suggestions

- Unit: sort order for pending reviews; permission function includes supervisor review capability.
- E2E/manual: login `supervisor_engineer` → `/dashboard/supervisor` loads; Review opens dialog; decision removes row from pending; counts match header badge.
- Regression: `/reviews` still works after permission + prop fixes.

---

## Previous story intelligence (08-03)

From **`08-03-field-engineer-dashboard-and-assignments-page.md`** and implementation commit history:

- Prefer **section-level** loading/error handling + retry.
- Keep dashboard pages **thin**; logic in composables + dashboard container component.
- Follow established **i18n key namespaces** (`dashboard.fieldEngineer.*` precedent → `dashboard.supervisor.*`).
- Recent git commits show dashboard stories land as focused features (`feat: Story 08-03 …`, `08-02 …`) — keep diffs scoped.

---

## Git intelligence (recent commits)

- `1013f40` — Story 08-03 field engineer dashboard + assignments (patterns for dashboard composition).
- `9658c4b` / `14e44dc` — Contractor dashboard + review fixes (stat/grid patterns).

---

## Latest tech notes

- **Nuxt 4 / Vue 3.5:** `useAsyncData` for server-friendly fetch where appropriate; align keys with `/reviews` if sharing pending-review cache carefully (avoid stale duplicates — document refresh strategy).
- **Tailwind v4:** logical properties mandatory for RTL.

---

## Project context reference

- `AGENTS.md`, `CLAUDE.md` — roles, i18n, composable-only API access.
- `docs/design-spec.md` §3 shell, §4–§5 primitives, §6.3 supervisor nav badge expectation, **§7.3 supervisor overview**.
- `docs/status-flows.md` — milestone states (`under_review`, `supervisor_approved`, `rejected` bounce).

---

## Dev Agent Record

### Agent Model Used

Composer (implementation)

### Debug Log References

### Completion Notes List

- Supervisor post-login redirect set to `/dashboard/supervisor`; shared `pendingReviewsShared` keeps dashboard and `/reviews` counts aligned.
- Merged duplicate root `dashboard.*` keys in `i18n/locales/*.json` so `fieldEngineer`, `contractor`, `client`, and `supervisor` namespaces coexist.
- Added `app/composables/useRoleRoutes.ts` (wrapper) — fixes missing composable referenced by auth middleware and auth store.

### File List

- `app/utils/roleRoutes.ts`
- `app/composables/useRoleRoutes.ts`
- `app/composables/usePermission.ts`
- `app/composables/useMilestones.ts`
- `app/pages/dashboard/supervisor.vue`
- `app/components/dashboard/SupervisorEngineerDashboard.vue`
- `app/components/review/PendingReviewsList.vue`
- `app/components/review/ReviewListItem.vue`
- `i18n/locales/en.json`
- `i18n/locales/ar.json`
- `tests/role-based-redirect.spec.ts`
- `tests/unit/composables/useMilestones.spec.ts`

### Review Findings

- [x] [Review][Patch] PendingReviewsList error retry button showed raw key `common.retry` [`PendingReviewsList.vue`] — fixed: pass translated `:action-label="$t('common.retry')"`.
- [x] [Review][Patch] Supervisor pending empty state reused `/reviews` copy instead of `dashboard.supervisor.*` per AC [`SupervisorEngineerDashboard.vue`, `i18n`] — fixed: `pendingEmptyTitle` / `pendingEmptyDescription`.
- [x] [Review][Patch] Field team mock lacked composable-level TODO [`SupervisorEngineerDashboard.vue`] — fixed: `// TODO: replace mock — GET supervisor/field-team`.
- [x] [Review][Defer] `getPendingReviews` mock only calls `loadMilestones('proj-001')` so queued items in other projects never appear until API [`useMilestones.ts`] — deferred, pre-existing mock limitation; superseded by contracted endpoint.

---

**Created by:** BMad Ultimate Context Engine — comprehensive developer guide for Story 08-04  
**Completion note:** Code review complete; story marked done.
