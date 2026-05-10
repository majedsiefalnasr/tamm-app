# Deferred Work Items

## Deferred from: code review of 08-01-client-dashboard.md (2026-05-10)

- **StatCard primitive vs bespoke dashboard cards** — Story AC references `StatCard` from design-spec; repo has no shared `StatCard` component yet. `ProjectSummaryCards` and `DashboardPaymentSummary` use inline card markup until the primitive is added.

- **Canonical URL wording (`/dashboard` vs `/dashboard/client`)** — Client-facing dashboard is served at `/dashboard/client` with `/dashboard` acting as a multi-role hub (same pattern as story 08-02). Treat as spec/documentation alignment, not a functional defect.

## Deferred from: code review of 07-06-admin-assigns-engineers-after-contractor-selection.md (2026-05-10)

- **Activate project gated on engineer assignment (Story 02-05)** — Acceptance criteria called for disabling admin activate until both engineers are assigned with tooltip copy; project detail “Admin Actions” block remains a Story 02-05 placeholder. Implement when activation UI lands.

## Deferred from: code review of 07-03-admin-closes-bidding-for-review.md (2026-05-10)

- **Optional admin invitation metrics** — Story AC lists optional visibility for invitation vs proposal counts (“3 of 5 invited…”); not implemented in project detail for this story (explicitly optional).

- **`projectState` vs `getProjectById` split** — `updateProjectStatus` mutates `projectState[projectId]`, but loaded project detail may not live in that map; unify when backend-backed store lands (`useProjects.ts`).

## Deferred from: code review of 08-02-contractor-dashboard.md (2026-05-09)

- **Page title i18n namespace** — Main dashboard heading uses `pages.contractor_dashboard` while section copy uses `dashboard.contractor.*`; consolidating under `dashboard.contractor.title` would match the story spec verbatim (cosmetic consistency).

- **`Contractor dashboard` unit tests remain filter/math only** — `app/pages/dashboard/__tests__/contractor.spec.ts` does not mount components or assert middleware; same shallow pattern as prior dashboard stories; expand when shared dashboard test harness exists.

## Deferred from: code review of 08-04-supervisor-engineer-dashboard.md (2026-05-09)

- **`getPendingReviews` mock scope** — Implementation only loads `proj-001` via `loadMilestones`; under-review milestones in other projects are invisible until the real supervisor-queue endpoint replaces the mock (`useMilestones.ts`).

## Deferred from: Code Review of Story 06-04 (2026-05-09)

### Pre-existing Infrastructure Issues

- **Fallback pagination object validation** [`useAdminProjects.ts:97-102`] — API response fallback assumes pagination structure is correct. Should validate `data.pagination` shape before using. Lower priority; API contract controls this.

- **fetchProjects() network timeout guard** [`admin/projects.vue:40-42`] — No timeout set on async fetch; page can hang indefinitely. Infrastructure concern; applies to all composables, not just this story.

- **Error scenario test coverage** [`tests/`] — Missing tests for network errors, permission denied, API validation failures. Pre-existing test infrastructure gap; affects multiple stories.

## Deferred from: Code Review of Story 06-03 (2026-05-09)

- **Verify `useApi` utility exists** — Pre-existing infrastructure. The `useApi()` function (imported in useProjectDetail.ts line 60) needs to be verified to exist and be correctly exported from `~/utils/api`. Affects multiple features beyond this story.

## Deferred from: Code Review of Story 07-01 (2026-05-09)

- **No duplicate proposal submission guard** — Component doesn't validate if contractor has already submitted a proposal before opening dialog. May be handled by API validation. Check with backend team whether validation should be client-side or API-side only.

- **Contractor list doesn't refresh while dialog open** — New contractors added to the system while dialog is open won't appear until dialog is closed/reopened. Not in spec and low priority enhancement for MVP.
