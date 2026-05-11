# Story 11.04: Contractor tasks page parity

Status: done

## Story

As a **contractor**,

I want **a Tasks item in the sidebar and a `/tasks` page**,

So that **I can see open checklist tasks and active milestone work** in one queue and jump to the milestone.

## Acceptance Criteria

1. **Nav** — Contractor `roleRoutes` includes `tasks` → `/tasks` with `nav.tasks` and `ListBullet` icon.
2. **Composable** — `useContractorTasks()` loads projects + milestones via existing composables; builds rows from open `milestone.tasks` first, otherwise milestone-level fallback for active milestone statuses.
3. **Page** — `app/pages/tasks/index.vue`, `roles: ['contractor']`, loading/error/empty, list links to `/projects/{id}/milestones/{mid}`.
4. **i18n** — `pages.contractor_tasks_*` and `project.milestone.draft` / `submitted` (en) for labels.
5. **No new packages** — Heroicons only where nav already uses them.

## Files

- `app/composables/useContractorTasks.ts`
- `app/pages/tasks/index.vue`
- `app/utils/roleRoutes.ts`, `app/utils/navIcons.ts`
- `i18n/locales/en.json`, `i18n/locales/ar.json`
