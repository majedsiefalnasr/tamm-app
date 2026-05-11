# Story 11.02: Admin and super-admin operations nav parity

Status: done

## Story

As an **admin** or **super admin**,

I want **sidebar entries for assignments, workflow, and finance** that open real pages,

So that **Lovable-aligned navigation is usable** without colliding with the field engineer `/assignments` route.

## Acceptance Criteria

1. **Nav entries** — `app/utils/roleRoutes.ts` includes `assignments`, `workflow`, and `finance` for both `admin` and `super_admin`, with correct i18n label keys and icons.
2. **Shared `/assignments` route** — Admin and super-admin use **`/assignments`** (same path as field engineer). Field content lives in `FieldEngineerAssignmentsWorkspace.vue`; admin sees admin placeholder on `app/pages/assignments.vue`. Workflow and finance remain **`/admin/workflow`** and **`/admin/finance`**.
3. **Admin-only pages** — `app/pages/admin/workflow.vue` and `admin/finance.vue` (no `admin/assignments.vue`; assignments shell is the shared page).
4. **Permission guard** — Same pattern as `users.vue`: if `!can('view_admin_panel')`, redirect to `/403`.
5. **Icons** — `app/utils/navIcons.ts` maps new icon keys (`UserPlus`, `QueueList`, `ChartBar`) to Heroicons components.
6. **i18n** — `nav.workflow`, `nav.finance`, and `pages.admin_*` strings in `en` + `ar`.

## Dev Agent Record

- Implemented 2026-05-11: placeholder admin workspace pages under `/admin/*`; full API wiring is a follow-up when contracts are available.
