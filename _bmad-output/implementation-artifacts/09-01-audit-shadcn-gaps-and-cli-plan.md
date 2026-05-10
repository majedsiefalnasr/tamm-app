# Story 09-01 — Audit shadcn gaps & CLI plan

**Status:** done  
**Epic:** 09 — shadcn-vue alignment (UI-only)  
**Priority:** P1 — gates ordering for subsequent stories  
**Complexity:** Low  

---

## User story

**As a** maintainer,  
**I want** an inventory of bespoke UI vs registry coverage plus an explicit CLI add list,  
**so that** Epics 09-02+ refactor safely without thrashing packages or duplicating primitives.

---

## Acceptance criteria

- [x] Document lists **domain folders** (`app/components/layout`, `auth`, `project`, …) with pattern notes (raw `<button>`, ad-hoc cards, tables).
- [x] Document lists **already installed** `app/components/ui/*` primitives (folder inventory).
- [x] **Gap table**: UI need → recommended shadcn component or block → installed? (Y/N).
- [x] **CLI plan**: ordered `pnpm dlx shadcn-vue add <name>` suggestions — each row justified (no speculative adds).
- [x] Call out **Badge vs Pill vs common/Pill**: domain badges (`common/Pill.vue` + `StatusTag`) vs semantic chip (`ui/pill`) — no merge without story scope.
- [x] **RTL red flags**: files using `ml-*`/`pl-*`/`left-*`/`right-*` in grep results attached or summarized.
- [x] Output committed under `_bmad-output/implementation-artifacts/` as this story file updated with an **Audit results** section below.

---

## Developer context

### Commands (reference)

```bash
# Inventory UI primitives (run from repo root)
find app/components/ui -maxdepth 1 -type d | sort

# Search legacy directional utilities (should trend to zero in touched files)
rg '\b(ml|mr|pl|pr|left|right)-' app/components --glob '*.vue'

# Compare with registry
pnpm dlx shadcn-vue@latest add --help
```

### Constraints

- UI-only; no store/composable/API edits except import path fixes required by moves (e.g. Pill folder pattern).
- Align with `components.json` (`app/assets/css/tailwind.css`, New York style).

---

## Audit results

### Domain folders (refactor targets for stories 09-02+)

| Folder | Role |
|--------|------|
| `app/components/layout` | Shell: sidebar, topbar, user menu — align with sidebar/dashboard **blocks** patterns |
| `app/components/auth` | Login / forgot-password — registry Field, Input, Button |
| `app/components/common` | Shared non-registry helpers (`StatusTag` + `common/Pill`) |
| `app/components/project`, `milestone`, `payment`, `report`, `admin`, `notifications` | Feature cards, dialogs, tables — prefer Card, Table, Dialog, Empty, Skeleton |

### Installed `components/ui` primitives (61 folders)

`accordion`, `alert`, `alert-dialog`, `aspect-ratio`, `avatar`, `badge`, `breadcrumb`, `button`, `button-group`, `calendar`, `card`, `carousel`, `chart`, `checkbox`, `collapsible`, `combobox`, `command`, `context-menu`, `dialog`, `drawer`, `dropdown-menu`, `empty`, `field`, `form`, `hover-card`, `input`, `input-group`, `input-otp`, `item`, `kbd`, `label`, `menubar`, `native-select`, `navigation-menu`, `number-field`, `pagination`, `pill`, `pin-input`, `popover`, `progress`, `radio-group`, `range-calendar`, `resizable`, `scroll-area`, `select`, `separator`, `sheet`, `sidebar`, `skeleton`, `slider`, `sonner`, `spinner`, `stepper`, `switch`, `table`, `tabs`, `tags-input`, `textarea`, `toggle`, `toggle-group`, `tooltip`.

Coverage is **strong**; Epic 09 is primarily **composition cleanup**, not mass CLI installs.

### Badge vs Pill

- **`~/components/ui/badge`** — shadcn registry badge (use for status chips when semantics match).
- **`~/components/ui/pill`** — small rounded chip used in project cards (`variant`, slot content). **Resolved:** moved from orphan `Pill.vue` to `ui/pill/` so `nuxt prepare` no longer errors (`ENOTDIR … Pill.vue/index`).
- **`~/components/common/Pill.vue`** — label + **tone** for milestone/status badges via `StatusTag`. **Do not merge** with `ui/pill` in this epic without a dedicated story (different props API).

### Gap table (high level)

| Area | Target | Installed? | Action |
|------|--------|------------|--------|
| App shell | `SidebarProvider`, `Sidebar`, `SidebarInset` + block-style header | Yes (`sidebar`) | Story **09-02**: compare to [blocks](https://www.shadcn-vue.com/blocks) sidebar/dashboard layouts |
| Forms | `Field`, `Form`, `Input`, `Button` | Yes | Story **09-04**: sweep remaining raw markup |
| Data tables | `Table` + TanStack patterns | Yes | Story **09-05** |
| Empty / loading | `Empty`, `Skeleton` | Yes | Story **09-05** |
| Dashboards | Block-style sections | Partially | Story **09-07**: adopt section composition without demo data |

### RTL grep summary

- **`app/**/*.vue` excluding `components/ui/**`:** no matches for `\b(ml|mr|pl|pr)-` / physical `left-*`/`right-*` digit spacing utilities — **domain code aligns with logical Tailwind guidance**.
- **`components/ui/**`:** upstream shadcn-vue primitives still contain physical `left`/`right`/`pl`/`pr` in popovers, menus, carousel, etc. Treat as **vendor baseline**; changing wholesale breaks upgrades — revisit only with RTL-specific upstream guidance or scoped wrappers.

### Recommended CLI adds (ordered)

_No batch installs required._ Add primitives **only when a story introduces a pattern not in the list above** (e.g. new `Alert` usage site-wide). Prefer `pnpm dlx shadcn-vue add <component>` at story time with a one-line justification in the PR.

---

## Completion notes

**2026-05-10:** Initial audit recorded; `ui/pill` folder structure fixed + imports updated (`ProjectCard`, `ProposalCard` uses `variant`); `pnpm exec nuxt prepare` clean for module resolution.
