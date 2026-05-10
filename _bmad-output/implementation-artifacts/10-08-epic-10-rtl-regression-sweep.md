# Story 10.8: Epic 10 RTL & regression sweep

Status: done

<!-- Closure sweep for Epic 10 — Arabic-first verification + hygiene without mass-editing vendor ui/. -->

## Story

As a **team shipping Epic 10 product experience work**,  

I want **an Arabic-first RTL and regression pass scoped to Epic 10 surfaces plus inherited shell conventions**,  

So that **trust/clarity/speed features do not ship RTL, i18n, or a11y regressions**.

## Acceptance Criteria

1. **Checklist lineage:** Adapt every checklist row from `_bmad-output/planning-artifacts/ux-brief-epic-09-shadcn-alignment.md` and extend with **Epic 10 surface checks** (stores below). Each row is **Verified**, **Waived** (with rationale), or **N/A** (with rationale) in **UX brief & Epic 10 matrix** in this file.

2. **Automated guard:** Existing Vitest guard `tests/unit/rtl/tamm-no-physical-tailwind.spec.ts` remains green (`pnpm exec vitest run tests/unit/rtl/tamm-no-physical-tailwind.spec.ts`). TAMM-owned `app/**/*.vue` outside `app/components/ui/**` must not use physical directional Tailwind (`ml-*`, `mr-*`, `pl-*`, `pr-*`, `left-*`, `right-*`, `text-left`, `text-right`, `border-l-*`, `border-r-*`, `rounded-l-*`, `rounded-r-*`). Vendor `components/ui/**` remains out of scope per Epic 09 precedent.

3. **Epic 10 surfaces — static verification:** Document outcome for each delivery area (files/composables touched in stories **10-01** … **10-07**): command palette, milestone trust timeline, role dashboard charts, admin list density, mutation feedback patterns, contextual HoverCard helpers, Settings shortcut panel — focusing on **logical Tailwind**, **`dir="ltr"`** only where intentional (e.g. keyboard chords, chart SVG), **i18n-only strings**, **focus/Esc** on overlays already specified in prior stories.

4. **Quality gates:** `pnpm lint`, `pnpm exec vitest run`, and `pnpm exec nuxt build` succeed after any fixes.

5. **Sprint board:** On acceptance, `10-08-epic-10-rtl-regression-sweep` → `done`; `epic-10` → `done` when this is the final Epic 10 story.

6. **Waivers log:** All waived items appear in the matrix in this file (short markdown log under `implementation-artifacts/10-08-*` — this document).

## Tasks / Subtasks

- [x] Record **UX brief & Epic 10 matrix** (AC: 1, 6).
- [x] Run RTL Vitest guard + full `pnpm exec vitest run`; fix any TAMM Vue violations (AC: 2, 4).
- [x] Static review Epic **10-01**–**10-07** touchpoints; note findings or Verified in matrix / Dev Agent Record (AC: 3).
- [x] Run `pnpm lint` and `pnpm exec nuxt build` (AC: 4).
- [x] Update `_bmad-output/implementation-artifacts/sprint-status.yaml`: story **done**, **epic-10** **done**, refresh `last_updated` (AC: 5).

## UX brief & Epic 10 matrix

| Source | Item | Status | Notes |
|--------|------|--------|-------|
| UX brief § Global | Focus order / keyboard | Verified | Overlays (palette, dialogs, sidebar) follow established Radix/shadcn patterns from prior epics; Epic 10 did not replace shell focus plumbing. |
| UX brief § Global | Loading — no blank primary surfaces | Verified | Epic 10 charts/timelines use Skeleton/Card shells per story specs. |
| UX brief § Global | Errors / toasts | Verified | Story **10-05** normalized Sonner + AlertDialog; no duplicate toast pattern regression flagged in static review. |
| UX brief § Global | Touch targets ≥ ~44px | Waived | Full device matrix deferred to pre-release QA (same lineage as **09-08**). |
| UX brief § Global | No hardcoded user-visible strings | Verified | Epic 10 deliveries use `i18n` keys; spot-check Settings + palette + helpers. |
| UX brief § Shell | Sidebar collapse RTL | Verified | No shell regression required beyond existing **Epic 09** alignment; Story **10-01** palette is overlay-only. |
| UX brief § Shell | Main scroll / topbar | Verified | Unchanged in Epic 10 scope. |
| UX brief § Shell | Mobile navigation | Waived | Full mobile trap matrix deferred (aligned with **09-08** waiver). |
| UX brief § Forms | Labels / aria | Verified | Story **10-06** helpers use HoverCard/tooltips without replacing label associations. |
| UX brief § Forms | Submit loading / double-submit | Verified | No new raw forms in Epic 10 sweep scope beyond existing normalized flows. |
| UX brief § Forms | Validation RTL readability | Verified | TAMM paths use logical utilities; vendor ui excluded. |
| UX brief § Lists | Empty states | Verified | Dashboard charts (**10-03**) use Empty when series absent; admin (**10-04**) preserves table density patterns. |
| UX brief § Lists | Dense tables | Verified | Admin column presets (**10-04**) reviewed for truncation/tooltips — follows established patterns. |
| UX brief § Dashboards | Primary sections above fold | Verified | Role dashboards unchanged structurally except selective KPI blocks (**10-03**). |
| UX brief § Dashboards | Stats / locale | Verified | Formatters / locale numerals unchanged; charts may use `direction: ltr` on SVG where documented (**09-07** precedent). |
| UX brief § Performance | Fonts / heavy imports | Verified | No Epic 10 change to font loading or root layout imports in this sweep. |
| Epic **10-01** | Command palette RTL + Esc | Verified | Logical layout; overlay focus trap per AC lineage from epic **10** PRD slice. |
| Epic **10-02** | Milestone trust timeline RTL | Verified | Timeline stacking uses logical spacing/read order in Arabic. |
| Epic **10-03** | Charts RTL readability | Verified | `RoleDashboardPrimaryChart.vue` uses scoped `.chart-ltr { direction: ltr; }` on the SVG footprint — intentional numeric axis readability (same lineage as Epic **09** chart note). |
| Epic **10-04** | Admin density / Sheet mobile | Verified | Sheet + column controls avoid stating physical left/right in TAMM templates. |
| Epic **10-05** | Mutation feedback consistency | Verified | Toast/dialog patterns; no i18n regression spot-check. |
| Epic **10-06** | HoverCard helpers | Verified | Helpers i18n-only; no `v-html`. |
| Epic **10-07** | Settings shortcuts | Verified | Logical page layout; **`dir="ltr"`** on **`Kbd`** chord clusters intentional for keyboard glyphs. |

## Dev Notes

### Developer guardrails

| Topic | Instruction |
|-------|-------------|
| Stack | Nuxt 4 **`app/`** tree; **no new packages** for this sweep. |
| Vendor boundary | Do **not** mass-edit **`app/components/ui/**`** for RTL ([Source: `_bmad-output/implementation-artifacts/09-08-rtl-regression-sweep.md`]). |
| RTL utilities | Use **`ms-*` / `me-*` / `ps-*` / `pe-*` / `start-*` / `end-*` / `text-start` / `text-end`** in TAMM-owned Vue. |
| Charts | If Recharts/SVG needs stable axis direction, **`style="direction: ltr"`** on chart wrapper is an acceptable intentional exception ([Source: **`09-08`** Dev Notes chart exception]). |

### Files to touch (expected)

| Action | Path |
|--------|------|
| UPDATE | `_bmad-output/implementation-artifacts/10-08-epic-10-rtl-regression-sweep.md` (matrix + Dev Agent Record) |
| UPDATE | `_bmad-output/implementation-artifacts/sprint-status.yaml` |
| MAYBE | `tests/unit/rtl/tamm-no-physical-tailwind.spec.ts` (comment/traceability only unless regex scope changes) |
| MAYBE | TAMM `app/**/*.vue` outside `components/ui/**` — **only if** guard fails |

### References

- [Source: `_bmad-output/planning-artifacts/epic-10-product-experience-advancement.md` — Story **10-08**]
- [Source: `_bmad-output/planning-artifacts/ux-brief-epic-09-shadcn-alignment.md`]
- [Source: `_bmad-output/implementation-artifacts/09-08-rtl-regression-sweep.md`]
- [Source: `AGENTS.md` — RTL / i18n rules]

## Dev Agent Record

### Agent Model Used

Composer (Cursor agent)

### Debug Log References

- RTL guard: `pnpm exec vitest run tests/unit/rtl/tamm-no-physical-tailwind.spec.ts` → pass; full suite **336** tests pass.
- Physical Tailwind `rg` on `app/**/*.vue` outside `components/ui` → **no matches** (vendor-only animation tokens such as `data-[side=left]` remain inside `ui/`).

### Completion Notes List

- Matrix completes UX brief lineage + Epic **10** surface rows; touch/mobile smoke waived consistently with **09-08**.
- Intentional LTR: `app/pages/settings/index.vue` **`dir="ltr"`** on **`Kbd`** chord rows; `RoleDashboardPrimaryChart.vue` **`.chart-ltr`** for chart SVG.

### File List

- `_bmad-output/implementation-artifacts/10-08-epic-10-rtl-regression-sweep.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `tests/unit/rtl/tamm-no-physical-tailwind.spec.ts`

### Change Log

- **2026-05-10:** Story **10-08** implemented — matrix + guard verification + sprint marks Epic **10** complete.

## Code review (adversarial triage)

### Blind Hunter

- [x] **Guard false positives** — Regex targets utility prefixes only; `data-[side=left]` in vendor overlays lives under `components/ui/**` and is excluded by design.

### Edge Case Hunter

- [x] **Chart + shortcuts** — Two sanctioned LTR islands documented (`.chart-ltr`, Settings **`dir="ltr"`**); surrounding layout remains logical/Tailwind-logical.

### Acceptance Auditor

- [x] UX brief lineage represented in matrix with explicit waivers; Epic **10** rows covered; automated guard green; quality gates run.

## Story completion status

Implemented, reviewed, and marked **done**. Epic **10** closed on sprint board per AC 5.
