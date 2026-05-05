# Epic 04 — Payments & Escrow

> **BMAD context:** Payments in TAMM are escrow-based.
> Client pays upfront per milestone. Funds are held until milestone is approved.
> Admin releases payment to contractor after client approval.
> Payment status is DERIVED from milestone status — never managed independently.
> Read `docs/status-flows.md §4` in full before implementing any story here.

---

## Epic goal

Clients pay for milestones upfront with confidence.
Contractors receive payment only after work is approved.
The system protects all parties.

---

## Stories

---

### Story 04-01 — Client pays for a milestone

**As a** client,
**I want to** pay for a milestone before work begins,
**so that** funds are secured and the contractor can start with confidence.

#### Acceptance criteria

- [ ] "Pay milestone" button visible only to `client` when milestone is `not_started` AND payment is `pending_payment`
- [ ] Button shows the milestone amount prominently before clicking
- [ ] Clicking opens payment confirmation dialog:
  ```
  ┌─────────────────────────────────────────┐
  │  Pay for: Foundation work               │
  │                                         │
  │  Amount: SAR 50,000                     │
  │                                         │
  │  Funds will be held securely until      │
  │  the milestone is approved.             │
  │                                         │
  │  [Cancel]          [Confirm payment →]  │
  └─────────────────────────────────────────┘
  ```
- [ ] On confirm: calls `POST /milestones/:id/pay`
- [ ] On success:
  - Payment status updates to `paid`
  - Milestone status updates to `in_progress` (backend triggers this)
  - Success toast: "Payment received. Work can now begin."
  - Button disappears — replaced by payment status badge
- [ ] On error: error toast, no state change
- [ ] Amount formatted with `formatCurrency()`
- [ ] Payment method selection is a placeholder for MVP (no real payment gateway in MVP — backend handles)

#### Technical notes
- MVP: payment is simulated/manual — no real payment gateway integration
- The `POST /milestones/:id/pay` endpoint marks payment as received
- Backend is responsible for transitioning milestone to `in_progress` after payment

---

### Story 04-02 — Payment status badge on milestone

**As a** user,
**I want to** see the payment status on each milestone,
**so that** I know where the money is at any point.

#### Acceptance criteria

- [ ] `PaymentStatusTag` component shows alongside milestone status
- [ ] Uses `PAYMENT_STATUS_META` from `utils/statusMachine.ts` for color + label
- [ ] Client, contractor, and admin all see payment status
- [ ] Field engineer and supervisor do NOT see payment amounts or status
- [ ] Status labels use i18n keys
- [ ] Correct badge per status:
  - `pending_payment` → neutral "Awaiting payment"
  - `paid` → blue "In escrow"
  - `awaiting_approval` → yellow "Awaiting approval"
  - `ready_for_payout` → yellow "Ready for release"
  - `paid_out` → green "Paid out"

---

### Story 04-03 — Admin releases payment to contractor

**As an** admin,
**I want to** release an approved milestone's payment to the contractor,
**so that** the contractor receives their earned funds.

#### Acceptance criteria

- [ ] Admin sees "Release payment" button on milestones with status `approved` and payment `ready_for_payout`
- [ ] Button is NOT visible to client, contractor, or engineers
- [ ] Clicking opens confirmation dialog:
  ```
  ┌──────────────────────────────────────────────┐
  │  Release payment                             │
  │                                              │
  │  Milestone: Foundation work                  │
  │  Contractor: Mohammed Al-Rashid              │
  │  Amount: SAR 50,000                          │
  │                                              │
  │  This action cannot be undone.               │
  │                                              │
  │  [Cancel]           [Release SAR 50,000 →]  │
  └──────────────────────────────────────────────┘
  ```
- [ ] On confirm: calls `POST /payments/:id/release`
- [ ] On success:
  - Payment status updates to `paid_out`
  - Contractor receives in-app notification: "Payment released — SAR 50,000"
  - "Release payment" button disappears
  - `paid_out` badge shown
- [ ] `canTransition('payment', status, 'paid_out')` validated before call
- [ ] Rollback on error
- [ ] Amount formatted correctly

---

### Story 04-04 — Contractor payment history

**As a** contractor,
**I want to** see a history of all payments I've received and what's pending,
**so that** I can track my earnings across projects.

#### Acceptance criteria

- [ ] Route: `/payments` (accessible to `contractor` only)
- [ ] Shows list of all milestones with their payment status
- [ ] Grouped by: "Pending" (awaiting_approval, ready_for_payout) and "Received" (paid_out)
- [ ] Each item shows: project name, milestone name, amount, payment status, date
- [ ] "Pending" total prominently shown at top
- [ ] "Received" total shown at top
- [ ] Empty state when no payments exist
- [ ] Amounts formatted with `formatCurrency()`
- [ ] RTL verified

---

### Story 04-05 — Client payment overview

**As a** client,
**I want to** see how much I've paid and how much is remaining across all my projects,
**so that** I can manage my budget.

#### Acceptance criteria

- [ ] Financial summary section in project detail page (Story 02-03) shows:
  - Total project value
  - Total paid into escrow
  - Total released to contractor
  - Remaining to pay
- [ ] Dashboard shows aggregate across all projects:
  - Total committed
  - Total in escrow
  - Total paid out
- [ ] All amounts formatted with `formatCurrency()`
- [ ] No payment status details shown for milestones not yet reached

---

## Epic done when

- [ ] All 5 stories complete
- [ ] Full payment lifecycle tested: `pending_payment` → `paid_out`
- [ ] Role visibility verified: engineers never see amounts
- [ ] Admin release flow tested with confirmation + rollback
- [ ] Contractor payment history renders correctly
- [ ] `canTransition('payment', ...)` called before release action
- [ ] RTL verified for all payment UI
- [ ] Mocks replaced as `POST /milestones/:id/pay` and `POST /payments/:id/release` become available
