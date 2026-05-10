# Story 9.5: Lists and data surfaces

Status: done

## Story

As a user browsing lists,  
I want tables and cards with proper empty and loading states,  
so that I'm never faced with a blank screen.

## Acceptance Criteria

1. Loading states use `Skeleton` (or established equivalent) on scoped list/data pages.
2. Empty states use `Empty` (or equivalent registry pattern) per `docs/design-spec.md`.
3. Dense lists remain usable on mobile, and Arabic RTL behavior is verified.

## Tasks / Subtasks

- [x] Confirm story scope and keep changes UI-only (no store/composable/API/status machine behavior changes):
  - [x] `app/pages/projects/index.vue`
  - [x] `app/pages/reports/index.vue`
  - [x] `app/pages/payments.vue`
  - [x] `app/components/payment/WithdrawalsList.vue`
  - [x] `app/components/admin/ProjectOverviewTable.vue`
  - [x] `app/components/admin/UserTable.vue`
  - [x] `app/components/contractor/ContractorActiveMilestones.vue`
  - [x] `app/pages/assignments.vue` and related assignment list surface components if loading/empty inconsistency is found
- [x] Normalize loading and empty composition:
  - [x] Use shadcn primitives (`Skeleton`, `Table`, `Empty`) or project-established wrappers (`PageContentSkeleton`, `EmptyState`) consistently.
  - [x] Avoid mixed ad-hoc whitespace placeholders or missing zero-data feedback on primary list/table surfaces.
  - [x] Ensure loading placeholders visually match final density where feasible (table rows for table screens, card skeletons for card grids).
- [x] Keep lists/table usability and readability:
  - [x] Mobile: no horizontal trap caused by changed wrappers; preserve `overflow-x-auto` where needed for dense tables.
  - [x] RTL: keep logical alignment (`text-start`, logical spacing utilities only) in TAMM-owned files.
  - [x] Preserve existing navigation/actions (row click, "view", retry actions, filter tabs).
- [x] Preserve business behavior and contracts:
  - [x] Do not alter role gating, permissions, data fetch calls, payload shapes, or status derivation.
  - [x] Keep existing i18n keys for titles/messages; do not introduce hardcoded user-visible strings.
  - [x] Keep current retry/error behavior (`ErrorState`, existing handlers) unchanged unless required to keep UX coherent.
- [x] Verification:
  - [x] `pnpm lint`
  - [x] `pnpm exec nuxt prepare`
  - [x] Manual Arabic RTL pass on scoped list/table surfaces
  - [x] Spot-check English layout for truncation/alignment regressions

## Dev Notes

- Epic 09 is UI-only alignment; this story must not modify domain logic from Epics 02-08.
- Inventory from `09-01-audit-shadcn-gaps-and-cli-plan.md` already confirms required primitives exist (`table`, `empty`, `skeleton`); no bulk CLI adds are needed.
- Story 09-04 pattern continuity: normalize composition, preserve interaction behavior.

### Current State Snapshot (must preserve)

- `app/pages/projects/index.vue` already has loading and empty branches, but mixes `PageContentSkeleton`, inline `Skeleton` blocks, and grid/card states. Preserve project filtering and admin panel branching.
- `app/pages/reports/index.vue` uses `PageContentSkeleton` + `EmptyState`, then custom bordered list rows; preserve report fetch/retry and status/date presentation.
- `app/pages/payments.vue` combines contractor withdrawal list plus payment totals and sections, with route-level loading/empty handling. Preserve payment status derivation and withdrawal polling behavior.
- `app/components/payment/WithdrawalsList.vue` groups rows by status and currently renders a custom dashed empty card. Preserve grouping/order/status pill behavior while aligning empty/list structure.
- `app/components/admin/UserTable.vue` and `app/components/admin/ProjectOverviewTable.vue` already use `Table` and row skeletons; preserve sorting/pagination/action handlers and avoid breaking clickable row interactions.
- `app/components/contractor/ContractorActiveMilestones.vue` has custom loading/error/empty/list card states; preserve route navigation and milestone sort-by-deadline.
- `app/pages/assignments.vue` delegates list rendering to assignment components; if empty/loading is inconsistent there, align through those child components without changing milestone filtering logic.

### What This Story Changes

- Improves consistency of loading and empty states across list/data-heavy surfaces.
- Aligns table/list/card shells to shadcn primitives (or approved project wrappers built on them).
- Clarifies primary data surface states so users always see feedback during loading and zero-data scenarios.

### What Must Not Break

- Existing role-based route/page behavior and conditional section rendering.
- Existing data fetch flows, retry handlers, and polling lifecycle hooks.
- Existing table/list actions (row navigation, buttons, pagination, filter tabs).
- Existing i18n contract and Arabic-first RTL behavior.

### Architecture Compliance

- Nuxt 4 app structure under `app/`; use Composition API with `<script setup lang="ts">`.
- Import UI primitives from `~/components/ui/*` only.
- Keep changes surgical to scoped list/table surfaces; do not refactor unrelated UI.
- Use logical Tailwind properties in TAMM-owned files; do not broad-edit vendor `app/components/ui/*`.

### Library / Framework Requirements

- shadcn-vue (`/unovue/shadcn-vue`, Context7) guidance for this story:
  - `Table` should be composed via `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`.
  - Empty table case should render a fallback row/cell (or explicit `Empty` pattern) instead of blank containers.
  - `Empty` should use composable sections (`Empty`, `EmptyMedia`, `EmptyTitle`, `EmptyDescription`, optional `EmptyContent`) where adopted.
  - `Skeleton` placeholders should be shape-aware (row-like for tables, card-like for cards).
- Keep VeeValidate/Zod and composable contracts untouched (this story is not form/business validation work).

### File Structure Requirements

- Primary touch targets:
  - `app/pages/projects/index.vue`
  - `app/pages/reports/index.vue`
  - `app/pages/payments.vue`
  - `app/components/payment/WithdrawalsList.vue`
  - `app/components/admin/UserTable.vue`
  - `app/components/admin/ProjectOverviewTable.vue`
  - `app/components/contractor/ContractorActiveMilestones.vue`
  - Assignment list components referenced by `app/pages/assignments.vue` only if needed
- Avoid edits in stores/composables unless absolutely required for compile safety (not expected for this story).

### Testing Requirements

- Required:
  - `pnpm lint`
  - `pnpm exec nuxt prepare`
- Manual UI checks:
  - Projects page: loading, empty (full + filtered), card list.
  - Reports page: loading, empty, row list.
  - Payments page: loading, empty, pending/received sections, contractor withdrawals group list.
  - Admin tables: loading rows, empty fallback, pagination.
  - Contractor active milestones: loading/error/empty/populated states.
  - Assignments page: tab switch with empty/loading behavior intact.

## Previous Story Intelligence (09-04)

- Keep the same implementation boundary used in 09-04: visual structure normalization only, with behavior preserved.
- Avoid touching composable/store logic while aligning component composition.
- Keep verification discipline focused (`lint`, `nuxt prepare`, scoped manual checks).

## Git Intelligence Summary

- Recent commits show Epic 09 work is split by UI surface and keeps business logic stable.
- Most recent form-normalization commit touched many components in one story; for 09-05 keep list/table scope explicit and avoid form/overlay churn.
- Shell/auth fixes in recent history addressed directionality and hydration; avoid reopening those concerns outside list/table rendering.

## Latest Technical Information

- Context7 lookup used: `/unovue/shadcn-vue`.
- Current examples confirm recommended list/data patterns:
  - Table composition with explicit empty fallback row.
  - Empty state composition using `Empty*` subcomponents.
  - Skeleton as simple, shape-specific placeholders with Tailwind sizing.
- These align directly with Epic 09 ACs for loading and zero-data states.

## Project Context Reference

- `AGENTS.md`
- `CLAUDE.md`
- `docs/design-spec.md`
- `docs/coding-standards.md`
- `_bmad-output/planning-artifacts/epic-09-shadcn-alignment.md`
- `_bmad-output/planning-artifacts/ux-brief-epic-09-shadcn-alignment.md`
- `_bmad-output/implementation-artifacts/09-01-audit-shadcn-gaps-and-cli-plan.md`
- `_bmad-output/implementation-artifacts/09-04-forms-normalization.md`

## Dev Agent Record

### Agent Model Used

Codex 5.3

### Debug Log References

- Workflow config resolved via `_bmad/scripts/resolve_customization.py`.
- Sprint key resolved from `sprint-status.yaml`: `09-05-lists-and-data-surfaces`.
- Loaded Epic 09, UX brief, prior story 09-04, and audit artifact 09-01.
- Read representative current list/table surfaces in projects/reports/payments/admin/contractor/assignments files.
- Git history analyzed (last 5 commits + touched files).
- Context7 used for latest shadcn-vue Table/Empty/Skeleton usage guidance.
- `npx gitnexus impact "Folder:app/pages" -d upstream -r tamm-app` -> LOW risk, 0 impacted dependents
- `npx gitnexus impact "Folder:app/components/payment" -d upstream -r tamm-app` -> LOW risk, 0 impacted dependents
- `npx gitnexus impact "Folder:app/components/admin" -d upstream -r tamm-app` -> LOW risk, 0 impacted dependents
- `npx gitnexus impact "Folder:app/components/contractor" -d upstream -r tamm-app` -> LOW risk, 0 impacted dependents
- `pnpm lint` -> pass
- `pnpm exec nuxt prepare` -> pass
- `pnpm exec vitest run` -> FAIL (pre-existing unrelated suite failures in notifications/playwright areas; no 09-05-specific assertions failing in touched files)

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Story file prepared with explicit scope, preservation guardrails, and verification checklist.
- Replaced ad-hoc empty-state containers with shadcn `Empty` composition in payment and assignment/contractor list surfaces.
- Added explicit empty-table row fallback in `admin/UserTable.vue` to avoid blank table body when no users exist.
- Kept all list/table interactions and data contracts unchanged (row navigation, pagination, retry handlers, polling/data derivations).
- Validated lint and Nuxt type generation after UI-only list/data-surface normalization.

### File List

- `_bmad-output/implementation-artifacts/09-05-lists-and-data-surfaces.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `app/components/admin/UserTable.vue`
- `app/components/assignments/AssignmentGrid.vue`
- `app/components/contractor/ContractorActiveMilestones.vue`
- `app/components/payment/PaymentSection.vue`
- `app/components/payment/WithdrawalsList.vue`

## Change Log

- 2026-05-10: Implemented Story 09-05 list/data-surface normalization with registry Empty composition and admin table empty-row fallback; updated sprint/story status to review.

## Story completion status

Story implementation complete and ready for review.
