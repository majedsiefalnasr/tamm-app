# Backend Blockers — Sequenced by Frontend Priority

**Purpose:** Track which backend endpoints block frontend work. Sequenced by what the team needs to build first.

**Current API Status:** `/api/v1` — Version 1.0.0  
**Last Updated:** 2026-05-10 — Full review against live server (https://tamm.ultimate-dev2.com/docs?api-docs.json)

**Detailed route reference:** [`api-contracts.md`](./api-contracts.md) — per-endpoint notes, request/response shapes from OpenAPI, pagination envelope, and TypeScript starter types. Use this file first when wiring composables; use **this** doc for blockers, divergences, and backend questions.

---

## ⚠️ MAJOR API CHANGES SINCE LAST REVIEW (2026-05-07 → 2026-05-10)

The live API has been updated significantly. The following previously-missing endpoint groups are **now available**:

| Group                         | Previous Status    | New Status   |
| ----------------------------- | ------------------ | ------------ |
| Milestones                    | ⏳ NOT IN SWAGGER  | ✅ Available |
| Notifications                 | ⏳ NOT IN SWAGGER  | ✅ Available |
| Payments                      | ⏳ NOT IN SWAGGER  | ✅ Available |
| Field Reports (was "Reports") | ⏳ NOT IN SWAGGER  | ✅ Available |
| Approvals                     | ❓ Not anticipated | ✅ Available |
| Tasks                         | ❓ Not anticipated | ✅ Available |
| Withdrawals                   | ❓ Not anticipated | ✅ Available |
| Supervisor Assignments        | ❓ Not anticipated | ✅ Available |
| Field Engineer Assignments    | ❓ Not anticipated | ✅ Available |

> **Frontend team action required:** See [🔴 CRITICAL FRONTEND DIVERGENCES](#-critical-frontend-divergences) below before building against any milestone or approval flow.

---

## 🎯 Frontend Work Sequence

The frontend is built in phases. Each phase lists:

1. **Frontend feature** to build
2. **Backend endpoints required**
3. **Status** (✅ Available / ⏳ Planned)
4. **Blocker severity** (🔴 blocks sprint / 🟠 blocks feature / 🟡 can use mocks)

---

## Frontend vs backend — who does what

| Side                    | Responsibility                                                                                                                                                                                                                                                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Backend**             | Persists data; authenticates and authorizes every request; enforces valid state transitions server-side; exposes REST endpoints; returns stable response envelopes (`success`, `data`, `meta`, `error`); documents paths and schemas in OpenAPI; owns business rules (who may approve what, when).                              |
| **Frontend**            | Builds role-aware UI (layouts, forms, lists); calls composables → API in the correct order for each flow; maps responses into Pinia/components; handles optimistic updates + rollback; i18n and RTL; keeps TypeScript types and `statusMachine.ts` aligned with **live** API enums; removes mocks when contracts are confirmed. |
| **Both / coordination** | Agree on multi-step flows that span resources (e.g. milestone lifecycle plus `/approvals` for client sign-off); clarify ID types (integer vs UUID), pagination field names, and payloads missing from Swagger (see questions and divergences below).                                                                            |

---

## Phase 1: Authentication & User Sessions

**Frontend Goal:** Users can log in, stay authenticated, log out, recover password.

| Backend Endpoint             | Status       | Frontend Use           | Severity    |
| ---------------------------- | ------------ | ---------------------- | ----------- |
| `POST /auth/login`           | ✅ Available | Login form submit      | 🔴 CRITICAL |
| `POST /auth/logout`          | ✅ Available | Logout button          | 🔴 CRITICAL |
| `POST /auth/refresh`         | ✅ Available | Token renewal on 401   | 🔴 CRITICAL |
| `GET /auth/me`               | ✅ Available | Load user on app start | 🔴 CRITICAL |
| `POST /auth/forgot-password` | ✅ Available | Password reset flow    | 🟠 HIGH     |
| `POST /auth/reset-password`  | ✅ Available | Complete reset flow    | 🟠 HIGH     |
| `POST /auth/otp/send`        | ✅ Available | Send OTP               | 🟠 HIGH     |
| `POST /auth/otp/verify`      | ✅ Available | Verify OTP             | 🟠 HIGH     |
| `POST /auth/otp/resend`      | ✅ Available | Resend OTP             | 🟡 LOW      |

**✅ READY TO BUILD:** Auth flow, login page, session persistence  
**❓ AWAITING:** See questions #1, #2, #3 below

---

## Phase 2: User Profile & Registration

**Frontend Goal:** Users can view and edit their profile, upload avatar.

| Backend Endpoint      | Status       | Frontend Use      | Severity    |
| --------------------- | ------------ | ----------------- | ----------- |
| `GET /me/profile`     | ✅ Available | Profile page      | 🔴 CRITICAL |
| `PUT /me/profile`     | ✅ Available | Profile edit form | 🔴 CRITICAL |
| `POST /me/avatar`     | ✅ Available | Avatar upload     | 🟠 HIGH     |
| `POST /auth/register` | ✅ Available | Self-registration | 🟡 LOW      |

**✅ READY TO BUILD:** Profile page, avatar upload  
**❓ AWAITING:** See question #3, #8 below

---

## Phase 3: Projects

**Frontend Goal:** All roles can view projects; clients create; admins manage.

| Backend Endpoint                              | Status       | Frontend Use          | Severity    |
| --------------------------------------------- | ------------ | --------------------- | ----------- |
| `GET /projects`                               | ✅ Available | Projects list page    | 🔴 CRITICAL |
| `POST /projects`                              | ✅ Available | Create project form   | 🔴 CRITICAL |
| `GET /projects/{id}`                          | ✅ Available | Project detail page   | 🔴 CRITICAL |
| `PUT /projects/{id}`                          | ✅ Available | Edit project form     | 🟠 HIGH     |
| `DELETE /projects/{id}`                       | ✅ Available | Admin delete project  | 🟡 LOW      |
| `GET /projects/{id}/documents`                | ✅ Available | Project documents tab | 🟠 HIGH     |
| `POST /projects/{id}/documents`               | ✅ Available | Document uploader     | 🟠 HIGH     |
| `DELETE /projects/{id}/documents/{docId}`     | ✅ Available | Delete document       | 🟡 LOW      |
| `GET /projects/{id}/status-history`           | ✅ Available | Status timeline       | 🟡 LOW      |
| `GET /admin/projects`                         | ✅ Available | Admin project list    | 🟠 HIGH     |
| `GET /admin/projects/pending`                 | ✅ Available | Pending approvals     | 🟠 HIGH     |
| `POST /admin/projects/{id}/approve`           | ✅ Available | Approve project       | 🟠 HIGH     |
| `POST /admin/projects/{id}/reject`            | ✅ Available | Reject project        | 🟠 HIGH     |
| `POST /admin/projects/{id}/assign-supervisor` | ✅ Available | Assign supervisor     | 🟠 HIGH     |
| `POST /admin/projects/{id}/assign-engineers`  | ✅ Available | Assign engineers      | 🟠 HIGH     |

**✅ READY TO BUILD:** All project features  
**❓ AWAITING:** See question #5, #9, #10 below

---

## Phase 4: Milestones & Approval Workflow

**Frontend Goal:** Contractors and supervisors manage milestone lifecycle.

> **⚠️ CRITICAL:** Read the [schema divergence notes](#milestone-status-names-are-different) before building!

| Backend Endpoint                | Status       | Frontend Use        | Severity    |
| ------------------------------- | ------------ | ------------------- | ----------- |
| `GET /milestones`               | ✅ Available | Milestone list      | 🔴 CRITICAL |
| `POST /milestones`              | ✅ Available | Create milestone    | 🔴 CRITICAL |
| `GET /milestones/{id}`          | ✅ Available | Milestone detail    | 🔴 CRITICAL |
| `PUT /milestones/{id}`          | ✅ Available | Update milestone    | 🔴 CRITICAL |
| `DELETE /milestones/{id}`       | ✅ Available | Delete milestone    | 🟡 LOW      |
| `POST /milestones/{id}/submit`  | ✅ Available | Contractor submits  | 🔴 CRITICAL |
| `POST /milestones/{id}/approve` | ✅ Available | Supervisor approves | 🔴 CRITICAL |
| `POST /milestones/{id}/reject`  | ✅ Available | Supervisor rejects  | 🔴 CRITICAL |
| `GET /milestones/{id}/progress` | ✅ Available | Progress stats      | 🟡 LOW      |

**✅ READY TO BUILD:** Milestone flows — but update status machine first (see below)

---

## Phase 5: Approvals System (NEW — Not Previously Anticipated)

**Frontend Goal:** A unified approval flow for milestones and potentially other resources.

> This is a **separate approval abstraction** on top of milestones. The client's final approval goes through this system.

| Backend Endpoint               | Status       | Frontend Use            | Severity    |
| ------------------------------ | ------------ | ----------------------- | ----------- |
| `GET /approvals`               | ✅ Available | Approval queue list     | 🟠 HIGH     |
| `GET /approvals/{id}`          | ✅ Available | Approval detail         | 🟠 HIGH     |
| `POST /approvals/{id}/approve` | ✅ Available | Final approval (client) | 🔴 CRITICAL |
| `POST /approvals/{id}/reject`  | ✅ Available | Final rejection         | 🔴 CRITICAL |

**Query params for `GET /approvals`:** `status` (pending|approved|rejected|cancelled), `type` (e.g. `milestone`), `page`, `limit`

**❓ AWAITING:** See question #11 — clarify when an `Approval` record is created (auto vs manual)

---

## Phase 6: Tasks (NEW — Not Previously Anticipated)

**Frontend Goal:** Contractors and supervisors manage individual tasks within milestones.

| Backend Endpoint                 | Status       | Frontend Use             | Severity |
| -------------------------------- | ------------ | ------------------------ | -------- |
| `GET /milestones/{id}/tasks`     | ✅ Available | Task list for milestone  | 🟠 HIGH  |
| `POST /milestones/{id}/tasks`    | ✅ Available | Create task              | 🟠 HIGH  |
| `POST /tasks/{id}/start`         | ✅ Available | Start task               | 🟠 HIGH  |
| `POST /tasks/{id}/mark-complete` | ✅ Available | Mark task complete       | 🟠 HIGH  |
| `POST /tasks/{id}/approve`       | ✅ Available | Supervisor approves task | 🟠 HIGH  |
| `POST /tasks/{id}/reject`        | ✅ Available | Supervisor rejects task  | 🟠 HIGH  |
| `GET /contractor/tasks`          | ✅ Available | Contractor's task list   | 🟠 HIGH  |

**❓ AWAITING:** See question #12 — full Task resource schema

---

## Phase 7: Field Reports (was "Reports")

**Frontend Goal:** Field engineers submit reports; supervisors review them.

> **Note:** The URL pattern changed from `/reports/{id}` to `/field-reports/{id}`. Update all composables.

| Backend Endpoint                           | Status       | Frontend Use         | Severity    |
| ------------------------------------------ | ------------ | -------------------- | ----------- |
| `GET /projects/{project}/field-reports`    | ✅ Available | Project reports list | 🔴 CRITICAL |
| `POST /projects/{project}/field-reports`   | ✅ Available | Submit field report  | 🔴 CRITICAL |
| `POST /field-reports/{id}/submit`          | ✅ Available | Submit for review    | 🔴 CRITICAL |
| `POST /field-reports/{id}/approve`         | ✅ Available | Supervisor approves  | 🔴 CRITICAL |
| `POST /field-reports/{id}/reject`          | ✅ Available | Supervisor rejects   | 🔴 CRITICAL |
| `POST /field-reports/{id}/request-changes` | ✅ Available | Request revisions    | 🟠 HIGH     |
| `POST /field-reports/{id}/media`           | ✅ Available | Attach photos        | 🟠 HIGH     |
| `GET /field-engineer/reports/me`           | ✅ Available | FE's own report list | 🟠 HIGH     |

**Create report body:** `{ type: string (required), report_date: date (required) }`  
**❓ AWAITING:** See question #13 — full FieldReport resource schema and `type` enum values

---

## Phase 8: Payments

**Frontend Goal:** Escrow management — clients fund milestones, contractors get paid.

> **Note:** Payment model and status enums are different from what we assumed (see divergence notes).

| Backend Endpoint       | Status       | Frontend Use          | Severity    |
| ---------------------- | ------------ | --------------------- | ----------- |
| `GET /payments`        | ✅ Available | Payment list          | 🔴 CRITICAL |
| `POST /payments`       | ✅ Available | Create payment record | 🔴 CRITICAL |
| `GET /payments/{id}`   | ✅ Available | Payment detail        | 🔴 CRITICAL |
| `PATCH /payments/{id}` | ✅ Available | Update payment status | 🔴 CRITICAL |

**Payment status enum:** `pending | awaiting_release | processing | paid | failed`  
**❓ AWAITING:** See question #14 — `UpdatePaymentStatusRequestBody` schema and release flow

---

## Phase 9: Withdrawals (NEW — Not Previously Anticipated)

**Frontend Goal:** Contractors request withdrawals; admins process them.

| Backend Endpoint                               | Status       | Frontend Use                    | Severity    |
| ---------------------------------------------- | ------------ | ------------------------------- | ----------- |
| `POST /withdrawals`                            | ✅ Available | Contractor requests withdrawal  | 🔴 CRITICAL |
| `GET /withdrawals/me`                          | ✅ Available | Contractor's withdrawal history | 🔴 CRITICAL |
| `POST /withdrawals/{id}/cancel`                | ✅ Available | Cancel withdrawal               | 🟠 HIGH     |
| `GET /admin/withdrawals`                       | ✅ Available | Admin withdrawal list           | 🟠 HIGH     |
| `GET /admin/withdrawals/pending`               | ✅ Available | Pending withdrawals queue       | 🟠 HIGH     |
| `POST /admin/withdrawals/{id}/start-review`    | ✅ Available | Start review                    | 🟠 HIGH     |
| `POST /admin/withdrawals/{id}/approve`         | ✅ Available | Approve withdrawal              | 🟠 HIGH     |
| `POST /admin/withdrawals/{id}/reject`          | ✅ Available | Reject withdrawal               | 🟠 HIGH     |
| `POST /admin/withdrawals/{id}/mark-processing` | ✅ Available | Mark as processing              | 🟠 HIGH     |
| `POST /admin/withdrawals/{id}/mark-completed`  | ✅ Available | Mark completed + proof URL      | 🟠 HIGH     |

**Create withdrawal body:** `{ milestone_id: integer, amount: float, bank_account_details: object }`  
**❓ AWAITING:** See question #15 — full withdrawal schema and `bank_account_details` structure

---

## Phase 10: Notifications

**Frontend Goal:** Users see real-time activity and action notifications.

> **Note:** Notification schema differs from what was planned (see divergence notes).

| Backend Endpoint                  | Status       | Frontend Use             | Severity |
| --------------------------------- | ------------ | ------------------------ | -------- |
| `GET /notifications`              | ✅ Available | Notification list/drawer | 🟠 HIGH  |
| `GET /notifications/unread-count` | ✅ Available | Bell badge count         | 🟠 HIGH  |
| `POST /notifications/{id}/read`   | ✅ Available | Mark single as read      | 🟠 HIGH  |
| `POST /notifications/read-all`    | ✅ Available | Mark all as read         | 🟡 LOW   |
| `DELETE /notifications/{id}`      | ✅ Available | Dismiss notification     | 🟡 LOW   |

**Query params for `GET /notifications`:** `page`, `limit` (default 20), `unread_only` (bool), `type` (string)  
**`GET /notifications/unread-count` returns:** `{ success, data: { count: integer }, meta, error }`

---

## Phase 11: Supervisor & Field Engineer Assignments (NEW)

**Frontend Goal:** Supervisors accept/reject project assignments; Field engineers accept/reject tasks.

| Backend Endpoint                                 | Status       | Frontend Use            | Severity |
| ------------------------------------------------ | ------------ | ----------------------- | -------- |
| `GET /supervisor/projects/pending-acceptance`    | ✅ Available | Supervisor pending list | 🟠 HIGH  |
| `POST /supervisor/projects/{id}/accept`          | ✅ Available | Accept assignment       | 🟠 HIGH  |
| `POST /supervisor/projects/{id}/reject`          | ✅ Available | Reject assignment       | 🟠 HIGH  |
| `POST /projects/{project}/field-engineer/assign` | ✅ Available | Assign FE to project    | 🟠 HIGH  |
| `POST /projects/{project}/field-engineer/revoke` | ✅ Available | Revoke FE assignment    | 🟠 HIGH  |
| `GET /projects/{project}/field-engineer-history` | ✅ Available | FE assignment history   | 🟡 LOW   |
| `GET /field-engineer/assignments/pending`        | ✅ Available | FE pending assignments  | 🟠 HIGH  |
| `GET /field-engineer/assignments/active`         | ✅ Available | FE active assignments   | 🟠 HIGH  |
| `POST /field-engineer/assignments/{id}/accept`   | ✅ Available | FE accepts assignment   | 🟠 HIGH  |
| `POST /field-engineer/assignments/{id}/reject`   | ✅ Available | FE rejects assignment   | 🟠 HIGH  |

---

## Phase 12: Admin — Users & Roles

**Frontend Goal:** Admin manages users and RBAC configuration.

| Backend Endpoint                                | Status       | Frontend Use           | Severity    |
| ----------------------------------------------- | ------------ | ---------------------- | ----------- |
| `GET /users`                                    | ✅ Available | Admin user list        | 🔴 CRITICAL |
| `POST /users`                                   | ✅ Available | Create user form       | 🔴 CRITICAL |
| `GET /users/{id}`                               | ✅ Available | User detail page       | 🟠 HIGH     |
| `PUT /users/{id}`                               | ✅ Available | Edit user form         | 🟠 HIGH     |
| `DELETE /users/{id}`                            | ✅ Available | Delete user            | 🟡 LOW      |
| `GET /admin/permissions`                        | ✅ Available | Permission list        | 🟡 LOW      |
| `GET /admin/roles`                              | ✅ Available | Role list              | 🟡 LOW      |
| `POST /admin/roles`                             | ✅ Available | Create role            | 🟡 LOW      |
| `GET /admin/roles/{id}`                         | ✅ Available | Role detail            | 🟡 LOW      |
| `PATCH /admin/roles/{id}`                       | ✅ Available | Edit role              | 🟡 LOW      |
| `DELETE /admin/roles/{id}`                      | ✅ Available | Delete role            | 🟡 LOW      |
| `POST /admin/roles/{id}/permissions`            | ✅ Available | Add permission to role | 🟡 LOW      |
| `DELETE /admin/roles/{id}/permissions/{permId}` | ✅ Available | Remove permission      | 🟡 LOW      |
| `POST /admin/users/{userId}/roles`              | ✅ Available | Assign role to user    | 🟡 LOW      |
| `DELETE /admin/users/{userId}/roles/{roleId}`   | ✅ Available | Remove role from user  | 🟡 LOW      |

---

## 🔴 CRITICAL FRONTEND DIVERGENCES

These are places where the **live API differs from what the frontend was built against**. Fix these before shipping.

---

### Milestone Status Names Are Different

**Impact:** 🔴 CRITICAL — `statusMachine.ts`, all milestone components, Pinia stores, TypeScript types

The **live API uses different status names** than what was in our design spec:

| What We Assumed (`statusMachine.ts`) | What the API Actually Uses                 |
| ------------------------------------ | ------------------------------------------ |
| `not_started`                        | `draft`                                    |
| `in_progress`                        | _(no direct equivalent — see submit flow)_ |
| `under_review`                       | `under_review` ✅ same                     |
| `supervisor_approved`                | _(handled by Approvals system)_            |
| `approved`                           | `approved` ✅ same                         |
| `rejected`                           | `rejected` ✅ same                         |

**Actual milestone status flow (from API):**

```
draft → submitted (via POST /milestones/{id}/submit)
submitted → under_review (supervisor picks up)
under_review → approved (via POST /milestones/{id}/approve)
under_review → rejected (via POST /milestones/{id}/reject)
```

**Action required:**

- [ ] Update `utils/statusMachine.ts` with confirmed status names
- [ ] Update all TypeScript types in `shared/types/milestone.ts`
- [ ] Update Pinia milestone store status setters
- [ ] Update all milestone UI components (`MilestoneCard`, `MilestoneActions`, `ApprovalFlow`)

---

### Final Approval Uses the Approvals System, Not Milestones

**Impact:** 🔴 CRITICAL — Client approval flow

We assumed `POST /milestones/{id}/final-approve`. This endpoint does **not exist**.

The client final approval goes through a separate **Approvals resource**:

```
POST /approvals/{approval}/approve   ← client approves
POST /approvals/{approval}/reject    ← client rejects
```

`Approval` records are linked to milestones via `approvable` field (`type: "milestone"`, `url: "/api/v1/milestones/1"`).

**Action required:**

- [ ] Implement `useApprovals` composable
- [ ] Update approval flow to fetch approval record from `GET /approvals?type=milestone`
- [ ] Client-role milestone actions must call `/approvals/{id}/approve` not milestone endpoints

---

### Field Reports URL Pattern Changed

**Impact:** 🟠 HIGH — Reports composable and page routing

We planned: `POST /reports` and `GET /reports/{id}`  
Actual API: `POST /projects/{project}/field-reports` and `POST /field-reports/{id}/submit`

**Action required:**

- [ ] Rename `useReports.ts` composable to `useFieldReports.ts` (or add field reports sub-composable)
- [ ] Update all API call URLs in reports composable
- [ ] Update `pages/reports/[id].vue` routing if needed

---

### Notification Schema Field Names Changed

**Impact:** 🟡 LOW — Notification components (use mocks for now)

We planned: `{ body: string, link: string, is_read: boolean }`  
Actual API: `{ message: string, data: object, read_at: datetime|null }`

Confirmed notification schema from API:

```ts
{
  id: string(uuid)
  type: string // e.g. "milestone_approved"
  title: string
  message: string // was "body" in our plan
  data: object // was "link" — navigate target is in data, not top-level
  read_at: string | null // null = unread; was "is_read: boolean"
  created_at: string
}
```

**Action required:**

- [ ] Update `NotificationResource` TypeScript type
- [ ] Update `NotificationItem` component props
- [ ] Check `data.link` or equivalent field name with backend (see Q#16)

---

### User ID Is Integer, Not UUID String

**Impact:** 🟡 LOW — TypeScript types

`UserResource.id` is `integer` in the live API schema, not `string`. Our TypeScript types declare `id: string`.

**Action required:**

- [ ] Confirm with backend whether IDs are integers across all resources (see Q#17)
- [ ] Update `shared/types/user.ts` and `shared/types/api.ts` accordingly

---

### Response Envelope Confirmed — `{ success, data, meta, error }`

**This answers Question #4 from the previous review.** The confirmed envelope for ALL responses:

```ts
// Success
{
  success: true,
  data: T,
  meta: { pagination?: {...} } | {},
  error: null
}

// Error
{
  success: false,
  data: null,
  meta: {} | null,
  error: { code: string, message: string }
}
```

**Pagination meta shape (from API schemas):**

```ts
meta: {
  pagination: {
    current_page: number
    limit: number
    total: number
    last_page: number // NOT "pages" — was our assumption
  }
}
```

> Note: `last_page` (not `pages`) and `limit` (not `per_page`) — update all pagination consumers.

---

### OTP Verify Returns Message, Not Auth Token

**Impact:** 🟠 HIGH — Auth flow

We assumed `POST /auth/otp/verify` returns a JWT token. The live API shows it returns `ApiSuccessMessageResponse` (just a success message). This means OTP verification is for **account verification only**, not 2FA login.

This answers Question #2 (partially). See Q#2 below for remaining clarification.

---

## 📋 Critical Questions — Get Backend to Answer These Now

### Question #1: JWT Token Lifecycle _(still open)_

**Impact:** Auth flow reliability  
Schema shows `expires_in: 3600` but does not clarify:

```
Does the frontend refresh proactively (before expiry), or only on 401?
Is the refresh token separate from the access token?
```

---

### Question #2: OTP Role — Account Verification Only? _(partially answered)_

**Impact:** Auth flow design  
OTP verify now returns a message (not a token), confirming it is NOT login 2FA.

```
Is OTP purely for account email/phone verification after registration?
Is it optional or mandatory?
After OTP verify, is the user automatically active (status → "active")?
```

---

### Question #3: Registration Policy & Role Examples _(still open)_

**Impact:** User onboarding

The registration example uses `"role": "owner"` which is **not one of the 6 defined roles** (`super_admin`, `admin`, `client`, `contractor`, `field_engineer`, `supervisor_engineer`).

```
Is "owner" an alias for "client"?
Which roles can self-register vs must be admin-created?
```

---

### Question #4: Error Response Format _(ANSWERED ✅)_

Confirmed from schema: `{ success, data, meta, error }`. See "Confirmed" section above.

---

### Question #5: Complete Project Schema _(still open)_

The Swagger spec shows project endpoints but NO detailed request/response schemas for `GET /projects`, `POST /projects`, or `GET /projects/{id}`. These have placeholder `200: OK` responses only.

```
What fields does a Project resource return?
What are the project status values?
What are the project_type values (villa, commercial, etc.)?
Does the Project include nested milestones in the list response?
```

---

### Question #6: Permission System _(still open)_

`GET /admin/permissions` is live. We need the actual permission name list to map to UI actions.

```
Can you share the full list of permission names from GET /admin/permissions?
Which permissions are checked for: approve_milestone, reject_milestone,
submit_report, approve_report, release_payment, create_project?
```

---

### Question #7: User Roles Model _(still open)_

```
Can a single user have multiple roles?
The UserResource schema shows role as a string (not array) — is multi-role possible?
```

---

### Question #8: Complete User Schema _(partially answered)_

`UserResource` schema confirmed from API:

```ts
{
  id: integer
  name: string
  email: string | null
  phone: string | null
  role: string // single role, not array
  status: 'active' | 'suspended' | 'pending_verification' | 'banned'
  created_at: datetime
}
```

Missing from schema:

```
Is avatar_url returned anywhere?
Are created_at/updated_at both present on GET /me/profile?
```

---

### Question #9: Pagination _(ANSWERED ✅)_

Confirmed: `meta.pagination` with `current_page`, `limit`, `total`, `last_page`.  
Use `?page=N&limit=N` for pagination. Confirmed from milestone, payment, approval, notification schemas.

---

### Question #10: Filtering _(partially answered)_

Confirmed filters for milestones: `project_id`, `status`, `assigned_to`, `limit`  
Confirmed filters for payments: `status`, `milestone_id`, `page`, `limit`  
Confirmed filters for approvals: `status`, `type`, `page`, `limit`  
Confirmed filters for notifications: `unread_only`, `type`, `page`, `limit`

Still missing:

```
Filters for GET /projects and GET /users (no schemas in Swagger)
Sorting parameters — does ?sort=-created_at work anywhere?
```

---

### Question #11: Approvals — When Is an Approval Record Created? _(NEW)_

**Impact:** Client approval flow design

```
When a milestone reaches "under_review" status, does the backend
automatically create an Approval record, or must the frontend call
something to initiate the approval?

What does GET /approvals?type=milestone&status=pending return —
one approval per milestone or can there be multiple?

Who is the "assigned_to" on an Approval (the client? the supervisor?)?
```

---

### Question #12: Task Resource Schema _(NEW)_

**Impact:** Task management feature

```
What does a Task resource look like? (fields, status enum, timestamps)
What status values does a task have?
Who creates tasks — the contractor? the supervisor? the admin?
```

---

### Question #13: Field Report Schema and Type Enum _(NEW)_

**Impact:** Reports feature

```
What fields does a FieldReport resource return (beyond type and report_date)?
What are the valid values for the "type" field? (daily? weekly? incident?)
Is there a GET /field-reports/{id} endpoint for single report detail?
```

---

### Question #14: Payment Status Update Body _(NEW)_

**Impact:** Payment release flow

`PATCH /payments/{payment}` uses `UpdatePaymentStatusRequestBody` schema but it is not defined in the Swagger spec.

```
What is the body structure for PATCH /payments/{payment}?
What status values can the frontend set via this endpoint?
Is "release from escrow" done via this endpoint? If so, what status value?
```

---

### Question #15: Withdrawal Schema — `bank_account_details` _(NEW)_

**Impact:** Contractor withdrawal flow

```
What is the structure of `bank_account_details` in POST /withdrawals?
(bank name, IBAN, account holder name, etc.)
What fields does a Withdrawal resource return?
```

---

### Question #16: Notification `data` Field Navigation Target _(NEW)_

**Impact:** Notification click-through

The `NotificationResource.data` is an open `object`. We need to know what fields are inside for navigation.

```
What keys are in the "data" object for each notification type?
Is there a "link" or "url" key that tells the frontend where to navigate?
```

---

### Question #17: Are All Resource IDs Integers? _(NEW)_

**Impact:** TypeScript types across the app

`UserResource.id` and `MilestoneResource.id` are defined as `integer` in the Swagger schema. But notification IDs are `uuid` strings.

```
Which resources use integer IDs vs UUID strings?
Projects: integer or UUID?
Payments: integer or UUID?
Tasks: integer or UUID?
```

---

## ⏳ STILL MISSING — Admin Dashboard Endpoint

| Endpoint               | Status            | Impact                   |
| ---------------------- | ----------------- | ------------------------ |
| `GET /admin/dashboard` | ⏳ NOT IN SWAGGER | 🟠 HIGH — uses mock data |

**Frontend:** Using mock data for admin dashboard. Replace when this endpoint is live.

---

## 🎬 Action Plan

### Immediate (This Week)

- [ ] **Share Q#11–17** with backend team lead
- [ ] **Fix milestone status machine** — update `utils/statusMachine.ts` with confirmed status names
- [ ] **Update milestone TypeScript types** — `draft | submitted | under_review | approved | rejected`
- [ ] **Update pagination consumers** — `last_page` not `pages`, `limit` not `per_page`
- [ ] **Build milestone composables** against live endpoint (endpoints now available)
- [ ] **Build notification composable** against live endpoint

### Parallel Work (Can Start Now)

- [ ] Build `useFieldReports.ts` composable (endpoints ready ✅)
- [ ] Build `usePayments.ts` composable (endpoints ready, schema Q#14 pending)
- [ ] Build `useApprovals.ts` composable (endpoints ready, flow Q#11 pending)
- [ ] Build `useTasks.ts` composable (endpoints ready, schema Q#12 pending)
- [ ] Build `useWithdrawals.ts` composable (endpoints ready, schema Q#15 pending)
- [ ] Build supervisor assignment pages (endpoints ready ✅)
- [ ] Build field engineer assignment pages (endpoints ready ✅)

### Once Questions Are Answered

- [ ] Swap all mocks → real API calls
- [ ] Update `docs/api-contracts.md` with confirmed schemas for Project, Task, FieldReport, Withdrawal
- [ ] Verify approval flow end-to-end
- [ ] Test all status transitions with live data

---

**Document owner:** Frontend team  
**Last updated:** 2026-05-10  
**Next review:** When backend answers Q#11–17 or delivers Project/Task/FieldReport schemas  
**API Verification:** Full Swagger review 2026-05-10 — Milestones, Notifications, Payments, FieldReports, Approvals, Tasks, Withdrawals, Supervisor/FE Assignments all confirmed available. Admin dashboard still pending.
