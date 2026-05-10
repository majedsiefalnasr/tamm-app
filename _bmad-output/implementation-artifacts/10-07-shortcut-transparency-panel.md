# Story 10.7: Shortcut transparency panel

Status: done

## Story

As a **logged-in user**,

I want **a single place in the app that lists keyboard shortcuts with clear key styling**,

So that **I can discover affordances (palette, sidebar, common escapes) without guessing**.

## Acceptance Criteria

1. **Settings surface —** `app/pages/settings/index.vue` presents a **keyboard shortcuts** section that lists **every globally advertised chord** implemented in the authenticated shell today:
   - Command palette (**⌘/Ctrl + K**) — already partially documented; keep **`Kbd`** styling consistent.
   - Sidebar toggle (**⌘/Ctrl + B**) — [Source: `app/components/ui/sidebar/utils.ts` → `SIDEBAR_KEYBOARD_SHORTCUT`].
   - **Escape** closes modal/command overlays when focus is inside the dialog pattern (document as user-facing tip; no new listener required).
2. **`Kbd` styling —** Each shortcut row shows human-readable description + a **`Kbd`** (or small **`inline-flex`** cluster of **`Kbd`**) matching patterns already used on **`Topbar.vue`** tooltip (modifier labels from **`commandPalette.modMeta`** / **`commandPalette.modCtrl`**).
3. **RTL —** Page layout uses logical Tailwind (`ms-*`, `ps-*`, flex alignment). **Key chord clusters** use **`dir="ltr"`** on the wrapper so modifier + letter order stays readable in Arabic (matches physical keyboards).
4. **i18n —** All new copy under **`settings.shortcut_*`** keys in **`i18n/locales/en.json`** and **`ar.json`**. No hardcoded UI strings.
5. **No regressions —** Do not change shortcut behavior in **`GlobalCommandPalette.vue`** / **`SidebarProvider.vue`** except optional extraction of a **named constant** for the palette key if it removes duplication without widening scope.

## Tasks / Subtasks

- [x] Extend **`settings/index.vue`** with additional shortcut rows (sidebar, Esc) using **`Card`** / **`CardContent`** structure parallel to the existing palette row.
- [x] Add **`settings`** i18n keys (**en** + **ar**) for labels/descriptions; align Arabic phrasing with existing **`shortcut_palette_*`** tone.
- [x] Verify RTL in Arabic locale (logical spacing + **`dir="ltr"`** on chord groups).
- [x] **`pnpm lint`**, **`pnpm exec vitest run`**, and **`pnpm exec nuxt build`** succeed.

## Dev Notes

### Developer guardrails

| Topic | Instruction |
|-------|----------------|
| Stack | Nuxt 4 **`app/`** tree; **no new packages**. |
| UI | **`Kbd`** from **`~/components/ui/kbd`**; **`Card`** from **`~/components/ui/card`**. |
| Duplication | Prefer reusing **`t('commandPalette.modMeta')`** / **`modCtrl`** for modifiers; letter keys **`B`**, **`K`**, **`Esc`** may be literal inside **`Kbd`** or via tiny i18n keys if locale needs different glyphs later. |

### Files to touch (expected)

| Action | Path |
|--------|------|
| UPDATE | `app/pages/settings/index.vue` |
| UPDATE | `i18n/locales/en.json`, `i18n/locales/ar.json` |

### References

- Epic: [Source: `_bmad-output/planning-artifacts/epic-10-product-experience-advancement.md` — Story 10-07]
- Prior palette/settings stub: [Source: `_bmad-output/implementation-artifacts/10-01-global-command-palette.md`]

## Dev Agent Record

### Agent Model Used

Composer (Cursor agent)

### Debug Log References

### Completion Notes List

- Extended Settings keyboard shortcuts card with **sidebar (⌘/Ctrl+B)** and **Escape** rows; palette row detail moved inline with label block.
- Modifier chords wrapped in **`dir="ltr"`** + **`aria-hidden`** on decorative clusters; explanatory copy remains in **`text-start`** body text for screen readers.

### File List

- `app/pages/settings/index.vue`
- `i18n/locales/en.json`
- `i18n/locales/ar.json`

## Change Log

- **2026-05-10:** Story implemented — shortcut transparency on Settings; i18n en/ar; lint/tests/build green.

## Code review (adversarial triage)

### Blind Hunter

- [x] **SR vs decorative keys** — Chord **`Kbd`** clusters use **`aria-hidden="true"`**; shortcut wording lives in visible **`settings.shortcut_*_detail`** strings.

### Edge Case Hunter

- [x] **Narrow viewports** — Rows stack **`flex-col`** on small screens; chords remain on second row without horizontal trap.

### Acceptance Auditor

- [x] Settings lists palette + sidebar + Esc with **`Kbd`**; RTL logical layout + LTR chord clusters; i18n-only copy.

## Story completion status

Implementation complete; sprint status **`done`**.
