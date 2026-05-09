# Story 08-01 — Client Dashboard

**Status:** ready-for-dev  
**Epic:** 08 — Role-Based Dashboards  
**Story ID:** 8.1  
**Priority:** 🟢 HIGH — Core client-facing feature  
**Complexity:** Medium  
**Estimated Effort:** 10–12 hours  
**Created:** 2026-05-09  
**Dependencies:** Epic 03 (Approvals), Epic 04 (Payments), Epic 07 (Proposals) — data sources

---

## 📋 User Story

**As a** client,  
**I want to** see a summary of my projects and what needs my action,  
**so that** I can prioritize my work without navigating through every project.

---

## ✅ Acceptance Criteria

### Route & Access Control
- [ ] Route: `/dashboard` — accessible to `client` role only
- [ ] Redirects non-client users to their role-specific dashboard
- [ ] Uses `default` layout (authenticated shell with sticky sidebar + topbar)
- [ ] Sidebar nav shows correct items for client role

### Milestones Awaiting Client Approval (Highest Priority)
- [ ] Section title: "المراحل المنتظرة لموافقتك" (Milestones awaiting your approval)
- [ ] Displays all milestones across **all client's projects** with status `supervisor_approved`
- [ ] Each item shows as a rounded card with:
  - **Project name** + **Milestone name:** `text-sm font-semibold text-ink`
  - **Amount:** `text-sm font-bold text-primary` formatted with `formatCurrency()`
  - **Supervisor approval date:** `text-[11px] text-muted-foreground` formatted with `formatDate()`
  - **Action buttons:** "اعتماد" (Approve) primary button + "رفض" (Reject) outline-destructive button side-by-side
  - Button minimum height: 40px, minimum width: 100px for accessibility
- [ ] Badge count in section header:
  - Green/primary badge if count ≤ 2
  - Red/danger badge if count > 2
- [ ] Skeleton cards while loading: 3 placeholder items
- [ ] Empty state: "لا توجد مراحل منتظرة لموافقتك" (No milestones awaiting approval)
- [ ] Error state: error message + retry button
- [ ] **Approve action:**
  - Click "اعتماد" → button shows loading spinner
  - Call `useMilestones().approveMilestone(milestoneId)` 
  - On success: card disappears from list, badge count decreases
  - On error: button reverts, error toast shown
  - **Requirement:** Only show "Approve" if milestone can transition to `approved` (validate via `canTransition()`)
- [ ] **Reject action:**
  - Click "رفض" → show confirmation dialog
  - Dialog title: "رفض المرحلة" (Reject Milestone)
  - Dialog body: "هل أنت متأكد؟ ستُعود المرحلة إلى حالة 'قيد المراجعة'" (Are you sure? Milestone will return to review status)
  - Dialog buttons: "نعم، رفض" (Yes, reject) + "إلغاء" (Cancel)
  - On confirm: button shows loading spinner, call `useMilestones().rejectMilestone(milestoneId)`
  - On success: card disappears, badge count decreases
  - On error: button reverts, error toast shown
  - **Requirement:** Only show "Reject" if milestone can transition to `under_review` (validate via `canTransition()`)

### My Projects Summary Cards
- [ ] Section title: "مشاريعي" (My Projects)
- [ ] Three summary cards displayed in a row (responsive grid):
  1. **Total Projects:** count of all projects owned by client
     - Value: large bold number
     - Label: "إجمالي المشاريع" (Total Projects)
     - Tone: `primary` (green)
     - Click → filters `/projects` list to all projects
  2. **Active Projects:** count of projects with status `active`
     - Label: "مشاريع نشطة" (Active Projects)
     - Tone: `accent` (orange)
     - Click → filters `/projects` list to status = active
  3. **Completed Projects:** count of projects with status `completed`
     - Label: "مشاريع مكتملة" (Completed Projects)
     - Tone: `primary` (green)
     - Click → filters `/projects` list to status = completed
- [ ] Each card uses `StatCard` component from design-spec
  - Skeleton state while loading: 3 placeholder cards
  - Card styling: `rounded-2xl bg-card border border-border p-5 shadow-card`
- [ ] Cards are clickable links that navigate to `/projects` with query params: `?filter=status:active` etc.

### Recent Activity Section
- [ ] Section title: "النشاط الأخير" (Recent Activity)
- [ ] Displays last **5 project/milestone events** relevant to the client:
  - Example events: "Project created", "Milestone approved", "Payment released", "Contractor selected"
  - Events fetched from activity endpoint or derived from project/milestone timestamps
  - **Mocked initially** if activity endpoint not available — TODO comment required
- [ ] Each item shows:
  - Icon matching event type (project icon, milestone icon, payment icon, contractor icon)
  - Event description: `text-sm text-foreground` (i18n key)
  - Project name: `text-sm font-semibold text-ink`
  - Timestamp: `text-[11px] text-muted-foreground` formatted with `formatDate()`
- [ ] Skeleton state: 3 placeholder items while loading
- [ ] Empty state: "لا يوجد نشاط حديث" (No recent activity)
- [ ] Section expandable on mobile (optional collapsible)

### Loading & Error States
- [ ] Skeleton cards for all sections while data fetches:
  - Use `PageSkeleton` component for layout skeleton
  - Approval section: 3 placeholder cards
  - Summary cards: 3 placeholder stat cards
  - Activity: 3 placeholder items
- [ ] If any section fails to load:
  - Show error message specific to that section
  - Show "أعد المحاولة" (Retry) button
  - Other sections continue to load independently
- [ ] If entire page fails: error state with retry button

### Responsive Design
- [ ] Desktop (md+):
  - Approval section: full width, cards in single column
  - Summary cards: 3-column grid
  - Activity: single column below summary
  - Max-width: 1400px (boxed) or 1800px (wide) per design-spec §3
- [ ] Mobile (< md):
  - All sections stack vertically
  - Cards full width minus padding
  - Buttons remain 44px tap target
  - Summary cards: 1-column stack on small screens, 2-column on tablets
  - Sidebar hidden, role nav in dropdown (handled by layout)

### General Requirements
- [ ] Route middleware: client role only (use `usePermission().can('view_client_dashboard')`)
- [ ] All text uses i18n keys — no hardcoded strings
  - Keys location: `i18n/ar.json` and `i18n/en.json`
  - Keys pattern: `dashboard.client.*`
- [ ] RTL verified in Arabic:
  - Logical properties only: `ms-*`, `me-*`, `ps-*`, `pe-*`, `text-start`, `text-end`
  - No `ml-*`, `pl-*`, `left-*`, `right-*`
  - Cards and buttons flex-wrap correctly
  - Badge positioning RTL-safe
- [ ] TypeScript: strict mode, no `any` types
- [ ] Component: `<script setup lang="ts">` (Vue 3 Composition API)
- [ ] Props and emits: TypeScript-typed
- [ ] No console errors or warnings
- [ ] Dark mode: all sections readable in dark mode (verified via design-spec §1)

---

## 🏗️ Developer Context

### Data Dependencies

#### 1. Milestones Awaiting Approval
**Source:** `useMilestones().getMilestonesByStatus('supervisor_approved')` filtered by client
- **Mock location** (if endpoint not available): `app/composables/__mocks__/useMilestones.ts`
- **API endpoint** (planned): `GET /api/v1/milestones?status=supervisor_approved&client_id={clientId}`
- **Contract:**
  ```ts
  interface MilestoneData {
    id: string
    project_id: string
    project_name: string  // for display
    name: string
    amount: number
    status: string  // 'supervisor_approved'
    supervisor_approved_at: datetime
    field_engineer_id?: string
  }
  ```

#### 2. Project Summary Data
**Source:** `useProjects().listProjects()` — filter and count locally
- **Data available:** Count projects by status (`active`, `completed`)
- **Already integrated:** Story 02-01, 02-03
- **Mock check:** Project list composable should be fully functional by now

#### 3. Recent Activity
**Status:** 🚨 **MOCKED** — endpoint not yet available from Laravel
- **Mock location:** Create `app/composables/__mocks__/useActivity.ts` with 5 sample events
- **Sample mock data:**
  ```ts
  {
    id: 'evt-1',
    type: 'project_created',  // or 'milestone_approved', 'payment_released'
    title: 'project_created',  // i18n key
    projectName: 'Project Alpha',
    projectId: 'proj-123',
    timestamp: new Date('2026-05-08T10:30:00'),
    icon: 'folder'  // icon type for display
  }
  ```
- **TODO comment required:** `// TODO: Replace mock with /api/v1/activity endpoint when available`

### Files to Create / Modify

#### 1. **app/pages/dashboard.vue** (Create new)
- **Purpose:** Client dashboard page
- **Route:** `/dashboard`
- **Middleware:** Require `client` role
- **Layout:** `default` (authenticated shell)
- **Structure:**
  ```vue
  <script setup lang="ts">
  import { useProjects } from '~/composables/useProjects'
  import { useMilestones } from '~/composables/useMilestones'
  import { useActivity } from '~/composables/useActivity'
  import { usePermission } from '~/composables/usePermission'
  
  const route = useRoute()
  const router = useRouter()
  const { user } = useAuth()
  
  // Fetch data
  const { data: projects, loading: projectsLoading } = useProjects().listProjects()
  const { data: approvalMilestones, loading: milestonesLoading } = useMilestones().getMilestonesByStatus('supervisor_approved')
  const { data: recentActivity, loading: activityLoading } = useActivity().getRecentActivity()
  
  // Computed
  const totalProjects = computed(() => projects.value?.length || 0)
  const activeProjects = computed(() => projects.value?.filter(p => p.status === 'active').length || 0)
  const completedProjects = computed(() => projects.value?.filter(p => p.status === 'completed').length || 0)
  
  // Methods
  async function approveMilestone(milestoneId: string) {
    try {
      await useMilestones().approveMilestone(milestoneId)
      // Refresh milestones list
      await useMilestones().getMilestonesByStatus('supervisor_approved')
    } catch (error) {
      notify.error(t('errors.approval_failed'))
    }
  }
  
  async function rejectMilestone(milestoneId: string) {
    // Show confirmation dialog
    // Call useMilestones().rejectMilestone(milestoneId)
    // Refresh list on success
  }
  </script>
  ```

#### 2. **app/components/dashboard/ClientApprovalSection.vue** (Create new)
- **Purpose:** Milestones awaiting client approval section
- **Props:**
  ```ts
  interface Props {
    milestones: MilestoneData[]
    isLoading?: boolean
    hasError?: boolean
    errorMessage?: string
  }
  ```
- **Emits:**
  ```ts
  emit('approve-clicked', milestoneId: string)
  emit('reject-clicked', milestoneId: string)
  emit('retry')
  ```
- **Features:**
  - Badge count (danger if > 2)
  - Approval action buttons with loading state
  - Rejection confirmation dialog
  - Empty and error states

#### 3. **app/components/dashboard/ProjectSummaryCards.vue** (Create new)
- **Purpose:** Three summary stat cards for projects
- **Props:**
  ```ts
  interface Props {
    totalCount: number
    activeCount: number
    completedCount: number
    isLoading?: boolean
  }
  ```
- **Features:**
  - Three `StatCard` components arranged in responsive grid
  - Each card is clickable → navigate to `/projects` with filter
  - Skeleton state while loading

#### 4. **app/components/dashboard/RecentActivitySection.vue** (Create new)
- **Purpose:** Display recent activity feed
- **Props:**
  ```ts
  interface Props {
    activities: ActivityEvent[]
    isLoading?: boolean
    hasError?: boolean
  }
  ```
- **Features:**
  - List of 5 recent events
  - Icons per event type
  - Timestamps formatted
  - Empty state if no activity

#### 5. **app/composables/useActivity.ts** (Create new)
- **Purpose:** Fetch and manage activity data
- **Methods:**
  ```ts
  function getRecentActivity() {
    // Initially: return mock data from __mocks__/useActivity.ts
    // TODO: Replace with GET /api/v1/activity when endpoint available
  }
  ```
- **State management:** Pinia store for activity events

#### 6. **app/composables/__mocks__/useActivity.ts** (Create new)
- **Mock data:** 5 sample activity events with realistic data
- **Remove when endpoint available:** Mark with TODO comment

#### 7. **app/middleware/role.ts** (Modify if exists)
- **Add route guard:** `/dashboard` → `client` role only
- **Pattern:** Route `/dashboard` checks `user.role === 'client'`
- **Existing file?** Already exists from Story 01-03, extend if needed

#### 8. **i18n/ar.json** (Modify)
- **Add keys:**
  ```json
  {
    "dashboard": {
      "client": {
        "title": "لوحة التحكم",
        "approvalsSection": "المراحل المنتظرة لموافقتك",
        "projectsSection": "مشاريعي",
        "activitySection": "النشاط الأخير",
        "approve": "اعتماد",
        "reject": "رفض",
        "noApprovalsWaiting": "لا توجد مراحل منتظرة لموافقتك",
        "noActivity": "لا يوجد نشاط حديث",
        "totalProjects": "إجمالي المشاريع",
        "activeProjects": "مشاريع نشطة",
        "completedProjects": "مشاريع مكتملة",
        "rejectConfirm": "رفض المرحلة",
        "rejectMessage": "هل أنت متأكد؟ ستُعود المرحلة إلى حالة 'قيد المراجعة'",
        "confirmReject": "نعم، رفض",
        "cancel": "إلغاء"
      }
    }
  }
  ```

#### 9. **i18n/en.json** (Modify)
- **Add English keys** (mirror structure above)
  ```json
  {
    "dashboard": {
      "client": {
        "title": "Dashboard",
        "approvalsSection": "Milestones Awaiting Your Approval",
        "projectsSection": "My Projects",
        "activitySection": "Recent Activity",
        "approve": "Approve",
        "reject": "Reject",
        "noApprovalsWaiting": "No milestones awaiting approval",
        "noActivity": "No recent activity"
      }
    }
  }
  ```

### Key Composables & Functions to Use

| Composable | Method | Purpose |
|---|---|---|
| `useProjects()` | `listProjects()` | Get all client projects |
| `useMilestones()` | `getMilestonesByStatus('supervisor_approved')` | Get approval queue |
| `useMilestones()` | `approveMilestone(id)` | Approve milestone |
| `useMilestones()` | `rejectMilestone(id)` | Reject milestone |
| `useActivity()` | `getRecentActivity()` | Get activity feed (mocked) |
| `usePermission()` | `can('approve_milestone')` | Check if user can approve |
| `useAuth()` | access to `user` ref | Get current client info |
| `formatCurrency()` | format amounts | Display prices |
| `formatDate()` | format timestamps | Display dates |
| `useNotify()` | `error()`, `success()` | Show toast notifications |

### Status Machine Integration

**Valid transitions for this story:**

```ts
// From docs/status-flows.md — Milestone flow
supervisor_approved → approved (via approveMilestone)
supervisor_approved → under_review (via rejectMilestone)

// Before calling API, validate:
import { canTransition } from '~/utils/statusMachine'
if (!canTransition('milestone', milestone.status, 'approved')) {
  // don't show approve button
}
if (!canTransition('milestone', milestone.status, 'under_review')) {
  // don't show reject button
}
```

### Dark Mode & RTL Checklist

- [ ] Test in light mode: all stat cards readable, contrast OK
- [ ] Test in dark mode: colors adjusted per design-spec §1.2
- [ ] Test RTL (Arabic):
  - Open DevTools, right-click `<html>`, inspect element
  - Add `dir="rtl"` attribute temporarily
  - Verify: approval cards flex correct direction
  - Verify: badges and buttons align RTL
  - Verify: "Approve"/"Reject" buttons order doesn't confuse (left/right swaps in RTL)
  - Verify: activity timestamps align RTL
  - Verify: currency/project names flow RTL
  - Verify: no hardcoded `left`/`right` values break layout

### Testing Plan

**Manual testing checklist:**

1. **Access control:**
   - Login as client → can see `/dashboard`
   - Login as contractor → redirect to contractor dashboard (or 403 if no dashboard yet)
   - Login as admin → redirect to admin dashboard

2. **Approval section:**
   - Create test milestone with status `supervisor_approved`
   - Verify milestone appears in approval section
   - Click "Approve" → shows loading spinner, then disappears
   - Click "Reject" → shows confirmation dialog
   - Approve/reject: verify badge count updates
   - Delete all approvals → verify empty state shown

3. **Project summary:**
   - Verify counts: total = all projects, active = status:active, completed = status:completed
   - Click each card → filters `/projects` list correctly
   - Verify skeleton state while loading

4. **Recent activity (mock):**
   - Verify 5 mock events displayed
   - Verify timestamps formatted correctly
   - Empty state (if no mock data): verify "No activity" message

5. **Responsive:**
   - Mobile (375px): verify cards stack, buttons clickable
   - Tablet (768px): verify 2-column summary cards
   - Desktop: verify max-width constraint

6. **RTL Arabic:**
   - Change browser language to Arabic (or use `dir="rtl"`)
   - Verify all text flows RTL
   - Verify no hardcoded left/right breaks layout
   - Verify badges align RTL
   - Verify dates format RTL

### Previous Story Learnings

**From Story 07-04 (Client Reviews Proposals):**
- Client-specific data filtering: use `client_id` in composable methods
- Optimistic updates for approval actions: update store first, rollback on error
- Badge counts drive urgency: use danger tone for count > 2
- Empty and error states critical: never leave user with blank screen

**From Story 03-05 (Client Final Approval):**
- Confirmation dialogs needed for destructive actions (reject = rollback to under_review)
- Button loading states prevent double-click
- Toast notifications critical for user feedback

**From Story 04-05 (Client Payment Overview):**
- Summary cards use `StatCard` component for consistency
- Clickable cards → navigate with query filters
- Currency formatting via `formatCurrency()` already in utils

### Architecture Compliance

**Route structure:**
- Follows `/dashboard` convention per design-spec §3
- Uses role-specific layout switch (not separate files per role yet)

**State management:**
- Pinia stores for projects, milestones, activity
- Optimistic updates: store first, rollback on error
- No derived data stored: use `computed()` for counts

**Components:**
- `<script setup lang="ts">` Vue 3 Composition API
- Props and emits TypeScript-typed
- No logic in templates
- Uses shadcn-vue primitives (Button, Badge, Card, Skeleton)

**API integration:**
- All calls through composables, never direct `$fetch` in components
- Mock pattern established in Story 04-05
- TODO comments for endpoints not yet available

**i18n:**
- All strings via i18n keys
- Keys follow `dashboard.client.*` pattern
- Tested in both Arabic (RTL) and English (LTR)

### Latest Tech Information

**Vue 3.5.x + Composition API:**
- `useAsyncData()` and `useFetch()` with same key share refs (Nuxt 4 improvement)
- Can fetch from multiple sources and they stay in sync

**Tailwind CSS v4:**
- Logical properties (ms-, ps-, text-start) mandatory for RTL
- No `tailwind.config.js` — use CSS `@theme` blocks
- Responsive grid: `grid grid-cols-1 md:grid-cols-3`

**shadcn-vue:**
- `StatCard` component exists in design-spec §5.1 — reuse, don't reinvent
- Badge component: use `primary`, `accent`, `danger` tones per spec §1.4
- Skeleton component: uses `@loading-skeleton` animation

---

## 🎯 Definition of Done

- [ ] Route `/dashboard` accessible to client role only
- [ ] Milestones awaiting approval section displays all `supervisor_approved` milestones
- [ ] Approve/reject buttons work with loading states and optimistic updates
- [ ] Project summary cards show correct counts and navigate on click
- [ ] Recent activity displays 5 mock events (TODO comment for endpoint)
- [ ] All text uses i18n keys (no hardcoded strings)
- [ ] Skeleton cards show while loading
- [ ] Empty and error states display correctly
- [ ] RTL verified in Arabic (sidebar on right, text flows RTL, no left/right hardcodes)
- [ ] Responsive design verified (mobile, tablet, desktop)
- [ ] Dark mode verified (colors per design-spec §1)
- [ ] No console errors or warnings
- [ ] TypeScript: strict mode, no `any` types
- [ ] Component follows `<script setup lang="ts">` pattern
- [ ] Optimistic updates: approve/reject update store first, rollback on error
- [ ] No unused imports or variables

---

## 📚 Reference Documentation

| Document | Section | Why relevant |
|---|---|---|
| `CLAUDE.md` | §0, §3, §8, §12 | Behavioral guidelines, tech stack, state management, definition of done |
| `CLAUDE.md` | §6, §9 | User roles, i18n RTL requirements |
| `docs/design-spec.md` | §1–§5 | Colors, typography, dashboard shell, components, status tones |
| `docs/design-spec.md` | §7 | Client dashboard visual spec |
| `docs/api-contracts.md` | Milestone, Project sections | Data contracts for API calls |
| `docs/status-flows.md` | Milestone flow | Valid status transitions |
| Previous stories | 02-01, 03-05, 04-05, 07-04 | Patterns for data fetching, optimistic updates, confirmation dialogs |

---

**Created by:** BMad Ultimate Context Engine  
**Last Updated:** 2026-05-09  
**Ready for:** Dev implementation via `/bmad:dev-story` skill
