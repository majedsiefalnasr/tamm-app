# Story 08-03 — Field Engineer Dashboard + Assignments Page

**Status:** ready-for-dev  
**Epic:** 08 — Role-Based Dashboards  
**Story ID:** 8.3  
**Priority:** 🟢 HIGH — Core field engineer-facing feature  
**Complexity:** Medium-High (two routes, coordinated navigation)  
**Estimated Effort:** 12–14 hours  
**Created:** 2026-05-09  
**Dependencies:** Epic 02 (Projects), Epic 03 (Milestones/Reports) — data sources; Story 01-03 (role-based redirect) — navigation prerequisite

---

## 📋 User Story

**As a** field engineer,  
**I want to** see my assignments and what reports I need to submit in one place,  
**so that** I never miss a deadline and can quickly start working on active milestones.

---

## ✅ Acceptance Criteria

### Dashboard Route (`/dashboard`)

#### General
- [ ] Route: `/dashboard` — accessible to `field_engineer` role only
- [ ] Uses `default` layout (authenticated shell with sticky sidebar + topbar)
- [ ] Redirects non-field-engineer users to their role-specific dashboard
- [ ] Sidebar nav shows correct items for field_engineer role

#### My Assignments Section (Highest Priority)
- [ ] Section title: "مهامي النشطة" (My Active Assignments)
- [ ] Displays all milestones assigned to this engineer with status `in_progress` across all projects
- [ ] Each item shown as rounded card with:
  - **Project name:** `text-sm font-semibold text-ink`
  - **Milestone name:** `text-sm font-medium text-foreground`
  - **Project address:** `text-xs text-muted-foreground` (if available)
  - **Status badge:** pill showing `in_progress` tone (accent/orange)
  - **Primary CTA:** "رفع تقرير" (Submit Report) button per item
  - Card styling: `rounded-2xl bg-card border border-border p-4 shadow-card hover:shadow-elevated transition-shadow`
- [ ] Sorted by: milestone deadline ascending (oldest due first)
- [ ] Skeleton cards while loading: 3 placeholder items
- [ ] Empty state: "لا توجد مهام نشطة" (No active assignments)
- [ ] Error state: error message + retry button
- [ ] "Submit Report" button routes to `/projects/[projectId]/milestones/[milestoneId]/report/new`

#### Recently Submitted Section
- [ ] Section title: "آخر التقارير المرفوعة" (Recently Submitted Reports)
- [ ] Displays last 5 reports submitted by this engineer
- [ ] Each item shows as card with:
  - **Milestone name:** `text-sm font-semibold text-ink`
  - **Project name:** `text-sm text-muted-foreground`
  - **Submission date:** "رفع في: [date]" formatted with `formatDate()` `text-xs text-muted-foreground`
  - **Current milestone status badge:** pill showing current status tone (under_review / supervisor_approved / approved)
  - **Link to detail:** Clickable → routes to milestone detail page
  - Card styling: `rounded-2xl bg-card border border-border/50 p-4`
- [ ] Skeleton cards while loading: 2 placeholder items
- [ ] Empty state: "لم ترفع أي تقارير بعد" (No reports submitted yet)

#### Loading & Error States
- [ ] Skeleton cards for both sections while data fetches:
  - Use `PageSkeleton` component for layout skeleton
  - Active assignments: 3 placeholder cards
  - Recently submitted: 2 placeholder cards
- [ ] If any section fails to load:
  - Show error message specific to that section
  - Show "أعد المحاولة" (Retry) button
  - Other sections continue to load independently
- [ ] If entire page fails: error state with retry button

#### Responsive Design
- [ ] Desktop (md+):
  - Active assignments: full width, cards in single column or 2-column grid
  - Recently submitted: full width below active assignments
  - Max-width: 1400px (boxed) or 1800px (wide) per design-spec §3
- [ ] Mobile (< md):
  - All sections stack vertically
  - Cards full width minus padding
  - Buttons remain 44px tap target
  - Section cards remain full-width

#### General Requirements (Dashboard)
- [ ] Route middleware: field_engineer role only (use `usePermission().can('view_field_engineer_dashboard')`)
- [ ] All text uses i18n keys — no hardcoded strings
  - Keys location: `i18n/ar.json` and `i18n/en.json`
  - Keys pattern: `dashboard.fieldEngineer.*`
- [ ] RTL verified in Arabic:
  - Logical properties only: `ms-*`, `me-*`, `ps-*`, `pe-*`, `text-start`, `text-end`
  - No `ml-*`, `pl-*`, `left-*`, `right-*`
  - Cards and buttons flex-wrap correctly
  - Address text flows RTL
- [ ] TypeScript: strict mode, no `any` types
- [ ] Component: `<script setup lang="ts">` (Vue 3 Composition API)
- [ ] Props and emits: TypeScript-typed
- [ ] No console errors or warnings
- [ ] Dark mode: all sections readable in dark mode (verified via design-spec §1)

---

### Assignments Page Route (`/assignments`)

#### General
- [ ] Route: `/assignments` — accessible to `field_engineer` role only
- [ ] Uses `default` layout (authenticated shell with sidebar + topbar)
- [ ] Middleware: field_engineer role only
- [ ] **Note:** After login, field engineers are redirected to `/assignments` (Story 01-03) — this is their primary work view

#### Page Header
- [ ] Title: "مهامي" (My Assignments) — large, font-extrabold
- [ ] Breadcrumb: optional (if design calls for it)
- [ ] Subtitle or count: "X من Y مهمة نشطة" (X of Y active assignments)

#### Filter Tabs
- [ ] Tabs: **All** / **Active** (in_progress) / **Under Review** (under_review) / **Completed** (approved)
- [ ] Default tab on load: **Active**
- [ ] Tab styling: underline indicator, icons optional
- [ ] Count badge on each tab showing filtered count
- [ ] Clicking tab filters the assignment list below

#### Assignment Cards (in grid/list)
Each assignment card displays:
- **Project name + address:** 
  - Project name: `text-sm font-semibold text-ink`
  - Address: `text-xs text-muted-foreground` (if available)
- **Milestone name + order number:**
  - Milestone name: `text-sm font-medium text-foreground`
  - Order number (if available): `text-xs text-muted-foreground`
- **Status badge:** pill showing milestone status tone
- **Action buttons:**
  - If status is `in_progress`: Primary button "رفع تقرير" (Submit Report) → routes to `/projects/[projectId]/milestones/[milestoneId]/report/new`
  - If status is `under_review` or `supervisor_approved` or `approved`: Secondary button "عرض التقرير" (View Report) → routes to `/projects/[projectId]/milestones/[milestoneId]/report`
- **Card styling:** `rounded-2xl bg-card border border-border p-4 shadow-card`

#### Sorting
- [ ] Within each tab, sort by:
  1. Active first (`in_progress`)
  2. Then under review (`under_review`)
  3. Then completed (`approved`)
  4. Within same status: by milestone deadline ascending (oldest due first)

#### Loading & Error States
- [ ] Skeleton grid while loading (3 placeholder cards)
- [ ] If page fails to load: error state with retry button
- [ ] If section has no items: empty state per tab
  - "لا توجد مهام نشطة" (No active assignments) on Active tab
  - "لا توجد مهام قيد المراجعة" (No assignments under review) on Under Review tab
  - "لا توجد مهام مكتملة" (No completed assignments) on Completed tab

#### Responsive Design
- [ ] Desktop (md+):
  - Assignment grid: 2-column layout
  - Max-width: 1400px (boxed) or 1800px (wide)
  - Tabs full width above grid
- [ ] Mobile (< md):
  - Assignment grid: 1-column layout
  - Tabs remain interactive, scroll horizontally if needed
  - Cards full width minus padding
  - Buttons remain 44px tap target

#### General Requirements (Assignments Page)
- [ ] Route middleware: field_engineer role only
- [ ] All text uses i18n keys — no hardcoded strings
  - Keys location: `i18n/ar.json` and `i18n/en.json`
  - Keys pattern: `pages.assignments.*`
- [ ] RTL verified in Arabic:
  - Logical properties only
  - No hardcoded left/right values
  - Address text flows RTL
  - Tab underline indicator positions RTL
- [ ] TypeScript: strict mode, no `any` types
- [ ] Component: `<script setup lang="ts">` (Vue 3 Composition API)
- [ ] Props and emits: TypeScript-typed
- [ ] No console errors or warnings
- [ ] Dark mode verified

---

## 🏗️ Developer Context

### Data Dependencies

#### 1. Active Milestones (Dashboard & Assignments Page)
**Source:** `useMilestones().getMilestonesByFieldEngineer('in_progress')` filtered by current field engineer
- **Mock location** (if endpoint not available): `app/composables/__mocks__/useMilestones.ts`
- **API endpoint** (planned): `GET /api/v1/milestones?status=in_progress&field_engineer_id={engineerId}`
- **Contract:**
  ```ts
  interface MilestoneData {
    id: string
    project_id: string
    project_name: string  // for display
    project_address?: string  // for assignment cards
    name: string
    status: 'in_progress' | 'under_review' | 'supervisor_approved' | 'approved'
    field_engineer_id: string
    deadline?: datetime  // for sorting
    order_number?: number  // for assignments page
    created_at?: datetime
  }
  ```

#### 2. Recent Reports
**Source:** `useReports().getReportsByFieldEngineer(engineerId, limit: 5)` ordered by submission date DESC
- **Mock location**: `app/composables/__mocks__/useReports.ts`
- **API endpoint** (planned): `GET /api/v1/reports?field_engineer_id={engineerId}&limit=5&sort=submitted_at:desc`
- **Contract:**
  ```ts
  interface ReportData {
    id: string
    milestone_id: string
    milestone_name: string  // for display
    project_id: string
    project_name: string
    field_engineer_id: string
    submitted_at: datetime
    status: 'submitted' | 'under_review' | 'supervisor_approved' | 'approved' | 'rejected'
    current_milestone_status: string  // current status of associated milestone
  }
  ```

### Files to Create / Modify

#### 1. **app/pages/dashboard.vue** (Modify if exists)
- **Purpose:** Route handler for all dashboard roles
- **Route:** `/dashboard`
- **Update to support field_engineer:**
  ```vue
  <script setup lang="ts">
  import { useAuth } from '~/composables/useAuth'
  import FieldEngineerDashboard from '~/components/dashboard/FieldEngineerDashboard.vue'
  
  const { user } = useAuth()
  const role = computed(() => user.value?.role)
  </script>

  <template>
    <!-- Existing components: ClientDashboard, ContractorDashboard, etc. -->
    <FieldEngineerDashboard v-else-if="role === 'field_engineer'" />
    <!-- ... -->
  </template>
  ```

#### 2. **app/components/dashboard/FieldEngineerDashboard.vue** (Create new)
- **Purpose:** Main field engineer dashboard layout and data orchestration
- **Structure:**
  ```vue
  <script setup lang="ts">
  import { useMilestones } from '~/composables/useMilestones'
  import { useReports } from '~/composables/useReports'
  import { useAuth } from '~/composables/useAuth'
  
  const { user } = useAuth()
  const engineerId = computed(() => user.value?.id)
  
  // Fetch data
  const { data: activeMilestones, loading: activeMilestonesLoading, error: milestonesError } = 
    useMilestones().getMilestonesByFieldEngineer('in_progress')
  const { data: recentReports, loading: reportsLoading, error: reportsError } = 
    useReports().getReportsByFieldEngineer(engineerId.value, 5)
  </script>

  <template>
    <div class="space-y-6 px-4 pb-16 pt-6 md:px-8 md:pb-20 md:pt-8">
      <div class="mb-8">
        <h1 class="text-2xl font-extrabold text-ink md:text-3xl">{{ $t('dashboard.fieldEngineer.title') }}</h1>
      </div>

      <FieldEngineerActiveMilestones 
        :milestones="activeMilestones"
        :loading="activeMilestonesLoading"
        :has-error="!!milestonesError"
        :error-message="milestonesError?.message"
        @retry="/* refresh */"
      />

      <FieldEngineerRecentReports 
        :reports="recentReports"
        :loading="reportsLoading"
      />
    </div>
  </template>
  ```

#### 3. **app/components/dashboard/FieldEngineerActiveMilestones.vue** (Create new)
- **Purpose:** Active assignments section on dashboard
- **Props:**
  ```ts
  interface Props {
    milestones: MilestoneData[]
    loading?: boolean
    hasError?: boolean
    errorMessage?: string
  }
  ```
- **Emits:**
  ```ts
  emit('retry')
  ```
- **Features:**
  - List of active milestone assignments
  - Project name, milestone name, address, status badge
  - "Submit Report" CTA button per item
  - Links to report submission page
  - Empty and error states
  - Skeleton loading

#### 4. **app/components/dashboard/FieldEngineerRecentReports.vue** (Create new)
- **Purpose:** Recently submitted reports section on dashboard
- **Props:**
  ```ts
  interface Props {
    reports: ReportData[]
    loading?: boolean
  }
  ```
- **Features:**
  - Last 5 reports with milestone status badges
  - Read-only cards (view only)
  - Links to milestone detail pages
  - Empty state

#### 5. **app/pages/assignments.vue** (Create new)
- **Purpose:** Full assignments page with filtering and tabs
- **Route:** `/assignments`
- **Structure:**
  ```vue
  <script setup lang="ts">
  import { useMilestones } from '~/composables/useMilestones'
  import { useAuth } from '~/composables/useAuth'
  
  const { user } = useAuth()
  const engineerId = computed(() => user.value?.id)
  
  const currentTab = ref('active')  // 'all', 'active', 'under_review', 'completed'
  
  // Fetch all milestones
  const { data: allMilestones, loading } = useMilestones().getMilestonesByFieldEngineer(null)  // all statuses
  
  const filteredMilestones = computed(() => {
    const data = allMilestones.value || []
    switch (currentTab.value) {
      case 'active': return data.filter(m => m.status === 'in_progress')
      case 'under_review': return data.filter(m => m.status === 'under_review')
      case 'completed': return data.filter(m => m.status === 'approved')
      default: return data
    }
  })
  </script>

  <template>
    <div class="px-4 pb-16 pt-6 md:px-8 md:pb-20 md:pt-8">
      <!-- Page header -->
      <PageHeader title="pages.assignments.title" />
      
      <!-- Filter tabs -->
      <AssignmentFilterTabs 
        :current-tab="currentTab"
        :counts="{ all: allMilestones.length, active: activeMilestones.length, ... }"
        @update:tab="currentTab = $event"
      />

      <!-- Assignment grid -->
      <AssignmentGrid 
        :milestones="filteredMilestones"
        :loading="loading"
      />
    </div>
  </template>
  ```

#### 6. **app/components/assignments/AssignmentFilterTabs.vue** (Create new)
- **Purpose:** Tab filter for assignments by status
- **Props:**
  ```ts
  interface Props {
    currentTab: string
    counts: {
      all: number
      active: number
      underReview: number
      completed: number
    }
  }
  ```
- **Emits:**
  ```ts
  emit('update:tab', tabName)
  ```
- **Features:**
  - Tabs: All, Active, Under Review, Completed
  - Count badges on each tab
  - Underline indicator animation

#### 7. **app/components/assignments/AssignmentGrid.vue** (Create new)
- **Purpose:** Grid display of assignments
- **Props:**
  ```ts
  interface Props {
    milestones: MilestoneData[]
    loading?: boolean
    hasError?: boolean
    errorMessage?: string
  }
  ```
- **Features:**
  - 2-column grid on desktop, 1-column on mobile
  - Assignment cards with project/milestone info
  - Status badges
  - Action buttons (Submit Report or View Report)
  - Empty state per tab
  - Skeleton loading

#### 8. **app/components/assignments/AssignmentCard.vue** (Create new)
- **Purpose:** Individual assignment card
- **Props:**
  ```ts
  interface Props {
    milestone: MilestoneData
  }
  ```
- **Features:**
  - Project info (name, address)
  - Milestone info (name, order number)
  - Status badge
  - Action button routing
  - Click navigation to milestone detail

#### 9. **app/composables/useMilestones.ts** (Modify)
- **Add method:** `getMilestonesByFieldEngineer(status?: string | null)`
  ```ts
  function getMilestonesByFieldEngineer(status?: string | null) {
    // Returns all milestones assigned to current field engineer
    // If status is null/undefined: returns all milestones (all statuses)
    // If status is provided: filters by that status
    // Uses field_engineer_id from auth context
  }
  ```

#### 10. **app/composables/useReports.ts** (Create new or modify)
- **Add method:** `getReportsByFieldEngineer(engineerId: string, limit?: number)`
  ```ts
  function getReportsByFieldEngineer(engineerId: string, limit: number = 5) {
    // Returns reports submitted by this field engineer
    // Limited to N most recent
    // Sorted by submitted_at DESC
    // Initially mocked in __mocks__/useReports.ts
  }
  ```
- **Add method:** `getReportByMilestoneId(milestoneId: string)`
  ```ts
  function getReportByMilestoneId(milestoneId: string) {
    // Returns the submitted report for a specific milestone
    // Used to navigate to report view
  }
  ```

#### 11. **app/composables/__mocks__/useMilestones.ts** (Modify)
- **Add mock data** for field engineer milestones
  ```ts
  const mockFieldEngineerMilestones = [
    {
      id: 'mile-1',
      project_id: 'proj-1',
      project_name: 'مشروع البناء الأساسي',
      project_address: 'شارع النيل، القاهرة',
      name: 'المرحلة الأولى - الأساسات',
      status: 'in_progress',
      field_engineer_id: 'eng-1',
      deadline: new Date('2026-05-20'),
      order_number: 1,
      created_at: new Date('2026-05-01')
    }
    // ... 2-3 more mock milestones per status
  ]
  ```

#### 12. **app/composables/__mocks__/useReports.ts** (Create new)
- **Mock data:** Field engineer recent reports with realistic dates
  ```ts
  const mockRecentReports = [
    {
      id: 'report-1',
      milestone_id: 'mile-1',
      milestone_name: 'المرحلة الأولى - الأساسات',
      project_id: 'proj-1',
      project_name: 'مشروع البناء الأساسي',
      field_engineer_id: 'eng-1',
      submitted_at: new Date('2026-05-08'),
      status: 'submitted',
      current_milestone_status: 'under_review'
    }
    // ... 2-4 more mock reports
  ]
  ```

#### 13. **app/middleware/role.ts** (Modify if exists)
- **Add route guards:** 
  - `/dashboard` accessible to `field_engineer` role
  - `/assignments` accessible to `field_engineer` role
- **Pattern:** Already implemented for other roles

#### 14. **i18n/ar.json** (Modify)
- **Add keys for dashboard:**
  ```json
  {
    "dashboard": {
      "fieldEngineer": {
        "title": "لوحة التحكم",
        "activeAssignments": "مهامي النشطة",
        "noActiveAssignments": "لا توجد مهام نشطة",
        "submitReport": "رفع تقرير",
        "recentReports": "آخر التقارير المرفوعة",
        "noRecentReports": "لم ترفع أي تقارير بعد",
        "reportSubmittedOn": "رفع في: {date}",
        "projectAddress": "{address}"
      }
    }
  }
  ```
- **Add keys for assignments page:**
  ```json
  {
    "pages": {
      "assignments": {
        "title": "مهامي",
        "subtitle": "{active} من {total} مهمة نشطة",
        "tabAll": "الكل",
        "tabActive": "نشطة",
        "tabUnderReview": "قيد المراجعة",
        "tabCompleted": "مكتملة",
        "submitReport": "رفع تقرير",
        "viewReport": "عرض التقرير",
        "noAssignmentsActive": "لا توجد مهام نشطة",
        "noAssignmentsUnderReview": "لا توجد مهام قيد المراجعة",
        "noAssignmentsCompleted": "لا توجد مهام مكتملة",
        "projectAddress": "{address}"
      }
    }
  }
  ```

#### 15. **i18n/en.json** (Modify)
- **Add English keys** (mirror structure above)
  ```json
  {
    "dashboard": {
      "fieldEngineer": {
        "title": "Dashboard",
        "activeAssignments": "My Active Assignments",
        "noActiveAssignments": "No active assignments",
        "submitReport": "Submit Report",
        "recentReports": "Recently Submitted Reports",
        "noRecentReports": "No reports submitted yet",
        "reportSubmittedOn": "Submitted on: {date}",
        "projectAddress": "{address}"
      }
    },
    "pages": {
      "assignments": {
        "title": "My Assignments",
        "subtitle": "{active} of {total} active assignments",
        "tabAll": "All",
        "tabActive": "Active",
        "tabUnderReview": "Under Review",
        "tabCompleted": "Completed",
        "submitReport": "Submit Report",
        "viewReport": "View Report",
        "noAssignmentsActive": "No active assignments",
        "noAssignmentsUnderReview": "No assignments under review",
        "noAssignmentsCompleted": "No completed assignments",
        "projectAddress": "{address}"
      }
    }
  }
  ```

### Key Composables & Functions to Use

| Composable | Method | Purpose |
|---|---|---|
| `useMilestones()` | `getMilestonesByFieldEngineer(status)` | Get field engineer's milestones |
| `useReports()` | `getReportsByFieldEngineer(id, limit)` | Get recent reports |
| `useReports()` | `getReportByMilestoneId(id)` | Get report for viewing |
| `usePermission()` | `can('view_field_engineer_dashboard')` | Check field engineer role |
| `useAuth()` | access to `user` ref | Get current engineer info |
| `formatDate()` | format timestamps | Display report submission dates |
| `useRoute()` | access current route | For tab routing |
| `useRouter()` | navigate | Route to report submission/view |
| `useNotify()` | `error()`, `success()` | Show toast notifications |

### Status Machine Integration

**Valid transitions for field engineer context:**

```ts
// Field engineer cannot initiate transitions, but sees them
// in_progress → under_review (after engineer submits report, system auto-transitions)
// under_review → supervisor_approved (supervisor approves)
// supervisor_approved → approved (client approves)
// supervisor_approved → under_review (client rejects → bounces back)

// Before routing, validate:
import { canTransition } from '~/utils/statusMachine'
// No validation needed for viewing — field engineer is read-only on reviewed sections
```

### Data Flow & Sequencing

**On `/dashboard` load:**
1. Fetch active milestones (field engineer's in_progress only)
2. Fetch recent reports (field engineer's last 5 submitted)
3. Render dashboard with two sections

**On `/assignments` load:**
1. Fetch all milestones assigned to field engineer (all statuses)
2. Default to "Active" tab
3. Filter by tab selection
4. Render assignment grid

**Report submission flow:**
1. Click "Submit Report" → routes to `/projects/[projectId]/milestones/[milestoneId]/report/new`
2. Story 03-03 (Field Engineer Submits Report) handles the form
3. On success, milestone status auto-transitions to `under_review`
4. Dashboard/assignments page reflects new status immediately

### Dark Mode & RTL Checklist

- [ ] Test in light mode: all cards readable, contrast OK
- [ ] Test in dark mode: cards and badges visible, status colors per design-spec §1
- [ ] Test RTL (Arabic):
  - Open DevTools, right-click `<html>`, add `dir="rtl"` attribute
  - Verify: assignment cards align RTL
  - Verify: project address flows RTL
  - Verify: submission date and milestone name flow RTL
  - Verify: "Submit Report" / "View Report" buttons don't overflow in RTL
  - Verify: status badges align RTL
  - Verify: filter tabs underline indicator positions RTL
  - Verify: no hardcoded `left`/`right` values break layout
  - Verify: grid columns collapse correctly to 1-column in RTL

### Testing Plan

**Manual testing checklist:**

1. **Access control:**
   - Login as field engineer → can see `/dashboard` and `/assignments`
   - Login as contractor → redirect from `/assignments` to contractor dashboard
   - Login as admin → redirect from `/assignments` to admin dashboard
   - Verify 404 or redirect for unauthorized access

2. **Dashboard active assignments section:**
   - Create test milestones with status `in_progress` for field engineer
   - Verify milestones appear with project name, milestone name, address
   - Verify status badge shows `in_progress` tone (accent/orange)
   - Click "Submit Report" → routes to report form
   - Delete all active milestones → verify empty state shown
   - Verify skeleton state while loading

3. **Dashboard recent reports section:**
   - Create test reports and mark as submitted
   - Verify reports appear with milestone/project name, submission date
   - Verify milestone status badge shows current status (under_review, approved, etc.)
   - Click report card → routes to milestone detail
   - Delete all reports → verify empty state shown

4. **Assignments page general:**
   - Verify page loads with Active tab selected by default
   - Verify tab counts are accurate and update on filter change
   - Verify assignment grid shows correct count of items per tab

5. **Assignments page filters:**
   - Create milestones with different statuses
   - Click "All" tab → verify all milestones shown (all statuses)
   - Click "Active" tab → verify only `in_progress` milestones shown
   - Click "Under Review" tab → verify only `under_review` milestones shown
   - Click "Completed" tab → verify only `approved` milestones shown
   - Verify counts on tabs update correctly

6. **Assignments page cards:**
   - Verify each card shows project name, address, milestone name, order number
   - Verify status badge shows correct tone per status
   - For `in_progress` milestone: verify "Submit Report" button visible
   - For `under_review`/`supervisor_approved`/`approved`: verify "View Report" button visible
   - Click "Submit Report" → routes to report form
   - Click "View Report" → routes to report view page
   - Click card itself → routes to milestone detail

7. **Sorting within status:**
   - Create multiple milestones with same status but different deadlines
   - Verify sorted by deadline ascending (oldest due first)
   - Verify within-status sort is stable

8. **Responsive:**
   - Mobile (375px): verify sections stack, buttons clickable, tabs scrollable
   - Tablet (768px): verify assignment grid 1-column
   - Desktop: verify assignment grid 2-column, max-width constraint

9. **RTL Arabic:**
   - Change browser language to Arabic or add `dir="rtl"` to html
   - Verify all text flows RTL (milestone names, project addresses)
   - Verify filter tab underline positions RTL
   - Verify no hardcoded left/right breaks layout
   - Verify status badges and buttons align RTL
   - Verify assignment cards align RTL

10. **Dark mode:**
    - Toggle dark mode via settings
    - Verify all cards readable, badges have good contrast
    - Verify status badges colors adjusted per design-spec §1.2

---

## 📚 Previous Story Learnings

**From Story 08-02 (Contractor Dashboard):**
- Dashboard shell established: `/dashboard` route, role-based rendering via component switch
- Skeleton loading pattern: use `PageSkeleton` for layout while data fetches
- Empty states critical: never leave user with blank section
- Badge counts and status tones: use `accent` for pending/active, `info` for under review, `default` for approved
- Error state pattern: section-level error handling with retry capability
- Sorting milestones: by deadline or priority (oldest/most urgent first)

**From Story 08-01 (Client Dashboard):**
- Dashboard design patterns: section cards, stat cards, action queues
- Responsive grid layout: `grid grid-cols-1 md:grid-cols-2` patterns
- Link navigation: from card to detail pages without losing context

**From Story 03-03 (Field Engineer Submits Report):**
- Report submission form and validation
- Milestone status transition on report submission
- Report data structure and fields

**From Story 02-01 (Project List Page):**
- Filter tabs and active tab management
- Grid layout patterns for card-based displays
- Sorting and state management for filtered lists

### Architecture Compliance

**Route structure:**
- `/dashboard` — role-based component rendering (consistent with other dashboards)
- `/assignments` — dedicated page route for detailed filtering and viewing

**State management:**
- Pinia stores for milestones, reports
- Computed properties for filtering and sorting
- No optimistic updates on read-only sections

**Components:**
- `<script setup lang="ts">` Vue 3 Composition API
- Props and emits TypeScript-typed
- No logic in templates
- Uses shadcn-vue primitives (Button, Card, Badge, Skeleton)

**API integration:**
- All calls through composables, never direct `$fetch` in components
- Mock pattern established: `__mocks__/` files for unavailable endpoints
- TODO comments for endpoints not yet available

**i18n:**
- All strings via i18n keys
- Keys follow `dashboard.fieldEngineer.*` and `pages.assignments.*` patterns
- Tested in both Arabic (RTL) and English (LTR)

### Latest Tech Information

**Vue 3.5.x + Composition API:**
- `useAsyncData()` and `useFetch()` with same key share refs (Nuxt 4 improvement)
- Computed properties for derived filtering and sorting
- Ref for reactive tab state management

**Tailwind CSS v4:**
- Logical properties (ms-, ps-, text-start) mandatory for RTL
- Grid responsive: `grid grid-cols-1 md:grid-cols-2` for assignment cards
- Tabs: underline indicator via `border-b-2` with logical positioning

**shadcn-vue:**
- Badge component: use `accent` for active/pending, `info` for under review, `default` for approved
- Card component: `rounded-2xl bg-card border border-border` for standard card
- Skeleton component: use for loading states and layout skeleton
- Button component: primary for CTAs (Submit Report), secondary for navigation (View Report)
- Tabs component (if available from shadcn-vue): use for filter tabs

---

## 🎯 Definition of Done

- [ ] Route `/dashboard` accessible to field_engineer role only
- [ ] Dashboard displays active assignments with project name, milestone name, address
- [ ] "Submit Report" button routes to report form
- [ ] Dashboard displays recently submitted reports (last 5)
- [ ] Report cards show submission date and current milestone status
- [ ] Clicking report card routes to milestone detail
- [ ] Route `/assignments` accessible to field_engineer role only
- [ ] Assignments page default filter tab: "Active"
- [ ] Filter tabs work: All, Active, Under Review, Completed
- [ ] Tab counts accurate and update on filter change
- [ ] Assignment cards show project name, address, milestone name, order number
- [ ] Assignment cards show status badge with correct tone
- [ ] For active (in_progress) milestones: show "Submit Report" button
- [ ] For reviewed milestones: show "View Report" button
- [ ] Buttons route correctly to report submission/view pages
- [ ] Assignments sorted by: status priority (active first), then deadline ascending
- [ ] All text uses i18n keys (no hardcoded strings)
- [ ] Skeleton cards show while loading
- [ ] Empty and error states display correctly per filter tab
- [ ] RTL verified in Arabic (tabs position RTL, cards align RTL, no left/right hardcodes)
- [ ] Responsive design verified (mobile 1-column, desktop 2-column)
- [ ] Dark mode verified (colors per design-spec §1)
- [ ] No console errors or warnings
- [ ] TypeScript: strict mode, no `any` types
- [ ] Components follow `<script setup lang="ts">` pattern
- [ ] No unused imports or variables

---

## 📚 Reference Documentation

| Document | Section | Why relevant |
|---|---|---|
| `CLAUDE.md` | §0, §3, §8, §12 | Behavioral guidelines, tech stack, state management, definition of done |
| `CLAUDE.md` | §6, §9 | User roles, i18n RTL requirements |
| `docs/design-spec.md` | §1–§5 | Colors, typography, dashboard shell, components, status tones |
| `docs/design-spec.md` | §7.4 | Field engineer dashboard visual spec |
| `docs/api-contracts.md` | Milestone, Report sections | Data contracts for API calls |
| `docs/status-flows.md` | Milestone flow, Report flow | Valid status transitions |
| Previous stories | 02-01, 03-03, 08-01, 08-02 | Patterns for filtering, report submission, dashboard structure |

---

**Created by:** BMad Ultimate Context Engine  
**Last Updated:** 2026-05-09  
**Ready for:** Dev implementation via `/bmad:dev-story` skill
