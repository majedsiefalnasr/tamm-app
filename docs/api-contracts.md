# API Contracts — TAMM Construction API

**API Version:** 1.0.0  
**Base URL:** `/api/v1`  
**Authentication:** Bearer JWT token in `Authorization` header  
**Last Updated:** 2026-05-07 — Verified against live server (https://tamm.ultimate-dev2.com/docs?api-docs.json)

---

## Legend

- ✅ **Available** — Endpoint is implemented and ready to use
- ⏳ **Planned** — Endpoint is in the roadmap but not yet implemented
- ❓ **Schema Pending** — Endpoint exists but detailed schema needs clarification

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
**Notes:** ❓ See BACKEND_BLOCKERS.md Q#3

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
    "id": "string",
    "name": "string",
    "email": "string",
    "phone": "string | null",
    "role": "string | string[]",
    "status": "string",
    "avatar_url": "string | null",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
}
```

**Frontend Use:** Load user on app start  
**Implemented:** ✅ Ready to build  
**Notes:** ❓ See BACKEND_BLOCKERS.md Q#8

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

**Frontend Use:** 2FA verification dialog  
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
    "id": "string",
    "name": "string",
    "email": "string",
    "phone": "string | null",
    "role": "string | string[]",
    "status": "string",
    "avatar_url": "string | null",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
}
```

**Frontend Use:** Profile page  
**Implemented:** ✅ Ready to build  
**Notes:** ❓ See BACKEND_BLOCKERS.md Q#8

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
      "id": "string",
      "name": "string",
      "email": "string",
      "phone": "string | null",
      "role": "string | string[]",
      "status": "string",
      "created_at": "datetime"
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "pages": 15
  }
}
```

**Frontend Use:** Admin user list page  
**Implemented:** ✅ Ready to build  
**Notes:** ❓ See BACKEND_BLOCKERS.md Q#9, Q#10

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
    "id": "string",
    "name": "string",
    "email": "string",
    "phone": "string | null",
    "role": "string | string[]",
    "status": "string",
    "avatar_url": "string | null",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
}
```

**Frontend Use:** User detail page  
**Implemented:** ✅ Ready to build

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
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

**Frontend Use:** Projects list page  
**Implemented:** ✅ Ready to build  
**Notes:** ❓ See BACKEND_BLOCKERS.md Q#5, Q#9, Q#10

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

## Roles & Permissions Endpoints

All require authentication (admin level).

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

## ⏳ PLANNED — Not Yet Available

These endpoints are **not yet in the Swagger spec**. See `BACKEND_BLOCKERS.md` for timelines and details.

### Milestones (Phase 4)

- `GET /milestones` — list milestones
- `GET /milestones/{id}` — fetch milestone details
- `POST /milestones` — create milestone
- `PUT /milestones/{id}` — update milestone
- `POST /milestones/{id}/approve` — supervisor approval
- `POST /milestones/{id}/reject` — rejection
- `POST /milestones/{id}/final-approve` — client final approval

**Status:** ⏳ Planned  
**Impact:** 🔴 CRITICAL — blocks approval workflow

---

### Reports (Phase 5)

- `POST /reports` — submit field report
- `GET /reports/{id}` — fetch report
- `PUT /reports/{id}` — update report
- `POST /reports/{id}/approve` — supervisor approval
- `POST /reports/{id}/reject` — rejection
- `GET /projects/{projectId}/reports` — list project reports
- `GET /milestones/{milestoneId}/reports` — list milestone reports

**Status:** ⏳ Planned  
**Impact:** 🔴 CRITICAL — blocks field work tracking

---

### Payments (Phase 6)

- `GET /payments` — list payments
- `GET /payments/{id}` — payment details
- `POST /payments/{id}/release` — release from escrow
- `POST /payments/{id}/dispute` — flag dispute
- `POST /payments/{id}/cancel` — cancel payment

**Status:** ⏳ Planned  
**Impact:** 🔴 CRITICAL — blocks payment workflow

---

### Notifications (Phase 7)

**Status:** ⏳ Planned  
**Impact:** 🟠 HIGH — blocks real-time updates (defer to post-launch)

#### `GET /notifications`

**Status:** ⏳ Planned  
**Purpose:** Fetch all notifications for authenticated user

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "notif-001",
      "user_id": "user-123",
      "title": "Report Submitted",
      "body": "Foundation Work — Shopping Mall Project",
      "link": "/projects/proj-001/milestones/m-001",
      "is_read": false,
      "created_at": "2026-05-09T10:30:00Z",
      "read_at": null
    }
  ]
}
```

**Response Schema:**

- `id` (string) — unique notification identifier
- `user_id` (string) — recipient user ID
- `title` (string) — notification title (localized by backend)
- `body` (string) — notification body/description (localized by backend)
- `link` (string) — navigation target URL (e.g., `/projects/:id/milestones/:mid`, `/payments`)
- `is_read` (boolean) — read status
- `created_at` (string) — ISO 8601 timestamp
- `read_at` (string | null) — ISO 8601 timestamp when marked as read, or null

**Event Types Supported:**

| Event               | Title                    | Body Example                            | Link                            |
| ------------------- | ------------------------ | --------------------------------------- | ------------------------------- |
| Report Submitted    | "Report Submitted"       | "[Milestone] — [Project]"               | `/projects/:id/milestones/:mid` |
| Supervisor Approved | "Approved by Supervisor" | "[Milestone] — awaiting your approval"  | `/projects/:id/milestones/:mid` |
| Supervisor Rejected | "Rejected by Supervisor" | "[Milestone] — [reason]"                | `/projects/:id/milestones/:mid` |
| Client Approved     | "Approved by Client"     | "[Milestone] — payment pending"         | `/projects/:id/milestones/:mid` |
| Client Rejected     | "Rejected by Client"     | "[Milestone] — [reason]"                | `/projects/:id/milestones/:mid` |
| Payment Released    | "Payment Released"       | "SAR [amount] released for [milestone]" | `/payments`                     |
| Project Created     | "New Project Created"    | "[Project name]"                        | `/projects/:id`                 |

#### `POST /notifications/:id/read`

**Status:** ⏳ Planned  
**Purpose:** Mark a notification as read

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "notif-001",
    "is_read": true,
    "read_at": "2026-05-09T10:35:00Z"
  }
}
```

#### `POST /notifications/read-all`

**Status:** ⏳ Planned  
**Purpose:** Mark all unread notifications as read

**Response (200):**

```json
{
  "success": true,
  "data": {
    "marked_count": 5
  }
}
```

---

## Error Response Format

**Status:** ❓ Schema pending  
**See:** BACKEND_BLOCKERS.md Q#4

**Expected format:**

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description"
  }
}
```

**For validation errors (422):**

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

```ts
// auth.ts
export interface AuthToken {
  token: string
  token_type: 'Bearer'
  expires_in: number
}

export interface AuthUser {
  id: string
  name: string
  email: string
  phone: string | null
  role: string | string[]
  status: string
  avatar_url: string | null
  created_at: string
  updated_at: string
}

// project.ts
export interface Project {
  id: string
  name: string
  description: string
  status: 'draft' | 'active' | 'completed' | 'cancelled'
  client_id: string
  contractor_id: string | null
  supervisor_id: string | null
  budget: number
  start_date: string
  end_date: string
  created_at: string
  updated_at: string
}

// user.ts
export interface User {
  id: string
  name: string
  email: string
  phone: string | null
  role: string | string[]
  status: 'active' | 'suspended' | 'pending_verification' | 'banned'
  avatar_url: string | null
  created_at: string
  updated_at: string
}
```

---

## Next Steps

**Ready Now:**

- ✅ Phase 1–3 (auth, profile, projects)
- ✅ Phase 8–9 (admin, users)

**Awaiting Backend:**

- ⏳ Phase 4 (milestones)
- ⏳ Phase 5 (reports)
- ⏳ Phase 6 (payments)
- ⏳ Phase 7 (notifications)

**Share with Backend Team:**

- See `BACKEND_BLOCKERS.md` for 10 critical questions

---

**Document owner:** Frontend team  
**Last updated:** 2026-05-05  
**Next update:** When backend answers questions or delivers new endpoints
