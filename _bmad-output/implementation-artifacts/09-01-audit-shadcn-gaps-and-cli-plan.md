# Story 9.1: Audit shadcn gaps & CLI plan

**Story key:** `09-01-audit-shadcn-gaps-and-cli-plan`  
**Epic:** 09 — shadcn-vue alignment (UI-only)  
**Status:** done  

_Sprint board: this story is **done**. This file is the canonical audit artifact and implementation guardrail set for stories **09-02 through 09-08**. Re-run create-story only to refresh wording; do not reopen scope without a new epic/story._

<!-- Ultimate story context: exhaustive audit + downstream guardrails. For validate-create-story / dev-story on follow-ons, cite this file as "inventory source of truth". -->

---

## Story

**As a** maintainer,  
**I want** an inventory of bespoke UI versus registry coverage plus an explicit, justified CLI add plan,  
**so that** Epics **09-02+** refactor safely without package thrash, duplicate primitives, or accidental behavior/API changes.

---

## Acceptance criteria

1. [x] Domain folders and roles documented for refactor targeting (which folders map to which later stories).
2. [x] Full `app/components/ui/*` primitive inventory recorded (folder-level).
3. [x] Gap table plus RTL grep summary recorded (high-level; vendor `ui/*` called out separately).
4. [x] CLI adds: **no bulk install required**; add per story when justified (document rationale at PR time).
5. [x] **Badge vs `ui/pill` vs `common/Pill`** documented; **`ui/pill` folder layout** fixed so `nuxt prepare` does not error (`ENOTDIR` / orphan file-as-folder pattern).

---

## Tasks / Subtasks

- [x] Inventory `app/components/ui` (61 primitive folders).
- [x] Map domain folders (`layout`, `auth`, feature areas) to Epic 09 stories **09-02–09-07**.
- [x] Produce gap table: area → target primitive/block → installed Y/N → owning story.
- [x] Run directional Tailwind grep on **TAMM-owned** Vue (exclude or separately note `components/ui/**`).
- [x] Document Pill/Badge split and resolve `ui/pill` module layout + consuming imports (`ProjectCard`, `ProposalCard`, etc.).
- [x] Record CLI policy (story-time `pnpm dlx shadcn-vue@latest add <name>` with one-line justification).

### Review Findings

_Findings from BMAD code review (`git diff 2cd1965^..2cd1965`), Step 2 parallel layers + Step 3 triage. Dismissed as noise: truncated snapshot artifact for Blind Hunter; alleged Inter/`--font-arabic` regressions (fonts load via `nuxt.config` `<link>` and `--font-arabic` is defined in `tailwind.css`); icon map fallback in `navIcons.ts`; sprint YAML timestamp churn._

#### decision-needed

- [x] [Review][Decision] **Same commit mixes Story 09-01 (audit + Pill module) with Story 09-02 (shell)** — **Resolved 2026-05-10:** Treat historic `2cd1965` as Epic 09 kickoff; **future PRs** keep shell-only work under story **09-02** scope.

- [x] [Review][Decision] **Default locale vs “Arabic RTL first” product rule** — **Resolved 2026-05-10:** `nuxt.config` **`defaultLocale: 'ar'`** aligned with AGENTS.md Arabic-first; `i18n_locale` cookie still overrides for users who switch to English.

#### patch

- [x] [Review][Patch] **Role chip `$t` key points at object root, not `label` leaf** — Fixed `getDisplayNameForRole` → `roles.*.label`; added `roles.unknown.label` (ar/en).

- [x] [Review][Patch] **Supervisor reviews breadcrumb title key wrong** — `pageTitle: 'pages.reviews.title'`.

- [x] [Review][Patch] **Mobile sidebar may stay open after in-sheet navigation** — `watch(route.fullPath)` → `setOpenMobile(false)` in `AppSidebar.vue`.

- [x] [Review][Patch] **Sheet sidebar hides visible close control** — Removed `[&>button]:hidden` from mobile `Sidebar` sheet; sheet close control uses `end-4` in `SheetContent.vue`.

- [x] [Review][Patch] **Account dropdown vs RTL right-edge sidebar** — `accountMenuSide`: RTL desktop → `left`, LTR → `right`, mobile → `bottom`; logout guarded with `:disabled="auth.isLoading"`.

#### defer

- [x] [Review][Defer] **Global `--radius-*` token rescaling** [`tailwind.css`] — deferred; verify visually with design-spec / stakeholder sign-off.

- [x] [Review][Defer] **Third-party avatar URLs on `AvatarImage`** [`SidebarUserMenu.vue`] — deferred privacy/hardening unless security story scope.

- [x] [Review][Defer] **Breadcrumb separator direction in RTL** [`Topbar.vue` / `BreadcrumbSeparator`] — deferred cosmetic; mirror chevron if UX requests.

---

## Dev Notes

### Epic cross-story map (use when scoping PRs)

| Story | Primary targets | Intent |
|-------|-----------------|--------|
| **09-02** | `app/layouts/default.vue`, `app/components/layout/*` | Shell aligns with shadcn **sidebar / dashboard** block idioms; RTL-safe logical utilities in TAMM-owned files only. |
| **09-03** | `app/layouts/auth.vue`, `app/components/auth/*`, auth pages | Registry **Card**, **Field**, **Input**, **Button**; optional login **block** only if i18n/branding stay correct. |
| **09-04** | Forms across projects, milestones, reports, payments, admin users | Visual normalization to **Field** / **Form** patterns; **VeeValidate + Zod unchanged**. |
| **09-05** | Lists, tables, cards | **Table**, **Card**, **Empty**, **Skeleton** for loading/zero-data per `docs/design-spec.md`. |
| **09-06** | Ad-hoc overlays | Standardize on **Dialog**, **Sheet**, **DropdownMenu**, **Popover**; no duplicate “mini-modal” divs. |
| **09-07** | Role dashboards | Compose like **dashboard-01**-style sections using **real composables/data** — never block demo JSON. |
| **09-08** | RTL / UX sweep | Checklist: `_bmad-output/planning-artifacts/ux-brief-epic-09-shadcn-alignment.md`. |

**Sources:** [_bmad-output/planning-artifacts/epic-09-shadcn-alignment.md](../planning-artifacts/epic-09-shadcn-alignment.md)

---

## Developer context (guardrails)

### Technical requirements

- **UI-only:** No intentional changes to Pinia stores, composables, Laravel/API contracts, permission checks, or `utils/statusMachine.ts` transitions.
- **Imports:** Primitives only from `~/components/ui/...` — never from a `shadcn-vue` package path.
- **i18n:** All user-visible strings in `i18n/ar.json` and `i18n/en.json`.
- **Tailwind:** In **TAMM-owned** Vue (excluding vendor `components/ui/**` unless a deliberate upstream alignment story exists), use logical utilities only: `ms-*`, `me-*`, `ps-*`, `pe-*`, `border-s-*`, `border-e-*`, `start-*`, `end-*`, `text-start` / `text-end`.
- **Theming:** Prefer CSS variables in `app/assets/css/tailwind.css` (shadcn default theme pattern); avoid one-off forks of `components/ui/*` for color.

### Architecture compliance

- **Nuxt 4:** Application code under `app/` (pages, components, composables, middleware, layouts).
- **Stack locks:** No new packages beyond AGENTS.md list without explicit approval; use `$fetch` / `useFetch`, Pinia, VeeValidate + Zod as existing.
- **Design authority:** `docs/design-spec.md` for shell (§3), primitives (§4–§5), sidebars (§6); Epic 09 **does not redefine UX**, it aligns implementation to registry/blocks.

### Library / framework requirements

- **shadcn-vue:** Install/update primitives via CLI copied into repo: `pnpm dlx shadcn-vue@latest add <component>` (justify per PR).
- **`components.json`:** Style **new-york**, Tailwind CSS entry `app/assets/css/tailwind.css`, `cssVariables: true`, TypeScript on. Aliases: `@/components/ui` etc. **`rtl` flag in `components.json` is `false`** — RTL remains enforced in **app composition**, not assumed from generator defaults.

### File structure requirements

- **Registry UI:** `app/components/ui/<primitive>/` — each primitive is a folder with Vue parts owned by the team.
- **Domain UI:** `app/components/layout`, `auth`, `common`, feature folders (`project`, `milestone`, `payment`, `report`, `admin`, `notifications`, …) — target for composition cleanup, not new parallel design systems.
- **`ui/pill`:** Must remain a **proper directory module** (index/barrel pattern per project convention). Do not leave orphan `Pill.vue` at `ui/` root that breaks Nuxt module resolution.

### Testing requirements

- After substantive UI stories: **`pnpm lint`** and **`pnpm exec nuxt prepare`** clean on touched areas.
- Story **09-08**: smoke paths (login + one dashboard per role + one CRUD path as timeboxed) plus UX brief checklist.
- Prefer extending existing Vitest / Playwright coverage where overlay or shell behavior is fragile; audit story itself is **documentation-only** (no new automated tests required for 09-01).

---

## Audit results (source of truth)

### Domain folders (refactor targets for 09-02+)

| Folder | Role |
|--------|------|
| `app/components/layout` | Shell: sidebar, topbar, user menu — align with sidebar/dashboard **blocks** |
| `app/components/auth` | Login / forgot-password — registry Field, Input, Button |
| `app/components/common` | Shared non-registry helpers (`StatusTag`, `common/Pill`) |
| `app/components/project`, `milestone`, `payment`, `report`, `admin`, `notifications`, … | Feature cards, dialogs, tables — prefer Card, Table, Dialog, Empty, Skeleton |

### Installed `app/components/ui` primitives (**61** folders)

`accordion`, `alert`, `alert-dialog`, `aspect-ratio`, `avatar`, `badge`, `breadcrumb`, `button`, `button-group`, `calendar`, `card`, `carousel`, `chart`, `checkbox`, `collapsible`, `combobox`, `command`, `context-menu`, `dialog`, `drawer`, `dropdown-menu`, `empty`, `field`, `form`, `hover-card`, `input`, `input-group`, `input-otp`, `item`, `kbd`, `label`, `menubar`, `native-select`, `navigation-menu`, `number-field`, `pagination`, `pill`, `pin-input`, `popover`, `progress`, `radio-group`, `range-calendar`, `resizable`, `scroll-area`, `select`, `separator`, `sheet`, `sidebar`, `skeleton`, `slider`, `sonner`, `spinner`, `stepper`, `switch`, `table`, `tabs`, `tags-input`, `textarea`, `toggle`, `toggle-group`, `tooltip`.

Coverage is **strong**; Epic 09 is primarily **composition cleanup**, not mass CLI installs.

### Badge vs Pill (do not conflate)

| Asset | Purpose |
|-------|---------|
| `~/components/ui/badge` | Registry badge — use when semantics match shadcn badge patterns. |
| `~/components/ui/pill` | Small rounded chip (`variant`, slot) used in project cards — **folder module** layout required for `nuxt prepare`. |
| `~/components/common/Pill.vue` | Label + **tone** for milestone/status via `StatusTag` — **different API**. Do **not** merge with `ui/pill` without a dedicated story. |

### Gap table (high level)

| Area | Target | Installed? | Action |
|------|--------|------------|--------|
| App shell | `SidebarProvider`, `Sidebar`, `SidebarInset` + block-style header | Yes (`sidebar`) | **09-02**: compare to [shadcn-vue blocks](https://www.shadcn-vue.com/blocks) |
| Forms | `Field`, `Form`, `Input`, `Button` | Yes | **09-04**: sweep raw wrappers |
| Data tables | `Table` (+ TanStack patterns where used) | Yes | **09-05** |
| Empty / loading | `Empty`, `Skeleton` | Yes | **09-05** |
| Dashboards | Block-style section composition | Partially | **09-07**: real data only |

### RTL grep summary

- **`app/**/*.vue` excluding `components/ui/**`:** No matches for `\b(ml|mr|pl|pr)-` / physical `left-*`/`right-*` digit-spacing utilities in domain code audited at story time — **aligns with logical Tailwind guidance** for TAMM-owned surfaces.
- **`components/ui/**`:** Upstream shadcn-vue still contains physical `left`/`right`/`pl`/`pr` in some primitives (menus, popovers, carousel, …). Treat as **vendor baseline**; wholesale edits break upgrades — only wrap or patch with upstream-aligned strategy.

### Recommended CLI adds (ordered)

_No batch installs required._ Add primitives **only when a story introduces a pattern not already installed**, with a one-line justification in the PR.

---

## Previous story intelligence (continuity)

- **Epic 08 (dashboards)** delivered role-specific dashboards and routing cleanup; Epic **09** explicitly builds on that UI **without** changing data or permission gates — preserve dashboard section ordering intent when applying **09-07**.
- There is **no prior story inside Epic 09** before **09-01**; downstream stories must treat this audit as the **ordering and scope** authority.

---

## Git intelligence summary

Recent relevant commits (patterns for Epic 09 work):

- `feat(ui): Epic 09 shadcn alignment — shell, Pill module, artifacts` — Pill module layout + alignment groundwork.
- `feat: role dashboards, routing cleanup, loading skeletons, i18n fixes` — dashboard composition precedes shadcn polish.
- `feat(auth): two-column split layout for login and password flows` — auth surfaces evolve toward **09-03** normalization.

---

## Latest technical notes (maintenance)

- Prefer **`pnpm dlx shadcn-vue@latest add`** when adding primitives so CLI matches current registry behavior; always commit generated `components/ui` changes as owned source.
- **`components.json`** `rtl: false` means generator defaults are LTR-oriented; **application RTL** remains a first-class requirement via layout, `dir`, and logical Tailwind in TAMM files.

---

## Project context reference

- No `project-context.md` found in-repo at workflow run; authoritative project rules: **`AGENTS.md`**, **`CLAUDE.md`**, **`docs/design-spec.md`**, **`docs/coding-standards.md`**.

---

## References

- [Epic 09 planning](../planning-artifacts/epic-09-shadcn-alignment.md)
- [UX brief for 09-08 sweep](../planning-artifacts/ux-brief-epic-09-shadcn-alignment.md)
- [Sprint status](./sprint-status.yaml)
- [Source: components.json](../../components.json) — shadcn-vue project config
- [Source: docs/design-spec.md](../../docs/design-spec.md) — shell and primitives

---

## Change Log

| Date | Summary |
|------|---------|
| 2026-05-10 | `bmad-dev-story` invoked on completed audit artifact; no code changes; status remains **done** (see Completion Notes). |
| 2026-05-10 | Post–code-review remediation: Arabic default locale, i18n role labels, shell/mobile/dropdown UX (see Review Findings — all patch + decision items checked). |

---

## Dev Agent Record

### Agent Model Used

Composer (Cursor agent) — code-review follow-up patches (2026-05-10).

### Debug Log References

- `pnpm lint` — **0 errors**, **1 warning** (pre-existing `AssignEngineersForm.vue` `vue/require-explicit-emits`).
- `pnpm exec vitest run tests/unit/utils/roleRoutes.spec.ts` — **PASS** after `getDisplayNameForRole` key updates.

### Completion Notes List

- **2026-05-10:** Initial audit recorded; `ui/pill` folder structure fixed; imports updated; `pnpm exec nuxt prepare` clean.
- **2026-05-10:** Story file expanded to full BMAD create-story context (guardrails, cross-story map, git/design references) while keeping sprint status **done**.
- **2026-05-10 (dev-story):** Workflow executed against explicitly provided story path. All tasks and AC already satisfied; **Status stays `done`** and **`sprint-status.yaml` stays `done`** (workflow Step 9 “review” transition skipped — would regress a finished audit story). Next implementation work: run **`create-story` → `dev-story`** on **`09-02-app-shell-alignment`** (move sprint row `ready-for-dev` → `in-progress` per normal lifecycle).
- **2026-05-10 (code-review remediation):** Applied recommended UX/i18n fixes: **`defaultLocale: 'ar'`**, role display keys **`.label`**, **`pages.reviews.title`**, mobile sidebar **route watcher** closes sheet, **visible sheet close** (removed sidebar hide on dialog close), RTL-aware **account menu** side, **logout disabled** while `auth.isLoading`. Policy: future shell-only changes tracked under **09-02**.

### File List

- `nuxt.config.ts`
- `app/utils/roleRoutes.ts`
- `app/components/layout/AppSidebar.vue`
- `app/components/layout/SidebarUserMenu.vue`
- `app/components/ui/sidebar/Sidebar.vue`
- `app/components/ui/sheet/SheetContent.vue`
- `app/pages/reviews/index.vue`
- `i18n/locales/en.json`
- `i18n/locales/ar.json`
- `tests/unit/utils/roleRoutes.spec.ts`
- `_bmad-output/implementation-artifacts/09-01-audit-shadcn-gaps-and-cli-plan.md` (this file)

---

## Story completion status

**Ultimate context engine analysis completed** — comprehensive developer guide for Epic **09-02+** retained; implementation work for **09-01** is **complete** per acceptance criteria and `development_status` in `sprint-status.yaml`.
