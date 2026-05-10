# Story 10.4: Admin list density & column presets

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created. -->

## Story

As an **admin or super admin reviewing high-volume user lists**,

I want **density and column presets (default / compact / minimal) with preferences persisted in the browser**,

So that **I can scan more rows faster on desktop while keeping mobile controls usable inside a Sheet without horizontal scroll traps**.

## Acceptance Criteria

1. **Preset surface:** At least one admin list gains an explicit **preset control**: **Admin Users** (`app/pages/users.vue` + `app/components/admin/UserTable.vue`). Presets: **`default`** (all columns, comfortable spacing), **`compact`** (denser row/cell spacing, smaller typography where appropriate), **`minimal`** (hide lower-priority columns — **email** and **created** hidden; keep **name**, **role**, **status**, **actions**).
2. **Persistence:** Selected preset is stored in **`localStorage`** under a **`tamm.*`-prefixed key** scoped to this list (e.g. `tamm.admin.users.tablePreset`), survives reloads; **SSR-safe** reads/writes (`typeof localStorage !== 'undefined'`), invalid stored values fall back to **`default`**. Document **TODO** in composable if a server-side preference API appears later (do not block on API).
3. **Mobile (`Sheet`):** Below **`md`** breakpoint, preset selection moves into a **`Sheet`** trigger (icon or labeled control). Sheet content is **vertical** (stacked options); **no** nested horizontal overflow that traps focus or breaks RTL; **`Esc`** closes per shadcn `Sheet` behavior.
4. **Desktop:** **`DropdownMenu`** (or equivalent existing pattern) for preset picker with visible **selected** state (`Check` icon or `aria-checked` via menu primitives).
5. **i18n + RTL:** All new labels/descriptions in **`i18n/locales/en.json`** and **`i18n/locales/ar.json`** only; layout uses **logical** Tailwind (`ms-*`, `ps-*`, `border-s-*`, `text-start`) consistent with **`AGENTS.md`**.
6. **Regression guard:** Existing behaviours preserved — role filter tabs, create/edit dialogs, **`UserActionMenu`**, loading skeletons, empty state messaging paths unchanged aside from column visibility/density styling.

## Tasks / Subtasks

- [x] Add **`useAdminUserListPreset`** composable under **`app/composables/`**: typed preset union, **`readonly(preset)`**, **`setPreset`**, hydrate from **`localStorage`**, **`watch`** persistence on change.
- [x] **`users.vue`**: toolbar row beside title/actions — desktop **`DropdownMenu`** + mobile **`Sheet`** entrypoint.
- [x] **`UserTable.vue`**: accept **`densityPreset`** prop; drive **`TableHead`/`TableCell`** optional columns (`minimal` hides email + created); **`compact`** applies tighter vertical padding / **`text-xs`** on rows.
- [x] Tests — **`vitest`**: composable round-trip **`localStorage`**, invalid value → **`default`**, **`setItem`** throw swallowed.
- [x] Verify **`pnpm lint`** (changed files), **`pnpm exec vitest run`** (preset + RTL Tailwind guard), **`pnpm exec nuxt build`** (after clearing stale **`.output`** if **`ENOTEMPTY`**).

## Dev Notes

### Developer guardrails

| Topic | Instruction |
|-------|-------------|
| No new packages | Use existing **`DropdownMenu`**, **`Sheet`**, **`Button`** from **`~/components/ui/*`**. |
| **`UserTable` props** | **`const props = withDefaults(defineProps<Props>(), …)`** assigned so script computeds access **`props.users`**. |
| **`minimal` colspan** | Empty-state row **`colspan`** matches **`visibleColumnCount`** (**6** vs **4**). |
| Accessibility | Mobile trigger **`aria-label`** via **`admin.users.list_preset.open_sheet`**. |
| Pattern reuse | **`localStorage`** guarded like **`app/utils/commandPalette.ts`**. |

### Files touched

| Action | Path |
|--------|------|
| NEW | `app/composables/useAdminUserListPreset.ts` |
| NEW | `tests/unit/useAdminUserListPreset.spec.ts` |
| UPDATE | `app/pages/users.vue` |
| UPDATE | `app/components/admin/UserTable.vue` |
| UPDATE | `i18n/locales/en.json`, `i18n/locales/ar.json` |

### Previous story intelligence (10-03)

- Prefer **explicit props** from parent pages; **`tests/unit/rtl/tamm-no-physical-tailwind.spec.ts`** stays green.

### Architecture / traceability

- **Epic 10 / Story 10-04** — `_bmad-output/planning-artifacts/epic-10-product-experience-advancement.md`.

### Open questions (non-blocking)

- Reuse pattern on **`ProjectOverviewTable`** if product wants parity.

## Dev Agent Record

### Agent Model Used

GPT-5.2 (Cursor agent)

### Debug Log References

- Sprint **`10-04-admin-list-density-column-presets`**: **`ready-for-dev`** → **`done`**.

### Completion Notes List

- Storage key: **`tamm.admin.users.tablePreset`** (`ADMIN_USER_LIST_TABLE_PRESET_KEY`).
- Desktop uses **`DropdownMenuRadioGroup`** / **`DropdownMenuRadioItem`** (built-in selection indicator); mobile uses **`Sheet`** + **`RadioGroup`** stacked cards.
- **`readonly(preset)`** exposes read-only state; mutations only via **`setPreset`**.

### File List

- `app/composables/useAdminUserListPreset.ts`
- `tests/unit/useAdminUserListPreset.spec.ts`
- `app/pages/users.vue`
- `app/components/admin/UserTable.vue`
- `i18n/locales/en.json`
- `i18n/locales/ar.json`
- `_bmad-output/implementation-artifacts/10-04-admin-list-density-column-presets.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log

- **2026-05-11:** Story context created (`ready-for-dev`).
- **2026-05-11:** Implemented admin users table presets + persistence + tests + i18n; build verified.

## Code review (adversarial triage)

### Blind Hunter

- [x] **Wrong storage scope** — single dedicated key per users list; **`parseAdminUserListTablePreset`** rejects garbage values.

### Edge Case Hunter

- [x] **`localStorage.setItem`** failures — caught in **`watch`** and composable test; hydration defaults when **`localStorage`** missing (SSR).

### Acceptance Auditor

- [x] **Mobile Sheet** — vertical **`RadioGroup`** layout; desktop **`DropdownMenu`** with radio items; **`handlePresetChange(undefined)`** guarded.

**Story completion:** **`done`**.
