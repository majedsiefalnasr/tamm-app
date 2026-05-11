# Story 11.08: Epic 11 UX / RTL / i18n regression sweep

Status: done

## Summary

- **i18n**: All new user-facing strings added in **English and Arabic** under `pages.*`, `project.filter_clear_action`, `dashboard.contractor.link_tasks` / `link_projects`, and updated `dashboard.chart.client` / `contractor` empty action labels.
- **RTL**: New UI uses logical spacing and existing patterns (`gap-*`, `flex-wrap`, `border-border`, `ps`/`ms` not introduced as physical `ml`/`pl`/`left` in these edits).
- **Empty states**: Tasks and Messages empty views include localized secondary actions (`pages.contractor_tasks_empty_next`, `pages.messages_empty_next`).

## Files touched

- `i18n/locales/en.json`, `i18n/locales/ar.json`
- `app/pages/tasks/index.vue`, `app/pages/messages/index.vue` (empty-state actions only)
