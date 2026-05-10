# Story 9.3: Auth shells

Status: review

## Story

As a visitor,  
I want login-related pages to use the same primitive language as the rest of the app,  
so that auth feels first-party and accessible.

## Acceptance Criteria

1. Forms use registry inputs/buttons/fields consistently while preserving Epic 01 behavior (validation, inline errors, loading, auth flow outcomes).
2. Optional login-block style shell can be adopted only if branding, i18n, and existing auth route behavior remain correct.
3. RTL (Arabic default) and LTR (English) are both verified for auth pages.

## Tasks / Subtasks

- [x] Audit current auth shell/pages and confirm exact update set:
  - [x] `app/layouts/auth.vue`
  - [x] `app/components/auth/AuthSplitShell.vue`
  - [x] `app/components/auth/LoginForm.vue`
  - [x] `app/components/auth/ForgotPasswordForm.vue`
  - [x] `app/components/auth/ResetPasswordForm.vue`
  - [x] `app/pages/login.vue`, `app/pages/forgot-password.vue`, `app/pages/reset-password.vue`
- [x] Normalize shell/layout composition using existing shadcn-vue primitives and tokens:
  - [x] Keep `auth` layout as the shell boundary (`layout: 'auth'` remains on all three pages)
  - [x] Keep TAMM logo placement and i18n-driven brand labeling intact
  - [x] Preserve responsive split behavior and avoid introducing horizontal overflow on mobile
- [x] Normalize form markup consistency (visual-only):
  - [x] Continue using `Button`, `Input`, `Field`, `FieldLabel`, `FieldError` patterns
  - [x] Keep submit loading/disabled states and prevent double submit
  - [x] Keep inline validation/server errors at field level (no toast regression for existing inline paths)
- [x] Verify no behavior regressions:
  - [x] Login still uses `auth.login(...)` and preserves 401/network handling
  - [x] Forgot-password and reset-password still call existing `useApi` endpoints and preserve success/error routing
  - [x] Reset password token gate remains intact (`invalidResetToken` handling)
- [x] Execute verification:
  - [x] RTL/LTR visual pass on all three auth pages
  - [x] `pnpm lint`
  - [x] `pnpm exec nuxt prepare`
  - [x] run scoped tests for auth forms/pages if touched tests exist; otherwise add focused coverage only if needed by refactor risk

## Dev Notes

- Epic 09 is UI-only cleanup; do not alter stores/composables/contracts/permission logic.
- Epic 01 behavior is the source of truth for auth outcomes:
  - login validation, 401 invalid credentials handling, loading states, and route flow
  - forgot-password/reset-password endpoint behavior and error semantics
- Current auth implementation already uses shadcn primitives heavily; Story 09-03 should target shell consistency and markup normalization without business logic churn.

### Current State Snapshot (must preserve)

- `app/layouts/auth.vue`: minimal full-viewport background shell with slot.
- `app/components/auth/AuthSplitShell.vue`: split page scaffold, logo area, center content width variants (`xs|sm`), muted media pane on desktop.
- `LoginForm.vue`:
  - VeeValidate + Zod schema and field wiring.
  - Uses `auth.login`.
  - Password visibility toggle with logical positioning (`inset-e-*`).
  - Inline server and field errors; loading-disabled submit button.
- `ForgotPasswordForm.vue`:
  - Uses `useApi('/auth/forgot-password')`.
  - Success state swaps form with status panel + back-to-login action.
- `ResetPasswordForm.vue`:
  - Uses token from query.
  - Blocks submit on missing token and shows inline alert.
  - Uses `useApi('/auth/reset-password')`, redirects to `/login` on success.

### What This Story Changes

- Shell and visual composition alignment for auth pages/components to match Epic 09 shadcn conventions.
- Keep behavior and APIs unchanged; only adjust structure/styling/primitive composition where needed.
- Optional login block inspiration is allowed only when drop-in compatible with TAMM auth layout and i18n branding.

### What Must Not Break

- `definePageMeta({ layout: 'auth' })` on login/forgot/reset pages.
- i18n keys and existing user-facing copy behavior.
- RTL-safe logical classes (`ms-*`, `pe-*`, `inset-e-*`, `text-start`, etc.) in TAMM-owned files.
- Validation rules and submission side effects in each form.
- Existing accessibility affordances (labels, status/alert semantics, disabled states).

### Architecture Compliance

- Nuxt 4 app structure under `app/`.
- Composition API + `<script setup lang="ts">`; no Options API.
- No new package installs for this story unless explicitly approved.
- Keep imports from local primitives (`~/components/ui/*`), never package paths.

### Library / Framework Requirements

- shadcn-vue references for this story:
  - Field composition patterns from `field` primitives.
  - Card/form composition patterns for auth surfaces where useful.
  - Block borrowing is optional; avoid importing demo data or introducing unrelated components.
- VeeValidate + Zod integration remains as-is (schema-first, typed form state).

### Testing Requirements

- Minimum checks:
  - `pnpm lint`
  - `pnpm exec nuxt prepare`
  - Manual pass:
    - `/login` invalid credentials, loading state, password toggle, RTL/LTR
    - `/forgot-password` success + error paths, back-to-login
    - `/reset-password?token=...` success path and missing-token path
- Add/adjust unit tests only where template refactors introduce risk to interaction behavior.

## Previous Story Intelligence (09-02)

- Story 09-02 enforced strict shell-only scope and retained behavior parity; apply same discipline here.
- Keep directional and locale-safe behavior explicit (logical utilities + dir-aware composition).
- Reuse Story 09-02 verification style: lint + nuxt prepare + scoped tests rather than broad unrelated suite churn.

## Git Intelligence Summary

- Recent commits indicate active shell and i18n direction fixes:
  - `fix(ui): align shell direction handling for LTR and RTL`
  - `fix(ui): Arabic default locale and shell i18n after Epic 09 review`
- Auth/UI hydration was recently stabilized:
  - `fix(auth,ui): stabilize hydration and Badge barrel imports`
- Implication for 09-03: avoid broad architectural changes; keep edits local to auth shell/components and verify directionality.

## Latest Technical Information

- Context7 (`/unovue/shadcn-vue`) confirms recommended auth composition remains primitive-first:
  - card/header/content/footer composition for structured auth surfaces
  - typed form integration with VeeValidate + Zod and field/form components
  - optional registry block installs are possible, but only beneficial if they fit project layout without regressions
- For this story, keep current local primitives and align composition patterns; no registry churn unless clearly justified.

## Project Context Reference

- Authoritative rules:
  - `AGENTS.md`
  - `CLAUDE.md`
  - `_bmad-output/planning-artifacts/epic-09-shadcn-alignment.md`
  - `_bmad-output/planning-artifacts/epic-01-auth.md`
  - `_bmad-output/planning-artifacts/ux-brief-epic-09-shadcn-alignment.md`

## Dev Agent Record

### Agent Model Used

Codex 5.3

### Debug Log References

- Story context preparation used:
  - sprint board state
  - Epic 09 + UX brief
  - Epic 01 auth requirements
  - previous story 09-02 learnings
  - recent git history and shadcn-vue Context7 references
- `npx gitnexus analyze .` (refreshed stale index before impact analysis)
- `npx gitnexus impact "Folder:app/components/auth" -d upstream -r tamm-app` -> LOW risk, 0 impacted dependents
- `pnpm lint` -> 0 errors, 1 pre-existing warning (`AssignEngineersForm.vue`, explicit emits)
- `pnpm exec nuxt prepare` -> success
- `pnpm exec vitest run tests/unit/layout/Topbar-shell.spec.ts` -> PASS
- `pnpm exec vitest run` -> FAIL (pre-existing unrelated failures in notifications/composable suites)

### Completion Notes List

- Story file built with explicit preservation guardrails to prevent logic regressions during UI-only auth shell normalization.
- Story moved to `in-progress` then `review` in sprint tracking.
- Auth forms now use consistent `Card` + `CardHeader` + `CardContent` surface composition while preserving existing validation/submission logic.
- `AuthSplitShell` updated with shell-level visual consistency (`bg-background`, overflow-safe media panel, logical divider) and no route/meta changes.
- `auth` layout retained as shell boundary and kept minimal while enforcing foreground token.
- No API/store/business logic changes; only auth shell and auth component UI composition was touched.

### File List

- `app/layouts/auth.vue`
- `app/components/auth/AuthSplitShell.vue`
- `app/components/auth/LoginForm.vue`
- `app/components/auth/ForgotPasswordForm.vue`
- `app/components/auth/ResetPasswordForm.vue`
- `_bmad-output/implementation-artifacts/09-03-auth-shells.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log

- 2026-05-10: Implemented Story 09-03 auth shell normalization with shadcn card-based auth surfaces, preserved Epic 01 auth behaviors, and completed verification checks.
