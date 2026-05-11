# Story 11.03: Supervisor operational nav parity

Status: done

## Story

As a **supervisor engineer**,

I want **sidebar entries for assignments and field team** that open real pages,

So that **navigation matches the Lovable-aligned supervisor IA** without breaking other roles.

## Acceptance Criteria

1. **Nav** — `supervisor_engineer` in `app/utils/roleRoutes.ts` includes `assignments` (`/assignments`) and `field-team` (`/field-team`) with i18n labels and icons (`UserPlus`, `UserGroup`).
2. **`/assignments`** — Same route as field/admin: `app/pages/assignments.vue` allows `supervisor_engineer` and shows supervisor-specific placeholder copy (not field grid, not admin copy).
3. **`/field-team`** — `app/pages/field-team.vue` with `roles: ['supervisor_engineer']` and localized title + description placeholder.
4. **Top bar title** — Assignments page sets `route.meta.pageTitle` for supervisor to `pages.supervisor_assignments_title` (watch on role).
5. **i18n** — `nav.field_team`, `pages.supervisor_assignments_*`, `pages.supervisor_field_team_*` in `en` and `ar`.

## Dev Agent Record

- Implemented 2026-05-11: shared `/assignments` route with role branches; field UI isolated in `FieldEngineerAssignmentsWorkspace.vue`.
