# UX brief — Epic 09 (shadcn alignment)

Solo-dev checklist. Verify **Arabic (RTL)** first, then spot-check English.

## Global

- [ ] Focus order logical on keyboard (dialogs trap focus; sidebar trigger reachable).
- [ ] Loading: Skeleton or explicit spinner — no blank primary surfaces.
- [ ] Errors: inline where forms expect it; toasts only where already established.
- [ ] Touch targets ≥ ~44px where primary actions are stacked on mobile.
- [ ] No hardcoded user-visible strings (i18n keys only).

## Shell

- [ ] Sidebar collapse/expand usable in RTL (icons and spacing mirror correctly).
- [ ] Main content scrolls independently; topbar stays usable.
- [ ] Mobile: navigation reachable without horizontal trap.

## Forms

- [ ] Labels associated with inputs (`for` / `aria-*`).
- [ ] Submit disabled + loading during async; double-submit prevented.
- [ ] Validation messages readable and not clipped in RTL.

## Lists & tables

- [ ] Empty states use `Empty` or equivalent — not raw whitespace.
- [ ] Dense tables still readable; truncation with tooltip where needed.

## Dashboards

- [ ] Primary “act now” sections appear above fold on laptop breakpoint.
- [ ] Stats readable with Arabic numerals/locale expectations.

## Performance (UX-adjacent)

- [ ] No blocking font `@import` in CSS layers (use `nuxt.config` head links).
- [ ] Heavy routes: avoid synchronous mega-imports in root layouts unless measured OK.
