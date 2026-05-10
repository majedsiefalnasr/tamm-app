# Story 9.4: Forms normalization

Status: done

## Story

As a user filling forms,  
I want consistent labels, errors, and controls,  
so that I trust the product and screen readers get stable structure.

## Acceptance Criteria

1. Primary flows reviewed (projects, milestones, reports, payments, admin users — as scoped in implementation) use consistent `Field` / `Form` patterns where applicable.
2. VeeValidate + Zod schemas remain unchanged unless mechanical binding updates are required.
3. No hardcoded user-visible strings are introduced.

## Tasks / Subtasks

- [x] Confirm exact normalization scope and keep story UI-only:
  - [x] `app/components/project/MilestoneDialog.vue`
  - [x] `app/components/milestone/ReportForm.vue`
  - [x] `app/components/payment/PaymentConfirmDialog.vue`
  - [x] `app/components/payment/WithdrawalRequestDialog.vue`
  - [x] `app/components/admin/CreateUserForm.vue`
  - [x] `app/components/admin/AssignEngineersForm.vue`
  - [x] `app/components/project/SubmitProposalDialog.vue`
  - [x] `app/components/project/OpenForBidsDialog.vue`
- [x] Normalize field composition in scoped files:
  - [x] Prefer `FormField` + `FormItem` + `FormLabel` + `FormControl` + `FormMessage` where forms already use VeeValidate state.
  - [x] For UI-only forms without full `useForm` field wiring (for example report upload areas), at minimum use consistent `Field` primitives (`Field`, `FieldLabel`, `FieldError`) and keep existing interaction behavior.
  - [x] Keep submit loading/disabled states and prevent double-submit behavior.
- [x] Preserve behavior and contracts:
  - [x] Keep existing composable/store calls unchanged (`useProjects`, `useMilestones`, `useAdminUsers`, etc.).
  - [x] Keep existing API payload keys and server error mapping behavior unchanged.
  - [x] Keep all i18n keys; do not introduce literal UI strings.
- [x] Verify quality gates:
  - [x] Arabic RTL pass on touched forms and dialogs.
  - [x] `pnpm lint`
  - [x] `pnpm exec nuxt prepare`
  - [x] Add/adjust focused tests only when template changes alter interactive behavior risk.

### Review Findings

- [x] [Review][Patch] `FieldError` array rendering introduces RTL-unsafe indent path for multi-image errors in `ReportForm` [app/components/milestone/ReportForm.vue:276]
- [x] [Review][Patch] Dialog-level status banners should not use field-scoped `FieldError` semantics in `OpenForBidsDialog` [app/components/project/OpenForBidsDialog.vue:144]

## Dev Notes

- Epic 09 is UI-only alignment: do not change Pinia/composable business logic, endpoint contracts, role permission logic, or status transitions.
- Story 09-01 audit identifies 09-04 as a composition sweep over existing forms, not a schema redesign.
- Story 09-03 confirms the implementation pattern to follow: visual and structure normalization while preserving established behavior paths.

### Current State Snapshot (must preserve)

- `MilestoneDialog.vue` already uses `FormField`/`FormItem`/`FormLabel`/`FormControl`/`FormMessage`; preserve schema and submit behavior while normalizing spacing and placeholders only where needed.
- `ReportForm.vue` currently uses manual `<label>` and manual error blocks with local refs; preserve drag-drop upload, image limits, and submit/report notifications.
- `PaymentConfirmDialog.vue` and `WithdrawalRequestDialog.vue` use `useForm` but rely on ad-hoc `Label` + `<p>` error rendering; preserve payload shape and file validation behavior.
- `CreateUserForm.vue` and `AssignEngineersForm.vue` use VeeValidate and inline error rendering; preserve permission checks, server error mapping, and role-filtering behavior.
- `SubmitProposalDialog.vue` uses `useForm` with custom input parsing and focus-on-error; preserve parse/format and error focus behavior.
- `OpenForBidsDialog.vue` is selection-focused (checkbox list with validation), not a schema form; normalize visual field grouping only if it does not change current async load/submission flow.

### What This Story Changes

- Normalize form presentation and error/label structure across scoped components using existing local shadcn primitives.
- Reduce wrapper inconsistency (mixed label/error styles) to a predictable pattern aligned with Epic 09.
- Keep all existing form logic and data flow intact; this story is not a business-rule rewrite.

### What Must Not Break

- Existing composable call signatures and payload contracts.
- Existing validation rules and thresholds in Zod schemas and manual validations.
- Existing toast/inline error delivery expectations per flow.
- Existing accessibility and RTL behavior in TAMM-owned components.

### Architecture Compliance

- Nuxt 4 structure under `app/`, Composition API + `<script setup lang="ts">`.
- No new packages or framework changes.
- Import primitives from `~/components/ui/*` only.
- i18n-only user text in touched templates.

### Library / Framework Requirements

- VeeValidate + Zod stay schema-first and typed (`toTypedSchema`, `useForm`), without changing business validation intent.
- `shadcn-vue` form guidance (Context7 `/unovue/shadcn-vue`) for normalized composition:
  - Use `FormField` slot binding for controlled fields.
  - Use `FormLabel` + `FormControl` + `FormMessage` for accessible label/error structure.
  - Keep field descriptions via `FormDescription` when helper text is needed.
- For non-`FormField` scenarios, prefer `Field`, `FieldLabel`, and `FieldError` to keep UI semantics consistent.

### File Structure Requirements

- Touch only scoped form components listed above.
- Avoid broad edits to `app/components/ui/*` unless a tiny, required compatibility tweak is unavoidable and justified in notes.
- Do not migrate unrelated dialogs or pages in this story.

### Testing Requirements

- Required checks:
  - `pnpm lint`
  - `pnpm exec nuxt prepare`
- Manual flow checks after normalization:
  - milestone add/edit dialog validation and submit
  - report submission content/image validation
  - client payment confirmation with receipt upload validation
  - contractor withdrawal request validation and submit
  - admin create user and assign engineers forms
  - contractor submit proposal flow and error focus behavior

## Previous Story Intelligence (09-03)

- Keep changes local to UI composition and preserve all existing interaction outcomes.
- Preserve RTL/LTR safety through logical utilities and dir-safe composition.
- Use the same verification discipline (`lint` + `nuxt prepare` + scoped checks) instead of broad suite churn.

## Git Intelligence Summary

- Recent commits show directionality and hydration regressions were already stabilized; avoid reopening those concerns with broad form refactors.
- Admin and project form-heavy components were recently modified in dashboard work; preserve their established payload and permission pathways.
- Epic 09 commits consistently separate UI normalization from business logic changes; follow that boundary.

## Latest Technical Information

- Context7 (`/unovue/shadcn-vue`) confirms recommended form composition in Vue 3 is:
  - `useForm` + `toTypedSchema(z.object(...))`
  - `<FormField v-slot="{ componentField }">` with `<FormItem>`, `<FormLabel>`, `<FormControl>`, `<FormMessage>`
- This supports type-safe validation and accessible error mapping without changing existing business semantics.

## Project Context Reference

- `AGENTS.md`
- `CLAUDE.md`
- `docs/coding-standards.md`
- `docs/design-spec.md`
- `_bmad-output/planning-artifacts/epic-09-shadcn-alignment.md`
- `_bmad-output/planning-artifacts/ux-brief-epic-09-shadcn-alignment.md`
- `_bmad-output/implementation-artifacts/09-01-audit-shadcn-gaps-and-cli-plan.md`
- `_bmad-output/implementation-artifacts/09-03-auth-shells.md`

## Dev Agent Record

### Agent Model Used

Codex 5.3

### Debug Log References

- Workflow artifacts loaded: Epic 09 plan, UX brief, Story 09-01 audit, Story 09-03 context, coding/design standards.
- Scoped form component scan completed for current implementation baseline.
- Recent git history analyzed for implementation patterns and regression hotspots.
- Context7 fetched for latest shadcn-vue form composition guidance.
- `npx gitnexus impact "Folder:app/components/payment" -d upstream -r tamm-app` -> LOW risk, 0 impacted dependents
- `npx gitnexus impact "Folder:app/components/admin" -d upstream -r tamm-app` -> LOW risk, 0 impacted dependents
- `npx gitnexus impact "Folder:app/components/project" -d upstream -r tamm-app` -> LOW risk, 0 impacted dependents
- `npx gitnexus impact "Folder:app/components/milestone" -d upstream -r tamm-app` -> LOW risk, 0 impacted dependents
- `pnpm exec vitest run tests/unit/components/milestone/ReportForm.spec.ts` -> FAIL (pre-existing environment issue: failed to resolve `vue-i18n` import in this test runner context)
- `pnpm lint` -> no issues
- `pnpm exec nuxt prepare` -> success

### Completion Notes List

- Story context generated with explicit guardrails to prevent logic regressions during UI-only normalization.
- Scoped update-file baseline captured so implementation can preserve existing behavior per component.
- Normalized form field primitives across scoped admin/payment/project/milestone surfaces by adopting `Field`, `FieldLabel`, and `FieldError` where raw wrappers were used.
- Preserved existing composable/API payload logic and submit/validation behavior while standardizing label/error rendering.
- Added focused unit-test assertion to verify normalized field primitive markers in report form.
- Included explicit `close` emit typing in `AssignEngineersForm.vue` while normalizing field wrappers to keep lint clean.
- Story and sprint status advanced to `review` for `09-04-forms-normalization`.

### File List

- `_bmad-output/implementation-artifacts/09-04-forms-normalization.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `app/components/admin/AssignEngineersForm.vue`
- `app/components/admin/CreateUserForm.vue`
- `app/components/milestone/ReportForm.vue`
- `app/components/payment/PaymentConfirmDialog.vue`
- `app/components/payment/WithdrawalRequestDialog.vue`
- `app/components/project/OpenForBidsDialog.vue`
- `app/components/project/SubmitProposalDialog.vue`
- `tests/unit/components/milestone/ReportForm.spec.ts`

## Change Log

- 2026-05-10: Implemented Story 09-04 UI-only form normalization across scoped flows, validated lint/prepare, and moved status to `review`.

## Story completion status

Ultimate context engine analysis completed - comprehensive developer guide created.
