# Story 11.05: Client new project entry parity

Status: done

## Story

As a **client**,

I want **a “New project” sidebar entry and a real `/projects/new` route** plus a **working Create control on the projects list**,

So that **navigation matches the Lovable pattern** and the entry point is no longer a dead/disabled control.

## Acceptance Criteria

1. **Nav** — Client `roleRoutes` includes `new-project` → `/projects/new` with `nav.new_project` and `Plus` icon.
2. **Page** — `app/pages/projects/new.vue`, `roles: ['client']`, `can('create_project')` or `403`, placeholder copy + link back to `/projects`.
3. **Projects list** — Create button is a link to `/projects/new` when `can('create_project')` (no disabled-only state for permitted clients).
4. **i18n** — `nav.new_project`, `pages.new_project_*` in en and ar.

## Files

- `app/pages/projects/new.vue`
- `app/pages/projects/index.vue`
- `app/utils/roleRoutes.ts`, `app/utils/navIcons.ts`
- `i18n/locales/en.json`, `i18n/locales/ar.json`
