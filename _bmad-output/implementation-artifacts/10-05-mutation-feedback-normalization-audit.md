# Story 10.5: Mutation feedback normalization audit

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created. -->

## Story

As a **user performing sensitive async actions** (payments, milestone approvals, admin operations),

I want **consistent Sonner feedback, AlertDialog for destructive commits, and no duplicate success toasts**,

So that **the app feels trustworthy and calm instead of noisy or ambiguous**.

## Acceptance Criteria

1. **Audit artifact:** A maintained markdown list names each audited mutation surface, its confirmation UI (if any), toast entrypoint, and i18n keys. Deliverable: `_bmad-output/implementation-artifacts/10-05-mutation-feedback-audit-log.md` (updated in this story).
2. **Destructive confirmations:** Destructive or irreversible commits identified in the audit use **`AlertDialog`** (not generic `Dialog`): **admin payment release**, **admin user deactivation**, and parity with existing **contractor selection** (`ProposalsList.vue`).
3. **Sonner single path:** User-visible async outcomes use **`useNotifications().notify`** (Sonner via `vue-sonner`) — remove direct `toast` imports from app components audited here (`CreateUserForm`, `AssignEngineersForm`, `SubmitProposalDialog`).
4. **No duplicate toast storms:** Exactly **one** success/error toast per completed mutation. Known duplicates fixed in this story:
   - `app/pages/reviews/index.vue` — parent fired `showNotification` after `ApprovalFlow` already called `notify.success`.
   - `app/components/client/ApprovalQueueList.vue` — parent fired `notify.success` after `ClientApprovalFlow` already notified.
5. **Dedupe strategy (explicit):** Extend `notify.*` to accept optional **`{ id?: string; duration?: number }`** (passed to `vue-sonner`). Use **stable `id`s** for milestone payment/release success tied to `milestone.id` so rapid retries replace rather than stack. Document the rule in the audit log.

## Tasks / Subtasks

- [x] Author/update **`10-05-mutation-feedback-audit-log.md`** with the mutation matrix + dedupe rule.
- [x] Extend **`app/composables/useNotifications.ts`** (`notify` + `showNotification`) with optional toast options; extend **`useNotifications.spec.ts`**.
- [x] Remove duplicate parent toasts: **`reviews/index.vue`**, **`ApprovalQueueList.vue`**; ensure **reject** path still **`emit('action-complete')`** so lists refresh.
- [x] Replace direct **`toast`** usage with **`notify`** in **`CreateUserForm.vue`**, **`AssignEngineersForm.vue`**, **`SubmitProposalDialog.vue`**.
- [x] **`PaymentReleaseDialog.vue`:** migrate destructive confirmation from **`Dialog`** to **`AlertDialog`** (+ **`AlertDialogDescription`** for accessibility).
- [x] **`users.vue`:** Add **`AlertDialog`** before **`toggleUserStatus`** when transitioning **active → inactive**; **activate** remains one-click without modal.
- [x] Apply **`notify.success(..., { id: ... })`** on payment/release and approval flows via **`milestoneMutationToastId`** in **`PayMilestoneButton.vue`**, **`MilestoneActions.vue`**, **`ApprovalFlow.vue`**, **`ClientApprovalFlow.vue`**.
- [x] **`pnpm exec vitest run`**, **`pnpm lint`**, **`pnpm exec nuxt build`** verified.

## Dev Notes

### Developer guardrails

| Topic | Instruction |
|-------|-------------|
| No new packages | Sonner already via **`vue-sonner`**; **`Toaster`** in app shell unchanged. |
| i18n | All new user-visible strings in **`i18n/locales/en.json`** + **`ar.json`**. |
| RTL / logical CSS | AlertDialog/footer buttons use existing patterns from **`ProposalsList.vue`**. |
| Permissions | Keep **`usePermission().can()`** checks; do not bypass **`toggleUserStatus`** optimistic logic inside composable. |

### Files touched

| Action | Path |
|--------|------|
| NEW | `_bmad-output/implementation-artifacts/10-05-mutation-feedback-audit-log.md` |
| NEW | `app/utils/mutationFeedback.ts` |
| NEW | `tests/unit/mutationFeedback.spec.ts` |
| UPDATE | `app/composables/useNotifications.ts` |
| UPDATE | `app/composables/useNotifications.spec.ts` |
| UPDATE | `app/pages/reviews/index.vue` |
| UPDATE | `app/components/client/ApprovalQueueList.vue` |
| UPDATE | `app/components/admin/CreateUserForm.vue` |
| UPDATE | `app/components/admin/AssignEngineersForm.vue` |
| UPDATE | `app/components/project/SubmitProposalDialog.vue` |
| UPDATE | `app/components/payment/PaymentReleaseDialog.vue` |
| UPDATE | `app/pages/users.vue` |
| UPDATE | `app/components/milestone/PayMilestoneButton.vue` |
| UPDATE | `app/components/milestone/MilestoneActions.vue` |
| UPDATE | `app/components/milestone/ApprovalFlow.vue` |
| UPDATE | `app/components/milestone/ClientApprovalFlow.vue` |
| UPDATE | `i18n/locales/en.json`, `i18n/locales/ar.json` |
| UPDATE | `_bmad-output/implementation-artifacts/sprint-status.yaml` |

### Previous story intelligence (10-04)

- Prefer **focused diffs**; preserve **`UserTable`** / preset behaviour unrelated to this story.
- **`tests/unit/rtl/tamm-no-physical-tailwind.spec.ts`** must stay green.

### Architecture / traceability

- **Epic 10 / Story 10-05** — `_bmad-output/planning-artifacts/epic-10-product-experience-advancement.md`.
- Core notify wrapper — `app/composables/useNotifications.ts`.

### Open questions (non-blocking)

- **`PaymentConfirmDialog`** remains a **`Dialog`** (multi-field form); final “pay” could gain a separate **`AlertDialog`** step later if product wants stricter parity.

## Dev Agent Record

### Agent Model Used

GPT-5.2 (Cursor agent)

### Debug Log References

- Sprint **`10-05-mutation-feedback-normalization-audit`**: **`ready-for-dev`** → **`done`**.

### Completion Notes List

- **`SonnerToastOptions`** exported; **`notify.*`** passes options only when defined (no empty `{}` args).
- **`milestoneMutationToastId`** centralizes toast **`id`** strings for milestone mutations.
- Client approval queue now refreshes on **reject** as well as **approve** (both wire **`handleApprovalFinished`**).

### File List

- See “Files touched” table above.

## Change Log

- **2026-05-11:** Story context created (`ready-for-dev`).
- **2026-05-12:** Implemented audit log, notify normalization, AlertDialog migrations, dedupe ids, tests, build verified (`done`).

## Code review (adversarial triage)

### Blind Hunter

- [x] **Hidden toast channel** — direct **`toast`** removed from audited components; only **`useNotifications`** imports **`vue-sonner`**.

### Edge Case Hunter

- [x] **`ApprovalQueueList`** — **`removePendingApproval`** runs on both approve and reject completion paths before refresh.

### Acceptance Auditor

- [x] **Audit log** documents mutations + dedupe rule; **PaymentReleaseDialog** uses **AlertDialog** + description + loading **Loader2**.

**Story completion:** **`done`**.

## Story completion status

Implementation and adversarial review completed; sprint status **`done`**.
