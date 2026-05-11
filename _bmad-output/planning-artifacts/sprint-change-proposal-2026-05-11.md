# Sprint Change Proposal — Backend Contract Alignment Wave (2026-05-11)

## 1) Issue Summary

### Trigger

Backend provided authoritative answers to previously open blockers in `docs/BACKEND_BLOCKERS.md`:

- Q1 token lifecycle clarified
- Q2 OTP clarified
- Q3 registration role clarified
- Q7 single-role behavior clarified
- Q11/Q12/Q13/Q14/Q15/Q16/Q17 clarified
- New authoritative status machines supplied for milestone/task/project/payment/field_report/withdrawal/approval/assignment

### What changed

The frontend baseline assumptions in multiple completed stories (especially Epics 01/03/04/05/07) diverge from backend contracts:

- Milestone flow differs from frontend assumptions (`draft/submitted/under_review/approved/rejected` now authoritative)
- Client final approval is no longer a milestone endpoint responsibility in current backend guidance
- Payment status model and update endpoint semantics differ
- Notification data contract is richer and shape-specific
- ID typing is mixed (integers for most resources, UUID for notifications)

### Why this matters now

Continuing implementation without re-baselining artifacts will produce:

- incorrect status transitions,
- invalid endpoint usage,
- wrong TypeScript contracts,
- and role/action mismatches at runtime.

---

## 2) Impact Analysis

### Epic impact

- **Epic 01 (Auth):** impacted by JWT refresh strategy, OTP semantics, registration role alias
- **Epic 02 (Projects):** impacted by pending project schema update (Q5) and status transition mapping
- **Epic 03 (Milestones/Approvals/Reports):** heavily impacted by milestone and approval lifecycle
- **Epic 04 (Payments):** heavily impacted by payment status machine and `PATCH /payments/{id}` behavior
- **Epic 05 (Notifications):** impacted by notification payload and navigation strategy
- **Epic 07 (Proposals):** medium impact via project status naming alignment
- **Epic 06/admin permissions surfaces:** medium impact pending permission list release (Q6)

### Story impact

- Stories previously marked done remain functionally valuable, but contract bindings and acceptance criteria need correction.
- Highest-risk story set for runtime regressions: `03-01` to `03-07`, `04-01` to `04-06`, `05-01` to `05-04`.

### Artifact conflicts

- **PRD conflict:** FR descriptions still describe legacy milestone/payment assumptions.
- **Epic conflict:** acceptance criteria and technical notes mention endpoints/statuses no longer authoritative.
- **UX conflict:** timeline and action copy still assume `supervisor_approved` milestone terminal stage in places.

### Technical impact

- `utils/statusMachine.ts` must be re-authored to backend-authoritative enums/transitions.
- Shared types must adopt mixed ID strategy (int vs UUID) and new status enums.
- Composables for approvals/tasks/field-reports/payments/withdrawals/notifications need contract realignment.
- Permission abstraction remains valid, but permission key mapping waits for Q6 response.

---

## 3) Recommended Approach

### Chosen path: Direct Adjustment + Focused Re-baseline

Use a **moderate-scope direct adjustment** strategy:

1. Re-baseline docs and acceptance criteria first.
2. Execute a short implementation sprint to align contracts and types.
3. Hold project schema and permissions-dependent work behind a short wait gate (Swagger update ETA ~2 hours).

### Rationale

- Lower risk than hard rollback.
- Preserves completed UX work while swapping integration contracts.
- Minimizes rework and keeps current sprint momentum.

### Effort / risk / timeline

- **Effort:** 1–2 focused dev days for contract alignment + regression checks
- **Risk:** Medium (multiple domains touched, but mostly deterministic schema updates)
- **Timeline impact:** Low-to-medium; bounded by pending Swagger publication for Q5/Q6

---

## 4) Detailed Change Proposals (Old → New)

## A) PRD updates

### PRD section: 4.3 Milestones, reports, approvals

**OLD**
- Field submission → supervisor review → client final approval; invalid transitions blocked (`canTransition`).

**NEW**
- Milestone lifecycle aligns to backend status machine:
  - `draft -> submitted -> under_review -> approved|rejected`, and `rejected -> draft`.
- Approval records are auto-created when milestone moves to `submitted` (one approval per milestone, assigned to supervisor).
- Client final approval remains a separate approval flow and is currently marked TBD by backend.

**Rationale**
- Aligns lifecycle language to backend authoritative transitions and assignment model.

### PRD section: 4.4 Payments & escrow semantics

**OLD**
- Payment statuses were tied to legacy frontend flow (`pending_payment`, `ready_for_payout`, etc.).

**NEW**
- Payment lifecycle aligns to backend:
  - `pending -> awaiting_release -> processing -> paid|failed`, `failed -> pending`.
- Status updates use `PATCH /payments/{payment}` with body `{ status, notes?, proof_url? }`.
- Setting status to `paid` triggers escrow release behavior.

**Rationale**
- Removes contract mismatch that would break payment flows and status rendering.

### PRD section: 3 Users & Permissions

**OLD**
- Roles listed without clarifying returned user role cardinality.

**NEW**
- UI treats user as **single-role** (`UserResource.role` string), even if DB supports multi-role internally.
- Registration role uses `owner` alias (mapped to frontend `client` semantics).

**Rationale**
- Prevents incorrect multi-role assumptions in UI routing and permission display.

## B) Epic 01 updates

### Story 01-02 technical notes

**OLD**
- Refresh behavior implied but not concretely specified.

**NEW**
- Access token TTL = 1h, refresh token TTL = 2 weeks.
- Refresh proactively around minute 55 and also on 401 fallback.

**Rationale**
- Explicitly encodes backend token policy for stable session UX.

### Story 01-01/01-02 auth scope

**OLD**
- OTP semantics potentially conflated with login 2FA.

**NEW**
- OTP is for account verification only (not login 2FA).
- Registration requires OTP verification before account activation (`status -> active`).

**Rationale**
- Prevents building incorrect login-time OTP behavior.

## C) Epic 03 updates

### Story 03-01 action matrix and statuses

**OLD**
- Uses `not_started/in_progress/supervisor_approved` lifecycle assumptions.

**NEW**
- Milestone status surface must use backend-authoritative values:
  - `draft`, `submitted`, `under_review`, `approved`, `rejected`.
- Rejection cycle returns milestone to `draft` (not `in_progress`).
- Approval queue behavior references backend approval records created on submit.

**Rationale**
- Fixes the highest-impact mismatch in core domain workflow.

### Story 03-03/03-04/03-05 endpoints

**OLD**
- Report submit and final approval references old endpoint/state assumptions.

**NEW**
- Milestone transition endpoints:
  - submit: `POST /milestones/{milestone}/submit`
  - approve/reject: `POST /milestones/{milestone}/approve|reject`
- Approval actions via `POST /approvals/{approval}/approve|reject` drive review flow states.
- Keep “client final approval” marked as separate flow pending backend’s finalization details.

**Rationale**
- Removes ambiguous endpoint ownership and aligns with authoritative route behavior.

## D) Epic 04 updates

### Stories 04-01..04-06 payment statuses/endpoints

**OLD**
- Relies on legacy payment statuses and release endpoint assumptions.

**NEW**
- Replace status vocabulary and transitions with backend `payment_status` machine.
- Primary update operation uses `PATCH /payments/{payment}`.
- `status = paid` represents escrow release trigger per backend guidance.

**Rationale**
- Prevents invalid transitions and broken badges/actions in payment UI.

## E) Epic 05 updates

### Notification schema assumptions

**OLD**
- Assumes simple body/link/read boolean model.

**NEW**
- Notification payload:
  - `data: { resource_type, resource_id, action_url, actor_name }`
- Navigation strategy:
  1. Navigate by `action_url` when present.
  2. Fallback build route from `{resource_type, resource_id}`.
- Notification IDs are UUID; other resource IDs are integers.

**Rationale**
- Ensures robust deep-link behavior and typing accuracy.

## F) Shared type contracts

### IDs and enums

**OLD**
- Mixed assumptions and string IDs in multiple places.

**NEW**
- Standardize:
  - `type EntityId = number` for non-notification entities.
  - `type NotificationId = string` (UUID).
- Replace legacy status unions in shared types with backend machines.

**Rationale**
- Eliminates recurring runtime bugs from mismatched ID/status types.

---

## 5) Implementation Handoff

### Scope classification

**Moderate**

Why:
- Multiple artifacts and domains affected
- No fundamental product strategy change
- Mostly deterministic integration re-alignment

### Handoff recipients

- **Developer agent / frontend engineer**
  - Update status machine + shared domain types
  - Refactor affected composables and role/action mappings
  - Patch impacted components and i18n labels
- **PO/Tech lead**
  - Validate doc updates and acceptance criteria changes
  - Confirm freeze gate until Q5/Q6 Swagger release

### Execution plan

1. **Docs first**
   - Update `docs/BACKEND_BLOCKERS.md` open/answered sections and action plan.
   - Update impacted epic acceptance criteria to backend-authoritative status/endpoints.

2. **Core contract pass**
   - Update `utils/statusMachine.ts` and shared type files.
   - Add explicit ID typing strategy (`number` vs notification UUID).

3. **Domain alignment pass**
   - Milestones/approvals/tasks/field-reports/payments/withdrawals/notifications composables.
   - Keep project/permissions-dependent details behind Q5/Q6 gate.

4. **UI compatibility pass**
   - Action buttons, status badges, timeline text, notification routing.
   - i18n key updates for changed status labels and action copy.

5. **Verification**
   - Transition guards pass against new status machines.
   - Lint/type checks + role smoke tests.

### Success criteria

- No frontend usage of deprecated milestone/payment status names.
- All status transitions validated against backend-authoritative machine.
- Correct endpoint usage for submit/approve/reject/update across domains.
- Notification navigation works with `action_url` and fallback route building.
- ID types are consistent: integer entities, UUID notifications.
- Q5/Q6 merge pass completed once Swagger refresh lands.

---

## 6) Proposed Next Story Pack (Fast Re-entry)

1. **CC-01** — Contract baseline patch (statusMachine + shared types + ID model)
2. **CC-02** — Milestone + approvals + tasks flow alignment
3. **CC-03** — Payments + withdrawals contract alignment
4. **CC-04** — Notifications payload/routing + unread flow hardening
5. **CC-05** — Auth refresh/OTP/registration role alignment
6. **CC-06** — Q5/Q6 follow-up patch once Swagger update is live

---

## Decision Prompt

Approve this proposal for implementation routing?

- `yes` → proceed with direct implementation (moderate-scope route)
- `revise` → specify sections to adjust
- `hold` → wait for Q5/Q6 Swagger and rerun a tighter proposal
