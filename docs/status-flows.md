# status-flows.md — TAMM State Machines

> This document is the single source of truth for every status and transition in TAMM.
> Claude Code reads this before implementing any approval, rejection, or payment flow.
> BMAD uses this to generate accurate user stories with correct acceptance criteria.

---

## Core principle

**Status = the language of the system.**
Every action a user takes either reads a status or changes one.
No status change happens without a triggering event.
No transition is valid unless it appears in this document.

---

## 1. Milestone status flow

### Statuses

| Status | Constant | Who sees it | Meaning |
|---|---|---|---|
| Not started | `not_started` | All | Milestone created, work not begun |
| In progress | `in_progress` | All | Contractor is executing |
| Under review | `under_review` | All | Report submitted, awaiting supervisor |
| Supervisor approved | `supervisor_approved` | All | Supervisor approved, awaiting client |
| Approved | `approved` | All | Client approved — terminal, payment released |
| Rejected | `rejected` | All | Temporary — immediately returns to `in_progress` |

### Transition map

```
not_started
    │
    │  [contractor starts work / admin activates]
    ▼
in_progress
    │
    │  [field engineer submits report]
    ▼
under_review
    │
    ├──[supervisor approves]──────────────────────────────────────────┐
    │                                                                  ▼
    │                                                        supervisor_approved
    │                                                                  │
    │                                              [client approves]   │   [client rejects]
    │                                                       │          │          │
    │                                                       ▼          │          │
    │                                                   approved ◄─────┘          │
    │                                                  (terminal)                  │
    │                                                                              │
    └──[supervisor rejects]────────────────────────────────────────────────────────┤
                                                                                   │
                                              ┌──────────────────────────────────◄─┘
                                              ▼
                                      rejected (flash)
                                              │
                                              │  [immediate, automatic]
                                              ▼
                                         in_progress
                                       (new report required)
```

### Rejection behaviour — critical

`rejected` is NOT a resting state. It is a brief notification state.

**Flow after rejection:**
1. System sets status to `rejected`
2. UI shows "Rejected" badge with the rejection reason
3. System immediately transitions to `in_progress`
4. A new report cycle begins — the old report is archived
5. Contractor is notified via in-app notification

**Never** leave a milestone stuck in `rejected`.
**Never** render a milestone as permanently rejected without showing the new `in_progress` state.

### Who can trigger each transition

| Transition | Triggered by | Condition |
|---|---|---|
| `not_started` → `in_progress` | Admin / System | Project is active |
| `in_progress` → `under_review` | Field Engineer | Report submitted |
| `under_review` → `supervisor_approved` | Supervisor Engineer | Reviewed and approved |
| `under_review` → `rejected` | Supervisor Engineer | Issues found |
| `supervisor_approved` → `approved` | Client | Final approval given |
| `supervisor_approved` → `rejected` | Client | Client rejects after supervisor |
| `rejected` → `in_progress` | System (automatic) | Always, immediately after rejection |

### UI behaviour per status

| Status | Client sees | Contractor sees | Supervisor sees |
|---|---|---|---|
| `not_started` | "Not started" badge | "Not started" badge | "Not started" badge |
| `in_progress` | Progress tracker | Active work panel | Monitoring view |
| `under_review` | "Under review" badge | "Under review" badge | **Action required** — review report |
| `supervisor_approved` | **Action required** — approve or reject | "Awaiting your approval" | Approved badge |
| `approved` | "Approved" + payment released | "Approved" + payment pending | "Approved" badge |
| `rejected` | Rejection badge + reason | Rejection reason + new report required | Rejection confirmation |

---

## 2. Project status flow

### Statuses

| Status | Constant | Meaning |
|---|---|---|
| New | `new` | Just created by client — scope only, no contractor |
| Open for bids | `open_for_bids` | Admin opened bidding — invited contractors can submit proposals |
| Under review | `under_review` | Client is comparing proposals |
| Contractor selected | `contractor_selected` | Client chose a contractor — setup phase begins |
| Active | `active` | Milestones defined, work is ongoing |
| On hold | `on_hold` | Temporarily paused |
| Completed | `completed` | All milestones approved — terminal |

### Transition map

```
new
 │
 │  [admin opens bidding, invites contractors]
 ▼
open_for_bids
 │
 │  [admin moves to review / all invited contractors have submitted]
 ▼
under_review
 │
 │  [client selects a contractor]
 ▼
contractor_selected
 │
 │  [admin assigns engineers + milestones defined → admin activates]
 ▼
active ◄────────────────────────────────┐
 │                                      │
 │  [admin pauses]                      │  [admin resumes]
 ▼                                      │
on_hold ────────────────────────────────┘
 │
 │  (cannot complete from on_hold)
 ╳

active
 │
 │  [all milestones approved]
 ▼
completed (terminal)
```

### Who triggers

| Transition | Triggered by | Condition |
|---|---|---|
| `new` → `open_for_bids` | Admin | Admin invites at least one contractor |
| `open_for_bids` → `under_review` | Admin | Admin closes bidding for review |
| `under_review` → `contractor_selected` | Client | Client selects a proposal |
| `contractor_selected` → `active` | Admin | Engineers assigned + milestones defined |
| `active` → `on_hold` | Admin | — |
| `on_hold` → `active` | Admin | — |
| `active` → `completed` | System | Automatic when last milestone approved |

---

## 3. Report status flow

### Statuses

| Status | Constant | Meaning |
|---|---|---|
| Draft | `draft` | Being written, not yet submitted |
| Submitted | `submitted` | Sent to supervisor for review |
| Under review | `under_review` | Supervisor is reviewing |

### Transition map

```
draft
  │
  │  [field engineer submits]
  ▼
submitted
  │
  │  [supervisor opens report]
  ▼
under_review
  │
  │  Outcome drives MILESTONE transition — not report transition
  │  (report status does not change on approve/reject)
  │
  ╳  (terminal — the milestone carries the outcome)
```

### Notes

- A report can only be edited while in `draft`
- Once `submitted`, the report is locked — no edits
- Report outcome (approve/reject) changes the **milestone** status, not the report status
- When a milestone is rejected and returns to `in_progress`, a **new** report is created — the old report is archived

---

## 4. Payment status flow

### Statuses

| Status | Constant | Meaning |
|---|---|---|
| Pending payment | `pending_payment` | Awaiting client to pay this milestone upfront |
| Paid | `paid` | Client has paid — funds held in escrow |
| Awaiting approval | `awaiting_approval` | Milestone work complete, awaiting final approval |
| Ready for payout | `ready_for_payout` | Milestone approved — ready to release to contractor |
| Paid out | `paid_out` | Funds released to contractor — terminal |

### Transition map

```
pending_payment
      │
      │  [client pays for milestone upfront]
      ▼
    paid (escrow held)
      │
      │  [milestone reaches supervisor_approved]
      ▼
awaiting_approval
      │
      │  [milestone approved by client]
      ▼
ready_for_payout
      │
      │  [admin / system releases payment]
      ▼
   paid_out (terminal)
```

### Critical rules

1. **Payment status is derived** from milestone status — never manage it independently
2. **Client pays upfront** for each milestone — funds are held in escrow by the system
3. **Contractor cannot receive payment** until the milestone is `approved`
4. **Payment cannot be reversed** once `paid_out`
5. If a milestone is rejected and reworked, payment remains in `awaiting_approval` — no new payment required

### Milestone → Payment status mapping

| Milestone status | Payment status |
|---|---|
| `not_started` | `pending_payment` |
| `in_progress` | `paid` (client has already paid) |
| `under_review` | `paid` |
| `supervisor_approved` | `awaiting_approval` |
| `approved` | `ready_for_payout` |
| After admin releases | `paid_out` |

---

## 5. Store order status flow (WordPress — reference only)

> This system is managed by the WordPress team.
> The Nuxt system has NO integration with this flow.
> Listed here for completeness only.

```
pending → processing → shipped → delivered
        ↘
       cancelled
```

---

## 6. Notification triggers per transition

Every status transition fires a notification to the relevant parties.

### Project / bidding phase

| Transition | Notified | Message |
|---|---|---|
| Project created (`new`) | Admin | "New project created — [project name]" |
| Contractor invited (`open_for_bids`) | Invited Contractor | "You've been invited to bid on [project name]" |
| Bidding closed (`under_review`) | Client | "Proposals are ready for your review — [project name]" |
| Contractor selected (`contractor_selected`) | Selected Contractor, Admin | "Your proposal was selected for [project name]" |
| Project activated (`active`) | Contractor, Supervisor, Field Engineer | "Project [project name] is now active" |

### Milestone / execution phase

| Transition | Notified | Message |
|---|---|---|
| Report submitted (`in_progress` → `under_review`) | Supervisor Engineer | "New report ready for review — [milestone]" |
| Supervisor approves (`under_review` → `supervisor_approved`) | Client | "Milestone awaiting your approval — [milestone]" |
| Supervisor rejects (`under_review` → `rejected`) | Contractor | "Milestone rejected — [reason]. Please revise." |
| Client approves (`supervisor_approved` → `approved`) | Contractor, Admin | "Milestone approved — payment pending" |
| Client rejects (`supervisor_approved` → `rejected`) | Contractor | "Milestone rejected by client — [reason]" |
| Payment released (`ready_for_payout` → `paid_out`) | Contractor | "Payment released for [milestone]" |

---

## 7. Frontend implementation checklist

For every status transition implemented in the UI:

- [ ] Transition validated with `canTransition('milestone', from, to)` before API call
- [ ] Optimistic update applied to store before API call
- [ ] Rollback on API error
- [ ] Notification sent (backend concern — verify endpoint triggers it)
- [ ] Correct role checked via `usePermission().can()`
- [ ] UI updates immediately — no waiting for polling
- [ ] Status badge updated using `MILESTONE_STATUS_META[status]`
- [ ] Arabic label rendered using i18n key from status meta

---

*Last updated: MVP v1.0 — Frontend team*