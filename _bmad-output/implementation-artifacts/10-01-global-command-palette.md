# Story 10.1: Global command palette (navigation & discovery)

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created. -->

## Story

As a **logged-in user** (any role),

I want **a keyboard- and topbar-accessible command palette** that lists navigation targets I am allowed to reach,

So that **I can jump to destinations faster than sidebar drilling alone** (operator speed), without seeing unauthorized routes.

## Acceptance Criteria

1. **Invocation —** User can open the palette from (a) a **topbar control** and (b) a **global keyboard chord** (modifier + key, consistent with OS conventions). The shortcut is **documented** for users (see Tasks: settings surface + `Kbd`).
2. **Search —** Typing filters visible commands; clearing search restores full allowed list behavior per UX spec (empty query shows **recents** + **role shortcuts** — see UX §6 below).
3. **Authorization —** Only destinations the current user may access appear. **Single source of truth:** reuse the same navigation catalog as the sidebar (`getNavigationForRole` / `NavItem[]` from `~/utils/roleRoutes`). Do **not** duplicate route lists or permission logic in the palette.
4. **RTL & a11y —** Layout mirrors correctly in Arabic (RTL); focus is managed while open (dialog/command pattern); **Esc** closes; arrow keys navigate list items per `Command` behavior.
5. **i18n —** All user-visible strings use `$t` / `t()` keys in `i18n/ar.json` and `i18n/en.json` (including palette title, search placeholder, empty state, group labels, shortcut labels). No hardcoded UI copy.
6. **No regressions —** Existing **Cmd/Ctrl+B** sidebar toggle (`SidebarProvider`) continues to work; palette shortcut must use a **different** key (recommended: **Cmd/Ctrl+K**, industry norm).

### BDD-style scenarios (for verification)

```gherkin
Given an authenticated user with role R
When they open the command palette
Then every listed navigation target is in getNavigationForRole(R)

Given the palette is open
When the user types a substring matching a nav label
Then only matching allowed items remain visible

Given the palette is open
When the user presses Escape
Then the palette closes

Given locale is Arabic (RTL)
When the palette is open
Then layout remains usable (mirrored alignment, logical positioning in TAMM-owned code)
```

## Tasks / Subtasks

- [x] **Palette shell (NEW)** — Add `app/components/layout/GlobalCommandPalette.vue` (name may vary; keep under `components/layout/`).
  - [x] Compose **`CommandDialog`** from `~/components/ui/command` with **`title`** / **`description`** props driven by i18n (override English defaults in `CommandDialog.vue` via props — do not leave palette chrome English-only).
  - [x] **`CommandInput`** placeholder from i18n; **`CommandList`** / **`CommandGroup`** / **`CommandItem`** for nav entries; optional **`CommandShortcut`** / **`Kbd`** for display-only hints.
  - [x] On select: `navigateTo(item.href)`, push href to **recents** (see below), close dialog.
- [x] **Navigation data —** `computed` list from `useRoleRoutes().getNavigationForRole(auth.user?.role ?? '')` — match `AppSidebar.vue` exactly (same `href`, `label`, `icon` keys).
  - [x] **Empty query UX ([Source: `_bmad-output/planning-artifacts/ux-design-specification.md` §6]):** Show **Recents** group (last N unique visited destinations from palette navigation, persisted e.g. `localStorage`) and **Shortcuts** group (full allowed nav as role shortcuts, or a curated subset — must still be ⊆ `getNavigationForRole`).
  - [x] **Filtered query:** Command component filter behavior; ensure groups hide when empty.
- [x] **Global shortcut —** In layout scope only (authenticated shell): `useEventListener` from `@vueuse/core` on `keydown` — **Ctrl/Cmd + K**, `preventDefault()` when firing; ignore when focus is in editable fields if needed to avoid breaking native behavior (document chosen rule in Dev Agent Record).
- [x] **Topbar trigger —** Update `app/components/layout/Topbar.vue`: icon button (e.g. search / command icon from Heroicons already used project-wide) opens palette; include **visible `Kbd` hint** next to or inside tooltip if patterns exist.
- [x] **Wire layout —** Mount palette + expose `open` state: prefer **`provide/inject`** from `default.vue` layout or a tiny composable `useCommandPalette()` colocated with the component — avoid prop-drilling through Topbar if cumbersome; **do not** mount on `auth.vue` unless product asks (palette is for logged-in app shell).
- [x] **Document shortcut (“help/settings”) —** Today **`/settings`** is linked from nav but **has no page** (falls through to `[...slug]` → 404). Add **`app/pages/settings/index.vue`** with `layout: default`, minimal content: page title + **“Keyboard shortcuts”** section listing at least the palette chord using **`Kbd`** + i18n. Story 10-07 will extend this surface.
- [x] **Testing —** Add **Playwright** or **Vitest** coverage as appropriate: open via shortcut from dashboard, filter string, select item navigates, Esc closes. Respect existing test layout under `app/pages/dashboard/__tests__/` patterns if extending Playwright.

## Dev Notes

### Developer context (guardrails)

| Topic | Instruction |
|-------|-------------|
| **Stack** | Nuxt 4.x, Vue 3.5, Pinia, Tailwind v4 **logical** utilities only in TAMM-owned Vue (`ms-*`, `ps-*`, `start-*`, `end-*`, etc.) — [Source: `AGENTS.md`] |
| **UI imports** | `~/components/ui/command`, `~/components/ui/dialog`, `~/components/ui/button`, `~/components/ui/kbd` — never from package roots |
| **Permissions** | Sidebar already encodes role → routes; palette **must not** add parallel role string checks — reuse **`getNavigationForRole`** |
| **No new packages** | Use `@vueuse/core` already in project |
| **Vendor UI** | Avoid mass-editing `app/components/ui/**`; pass i18n via props to `CommandDialog` from parent |

### Files to touch (expected)

| Action | Path |
|--------|------|
| UPDATE | `app/layouts/default.vue` — register palette + optional provide |
| UPDATE | `app/components/layout/Topbar.vue` — trigger button |
| NEW | `app/components/layout/GlobalCommandPalette.vue` (or equivalent) |
| NEW | `app/pages/settings/index.vue` — shortcuts documentation stub |
| UPDATE | `i18n/ar.json`, `i18n/en.json` — palette + settings + shortcut strings |
| NEW/UPDATE | E2E or unit test file(s) under existing conventions |

### Current code intelligence (do not skip)

- Sidebar nav source: ```42:45:app/components/layout/AppSidebar.vue
const navItems = computed((): NavItem[] => {
  const role = auth.user?.role ?? ''
  return getNavigationForRole(role)
})
```
- Role → routes map: **`~/utils/roleRoutes.ts`** — `NavItem` (`key`, `label`, `icon`, `href`, `group`).
- Existing **`CommandDialog`** wraps **`Dialog`** + **`Command`** — ```19:29:app/components/ui/command/CommandDialog.vue
  <Dialog v-slot="slotProps" v-bind="forwarded">
    <DialogContent class="overflow-hidden p-0 ">
      ...
      <Command>
        <slot v-bind="slotProps" />
      </Command>
```
- Global shortcut precedent: **`SidebarProvider`** uses `useEventListener("keydown", …)` + Ctrl/Meta — mirror pattern for palette key **K** (not **B**).

### Architecture / PRD traceability

- **FR-10.1** — [Source: `_bmad-output/planning-artifacts/prd.md` §5 FR-10.1]
- **Epic 10 Story 10-01** — [Source: `_bmad-output/planning-artifacts/epic-10-product-experience-advancement.md`]
- **UX — Quick jump** — [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` §4 table, §6 Command Palette Behavior, §7 RTL checklist]

### Library / version notes (pinned)

- `nuxt`: ^4.4.4, `vue`: ^3.5.33, `@vueuse/core`: ^14.3.0, `reka-ui`: ^2.9.7 — [Source: `package.json`]

### Previous story intelligence

- **Epic 10 / Story 10-01** is the first story in Epic 10 — no in-epic predecessor.
- **Epic 09 closure (RTL):** Dialog focus trap verified; TAMM-owned RTL Tailwind guard exists — [Source: `_bmad-output/implementation-artifacts/09-08-rtl-regression-sweep.md`]. New layout components must pass **`pnpm exec vitest run tests/unit/rtl/tamm-no-physical-tailwind.spec.ts`** for files outside `components/ui/**`.

### Git intelligence (recent commits)

- Recent work: Epic 09 shadcn alignment, RTL sidebar dock fix, planning artifacts for Epic 10 — patterns favor **logical Tailwind**, **local shadcn**, **minimal layout edits**.

### Latest tech / implementation notes

- Use **`useEventListener`** from VueUse (already used in `SidebarProvider.vue`) for global shortcut registration; unregister on scope dispose.
- **Cmd+K** on macOS and **Ctrl+K** on Windows/Linux — detect via `event.metaKey || event.ctrlKey` with `event.key === 'k'` (case-insensitive if needed).

### Project context reference

- **`project-context.md`** — not found in repo (workflow glob returned no file). Follow **`AGENTS.md`** / **`CLAUDE.md`** / **`docs/design-spec.md`** for shell styling consistency.

### Testing requirements

- `pnpm lint`
- `pnpm exec nuxt prepare` (or `pnpm type:check` per project scripts)
- `pnpm exec vitest run` (includes RTL guard)
- Add automated test coverage for palette happy paths where feasible
- **Manual:** Arabic RTL — open palette, verify alignment and keyboard flow; English LTR spot-check

### Open questions / clarifications (non-blocking)

- **Editable fields:** Whether Ctrl/Cmd+K should be suppressed when `<input>` / `<textarea>` / `contenteditable` is focused — pick one behavior and document.
- **Recents count:** Recommend N = 5–10; persist key namespaced e.g. `tamm.commandPalette.recents`.

## Dev Agent Record

### Agent Model Used

GPT-5.2 (Cursor agent)

### Debug Log References

- Sprint status set `10-01-global-command-palette` → `in-progress` at start; → `review` at completion.
- RTL guard failed on `AppSidebar.vue` comment containing literal `left-*`; comment reworded to satisfy `tests/unit/rtl/tamm-no-physical-tailwind.spec.ts`.
- `Topbar-shell.spec.ts` expected obsolete `h-20`; updated to match shell token `h-(--header-height)` and stubbed new Topbar UI imports.

### Completion Notes List

- Implemented **`provideCommandPalette`** / **`tryUseCommandPalette`** (`app/composables/useCommandPalette.ts`) so **`Topbar`** stays test-friendly outside `default` layout while **`GlobalCommandPalette`** uses strict **`useCommandPalette()`**.
- **Ctrl/Cmd+K:** **`shouldBlockPaletteShortcut`** skips opening when focus is in text-like controls **only while the palette is closed**; when open (including focus in search filter), the chord **toggles** closed so power users are not trapped.
- **`CommandItem`** now **re-emits `select`** after clearing filter so parents can navigate without forking the primitive.
- Recents: **`COMMAND_PALETTE_MAX_RECENTS` (8)**, storage key **`tamm.commandPalette.recents`** (`app/utils/commandPalette.ts`); unit tests in **`tests/unit/command-palette.spec.ts`**.
- **`vitest.setup.ts`** **`useRoleRoutes`** stub extended with **`getNavigationForRole`** etc. for broader compatibility.

### File List

- `app/composables/useCommandPalette.ts` (new)
- `app/utils/commandPalette.ts` (new)
- `app/components/layout/GlobalCommandPalette.vue` (new)
- `app/pages/settings/index.vue` (new)
- `app/layouts/default.vue` (modified)
- `app/components/layout/Topbar.vue` (modified)
- `app/components/layout/AppSidebar.vue` (modified — comment only for RTL guard)
- `app/components/ui/command/CommandItem.vue` (modified — emit `select`)
- `i18n/locales/en.json` (modified)
- `i18n/locales/ar.json` (modified)
- `tests/unit/command-palette.spec.ts` (new)
- `tests/unit/layout/Topbar-shell.spec.ts` (modified)
- `tests/setup/vitest.setup.ts` (modified)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified)

## Change Log

- **2026-05-11:** Implemented global command palette (Dialog + Command), topbar trigger with tooltip **`Kbd`** hints, `/settings` shortcuts documentation, localStorage recents, Ctrl/Cmd+K shortcut guard behavior, unit tests and RTL guard comment fix; Vitest suite green.

---

**Story completion:** `done` — Code review complete; all patches applied.

### Review Findings

- [x] [Review][Patch] `v-model:open="palette.isOpen"` binds Ref object — added `const isOpen = palette.isOpen` at top-level and changed binding to `v-model:open="isOpen"` so Vue 3 auto-unwraps correctly [`GlobalCommandPalette.vue`]
- [x] [Review][Patch] CommandItem double-fires `select` — removed redundant `emits('select', event)` from `@select` handler; `useForwardPropsEmits` already forwards the event to parents [`app/components/ui/command/CommandItem.vue:74`]
