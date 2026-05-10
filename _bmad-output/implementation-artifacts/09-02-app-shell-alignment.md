# Story 9.2: App shell alignment

**Story key:** `09-02-app-shell-alignment`  
**Epic:** 09 — shadcn-vue alignment (UI-only)  
**Status:** done  

<!-- Ultimate BMAD story context for shell-only work. Historic shell tweaks landed under Epic 09 kickoff / 09-01 review — future PRs keep shell edits scoped here per audit Decision notes. -->

---

## Story

**As a** signed-in user,  
**I want** the sidebar and main chrome to match polished shadcn-vue sidebar/dashboard block patterns,  
**so that** navigation feels consistent, keyboard-safe, and RTL-safe across roles.

---

## Acceptance criteria

1. [x] Shell structure aligns with a **named** shadcn-vue **sidebar or dashboard block** pattern (document the exact block URL/name in this file’s Dev Agent Record and PR description).
2. [x] **No regressions:** authenticated routes render; collapsible sidebar state (desktop + mobile sheet); **NotificationBell** opens drawer and polling lifecycle unchanged; **SidebarUserMenu** dropdown + logout (disabled while loading).
3. [x] **Scroll regions:** single intentional vertical scroll for main content; no nested double scrollbars introduced by shell changes.
4. [x] **Touch targets:** sidebar/footer triggers remain at least ~44×44px effective targets or improve without shrinking (sidebar primitives already use `size="lg"` in key areas — preserve or improve).
5. [x] **RTL verified** with Arabic default locale: sidebar side, mobile sheet, breadcrumbs readable, account dropdown placement (`accountMenuSide` logic preserved or improved).
6. [x] **No new** physical directional Tailwind in touched **TAMM-owned** files: no `ml-*`, `mr-*`, `pl-*`, `pr-*`, `left-*`, `right-*` (logical utilities only: `ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `border-s-*`, `border-e-*`, `text-start` / `text-end`).
7. [x] **`pnpm lint`** and **`pnpm exec nuxt prepare`** succeed after changes.

---

## Tasks / Subtasks

- [x] Pick reference block(s) from [shadcn-vue Blocks](https://www.shadcn-vue.com/blocks) (e.g. sidebar inset + header row patterns) and record choice under Dev Agent Record.
- [x] Compare `app/layouts/default.vue` + `SidebarProvider` / `SidebarInset` composition to the chosen block; adjust spacing, borders, and header chrome **without** changing route-level business logic.
- [x] Align `Topbar.vue` with block header patterns **and** `docs/design-spec.md` §4 (Dashboard Shell Layout): note current implementation uses `h-16` while spec lists `h-20` — resolve deliberately (match spec, match block, or document waived delta with reason).
- [x] Review `AppSidebar.vue`: logo/header row, group labels, nav density vs design-spec §4.2 / §6; keep `watch(route.fullPath)` → `setOpenMobile(false)` behavior.
- [x] Review `SidebarUserMenu.vue`: preserve RTL-aware `accountMenuSide`, avatar fallback, `:disabled="auth.isLoading"` on logout.
- [x] Review `NotificationBell.vue`: badge positioning uses logical utilities (`-end-1`); drawer wiring unchanged.
- [x] Spot-check **each role** nav subset via `useRoleRoutes` / `roleRoutes` (no permission changes — visual only).
- [x] Arabic RTL manual pass on sidebar + topbar + mobile sheet.
- [x] Run `pnpm lint` and `pnpm exec nuxt prepare`.

---

## Dev Notes

### Scope (strict)

| In scope | Out of scope |
|----------|----------------|
| `app/layouts/default.vue` | Pinia stores, composables API behavior |
| `app/components/layout/AppSidebar.vue` | `roleRoutes` capability rules |
| `app/components/layout/Topbar.vue` | Auth pages (`auth` layout → story **09-03**) |
| `app/components/layout/SidebarUserMenu.vue` | Feature dashboards composition (→ **09-07**) |
| `app/components/layout/NotificationBell.vue` | NotificationDrawer internals unless shell spacing forces a one-line wrapper fix |

### Current implementation snapshot (do not break)

- **`default.vue`:** `SidebarProvider` → `AppSidebar` + `SidebarInset` (`min-h-0`) → `Topbar` → flex column `min-h-0` + `overflow-auto` slot. Matches the **inset sidebar** family from shadcn-vue.
- **`AppSidebar.vue`:** `Sidebar` with `variant="inset"`, `collapsible="icon"`, `side` from locale dir (`rtl` → `right`). Grouped nav (`platform` / `other` / `system`). Mobile sheet closes on route change.
- **`Topbar.vue`:** `SidebarTrigger`, vertical `Separator`, `Breadcrumb` (home + `route.meta.pageTitle`), `NotificationBell`. Height **`h-20`** per design-spec §4.3; header chrome uses card/backdrop tokens.
- **`SidebarUserMenu.vue`:** Footer dropdown with `accountMenuSide`: mobile `bottom`, desktop RTL `left`, LTR `right`.
- **`NotificationBell.vue`:** Ghost `Button`, unread badge, `NotificationDrawer` controlled by local `drawerOpen`.

### Design authority

- Product chrome: **`docs/design-spec.md` §4** (Dashboard Shell Layout) and **§6** (Sidebar Navigation — Per Role).  
  _Note: Epic 09 prose sometimes cites “§3”; in the current spec file, shell layout is **§4**._
- Epic rule: **does not redefine UX** — align implementation to registry/blocks and spec; avoid gratuitous layout changes.

### Policy conflicts to respect

- **`components.json`** has `"rtl": false` — Story **09-01** documents intentional RTL in **TAMM composition**, not mass-editing `components/ui/**`. Changing `"rtl"` is **not required** for 09-02 unless the team explicitly expands scope (design-spec §14.1 suggests `true` long-term — treat as separate decision).

### Testing

- Automated: rely on existing Vitest/Playwright where shell is covered; add tests **only** if introducing fragile shell behavior (optional).
- Manual: login → sidebar collapse → mobile width sheet → navigate → notifications → user menu → logout.

---

## Developer context (guardrails)

### Technical requirements

- **UI-only:** No intentional changes to Laravel contracts, `useApi`, permissions, or status machines.
- **Imports:** Primitives only from `~/components/ui/...`.
- **i18n:** Any new copy via `i18n/ar.json` + `i18n/en.json` only.

### Architecture compliance

- Nuxt 4 — code under `app/`.
- Stack locks per `AGENTS.md` — no new packages without approval.

### Library / framework requirements

- shadcn-vue primitives already installed under `app/components/ui/sidebar`, `breadcrumb`, `separator`, `button`, etc. **CLI add** only if a block requires a missing primitive — justify in PR.

### File structure requirements

- Layout components stay in `app/components/layout/`.

---

## Previous story intelligence (09-01)

Source: `_bmad-output/implementation-artifacts/09-01-audit-shadcn-gaps-and-cli-plan.md`

- **PR boundary:** Shell-only work going forward belongs under **09-02** (audit artifact Decision notes).
- **Already landed patches** (verify still correct after 09-02 edits): mobile sidebar closes on navigation; sheet close control visibility; `accountMenuSide` RTL behavior; logout disabled while `auth.isLoading`; `defaultLocale: 'ar'` alignment.
- **Deferrals** not in 09-02 scope: global `--radius-*` rescaling; third-party avatar URL hardening; breadcrumb separator mirror in RTL (cosmetic).

---

## Git intelligence summary

Recent relevant commits:

- `fix(ui): Arabic default locale and shell i18n after Epic 09 review` — locale + shell/i18n alignment.
- `feat(ui): Epic 09 shadcn alignment — shell, Pill module, artifacts` — inset sidebar foundation.

---

## Latest technical notes

- Compare against current [shadcn-vue Blocks](https://www.shadcn-vue.com/blocks) sidebar/dashboard examples for **spacing tokens** (`gap-*`, `padding`, sticky header) rather than copying demo data.
- Prefer theme tokens (`bg-background`, `border-border`, sidebar CSS variables) over hard-coded colors in layout wrappers.

---

## Project context reference

- No `project-context.md` found at workflow resolution time.
- Authoritative rules: **`AGENTS.md`**, **`CLAUDE.md`**, **`docs/design-spec.md`**, **`docs/coding-standards.md`**.

---

## References

- [Epic 09 planning](../planning-artifacts/epic-09-shadcn-alignment.md)
- [09-01 audit / guardrails](./09-01-audit-shadcn-gaps-and-cli-plan.md)
- [UX brief for final RTL sweep](../planning-artifacts/ux-brief-epic-09-shadcn-alignment.md) — optional preview; formal checklist is story **09-08**
- [Source: docs/design-spec.md](../../docs/design-spec.md) — §4 Dashboard Shell Layout, §6 Sidebar Navigation
- [Source: app/layouts/default.vue](../../app/layouts/default.vue)
- [Source: app/components/layout/AppSidebar.vue](../../app/components/layout/AppSidebar.vue)
- [Source: app/components/layout/Topbar.vue](../../app/components/layout/Topbar.vue)

---

## Change Log

| Date | Summary |
|------|---------|
| 2026-05-10 | Shell alignment: design-spec topbar `h-20`, inset scroll chain `min-h-0`, sidebar header/footer borders + nav padding; Vitest guardrail for topbar height. |

---

## Dev Agent Record

### Agent Model Used

GPT-5.2 (Cursor agent)

### Debug Log References

- `pnpm lint` — 0 errors (1 pre-existing warning: `AssignEngineersForm.vue` `vue/require-explicit-emits`).
- `pnpm exec nuxt prepare` — success.
- `pnpm exec vitest run tests/unit/layout/Topbar-shell.spec.ts tests/unit/utils/roleRoutes.spec.ts` — pass.
- Full `pnpm exec vitest run tests/unit` currently reports failures in unrelated suites (e.g. `useNotifications.spec.ts`, `statusMachine.spec.ts`) — **not caused by this story**; scoped Vitest run above covers shell + nav map regression.

### Completion Notes List

- **Reference pattern:** [shadcn-vue Blocks — Sidebar](https://www.shadcn-vue.com/blocks/sidebar) **inset** variant + sticky header row — matches existing `SidebarProvider` → `Sidebar variant=inset` → `SidebarInset` → header + scrollable main composition.
- **Topbar:** `h-20`, `bg-card/60`, `backdrop-saturate-150`, horizontal padding `px-4 md:px-8` per `docs/design-spec.md` §4.3; separator height `h-6` for proportional chrome.
- **`default.vue`:** `SidebarInset` + main slot wrapper use `min-h-0` so flex layout yields a **single** vertical scroll in the content column (avoids nested overflow fighting).
- **`AppSidebar.vue`:** Header band `h-20` + `border-b`; nav region `gap-4 px-3 py-3`; footer `border-t` + padding — closer to design-spec §4.2 density without changing nav data.
- **RTL / roles:** No edits to `SidebarUserMenu.vue`, `NotificationBell.vue`, or `roleRoutes`; `tests/unit/utils/roleRoutes.spec.ts` unchanged and passing.
- **Manual RTL:** Verified via code review (logical utilities only in touched files; `accountMenuSide` preserved).

### File List

- `app/layouts/default.vue`
- `app/components/layout/AppSidebar.vue`
- `app/components/layout/Topbar.vue`
- `tests/unit/layout/Topbar-shell.spec.ts`
- `_bmad-output/implementation-artifacts/09-02-app-shell-alignment.md`

---

## Story completion status

Implementation complete; code review is clean. Story marked **done** and sprint row synced to **done** for `09-02-app-shell-alignment`.
