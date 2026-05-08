# Story 06-01 — Admin User List

**Status:** ready-for-dev  
**Epic:** 06 — Admin Panel & User Management  
**Story ID:** 6.1  
**Priority:** 🟢 HIGH — Admin baseline feature; blocks entire Epic 06  
**Complexity:** Medium  
**Estimated Effort:** 10–12 hours  
**Created:** 2026-05-09  
**Dependencies:** Story 01-04 (auth/topbar established), default layout working

---

## 📋 User Story

**As an** admin,  
**I want to** see all users in the system with their roles and status,  
**so that** I can manage who has access and maintain system governance.

---

## ✅ Acceptance Criteria

### Route & Access Control

- [ ] Route: `/admin/users` — accessible to `admin` and `super_admin` roles only
- [ ] Non-admin users see 403 page (already implemented from Story 01-03)
- [ ] Uses `admin` layout (no separate layout needed; default layout with admin sidebar)

### Page Header & Layout

- [ ] `PageHeader` component:
  - Title: "المستخدمون" (Users)
  - Primary button: "إضافة مستخدم" (Add User) — end-aligned, opens Story 06-02 dialog
- [ ] Filter tabs below header:
  - Tabs: "الكل" | "المقاولون" | "المهندسون" | "العملاء" | "الإداريون"
  - Default: "الكل" (All)
  - Tabs filter: `all` | `contractor` | `field_engineer` | `supervisor_engineer` | `client` | `admin`
  - Note: Super Admin cannot filter by admin — they see all roles

### User Table

**Columns (all `text-start` for RTL):**

1. **Name** — User full name (bold)
2. **Email** — Email address (secondary text)
3. **Role** — Role badge using `Pill` component (i18n-localized role label)
4. **Status** — active/inactive status pill
   - `active` → primary tone
   - `inactive` → muted tone
5. **Created Date** — Relative date (e.g., "2 weeks ago")
6. **Actions** — `DropdownMenu` with:
   - "تحرير" (Edit) — triggers Story 06-02 edit dialog
   - "إلغاء تفعيل" (Deactivate) if `status === active` — toggles to inactive
   - "تفعيل" (Activate) if `status === inactive` — toggles to active

**Table styling:**
- Component: shadcn-vue `Table`
- Header row: `bg-muted/50` background
- Body rows: alternate background, hover effect
- All cells: `p-4`, `text-sm`
- Responsive: horizontal scroll on mobile (use `overflow-x-auto` wrapper)

### Loading State

- **Skeleton table:** 5 rows of `Skeleton` components while `loading === true`
- Skeleton row height: match real row height
- Show skeleton until API returns first batch

### Empty State

- When filtered results are empty (after API returns but no users match filter):
  - Centered card: icon + "لا توجد مستخدمون بهذا الدور" (No users with this role)
  - Shows below filter tabs
  - Does NOT show during loading

### Filter Behavior

- [ ] Clicking a tab updates `selectedRole` state
- [ ] Table refetches with `?role=<role>` query param (if role !== 'all')
- [ ] Active tab highlighted (primary color)
- [ ] Tab count badge: show user count for each role (optional but nice-to-have)

### RTL Requirements

- [ ] Tabs: logical spacing `gap-x-2` not `gap-2`
- [ ] DropdownMenu: aligns to start side (left in RTL, right in LTR)
- [ ] Table text: all `text-start`
- [ ] Page header button: `me-*` not `mr-*`
- [ ] No hardcoded `left`, `right`, `ml-*`, `pl-*`
- [ ] Test in RTL (Arabic) before marking done

---

## 🏗️ Developer Context

### What This Story Does

Story 06-01 is the **entry point to admin management**. It establishes:

1. **Admin route** (`/admin/users`) with role-based access control
2. **User data fetching** — paginated or full list from backend
3. **Filter tabs** — client-side or server-side filtering by role
4. **User table** with actions (edit, activate/deactivate)
5. **Foundation** for Story 06-02 (create/edit user dialog integration)

**What this story does NOT do:**
- User creation/editing (Story 06-02)
- Engineer assignment to projects (Story 06-03)
- Admin dashboard (Story 06-05)

### Previous Story Context

**From Story 05-04 (Notification Content):**
- i18n system is fully set up (Arabic/English)
- All state composables follow the pattern: `const { data, loading, error } = useXXX()`
- Role labels are i18n'd at `roles.<role>.label` (e.g., `roles.contractor.label`)

**From Story 01-04 (Topbar User Menu):**
- Auth composable is solid: `useAuth()` provides `user`, `can()`, permissions
- Topbar shell is complete with NotificationBell
- Role-based routing already enforces access control

### Critical Architecture Rules

**From CLAUDE.md §6 — 6 roles exist, never hardcode:**

```typescript
type Role = 'super_admin' | 'admin' | 'client' | 'contractor' | 'field_engineer' | 'supervisor_engineer'

// ✅ correct
const roles = ['client', 'contractor', 'field_engineer', 'supervisor_engineer'] // admin users cannot see in filter

// ❌ never
const roleLabel = user.role === 'contractor' ? 'المقاول' : '...';  // Use i18n instead
```

**From CLAUDE.md §8 — API calls through composables only:**

```typescript
// ✅ correct
const { users, loading } = useAdminUsers(selectedRole)
// users is reactive, loading is reactive, component just consumes

// ❌ never
const users = await $fetch('/admin/users') // Direct API call from component
```

**From CLAUDE.md §5 — API contract first:**
Before implementing, verify in `docs/api-contracts.md`:
- `GET /admin/users` endpoint is ✅ Available
- Response structure (success/error format)
- Query params (role filter, pagination)

### Files Being Modified/Created

| File | Status | Purpose |
|------|--------|---------|
| `app/pages/admin/users.vue` | **NEW** | Main user list page |
| `app/components/admin/UserTable.vue` | **NEW** | Table component |
| `app/components/admin/UserActionMenu.vue` | **NEW** | Dropdown actions menu |
| `app/composables/useAdminUsers.ts` | **NEW** | User data fetching + filtering |
| `app/layouts/admin.vue` | **REVIEW** | Ensure role check works (may already exist) |
| `i18n/locales/en.json` | **UPDATE** | Add i18n keys for admin user list |
| `i18n/locales/ar.json` | **UPDATE** | Arabic translations |
| `docs/api-contracts.md` | **UPDATE** | Document `/admin/users` contract |

### API Contract (From Design Reference §6.1)

**Endpoint:** `GET /admin/users?role=<role>`

**Query Params:**
- `role` (optional): Filter by role — `contractor`, `field_engineer`, `supervisor_engineer`, `client`, `admin`
- If omitted or `role=all`: return all users
- Support pagination if backend returns many users

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "user-123",
      "name": "أحمد محمد",
      "email": "ahmad@example.com",
      "phone": "966501234567",
      "role": "contractor",
      "status": "active",
      "created_at": "2026-03-15T10:30:00Z",
      "updated_at": "2026-05-08T14:22:00Z"
    },
    ...
  ],
  "meta": {
    "total": 45,
    "per_page": 50,
    "current_page": 1
  }
}
```

**Error (401, 403):**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**Until endpoint is available:** Mock using `app/composables/__mocks__/admin-users.ts` with 15–20 users across all 6 roles.

### i18n Keys Required

**Admin User List specific:**

```json
{
  "admin": {
    "users": {
      "title": "المستخدمون",
      "add_button": "إضافة مستخدم",
      "filter_all": "الكل",
      "filter_contractors": "المقاولون",
      "filter_engineers": "المهندسون",
      "filter_clients": "العملاء",
      "filter_admins": "الإداريون",
      "table": {
        "name": "الاسم",
        "email": "البريد الإلكتروني",
        "role": "الدور",
        "status": "الحالة",
        "created": "تاريخ الإنشاء",
        "actions": "الإجراءات"
      },
      "actions": {
        "edit": "تحرير",
        "activate": "تفعيل",
        "deactivate": "إلغاء تفعيل"
      },
      "status": {
        "active": "نشط",
        "inactive": "غير نشط"
      },
      "empty_state": "لا توجد مستخدمون بهذا الدور"
    }
  },
  "roles": {
    "super_admin": { "label": "مسؤول النظام" },
    "admin": { "label": "مسؤول" },
    "client": { "label": "عميل" },
    "contractor": { "label": "مقاول" },
    "field_engineer": { "label": "مهندس الموقع" },
    "supervisor_engineer": { "label": "مهندس المراقبة" }
  }
}
```

### Composable Structure

**`app/composables/useAdminUsers.ts`:**

```typescript
interface User {
  id: string
  name: string
  email: string
  phone: string | null
  role: Role
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export function useAdminUsers(roleFilter?: Role | null) {
  const users = ref<User[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const selectedRole = ref<Role | 'all'>('all')

  const fetchUsers = async (role?: Role | null) => {
    loading.value = true
    error.value = null
    try {
      const params = role ? { role } : {}
      const response = await useApi('/admin/users', { params })
      users.value = response.data
    } catch (e) {
      error.value = e?.message || 'Failed to fetch users'
      users.value = []
    } finally {
      loading.value = false
    }
  }

  // Fetch on mount
  onMounted(() => fetchUsers(roleFilter))

  // Watch for role changes
  watch(selectedRole, (newRole) => {
    if (newRole === 'all') {
      fetchUsers()
    } else {
      fetchUsers(newRole as Role)
    }
  })

  return {
    users: readonly(users),
    loading: readonly(loading),
    error: readonly(error),
    selectedRole,
    refetch: fetchUsers
  }
}
```

### Component Structure

**`app/pages/admin/users.vue`:**

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useAdminUsers } from '~/composables/useAdminUsers'
import { usePermission } from '~/composables/usePermission'

const { can } = usePermission()
// Ensure access
if (!can('view_admin_panel')) navigateTo('/403')

const { users, loading, selectedRole } = useAdminUsers()
const emptyState = computed(() => users.value.length === 0 && !loading.value)
</script>

<template>
  <div>
    <!-- PageHeader with Add User button -->
    <!-- Filter tabs -->
    <!-- Skeleton or Table or Empty State -->
  </div>
</template>
```

### No New Admin Layout Needed

The existing `app/layouts/default.vue` or `admin.vue` (if created) handles:
- Sidebar navigation with admin nav items
- Topbar with user menu + notifications
- 403 redirect for non-admin users

This story focuses only on the **users page content**, not layout infrastructure.

### Testing Notes

**Unit tests (Vitest):**
- Mock `useAdminUsers` in component tests
- Test role filter changes trigger refetch
- Test empty state appears when users = []
- Test skeleton shows when loading = true

**E2E tests (Playwright):**
- Admin logs in, navigates to `/admin/users`
- Non-admin tries `/admin/users` → sees 403
- Filter tabs work: click "المقاولون" → table updates
- Table rows display correct data from mock/API
- Actions dropdown opens/closes

**Manual verification (before code review):**
- [ ] RTL layout verified in Arabic
- [ ] Responsive: table scrolls on mobile
- [ ] Skeleton and empty state both visible
- [ ] i18n keys all present in both locales
- [ ] No console errors/warnings

---

## 🔄 Git Intelligence from Previous Stories

**From Story 05-04 (Last completed):**
- i18n patterns are rock-solid: always use `$t()` in templates
- Composable async patterns: use `ref` for reactive state, watch for changes
- No direct API calls from components — always wrap in composables

**From Story 04-06 (Admin context new):**
- Admin features use same composable pattern as contractor features
- Table components render backend data directly (no transformation)
- Filter state manages via simple `selectedRole: ref`

**Established patterns to follow:**
- All composables return reactive refs wrapped in `readonly()`
- Loading states use `Skeleton` component (not spinners)
- Empty states are conditional components (not hardcoded)
- All user-facing text through i18n keys

---

## 📊 Definition of Done — 06-01

Task complete when ALL verified:

### ✅ Behavioral
- [ ] Assumptions stated before implementation
- [ ] No code outside scope of this story
- [ ] Unused imports/variables removed

### ✅ Functional
- [ ] Route `/admin/users` accessible to admin/super_admin only
- [ ] Table displays users with all 6 columns
- [ ] Filter tabs: click changes role filter + refetches
- [ ] Actions dropdown: Edit → opens Create User dialog (05-02 prep)
- [ ] Actions dropdown: Deactivate/Activate → calls API, updates UI optimistically
- [ ] Skeleton shows while loading, empty state when no results
- [ ] Mock works when API endpoint unavailable

### ✅ Quality
- [ ] RTL tested in Arabic — no layout breaks
- [ ] All UI text uses i18n keys (no hardcoded strings)
- [ ] Only logical CSS properties (`ms-*`, `text-start`, etc.)
- [ ] TypeScript — no `any`, strict mode
- [ ] No console errors/warnings
- [ ] Component tests for user list rendering
- [ ] E2E test: admin can view users, filter works

### ✅ Architecture
- [ ] API contract documented in `docs/api-contracts.md`
- [ ] `useAdminUsers()` composable follows established pattern
- [ ] Permission check in component (can't access if not admin)
- [ ] Composable handles data fetching, component renders only

---

## 🚀 Next Steps After This Story

1. **Story 06-02** (Create User) — Opens from "Add User" button; handles form submission
2. **Story 06-03** (Assign Engineers) — Uses user list to populate engineer dropdowns
3. **Story 06-04** (Admin Project Overview) — Similar table + filtering pattern
4. **Story 06-05** (Admin Dashboard) — Displays urgent action banners using user/project data

---

**Stack:** Nuxt 4.x · Vue 3.5.x · Tailwind CSS 4.x · shadcn-vue · Pinia 3.x · VeeValidate + Zod  
**Design Reference:** Epic 06 § Design reference + `docs/design-spec.md` §6.5 (Admin sidebar nav)  
**Last Updated:** 2026-05-09 by BMad Story Context Engine
