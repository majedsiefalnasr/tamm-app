# Story 10.3: Role dashboard charts (selective KPI visualization)

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created. -->

## Story

As a **logged-in user viewing my role dashboard**,

I want **at most one primary KPI chart per dashboard surface when underlying metrics exist**,

So that **I gain visual momentum without invented metrics, empty fluff, or layout regressions in RTL/dark mode**.

## Acceptance Criteria

1. **Defined series only:** A chart renders **only** when a composable-aligned **`RoleDashboardChartDefinition`** exists (`~/shared/types/role-dashboard-chart.ts`): builders live in **`~/app/utils/roleDashboardCharts.ts`** and ingest **real fetched/mock-contract fields only** — never random or interpolated KPIs.
2. **Primary chart slot:** Each role dashboard exposes **one** chart region (`~/app/components/dashboard/RoleDashboardPrimaryChart.vue`): **Client** (`ClientDashboardSection.vue`), **Contractor** (`ContractorDashboardPage.vue`), **Field engineer** (`FieldEngineerDashboard.vue`), **Supervisor** (`SupervisorEngineerDashboard.vue`), **Admin** (`DashboardActivity.vue` or wired from `AdminDashboardPage.vue`).
3. **`Empty` + guidance:** When `definition === null` after hydration or loaded dataset lacks eligible points, show **`Empty`** (`~/components/ui/empty`) with **actionable** `NuxtLink` (existing destinations — `/projects`, `/reviews`, `/admin/dashboard` as appropriate). Strings via **`ar` / `en`** locale files only.
4. **RTL + dark mode:** Chart drawing stays **`direction: ltr`** inside an explicit wrapper so ticks remain readable; **logical spacing** outside that wrapper; **`aspect-video`**/`ChartContainer` height keeps footprint stable; axis density capped (`numTicks` ≤ ~8 or ordinal tick suppression via trimming).
5. **Loading:** While role bootstrap/`loading` is true, show **`Skeleton`** matching chart footprint (same Card chrome as chart).

## Tasks / Subtasks

- [x] Types — Add `RoleDashboardChartDefinition` / `RoleDashboardChartPoint` in `~/shared/types/role-dashboard-chart.ts`.
- [x] Pure builders — Implement `~/app/utils/roleDashboardCharts.ts`:
  - `buildAdminActivityChartDefinition(ActivityChartData)` from **`docs/api-contracts.md`** `activity_data` shape.
  - `buildClientProjectProgressChart(Project[])` — one series `progress` (% complete for projects with `total_milestones > 0`).
  - `buildContractorMonthlyPaidOutChart(Milestone[])` — count payouts per calendar month using **`paid_out_at`** where `payment_status === 'paid_out'`.
  - `buildFieldEngineerMonthlyReportsChart(Report[])` — submissions per **month** from **`submitted_at`**; return **null** unless **≥ 2** months contain ≥ 1 report (avoid single-column charts).
  - `buildSupervisorMonthlyDecisionChart(SupervisorReviewDecision[])` — decisions per month from **`decidedAt`**; **null** unless **≥ 2** distinct months.
- [x] UI primitive — `RoleDashboardPrimaryChart.vue` uses **`ChartContainer`** + **`VisXYContainer` / `VisLine` / `VisAxis`** (`@unovis/vue`), **`Card`**, **`Skeleton`**, **`Empty`** family.
- [x] Composable hooks — Export **`supervisorDashboardChartDefinition`** from `~/app/composables/useMilestones.ts` (computed from merged supervisor decision log + seeds — same lineage as `supervisorRecentDecisionsTop`).
- [x] Wire dashboards — Pass definitions + i18n-driven **`ChartConfig`** (`~/components/ui/chart`) per surface.
- [x] Tests — Vitest unit coverage for builders (null guards, multi-month behaviour, admin parity with mock fixture shape).
- [x] Verification — `pnpm lint` + `pnpm exec vitest run` + `pnpm exec nuxt build`.

## Dev Notes

### Developer guardrails

| Topic | Instruction |
|-------|-------------|
| Metrics honesty | If backend aggregates are missing for a role, **`definition` stays `null`** — **do not fabricate** trendlines or interpolate zeros beyond documented builder rules. |
| Admin contract | **`activity_data`** shape is defined under **`GET /admin/dashboard`** in `docs/api-contracts.md` — mocks already populate `~/app/composables/__mocks__/admin-dashboard.ts`. |
| Stack | **No new packages.** `@unovis/vue` is already transitive via shadcn chart stack; **`ChartContainer`** expects Unovis children. |
| Layout | Follow **`AGENTS.md`**: logical Tailwind; chart **`svg`/Vis subtree remains LTR** like legacy `DashboardActivity.vue` comment. |
| i18n | Keys under `dashboard.chart.*` for titles, series labels, empty copy — avoid hardcoded strings in templates. |

### Files to touch (expected)

| Action | Path |
|--------|------|
| NEW | `shared/types/role-dashboard-chart.ts` |
| NEW | `app/utils/roleDashboardCharts.ts` |
| NEW | `app/components/dashboard/RoleDashboardPrimaryChart.vue` |
| NEW | `tests/unit/role-dashboard-charts.spec.ts` |
| UPDATE | `app/components/admin/DashboardActivity.vue` |
| UPDATE | `app/components/dashboard/ClientDashboardSection.vue` |
| UPDATE | `app/components/contractor/ContractorDashboardPage.vue` |
| UPDATE | `app/components/dashboard/FieldEngineerDashboard.vue` |
| UPDATE | `app/components/dashboard/SupervisorEngineerDashboard.vue` |
| UPDATE | `app/composables/useMilestones.ts` |
| UPDATE | `i18n/locales/en.json`, `i18n/locales/ar.json` |

### Previous story intelligence (10-02)

- Prefer **explicit props** from pages over deep inject for dashboard fragments.
- **`tests/unit/rtl/tamm-no-physical-tailwind.spec.ts`** — keep **`ml-*` / physical directional classes** out of new Vue SFCs.
- **`project-context.md`** absent — follow **`AGENTS.md`** + **`docs/design-spec.md`** for shells/tokens.

### Architecture / traceability

- **Epic 10 / Story 10-03** — `_bmad-output/planning-artifacts/epic-10-product-experience-advancement.md`
- **Dependency note:** Backend aggregates — confirm **`docs/api-contracts.md`** before swapping mocks; until then builders consume **existing composable/store shapes**.

### Open questions (non-blocking)

- Future **`GET /dashboard/analytics?role=`** — replace multi-role builders with API-fed definitions when contract lands.

## Dev Agent Record

### Agent Model Used

GPT-5.2 (Cursor agent)

### Debug Log References

- Sprint `10-03-role-dashboard-charts-selective-kpis`: `ready-for-dev` → `done`.

### Completion Notes List

- Unified **`RoleDashboardPrimaryChart`** replaces bespoke SVG in **`DashboardActivity`** (preserves **`activity-section`** / **`activity-chart`** test ids for Playwright).
- **`supervisorDashboardChartDefinition`** exposed from **`useMilestones`**; seed **`decidedAt`** spans two months so supervisor charts can render under mock data.
- Contractor payout chart may stay empty until mock milestones include **`paid_out`** samples — **`Empty`** covers that path.

### File List

- `shared/types/role-dashboard-chart.ts`
- `app/utils/roleDashboardCharts.ts`
- `app/components/dashboard/RoleDashboardPrimaryChart.vue`
- `app/components/admin/DashboardActivity.vue`
- `app/components/dashboard/ClientDashboardSection.vue`
- `app/components/contractor/ContractorDashboardPage.vue`
- `app/components/dashboard/FieldEngineerDashboard.vue`
- `app/components/dashboard/SupervisorEngineerDashboard.vue`
- `app/composables/useMilestones.ts`
- `i18n/locales/en.json`
- `i18n/locales/ar.json`
- `tests/unit/role-dashboard-charts.spec.ts`
- `_bmad-output/implementation-artifacts/10-03-role-dashboard-charts-selective-kpis.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log

- **2026-05-11:** Implemented selective KPI charts across role dashboards, builders + i18n + tests; lint, Vitest, and Nuxt build verified.

## Code review (adversarial triage)

### Blind Hunter

- [x] Invented metrics — mitigated by **`RoleDashboardChartDefinition | null`** builders only (no synthetic trend fills).

### Edge Case Hunter

- [x] RTL readability — chart subtree **`direction: ltr`** with logical layout outside; ISO month labels localized via **`Intl`** from **`locale`**.

### Acceptance Auditor

- [x] Empty vs loading — **`Skeleton`** during bootstrap; **`Empty`** + **`NuxtLink`** when no eligible definition.

**Story completion:** `done` — patches applied in-tree.

