# Mutation feedback audit log (Story 10-05)

Maintained inventory of **audited mutations**, **confirmation UI**, **toast channel**, and **i18n keys**. Non-blocking outcomes use **Sonner** through **`useNotifications().notify`** only (no direct `toast` imports in audited components).

## Dedupe strategy

- **`notify.success` / `notify.error`** accept optional `{ id?: string; duration?: number }`, forwarded to **`vue-sonner`**.
- For milestone-scoped mutations, prefer **`id: mutation:milestone:<action>:<milestoneId>`** so duplicate fires for the same milestone **replace** the prior toast instead of stacking.
- **Single responsibility:** The component or composable that **owns the mutation** shows the toast. Parents that only **refresh lists** must **not** fire a second success toast (fixed: supervisor reviews page, client approval queue list).

## Payments

| Mutation | Location | Confirmation | Toast | i18n keys (examples) |
|----------|----------|--------------|-------|---------------------|
| Client pays milestone | `PayMilestoneButton.vue`, `MilestoneActions.vue` → `payForMilestone` | `PaymentConfirmDialog` (`Dialog` — form) | `notify.success` / `notify.error` with dedupe id | `payment.success.message`, `payment.error.message` |
| Admin releases payout | `MilestoneActions.vue` → `releaseMilestonePayment` | `PaymentReleaseDialog` (**`AlertDialog`**) | `notify.success` with dedupe id | `payment.message.released`, errors inline in dialog |

## Milestone approvals / rejections

| Mutation | Location | Confirmation | Toast | i18n keys (examples) |
|----------|----------|--------------|-------|---------------------|
| Supervisor approve/reject | `ApprovalFlow.vue` | `Dialog` multi-step + `RejectReasonDialog` | `notify.success` / `notify.error` with dedupe id | `success.milestone_approved`, `success.milestone_rejected`, `errors.milestone_*` |
| Client approve/reject | `ClientApprovalFlow.vue` | same pattern | `notify.success` / `notify.error` with dedupe id | `success.client_milestone_*`, `errors.client_milestone_*` |
| Supervisor queue (list) | `reviews/index.vue` | — | **None** (toast owned by `ApprovalFlow`) | — |
| Client queue (widget) | `ApprovalQueueList.vue` | — | **None** (toast owned by `ClientApprovalFlow`) | — |

## Admin & proposals

| Mutation | Location | Confirmation | Toast | i18n keys (examples) |
|----------|----------|--------------|-------|---------------------|
| Deactivate user | `users.vue` → `toggleUserStatus` | **`AlertDialog`** when **active → inactive** | _(optional follow-up)_ composable does not toast today | `admin.users.deactivate_confirm.*` |
| Create user | `CreateUserForm.vue` | — | `notify` | `errors.user_created`, `errors.user_creation_failed` |
| Assign engineers | `AssignEngineersForm.vue` | — | `notify` | `errors.engineers_assigned`, assignment errors |
| Assign engineers dialog | `AssignEngineersDialog.vue` | `Dialog` | `notify` | `projects.assignEngineers.*` |
| Submit proposal | `SubmitProposalDialog.vue` | — | `notify` | `projects.submitProposal.*` |
| Select contractor | `ProposalsList.vue` | **`AlertDialog`** (existing) | _(handled in selection handler)_ | `projects.proposals.*` |

## Reports & projects

| Mutation | Location | Confirmation | Toast | Notes |
|----------|----------|--------------|-------|-------|
| Submit report / draft | `ReportForm.vue` | — | `notify` | |
| Project status transition | `useProjectActions.ts` | varies by caller | `notify` | |

---

_Last updated: Story 10-05 implementation._
