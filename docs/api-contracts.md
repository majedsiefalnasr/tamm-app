# api-contracts.md — TAMM API Contracts

> **Living document** — updated every time the Laravel team delivers a new endpoint.
> Claude Code reads this before any API integration.
> If an endpoint is not listed here → build against a mock. See CLAUDE.md §16.

---

## How to use this document

### For Claude Code
1. Before implementing any API call — check if the endpoint is listed here
2. If listed → implement against this exact contract (method, URL, request, response)
3. If not listed → create a mock in `app/composables/__mocks__/`, add TODO comment
4. When an endpoint is added here → remove the corresponding mock

### For the Laravel team
When delivering a new endpoint:
1. Add it to the correct section below
2. Mark it `✅ Available` with the date
3. Include exact request/response shapes
4. Note any edge cases or error codes

---

## Status legend

| Symbol | Meaning |
|---|---|
| ✅ Available | Endpoint is live — implement against it |
| 🔄 In progress | Laravel team is building it — use mock |
| ⏳ Not started | Not yet — use mock |

---

## Base URL

```
Development:  http://localhost:8000/api
Staging:      https://api.staging.tamm.com/api
Production:   https://api.tamm.com/api
```

Configured via `NUXT_PUBLIC_API_BASE` env variable.

---

## Authentication

All protected endpoints require:

```
Authorization: Bearer <token>
Accept: application/json
Content-Type: application/json
Accept-Language: ar | en
```

---

## Standard response envelope

### Success

```json
{
  "data": <T>,
  "message": "optional success message"
}
```

### Paginated list

```json
{
  "data": [<T>],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 15,
    "total": 72
  }
}
```

### Error

```json
{
  "message": "Human-readable error",
  "errors": {
    "field_name": ["Validation error message"]
  }
}
```

### Standard HTTP status codes used

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 204 | No content (delete) |
| 400 | Bad request |
| 401 | Unauthenticated → frontend redirects to /login |
| 403 | Forbidden (wrong role or invalid transition) |
| 404 | Not found |
| 422 | Validation error (errors field populated) |
| 500 | Server error |

---

## ── AUTH ──────────────────────────────────────────────────────────────────

### ⏳ POST /auth/login

```
Status: ⏳ Not started
```

**Request**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response 200**
```json
{
  "data": {
    "token": "string",
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "admin | client | contractor | field_engineer | supervisor_engineer | super_admin",
      "avatar": "string | null"
    }
  }
}
```

**Errors**
- 401: Invalid credentials

---

### ⏳ POST /auth/logout

```
Status: ⏳ Not started
```

**Request**: No body (token from Authorization header)
**Response**: 204

---

### ⏳ GET /auth/me

```
Status: ⏳ Not started
```

**Response 200**
```json
{
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "string",
    "avatar": "string | null"
  }
}
```

---

## ── PROJECTS ──────────────────────────────────────────────────────────────

### ⏳ PATCH /projects/:id/status

```
Status: ⏳ Not started
Roles: admin, super_admin
```

**Request**
```json
{
  "status": "open_for_bids | under_review | active | on_hold"
}
```

**Response 200**
```json
{
  "data": <Project>,
  "message": "Project status updated"
}
```

**Errors**
- 403: Invalid transition for current status
- 422: Transition not allowed (e.g., milestones not defined)

---

## ── PROPOSALS ─────────────────────────────────────────────────────────────

### ⏳ POST /projects/:id/invitations

```
Status: ⏳ Not started
Roles: admin, super_admin
```

Invite one or more contractors to bid on a project.

**Request**
```json
{
  "contractor_ids": ["string"]
}
```

**Response 201**
```json
{
  "data": [
    {
      "id": "string",
      "project_id": "string",
      "contractor": { "id": "string", "name": "string" },
      "status": "invited",
      "invited_at": "ISO8601"
    }
  ],
  "message": "Contractors invited"
}
```

---

### ⏳ GET /projects/:id/invitations

```
Status: ⏳ Not started
Roles: admin, super_admin
```

List all contractors invited to bid on a project.

**Response 200**
```json
{
  "data": [
    {
      "id": "string",
      "contractor": { "id": "string", "name": "string" },
      "status": "invited | submitted | declined",
      "invited_at": "ISO8601"
    }
  ]
}
```

---

### ⏳ POST /projects/:id/proposals

```
Status: ⏳ Not started
Roles: contractor (must be invited)
```

Contractor submits a proposal for a project.

**Request**
```json
{
  "total_price": 250000,
  "timeline_days": 90,
  "notes": "string | null"
}
```

**Response 201**
```json
{
  "data": {
    "id": "string",
    "project_id": "string",
    "contractor": { "id": "string", "name": "string" },
    "total_price": 250000,
    "timeline_days": 90,
    "notes": "string | null",
    "status": "submitted",
    "submitted_at": "ISO8601"
  },
  "message": "Proposal submitted"
}
```

**Errors**
- 403: Contractor not invited to this project
- 422: Proposal already submitted for this project

---

### ⏳ GET /projects/:id/proposals

```
Status: ⏳ Not started
Roles: admin, super_admin, client (project owner only)
```

List all submitted proposals for a project. Contractors cannot see this list.

**Response 200**
```json
{
  "data": [
    {
      "id": "string",
      "contractor": { "id": "string", "name": "string" },
      "total_price": 250000,
      "timeline_days": 90,
      "notes": "string | null",
      "status": "submitted | selected | rejected",
      "submitted_at": "ISO8601"
    }
  ]
}
```

---

### ⏳ POST /projects/:id/proposals/:proposalId/select

```
Status: ⏳ Not started
Roles: client (project owner only)
```

Client selects a contractor's proposal. Project transitions to `contractor_selected`.
All other proposals are automatically marked `rejected`.

**Request**: No body

**Response 200**
```json
{
  "data": {
    "project": <Project with status: "contractor_selected">,
    "selected_proposal": <Proposal with status: "selected">
  },
  "message": "Contractor selected"
}
```

**Errors**
- 403: Not the project owner, or project not in `under_review` status
- 404: Proposal not found

---

### ⏳ GET /projects

```
Status: ⏳ Not started
```

**Query params**
```
?status=new|active|on_hold|completed   (optional)
?page=1                                 (optional, default 1)
?per_page=15                            (optional, default 15)
```

**Response 200**
```json
{
  "data": [
    {
      "id": "string",
      "title": "string",
      "status": "new | active | on_hold | completed",
      "client": { "id": "string", "name": "string" },
      "contractor": { "id": "string", "name": "string" } | null,
      "milestones_count": 5,
      "milestones_completed": 2,
      "total_amount": 250000,
      "created_at": "ISO8601",
      "updated_at": "ISO8601"
    }
  ],
  "meta": { "current_page": 1, "last_page": 3, "per_page": 15, "total": 42 }
}
```

---

### ⏳ POST /projects

```
Status: ⏳ Not started
Roles: client, admin, super_admin
```

Project is created with scope only. No contractor or milestones at this stage.
Contractor is assigned after the proposal/bidding phase.
Milestones are defined after contractor selection.

**Request**
```json
{
  "title": "string",
  "description": "string",
  "address": "string"
}
```

**Response 201**
```json
{
  "data": {
    "id": "string",
    "title": "string",
    "status": "new",
    "created_at": "ISO8601"
  },
  "message": "Project created successfully"
}
```

---

### ⏳ GET /projects/:id

```
Status: ⏳ Not started
```

**Response 200**
```json
{
  "data": {
    "id": "string",
    "title": "string",
    "description": "string",
    "address": "string",
    "status": "string",
    "client": { "id": "string", "name": "string", "email": "string" },
    "contractor": { "id": "string", "name": "string" } | null,
    "supervisor_engineer": { "id": "string", "name": "string" } | null,
    "field_engineer": { "id": "string", "name": "string" } | null,
    "milestones": [ <Milestone> ],
    "total_amount": 250000,
    "paid_amount": 100000,
    "allowed_actions": ["string"],
    "created_at": "ISO8601",
    "updated_at": "ISO8601"
  }
}
```

---

## ── MILESTONES ────────────────────────────────────────────────────────────

### ⏳ POST /projects/:id/milestones

```
Status: ⏳ Not started
Roles: admin, super_admin, contractor (only when project is contractor_selected)
```

Define a milestone for a project. Only available after contractor selection.
Admin and contractor collaborate to define milestones before project goes active.

**Request**
```json
{
  "title": "string",
  "description": "string | null",
  "amount": 50000,
  "order": 1
}
```

**Response 201**
```json
{
  "data": {
    "id": "string",
    "project_id": "string",
    "title": "string",
    "description": "string | null",
    "amount": 50000,
    "order": 1,
    "status": "not_started",
    "payment": { "status": "pending_payment" },
    "created_at": "ISO8601"
  },
  "message": "Milestone created"
}
```

**Errors**
- 403: Project not in `contractor_selected` status
- 422: Validation error

---

### ⏳ GET /projects/:projectId/milestones

```
Status: ⏳ Not started
```

**Response 200**
```json
{
  "data": [
    {
      "id": "string",
      "project_id": "string",
      "title": "string",
      "description": "string",
      "status": "not_started | in_progress | under_review | supervisor_approved | approved | rejected",
      "amount": 50000,
      "order": 1,
      "allowed_actions": ["submit_report", "approve_supervisor", "approve_client", "reject"],
      "payment": {
        "status": "pending_payment | paid | awaiting_approval | ready_for_payout | paid_out",
        "paid_at": "ISO8601 | null"
      },
      "latest_report": <Report> | null,
      "created_at": "ISO8601",
      "updated_at": "ISO8601"
    }
  ]
}
```

---

### ⏳ POST /milestones/:id/approve

```
Status: ⏳ Not started
Roles: supervisor_engineer (supervisor_approved), client (approved)
```

**Request**
```json
{
  "role": "supervisor | client"
}
```

**Response 200**
```json
{
  "data": <Milestone>,
  "message": "Milestone approved"
}
```

**Errors**
- 403: Not authorized for this action
- 422: Invalid transition (milestone not in correct state)

---

### ⏳ POST /milestones/:id/reject

```
Status: ⏳ Not started
Roles: supervisor_engineer, client
```

**Request**
```json
{
  "reason": "string (required)"
}
```

**Response 200**
```json
{
  "data": <Milestone>,
  "message": "Milestone rejected"
}
```

**Note**: After rejection, milestone status will be `rejected` briefly, then automatically transition to `in_progress`. The response may already reflect `in_progress` — handle both cases in the frontend.

---

## ── REPORTS ───────────────────────────────────────────────────────────────

### ⏳ GET /milestones/:milestoneId/reports

```
Status: ⏳ Not started
```

**Response 200**
```json
{
  "data": [
    {
      "id": "string",
      "milestone_id": "string",
      "field_engineer": { "id": "string", "name": "string" },
      "status": "draft | submitted | under_review",
      "content": "string",
      "images": [
        { "id": "string", "url": "string", "caption": "string | null" }
      ],
      "submitted_at": "ISO8601 | null",
      "created_at": "ISO8601"
    }
  ]
}
```

---

### ⏳ POST /milestones/:milestoneId/reports

```
Status: ⏳ Not started
Roles: field_engineer
```

**Request** (multipart/form-data)
```
content: string
images[]: File[]   (optional, max 10, each max 5MB, jpg/png/webp)
```

**Response 201**
```json
{
  "data": <Report>,
  "message": "Report created"
}
```

---

### ⏳ POST /reports/:id/submit

```
Status: ⏳ Not started
Roles: field_engineer
```

**Request**: No body
**Response 200**
```json
{
  "data": <Report with status: "submitted">,
  "message": "Report submitted for review"
}
```

**Errors**
- 422: Report is not in draft status

---

## ── PAYMENTS ──────────────────────────────────────────────────────────────

### ⏳ POST /milestones/:id/pay

```
Status: ⏳ Not started
Roles: client
```

**Request**
```json
{
  "payment_method": "string"
}
```

**Response 200**
```json
{
  "data": {
    "payment_id": "string",
    "milestone_id": "string",
    "amount": 50000,
    "status": "paid",
    "paid_at": "ISO8601"
  },
  "message": "Payment received"
}
```

---

### ⏳ POST /payments/:id/release

```
Status: ⏳ Not started
Roles: admin, super_admin
```

**Request**: No body
**Response 200**
```json
{
  "data": {
    "payment_id": "string",
    "status": "paid_out",
    "released_at": "ISO8601"
  },
  "message": "Payment released to contractor"
}
```

---

## ── NOTIFICATIONS ─────────────────────────────────────────────────────────

### ⏳ GET /notifications

```
Status: ⏳ Not started
```

**Query params**
```
?unread_only=true   (optional)
?page=1
```

**Response 200**
```json
{
  "data": [
    {
      "id": "string",
      "title": "string",
      "body": "string",
      "link": "/projects/123/milestones/456",
      "read": false,
      "created_at": "ISO8601"
    }
  ],
  "meta": { "unread_count": 5 }
}
```

---

### ⏳ POST /notifications/:id/read

```
Status: ⏳ Not started
```

**Request**: No body
**Response 204**

---

### ⏳ POST /notifications/read-all

```
Status: ⏳ Not started
```

**Request**: No body
**Response 204**

---

## ── USERS (Admin only) ────────────────────────────────────────────────────

### ⏳ GET /admin/users

```
Status: ⏳ Not started
Roles: admin, super_admin
```

**Query params**
```
?role=contractor|field_engineer|supervisor_engineer|client
?page=1
```

**Response 200**
```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "string",
      "status": "active | inactive",
      "created_at": "ISO8601"
    }
  ],
  "meta": { ... }
}
```

---

### ⏳ POST /admin/users

```
Status: ⏳ Not started
Roles: admin, super_admin
```

**Request**
```json
{
  "name": "string",
  "email": "string",
  "role": "contractor | field_engineer | supervisor_engineer | client",
  "phone": "string | null"
}
```

**Response 201**
```json
{
  "data": <User>,
  "message": "User created. Credentials sent via email."
}
```

---

## Changelog

| Date | Endpoint | Change |
|---|---|---|
| — | — | No endpoints available yet |

*When the Laravel team delivers endpoints, they update this table and change ⏳ to ✅.*

---

*Last updated: MVP v1.0 — awaiting Laravel team*