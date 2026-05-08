# Story 06-02 — Create User (Admin)

**Status:** ready-for-dev  
**Epic:** 06 — Admin Panel & User Management  
**Story ID:** 6.2  
**Priority:** 🟢 HIGH — Unblocks user management workflow  
**Complexity:** Medium  
**Estimated Effort:** 8–10 hours  
**Created:** 2026-05-09  
**Dependencies:** Story 06-01 (Admin user list page — opens this dialog)

---

## 📋 User Story

**As an** admin,  
**I want to** create new user accounts with name, email, role, and optional phone,  
**so that** contractors, engineers, and clients can access the system.

---

## ✅ Acceptance Criteria

### Dialog Behavior

- [ ] Opens as a modal dialog (shadcn-vue `Dialog` component)
- [ ] Title: "إنشاء مستخدم جديد" (Create New User)
- [ ] Size: medium width (`max-w-md` or similar)
- [ ] Opens from "Add user" button in Story 06-01 admin page
- [ ] Can be closed via close icon (top-end) or "إلغاء" (Cancel) button
- [ ] RTL-aware: close icon on end side, buttons laid out correctly for RTL

### Form Fields

**Required:**

1. **Full Name** — Arabic: "الاسم الكامل"
   - `type="text"`, shadcn-vue `Input`
   - Placeholder: "مثال: أحمد محمد علي"
   - Validation: required (non-empty)
   - Show error: "الاسم مطلوب" (Name is required) if empty on submit

2. **Email** — Arabic: "البريد الإلكتروني"
   - `type="email"`, shadcn-vue `Input`
   - Placeholder: "example@mail.com"
   - Validation: required + valid email format
   - **Special case (422 error):** if email already exists in system, show field-level error: "هذا البريد الإلكتروني مستخدم بالفعل" (This email is already in use)
   - This error comes from `POST /users` response on duplicate

3. **Role** — Arabic: "الدور"
   - shadcn-vue `Select` component
   - **Options (do NOT include super_admin or admin):**
     - client (العميل)
     - contractor (المقاول)
     - field_engineer (مهندس الموقع)
     - supervisor_engineer (مهندس المراقبة)
   - Validation: required (must select one)
   - Show error: "يجب اختيار دور" (Role is required) if empty on submit

**Optional:**

4. **Phone** — Arabic: "رقم الهاتف"
   - `type="tel"`, shadcn-vue `Input`
   - Placeholder: "+966 50 123 4567"
   - No validation required if left empty
   - Not shown if empty

### Button Layout (RTL-aware)

- **Cancel button** ("إلغاء") — `ghost` style, positioned on **start side** (left in RTL)
- **Submit button** ("إنشاء المستخدم") — `primary` style, positioned on **end side** (right in RTL)
- Buttons wrapped in `DialogFooter` for consistent alignment

### Submission & API Call

- [ ] On submit: validates all required fields locally first
- [ ] If validation passes: calls `POST /users` with body:
  ```json
  {
    "name": "string",
    "email": "string",
    "phone": "string | null",
    "role": "client | contractor | field_engineer | supervisor_engineer",
    "password": "auto-generated"
  }
  ```
- [ ] **Password note:** Backend auto-generates password and emails user. Frontend does NOT set password.
- [ ] Submit button shows loading state during API call (disabled, text becomes "...جاري" or spinner)
- [ ] Prevent double-submit while request in flight

### Success Response

- [ ] On 201: dialog closes immediately
- [ ] Toast notification shows: "تم إنشاء المستخدم. تم إرسال بيانات الدخول عبر البريد الإلكتروني." (User created. Credentials sent via email.)
- [ ] Parent admin page (Story 06-01) refetches users list automatically
- [ ] New user appears in the table immediately (optimistic update or refetch)

### Error Handling (422 Validation Error)

- [ ] On 422: error response contains field-level errors:
  ```json
  {
    "success": false,
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Validation failed",
      "errors": {
        "email": ["البريد الإلكتروني مستخدم بالفعل"],
        "name": ["الاسم مطلوب"]
      }
    }
  }
  ```
- [ ] Display field errors inline below each input (red text, small font)
- [ ] Focus first field with error
- [ ] Dialog stays open so user can correct errors
- [ ] Clear errors when user starts typing in field

### Error Handling (Network / Server Error)

- [ ] On 400, 500, or network error: show generic toast "حدث خطأ. يرجى المحاولة لاحقاً." (An error occurred. Please try again.)
- [ ] Dialog stays open
- [ ] Submit button returns to normal state (enabled)

### Role-Based Restrictions

- [ ] **Admin user** can create: client, contractor, field_engineer, supervisor_engineer (NOT admin)
- [ ] **Super Admin** can create all roles including admin (separate form or elevated permission — **scope pending**, assume admin for now)
- [ ] Role select dynamically hides `admin` option based on logged-in user's role
- [ ] If `super_admin` role should allow admin creation, add comment `// TODO: separate super_admin path for admin role creation`

### RTL Requirements

- [ ] Dialog title: `text-start`
- [ ] Form labels: `text-start`
- [ ] Button layout: cancel on start, submit on end
- [ ] Input icons (if any): positioned with `inset-inline` not `inset-x`
- [ ] No hardcoded `left`, `right`, `ml-*`, `pl-*`
- [ ] Test in RTL (Arabic) before marking done

### Accessibility

- [ ] Form fields have associated `<label>` elements
- [ ] Error messages linked to fields via `aria-describedby`
- [ ] Submit button disabled during loading, not hidden
- [ ] Focus management: focus moves to first field on open, to first error field on validation failure

---

## 🏗️ Developer Context

### What This Story Does

Story 06-02 is the **user creation interface** that integrates with Story 06-01's admin page:

1. **Dialog component** that opens from "Add user" button
2. **Form validation** — client-side (required, email format) + server-side (422 handling)
3. **API integration** — `POST /users` endpoint with auto-password generation
4. **Error handling** — field-level errors displayed inline
5. **Success feedback** — toast + parent page refetch

**What this story does NOT do:**
- Edit existing users (Story 06-03 will cover reassignment)
- Super admin role creation (explicit scope exclusion; scope pending on whether super_admin gets separate UI)
- Password reset or management

### Previous Story Context

**From Story 06-01 (Admin User List):**
- Admin page already built with "Add user" button that opens a dialog
- `useAdminUsers()` composable fetches and manages user list
- i18n keys for admin section already in place
- `PageHeader` and table components established

**From Story 05-04 (Notification Content):**
- i18n system is fully set up (Arabic primary, English secondary)
- All error messages go through i18n keys at `errors.*` or feature-specific keys
- Form error patterns established in previous stories

**From Story 04-06 (Contractor Withdrawals):**
- Form handling pattern: VeeValidate + Zod for schema validation
- Toast notifications via `useToast()` composable
- Loading states in buttons
- Error message handling from API responses

### Critical Architecture Rules

**From CLAUDE.md §8 — State Management:**

Optimistic updates are NOT required for create operations (no existing item to revert).
Instead:
- Call API
- On success: refetch parent list or emit event to parent
- On error: show toast, keep dialog open for correction

**From CLAUDE.md §5 — API Contract First:**

Before implementing, verify in `docs/api-contracts.md`:
- ✅ `POST /users` endpoint is Available
- Response structure confirmed (201 with user data)
- Error format confirmed (422 with field errors)

**From CLAUDE.md §11 — Never use `v-html` — ever:**

Dialog content is static; no user-generated HTML at risk.

**From CLAUDE.md §9 — i18n mandatory:**

All UI text must use `$t()` in templates:
```vue
<!-- ✅ correct -->
<label>{{ $t('admin.users.create.full_name') }}</label>

<!-- ❌ never — hardcoded text -->
<label>Full Name</label>
```

### Files Being Modified/Created

| File | Status | Purpose |
|------|--------|---------|
| `app/components/admin/CreateUserDialog.vue` | **NEW** | Dialog form component |
| `app/components/admin/CreateUserForm.vue` | **NEW** | Form fields + validation |
| `app/pages/admin/users.vue` | **UPDATE** | Add dialog ref + trigger button |
| `app/composables/useAdminUsers.ts` | **UPDATE** | Add `createUser()` action + refetch trigger |
| `i18n/locales/en.json` | **UPDATE** | Add create user form i18n keys |
| `i18n/locales/ar.json` | **UPDATE** | Arabic translations |
| `shared/types/user.ts` | **UPDATE** | Add CreateUserPayload type if not exists |

### API Contract — POST /users

**Status:** ✅ Available (from api-contracts.md §User Endpoints)

**Endpoint:** `POST /users`

**Request:**
```json
{
  "name": "string (required)",
  "email": "string (required, unique)",
  "phone": "string (optional)",
  "role": "string (required) — client | contractor | field_engineer | supervisor_engineer",
  "password": "string (required, min 8 chars)"
}
```

**Note:** Backend auto-generates password. Frontend generates random string (or sends empty/"auto" and backend handles). **Verify with Laravel team which approach they prefer.**

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

**Error (422 — Validation):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "errors": {
      "email": ["البريد الإلكتروني مستخدم بالفعل"],
      "name": ["الاسم مطلوب"],
      "role": ["الدور مطلوب"]
    }
  }
}
```

**Error (401, 403):**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Unauthorized"
  }
}
```

### i18n Keys Required

**Admin Create User Dialog:**

```json
{
  "admin": {
    "users": {
      "create": {
        "title": "إنشاء مستخدم جديد",
        "full_name": "الاسم الكامل",
        "full_name_placeholder": "مثال: أحمد محمد علي",
        "email": "البريد الإلكتروني",
        "email_placeholder": "example@mail.com",
        "role": "الدور",
        "role_placeholder": "اختر دوراً",
        "phone": "رقم الهاتف (اختياري)",
        "phone_placeholder": "+966 50 123 4567",
        "submit": "إنشاء المستخدم",
        "cancel": "إلغاء"
      }
    }
  },
  "roles": {
    "client": { "label": "عميل" },
    "contractor": { "label": "مقاول" },
    "field_engineer": { "label": "مهندس الموقة" },
    "supervisor_engineer": { "label": "مهندس المراقبة" }
  },
  "errors": {
    "name_required": "الاسم مطلوب",
    "email_required": "البريد الإلكتروني مطلوب",
    "email_invalid": "البريد الإلكتروني غير صحيح",
    "email_exists": "البريد الإلكتروني مستخدم بالفعل",
    "role_required": "الدور مطلوب",
    "user_created": "تم إنشاء المستخدم. تم إرسال بيانات الدخول عبر البريد الإلكتروني.",
    "user_creation_failed": "فشل إنشاء المستخدم. يرجى المحاولة لاحقاً."
  }
}
```

### Form Validation Schema (Zod)

```typescript
import { z } from 'zod'

export const createUserSchema = z.object({
  name: z.string().min(1, 'الاسم مطلوب'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  role: z.enum(['client', 'contractor', 'field_engineer', 'supervisor_engineer']),
  phone: z.string().optional().nullable()
})

export type CreateUserPayload = z.infer<typeof createUserSchema>
```

### Composable Update — useAdminUsers

Add method to existing composable:

```typescript
export function useAdminUsers(roleFilter?: Role | null) {
  // ... existing code ...

  const creating = ref(false)
  const createUserError = ref<Record<string, string[]> | null>(null)

  const createUser = async (payload: CreateUserPayload) => {
    creating.value = true
    createUserError.value = null
    try {
      // Generate random password (16 chars) — backend will override with auto-generated
      const password = Math.random().toString(36).slice(2, 18)
      
      const response = await useApi('/users', {
        method: 'POST',
        body: { ...payload, password }
      })
      
      // Refetch users list to include new user
      await fetchUsers(selectedRole.value === 'all' ? undefined : (selectedRole.value as Role))
      
      return response.data
    } catch (e: any) {
      if (e?.data?.error?.errors) {
        createUserError.value = e.data.error.errors
      }
      throw e
    } finally {
      creating.value = false
    }
  }

  return {
    // ... existing refs ...
    creating: readonly(creating),
    createUserError: readonly(createUserError),
    createUser
  }
}
```

### Component Structure

**`app/components/admin/CreateUserDialog.vue`:**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import CreateUserForm from './CreateUserForm.vue'

interface Props {
  open: boolean
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'success'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const handleSuccess = () => {
  emit('update:open', false)
  emit('success')
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>{{ $t('admin.users.create.title') }}</DialogTitle>
      </DialogHeader>
      <CreateUserForm @success="handleSuccess" />
    </DialogContent>
  </Dialog>
</template>
```

**`app/components/admin/CreateUserForm.vue`:**

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { createUserSchema, type CreateUserPayload } from '~/shared/types/user'
import { useAdminUsers } from '~/composables/useAdminUsers'
import { useToast } from '@/composables/useToast'
import { useAuth } from '~/composables/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Emits = {
  success: []
}

const emit = defineEmits<Emits>()

const { user } = useAuth()
const { createUser, creating } = useAdminUsers()
const { toast } = useToast()

const { values, handleSubmit, errors, setFieldError, isSubmitting } = useForm<CreateUserPayload>({
  validationSchema: toTypedSchema(createUserSchema),
  initialValues: {
    name: '',
    email: '',
    role: undefined,
    phone: ''
  }
})

const availableRoles = computed(() => {
  // Admin cannot create other admins; super_admin can
  const roles = [
    { value: 'client', label: $t('roles.client.label') },
    { value: 'contractor', label: $t('roles.contractor.label') },
    { value: 'field_engineer', label: $t('roles.field_engineer.label') },
    { value: 'supervisor_engineer', label: $t('roles.supervisor_engineer.label') }
  ]
  
  if (user?.role === 'super_admin') {
    roles.push({ value: 'admin', label: $t('roles.admin.label') })
  }
  
  return roles
})

const onSubmit = handleSubmit(async (formValues) => {
  try {
    await createUser(formValues as CreateUserPayload)
    toast({
      title: $t('errors.user_created'),
      duration: 3000
    })
    emit('success')
  } catch (error: any) {
    if (error?.data?.error?.errors) {
      // Set field-level errors from API response
      Object.entries(error.data.error.errors).forEach(([field, messages]) => {
        setFieldError(field, (messages as string[])[0])
      })
    } else {
      toast({
        title: $t('errors.user_creation_failed'),
        variant: 'destructive'
      })
    }
  }
})
</script>

<template>
  <form @submit="onSubmit" class="space-y-4">
    <!-- Full Name -->
    <div class="space-y-1.5">
      <Label for="name">{{ $t('admin.users.create.full_name') }}</Label>
      <Input
        id="name"
        v-model="values.name"
        :placeholder="$t('admin.users.create.full_name_placeholder')"
        :class="{ 'border-destructive': errors.name }"
      />
      <div v-if="errors.name" class="text-xs text-destructive">{{ errors.name }}</div>
    </div>

    <!-- Email -->
    <div class="space-y-1.5">
      <Label for="email">{{ $t('admin.users.create.email') }}</Label>
      <Input
        id="email"
        type="email"
        v-model="values.email"
        :placeholder="$t('admin.users.create.email_placeholder')"
        :class="{ 'border-destructive': errors.email }"
      />
      <div v-if="errors.email" class="text-xs text-destructive">{{ errors.email }}</div>
    </div>

    <!-- Role -->
    <div class="space-y-1.5">
      <Label for="role">{{ $t('admin.users.create.role') }}</Label>
      <Select v-model="values.role">
        <SelectTrigger :class="{ 'border-destructive': errors.role }">
          <SelectValue :placeholder="$t('admin.users.create.role_placeholder')" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="role in availableRoles" :key="role.value" :value="role.value">
            {{ role.label }}
          </SelectItem>
        </SelectContent>
      </Select>
      <div v-if="errors.role" class="text-xs text-destructive">{{ errors.role }}</div>
    </div>

    <!-- Phone (Optional) -->
    <div class="space-y-1.5">
      <Label for="phone">{{ $t('admin.users.create.phone') }}</Label>
      <Input
        id="phone"
        type="tel"
        v-model="values.phone"
        :placeholder="$t('admin.users.create.phone_placeholder')"
      />
    </div>

    <!-- Form Actions -->
    <div class="flex gap-3 pt-4">
      <Button type="button" variant="ghost" class="flex-1" disabled={isSubmitting}>
        {{ $t('admin.users.create.cancel') }}
      </Button>
      <Button
        type="submit"
        class="flex-1"
        :disabled="isSubmitting"
        :loading="creating"
      >
        {{ $t('admin.users.create.submit') }}
      </Button>
    </div>
  </form>
</template>
```

### Dialog Integration in Admin Users Page

Update `app/pages/admin/users.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import CreateUserDialog from '~/components/admin/CreateUserDialog.vue'

const showCreateDialog = ref(false)

const handleUserCreated = () => {
  showCreateDialog.value = false
  // Parent composable refetch happens automatically
}
</script>

<template>
  <div>
    <!-- Page header with "Add User" button -->
    <PageHeader>
      <template #actions>
        <Button @click="showCreateDialog = true">
          {{ $t('admin.users.add_button') }}
        </Button>
      </template>
    </PageHeader>

    <!-- Dialog -->
    <CreateUserDialog
      :open="showCreateDialog"
      @update:open="showCreateDialog = $event"
      @success="handleUserCreated"
    />

    <!-- Rest of page -->
  </div>
</template>
```

### Testing Notes

**Unit tests (Vitest):**
- Mock `useAdminUsers().createUser()` in dialog component tests
- Test form validation: required fields, email format
- Test 422 error handling: field errors displayed inline
- Test success: dialog closes, success event emitted

**E2E tests (Playwright):**
- Admin logs in, navigates to `/admin/users`
- Clicks "Add user" button → dialog opens
- Fills form with valid data
- Submit → new user appears in list
- Try duplicate email → field error shows inline
- Clear error, correct email → submit succeeds

**Manual verification (before code review):**
- [ ] Dialog closes on success
- [ ] Toast shows "User created..." message
- [ ] New user appears in parent admin page
- [ ] RTL tested in Arabic — buttons and labels align correctly
- [ ] No console errors/warnings
- [ ] i18n keys all present in both locales
- [ ] Loading state shows while request in flight

---

## 🔄 Git Intelligence from Previous Stories

**From Story 06-01 (Just completed):**
- Admin page structure established: route, permission checks, list fetching
- `useAdminUsers()` composable pattern solid — add `createUser()` method to existing composable
- i18n admin section already exists — extend with create-specific keys
- Dialog trigger pattern: `ref<boolean>` state, `@click` opens, emit closes

**From Story 05-04 (Notifications):**
- Toast notifications: `const { toast } = useToast()` for feedback
- i18n fully integrated: all user text goes through `$t()`
- Error objects from API have `.data?.error?.errors` structure

**From Story 04-06 (Contractor Withdrawals):**
- Form validation with VeeValidate + Zod: `useForm()`, `toTypedSchema()`, `setFieldError()`
- Loading states: button disabled during request
- Field-level error display: show error message below each input
- API error handling: check for validation errors before showing generic toast

**Established patterns to follow:**
- Composables return readonly refs: `readonly(creating)`
- Forms use Zod schemas for type safety
- All form errors go through `setFieldError()` before rendering
- Dialogs managed via boolean ref in parent, emitted back for close
- Success callbacks refetch parent list automatically (no manual refresh needed)

---

## 📊 Definition of Done — 06-02

Task complete when ALL verified:

### ✅ Behavioral
- [ ] Assumptions stated before implementation
- [ ] No code outside scope of this story
- [ ] Unused imports/variables removed
- [ ] Dialog opens/closes correctly

### ✅ Functional
- [ ] Dialog opens from Story 06-01 "Add user" button
- [ ] Form validates required fields (name, email, role)
- [ ] Email validation: format + unique (422 error handling)
- [ ] Role select excludes admin (unless super_admin user)
- [ ] Phone is optional
- [ ] Submit calls `POST /users` with correct payload
- [ ] Success: dialog closes + toast shows + parent list refetches
- [ ] 422 error: field errors shown inline, dialog stays open
- [ ] Network error: toast shown, dialog stays open
- [ ] Double-submit prevented (button disabled while loading)

### ✅ Quality
- [ ] RTL tested in Arabic — no layout breaks
- [ ] All UI text uses i18n keys (no hardcoded strings)
- [ ] Only logical CSS properties (`ms-*`, `text-start`, etc.)
- [ ] TypeScript — no `any`, strict mode
- [ ] No console errors/warnings
- [ ] Form validation schema (Zod) properly typed
- [ ] Error messages clear and actionable
- [ ] Component tests for form rendering
- [ ] E2E test: admin creates user successfully

### ✅ Architecture
- [ ] API contract matches `docs/api-contracts.md`
- [ ] `createUser()` method in `useAdminUsers()` composable
- [ ] Dialog component separate from form logic
- [ ] Permission check (admin cannot create admin, only super_admin can)
- [ ] All API calls through composable, not direct from component
- [ ] Field errors properly mapped from 422 response

---

## 🚀 Next Steps After This Story

1. **Story 06-03** (Assign Engineers to Project) — Uses created users in dropdown selects
2. **Story 06-04** (Admin Project Overview) — Displays created projects in admin dashboard
3. **Story 06-05** (Admin Dashboard) — Shows new user creation metrics
4. Edit User flow (future) — Reuse form schema, modify endpoint to `PUT /users/{id}`

---

**Stack:** Nuxt 4.x · Vue 3.5.x · Tailwind CSS 4.x · shadcn-vue · Pinia 3.x · VeeValidate + Zod  
**Design Reference:** Epic 06 § Design reference, `docs/design-spec.md` §5 (component primitives)  
**Last Updated:** 2026-05-09 by BMad Story Context Engine
