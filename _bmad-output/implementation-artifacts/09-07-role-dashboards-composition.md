# Story 9.7: Role dashboards composition

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a role-specific user,  
I want dashboard sections ordered like modern dashboard blocks,  
so that urgent work stays above the fold.

## Acceptance Criteria

1. Dashboard pages use clearer section composition (stats → priority queues → tables/charts) aligned with shadcn **dashboard** block idioms, expressed via registry **Card** primitives (`Card` / `CardHeader` / `CardTitle` / `CardDescription` / `CardContent` / `CardAction`) where dashboards still rely on raw `rounded-2xl border border-border bg-card …` wrapper divs. Real composables/data only — no demo JSON.
2. No regression on permission-gated sections (super-admin section, contractor-only widgets, supervisor pending-reviews, etc. continue to render exactly when they did before).
3. RTL verified per role spot-check (Arabic default, English secondary).

## Tasks / Subtasks

- [x] Confirm scope and keep changes UI-only — no store/composable/API/status-machine behavior changes (AC: 1, 2):
  - [x] **Section wrappers** swap raw section `<div>` to `Card` primitive composition while preserving `rounded-2xl shadow-card` visual fidelity:
    - [x] `app/components/admin/DashboardActionQueues.vue`
    - [x] `app/components/admin/DashboardRecentActivity.vue`
    - [x] `app/components/admin/DashboardActivity.vue`
    - [x] `app/components/admin/DashboardProjects.vue`
    - [x] `app/components/admin/DashboardDisputes.vue`
    - [x] `app/components/admin/DashboardSuperAdminSection.vue` (alert-tinted Card)
  - [x] **KPI / stat tiles** use `Card` primitive per tile, preserving link/data-testid/tone classes (AC: 1):
    - [x] `app/components/admin/DashboardStats.vue` (skeleton tiles + populated tiles)
    - [x] `app/components/dashboard/ProjectSummaryCards.vue`
    - [x] `app/components/dashboard/DashboardPaymentSummary.vue`
  - [x] **Banners / alert rows** use `Card` primitive while keeping tinted borders (`border-primary/30`, `border-accent/30`, `border-destructive/30`) and inline action links (AC: 1):
    - [x] `app/components/admin/DashboardBanners.vue`
    - [x] `app/components/dashboard/AdminDashboardPage.vue` (error banner only — keep retry handler, copy, and a11y)
  - [x] **Contractor sections** standardize section wrappers; preserve internal list-row markup (AC: 1, 2):
    - [x] `app/components/contractor/ContractorActiveMilestones.vue` (skeleton wrapper + populated row wrapper)
    - [x] `app/components/contractor/ContractorReviewMilestones.vue`
    - [x] `app/components/contractor/ContractorPaymentStatus.vue` (per-stat tiles)
    - [x] `app/components/contractor/ContractorOpenBids.vue`
  - [x] **Field-engineer sections** standardize section wrappers and error banner (AC: 1, 2):
    - [x] `app/components/dashboard/FieldEngineerActiveMilestones.vue`
    - [x] `app/components/dashboard/FieldEngineerRecentReports.vue`
  - [x] **Supervisor dashboard** section wrappers + KPI tiles align to `Card` primitive while preserving the `border-danger/30 bg-danger/5` urgent banner tone for pending reviews (AC: 1, 2):
    - [x] `app/components/dashboard/SupervisorEngineerDashboard.vue`
- [x] Out of scope (do NOT touch in this story):
  - [x] `app/components/dashboard/RecentActivitySection.vue` row anchors (already shadcn-shaped via `EmptyState` / `ErrorState` + `RecentActivityListSkeleton` from 09-05).
  - [x] `app/components/admin/DashboardProjects.vue` and `DashboardDisputes.vue` inner `<table>` markup (table primitives already addressed in 09-05; only the section wrapper changes here).
  - [x] `app/components/client/ApprovalQueueWidget.vue` and `ApprovalQueueList` (already minimal — header pattern is correct).
  - [x] Any composable/store/permission/status-machine logic.
- [x] Preserve behavior while normalizing composition (AC: 2):
  - [x] All `data-testid`, `aria-*`, `:to`, `@click`, `@retry`, role-gated `v-if` conditions remain semantically identical.
  - [x] All i18n keys reused exactly — no new hardcoded user-visible strings.
  - [x] All KPI link targets, badge logic, and skeleton counts preserved.
  - [x] No new physical Tailwind utilities (`ml-*` / `pl-*` / `left-*` / `right-*`) introduced in TAMM-owned files.
- [x] Verification (AC: 3):
  - [x] `pnpm lint`
  - [x] `pnpm exec nuxt prepare`
  - [x] `pnpm exec vitest run` (full suite — keep parity with 09-05/09-06 verification posture)
  - [x] Manual Arabic-first RTL pass on each role dashboard (client, contractor, field engineer, supervisor, admin, super-admin) plus LTR spot-check.

## Dev Notes

- Epic 09 is a **UI-only** alignment epic; this story must not change domain logic from Epics 02–08.
- `09-01-audit-shadcn-gaps-and-cli-plan.md` already confirms `card`, `badge`, `skeleton`, `empty` primitives are installed — **no CLI adds required** for this story.
- Continue the same implementation boundary used in 09-04, 09-05, 09-06: normalize composition while preserving behavior.
- The shadcn `Card` primitive defaults to `rounded-xl py-6 shadow-sm`. Override via the `class` prop (`cn`-merged) to match `docs/design-spec.md §5.2` (`rounded-2xl … p-5 md:p-6 shadow-card`). Preserve every dashboard's existing border/spacing palette — visual fidelity matters more than vendor defaults here.
- Block-idiom reference: shadcn-vue **dashboard-01** layout (stats row → priority queue/section → table/chart → secondary section). Existing dashboards already follow this **order** (Epic 08); this story only switches the **expression** to `Card` composition.

### Current State Snapshot (must preserve)

- `dashboard/index.vue` is already minimal (role switch + page title meta) — no changes required here.
- `ClientDashboardSection.vue` wraps `ApprovalQueueWidget` in a `border-border bg-card rounded-2xl border p-6` div, then renders `DashboardPaymentSummary`, `ProjectSummaryCards`, and `RecentActivitySection`. Approval-queue header logic and `projectsHydrating` bootstrap flag must stay intact.
- `AdminDashboardPage.vue` renders an error banner with `retry()` and the canonical Epic-08 ordering: banners → stats → action queues → recent activity → super-admin → activity chart → projects → disputes. Preserve the role gate (`showSuperAdminSection`).
- `SupervisorEngineerDashboard.vue` keeps a 3-up KPI row, a tinted `border-danger/30 bg-danger/5` pending-reviews banner, and 4 sections (recent decisions / projects / field team). The `fieldTeamRows` mock + `// TODO: replace mock — GET supervisor/field-team` comment must be left in place — replacing mocks is **not** in scope for this story.
- `FieldEngineerDashboard.vue` is a thin wrapper around `FieldEngineerActiveMilestones` + `FieldEngineerRecentReports`; only the children need composition updates.
- `ContractorDashboardPage.vue` orchestrates 4 sections (`ContractorActiveMilestones`, `ContractorReviewMilestones`, `ContractorPaymentStatus`, `ContractorOpenBids`) with parallel `Promise.all` bootstrap and per-section retry handlers. Preserve `initialDashboardLoad` flag, `paymentSummary` derivation, and `proposalsForContractor` composition.
- `DashboardStats.vue` renders `1 → 2 → 3 → 6` responsive stat grid using a hand-rolled `gridClass`; keep responsive grid + skeleton count, `formatValue` (compact currency), and tone-mapped icon colors.
- `DashboardActionQueues.vue` is the only place where action queue copy is tied to keys — keep all `data-testid` selectors (`action-queue-open-bidding`, etc.) and the empty-label fallback rendering.
- `DashboardSuperAdminSection.vue` is gated by `flags && flags.pending_permission_requests > 0`. The `// TODO: replace mock — admin dashboard super-admin flags endpoint` comment must remain.
- `DashboardActivity.vue` houses an inline SVG chart with hover state. Wrapper Card swap is fine; **do not** touch chart math, viewBox, or `direction: ltr` style.
- `DashboardProjects.vue` and `DashboardDisputes.vue` are dense tables; only the outer wrapper switches to `Card` composition with `CardHeader` for title/`view all` link. Inner `<table>` / `<thead>` / `<tbody>` stays — table primitives already covered in 09-05.

### What This Story Changes

- Replaces ad-hoc dashboard section/banner/stat wrappers with `Card`-family primitive composition so block-style upgrades and theming remain cheap.
- Aligns dashboards visually to shadcn **dashboard-01** idioms while keeping every existing data binding, role gate, retry handler, and i18n key.

### What Must Not Break

- Existing role-based route/page behavior and conditional section rendering (super-admin, contractor-only widgets, supervisor pending-reviews banner threshold, etc.).
- Existing data fetch flows, retry handlers, mock fallbacks, and `aria-busy` semantics on loading regions.
- Existing test selectors (`data-testid`) and analytics hooks.
- Existing i18n contract and Arabic-first RTL behavior.
- Existing skeleton counts and shape (KPI placeholders, table-row placeholders, chart placeholders).

### Architecture Compliance

- Nuxt 4 structure under `app/`; `<script setup lang="ts">` + Composition API only.
- Import UI primitives from `~/components/ui/*` (e.g. `~/components/ui/card`) — never from a `shadcn-vue` package path.
- Keep changes surgical to the listed dashboard files; do not refactor unrelated pages/composables.
- Use **logical Tailwind utilities** in TAMM-owned files (`ms-*`, `ps-*`, `border-s-*`, `start-*`, `text-start`). Vendor `ui/*` primitives may still contain physical `left/right` from upstream — that is out of scope.

### Library / Framework Requirements

- shadcn-vue (`/unovue/shadcn-vue`, Context7) guidance for this story:
  - **Card composition** is `Card` (root) + `CardHeader` (which uses CSS grid + auto-rows for title/description/action), with `CardTitle`, `CardDescription`, `CardAction`, and `CardContent` (or footer) for the body.
  - Class merging via `cn()` is built into the primitives — pass dashboard-specific overrides through the `class` prop instead of forking `app/components/ui/card/*`.
  - For KPI tiles wrapped in `<NuxtLink>`, keep the link as an outer wrapper and place `<Card>` inside (or use the link only on `CardAction` when more appropriate). Either approach is acceptable; preserve the existing test ids.
- VeeValidate / Zod / Pinia / `useApi` / `useMilestones` / `useProjects` / `useAdminDashboard` / `useActivity` / `usePayments` contracts remain untouched.

### File Structure Requirements

- Primary touch targets:
  - `app/components/admin/DashboardActionQueues.vue`
  - `app/components/admin/DashboardRecentActivity.vue`
  - `app/components/admin/DashboardActivity.vue`
  - `app/components/admin/DashboardProjects.vue`
  - `app/components/admin/DashboardDisputes.vue`
  - `app/components/admin/DashboardSuperAdminSection.vue`
  - `app/components/admin/DashboardStats.vue`
  - `app/components/admin/DashboardBanners.vue`
  - `app/components/dashboard/AdminDashboardPage.vue`
  - `app/components/dashboard/ProjectSummaryCards.vue`
  - `app/components/dashboard/DashboardPaymentSummary.vue`
  - `app/components/dashboard/SupervisorEngineerDashboard.vue`
  - `app/components/dashboard/FieldEngineerActiveMilestones.vue`
  - `app/components/dashboard/FieldEngineerRecentReports.vue`
  - `app/components/contractor/ContractorActiveMilestones.vue`
  - `app/components/contractor/ContractorReviewMilestones.vue`
  - `app/components/contractor/ContractorPaymentStatus.vue`
  - `app/components/contractor/ContractorOpenBids.vue`
- Avoid edits in stores/composables unless absolutely required for compile safety (not expected for this story).
- Do not edit `app/components/ui/card/*` — vendor-style overrides go through the consuming component's `class` prop.

### Testing Requirements

- Required:
  - `pnpm lint`
  - `pnpm exec nuxt prepare`
  - `pnpm exec vitest run` (full suite — same posture as 09-05/09-06)
- Manual UI checks (Arabic RTL first, then English):
  - **Client dashboard** (`/dashboard` → role `client`): approval-queue widget visible, stats row formatted correctly, recent activity rows still link out, no skeleton flicker.
  - **Contractor dashboard** (`/dashboard` → role `contractor`): active/review/payment/open-bids sections still render, retry buttons reachable on error, payment summary numerics formatted with `formatCurrency()`.
  - **Field-engineer dashboard** (`/dashboard` → role `field_engineer`): active assignments + recent reports cards keep "submit report" button reachable; error banner retry works.
  - **Supervisor dashboard** (`/dashboard` → role `supervisor_engineer`): KPI counts update, pending-reviews tinted banner shows when there are items, recent decisions and projects sections render.
  - **Admin / Super-admin dashboard** (`/dashboard` → role `admin` / `super_admin`): banners, stats grid (1 / 2 / 3 / 6 responsive), action queues, recent activity, activity chart, projects table, disputes table all render without DOM regressions; super-admin extra section visible only for `super_admin`.

## Previous Story Intelligence (09-06)

- Keep changes constrained to visual/composition alignment and preserve current interactions.
- Keep verification practical and scoped (`lint`, `nuxt prepare`, `vitest`, focused manual checks).
- Continue RTL-first validation posture established in 09-05/09-06.
- Use controlled state APIs / primitives where the registry provides them; avoid recreating wrappers that already exist (Card, CardHeader, CardTitle, etc.).
- 09-06 added overlay-focused unit tests; 09-07 does **not** require new tests because section composition is layout-only and existing role/role-gate tests already cover the dashboard wiring (`app/pages/dashboard/__tests__/contractor.spec.ts`, `tests/unit/components/admin/*`).

## Git Intelligence Summary

- Recent Epic 09 commits keep business logic stable while normalizing UI composition (`cc2542b`, `4668617`, `c31b1f3`, `0dcf4d3`, `56d2aaf`).
- Epic-08 dashboards landed in `eec6ea2` with the canonical section ordering — 09-07 should preserve that order exactly and only switch the wrapper expressions.
- Recent shell/auth commits (`56d2aaf`, `9acaad8`) addressed RTL hydration; do not reopen those concerns from inside dashboard composition work.
- `npx gitnexus impact "Folder:app/components/dashboard" -d upstream -r tamm-app` → **LOW risk**, 0 impacted dependents.
- `npx gitnexus impact "Folder:app/components/contractor" -d upstream -r tamm-app` → **LOW risk**, 0 impacted dependents.
- `npx gitnexus impact "Folder:app/components/admin" -d upstream -r tamm-app` → **LOW risk**, 0 impacted dependents.

## Latest Technical Information

- Context7 lookup used: `/unovue/shadcn-vue` (Card composition + dashboard block idioms).
- Current docs/examples reinforce:
  - Card composition uses `Card` + `CardHeader` (which is a grid layout with `CardTitle` / `CardDescription` / `CardAction`) + `CardContent` / `CardFooter`.
  - Override defaults via the `class` prop — **never** edit primitive source files for project-level styling.
  - Dashboard-01 idiom expresses every section through Card composition; vendor classes only ever match the registry defaults.
- These align directly with Story 09-07 ACs for "block-style section composition with real data only".

## Project Context Reference

- `AGENTS.md`
- `CLAUDE.md`
- `docs/design-spec.md` — §3 (shell), §4 (primitives), §5.1–§5.3 (StatCard / SectionCard / Pill), §7 (per-role overviews)
- `docs/coding-standards.md`
- `_bmad-output/planning-artifacts/epic-09-shadcn-alignment.md`
- `_bmad-output/planning-artifacts/epic-08-dashboards.md`
- `_bmad-output/planning-artifacts/ux-brief-epic-09-shadcn-alignment.md`
- `_bmad-output/implementation-artifacts/09-01-audit-shadcn-gaps-and-cli-plan.md`
- `_bmad-output/implementation-artifacts/09-04-forms-normalization.md`
- `_bmad-output/implementation-artifacts/09-05-lists-and-data-surfaces.md`
- `_bmad-output/implementation-artifacts/09-06-overlays-standardization.md`

## Dev Agent Record

### Agent Model Used

Claude Opus 4.7

### Debug Log References

- Workflow config resolved via `_bmad/scripts/resolve_customization.py`.
- Sprint key resolved from `sprint-status.yaml`: `09-07-role-dashboards-composition`.
- Loaded Epic 09 plan, UX brief, prior stories (09-01 through 09-06), and Epic 08 dashboard plan.
- Read current dashboard surfaces across `app/pages/dashboard/`, `app/components/dashboard/`, `app/components/contractor/`, `app/components/admin/`, and `app/components/client/`.
- Git history analyzed (`git log --oneline -n 8`, `git log --name-only -n 1 cc2542b`) for Epic 09 implementation patterns.
- Context7 lookup: `/unovue/shadcn-vue` for Card primitive composition + dashboard-01 idioms.
- `npx gitnexus impact "Folder:app/components/dashboard" -d upstream -r tamm-app` → LOW risk, 0 impacted dependents.
- `npx gitnexus impact "Folder:app/components/contractor" -d upstream -r tamm-app` → LOW risk, 0 impacted dependents.
- `npx gitnexus impact "Folder:app/components/admin" -d upstream -r tamm-app` → LOW risk, 0 impacted dependents.
- `pnpm lint` → PASS.
- `pnpm exec nuxt prepare` → PASS.
- `pnpm exec vitest run` → PASS (310/310).
- `bmad-code-review` adversarial pass surfaced 1 patch-class finding (shadow merge). Fix applied. Re-ran lint + nuxt prepare + vitest → all PASS.

### Completion Notes List

- Replaced ad-hoc `rounded-2xl border border-border bg-card shadow-card …` wrapper divs with shadcn `Card` primitive composition (`Card`, `CardHeader`, `CardTitle`, `CardAction`, `CardContent`) across 18 dashboard files spanning admin, client, contractor, field-engineer, and supervisor surfaces.
- Used the `class` prop with `cn`-merge to override Card defaults (`rounded-xl` → `rounded-2xl`, `shadow-sm` → `shadow-card`, `py-6` → `p-4`/`p-5`/`p-6`/`md:p-6`, `gap-6` → `gap-0` or `gap-4` per visual fidelity) — never edited primitive source files.
- Preserved every `data-testid`, role gate (`super_admin` flags, `showPendingBanner`), `aria-*` attribute, `aria-busy` semantic, retry/click handler, `:to` link target, badge variant, and i18n key.
- Preserved supervisor `fieldTeamRows` mock and existing `// TODO: replace mock` comments — replacing mocks is out of scope.
- Section wrappers using `<section>` semantics keep the `<section>` outer tag; `Card` is placed inside to retain semantic HTML.
- DashboardStats and ProjectSummaryCards use `<NuxtLink class="block">` outside the `Card` so the entire tile remains clickable while the visual primitive is the `Card`.
- Banners (`DashboardBanners`, `DashboardSuperAdminSection`, `AdminDashboardPage` error) use `Card` with `shadow-none` overrides to keep the existing soft-tinted alert visual.
- Verified `pnpm lint`, `pnpm exec nuxt prepare`, and full `pnpm exec vitest run` (310 tests) all pass after the changes.
- No new dependencies, no new i18n keys, no logical CSS regressions.

### File List

- `_bmad-output/implementation-artifacts/09-07-role-dashboards-composition.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `app/components/admin/DashboardActionQueues.vue`
- `app/components/admin/DashboardRecentActivity.vue`
- `app/components/admin/DashboardActivity.vue`
- `app/components/admin/DashboardProjects.vue`
- `app/components/admin/DashboardDisputes.vue`
- `app/components/admin/DashboardSuperAdminSection.vue`
- `app/components/admin/DashboardStats.vue`
- `app/components/admin/DashboardBanners.vue`
- `app/components/dashboard/AdminDashboardPage.vue`
- `app/components/dashboard/ProjectSummaryCards.vue`
- `app/components/dashboard/DashboardPaymentSummary.vue`
- `app/components/dashboard/SupervisorEngineerDashboard.vue`
- `app/components/dashboard/FieldEngineerActiveMilestones.vue`
- `app/components/dashboard/FieldEngineerRecentReports.vue`
- `app/components/contractor/ContractorActiveMilestones.vue`
- `app/components/contractor/ContractorReviewMilestones.vue`
- `app/components/contractor/ContractorPaymentStatus.vue`
- `app/components/contractor/ContractorOpenBids.vue`

## Code Review Findings

### Finding 1 — `shadow-card` does not suppress Card primitive's default `shadow-sm` (HIGH, patched)

**Source:** `bmad-code-review` adversarial pass.

**Issue:** The shadcn `Card` primitive defaults to `bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm`. `tailwind-merge` only resolves conflicts within known utility groups. `shadow-card`, `shadow-elevated`, `shadow-cta` are project-spec tokens (per `docs/design-spec.md` §1) but are **not defined** in `app/assets/css/tailwind.css` and are **not registered** in `tailwind-merge`'s shadow conflict group. Result: `cn('shadow-sm shadow-card')` outputs both classes — `shadow-sm` (real CSS) survives because `shadow-card` is a no-op utility. Pre-09-07 the wrapper `<div>` rendered with no shadow (only border); post-09-07 the `Card` rendered with `shadow-sm` — a small but real visual regression on every dashboard surface.

**Fix:** Add `shadow-none` adjacent to `shadow-card` on every `Card` invocation introduced by this story. `shadow-none` is in `tailwind-merge`'s standard shadow conflict group and deterministically beats the primitive's `shadow-sm`. `shadow-card` remains as a forward-looking design tag (will render real shadow once the theme defines `--shadow-card`). Applied to **30 Card invocations across 14 files**:

- `app/components/admin/DashboardStats.vue` (×4)
- `app/components/admin/DashboardActionQueues.vue` (×1)
- `app/components/admin/DashboardActivity.vue` (×1)
- `app/components/admin/DashboardBanners.vue` (×4)
- `app/components/admin/DashboardDisputes.vue` (×1)
- `app/components/admin/DashboardProjects.vue` (×1)
- `app/components/admin/DashboardRecentActivity.vue` (×1)
- `app/components/contractor/ContractorActiveMilestones.vue` (×1)
- `app/components/contractor/ContractorOpenBids.vue` (×1)
- `app/components/contractor/ContractorPaymentStatus.vue` (×2)
- `app/components/dashboard/DashboardPaymentSummary.vue` (×3)
- `app/components/dashboard/FieldEngineerActiveMilestones.vue` (×1)
- `app/components/dashboard/ProjectSummaryCards.vue` (×3)
- `app/components/dashboard/SupervisorEngineerDashboard.vue` (×8)

**Out of scope (not fixed):** Defining `--shadow-card` / `--shadow-elevated` / `--shadow-cta` in `app/assets/css/tailwind.css` would change every card across the entire app — out of scope for an UI-alignment story. Extending `tailwind-merge` config to register `shadow-card` in the shadow group is a larger global change. Both are tracked as separate technical debt; this story stays surgical and UI-only.

**Verification post-fix:** `pnpm lint` → PASS, `pnpm exec nuxt prepare` → PASS, `pnpm exec vitest run` → PASS (310/310).

### Non-findings (explicitly not flagged)

- `rounded-2xl` correctly overrides primitive `rounded-xl` via merge.
- `gap-0` / `gap-3` / `gap-4` correctly overrides primitive `gap-6`.
- `p-4` / `p-5` / `p-6` / `p-4 md:p-6` correctly overrides primitive `py-6`.
- `flex-row items-start gap-3` correctly overrides primitive `flex-col gap-6` for alert banners.
- `<NuxtLink class="block">` wrapping `<Card>` keeps the full tile clickable.
- All `data-testid`, `aria-*`, `:to`, `@click`, `@retry`, role gate `v-if`, badge variants, and i18n keys preserved exactly.
- All `<Card>` tags balanced; no orphan close tags.

## Change Log

- 2026-05-10: Standardized role-dashboard section/banner/stat composition on shadcn `Card` primitives (Card / CardHeader / CardTitle / CardAction / CardContent) across admin, client, contractor, field-engineer, and supervisor surfaces while preserving every behavior, role gate, `data-testid`, and i18n key. Story status moved to `review`.
- 2026-05-10: Code-review fix — added `shadow-none` adjacent to `shadow-card` on 30 Card invocations across 14 files to deterministically suppress the primitive's default `shadow-sm` and preserve the prior no-shadow rendering. Re-verified lint + nuxt prepare + vitest (310/310).

## Story completion status

Story implementation complete and ready for review.
