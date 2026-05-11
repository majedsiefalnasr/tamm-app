# Backend Blockers — Sequenced by Frontend Priority

**Purpose:** Track which backend endpoints block frontend work. Sequenced by what the team needs to build first.

**Current API Status:** `/api/v1` — Version 1.0.0  
**Last Updated:** 2026-05-11 — Reviewed **exported** OpenAPI [`/public/docs?api-docs.json`](https://tamm.ultimate-dev2.com/public/docs?api-docs.json) (**80 routes**). Human-readable mirror: [`/docs?api-docs.json`](https://tamm.ultimate-dev2.com/docs?api-docs.json).

**Detailed route reference:** [`api-contracts.md`](./api-contracts.md) — per-endpoint notes, request/response shapes from OpenAPI, pagination envelope, and TypeScript starter types. **Frozen route list:** [`openapi-inventory-2026-05-11.md`](./openapi-inventory-2026-05-11.md). Use `api-contracts.md` first when wiring composables; use **this** doc for blockers, divergences, and backend questions.

### Send to backend — remaining asks (2026-05-11)

After your Q1–Q17 reply, we still need:

1. **OpenAPI export parity (Q18)** — placeholder `200 OK` responses, missing `components.schemas`, and whether `GET /admin/projects` / `POST …/assign-engineers` are intentionally omitted; CI + version bumps on breaking changes.
2. **Client final approval (Q11 follow-up)** — how the client-facing step ties to the supervisor-assigned approval when that flow is defined (**TBD** per your note).
3. **Post–Swagger drop** — confirm published schemas for **Project**, **FieldReport**, **Task**, **PATCH /payments** body, and **permission list** match the verbal answers below.
4. **User profile (Q8 remainder)** — is `avatar_url` exposed anywhere? is `updated_at` on profile/`GET /me`?
5. **`GET /projects` and `GET /users` filters/sort (Q10 remainder)** — supported query params once those list endpoints are fully documented.

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

## OpenAPI export review (2026-05-11)

**Machine-readable source of truth:** [`https://tamm.ultimate-dev2.com/public/docs?api-docs.json`](https://tamm.ultimate-dev2.com/public/docs?api-docs.json)

**Deliverable for backend:** [`docs/openapi-inventory-2026-05-11.md`](./openapi-inventory-2026-05-11.md) — full method + path table (80 entries) and explicit “not in export” gaps.

### Drift vs `api-contracts.md` / older assumptions

| Item                                                            | In export?                                                                       | Backend / docs action                                                                                                                                                                                                                                             |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`GET /admin/projects`**                                       | **No**                                                                           | Confirm whether admins must use **`GET /projects`** with role-scoped filtering, **or** add `GET /admin/projects` to OpenAPI + implement. Frontend admin project table cannot rely on an undocumented path.                                                        |
| **`POST /admin/projects/{id}/assign-engineers`**                | **No**                                                                           | **`POST /api/v1/projects/{project}/field-engineer/assign`** and **`POST …/field-engineer/revoke`** (+ **`GET …/field-engineer-history`**) **are** in the export — treat these as canonical for engineer placement; remove or alias the old path in internal docs. |
| **Path segment names**                                          | `{milestone}`, `{payment}`, `{withdrawal}`, `{task}`, `{report}`, `{assignment}` | Align Swagger `components` + examples with these names; frontend `$fetch` URLs must match export segments.                                                                                                                                                        |
| **`GET /admin/dashboard`**                                      | **No**                                                                           | Still expected for admin home (mock today) — add to export when ready.                                                                                                                                                                                            |
| **Messaging, workflow admin, finance admin, system flags/logs** | **No**                                                                           | Product-only shells on frontend today — add OpenAPI + schemas when scope is fixed.                                                                                                                                                                                |
| **Response bodies**                                             | Most routes still `200: OK` only                                                 | Publish **`components.schemas`** for Project, Milestone, Payment, Withdrawal, FieldReport, Task, Approval, Notification list items, and all POST bodies (verbal shapes for several are logged under **Backend answers**; confirm in export).                      |

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
**✅ Q1–Q2:** JWT + OTP rules logged under **Backend answers**; refresh at 55m + 401 in `app/stores/auth.ts`. **Q3:** registration role `owner` → client mapping in `normalizeRole`.

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
**✅ Q3:** `owner` at registration. **Q8 remainder:** `avatar_url` / `updated_at` — see **Send to backend** at top.

---

## Phase 3: Projects

**Frontend Goal:** All roles can view projects; clients create; admins manage.

| Backend Endpoint                                 | Status                                      | Frontend Use                                                                                            | Severity    |
| ------------------------------------------------ | ------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------- |
| `GET /projects`                                  | ✅ Available                                | Projects list page                                                                                      | 🔴 CRITICAL |
| `POST /projects`                                 | ✅ Available                                | Create project form                                                                                     | 🔴 CRITICAL |
| `GET /projects/{id}`                             | ✅ Available                                | Project detail page                                                                                     | 🔴 CRITICAL |
| `PUT /projects/{id}`                             | ✅ Available                                | Edit project form                                                                                       | 🟠 HIGH     |
| `DELETE /projects/{id}`                          | ✅ Available                                | Admin delete project                                                                                    | 🟡 LOW      |
| `GET /projects/{id}/documents`                   | ✅ Available                                | Project documents tab                                                                                   | 🟠 HIGH     |
| `POST /projects/{id}/documents`                  | ✅ Available                                | Document uploader                                                                                       | 🟠 HIGH     |
| `DELETE /projects/{id}/documents/{docId}`        | ✅ Available                                | Delete document                                                                                         | 🟡 LOW      |
| `GET /projects/{id}/status-history`              | ✅ Available                                | Status timeline                                                                                         | 🟡 LOW      |
| `GET /admin/projects`                            | ❓ **Not in exported OpenAPI** (2026-05-11) | Admin org-wide list — confirm **`GET /projects`** replacement or add route + export                     | 🟠 HIGH     |
| `GET /admin/projects/pending`                    | ✅ Available                                | Pending approvals                                                                                       | 🟠 HIGH     |
| `POST /admin/projects/{id}/approve`              | ✅ Available                                | Approve project                                                                                         | 🟠 HIGH     |
| `POST /admin/projects/{id}/reject`               | ✅ Available                                | Reject project                                                                                          | 🟠 HIGH     |
| `POST /admin/projects/{id}/assign-supervisor`    | ✅ Available                                | Assign supervisor                                                                                       | 🟠 HIGH     |
| `POST /admin/projects/{id}/assign-engineers`     | ❌ **Not in export** — superseded           | **Use** `POST /projects/{project}/field-engineer/assign` (+ `…/revoke`, `GET …/field-engineer-history`) | 🟠 HIGH     |
| `POST /projects/{project}/field-engineer/assign` | ✅ Available                                | Assign field engineer to project                                                                        | 🟠 HIGH     |
| `POST /projects/{project}/field-engineer/revoke` | ✅ Available                                | Revoke field engineer                                                                                   | 🟠 HIGH     |
| `GET /projects/{project}/field-engineer-history` | ✅ Available                                | FE assignment history                                                                                   | 🟡 LOW      |

**✅ READY TO BUILD:** Core project CRUD, pending admin approvals, supervisor assignment on project, **field-engineer assign/revoke/history**  
**Q5/Q6:** Full Project schema + permission list — **next Swagger export**. **Q9:** pagination confirmed. **Q10:** `GET /projects` / `GET /users` filters + sort — **Send to backend**. **Q18:** OpenAPI parity — section below.

---

## Phase 4: Milestones & Approval Workflow

**Frontend Goal:** Contractors and supervisors manage milestone lifecycle.

> **⚠️ CRITICAL:** Read the [schema divergence notes](#milestone-status-names-are-different) before building!

| Backend Endpoint                       | Status       | Frontend Use                                 | Severity    |
| -------------------------------------- | ------------ | -------------------------------------------- | ----------- |
| `GET /milestones`                      | ✅ Available | Milestone list                               | 🔴 CRITICAL |
| `POST /milestones`                     | ✅ Available | Create milestone                             | 🔴 CRITICAL |
| `GET /milestones/{milestone}`          | ✅ Available | Milestone detail (export uses `{milestone}`) | 🔴 CRITICAL |
| `PUT /milestones/{milestone}`          | ✅ Available | Update milestone                             | 🔴 CRITICAL |
| `DELETE /milestones/{milestone}`       | ✅ Available | Delete milestone                             | 🟡 LOW      |
| `POST /milestones/{milestone}/submit`  | ✅ Available | Contractor submits                           | 🔴 CRITICAL |
| `POST /milestones/{milestone}/approve` | ✅ Available | Supervisor approves                          | 🔴 CRITICAL |
| `POST /milestones/{milestone}/reject`  | ✅ Available | Supervisor rejects                           | 🔴 CRITICAL |
| `GET /milestones/{milestone}/progress` | ✅ Available | Progress stats                               | 🟡 LOW      |

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

**✅ Backend (2026-05-11):** When milestone status becomes **`submitted`**, backend auto-creates **one** `Approval` per milestone; **`assigned_to` = supervisor**. Client final approval is a **separate flow (TBD)** — not the same record semantics until specified.

---

## Phase 6: Tasks (NEW — Not Previously Anticipated)

**Frontend Goal:** Contractors and supervisors manage individual tasks within milestones.

| Backend Endpoint                     | Status       | Frontend Use                      | Severity |
| ------------------------------------ | ------------ | --------------------------------- | -------- |
| `GET /milestones/{milestone}/tasks`  | ✅ Available | Task list for milestone           | 🟠 HIGH  |
| `POST /milestones/{milestone}/tasks` | ✅ Available | Create task                       | 🟠 HIGH  |
| `POST /tasks/{task}/start`           | ✅ Available | Start task (export uses `{task}`) | 🟠 HIGH  |
| `POST /tasks/{task}/mark-complete`   | ✅ Available | Mark task complete                | 🟠 HIGH  |
| `POST /tasks/{task}/approve`         | ✅ Available | Supervisor approves task          | 🟠 HIGH  |
| `POST /tasks/{task}/reject`          | ✅ Available | Supervisor rejects task           | 🟠 HIGH  |
| `GET /contractor/tasks`              | ✅ Available | Contractor's task list            | 🟠 HIGH  |

**✅ Backend (2026-05-11):** Tasks are created by the **supervisor** when defining milestones; **contractor** is the default assignee. Status flow: `pending` → `in_progress` → `completed` → `approved` | `rejected`. (Full `Task` resource still to be copied from Swagger when published.)

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
**✅ Backend (2026-05-11):** Valid **`type`** values: `daily` | `weekly` | `incident` | `milestone_completion`. Full FieldReport schema in upcoming Swagger update.

---

## Phase 8: Payments

**Frontend Goal:** Escrow management — clients fund milestones, contractors get paid.

> **Note:** Payment model and status enums are different from what we assumed (see divergence notes).

| Backend Endpoint            | Status       | Frontend Use                             | Severity    |
| --------------------------- | ------------ | ---------------------------------------- | ----------- |
| `GET /payments`             | ✅ Available | Payment list                             | 🔴 CRITICAL |
| `POST /payments`            | ✅ Available | Create payment record                    | 🔴 CRITICAL |
| `GET /payments/{payment}`   | ✅ Available | Payment detail (export uses `{payment}`) | 🔴 CRITICAL |
| `PATCH /payments/{payment}` | ✅ Available | Update payment status                    | 🔴 CRITICAL |

**Payment status enum:** `pending | awaiting_release | processing | paid | failed`  
**✅ Backend (2026-05-11):** `PATCH /payments/{payment}` body: `{ status, notes?, proof_url? }`. Setting **`status: "paid"`** triggers escrow release.

---

## Phase 9: Withdrawals (NEW — Not Previously Anticipated)

**Frontend Goal:** Contractors request withdrawals; admins process them.

| Backend Endpoint                                       | Status       | Frontend Use                                  | Severity    |
| ------------------------------------------------------ | ------------ | --------------------------------------------- | ----------- |
| `POST /withdrawals`                                    | ✅ Available | Contractor requests withdrawal                | 🔴 CRITICAL |
| `GET /withdrawals/me`                                  | ✅ Available | Contractor's withdrawal history               | 🔴 CRITICAL |
| `POST /withdrawals/{withdrawal}/cancel`                | ✅ Available | Cancel withdrawal (path param name in export) | 🟠 HIGH     |
| `GET /admin/withdrawals`                               | ✅ Available | Admin withdrawal list                         | 🟠 HIGH     |
| `GET /admin/withdrawals/pending`                       | ✅ Available | Pending withdrawals queue                     | 🟠 HIGH     |
| `POST /admin/withdrawals/{withdrawal}/start-review`    | ✅ Available | Start review (export uses `{withdrawal}`)     | 🟠 HIGH     |
| `POST /admin/withdrawals/{withdrawal}/approve`         | ✅ Available | Approve withdrawal                            | 🟠 HIGH     |
| `POST /admin/withdrawals/{withdrawal}/reject`          | ✅ Available | Reject withdrawal                             | 🟠 HIGH     |
| `POST /admin/withdrawals/{withdrawal}/mark-processing` | ✅ Available | Mark as processing                            | 🟠 HIGH     |
| `POST /admin/withdrawals/{withdrawal}/mark-completed`  | ✅ Available | Mark completed + proof URL                    | 🟠 HIGH     |

**Create withdrawal body:** `{ milestone_id: integer, amount: float, bank_account_details: object }`  
**✅ Backend (2026-05-11):** `bank_account_details` shape: `{ bank_name, account_holder, iban, swift_code }`.

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

| Backend Endpoint                                       | Status       | Frontend Use                                       | Severity |
| ------------------------------------------------------ | ------------ | -------------------------------------------------- | -------- |
| `GET /supervisor/projects/pending-acceptance`          | ✅ Available | Supervisor pending list                            | 🟠 HIGH  |
| `POST /supervisor/projects/{id}/accept`                | ✅ Available | Accept assignment                                  | 🟠 HIGH  |
| `POST /supervisor/projects/{id}/reject`                | ✅ Available | Reject assignment                                  | 🟠 HIGH  |
| `POST /projects/{project}/field-engineer/assign`       | ✅ Available | Assign FE to project                               | 🟠 HIGH  |
| `POST /projects/{project}/field-engineer/revoke`       | ✅ Available | Revoke FE assignment                               | 🟠 HIGH  |
| `GET /projects/{project}/field-engineer-history`       | ✅ Available | FE assignment history                              | 🟡 LOW   |
| `GET /field-engineer/assignments/pending`              | ✅ Available | FE pending assignments                             | 🟠 HIGH  |
| `GET /field-engineer/assignments/active`               | ✅ Available | FE active assignments                              | 🟠 HIGH  |
| `POST /field-engineer/assignments/{assignment}/accept` | ✅ Available | FE accepts assignment (export uses `{assignment}`) | 🟠 HIGH  |
| `POST /field-engineer/assignments/{assignment}/reject` | ✅ Available | FE rejects assignment                              | 🟠 HIGH  |

> **Note:** Admin placement of engineers on a project is also listed under **Phase 3** (`field-engineer/assign`, `revoke`, `history`).

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
draft → submitted (via POST /milestones/{milestone}/submit)
submitted → under_review (supervisor picks up)
under_review → approved (via POST /milestones/{milestone}/approve)
under_review → rejected (via POST /milestones/{milestone}/reject)
```

**Action required:**

- [ ] Update `utils/statusMachine.ts` with confirmed status names
- [ ] Update all TypeScript types in `shared/types/milestone.ts`
- [ ] Update Pinia milestone store status setters
- [ ] Update all milestone UI components (`MilestoneCard`, `MilestoneActions`, `ApprovalFlow`)

---

### Final Approval Uses the Approvals System, Not Milestones

**Impact:** 🔴 CRITICAL — Client approval flow

We assumed `POST /milestones/{milestone}/final-approve`. This endpoint does **not exist**.

Supervisor-side queue: backend **auto-creates** an `Approval` when the milestone hits **`submitted`** (`assigned_to` = supervisor). **Client** final approval still goes through **Approvals** endpoints, but the **exact client UX / record linkage** is **TBD** per backend (separate from supervisor assignment).

```
POST /approvals/{approval}/approve   ← client approves (when flow is defined)
POST /approvals/{approval}/reject    ← client rejects
```

`Approval` records are linked to milestones via `approvable` field (`type: "milestone"`, `url: "/api/v1/milestones/1"`).

**Action required:**

- [ ] Implement `useApprovals` composable
- [ ] Update approval flow to fetch approval record from `GET /approvals?type=milestone`
- [ ] Client-role milestone actions must call `/approvals/{id}/approve` not milestone endpoints (pending **client** branch of flow)

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
- [x] **`data` keys (backend 2026-05-11):** `resource_type`, `resource_id`, `action_url`, `actor_name` — navigate via `action_url` or compose from `resource_type` + `resource_id`

---

### User ID Is Integer, Not UUID String

**Impact:** 🟡 LOW — TypeScript types

`UserResource.id` is `integer` in the live API schema, not `string`. Our TypeScript types declare `id: string`.

**Action required:**

- [x] **Backend (2026-05-11):** All resource IDs are **integers** except **notifications** (**UUID**).
- [ ] Sweep remaining frontend types (e.g. any `string` IDs on non-notification entities) for consistency.

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

### OTP verify — answered (2026-05-11)

**Impact:** Auth / registration

`POST /auth/otp/verify` returns a message (not JWT): OTP is **account verification only** (not 2FA), **required** for registration, and after verify the account status becomes **`active`** — consistent with `ApiSuccessMessageResponse`.

---

## Backend answers logged (2026-05-11) — Q1–Q17

| Q   | Topic               | Confirmed answer                                                                                                                                           |
| --- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q1  | JWT                 | Access **1h**, refresh **2 weeks**; refresh at **55 min** or on **401**. Frontend: proactive timer + 14d refresh cookie in `app/stores/auth.ts`.           |
| Q2  | OTP                 | Verification only; **not** 2FA; **required** for registration; status → **`active`** after verify.                                                         |
| Q3  | Registration role   | **`owner`** = our **client**; backend adds alias support. `normalizeRole` maps `owner` → `client` in `app/utils/roleRoutes.ts`.                            |
| Q4  | Response envelope   | Already documented above (`success`, `data`, `meta`, `error`).                                                                                             |
| Q5  | Project schema      | Swagger update in flight; full `Project` schemas expected in that export.                                                                                  |
| Q6  | Permissions         | Full permission list published with the same Swagger update.                                                                                               |
| Q7  | Multi-role          | DB supports multiple roles; **API exposes a single `role` string** — **UI assumes one role**.                                                              |
| Q8  | User schema gaps    | Partially documented below; **avatar / `updated_at`** still listed under “Send to backend” at top.                                                         |
| Q9  | Pagination          | Confirmed (`last_page`, `limit`, …) — see envelope section above.                                                                                          |
| Q10 | Filtering           | Confirmed on milestones, payments, approvals, notifications; **`GET /projects` / `GET /users`** + global **sort** still open (see top).                    |
| Q11 | Approvals           | Auto-created when milestone → **`submitted`**; **one** per milestone; **`assigned_to`** = **supervisor**. Client final approval = **separate flow (TBD)**. |
| Q12 | Tasks               | **Supervisor** creates tasks with milestones; **contractor** default assignee. Status: `pending` → `in_progress` → `completed` → `approved` \| `rejected`. |
| Q13 | Field report `type` | `daily` \| `weekly` \| `incident` \| `milestone_completion`; full `FieldReport` schema with Swagger update.                                                |
| Q14 | PATCH `/payments`   | Body `{ status, notes?, proof_url? }`; **`status: "paid"`** triggers escrow release.                                                                       |
| Q15 | Withdrawal bank     | `bank_account_details`: `{ bank_name, account_holder, iban, swift_code }`.                                                                                 |
| Q16 | Notification `data` | `{ resource_type, resource_id, action_url, actor_name }` — navigate via **`action_url`** or derive from **`resource_type` + `resource_id`**.               |
| Q17 | ID types            | **Integer IDs** for resources; **notifications** use **UUID** `id`.                                                                                        |

---

## OpenAPI export parity — Q18 (still open)

**Impact:** Contract drift, broken client assumptions, false “missing API” reports

The export at [`/public/docs?api-docs.json`](https://tamm.ultimate-dev2.com/public/docs?api-docs.json) lists **80** operations but still uses many placeholder **`200: OK`** responses without `components.schemas` where we need them.

```
1) Is GET /admin/projects intentionally omitted — should admins use GET /projects only?
2) Is POST /admin/projects/{id}/assign-engineers permanently removed in favour of
   POST /projects/{project}/field-engineer/assign + revoke?
3) Will you publish a CI check so every production route appears in this export?
4) Can you version the export (e.g. info.version bump) when breaking changes ship?
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

- [ ] **Share “Send to backend” + Q18** with backend team lead (attach [`openapi-inventory-2026-05-11.md`](./openapi-inventory-2026-05-11.md))
- [ ] **Re-pull OpenAPI** after their Swagger drop — sync `docs/api-contracts.md` for Project, permissions, FieldReport, Task, Payment PATCH body
- [ ] **Fix milestone status machine** — update `utils/statusMachine.ts` with confirmed status names
- [ ] **Update milestone TypeScript types** — `draft | submitted | under_review | approved | rejected`
- [ ] **Update pagination consumers** — `last_page` not `pages`, `limit` not `per_page`
- [ ] **Build milestone composables** against live endpoint (endpoints now available)
- [ ] **Build notification composable** — use `data.action_url` / `resource_*` per Q16

### Parallel Work (Can Start Now)

- [ ] Build `useFieldReports.ts` composable (endpoints ready ✅; enum Q13 confirmed, full schema pending Swagger)
- [ ] Build `usePayments.ts` composable (Q14 body + `paid` release rule confirmed; align types to OpenAPI when updated)
- [ ] Build `useApprovals.ts` composable (Q11 lifecycle confirmed; **client final path still TBD**)
- [ ] Build `useTasks.ts` composable (Q12 rules confirmed; full `Task` schema pending Swagger)
- [ ] Build `useWithdrawals.ts` composable (Q15 bank object confirmed)
- [ ] Build supervisor assignment pages (endpoints ready ✅)
- [ ] Build field engineer assignment pages (endpoints ready ✅)

### After Q18 + Swagger alignment

- [ ] Swap remaining mocks → real API calls where schemas match export
- [ ] Verify approval + milestone `submitted` integration end-to-end
- [ ] Test all status transitions with live data

---

**Document owner:** Frontend team  
**Last updated:** 2026-05-11  
**Next review:** When **Q18** (OpenAPI export parity) is addressed and published schemas match verbal answers for **Project**, **permissions**, **FieldReport**, **Task**, **Payment PATCH**; plus **client final approval** flow when no longer TBD  
**API Verification:** Exported OpenAPI at [`/public/docs?api-docs.json`](https://tamm.ultimate-dev2.com/public/docs?api-docs.json) — **80** paths confirmed. **`GET /admin/projects`** and **`POST …/assign-engineers`** absent from export; field-engineer **assign/revoke/history** present. Admin dashboard (`GET /admin/dashboard`) still pending.
