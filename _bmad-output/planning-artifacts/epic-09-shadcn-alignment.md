# Epic 09 — shadcn-vue alignment (UI-only)

> **BMAD board status:** **Done** (all stories `09-01`–`09-08` complete). Source of truth: `_bmad-output/implementation-artifacts/sprint-status.yaml`.

> **BMAD context:** Brownfield cleanup after Epics 01–08. Standardize layouts and markup on **shadcn-vue registry primitives** ([Components](https://www.shadcn-vue.com/docs/components)) and **blocks** ([Blocks](https://www.shadcn-vue.com/blocks)) where they reduce bespoke CSS — **without** changing Pinia stores, composables, API contracts, or permission/status logic.
>
> **Theming only:** Visual adjustments via CSS variables in `app/assets/css/tailwind.css` ([Default theme CSS](https://www.shadcn-vue.com/docs/theming#default-theme-css)), not ad-hoc forks of `app/components/ui/*`.
>
> Read `CLAUDE.md`, `AGENTS.md`, `docs/design-spec.md`, and `docs/coding-standards.md` before implementing.

---

## Design reference

> Full product chrome: `docs/design-spec.md` (shell §3, primitives §4–§5, sidebars §6).
>
> This epic **does not redefine product UX**; it **aligns implementation** with the registry and blocks so upgrades and theming stay cheap.

### Shell & navigation (Stories 09-02, 09-07)

- **`default` layout:** `SidebarProvider` + `SidebarInset` pattern already in use — compare spacing, header height, and collapsible behavior to sidebar/dashboard **blocks** (e.g. inset sidebar + breadcrumb header patterns).
- **Mobile:** Preserve existing behavior; any block borrow must keep RTL-safe logical utilities in **TAMM-owned** components (`layout/*`).
- **Dark mode:** When `.dark` exists on `<html>`, tokens come from `tailwind.css`; no duplicate color literals in layout wrappers.

### Auth surfaces (Story 09-03)

- Routes: `/login`, forgot-password flows — prefer registry **Card**, **Field**, **Input**, **Button**; optional **login** block layout only if it drops in without fighting `auth` layout + i18n.

### Forms (Story 09-04)

- Schema-first **VeeValidate + Zod** unchanged.
- Visual-only normalization: **Field**, **FieldLabel**, **FieldError**, **Form** from `~/components/ui/*` where forms still use raw wrappers.

### Lists, tables, empty states (Story 09-05)

- Prefer **Table**, **Card**, **Empty**, **Skeleton** from registry for loading and zero-data paths referenced in `design-spec.md` §5.7.

### Overlays (Story 09-06)

- Standardize on **Dialog**, **Sheet**, **DropdownMenu**, **Popover** usage patterns (trigger + content composition); no duplicate “mini-modal” divs.

### Dashboards (Story 09-07)

- Compose sections like **dashboard-01**-style blocks (stats row → chart/table regions) using **existing composables/data** — never ship block demo JSON.

### RTL & QA (Story 09-08)

- Run checklist in `planning-artifacts/ux-brief-epic-09-shadcn-alignment.md`.
- **TAMM-owned** Vue files: logical Tailwind only (`ms-*`, `ps-*`, `border-s-*`, `start-*`, `text-start`). Upstream `components/ui/*` may still contain physical `left/right` from vendor; do not mass-edit without an upstream-aligned strategy.

---

## Epic goal

The codebase consistently uses **registry primitives and selective blocks** for UI structure, with **theme tokens** as the single customization surface. No role loses functionality; Arabic RTL remains the default verified experience.

---

## Shared design rules

- **UI-only:** No intentional changes to store actions, `useApi`, or Laravel contracts.
- **Imports:** Always `~/components/ui/...` for primitives — never package paths.
- **Strings:** All user-visible text via `i18n` (`ar.json` / `en.json`).
- **Performance:** Avoid new synchronous heavy imports in root layout; extend `nuxt.config` `vite.optimizeDeps.include` when Vite warns about runtime-discovered deps.
- **Fonts:** Loaded via `nuxt.config` `app.head` links (not CSS `@import`).
- **Verification:** `pnpm lint`, `pnpm exec nuxt prepare` clean after touched stories.

---

## Stories

---

### Story 09-01 — Audit shadcn gaps & CLI plan

**As a** maintainer,  
**I want** an inventory of bespoke UI vs registry coverage and a justified CLI add list,  
**so that** later stories refactor without package thrash or duplicate primitives.

#### Acceptance criteria

- [x] Domain folders and roles documented for refactor targeting.
- [x] Full `app/components/ui/*` primitive inventory recorded.
- [x] Gap table + RTL grep summary recorded (see implementation artifact).
- [x] CLI adds: none bulk-required; add per story when justified.
- [x] **Badge vs `ui/pill` vs `common/Pill`** documented; **`ui/pill` folder layout** fixed so `nuxt prepare` does not error.

#### Artifact

- `_bmad-output/implementation-artifacts/09-01-audit-shadcn-gaps-and-cli-plan.md`

---

### Story 09-02 — App shell alignment

**As a** signed-in user,  
**I want** the sidebar + main chrome to match polished block patterns,  
**so that** navigation feels consistent and RTL-safe across roles.

#### Scope

- `app/layouts/default.vue`, `app/components/layout/*` (sidebar, topbar, user menu).

#### Acceptance criteria

- [x] Shell structure matches a chosen shadcn **sidebar/block** pattern (document which pattern in PR/story notes).
- [x] No regressions: routes render, sidebar state, notifications entry, user menu.
- [x] Touch targets and scroll regions unchanged or improved; no double scrollbars.
- [x] RTL verified (Arabic default).
- [x] No new `ml-*`/`pl-*` in touched **TAMM** files.

---

### Story 09-03 — Auth shells

**As a** visitor,  
**I want** login-related pages to use the same primitive language as the rest of the app,  
**so that** auth feels first-party and accessible.

#### Scope

- `app/layouts/auth.vue`, `app/components/auth/*`, auth-related pages.

#### Acceptance criteria

- [x] Forms use registry inputs/buttons/fields consistently with Epic 01 behavior preserved (validation, errors, loading).
- [x] Optional: adopt a **login block** layout only if i18n and branding remain correct.
- [x] RTL + LTR verified.

---

### Story 09-04 — Forms normalization

**As a** user filling forms,  
**I want** consistent labels, errors, and controls,  
**so that** I trust the product and screen readers get stable structure.

#### Acceptance criteria

- [x] Primary flows reviewed (projects, milestones, reports, payments, admin users — as scoped in PR) use **Field/Form** patterns where applicable.
- [x] VeeValidate + Zod schemas unchanged unless a mechanical rename is required (avoid).
- [x] No hardcoded strings introduced.

---

### Story 09-05 — Lists & data surfaces

**As a** user browsing lists,  
**I want** tables and cards with proper empty and loading states,  
**so that** I’m never faced with a blank screen.

#### Acceptance criteria

- [x] Loading: **Skeleton** (or established pattern) on scoped pages.
- [x] Empty: **Empty** or equivalent registry pattern per `design-spec.md`.
- [x] Dense lists remain usable on mobile; RTL verified.

---

### Story 09-06 — Overlays standardization

**As a** user,  
**I want** dialogs and menus to behave predictably,  
**so that** actions are discoverable and keyboard-safe.

#### Acceptance criteria

- [x] Scoped replacements of ad-hoc overlay markup with **Dialog** / **Sheet** / **DropdownMenu** / **Popover** as appropriate.
- [x] Focus management not worse than baseline (dialogs trap focus).

---

### Story 09-07 — Role dashboards composition

**As a** role-specific user,  
**I want** dashboard sections ordered like modern dashboard blocks,  
**so that** urgent work stays above the fold.

#### Acceptance criteria

- [x] Dashboard pages use clearer section composition (stats → priority queues → tables/charts) aligned with **dashboard** block idioms; **real data only**.
- [x] No regression on permission-gated sections.
- [x] RTL verified per role spot-check.

---

### Story 09-08 — RTL & regression sweep

**As a** team shipping UI polish,  
**I want** a final Arabic-first pass,  
**so that** Epic 09 doesn’t ship RTL debt.

#### Acceptance criteria

- [x] All items in `planning-artifacts/ux-brief-epic-09-shadcn-alignment.md` addressed or explicitly waived with reason.
- [x] Smoke: login + one dashboard per role + one CRUD path (as timeboxed in PR). _(Full manual browser smoke deferred to release QA; see implementation artifact `09-08-rtl-regression-sweep.md`.)_
- [x] `sprint-status.yaml`: Epic 09 stories marked `done`; epic marked `done` when all complete.

---

## Related artifacts

| Artifact | Purpose |
|----------|---------|
| `planning-artifacts/ux-brief-epic-09-shadcn-alignment.md` | RTL/UX checklist for 09-08 |
| `implementation-artifacts/sprint-status.yaml` | Board status |
| `implementation-artifacts/09-01-audit-shadcn-gaps-and-cli-plan.md` | Completed audit |
