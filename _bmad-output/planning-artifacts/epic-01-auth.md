# Epic 01 — Authentication & Session Management

> **BMAD context:** This epic covers all auth flows. No self-registration exists.
> All users are created by Admin. Frontend handles login, session, and role-based routing only.
> Read `docs/status-flows.md` and `CLAUDE.md §6` before implementing any story here.

---

## Epic goal

Every user can securely log in, land on the correct dashboard for their role,
and be automatically redirected when their session expires.

---

## Stories

---

### Story 01-01 — Login page

**As a** user added by the admin,
**I want to** log in with my email and password,
**so that** I can access the system with my assigned role.

#### Acceptance criteria

- [ ] Login page renders at `/login` with email + password fields
- [ ] Page uses `auth` layout (no sidebar, centered card)
- [ ] Form validates: email format required, password required
- [ ] On submit: calls `POST /auth/login` via `useApi`
- [ ] On success: token stored in auth store, user redirected to `/dashboard`
- [ ] On 401 error: field-level error "Invalid email or password" — not a toast
- [ ] On network error: toast "Connection error — please try again"
- [ ] Submit button shows loading state during request, disabled to prevent double-submit
- [ ] All strings use i18n keys (`auth.email`, `auth.password`, `auth.login`, etc.)
- [ ] Layout renders correctly in RTL (Arabic) and LTR (English)
- [ ] Password field has show/hide toggle

#### Technical notes
- Use `useAuthStore().login(email, password)` — not direct API call
- Token stored as `httpOnly` cookie or in-memory — discuss with Laravel team
- After login, redirect to the role's default page (see Story 01-03)
- Mock: `app/composables/__mocks__/useAuth.mock.ts` until `POST /auth/login` is available

---

### Story 01-02 — Session persistence & auto-logout

**As a** logged-in user,
**I want** my session to persist across page refreshes,
**so that** I don't have to log in again every time.

**And** I want to be automatically logged out when my session expires,
**so that** my account remains secure.

#### Acceptance criteria

- [ ] On app load: `GET /auth/me` called to validate existing token
- [ ] If valid: user state hydrated, stays on current page
- [ ] If 401: token cleared, redirected to `/login`
- [ ] Auth middleware runs on every protected route navigation
- [ ] `/login` redirects to `/dashboard` if already authenticated
- [ ] When API returns 401 on any request: auto-logout + redirect to `/login`
- [ ] Logout button in topbar calls `POST /auth/logout`, clears store, redirects to `/login`

#### Technical notes
- `useApi` wrapper already handles 401 → logout (see `utils/api.ts`)
- Auth middleware defined in `app/middleware/auth.ts`
- `useAuthStore().init()` called in `app/app.vue` on mount

---

### Story 01-03 — Role-based redirect after login

**As a** user with a specific role,
**I want** to land on the correct dashboard after logging in,
**so that** I immediately see what's relevant to my job.

#### Acceptance criteria

- [ ] After successful login, redirect based on role:
  - `client` → `/projects`
  - `contractor` → `/projects`
  - `field_engineer` → `/assignments`
  - `supervisor_engineer` → `/reviews`
  - `admin` / `super_admin` → `/admin/dashboard`
- [ ] If user navigates to a page their role cannot access → redirect to `/403`
- [ ] `/403` page shows clear message + link back to their home page
- [ ] Role middleware `app/middleware/role.ts` enforces access per route
- [ ] Page meta defines required roles: `definePageMeta({ roles: ['admin'] })`

#### Technical notes

```ts
// app/middleware/role.ts
export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()
  const required = to.meta.roles as string[] | undefined
  if (!required) return
  if (!required.includes(auth.user?.role ?? '')) {
    return navigateTo('/403')
  }
})
```

---

### Story 01-04 — Topbar user menu

**As a** logged-in user,
**I want** to see my name and role in the topbar,
**so that** I know which account I'm using.

#### Acceptance criteria

- [ ] Topbar shows: app logo (start side), page title (center or start), notification bell + avatar (end side)
- [ ] Avatar dropdown shows: user name, role label, divider, logout option
- [ ] Role label uses i18n key (`roles.client`, `roles.contractor`, etc.)
- [ ] Logout clears session and redirects to `/login`
- [ ] Avatar shows user initials if no photo — never broken image
- [ ] All elements align correctly in RTL

---

## Epic done when

- [ ] All 4 stories complete and passing acceptance criteria
- [ ] Auth flow tested for all 6 roles
- [ ] RTL verified for all auth screens
- [ ] Mocks replaced once `POST /auth/login` and `GET /auth/me` are available
