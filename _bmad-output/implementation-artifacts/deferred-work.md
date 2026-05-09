# Deferred Work Items

## Deferred from: Code Review of Story 06-04 (2026-05-09)

### Pre-existing Infrastructure Issues

- **Fallback pagination object validation** [`useAdminProjects.ts:97-102`] — API response fallback assumes pagination structure is correct. Should validate `data.pagination` shape before using. Lower priority; API contract controls this.

- **fetchProjects() network timeout guard** [`admin/projects.vue:40-42`] — No timeout set on async fetch; page can hang indefinitely. Infrastructure concern; applies to all composables, not just this story.

- **Error scenario test coverage** [`tests/`] — Missing tests for network errors, permission denied, API validation failures. Pre-existing test infrastructure gap; affects multiple stories.

## Deferred from: Code Review of Story 06-03 (2026-05-09)

- **Verify `useApi` utility exists** — Pre-existing infrastructure. The `useApi()` function (imported in useProjectDetail.ts line 60) needs to be verified to exist and be correctly exported from `~/utils/api`. Affects multiple features beyond this story.
