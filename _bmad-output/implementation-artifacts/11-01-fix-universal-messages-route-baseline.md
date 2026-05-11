# Story 11.01: Fix universal messages route baseline

Status: done

## Story

As an **authenticated user** in any TAMM role,

I want **the sidebar “Messages” item to open a real `/messages` page**,

So that **navigation is never a dead link** and we have a shell ready for future messaging API integration.

## Acceptance Criteria

1. **`/messages` route exists** — `app/pages/messages/index.vue` with `definePageMeta.roles` listing all six roles (`client`, `contractor`, `field_engineer`, `supervisor_engineer`, `admin`, `super_admin`).
2. **Page meta** — `pageTitle: 'pages.messages_title'` for shell title consistency with other workspace pages.
3. **Data via composable** — No inline API calls in the page; use `useMessagesWorkspace()` for load/retry. Until an endpoint is in `docs/api-contracts.md`, composable returns empty list with `// TODO: replace mock` comment.
4. **States** — Loading (`PageContentSkeleton`), error (`ErrorState` + retry), empty (`EmptyState` with i18n keys).
5. **i18n** — All user-visible copy under `pages.messages_*` in `i18n/locales/en.json` and `i18n/locales/ar.json`.
6. **RTL / layout** — Use logical spacing only; match patterns from `app/pages/reports/index.vue`.

## Tasks / Subtasks

- [x] Add `app/composables/useMessagesWorkspace.ts` with typed preview model and `fetchWorkspace`.
- [x] Add `app/pages/messages/index.vue` wired to composable.
- [x] Add i18n keys for title, subtitle, empty title/description.
- [ ] Optional follow-up: Playwright smoke for `/messages` after login (defer if no harness yet).

## Dev Notes

| Topic | Instruction |
|-------|-------------|
| Auth | `auth.global.ts` enforces `meta.roles`; keep list aligned with `roleRoutes` nav consumers. |
| Future API | When messaging endpoints are ✅ in `docs/api-contracts.md`, replace mock in composable only. |

## Files touched

| Path |
|------|
| `app/composables/useMessagesWorkspace.ts` |
| `app/pages/messages/index.vue` |
| `i18n/locales/en.json` |
| `i18n/locales/ar.json` |

## Dev Agent Record

- Implemented 2026-05-11: baseline shell + mock composable; no Store/messaging vendor code.
