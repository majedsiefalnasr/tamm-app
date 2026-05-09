# Deferred Work — Code Review 04-03

**Date:** 2026-05-09  
**Source:** Code review of story 04-03 (Admin releases payment to contractor)

## Deferred from: code review (2026-05-09)

- **Mock API call doesn't use useApi wrapper** [app/composables/useMilestones.ts:700] — When the real `POST /payments/:id/release` endpoint is implemented, developer must replace mock with `await useApi(\`/payments/:id/release\`, { method: 'POST' })`. Current TODO comment is clear, but this is a dependency on the backend team delivering the endpoint. Pre-existing responsibility.

- **i18n key validation not in test suite** [MilestoneActions.vue:200] — Missing translation keys (e.g., `payment.message.released`) fail silently at runtime, showing untranslated fallback text. This is an architectural issue with the i18n system — recommend adding build-time or test-time validation of all `t()` call references against actual locale files. Not specific to this story.

- **Error type handling in catch block** [MilestoneActions.vue:206] — Non-Error objects thrown in promises may lack `.message` property. Current code already handles this defensively with `instanceof Error` check, but pattern is inconsistent across the codebase. Recommend standardizing error handling in promise catch blocks to always normalize errors to Error instances.
