# coding-standards.md — TAMM Frontend

> This document defines **how** code is written in TAMM.
> Every pattern here is a rule, not a suggestion.
> Claude Code reads this before writing any component, composable, store, or utility.

---

## 1. TypeScript rules

### Strict mode — always on

```ts
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### Never use `any`

```ts
// ❌ never
const data: any = await useApi('/projects')
function handle(payload: any) {}

// ✅ always type explicitly or use unknown + type guard
const data: Project[] = await useApi('/projects')
function handle(payload: unknown) {
  if (isProject(payload)) { ... }
}
```

### Type all props, emits, and function signatures

```ts
// ✅ correct
interface Props {
  milestoneId: string
  status: MilestoneStatus
  isLoading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  approve: [id: string]
  reject: [id: string, reason: string]
}>()
```

### Use `shared/types/` for domain types

All domain types live in `shared/types/` so they are shared between app code and server code.

```ts
// shared/types/milestone.ts
export type MilestoneStatus =
  | 'not_started'
  | 'in_progress'
  | 'under_review'
  | 'supervisor_approved'
  | 'approved'
  | 'rejected'

export interface Milestone {
  id: string
  projectId: string
  title: string
  status: MilestoneStatus
  amount: number
  allowedActions: MilestoneAction[]
  createdAt: string
  updatedAt: string
}

export type MilestoneAction =
  | 'submit_report'
  | 'approve_supervisor'
  | 'approve_client'
  | 'reject'
  | 'request_payment'
```

### Prefer type unions over enums

```ts
// ✅ union types — simpler, serializable, no runtime artifact
type UserRole = 'super_admin' | 'admin' | 'client' | 'contractor' | 'field_engineer' | 'supervisor_engineer'

// ❌ avoid enums
enum UserRole { SuperAdmin = 'super_admin', ... }
```

---

## 2. Vue component rules

### Always `<script setup lang="ts">`

```vue
<!-- ✅ correct -->
<script setup lang="ts">
...
</script>

<!-- ❌ never -->
<script lang="ts">
export default defineComponent({ ... })
</script>
```

### Script section order — always follow this

```vue
<script setup lang="ts">
// ── 1. External imports ────────────────────────────────
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '~/components/ui/button'
import { canTransition } from '~/utils/statusMachine'
import type { Milestone } from '~/shared/types/milestone'

// ── 2. Props & emits ───────────────────────────────────
interface Props {
  milestone: Milestone
  isLoading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  approve: [id: string]
  reject: [id: string, reason: string]
}>()

// ── 3. Stores ──────────────────────────────────────────
const milestoneStore = useMilestonesStore()

// ── 4. Composables ─────────────────────────────────────
const { t } = useI18n()
const { can } = usePermission()

// ── 5. Local state ─────────────────────────────────────
const isSubmitting = ref(false)

// ── 6. Computed ────────────────────────────────────────
const canApprove = computed(
  () =>
    can('approve_milestone') &&
    canTransition(props.milestone.status, 'supervisor_approved')
)

// ── 7. Methods ─────────────────────────────────────────
async function handleApprove() {
  if (!canApprove.value || isSubmitting.value) return
  isSubmitting.value = true
  try {
    await milestoneStore.approve(props.milestone.id)
    emit('approve', props.milestone.id)
  } finally {
    isSubmitting.value = false
  }
}

// ── 8. Lifecycle (use sparingly) ───────────────────────
// prefer useAsyncData over onMounted for data fetching
</script>
```

### Template rules

```vue
<template>
  <!-- ✅ single root element -->
  <div>
    <!-- ✅ v-if / v-else on sibling elements — use template wrapper -->
    <template v-if="isLoading">
      <Skeleton class="h-10 w-full" />
    </template>
    <template v-else>
      <MilestoneCard :milestone="milestone" />
    </template>

    <!-- ✅ v-for always has :key — never use index as key for dynamic lists -->
    <MilestoneCard
      v-for="milestone in milestones"
      :key="milestone.id"
      :milestone="milestone"
    />

    <!-- ✅ event handlers — methods only, no inline logic -->
    <Button @click="handleApprove" :disabled="!canApprove || isSubmitting">
      {{ t('milestone.approve') }}
    </Button>

    <!-- ❌ never — inline logic in template -->
    <!-- <Button @click="store.milestones.find(m => m.id === id).status = 'approved'"> -->

    <!-- ❌ never — v-html -->
    <!-- <div v-html="content" /> -->
  </div>
</template>
```

### Prop naming — camelCase in script, kebab-case in template

```vue
<!-- ✅ correct -->
<MilestoneCard :milestone-id="id" :is-loading="loading" />

<!-- defineProps uses camelCase -->
const props = defineProps<{ milestoneId: string; isLoading: boolean }>()
```

---

## 3. Composable rules

### One composable = one concern

```ts
// ✅ correct — focused
// app/composables/useMilestones.ts
export function useMilestones(projectId: MaybeRef<string>) { ... }

// ❌ never — mixing concerns
// app/composables/useProjectsAndMilestonesAndPayments.ts
```

### Always return a typed object — never a tuple

```ts
// ✅ correct — named returns, easy to use
export function useMilestones(projectId: MaybeRef<string>) {
  const store = useMilestonesStore()
  const { t } = useI18n()

  const milestones = computed(() => store.byProject(toValue(projectId)))
  const isLoading = ref(false)

  async function approve(milestoneId: string) { ... }
  async function reject(milestoneId: string, reason: string) { ... }

  return { milestones, isLoading, approve, reject }
}

// ❌ never — tuple (hard to extend, hard to read)
return [milestones, isLoading, approve, reject]
```

### Mock pattern for missing API endpoints

When a backend endpoint doesn't exist yet, create a mock composable:

```ts
// app/composables/__mocks__/useMilestones.mock.ts
// TODO: replace mock when endpoint available — GET /projects/:id/milestones

import type { Milestone } from '~/shared/types/milestone'

const MOCK_MILESTONES: Milestone[] = [
  {
    id: 'mock-1',
    projectId: 'proj-1',
    title: 'Foundation work',
    status: 'in_progress',
    amount: 50000,
    allowedActions: ['submit_report'],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
]

export function useMilestonesMock(projectId: MaybeRef<string>) {
  const milestones = ref<Milestone[]>(MOCK_MILESTONES)
  const isLoading = ref(false)

  async function approve(milestoneId: string) {
    const m = milestones.value.find(m => m.id === milestoneId)
    if (m) m.status = 'supervisor_approved'
  }

  return { milestones, isLoading, approve }
}
```

The real composable imports from the mock until the endpoint is ready:

```ts
// app/composables/useMilestones.ts
// TODO: remove mock import when endpoint available — GET /projects/:id/milestones
import { useMilestonesMock } from './__mocks__/useMilestones.mock'

export const useMilestones = useMilestonesMock
// ↑ replace this line with real implementation when API is ready
```

---

## 4. Pinia store rules

### Store structure — always follow this shape

```ts
// stores/milestones.ts
import { defineStore } from 'pinia'
import type { Milestone, MilestoneStatus } from '~/shared/types/milestone'

interface MilestonesState {
  items: Record<string, Milestone> // keyed by id for O(1) lookup
  loading: Record<string, boolean> // per-item loading state
  error: string | null
}

export const useMilestonesStore = defineStore('milestones', {
  state: (): MilestonesState => ({
    items: {},
    loading: {},
    error: null,
  }),

  getters: {
    // ✅ computed from state — never duplicate data
    byProject: state => (projectId: string) =>
      Object.values(state.items).filter(m => m.projectId === projectId),

    getById:
      state =>
      (id: string): Milestone | undefined =>
        state.items[id],
  },

  actions: {
    // ✅ all mutations go through actions
    setStatus(id: string, status: MilestoneStatus) {
      if (this.items[id]) {
        this.items[id].status = status
      }
    },

    upsert(milestone: Milestone) {
      this.items[milestone.id] = milestone
    },

    upsertMany(milestones: Milestone[]) {
      milestones.forEach(m => {
        this.items[m.id] = m
      })
    },
  },
})
```

### Never mutate store state from a component

```ts
// ✅ correct — through an action
milestoneStore.setStatus(id, 'approved')

// ❌ never — direct mutation from component
milestoneStore.items[id].status = 'approved'
```

### Items stored as Record for O(1) lookup

```ts
// ✅ correct — Record<id, item> enables O(1) access
state: { items: Record<string, Milestone> }
store.items[id]  // instant

// ❌ avoid for large lists — O(n) lookup
state: { items: Milestone[] }
store.items.find(m => m.id === id)  // scans array
```

---

## 5. API utility — `utils/api.ts`

This is the single entry point for all API communication.

```ts
// utils/api.ts
import { navigateTo } from '#app'

interface ApiOptions extends RequestInit {
  params?: Record<string, string | number | boolean>
}

export async function useApi<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<{ data: T; message?: string }> {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const url = new URL(endpoint, config.public.apiBase)
  if (options.params) {
    Object.entries(options.params).forEach(([k, v]) =>
      url.searchParams.set(k, String(v))
    )
  }

  try {
    const response = await $fetch<{ data: T; message?: string }>(
      url.toString(),
      {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'Accept-Language': useI18n().locale.value,
          ...(authStore.token && {
            Authorization: `Bearer ${authStore.token}`,
          }),
          ...options.headers,
        },
      }
    )
    return response
  } catch (error: unknown) {
    if (isApiError(error) && error.status === 401) {
      authStore.logout()
      await navigateTo('/login')
    }
    throw normalizeApiError(error)
  }
}

interface ApiError {
  message: string
  errors?: Record<string, string[]>
  status?: number
}

function isApiError(e: unknown): e is { status: number } {
  return typeof e === 'object' && e !== null && 'status' in e
}

function normalizeApiError(error: unknown): ApiError {
  if (isApiError(error) && 'data' in error) {
    const data = (error as { data: ApiError }).data
    return {
      message: data.message,
      errors: data.errors,
      status: (error as { status: number }).status,
    }
  }
  return { message: 'An unexpected error occurred' }
}
```

---

## 6. Status machine — `utils/statusMachine.ts`

Single source of truth for all valid state transitions.

```ts
// utils/statusMachine.ts
import type { MilestoneStatus } from '~/shared/types/milestone'
import type { PaymentStatus } from '~/shared/types/payment'
import type { ProjectStatus } from '~/shared/types/project'
import type { ReportStatus } from '~/shared/types/report'

// ── Milestone ──────────────────────────────────────────────────────────────
export const MILESTONE_TRANSITIONS: Record<MilestoneStatus, MilestoneStatus[]> =
  {
    not_started: ['in_progress'],
    in_progress: ['under_review'],
    under_review: ['supervisor_approved', 'rejected'],
    supervisor_approved: ['approved', 'rejected'],
    rejected: ['in_progress'], // never terminal — always bounces back
    approved: [], // terminal
  }

// ── Project ────────────────────────────────────────────────────────────────
export const PROJECT_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  new: ['active'],
  active: ['completed', 'on_hold'],
  on_hold: ['active'],
  completed: [], // terminal
}

// ── Report ─────────────────────────────────────────────────────────────────
export const REPORT_TRANSITIONS: Record<ReportStatus, ReportStatus[]> = {
  draft: ['submitted'],
  submitted: ['under_review'],
  under_review: [], // terminal (outcome drives milestone, not report)
}

// ── Payment ────────────────────────────────────────────────────────────────
// Payment status is DERIVED from milestone — treat as read-only in the frontend
export const PAYMENT_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  pending_payment: ['paid'],
  paid: ['awaiting_approval'],
  awaiting_approval: ['ready_for_payout'],
  ready_for_payout: ['paid_out'],
  paid_out: [], // terminal
}

// ── Shared validator ───────────────────────────────────────────────────────
type AnyStatus = MilestoneStatus | ProjectStatus | ReportStatus | PaymentStatus
type TransitionMap = Record<string, string[]>

function canTransitionWith(
  map: TransitionMap,
  from: string,
  to: string
): boolean {
  return map[from]?.includes(to) ?? false
}

export function canTransition(
  type: 'milestone' | 'project' | 'report' | 'payment',
  from: AnyStatus,
  to: AnyStatus
): boolean {
  const maps: Record<string, TransitionMap> = {
    milestone: MILESTONE_TRANSITIONS,
    project: PROJECT_TRANSITIONS,
    report: REPORT_TRANSITIONS,
    payment: PAYMENT_TRANSITIONS,
  }
  return canTransitionWith(maps[type], from, to)
}

// ── Status metadata (for UI rendering) ────────────────────────────────────
export type StatusVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'destructive'
  | 'outline'

export const MILESTONE_STATUS_META: Record<
  MilestoneStatus,
  {
    labelKey: string // i18n key
    variant: StatusVariant
  }
> = {
  not_started: { labelKey: 'status.milestone.not_started', variant: 'outline' },
  in_progress: { labelKey: 'status.milestone.in_progress', variant: 'default' },
  under_review: {
    labelKey: 'status.milestone.under_review',
    variant: 'warning',
  },
  supervisor_approved: {
    labelKey: 'status.milestone.supervisor_approved',
    variant: 'warning',
  },
  approved: { labelKey: 'status.milestone.approved', variant: 'success' },
  rejected: { labelKey: 'status.milestone.rejected', variant: 'destructive' },
}

export const PAYMENT_STATUS_META: Record<
  PaymentStatus,
  {
    labelKey: string
    variant: StatusVariant
  }
> = {
  pending_payment: { labelKey: 'status.payment.pending', variant: 'outline' },
  paid: { labelKey: 'status.payment.paid', variant: 'default' },
  awaiting_approval: {
    labelKey: 'status.payment.awaiting_approval',
    variant: 'warning',
  },
  ready_for_payout: {
    labelKey: 'status.payment.ready_for_payout',
    variant: 'warning',
  },
  paid_out: { labelKey: 'status.payment.paid_out', variant: 'success' },
}
```

---

## 7. Permission system — `utils/permissions.ts` + `usePermission.ts`

```ts
// utils/permissions.ts
import type { UserRole } from '~/shared/types/user'

// Maps each action to the roles that can perform it
export const ROLE_PERMISSIONS: Record<string, UserRole[]> = {
  // Projects
  create_project: ['client', 'admin', 'super_admin'],
  view_project: [
    'client',
    'contractor',
    'field_engineer',
    'supervisor_engineer',
    'admin',
    'super_admin',
  ],
  manage_all_projects: ['admin', 'super_admin'],

  // Milestones
  submit_report: ['field_engineer'],
  approve_milestone_supervisor: ['supervisor_engineer'],
  approve_milestone_client: ['client'],
  reject_milestone: ['supervisor_engineer', 'client'],

  // Payments
  pay_milestone: ['client'],
  release_payment: ['admin', 'super_admin'],

  // Users
  manage_users: ['admin', 'super_admin'],
  view_all_users: ['admin', 'super_admin'],
}

export function hasPermission(role: UserRole, action: string): boolean {
  return ROLE_PERMISSIONS[action]?.includes(role) ?? false
}
```

```ts
// app/composables/usePermission.ts
import { hasPermission } from '~/utils/permissions'
import type { UserRole } from '~/shared/types/user'

export function usePermission() {
  const authStore = useAuthStore()

  // Primary check: use allowed_actions from API response (most accurate)
  // Fallback: derive from role (used before API responds)
  function can(action: string, allowedActions?: string[]): boolean {
    if (allowedActions) {
      return allowedActions.includes(action)
    }
    const role = authStore.user?.role as UserRole | undefined
    if (!role) return false
    return hasPermission(role, action)
  }

  return { can }
}
```

**Usage in components:**

```vue
<script setup lang="ts">
const { can } = usePermission()
// passing allowedActions from API response is most accurate
const canApprove = computed(() =>
  can('approve_milestone_supervisor', milestone.value.allowedActions)
)
</script>

<template>
  <Button v-if="canApprove" @click="handleApprove">
    {{ t('milestone.approve') }}
  </Button>
</template>
```

---

## 8. Form patterns — VeeValidate + Zod

```vue
<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'

// ── 1. Define schema ───────────────────────────────────
const schema = z.object({
  title: z.string().min(3, { message: 'validation.title_min' }),
  amount: z.number().positive({ message: 'validation.amount_positive' }),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

// ── 2. Initialize form ─────────────────────────────────
const { handleSubmit, setErrors } = useForm<FormValues>({
  validationSchema: toTypedSchema(schema),
})

// ── 3. Submit handler ──────────────────────────────────
const onSubmit = handleSubmit(async values => {
  try {
    await milestoneStore.create(values)
    emit('success')
  } catch (error) {
    // Map API field errors → VeeValidate field errors
    if (error.errors) {
      setErrors(error.errors) // { title: ['Title is required'] }
    }
  }
})
</script>

<template>
  <form @submit="onSubmit">
    <FormField name="title" v-slot="{ componentField }">
      <FormItem>
        <FormLabel>{{ t('milestone.title') }}</FormLabel>
        <FormControl>
          <Input v-bind="componentField" />
        </FormControl>
        <FormMessage />
        <!-- shows validation error -->
      </FormItem>
    </FormField>

    <Button type="submit">{{ t('common.save') }}</Button>
  </form>
</template>
```

---

## 9. Data fetching patterns

### Server-side data (pages)

```vue
<!-- app/pages/projects/[id]/index.vue -->
<script setup lang="ts">
const route = useRoute()

// ✅ useAsyncData — server-side, cached, shared key
const {
  data: project,
  pending,
  error,
} = await useAsyncData(
  `project-${route.params.id}`,
  () => useApi<Project>(`/projects/${route.params.id}`).then(r => r.data),
  { lazy: false } // block navigation until data is ready for critical pages
)

// ✅ lazy: true for non-critical sections — page loads immediately, data fills in
const { data: activity } = await useAsyncData(
  `project-activity-${route.params.id}`,
  () =>
    useApi<Activity[]>(`/projects/${route.params.id}/activity`).then(
      r => r.data
    ),
  { lazy: true }
)
</script>

<template>
  <div v-if="pending">
    <ProjectHeaderSkeleton />
  </div>
  <div v-else-if="error">
    <ErrorState :message="t('errors.load_failed')" />
  </div>
  <div v-else>
    <ProjectHeader :project="project" />
  </div>
</template>
```

### Client-side mutations (actions)

```ts
// Always: optimistic update → API call → rollback on failure
async function approve(milestoneId: string) {
  const milestone = store.getById(milestoneId)
  if (!milestone) return

  if (!canTransition('milestone', milestone.status, 'supervisor_approved')) {
    notify.error(t('errors.invalid_transition'))
    return
  }

  const previousStatus = milestone.status
  store.setStatus(milestoneId, 'supervisor_approved') // optimistic

  try {
    const { data } = await useApi<Milestone>(
      `/milestones/${milestoneId}/approve`,
      { method: 'POST' }
    )
    store.upsert(data) // sync with server truth
  } catch (error) {
    store.setStatus(milestoneId, previousStatus) // rollback
    notify.error(t('errors.approval_failed'))
  }
}
```

---

## 10. Tailwind v4 usage rules

### CSS-first configuration

```css
/* app/assets/css/main.css — the only place for design tokens */
@import 'tailwindcss';

@theme {
  /* Brand colors */
  --color-brand-50: oklch(0.97 0.015 250);
  --color-brand-100: oklch(0.93 0.03 250);
  --color-brand-500: oklch(0.55 0.2 250);
  --color-brand-600: oklch(0.47 0.18 250);
  --color-brand-900: oklch(0.25 0.1 250);

  /* Status colors */
  --color-status-approved: oklch(0.55 0.15 145);
  --color-status-rejected: oklch(0.55 0.18 25);
  --color-status-review: oklch(0.72 0.16 85);
  --color-status-pending: oklch(0.6 0 0);

  /* Typography */
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;

  /* Spacing overrides if needed */
  --spacing-18: 4.5rem;
}
```

### RTL — logical properties only

| Use this      | Never this    | CSS property           |
| ------------- | ------------- | ---------------------- |
| `ms-*`        | `ml-*`        | `margin-inline-start`  |
| `me-*`        | `mr-*`        | `margin-inline-end`    |
| `ps-*`        | `pl-*`        | `padding-inline-start` |
| `pe-*`        | `pr-*`        | `padding-inline-end`   |
| `border-s-*`  | `border-l-*`  | `border-inline-start`  |
| `border-e-*`  | `border-r-*`  | `border-inline-end`    |
| `start-*`     | `left-*`      | `inset-inline-start`   |
| `end-*`       | `right-*`     | `inset-inline-end`     |
| `rounded-s-*` | `rounded-l-*` | `border-start-radius`  |
| `text-start`  | `text-left`   | `text-align: start`    |

### Class merging — always use `cn()`

```ts
// app/lib/utils.ts (auto-generated by shadcn-vue CLI)
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

```vue
<!-- ✅ correct — cn() prevents class conflicts -->
<div :class="cn('rounded-lg border p-4', props.class, isActive && 'border-brand-500')">

<!-- ❌ never — raw string concatenation causes Tailwind conflicts -->
<div :class="`rounded-lg border p-4 ${props.class}`">
```

---

## 11. i18n rules

### File structure

```
i18n/
├── ar.json   ← Arabic (default, RTL)
└── en.json   ← English (LTR)
```

### Key naming — always dot-separated namespaces

```json
// i18n/ar.json
{
  "common": {
    "save": "حفظ",
    "cancel": "إلغاء",
    "loading": "جار التحميل...",
    "error": "حدث خطأ"
  },
  "milestone": {
    "approve": "اعتماد المرحلة",
    "reject": "رفض المرحلة",
    "title": "عنوان المرحلة"
  },
  "status": {
    "milestone": {
      "not_started": "لم تبدأ",
      "in_progress": "قيد التنفيذ",
      "under_review": "قيد المراجعة",
      "supervisor_approved": "معتمدة من المشرف",
      "approved": "معتمدة",
      "rejected": "مرفوضة"
    },
    "payment": {
      "pending_payment": "في انتظار الدفع",
      "paid": "مدفوع",
      "awaiting_approval": "قيد الانتظار",
      "ready_for_payout": "جاهز للصرف",
      "paid_out": "تم الصرف"
    }
  },
  "errors": {
    "load_failed": "فشل تحميل البيانات",
    "approval_failed": "فشل الاعتماد",
    "invalid_transition": "هذا الإجراء غير متاح حالياً"
  },
  "validation": {
    "title_min": "يجب أن يكون العنوان 3 أحرف على الأقل",
    "amount_positive": "يجب أن يكون المبلغ أكبر من صفر"
  }
}
```

### Usage in components

```ts
const { t, locale } = useI18n()

// ✅ simple key
t('common.save')

// ✅ with interpolation
t('project.milestone_count', { count: milestones.length })

// ✅ status label from status machine
import { MILESTONE_STATUS_META } from '~/utils/statusMachine'
const label = t(MILESTONE_STATUS_META[milestone.status].labelKey)
```

---

## 12. Notification polling — `useNotifications.ts`

```ts
// app/composables/useNotifications.ts
export function useNotifications() {
  const store = useNotificationsStore()
  const POLL_INTERVAL = 30_000 // 30 seconds

  let intervalId: ReturnType<typeof setInterval> | null = null

  function poll() {
    if (!document.hidden) {
      store.fetchUnread()
    }
  }

  function startPolling() {
    poll() // immediate first fetch
    intervalId = setInterval(poll, POLL_INTERVAL)
    document.addEventListener('visibilitychange', onVisibilityChange)
  }

  function stopPolling() {
    if (intervalId) clearInterval(intervalId)
    document.removeEventListener('visibilitychange', onVisibilityChange)
  }

  function onVisibilityChange() {
    if (!document.hidden) poll() // fetch immediately when tab becomes active
  }

  onMounted(startPolling)
  onUnmounted(stopPolling)

  return { unreadCount: computed(() => store.unreadCount) }
}
```

---

## 13. Error handling patterns

### Page-level errors

```vue
<template>
  <!-- ✅ always handle all three states: loading / error / data -->
  <template v-if="pending">
    <PageSkeleton />
  </template>
  <template v-else-if="error">
    <ErrorState :title="t('errors.load_failed')" :action="refresh" />
  </template>
  <template v-else>
    <PageContent :data="data" />
  </template>
</template>
```

### Action-level errors

```ts
// ✅ always catch, always surface to user, never silent
async function handleAction() {
  try {
    await store.someAction()
    notify.success(t('common.saved'))
  } catch (error) {
    // Field errors go to form
    if (error.errors && setErrors) {
      setErrors(error.errors)
      return
    }
    // Everything else goes to toast
    notify.error(error.message ?? t('errors.unexpected'))
  }
}
```

---

## 14. Naming conventions — complete reference

| Item                  | Convention      | Example                                       |
| --------------------- | --------------- | --------------------------------------------- |
| Component file        | PascalCase      | `MilestoneCard.vue`                           |
| Composable file       | camelCase       | `useMilestones.ts`                            |
| Store file            | camelCase       | `milestones.ts`                               |
| Utility file          | camelCase       | `statusMachine.ts`                            |
| Type file             | camelCase       | `milestone.ts`                                |
| i18n key              | dot.case        | `milestone.approve`                           |
| CSS variable          | kebab-case      | `--color-brand-500`                           |
| Tailwind class        | as-is           | `ms-4 ps-2`                                   |
| API endpoint const    | SCREAMING_SNAKE | `const ENDPOINTS = { PROJECTS: '/projects' }` |
| Component in template | PascalCase      | `<MilestoneCard />`                           |
| Event name (emit)     | camelCase       | `emit('approveSuccess')`                      |

---

## 15. File size limits

| File type        | Soft limit | Action if exceeded        |
| ---------------- | ---------- | ------------------------- |
| `.vue` component | 200 lines  | Split into sub-components |
| Composable       | 100 lines  | Split by sub-concern      |
| Pinia store      | 150 lines  | Split into sub-stores     |
| Utility          | 80 lines   | Split by function group   |

---

_Last updated: MVP v1.0 — Frontend team_
