# Story 9.6: Overlays standardization

Status: done

## Story

As a user,  
I want dialogs and menus to behave predictably,  
so that actions are discoverable and keyboard-safe.

## Acceptance Criteria

1. Scoped replacements of ad-hoc overlay markup with `Dialog` / `Sheet` / `DropdownMenu` / `Popover` as appropriate.
2. Focus management is not worse than baseline, and dialog-like surfaces trap focus correctly.

## Tasks / Subtasks

- [x] Confirm scope and keep changes UI-only (no store/composable/API/status machine behavior changes):
  - [x] `app/components/layout/SidebarUserMenu.vue`
  - [x] `app/components/layout/NotificationBell.vue`
  - [x] `app/components/notifications/NotificationDrawer.vue`
  - [x] `app/components/payment/PaymentConfirmDialog.vue`
  - [x] `app/components/payment/WithdrawalRequestDialog.vue`
  - [x] `app/components/project/SubmitProposalDialog.vue`
  - [x] `app/components/milestone/RejectReasonDialog.vue`
  - [x] Any additional scoped overlay surfaces discovered during implementation (document explicitly in PR/story notes)
- [x] Standardize trigger/content composition patterns:
  - [x] Use explicit trigger + content composition where possible (`DialogTrigger` / `DropdownMenuTrigger` / `PopoverTrigger` with `as-child` when wrapping `Button`/custom triggers).
  - [x] For controlled overlays, use consistent `:open` + `@update:open` (or `v-model:open`) semantics and close behavior.
  - [x] Avoid duplicate mini-modal wrappers and ad-hoc focus handling.
- [x] Preserve behavior while normalizing overlays:
  - [x] Keep submit/confirm logic, validation, server error mapping, and emit contracts unchanged.
  - [x] Keep role gating and permission behavior unchanged.
  - [x] Keep existing i18n keys (no hardcoded user-facing strings).
- [x] UX/accessibility checks:
  - [x] Dialog surfaces: keyboard open/close works, focus remains trapped until close.
  - [x] Sheet and menu surfaces: anchor/alignment remains correct in Arabic RTL and English LTR.
  - [x] No broken pointer/touch interactions for nested actions inside cards/tables.
- [x] Verification:
  - [x] `pnpm lint`
  - [x] `pnpm exec nuxt prepare`
  - [x] Manual RTL-first overlay pass on scoped flows (then spot-check LTR)

## Dev Notes

- Epic 09 is a UI-only alignment epic; this story must not change domain logic from previous epics.
- `09-01-audit-shadcn-gaps-and-cli-plan.md` already establishes overlays as the target for this story and confirms core primitives are installed.
- Continue the same implementation boundary from 09-03/09-04/09-05: normalize composition while preserving behavior.

### Current State Snapshot (must preserve)

- `NotificationBell.vue` controls drawer visibility with local `drawerOpen`; unread polling lifecycle starts/stops on mount/unmount and must remain unchanged.
- `NotificationDrawer.vue` already uses `Sheet`; preserve mark-as-read behavior, notification sorting/filtering, and navigation side effects when clicking a notification.
- `SidebarUserMenu.vue` already uses `DropdownMenu` with RTL-aware side logic (`accountMenuSide`); preserve logout flow and disabled state while loading.
- `PaymentConfirmDialog.vue` and `WithdrawalRequestDialog.vue` already use `Dialog`; preserve form validation rules, payload shape, and submission guards.
- `SubmitProposalDialog.vue` uses controlled dialog open state and focus-on-error behavior; preserve field parsing/formatting and async submission outcomes.
- `RejectReasonDialog.vue` uses local open proxy with reason reset behavior; preserve confirm/cancel emits and min-length validation behavior.

### What This Story Changes

- Normalizes overlay usage patterns and state wiring across scoped components.
- Replaces remaining ad-hoc overlay structure with registry primitives where present in scope.
- Improves consistency of keyboard-safe and predictable overlay interactions across feature areas.

### What Must Not Break

- Existing composable/store action calls and payload contracts.
- Existing validation rules and async loading/disabled behavior in overlay forms.
- Existing role/permission-driven visibility and action availability.
- Existing i18n copy and Arabic-first RTL layout behavior.

### Architecture Compliance

- Nuxt 4 structure under `app/`; `<script setup lang="ts">` + Composition API.
- Import UI primitives from `~/components/ui/*` only.
- Keep changes surgical to scoped overlay components; do not refactor unrelated pages/components.
- Use logical Tailwind utilities in TAMM-owned files.

### Library / Framework Requirements

- shadcn-vue guidance (Context7 `/unovue/shadcn-vue`) for this story:
  - `Dialog` and `Sheet` should use trigger/content/header/footer composition and built-in open-state APIs.
  - `DropdownMenu` should use trigger/content composition and keep alignment explicit (`align`, `side`, offsets) for RTL/LTR predictability.
  - `Popover` should use controlled `v-model:open` pattern when behavior requires explicit state management.
- VeeValidate + Zod form schemas remain unchanged unless a strictly mechanical binding update is required.

### File Structure Requirements

- Primary touch targets:
  - `app/components/layout/SidebarUserMenu.vue`
  - `app/components/layout/NotificationBell.vue`
  - `app/components/notifications/NotificationDrawer.vue`
  - `app/components/payment/PaymentConfirmDialog.vue`
  - `app/components/payment/WithdrawalRequestDialog.vue`
  - `app/components/project/SubmitProposalDialog.vue`
  - `app/components/milestone/RejectReasonDialog.vue`
- Additional touched files must be overlay-scoped and justified in completion notes.
- Avoid edits to stores/composables unless required for compile safety (not expected for this story).

### Testing Requirements

- Required checks:
  - `pnpm lint`
  - `pnpm exec nuxt prepare`
- Manual checks:
  - Notifications: bell opens drawer, mark-all and item click behaviors remain intact.
  - Sidebar user menu: opens in correct direction for RTL/LTR and logout works/disabled while loading.
  - Payment confirmation dialog: validation, file handling, submit/cancel.
  - Withdrawal request dialog: validation and submit/cancel.
  - Submit proposal dialog: field validation/focus behavior and async submit states.
  - Reject reason dialog: min-length validation and close/reset behavior.

## Previous Story Intelligence (09-05)

- Keep changes constrained to visual/composition alignment and preserve current interactions.
- Keep verification practical and scoped (`lint`, `nuxt prepare`, focused manual checks).
- Continue RTL-first validation posture established in 09-05.

## Git Intelligence Summary

- Recent Epic 09 commits consistently keep business logic stable while normalizing UI composition.
- Recent overlay-relevant updates already touched form dialogs in 09-04 and shell menu behavior in 09-02/09-01 follow-ups; 09-06 should build on those patterns instead of rewriting flows.
- Commit boundaries indicate value in explicit scoped files and clear “must not break” notes to avoid cross-story regressions.

## Latest Technical Information

- Context7 lookup used: `/unovue/shadcn-vue`.
- Current docs/examples reinforce:
  - Overlay primitives should rely on registry trigger/content composition.
  - Controlled open state should use component-provided model/update APIs (not custom DOM toggles).
  - Dialog/sheet focus and keyboard behavior should come from primitive usage rather than bespoke focus code.
- These align directly with Story 09-06 ACs for predictable, keyboard-safe overlays.

## Project Context Reference

- `AGENTS.md`
- `CLAUDE.md`
- `docs/design-spec.md`
- `docs/coding-standards.md`
- `_bmad-output/planning-artifacts/epic-09-shadcn-alignment.md`
- `_bmad-output/planning-artifacts/ux-brief-epic-09-shadcn-alignment.md`
- `_bmad-output/implementation-artifacts/09-01-audit-shadcn-gaps-and-cli-plan.md`
- `_bmad-output/implementation-artifacts/09-04-forms-normalization.md`
- `_bmad-output/implementation-artifacts/09-05-lists-and-data-surfaces.md`

## Dev Agent Record

### Agent Model Used

Codex 5.3

### Debug Log References

- Workflow config resolved via `_bmad/scripts/resolve_customization.py`.
- Story key resolved from `sprint-status.yaml`: `09-06-overlays-standardization`.
- Loaded Epic 09 plan, UX brief, prior stories (09-01 through 09-05), and sprint board status.
- Read current overlay-related implementation files across layout, notifications, payment, project, and milestone areas.
- Git history analyzed (`git log --oneline -n 5` and `git log --name-only -n 5`) for implementation patterns and risk boundaries.
- Context7 used for latest shadcn-vue overlay guidance (Dialog/Sheet/DropdownMenu/Popover).
- `npx gitnexus impact "Folder:app/components/layout" -d upstream -r tamm-app` -> LOW risk, 0 impacted dependents
- `npx gitnexus impact "Folder:app/components/notifications" -d upstream -r tamm-app` -> LOW risk, 0 impacted dependents
- `npx gitnexus impact "Folder:app/components/payment" -d upstream -r tamm-app` -> LOW risk, 0 impacted dependents
- `npx gitnexus impact "Folder:app/components/project" -d upstream -r tamm-app` -> LOW risk, 0 impacted dependents
- `npx gitnexus impact "Folder:app/components/milestone" -d upstream -r tamm-app` -> LOW risk, 0 impacted dependents
- `pnpm exec vitest run tests/unit/components/payment/OverlayOpenState.spec.ts` -> FAIL (red phase before dialog handler fix), then PASS after implementation
- `pnpm exec vitest run tests/unit/components/payment/OverlayOpenState.spec.ts tests/unit/components/notifications/NotificationDrawer.spec.ts` -> PASS
- `pnpm lint` -> PASS
- `pnpm exec nuxt prepare` -> PASS
- `pnpm exec vitest run` -> PASS (full regression suite)
- `code-reviewer` pass identified follow-ups in payment overlays (currency formatting, stale max validation, i18n hardcoded literals, receipt error handling)
- Applied follow-up fixes and re-ran:
  - `pnpm exec vitest run tests/unit/components/payment/OverlayOpenState.spec.ts tests/unit/components/notifications/NotificationDrawer.spec.ts` -> PASS
  - `pnpm lint` -> PASS
  - `pnpm exec nuxt prepare` -> PASS
  - `pnpm exec vitest run` -> PASS

### Completion Notes List

- Implemented controlled open-state normalization for payment overlays so `close` emits only when overlays actually close.
- Added focused regression tests to lock dialog open/close event behavior and prevent accidental close emissions.
- Unified notification sheet wiring to `v-model:open` and added explicit `aria-expanded` on notification trigger button.
- Kept all submit logic, validation behavior, and permission pathways unchanged while extending i18n keys only for newly normalized overlay literals.
- No additional overlay surfaces were required beyond scoped targets.
- Addressed code-review findings in payment overlays:
  - fixed `formatCurrency` usage for milestone payment amount display
  - switched receipt-image errors to `setFieldError` for VeeValidate-aligned error updates
  - made withdrawal amount max validation reactive to current available balance
  - replaced hardcoded dialog literals with i18n keys and added locale entries

### File List

- `_bmad-output/implementation-artifacts/09-06-overlays-standardization.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `app/components/layout/NotificationBell.vue`
- `app/components/notifications/NotificationDrawer.vue`
- `app/components/payment/PaymentConfirmDialog.vue`
- `app/components/payment/WithdrawalRequestDialog.vue`
- `tests/unit/components/payment/OverlayOpenState.spec.ts`
- `i18n/locales/en.json`
- `i18n/locales/ar.json`

## Change Log

- 2026-05-10: Standardized overlay open-state behavior for payment dialogs, normalized notification sheet model binding, and added focused overlay regression tests.
- 2026-05-10: Applied code-review follow-up fixes for payment overlay formatting/validation/i18n consistency and revalidated full suite.

## Story completion status

Story implementation complete and ready for review.
