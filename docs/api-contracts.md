# API Contracts — TAMM Construction API

**API Version:** 1.0.0  
**Base URL:** `/api/v1`  
**Authentication:** Bearer JWT token in `Authorization` header  
**Last Updated:** 2026-05-10 — Verified against live OpenAPI (https://tamm.ultimate-dev2.com/docs?api-docs.json) and UI explorer (https://tamm.ultimate-dev2.com/api/documentation#/)

**Companion doc:** [`BACKEND_BLOCKERS.md`](./BACKEND_BLOCKERS.md) — open questions, frontend/backend split, and divergences from older frontend assumptions.

---

## Legend

- ✅ **Available** — Listed in OpenAPI and callable on the dev server (schemas vary in completeness)
- ⏳ **Planned** — Not in OpenAPI / not delivered yet
- ❓ **Schema pending** — Route exists but request/response body is underspecified in Swagger

---

## Global response envelope & pagination

Successful and error responses use a common wrapper (see **Error Response Format** below):

- `success` — boolean
- `data` — payload or `null` on error
- `meta` — object (often `{}`); list endpoints may include `meta.pagination`
- `error` — `null` on success; on failure typically `{ "code": string, "message": string }`

**Pagination** (when present under `meta.pagination`):

```json
{
  "current_page": 1,
  "limit": 10,
  "total": 45,
  "last_page": 5
}
```

Query params are usually `page` and `limit` (confirm per resource in Swagger).

---

## Milestone status (live API)

Statuses in OpenAPI for milestones **differ** from the older frontend spec (`not_started`, `in_progress`, etc.). Align `utils/statusMachine.ts` with:

`draft` → `submitted` (via submit) → `under_review` → `approved` | `rejected`

**Client final sign-off** is **not** `POST /milestones/{id}/final-approve`; use the **Approvals** API (`POST /approvals/{approval}/approve`). See **Approval Endpoints**.

---

## Authentication Endpoints

All public unless otherwise noted.

### `POST /auth/register`

**Status:** ✅ Available  
**Purpose:** Create new user account

**Request:**

```json
{
  "name": "string (required)",
  "email": "string (required, unique)",
  "password": "string (required, min 8 chars)",
  "password_confirmation": "string (required)",
  "phone": "string (optional)",
  "role": "string (optional) — super_admin | admin | client | contractor | field_engineer | supervisor_engineer"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGci...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "phone": "string | null",
      "role": "string",
      "status": "string",
      "created_at": "datetime"
    }
  }
}
```

**Error (422):**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed"
  }
}
```

**Frontend Use:** Auth composable — self-registration (if enabled)  
**Notes:** OpenAPI allows `email` to be `null` when registering — confirm validation rules (email vs phone). ❓ BACKEND_BLOCKERS.md Q#3 (roles such as `owner` in examples vs product roles).

---

### `POST /auth/login`

**Status:** ✅ Available  
**Purpose:** Authenticate user and get JWT token

**Request:**

```json
{
  "identifier": "string (email or phone, required)",
  "password": "string (required)"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGci...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "phone": "string | null",
      "role": "string",
      "status": "string"
    }
  }
}
```

**Error (401):**

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

**Frontend Use:** Login page (`pages/login.vue`)  
**Implemented:** ✅ Ready to build

---

### `POST /auth/logout`

**Status:** ✅ Available  
**Purpose:** End user session and invalidate token

**Auth Required:** Yes

**Request:** Empty body

**Response (200):**

```json
{
  "success": true,
  "data": null
}
```

**Frontend Use:** Logout button in topbar  
**Implemented:** ✅ Ready to build

---

### `POST /auth/refresh`

**Status:** ✅ Available  
**Purpose:** Renew JWT token

**Auth Required:** Yes

**Request:** Empty body

**Response (200):**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGci...",
    "token_type": "Bearer",
    "expires_in": 3600
  }
}
```

**Frontend Use:** Token renewal on 401 errors  
**Notes:** ❓ See BACKEND_BLOCKERS.md Q#1

---

### `GET /auth/me`

**Status:** ✅ Available  
**Purpose:** Get current authenticated user

**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "string",
    "email": "string | null",
    "phone": "string | null",
    "role": "string",
    "status": "active | suspended | pending_verification | banned",
    "created_at": "datetime"
  },
  "meta": {},
  "error": null
}
```

**Frontend Use:** Load user on app start  
**Implemented:** ✅ Ready to build  
**Notes:** Matches OpenAPI `UserResource`. Extra profile fields (`avatar_url`, `updated_at`, multi-role) ❓ BACKEND_BLOCKERS.md Q#7, Q#8.

---

### `POST /auth/forgot-password`

**Status:** ✅ Available  
**Purpose:** Request password reset email

**Request:**

```json
{
  "identifier": "string (email or phone, required)"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "message": "Password reset link sent to your email"
  }
}
```

**Frontend Use:** Password recovery flow  
**Implemented:** ✅ Ready to build

---

### `POST /auth/reset-password`

**Status:** ✅ Available  
**Purpose:** Complete password reset with token

**Request:**

```json
{
  "token": "string (from email link, required)",
  "password": "string (required, min 8 chars)",
  "password_confirmation": "string (required)"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "message": "Password reset successfully"
  }
}
```

**Frontend Use:** Password reset page  
**Implemented:** ✅ Ready to build

---

### `POST /auth/otp/send`

**Status:** ✅ Available  
**Purpose:** Send OTP code for 2FA or verification

**Request:**

```json
{
  "identifier": "string (email or phone, required)"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "message": "OTP sent successfully"
  }
}
```

**Frontend Use:** 2FA or account verification flow  
**Notes:** ❓ See BACKEND_BLOCKERS.md Q#2

---

### `POST /auth/otp/verify`

**Status:** ✅ Available  
**Purpose:** Verify OTP code

**Request:**

```json
{
  "identifier": "string (required)",
  "otp_code": "string (6 digits, required)"
}
```

**Response (200):**

OpenAPI documents **`ApiSuccessMessageResponse`** (success message only — **no JWT** in this response):

```json
{
  "success": true,
  "data": {
    "message": "string"
  },
  "meta": {},
  "error": null
}
```

**Error (422):**

```json
{
  "success": false,
  "error": {
    "code": "INVALID_OTP",
    "message": "OTP code is invalid or expired"
  }
}
```

**Frontend Use:** Account verification after OTP (not a second login step unless backend states otherwise)  
**Notes:** ❓ See BACKEND_BLOCKERS.md Q#2

---

### `POST /auth/otp/resend`

**Status:** ✅ Available  
**Purpose:** Resend OTP code

**Request:**

```json
{
  "identifier": "string (required)"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "message": "OTP resent successfully"
  }
}
```

**Frontend Use:** Resend OTP button  
**Notes:** ❓ See BACKEND_BLOCKERS.md Q#2

---

## User Endpoints

All require authentication.

### `GET /me/profile`

**Status:** ✅ Available  
**Purpose:** Get current user's profile

**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "string",
    "email": "string | null",
    "phone": "string | null",
    "role": "string",
    "status": "active | suspended | pending_verification | banned",
    "created_at": "datetime"
  },
  "meta": {},
  "error": null
}
```

**Frontend Use:** Profile page  
**Implemented:** ✅ Ready to build  
**Notes:** OpenAPI aligns `GET /auth/me` with `UserResource`; extended profile fields ❓ BACKEND_BLOCKERS.md Q#8.

---

### `PUT /me/profile`

**Status:** ✅ Available  
**Purpose:** Update current user's profile

**Auth Required:** Yes

**Request:**

```json
{
  "name": "string (optional)",
  "email": "string (optional)",
  "phone": "string (optional)",
  "password": "string (optional, min 8 chars)"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "phone": "string | null",
    "updated_at": "datetime"
  }
}
```

**Frontend Use:** Profile edit form  
**Implemented:** ✅ Ready to build

---

### `POST /me/avatar`

**Status:** ✅ Available  
**Purpose:** Upload profile picture

**Auth Required:** Yes

**Request:** Multipart form-data

```
file: File (image, required)
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "avatar_url": "string",
    "message": "Avatar uploaded successfully"
  }
}
```

**Frontend Use:** Profile picture uploader  
**Implemented:** ✅ Ready to build

---

### `GET /users`

**Status:** ✅ Available  
**Purpose:** List all users (admin only)

**Auth Required:** Yes

**Query Parameters:** ❓ Pending

```
?page=1&limit=10
?sort=created_at
?role=admin
?status=active
?search=john
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "string",
      "email": "string | null",
      "phone": "string | null",
      "role": "string",
      "status": "string",
      "created_at": "datetime"
    }
  ],
  "meta": {
    "pagination": {
      "current_page": 1,
      "limit": 10,
      "total": 150,
      "last_page": 15
    }
  },
  "error": null
}
```

**Frontend Use:** Admin user list page  
**Implemented:** ✅ Ready to build  
**Notes:** ❓ Query filters/sorting not fully documented in Swagger — BACKEND_BLOCKERS.md Q#9, Q#10. Confirm live `meta` shape matches this pattern.

---

### `POST /users`

**Status:** ✅ Available  
**Purpose:** Create new user (admin only)

**Auth Required:** Yes

**Request:**

```json
{
  "name": "string (required)",
  "email": "string (required, unique)",
  "phone": "string (optional)",
  "role": "string (required) — super_admin | admin | client | contractor | field_engineer | supervisor_engineer",
  "password": "string (required, min 8 chars)"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "phone": "string | null",
    "role": "string",
    "status": "string",
    "created_at": "datetime"
  }
}
```

**Frontend Use:** Admin create user form  
**Implemented:** ✅ Ready to build

---

### `GET /users/{id}`

**Status:** ✅ Available  
**Purpose:** Get user details

**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "string",
    "email": "string | null",
    "phone": "string | null",
    "role": "string",
    "status": "active | suspended | pending_verification | banned",
    "created_at": "datetime"
  },
  "meta": {},
  "error": null
}
```

**Frontend Use:** User detail page  
**Implemented:** ✅ Ready to build  
**Notes:** `avatar_url` / `updated_at` may appear at runtime even if omitted from OpenAPI — verify Q#8.

---

### `PUT /users/{id}`

**Status:** ✅ Available  
**Purpose:** Update user (admin only)

**Auth Required:** Yes

**Request:**

```json
{
  "name": "string (optional)",
  "email": "string (optional)",
  "phone": "string (optional)",
  "role": "string (optional)",
  "status": "string (optional) — active | suspended | pending_verification | banned"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "string",
    "status": "string",
    "updated_at": "datetime"
  }
}
```

**Frontend Use:** Admin edit user form  
**Implemented:** ✅ Ready to build

---

### `DELETE /users/{id}`

**Status:** ✅ Available  
**Purpose:** Delete user (admin only)

**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "data": {
    "message": "User deleted successfully"
  }
}
```

**Frontend Use:** Admin delete user  
**Implemented:** ✅ Ready to build

---

## Project Endpoints

All require authentication.

### `GET /projects`

**Status:** ✅ Available  
**Purpose:** List projects (filtered by user role)

**Auth Required:** Yes

**Query Parameters:** ❓ Pending

```
?page=1&limit=10
?sort=-created_at
?status=active
?client_id=123
?contractor_id=456
?supervisor_id=789
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "status": "string (draft | active | completed | cancelled)",
      "client_id": "string",
      "contractor_id": "string | null",
      "supervisor_id": "string | null",
      "budget": "number",
      "start_date": "datetime",
      "end_date": "datetime",
      "created_at": "datetime",
      "updated_at": "datetime"
    }
  ],
  "meta": {
    "pagination": {
      "current_page": 1,
      "limit": 10,
      "total": 50,
      "last_page": 5
    }
  },
  "error": null
}
```

**Frontend Use:** Projects list page  
**Implemented:** ✅ Ready to build  
**Notes:** ❓ Full project resource + filters — Swagger thin on this route; BACKEND_BLOCKERS.md Q#5, Q#9, Q#10. Confirm `meta.pagination` on live responses.

---

### `POST /projects`

**Status:** ✅ Available  
**Purpose:** Create new project (client or admin)

**Auth Required:** Yes

**Request:**

```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "client_id": "string (required)",
  "contractor_id": "string (optional)",
  "supervisor_id": "string (optional)",
  "budget": "number (required)",
  "start_date": "datetime (required)",
  "end_date": "datetime (required)"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "status": "draft",
    "client_id": "string",
    "contractor_id": "string | null",
    "supervisor_id": "string | null",
    "budget": "number",
    "start_date": "datetime",
    "end_date": "datetime",
    "created_at": "datetime"
  }
}
```

**Frontend Use:** Create project form  
**Implemented:** ✅ Ready to build

---

### `GET /projects/{id}`

**Status:** ✅ Available  
**Purpose:** Get project details

**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "status": "string",
    "client_id": "string",
    "contractor_id": "string | null",
    "supervisor_id": "string | null",
    "budget": "number",
    "start_date": "datetime",
    "end_date": "datetime",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
}
```

**Frontend Use:** Project detail page  
**Implemented:** ✅ Ready to build

---

### `PUT /projects/{id}`

**Status:** ✅ Available  
**Purpose:** Update project

**Auth Required:** Yes

**Request:**

```json
{
  "name": "string (optional)",
  "description": "string (optional)",
  "status": "string (optional) — draft | active | completed | cancelled",
  "contractor_id": "string (optional)",
  "supervisor_id": "string (optional)",
  "budget": "number (optional)",
  "start_date": "datetime (optional)",
  "end_date": "datetime (optional)"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "updated_at": "datetime"
  }
}
```

**Frontend Use:** Edit project form  
**Implemented:** ✅ Ready to build

---

### `DELETE /projects/{id}`

**Status:** ✅ Available  
**Purpose:** Delete project

**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "data": {
    "message": "Project deleted successfully"
  }
}
```

**Frontend Use:** Admin delete project  
**Implemented:** ✅ Ready to build

---

### `GET /projects/{id}/documents`

**Status:** ✅ Available  
**Purpose:** List project documents

**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "mime_type": "string",
      "size": "number (bytes)",
      "url": "string",
      "uploaded_by": "string",
      "created_at": "datetime"
    }
  ]
}
```

**Frontend Use:** Project documents tab  
**Implemented:** ✅ Ready to build

---

### `POST /projects/{id}/documents`

**Status:** ✅ Available  
**Purpose:** Upload document to project

**Auth Required:** Yes

**Request:** Multipart form-data

```
file: File (required)
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "mime_type": "string",
    "size": "number",
    "url": "string",
    "created_at": "datetime"
  }
}
```

**Frontend Use:** Document uploader  
**Implemented:** ✅ Ready to build

---

### `DELETE /projects/{id}/documents/{docId}`

**Status:** ✅ Available  
**Purpose:** Delete project document

**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "data": {
    "message": "Document deleted successfully"
  }
}
```

**Frontend Use:** Delete document button  
**Implemented:** ✅ Ready to build

---

### `GET /projects/{id}/status-history`

**Status:** ✅ Available  
**Purpose:** View project status change history

**Auth Required:** Yes

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "status": "string",
      "changed_at": "datetime",
      "changed_by": "string",
      "changed_by_id": "string"
    }
  ]
}
```

**Frontend Use:** Status timeline  
**Implemented:** ✅ Ready to build

---

## Admin Project Endpoints

### `GET /admin/projects/pending`

**Status:** ✅ Available  
**Purpose:** List pending project approvals

**Auth Required:** Yes (admin)

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "client_id": "string",
      "budget": "number",
      "submitted_at": "datetime"
    }
  ]
}
```

**Frontend Use:** Admin pending projects list  
**Implemented:** ✅ Ready to build

---

### `POST /admin/projects/{id}/approve`

**Status:** ✅ Available  
**Purpose:** Approve project submission

**Auth Required:** Yes (admin)

**Request:**

```json
{
  "approver_notes": "string (optional)"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "status": "active",
    "message": "Project approved successfully"
  }
}
```

**Frontend Use:** Approve project dialog  
**Implemented:** ✅ Ready to build

---

### `POST /admin/projects/{id}/reject`

**Status:** ✅ Available  
**Purpose:** Reject project submission

**Auth Required:** Yes (admin)

**Request:**

```json
{
  "reason": "string (required)"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "status": "rejected",
    "message": "Project rejected successfully"
  }
}
```

**Frontend Use:** Reject project dialog  
**Implemented:** ✅ Ready to build

---

### `POST /admin/projects/{id}/assign-supervisor`

**Status:** ✅ Available  
**Purpose:** Assign supervisor to project

**Auth Required:** Yes (admin)

**Request:**

```json
{
  "supervisor_id": "string (required)"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "supervisor_id": "string",
    "message": "Supervisor assigned successfully"
  }
}
```

**Frontend Use:** Admin assign supervisor UI  
**Implemented:** ✅ Ready to build

---

### `POST /admin/projects/{id}/assign-engineers`

**Status:** ✅ Available  
**Purpose:** Assign supervisor engineer and field engineer to project

**Auth Required:** Yes (admin/super_admin)

**Request:**

```json
{
  "supervisor_engineer_id": "string (required, uuid)",
  "field_engineer_id": "string (required, uuid)"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "supervisor_engineer_id": "string",
    "field_engineer_id": "string",
    "supervisor_engineer": {
      "id": "string",
      "name": "string",
      "email": "string"
    },
    "field_engineer": {
      "id": "string",
      "name": "string",
      "email": "string"
    },
    "message": "Engineers assigned successfully"
  }
}
```

**Error (422 — Validation):**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Cannot assign same engineer to both roles",
    "errors": {
      "assignment": ["Cannot assign the same engineer to both roles"]
    }
  }
}
```

**Frontend Use:** Admin assign engineers UI (Story 06-03)  
**Implemented:** ✅ Ready to build

---

### `GET /admin/projects`

**Status:** ✅ Available  
**Purpose:** List all projects across platform with filtering, search, and pagination (admin view)

**Auth Required:** Yes (admin/super_admin)

**Query Parameters:**

```
status=<filter>  // optional: 'new', 'active', 'in_progress', 'on_hold', 'completed', or 'all' (default)
search=<query>   // optional: search by project name or client name
page=<number>    // optional: page number (default: 1)
per_page=<num>   // optional: items per page (default: 20)
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "project_number": "P001",
      "name": "مشروع البناء الأول",
      "status": "active",
      "client": {
        "id": "uuid",
        "name": "اسم العميل"
      },
      "contractor": {
        "id": "uuid",
        "name": "اسم المقاول"
      } | null,
      "total_value": 50000.00,
      "created_at": "2026-05-01T12:00:00Z",
      "milestones": [
        {
          "id": "uuid",
          "status": "completed"
        },
        {
          "id": "uuid",
          "status": "in_progress"
        }
      ]
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 20,
    "total": 45,
    "total_pages": 3
  }
}
```

**Error (401 — Unauthorized):**

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Unauthorized access"
  }
}
```

**Error (500 — Server Error):**

```json
{
  "success": false,
  "error": {
    "code": "SERVER_ERROR",
    "message": "Failed to fetch projects"
  }
}
```

**Frontend Use:** Admin project overview page (Story 06-04)  
**Implemented:** ✅ Ready to build

## Roles & Permissions Endpoints

All require authentication (admin level).

### `GET /admin/dashboard`

**Status:** ⏳ Not Available (mock data in use)  
**Purpose:** Get dashboard summary with KPIs, urgent banners, action queues, recent activity (Story 08-05)

**Auth Required:** Yes (admin, super_admin)

**Response (200):**

```json
{
  "success": true,
  "data": {
    "summary_stats": {
      "active_projects": 12,
      "milestones_pending_review": 4,
      "payments_ready_for_release": 2,
      "projects_awaiting_contractor_selection": 3,
      "new_users_this_month": 7,
      "open_disputes": 2
    },
    "urgent_actions": {
      "new_projects": 3,
      "pending_payments": 5,
      "disputes": 2,
      "pending_reports": 4
    },
    "action_queues": {
      "open_bidding": [
        {
          "id": "uuid",
          "kind": "open_bidding",
          "title": "School repair project",
          "subtitle": "New project — open bidding",
          "project_id": "uuid",
          "action_href": "/projects/uuid",
          "action_label_key": "admin.dashboard.actions.open_bidding"
        }
      ],
      "assign_engineers": [],
      "release_payment": []
    },
    "super_admin_flags": {
      "pending_permission_requests": 0
    },
    "recent_projects": [
      {
        "id": "uuid",
        "project_number": "P001",
        "name": "مشروع البناء الأول",
        "city": "القاهرة",
        "client_name": "أحمد محمد",
        "status": "active",
        "milestones_completed": 2,
        "milestones_total": 5,
        "progress_percentage": 40
      }
    ],
    "open_disputes": [
      {
        "id": "uuid",
        "dispute_number": "D001",
        "project_name": "مشروع البناء الأول",
        "requester_name": "علي سالم",
        "subject": "تأخير في التسليم",
        "status": "open",
        "created_at": "2026-05-08T10:30:00Z"
      }
    ],
    "activity_data": {
      "months": ["يناير", "فبراير", "..."],
      "data": [
        { "month": "يناير", "milestones": 5, "projects": 2 },
        { "month": "فبراير", "milestones": 8, "projects": 3 }
      ]
    },
    "recent_events": [
      {
        "id": "uuid",
        "type": "project_created",
        "title": "New project created",
        "subtitle": "Optional detail line",
        "timestamp": "2026-05-08T15:30:00Z",
        "related_entity_id": "uuid",
        "related_name": "Client name"
      }
    ]
  }
}
```

**`recent_events.type`:** `project_created` | `milestone_approved` | `payment_released` | `user_created` | `contractor_selected` | `bidding_opened` | `milestone_under_review`

**Frontend Use:** Admin dashboard page (`/admin/dashboard`)  
**Implemented:** ✅ Ready to build (mock data in use)  
**Notes:** `super_admin_flags` may be omitted for `admin` role. Replace mock when Laravel exposes the endpoint.

---

### `GET /admin/permissions`

**Status:** ✅ Available  
**Purpose:** List all available permissions

**Auth Required:** Yes (admin)

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "approve_milestone",
      "description": "Can approve milestones for payment"
    },
    {
      "id": "string",
      "name": "reject_milestone",
      "description": "Can reject milestones"
    }
  ]
}
```

**Frontend Use:** Permission management UI  
**Implemented:** ✅ Ready to build  
**Notes:** ❓ See BACKEND_BLOCKERS.md Q#6

---

### `GET /admin/roles`

**Status:** ✅ Available  
**Purpose:** List all roles

**Auth Required:** Yes (admin)

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "super_admin",
      "description": "Full system access"
    },
    {
      "id": "string",
      "name": "admin",
      "description": "Manage users and projects"
    },
    {
      "id": "string",
      "name": "client",
      "description": "Create projects, final approval"
    },
    {
      "id": "string",
      "name": "contractor",
      "description": "Execute work, receive payment"
    },
    {
      "id": "string",
      "name": "field_engineer",
      "description": "Submit field reports"
    },
    {
      "id": "string",
      "name": "supervisor_engineer",
      "description": "Review and approve work"
    }
  ]
}
```

**Frontend Use:** Role management list  
**Implemented:** ✅ Ready to build

---

### `POST /admin/roles`

**Status:** ✅ Available  
**Purpose:** Create custom role

**Auth Required:** Yes (super_admin)

**Request:**

```json
{
  "name": "string (required, unique)",
  "description": "string (optional)"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "created_at": "datetime"
  }
}
```

**Frontend Use:** Create role form  
**Implemented:** ✅ Ready to build

---

### `GET /admin/roles/{id}`

**Status:** ✅ Available  
**Purpose:** Get role details with permissions

**Auth Required:** Yes (admin)

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "permissions": [
      {
        "id": "string",
        "name": "approve_milestone"
      }
    ],
    "created_at": "datetime"
  }
}
```

**Frontend Use:** Role detail page  
**Implemented:** ✅ Ready to build

---

### `PATCH /admin/roles/{id}`

**Status:** ✅ Available  
**Purpose:** Update role

**Auth Required:** Yes (super_admin)

**Request:**

```json
{
  "name": "string (optional)",
  "description": "string (optional)"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "updated_at": "datetime"
  }
}
```

**Frontend Use:** Edit role form  
**Implemented:** ✅ Ready to build

---

### `DELETE /admin/roles/{id}`

**Status:** ✅ Available  
**Purpose:** Delete role

**Auth Required:** Yes (super_admin)

**Response (200):**

```json
{
  "success": true,
  "data": {
    "message": "Role deleted successfully"
  }
}
```

**Frontend Use:** Delete role confirmation  
**Implemented:** ✅ Ready to build

---

### `POST /admin/roles/{id}/permissions`

**Status:** ✅ Available  
**Purpose:** Grant permission to role

**Auth Required:** Yes (super_admin)

**Request:**

```json
{
  "permission_id": "string (required)"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "message": "Permission granted successfully"
  }
}
```

**Frontend Use:** Permission assignment dialog  
**Implemented:** ✅ Ready to build  
**Notes:** ❓ See BACKEND_BLOCKERS.md Q#6

---

### `DELETE /admin/roles/{id}/permissions/{permId}`

**Status:** ✅ Available  
**Purpose:** Revoke permission from role

**Auth Required:** Yes (super_admin)

**Response (200):**

```json
{
  "success": true,
  "data": {
    "message": "Permission revoked successfully"
  }
}
```

**Frontend Use:** Remove permission button  
**Implemented:** ✅ Ready to build

---

### `POST /admin/users/{userId}/roles`

**Status:** ✅ Available  
**Purpose:** Add role to user

**Auth Required:** Yes (super_admin)

**Request:**

```json
{
  "role_id": "string (required)"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "message": "Role assigned successfully"
  }
}
```

**Frontend Use:** Assign role to user dialog  
**Implemented:** ✅ Ready to build  
**Notes:** ❓ See BACKEND_BLOCKERS.md Q#7

---

### `DELETE /admin/users/{userId}/roles/{roleId}`

**Status:** ✅ Available  
**Purpose:** Remove role from user

**Auth Required:** Yes (super_admin)

**Response (200):**

```json
{
  "success": true,
  "data": {
    "message": "Role removed successfully"
  }
}
```

**Frontend Use:** Remove role from user  
**Implemented:** ✅ Ready to build

---

## Milestone Endpoints

All paths below are under `/api/v1`. Path parameter `{milestone}` is an **integer** in OpenAPI.

| Method | Path                               | Status       | Notes                                                                                                                                                                         |
| ------ | ---------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/milestones`                      | ✅ Available | Query: `project_id`, `status` (`draft` \| `submitted` \| `under_review` \| `approved` \| `rejected`), `assigned_to`, `limit` (default 10). Response: `MilestoneListResponse`. |
| POST   | `/milestones`                      | ✅ Available | Body: `CreateMilestoneRequestBody` — `title`, `amount`, `assigned_to`, `project_id` required; optional `description`, `currency`, `due_date`.                                 |
| GET    | `/milestones/{milestone}`          | ✅ Available | Response: `MilestoneDetailResponse` (includes nested `project`, `payments`, review fields when present).                                                                      |
| PUT    | `/milestones/{milestone}`          | ✅ Available | Same body shape as create per OpenAPI reference.                                                                                                                              |
| DELETE | `/milestones/{milestone}`          | ✅ Available | Success: `ApiSuccessMessageResponse`.                                                                                                                                         |
| POST   | `/milestones/{milestone}/submit`   | ✅ Available | Contractor submits for review.                                                                                                                                                |
| POST   | `/milestones/{milestone}/approve`  | ✅ Available | Optional body: `ApproveMilestoneRequestBody` (`notes`).                                                                                                                       |
| POST   | `/milestones/{milestone}/reject`   | ✅ Available | Body: `RejectMilestoneRequestBody` (`reason` required).                                                                                                                       |
| GET    | `/milestones/{milestone}/progress` | ✅ Available | ❓ Response body not fully described in Swagger — verify with backend.                                                                                                        |

**Not in OpenAPI:** `POST /milestones/{id}/final-approve` — use **Approvals** for client final approval.

**Frontend:** Align composables and `statusMachine.ts` with milestone enums above; see `BACKEND_BLOCKERS.md` divergences.

---

## Approval Endpoints

Unified approval records (e.g. client sign-off on a milestone). Path `{approval}` is an **integer**.

| Method | Path                            | Status       | Notes                                                                                                               |
| ------ | ------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------- |
| GET    | `/approvals`                    | ✅ Available | Query: `status` (`pending` \| `approved` \| `rejected` \| `cancelled`), `type` (e.g. `milestone`), `page`, `limit`. |
| GET    | `/approvals/{approval}`         | ✅ Available | Detail: `ApprovalDetailResponse`.                                                                                   |
| POST   | `/approvals/{approval}/approve` | ✅ Available | Optional body: `ApproveApprovalRequestBody` (`notes`).                                                              |
| POST   | `/approvals/{approval}/reject`  | ✅ Available | Body: `RejectApprovalRequestBody` (`notes` required per schema).                                                    |

**Resource highlights (`ApprovalResource`):** `type`, `status`, `approvable` (`type`, `id`, `url`, `status`), `requested_by`, `assigned_to`, amounts/currency, timestamps.

**❓ Open:** When approvals are created and how to resolve `approval` id from a milestone — see BACKEND_BLOCKERS.md Q#11.

---

## Task Endpoints

Tasks hang under milestones; task id is an **integer** where noted.

| Method | Path                            | Status       | Notes                                            |
| ------ | ------------------------------- | ------------ | ------------------------------------------------ |
| GET    | `/milestones/{milestone}/tasks` | ✅ Available | ❓ List schema minimal in Swagger.               |
| POST   | `/milestones/{milestone}/tasks` | ✅ Available | Body: `title`, `assigned_to` (integer) required. |
| POST   | `/tasks/{task}/start`           | ✅ Available |                                                  |
| POST   | `/tasks/{task}/mark-complete`   | ✅ Available |                                                  |
| POST   | `/tasks/{task}/approve`         | ✅ Available | Optional `notes`.                                |
| POST   | `/tasks/{task}/reject`          | ✅ Available | Body: `reason` required.                         |
| GET    | `/contractor/tasks`             | ✅ Available | Contractor task inbox.                           |

**❓ Open:** Full task resource schema — BACKEND_BLOCKERS.md Q#12.

---

## Field report endpoints

URLs use **`field-reports`**, not `/reports`.

| Method | Path                                      | Status       | Notes                                        |
| ------ | ----------------------------------------- | ------------ | -------------------------------------------- |
| GET    | `/projects/{project}/field-reports`       | ✅ Available | `{project}` integer in OpenAPI.              |
| POST   | `/projects/{project}/field-reports`       | ✅ Available | Body: `type`, `report_date` (date) required. |
| POST   | `/field-reports/{report}/submit`          | ✅ Available |                                              |
| POST   | `/field-reports/{report}/approve`         | ✅ Available | Optional `notes`.                            |
| POST   | `/field-reports/{report}/reject`          | ✅ Available | Body: `reason` required.                     |
| POST   | `/field-reports/{report}/request-changes` | ✅ Available | Body: `feedback` required.                   |
| POST   | `/field-reports/{report}/media`           | ✅ Available | ❓ Multipart details in Swagger — confirm.   |
| GET    | `/field-engineer/reports/me`              | ✅ Available | Current user’s reports.                      |

**❓ Open:** Report types enum, full resource shape — BACKEND_BLOCKERS.md Q#13.

---

## Payment endpoints

| Method | Path                  | Status       | Notes                                                                                                                     |
| ------ | --------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/payments`           | ✅ Available | Query: `status` (`pending` \| `awaiting_release` \| `processing` \| `paid` \| `failed`), `milestone_id`, `page`, `limit`. |
| POST   | `/payments`           | ✅ Available | Body: `CreatePaymentRequestBody`.                                                                                         |
| GET    | `/payments/{payment}` | ✅ Available | `{payment}` integer.                                                                                                      |
| PATCH  | `/payments/{payment}` | ✅ Available | Body: `UpdatePaymentStatusRequestBody` — ❓ confirm allowed fields / release flow (BACKEND_BLOCKERS.md Q#14).             |

**Statuses differ** from the older frontend escrow narrative; map UI copy and state machine to the enum above.

---

## Withdrawal endpoints

| Method | Path                                              | Status       | Notes                                                                               |
| ------ | ------------------------------------------------- | ------------ | ----------------------------------------------------------------------------------- |
| POST   | `/withdrawals`                                    | ✅ Available | Body requires `milestone_id`, `amount`, `bank_account_details` (structure ❓ Q#15). |
| GET    | `/withdrawals/me`                                 | ✅ Available | Contractor history.                                                                 |
| POST   | `/withdrawals/{withdrawal}/cancel`                | ✅ Available |                                                                                     |
| GET    | `/admin/withdrawals`                              | ✅ Available |                                                                                     |
| GET    | `/admin/withdrawals/pending`                      | ✅ Available |                                                                                     |
| POST   | `/admin/withdrawals/{withdrawal}/start-review`    | ✅ Available |                                                                                     |
| POST   | `/admin/withdrawals/{withdrawal}/approve`         | ✅ Available |                                                                                     |
| POST   | `/admin/withdrawals/{withdrawal}/reject`          | ✅ Available |                                                                                     |
| POST   | `/admin/withdrawals/{withdrawal}/mark-processing` | ✅ Available |                                                                                     |
| POST   | `/admin/withdrawals/{withdrawal}/mark-completed`  | ✅ Available | Body: `transaction_proof_url` (uri) required.                                       |

---

## Notification endpoints

**Status:** ✅ Available

| Method | Path                          | Notes                                                                                                                                       |
| ------ | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/notifications`              | Query: `page`, `limit` (default 20), `unread_only`, `type`. Response: `NotificationListResponse` + `meta.pagination` + `meta.unread_count`. |
| GET    | `/notifications/unread-count` | `UnreadCountResponse` → `data.count`.                                                                                                       |
| POST   | `/notifications/{id}/read`    | `{id}` is **uuid** string. Returns `ApiSuccessMessageResponse`.                                                                             |
| POST   | `/notifications/read-all`     |                                                                                                                                             |
| DELETE | `/notifications/{id}`         | `{id}` uuid.                                                                                                                                |

**Item shape (`NotificationResource`) — OpenAPI:**

| Field        | Type             | Notes                                                                                           |
| ------------ | ---------------- | ----------------------------------------------------------------------------------------------- |
| `id`         | uuid string      |                                                                                                 |
| `type`       | string           | e.g. `milestone_approved`                                                                       |
| `title`      | string           |                                                                                                 |
| `message`    | string           | **Not** `body`                                                                                  |
| `data`       | object           | Arbitrary payload — derive navigation from keys backend puts here (`BACKEND_BLOCKERS.md` Q#16). |
| `read_at`    | datetime \| null | **Unread** when `null` — **not** a separate `is_read` flag in schema                            |
| `created_at` | datetime         |                                                                                                 |

---

## Supervisor assignment endpoints

| Method | Path                                      | Status                                 |
| ------ | ----------------------------------------- | -------------------------------------- |
| GET    | `/supervisor/projects/pending-acceptance` | ✅ Available                           |
| POST   | `/supervisor/projects/{id}/accept`        | ✅ Available                           |
| POST   | `/supervisor/projects/{id}/reject`        | ✅ Available — body: `reason` required |

---

## Field engineer assignment endpoints

| Method | Path                                              | Status       | Notes                     |
| ------ | ------------------------------------------------- | ------------ | ------------------------- |
| POST   | `/projects/{project}/field-engineer/assign`       | ✅ Available | Body: `field_engineer_id` |
| POST   | `/projects/{project}/field-engineer/revoke`       | ✅ Available | Body: `reason`            |
| GET    | `/projects/{project}/field-engineer-history`      | ✅ Available |                           |
| GET    | `/field-engineer/assignments/pending`             | ✅ Available |                           |
| GET    | `/field-engineer/assignments/active`              | ✅ Available |                           |
| POST   | `/field-engineer/assignments/{assignment}/accept` | ✅ Available | Optional `notes`          |
| POST   | `/field-engineer/assignments/{assignment}/reject` | ✅ Available | Body: `reason`            |

---

## ⏳ Planned / ❓ Schema gaps

These remain **out of OpenAPI** or **underspecified** — track details in `BACKEND_BLOCKERS.md`.

| Item                                                                      | Status            | Notes                                                                                           |
| ------------------------------------------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------- |
| `GET /admin/dashboard`                                                    | ⏳ Planned        | Frontend uses mocks until backend ships contract.                                               |
| `GET /projects`, `POST /projects`, `GET /projects/{id}`, user list/detail | ❓ Schema pending | Routes exist; Swagger responses often `200 OK` only — need full resource schemas (Q#5, Q#8–10). |
| Legacy `/reports/*` paths                                                 | ⏳ Not used       | Replaced by **`field-reports`** routes above.                                                   |
| `POST /payments/{id}/release`, `/dispute`, `/cancel`                      | ⏳ Not in OpenAPI | Use **`PATCH /payments/{payment}`** and withdrawals flow unless backend adds dedicated routes.  |

---

## Error Response Format

**Status:** ✅ Documented in OpenAPI (`ApiErrorResponse`) — always confirm edge cases with backend.

**Typical error envelope:**

```json
{
  "success": false,
  "data": null,
  "meta": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description"
  }
}
```

**Validation errors (422)** — field bag may appear **inside** `error` (confirm per endpoint):

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "errors": {
      "email": ["Email is required", "Email must be unique"],
      "password": ["Password must be 8+ characters"]
    }
  }
}
```

---

## HTTP Status Codes

| Code | Meaning          |
| ---- | ---------------- |
| 200  | OK               |
| 201  | Created          |
| 400  | Bad Request      |
| 401  | Unauthorized     |
| 403  | Forbidden        |
| 404  | Not Found        |
| 422  | Validation Error |
| 500  | Server Error     |

---

## TypeScript Types (shared/types/)

Starter shapes — **normalize ID types** (`number` vs `string` vs uuid) once BACKEND_BLOCKERS.md Q#17 is answered.

```ts
// api.ts — list responses that use meta.pagination
export interface PaginationMeta {
  current_page: number
  limit: number
  total: number
  last_page: number
}

export interface ApiListMeta {
  pagination?: PaginationMeta
  unread_count?: number
}

// auth.ts
export interface AuthToken {
  token: string
  token_type: 'Bearer'
  expires_in: number
}

export interface AuthUser {
  id: number // OpenAPI UserResource uses integer; widen to string if backend confirms UUIDs
  name: string
  email: string | null
  phone: string | null
  role: string
  status: 'active' | 'suspended' | 'pending_verification' | 'banned'
  created_at: string
}

// milestone.ts — statuses from OpenAPI MilestoneResource
export type MilestoneStatusApi =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'

export interface Milestone {
  id: number
  title: string
  description: string | null
  status: MilestoneStatusApi
  amount: number
  currency: string
  due_date: string | null
  created_at: string
  updated_at: string
  created_by: { id: number; name: string }
  assigned_to: { id: number; name: string }
  project_id: number
}

// notification.ts — OpenAPI NotificationResource
export interface NotificationItem {
  id: string
  type: string
  title: string
  message: string
  data: Record<string, unknown>
  read_at: string | null
  created_at: string
}

// project.ts — ❓ confirm against GET /projects payload when schema lands
export interface Project {
  id: number | string
  name: string
  description: string
  status: string
  created_at: string
  updated_at: string
}

// user.ts
export interface User {
  id: number
  name: string
  email: string | null
  phone: string | null
  role: string
  status: 'active' | 'suspended' | 'pending_verification' | 'banned'
  created_at: string
}
```

---

## Next Steps

**Contracts in OpenAPI — integrate:**

- ✅ Milestones, approvals, tasks, field reports, payments, withdrawals, notifications
- ✅ Supervisor and field-engineer assignment flows

**Still blocking full parity:**

- ⏳ `GET /admin/dashboard` (mock until shipped)
- ❓ Rich schemas for `GET/POST /projects`, `GET /users`, and related list filters (Swagger stubs)

**Coordinate with backend:**

- See `BACKEND_BLOCKERS.md` for open questions (Q#1–Q#17), milestone vs approval flow, and notification `data` payloads.

---

**Document owner:** Frontend team  
**Last updated:** 2026-05-10  
**Next update:** When backend publishes Project/User schemas and dashboard endpoint
