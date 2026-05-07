# Backend Blockers — Sequenced by Frontend Priority

**Purpose:** Track which backend endpoints block frontend work. Sequenced by what the team needs to build first.

**Current API Status:** `/api/v1` — Version 1.0.0  
**Last Updated:** 2026-05-07 — Verified against live server (https://tamm.ultimate-dev2.com/docs?api-docs.json)

---

## 🎯 Frontend Work Sequence

The frontend is built in phases. Each phase lists:

1. **Frontend feature** to build
2. **Backend endpoints required**
3. **Status** (✅ Available / ⏳ Planned)
4. **Blocker severity** (🔴 blocks sprint / 🟠 blocks feature / 🟡 can use mocks)

---

## Phase 1: Authentication & User Sessions (Week 1)

**Frontend Goal:** Users can log in, stay authenticated, log out, recover password.

| Backend Endpoint             | Status       | Frontend Use           | Severity    |
| ---------------------------- | ------------ | ---------------------- | ----------- |
| `POST /auth/login`           | ✅ Available | Login form submit      | 🔴 CRITICAL |
| `POST /auth/logout`          | ✅ Available | Logout button          | 🔴 CRITICAL |
| `POST /auth/refresh`         | ✅ Available | Token renewal on 401   | 🔴 CRITICAL |
| `GET /auth/me`               | ✅ Available | Load user on app start | 🔴 CRITICAL |
| `POST /auth/forgot-password` | ✅ Available | Password reset flow    | 🟠 HIGH     |
| `POST /auth/reset-password`  | ✅ Available | Complete reset flow    | 🟠 HIGH     |

**✅ READY TO BUILD:** Auth flow, login page, session persistence  
**❓ AWAITING:** See questions #1, #2, #3 below

---

## 📋 Critical Questions — Get Backend to Answer These Now

### Question #1: JWT Token Lifecycle

**Impact:** Auth flow reliability  
**Ask Backend:**

```
How long does an access token live before expiry?
  - 1 hour? 8 hours? Custom?

Does the system use a separate refresh token, or do we refresh
the access token using the current access token?

Should the frontend proactively refresh before expiry,
or only refresh on 401 error?
```

---

### Question #2: OTP/2FA Purpose & Flow

**Impact:** Authentication strategy  
**Ask Backend:**

```
What is OTP used for in your system?
  - Login 2FA (after password)?
  - Account verification (after registration)?
  - Both?

Is OTP mandatory for all users or optional/per-role?

What does POST /auth/otp/verify return?
  - A JWT token? A session ID?
```

---

### Question #3: Registration Policy

**Impact:** User onboarding flow  
**Ask Backend:**

```
Is POST /auth/register publicly available, or invitation-only?

If public, which roles can self-register?
  - Client? Contractor? Field engineer?
  - Or only admin can create users?

Does registration require email verification/OTP before
the account is active?
```

---

### Question #4: Error Response Format (BLOCKING)

**Impact:** All error handling in frontend  
**Ask Backend:**

```
Does EVERY API response have this wrapper structure?
{
  "success": true/false,
  "data": {...},
  "error": null or {code, message}
}

OR are successful responses flat (just the data),
and errors have the wrapper?

For validation errors (422), what's the format?
```

---

### Question #5: Complete Project Schema

**Impact:** Building project list, detail, edit forms  
**Ask Backend:**

```
Can you share the complete Project resource schema
returned by GET /projects/{id}?

Include all fields, data types, enum values, nullable fields,
and relationships (client_id, contractor_id, supervisor_id, etc.)
```

---

### Question #6: Permission System

**Impact:** Role-based access control in frontend  
**Ask Backend:**

```
What are all the permission names in your system?
(We need ~20–30 of them)

Examples we're assuming:
  - approve_milestone
  - reject_milestone
  - approve_report
  - reject_report
  - release_payment
  - create_project
  - edit_user
```

---

### Question #7: User Roles Model

**Impact:** Permission checking in frontend  
**Ask Backend:**

```
Can a single user have multiple roles?
  - User A: both "admin" and "contractor"?
  - Or one role per user?

Is the role list exactly these 6?
  - super_admin
  - admin
  - client
  - contractor
  - field_engineer
  - supervisor_engineer
```

---

### Question #8: Complete User Schema

**Impact:** Profile page, user list, admin forms  
**Ask Backend:**

```
Can you share the complete User resource schema?

Include all fields returned by GET /me and GET /users/{id}:
- All fields (id, name, email, phone, role, status, avatar_url, etc.)
- Which fields are editable via PUT /me/profile?
- Is avatar_url returned from POST /me/avatar?
```

---

### Question #9: Pagination & Sorting

**Impact:** List pages (projects, users, reports, milestones)  
**Ask Backend:**

```
How do paginated endpoints work?

Query parameters:
  - ?page=1&limit=10
  - Or ?offset=0&limit=10?

Can we sort?
  - ?sort=created_at or ?sort=-created_at?

What's the response structure for pagination metadata?
```

---

### Question #10: Filtering

**Impact:** Search/filter on list pages  
**Ask Backend:**

```
What filters are available for each resource?

For GET /projects, can we filter by:
  - ?status=active
  - ?client_id=123
  - ?contractor_id=456
  - ?created_after=2026-01-01&created_before=2026-12-31

What's the exact query parameter format?
```

---

## 🔴 CRITICAL MISSING ENDPOINTS

### Milestones (Phase 4 — Approval Workflow)

**Status:** ⏳ NOT IN SWAGGER — completely missing

Required endpoints:

- `GET /milestones` — List all milestones
- `GET /milestones/{id}` — Fetch milestone details
- `POST /milestones` — Create milestone
- `PUT /milestones/{id}` — Update milestone
- `POST /milestones/{id}/approve` — Supervisor first-level approval
- `POST /milestones/{id}/reject` — Rejection (returns to in_progress)
- `POST /milestones/{id}/final-approve` — Client final approval

**Impact:** 🔴 CRITICAL — Blocks core feature (approval workflow)

---

### Reports (Phase 5 — Field Work Tracking)

**Status:** ⏳ NOT IN SWAGGER — completely missing

Required endpoints:

- `POST /reports` — Submit field report
- `GET /reports/{id}` — Fetch report details
- `PUT /reports/{id}` — Update report
- `POST /reports/{id}/approve` — Supervisor approval
- `POST /reports/{id}/reject` — Supervisor rejection

**Impact:** 🔴 CRITICAL — Blocks field work tracking

---

### Payments (Phase 6 — Escrow & Payout)

**Status:** ⏳ NOT IN SWAGGER — completely missing

Required endpoints:

- `GET /payments` — List payments
- `GET /payments/{id}` — Fetch payment details
- `POST /payments/{id}/release` — Release from escrow
- `POST /payments/{id}/dispute` — Flag payment dispute

**Impact:** 🔴 CRITICAL — Blocks payment/revenue flow

---

### Notifications (Phase 7 — Real-Time Updates)

**Status:** ⏳ NOT IN SWAGGER — completely missing

Required endpoints:

- `GET /notifications` — List user notifications
- `PUT /notifications/{id}/read` — Mark as read
- `DELETE /notifications/{id}` — Dismiss notification

**Impact:** 🟠 HIGH — Better UX but can defer to post-launch

---

## 🎬 Action Plan

### This Week (ASAP)

- [ ] Copy the 10 questions above
- [ ] Share with backend team lead
- [ ] Set deadline: answers by **EOW 2026-05-09**

### While Waiting (Parallel Work)

- [ ] Build auth flow & login page (endpoints ready ✅)
- [ ] Build project list skeleton (awaiting Q#5)
- [ ] Build milestone components with mocks (awaiting endpoint)
- [ ] Set up Pinia stores for projects, milestones, payments
- [ ] Create TypeScript types based on assumptions

### Once Answers Arrive

- [ ] Update `docs/api-contracts.md` with confirmed schemas
- [ ] Swap mocks → real API calls
- [ ] Test all workflows

---

**Document owner:** Frontend team  
**Last updated:** 2026-05-07  
**Next review:** When backend delivers milestone/report/payment endpoints or answers Q#1–10
**API Verification:** Live server verified 2026-05-07 — auth, projects, users, roles endpoints confirmed available. Milestones, reports, payments, notifications still pending.
