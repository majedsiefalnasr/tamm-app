# UX brief — Epic 09 (shadcn alignment)

Solo-dev checklist. Verify **Arabic (RTL)** first, then spot-check English.

**Closed in Story 09-08 (2026-05-10):** Items below are checked off against the matrix in `_bmad-output/implementation-artifacts/09-08-rtl-regression-sweep.md`. Items marked “waived” there defer full device QA or vendor-layer fixes.

## Global

- [x] Focus order logical on keyboard (dialogs trap focus; sidebar trigger reachable).
- [x] Loading: Skeleton or explicit spinner — no blank primary surfaces.
- [x] Errors: inline where forms expect it; toasts only where already established.
- [x] Touch targets ≥ ~44px where primary actions are stacked on mobile. _(Waived: no new dense-action UI in 09-08; device matrix deferred.)_
- [x] No hardcoded user-visible strings (i18n keys only).

## Shell

- [x] Sidebar collapse/expand usable in RTL (icons and spacing mirror correctly).
- [x] Main content scrolls independently; topbar stays usable.
- [x] Mobile: navigation reachable without horizontal trap. _(Waived: full mobile matrix deferred; no shell edits in 09-08.)_

## Forms

- [x] Labels associated with inputs (`for` / `aria-*`).
- [x] Submit disabled + loading during async; double-submit prevented.
- [x] Validation messages readable and not clipped in RTL.

## Lists & tables

- [x] Empty states use `Empty` or equivalent — not raw whitespace.
- [x] Dense tables still readable; truncation with tooltip where needed.

## Dashboards

- [x] Primary “act now” sections appear above fold on laptop breakpoint.
- [x] Stats readable with Arabic numerals/locale expectations.

## Performance (UX-adjacent)

- [x] No blocking font `@import` in CSS layers (use `nuxt.config` head links).
- [x] Heavy routes: avoid synchronous mega-imports in root layouts unless measured OK.
