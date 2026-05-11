# Story 11.06: Role page content parity uplift

Status: done

## Summary

- **Projects list** (`app/pages/projects/index.vue`): role-specific context card with quick links (client, contractor, field engineer, supervisor); typed project filter; empty and filter-empty states include clear next actions (create project, task queue, assignments, approvals queue, show all projects).
- **Dashboards**: contractor, supervisor, and field engineer dashboards add a compact quick-link strip to operational routes (`/tasks`, `/projects`, `/assignments`, `/field-team`, `/reviews`, `/reports`).
- **Charts**: client primary chart empty-state CTA targets `/projects/new`; contractor chart empty CTA targets `/tasks`; field engineer chart empty CTA targets `/assignments` (copy already matched in ar).

## Files touched

- `app/pages/projects/index.vue`
- `app/components/contractor/ContractorDashboardPage.vue`
- `app/components/dashboard/SupervisorEngineerDashboard.vue`
- `app/components/dashboard/FieldEngineerDashboard.vue`
- `app/components/dashboard/ClientDashboardSection.vue`
- `i18n/locales/en.json`, `i18n/locales/ar.json`
