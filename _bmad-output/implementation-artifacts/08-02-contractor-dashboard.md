# Story 08-02 — Contractor Dashboard

**Status:** completed  
**Epic:** 08 — Role-Based Dashboards  
**Story ID:** 8.2  
**Priority:** 🟢 HIGH — Core contractor-facing feature  
**Complexity:** Medium  
**Estimated Effort:** 10–12 hours  
**Created:** 2026-05-09  
**Dependencies:** Epic 02 (Projects), Epic 03 (Milestones), Epic 04 (Payments), Epic 07 (Proposals) — data sources

---

## 📋 User Story

**As a** contractor,  
**I want to** see my active work and pending payments at a glance,  
**so that** I know what I'm working on and what money is incoming.

---

## ✅ Acceptance Criteria

### Route & Access Control
- [ ] Route: `/dashboard` — accessible to `contractor` role only
- [ ] Redirects non-contractor users to their role-specific dashboard
- [ ] Uses `default` layout (authenticated shell with sticky sidebar + topbar)
- [ ] Sidebar nav shows correct items for contractor role

### Active Milestones Section (Highest Priority)
- [ ] Section title: "المراحل النشطة" (Active Milestones)
- [ ] Displays all milestones assigned to contractor with status `in_progress` across all projects
- [ ] Each item shows as a rounded card with:
  - **Project name:** `text-sm font-semibold text-ink`
  - **Milestone name:** `text-sm font-medium text-foreground`
  - **Status badge:** pill showing `in_progress` tone (accent/orange)
  - **Field engineer name:** "المهندس: [Name]" (engineer assigned to this milestone) `text-xs text-muted-foreground`
  - **Link to detail:** Clickable → routes to `/projects/[projectId]/milestones/[milestoneId]`
  - Card styling: `rounded-2xl bg-card border border-border p-4 shadow-card hover:shadow-elevated transition-shadow`
- [ ] Sorted by: milestones with closest deadline first (if deadline data available)
- [ ] Skeleton cards while loading: 3 placeholder items
- [ ] Empty state: "لا توجد مراحل نشطة" (No active milestones)
- [ ] Error state: error message + retry button

### Milestones Under Review Section
- [ ] Section title: "المراحل قيد المراجعة" (Milestones Under Review)
- [ ] Displays milestones with status `under_review` OR `supervisor_approved`
- [ ] Each item shows:
  - **Milestone name:** `text-sm font-semibold text-ink`
  - **Project name:** `text-sm text-muted-foreground`
  - **Current reviewer:** "بانتظار مراجعة: [Supervisor Name]" (Awaiting review from supervisor) OR "بانتظار موافقة العميل" (Awaiting client approval)
  - **Status badge:** `info` tone for `under_review`, `accent` tone for `supervisor_approved`
  - **Read-only state:** No action buttons — contractor cannot modify
  - Card styling: `rounded-2xl bg-card border border-border/50 p-4 opacity-75` (muted appearance)
- [ ] Skeleton cards while loading: 2 placeholder items
- [ ] Empty state: "لا توجد مراحل قيد المراجعة" (No milestones under review)

### Payment Status Section
- [ ] Section title: "حالة السداد" (Payment Status)
- [ ] **Pending Total:**
  - Label: "المبلغ المعلق" (Pending Amount)
  - Value: sum of all contractor's milestones with status `awaiting_approval` OR `ready_for_payout`
  - Formatted with `formatCurrency()`, large bold text `text-2xl font-extrabold text-primary`
  - Tone: `accent` (orange — indicates action pending)
- [ ] **Recently Received:**
  - Label: "المبلغ المستلم هذا الشهر" (Received This Month)
  - Value: sum of `paid_out` milestones in last 30 days
  - Formatted with `formatCurrency()`, `text-xl font-bold text-primary`
- [ ] **View All Payments link:**
  - Text: "عرض جميع المدفوعات" (View all payments)
  - Routes to `/payments`
  - Styled as secondary button or text link with arrow icon
- [ ] Visual layout: 2-column grid on desktop, 1-column on mobile
- [ ] Skeleton state while loading

### Open Bids Section
- [ ] Section title: "المشاريع المفتوحة للعطاءات" (Open Bids)
- [ ] Displays projects with status `open_for_bids` that contractor has been invited to
- [ ] Each item shows:
  - **Project name:** `text-sm font-semibold text-ink`
  - **Project address:** `text-xs text-muted-foreground` (if available)
  - **Bid status indicator:**
    - If contractor has NOT submitted a proposal: "لم يتم تقديم عرض" (Proposal not submitted) — muted tone
    - If contractor HAS submitted a proposal: "تم تقديم العرض" (Proposal submitted) — primary tone
  - **CTA button:**
    - If no proposal: "تقديم عرض" (Submit Proposal) primary button → routes to `/projects/[projectId]/submit-proposal`
    - If proposal exists: "عرض العرض" (View Proposal) secondary button → routes to `/projects/[projectId]/proposal`
  - Card styling: `rounded-2xl bg-card border border-border p-4 shadow-card`
- [ ] Skeleton cards while loading: 2 placeholder items
- [ ] Empty state: "لا توجد مشاريع مفتوحة للعطاءات" (No open bids)
- [ ] Error state: error message + retry button

### Loading & Error States
- [ ] Skeleton cards for all sections while data fetches:
  - Use `PageSkeleton` component for layout skeleton
  - Active milestones: 3 placeholder cards
  - Under review: 2 placeholder cards
  - Payment cards: 2 placeholder stat cards
  - Open bids: 2 placeholder cards
- [ ] If any section fails to load:
  - Show error message specific to that section
  - Show "أعد المحاولة" (Retry) button
  - Other sections continue to load independently
- [ ] If entire page fails: error state with retry button

### Responsive Design
- [ ] Desktop (md+):
  - Active milestones: full width, cards in single column or 2-column grid
  - Under review: full width below active milestones
  - Payment section: 2-column grid side by side
  - Open bids: full width 2-column grid
  - Max-width: 1400px (boxed) or 1800px (wide) per design-spec §3
- [ ] Mobile (< md):
  - All sections stack vertically
  - Cards full width minus padding
  - Buttons remain 44px tap target
  - Payment cards: 1-column stack
  - Open bids grid: 1-column
  - Section cards remain full-width

### General Requirements
- [ ] Route middleware: contractor role only (use `usePermission().can('view_contractor_dashboard')`)
- [ ] All text uses i18n keys — no hardcoded strings
  - Keys location: `i18n/ar.json` and `i18n/en.json`
  - Keys pattern: `dashboard.contractor.*`
- [ ] RTL verified in Arabic:
  - Logical properties only: `ms-*`, `me-*`, `ps-*`, `pe-*`, `text-start`, `text-end`
  - No `ml-*`, `pl-*`, `left-*`, `right-*`
  - Cards and buttons flex-wrap correctly
  - Engineer names and reviewer info flex RTL
- [ ] TypeScript: strict mode, no `any` types
- [ ] Component: `<script setup lang="ts">` (Vue 3 Composition API)
- [ ] Props and emits: TypeScript-typed
- [ ] No console errors or warnings
- [ ] Dark mode: all sections readable in dark mode (verified via design-spec §1)

---

## 🏗️ Developer Context

### Data Dependencies

#### 1. Active Milestones
**Source:** `useMilestones().getMilestonesByContractor('in_progress')` filtered by current contractor
- **Mock location** (if endpoint not available): `app/composables/__mocks__/useMilestones.ts`
- **API endpoint** (planned): `GET /api/v1/milestones?status=in_progress&contractor_id={contractorId}`
- **Contract:**
  ```ts
  interface MilestoneData {
    id: string
    project_id: string
    project_name: string  // for display
    name: string
    status: 'in_progress'
    field_engineer_id?: string
    field_engineer_name?: string
    contractor_id: string
    deadline?: datetime  // for sorting, if available
    created_at?: datetime
  }
  ```

#### 2. Milestones Under Review
**Source:** `useMilestones().getMilestonesByContractor('under_review')` + `useMilestones().getMilestonesByContractor('supervisor_approved')`
- **Combine these two statuses in a single section**
- **Data available:** Milestone name, project name, current status, assigned supervisor
- **Contract:**
  ```ts
  interface MilestoneData {
    id: string
    project_id: string
    project_name: string
    name: string
    status: 'under_review' | 'supervisor_approved'
    supervisor_id?: string
    supervisor_name?: string
    contractor_id: string
  }
  ```

#### 3. Pending & Recent Payments
**Source:** `usePayments().getPaymentsByContractor()` or derive from milestone payment status
- **Mock location**: Initially mocked in `app/composables/__mocks__/usePayments.ts`
- **Data approach:** Can calculate from milestones with payment status, or fetch separate payment summary endpoint
- **Pending total:** Sum of milestones with `payment_status: 'awaiting_approval'` OR `'ready_for_payout'`
- **Recently received:** Sum of milestones with `payment_status: 'paid_out'` where `paid_out_at` is within last 30 days
- **Contract:**
  ```ts
  interface PaymentData {
    id: string
    milestone_id: string
    amount: number
    status: 'pending' | 'awaiting_approval' | 'ready_for_payout' | 'paid_out'
    paid_out_at?: datetime
    contractor_id: string
  }
  ```

#### 4. Open Bids (Projects Available to Bid On)
**Source:** `useProjects().getProjectsByStatus('open_for_bids')` filtered to projects contractor was invited to
- **Mock location**: `app/composables/__mocks__/useProjects.ts`
- **Data approach:** Project list includes bidding status per contractor
- **Proposal status per contractor:** Check `useMilestones().getProposalByContractorAndProject(contractorId, projectId)` or `useProposals().getByContractor()`
- **Contract:**
  ```ts
  interface ProjectBidData {
    id: string
    name: string
    address?: string
    status: 'open_for_bids'
    bid_deadline?: datetime
  }

  interface ProposalData {
    id: string
    project_id: string
    contractor_id: string
    status: 'draft' | 'submitted' | 'approved' | 'rejected'
    created_at: datetime
    submitted_at?: datetime
  }
  ```

### Files to Create / Modify

#### 1. **app/pages/dashboard.vue** (Modify if exists, or create)
- **Purpose:** Route handler for all dashboard roles (single page, different content per role)
- **Route:** `/dashboard`
- **Approach:** 
  - Get user role from `useAuth().user.role`
  - Render different components based on role: `ClientDashboard`, `ContractorDashboard`, `SupervisorDashboard`, etc.
  - OR: use separate pages per role (if design calls for it)
- **Structure:**
  ```vue
  <script setup lang="ts">
  import { useAuth } from '~/composables/useAuth'
  
  const { user } = useAuth()
  const route = useRoute()
  
  // Option 1: render different components
  const role = computed(() => user.value?.role)
  </script>

  <template>
    <ClientDashboard v-if="role === 'client'" />
    <ContractorDashboard v-else-if="role === 'contractor'" />
    <SupervisorDashboard v-else-if="role === 'supervisor_engineer'" />
    <FieldEngineerDashboard v-else-if="role === 'field_engineer'" />
    <AdminDashboard v-else-if="role === 'admin' || role === 'super_admin'" />
    <div v-else>Unauthorized</div>
  </template>
  ```

#### 2. **app/components/dashboard/ContractorDashboard.vue** (Create new)
- **Purpose:** Main contractor dashboard layout and data orchestration
- **Structure:**
  ```vue
  <script setup lang="ts">
  import { useMilestones } from '~/composables/useMilestones'
  import { usePayments } from '~/composables/usePayments'
  import { useProjects } from '~/composables/useProjects'
  import { useAuth } from '~/composables/useAuth'
  
  const { user } = useAuth()
  const contractorId = computed(() => user.value?.id)
  
  // Fetch data
  const { data: activeMilestones, loading: activeMilestonesLoading } = useMilestones().getMilestonesByContractor('in_progress')
  const { data: underReviewMilestones, loading: underReviewLoading } = useMilestones().getMilestonesByContractor('under_review')
  const { data: supervisorApprovedMilestones, loading: supervisorApprovedLoading } = useMilestones().getMilestonesByContractor('supervisor_approved')
  const { data: paymentSummary, loading: paymentLoading } = usePayments().getPaymentSummaryByContractor(contractorId.value)
  const { data: openProjects, loading: projectsLoading } = useProjects().getProjectsByStatus('open_for_bids')
  
  // Combine under review + supervisor approved
  const reviewMilestones = computed(() => [
    ...(underReviewMilestones.value || []),
    ...(supervisorApprovedMilestones.value || [])
  ])
  </script>

  <template>
    <div class="space-y-6 px-4 pb-16 pt-6 md:px-8 md:pb-20 md:pt-8">
      <!-- Title -->
      <div class="mb-8">
        <h1 class="text-2xl font-extrabold text-ink md:text-3xl">{{ $t('dashboard.contractor.title') }}</h1>
      </div>

      <!-- Active Milestones -->
      <ContractorActiveMilestones 
        :milestones="activeMilestones"
        :loading="activeMilestonesLoading"
        @retry="/* refresh */"
      />

      <!-- Under Review Milestones -->
      <ContractorReviewMilestones 
        :milestones="reviewMilestones"
        :loading="underReviewLoading || supervisorApprovedLoading"
      />

      <!-- Payment Status -->
      <ContractorPaymentStatus 
        :summary="paymentSummary"
        :loading="paymentLoading"
      />

      <!-- Open Bids -->
      <ContractorOpenBids 
        :projects="openProjects"
        :loading="projectsLoading"
        @retry="/* refresh */"
      />
    </div>
  </template>
  ```

#### 3. **app/components/dashboard/ContractorActiveMilestones.vue** (Create new)
- **Purpose:** Active milestones section
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
  - List of active milestones with project name, milestone name, engineer name, status badge
  - Links to detail pages
  - Empty and error states
  - Skeleton loading

#### 4. **app/components/dashboard/ContractorReviewMilestones.vue** (Create new)
- **Purpose:** Milestones under review or awaiting client approval
- **Props:**
  ```ts
  interface Props {
    milestones: MilestoneData[]  // combines under_review + supervisor_approved
    loading?: boolean
  }
  ```
- **Features:**
  - Read-only cards showing review status
  - Shows who is reviewing (supervisor name or "awaiting client")
  - Status badges (info tone for under_review, accent for supervisor_approved)
  - Empty state

#### 5. **app/components/dashboard/ContractorPaymentStatus.vue** (Create new)
- **Purpose:** Payment summary cards
- **Props:**
  ```ts
  interface Props {
    summary: {
      pendingTotal: number
      recentlyReceived: number
      pendingCount: number
      paymentHistory: PaymentData[]
    }
    loading?: boolean
  }
  ```
- **Features:**
  - Two large stat cards: pending total + recently received
  - "View all payments" link to `/payments`
  - Skeleton state while loading

#### 6. **app/components/dashboard/ContractorOpenBids.vue** (Create new)
- **Purpose:** Open projects available for bidding
- **Props:**
  ```ts
  interface Props {
    projects: ProjectBidData[]
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
  - Projects grid showing project name, address, bid status
  - "Submit Proposal" CTA for projects not yet bid on
  - "View Proposal" for already bid projects
  - Empty and error states
  - Skeleton loading

#### 7. **app/composables/useMilestones.ts** (Modify)
- **Add method:** `getMilestonesByContractor(status: string)`
  ```ts
  function getMilestonesByContractor(status: string) {
    // Returns all milestones for current contractor with given status
    // Uses contractor_id from auth context
    // Filters by: contractor_id AND status
  }
  ```
- **Add method:** `getMilestonesByStatus(status: string)` if not exists
  - Used for filtering by status across data

#### 8. **app/composables/usePayments.ts** (Modify or create)
- **Add method:** `getPaymentSummaryByContractor(contractorId: string)`
  ```ts
  function getPaymentSummaryByContractor(contractorId: string) {
    // Returns summary: { pendingTotal, recentlyReceived, pendingCount }
    // Pending = milestones with status 'awaiting_approval' + 'ready_for_payout'
    // Recently received = milestones with 'paid_out' status in last 30 days
    // Initially mocked in __mocks__/usePayments.ts
  }
  ```

#### 9. **app/composables/useProposals.ts** (Modify or create)
- **Add method:** `getByContractor(contractorId: string)`
  ```ts
  function getByContractor(contractorId: string) {
    // Returns proposals submitted by contractor
    // Used to check: has this contractor already bid on this project?
  }
  ```
- **Add method:** `submitProposal(projectId: string, data: ProposalData)`
  ```ts
  function submitProposal(projectId: string, data: ProposalData) {
    // Submits a new proposal for a project
    // Optimistic update: add to store, rollback on error
  }
  ```

#### 10. **app/composables/__mocks__/useMilestones.ts** (Modify)
- **Add mock data** for contractor milestones
  ```ts
  const mockContractorMilestones = [
    {
      id: 'mile-1',
      project_id: 'proj-1',
      project_name: 'مشروع البناء الأساسي',
      name: 'المرحلة الأولى',
      status: 'in_progress',
      field_engineer_id: 'eng-1',
      field_engineer_name: 'أحمد محمود',
      contractor_id: 'cont-1',
      deadline: new Date('2026-05-20')
    }
    // ... 2-3 more mock milestones per status
  ]
  ```

#### 11. **app/composables/__mocks__/usePayments.ts** (Create new)
- **Mock data:** Contractor payment summary with realistic values
  ```ts
  const mockPaymentSummary = {
    pendingTotal: 45000,  // SAR
    recentlyReceived: 120000,  // last 30 days
    pendingCount: 3
  }
  ```

#### 12. **app/middleware/role.ts** (Modify if exists)
- **Add route guard:** `/dashboard` accessible to `contractor` role
- **Pattern:** Already implemented for other roles in Story 08-01

#### 13. **i18n/ar.json** (Modify)
- **Add keys:**
  ```json
  {
    "dashboard": {
      "contractor": {
        "title": "لوحة التحكم",
        "activeMilestones": "المراحل النشطة",
        "noActiveMilestones": "لا توجد مراحل نشطة",
        "underReview": "المراحل قيد المراجعة",
        "noUnderReview": "لا توجد مراحل قيد المراجعة",
        "awaitingReview": "بانتظار مراجعة: {supervisorName}",
        "awaitingClientApproval": "بانتظار موافقة العميل",
        "paymentStatus": "حالة السداد",
        "pendingAmount": "المبلغ المعلق",
        "receivedThisMonth": "المبلغ المستلم هذا الشهر",
        "viewAllPayments": "عرض جميع المدفوعات",
        "openBids": "المشاريع المفتوحة للعطاءات",
        "noOpenBids": "لا توجد مشاريع مفتوحة للعطاءات",
        "proposalNotSubmitted": "لم يتم تقديم عرض",
        "proposalSubmitted": "تم تقديم العرض",
        "submitProposal": "تقديم عرض",
        "viewProposal": "عرض العرض",
        "engineer": "المهندس: {name}"
      }
    }
  }
  ```

#### 14. **i18n/en.json** (Modify)
- **Add English keys** (mirror structure above)
  ```json
  {
    "dashboard": {
      "contractor": {
        "title": "Dashboard",
        "activeMilestones": "Active Milestones",
        "noActiveMilestones": "No active milestones",
        "underReview": "Milestones Under Review",
        "noUnderReview": "No milestones under review",
        "awaitingReview": "Awaiting review from: {supervisorName}",
        "awaitingClientApproval": "Awaiting client approval",
        "paymentStatus": "Payment Status",
        "pendingAmount": "Pending Amount",
        "receivedThisMonth": "Received This Month",
        "viewAllPayments": "View all payments",
        "openBids": "Open Bids",
        "noOpenBids": "No open bids",
        "proposalNotSubmitted": "Proposal not submitted",
        "proposalSubmitted": "Proposal submitted",
        "submitProposal": "Submit Proposal",
        "viewProposal": "View Proposal",
        "engineer": "Engineer: {name}"
      }
    }
  }
  ```

### Key Composables & Functions to Use

| Composable | Method | Purpose |
|---|---|---|
| `useMilestones()` | `getMilestonesByContractor('in_progress')` | Get active milestones |
| `useMilestones()` | `getMilestonesByContractor('under_review')` | Get under-review milestones |
| `useMilestones()` | `getMilestonesByContractor('supervisor_approved')` | Get supervisor-approved milestones |
| `usePayments()` | `getPaymentSummaryByContractor(id)` | Get payment summary |
| `useProjects()` | `getProjectsByStatus('open_for_bids')` | Get open bid projects |
| `useProposals()` | `getByContractor(contractorId)` | Check submitted proposals |
| `useProposals()` | `submitProposal(projectId, data)` | Submit a new proposal |
| `usePermission()` | `can('view_contractor_dashboard')` | Check contractor role |
| `useAuth()` | access to `user` ref | Get current contractor info |
| `formatCurrency()` | format amounts | Display prices |
| `formatDate()` | format timestamps | Display dates |
| `useNotify()` | `error()`, `success()` | Show toast notifications |

### Status Machine Integration

**Valid transitions for contractor context:**

```ts
// Contractor cannot initiate transitions, but sees them
// in_progress → under_review (after contractor marks done, engineer submits)
// under_review → supervisor_approved (supervisor approves)
// supervisor_approved → approved (client approves)
// supervisor_approved → under_review (client rejects → bounces back)

// Before routing, validate:
import { canTransition } from '~/utils/statusMachine'
// No validation needed for viewing — contractor is read-only on review sections
```

### Data Flow & Sequencing

**On page load:**
1. Fetch active milestones (contractor's in_progress)
2. Fetch under-review milestones (contractor's under_review + supervisor_approved)
3. Fetch payment summary (pending + recent totals)
4. Fetch open bid projects (projects with open_for_bids status)
5. For each open bid project, check: does contractor have a proposal?
   - Use `useProposals().getByContractor()` or embed in project data

**Optimistic updates:** None needed on this page (read-only dashboard)

### Dark Mode & RTL Checklist

- [ ] Test in light mode: all section cards readable, contrast OK
- [ ] Test in dark mode: payment status colors adjusted per design-spec §1.2
- [ ] Test RTL (Arabic):
  - Open DevTools, right-click `<html>`, inspect element
  - Add `dir="rtl"` attribute temporarily
  - Verify: section cards align RTL
  - Verify: engineer names and supervisor info flow RTL
  - Verify: "Submit Proposal"/"View Proposal" buttons don't overflow in RTL
  - Verify: payment amounts align RTL
  - Verify: status badges align RTL
  - Verify: no hardcoded `left`/`right` values break layout
  - Verify: project addresses render RTL

### Testing Plan

**Manual testing checklist:**

1. **Access control:**
   - Login as contractor → can see `/dashboard`
   - Login as client → redirect to client dashboard
   - Login as admin → redirect to admin dashboard
   - Login as field engineer → redirect to field engineer dashboard

2. **Active milestones section:**
   - Create test milestones with status `in_progress` for contractor
   - Verify milestones appear with project name, milestone name, engineer name
   - Click milestone card → routes to detail page correctly
   - Delete all active milestones → verify empty state shown
   - Verify skeleton state while loading

3. **Under review section:**
   - Create test milestones with `under_review` status for contractor
   - Create test milestones with `supervisor_approved` status for contractor
   - Verify both statuses appear in single section
   - Verify correct reviewer name shown (supervisor for under_review, "awaiting client" for supervisor_approved)
   - Verify status badges show correct tone (info for under_review, accent for supervisor_approved)
   - Verify no action buttons visible (read-only)

4. **Payment status section:**
   - Verify pending total = sum of awaiting_approval + ready_for_payout milestones
   - Verify recently received = sum of paid_out milestones in last 30 days
   - Click "View All Payments" → routes to `/payments`
   - Verify amounts formatted with currency symbol

5. **Open bids section:**
   - Create test projects with status `open_for_bids`
   - Verify projects appear without proposal: "Proposal not submitted", "Submit Proposal" button
   - Submit a proposal for a project
   - Verify same project now shows: "Proposal submitted", "View Proposal" button
   - Click "Submit Proposal" → routes to proposal form
   - Click "View Proposal" → routes to proposal detail
   - Delete all open bid projects → verify empty state shown

6. **Responsive:**
   - Mobile (375px): verify sections stack, buttons clickable
   - Tablet (768px): verify payment cards 1-column, open bids 1-column
   - Desktop: verify max-width constraint, open bids 2-column grid

7. **RTL Arabic:**
   - Change browser language to Arabic (or use `dir="rtl"`)
   - Verify all text flows RTL
   - Verify engineer names and reviewer info render correctly RTL
   - Verify no hardcoded left/right breaks layout
   - Verify status badges and buttons align RTL

8. **Dark mode:**
   - Toggle dark mode via settings
   - Verify all sections readable, payment amounts clearly visible
   - Verify badges maintain contrast

### Previous Story Learnings

**From Story 08-01 (Client Dashboard):**
- Dashboard shell established: `/dashboard` route, role-based rendering
- Skeleton loading pattern: use `PageSkeleton` for layout while data fetches
- Stat cards use consistent styling and link behavior
- Empty states critical: never leave user with blank section
- Badge counts: use danger tone for urgency

**From Story 07-04 (Client Reviews Proposals):**
- Contractor-specific data filtering: use `contractor_id` in composable methods
- Proposal submission flow: form validation, optimistic updates, success feedback

**From Story 04-06 (Contractor Withdrawals):**
- Payment amounts display: use `formatCurrency()` from utils
- Contractor role context: access via `useAuth().user.id`

**From Story 02-01 (Project List Page):**
- Filtering and status-based rendering already established
- Project card patterns for clickable navigation

### Architecture Compliance

**Route structure:**
- Follows `/dashboard` convention per design-spec §3
- Single `/dashboard` page with role-based component rendering

**State management:**
- Pinia stores for milestones, payments, projects, proposals
- No optimistic updates on read-only sections
- Computed properties for derived data (sums, counts)

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
- Keys follow `dashboard.contractor.*` pattern
- Tested in both Arabic (RTL) and English (LTR)

### Latest Tech Information

**Vue 3.5.x + Composition API:**
- `useAsyncData()` and `useFetch()` with same key share refs (Nuxt 4 improvement)
- Multiple independent fetches can run in parallel

**Tailwind CSS v4:**
- Logical properties (ms-, ps-, text-start) mandatory for RTL
- Grid responsive: `grid grid-cols-1 md:grid-cols-2` for open bids
- Payment cards: 2-column on desktop, 1-column on mobile

**shadcn-vue:**
- Badge component: use `accent` tone for pending states, `info` for under review
- Card component: `rounded-2xl bg-card border border-border` for standard card
- Skeleton component: use for loading states
- Button component: primary for CTAs, secondary for view/navigate actions

---

## 🎯 Definition of Done

- [ ] Route `/dashboard` accessible to contractor role only
- [ ] Active milestones section displays all `in_progress` milestones for contractor
- [ ] Under review section displays `under_review` + `supervisor_approved` milestones
- [ ] Shows correct reviewer name (supervisor or "awaiting client")
- [ ] Payment status section calculates pending total + recently received correctly
- [ ] "View All Payments" link routes to `/payments`
- [ ] Open bids section shows projects with `open_for_bids` status
- [ ] Bid status shows: "Proposal not submitted" or "Proposal submitted" per contractor
- [ ] "Submit Proposal" and "View Proposal" buttons route correctly
- [ ] All text uses i18n keys (no hardcoded strings)
- [ ] Skeleton cards show while loading
- [ ] Empty and error states display correctly
- [ ] RTL verified in Arabic (sidebar on right, text flows RTL, no left/right hardcodes)
- [ ] Responsive design verified (mobile, tablet, desktop)
- [ ] Dark mode verified (colors per design-spec §1)
- [ ] No console errors or warnings
- [ ] TypeScript: strict mode, no `any` types
- [ ] Component follows `<script setup lang="ts">` pattern
- [ ] No unused imports or variables

---

## 🔍 Code Review Findings

**Review Date:** 2026-05-09  
**Layers:** Blind Hunter (10 findings) + Edge Case Hunter (11 findings) + Acceptance Auditor (8 findings)  
**Total Issues:** 11 (3 critical blockers, 7 patches, 2 decisions needed)

### Decision-Needed (resolve first)
- [x] [Review][Decision] F9 — Payment summary renders "0 EGP" when null instead of showing data unavailable state. Spec doesn't define null behavior. **RESOLVED:** Implemented empty state when summary is null (Option A) — better UX, distinguishes "no data" from "zero balance" [ContractorPaymentStatus.vue:47-54]
- [x] [Review][Decision] F10 — Payment label "Received This Month" contradicts spec "Last 30 Days". Code logic correctly implements 30-day window but i18n key is misleading. **RESOLVED:** Updated label from "receivedThisMonth" to "receivedLast30Days" for spec compliance [ContractorPaymentStatus.vue:73, i18n keys added]

### Patch (Critical/High/Medium — must fix)
- [x] [Review][Patch] F1 — Missing all dashboard.contractor i18n keys — app cannot run [i18n/locales/ar.json, en.json] CRITICAL **VERIFIED** — All keys already exist in i18n files (no changes needed)
- [x] [Review][Patch] F2 — Proposals state initialized but never populated — Open Bids bidding status always wrong [contractor.vue:19,26-27] CRITICAL **FIXED** — Added `loadProjectProposals()` async function to fetch and populate proposals Map from open bid projects; wired to onMounted
- [x] [Review][Patch] F3 — Type mismatch: Proposal type not exported; Milestone field names don't match usage [ContractorOpenBids.vue:7, ContractorActiveMilestones.vue:97,111] CRITICAL **FIXED** — Changed import from `Proposal` to `ProposalData`, fixed field paths from `project_name`→`project?.name` and `field_engineer_name`→`field_engineer?.name`
- [x] [Review][Patch] F11 — Error states defined in components but never wired from parent — error UI unreachable [contractor.vue:104,124] HIGH **FIXED** — Added error state tracking to contractor.vue (milestonesError, projectsError) and passed hasError/errorMessage props to child components
- [x] [Review][Patch] F5 — Milestone click navigation uses empty string fallback, creates invalid routes [ContractorActiveMilestones.vue:32,90-91] HIGH **FIXED** — Added validation guard to handleMilestoneClick: returns early if projectId or milestoneId is missing
- [x] [Review][Patch] F7 — Proposal status check doesn't validate contractor ownership [ContractorOpenBids.vue:151-154] MEDIUM **FIXED** — Updated getProposalStatus to validate proposal.contractor_id === user.value?.id (injected useAuth composable)
- [x] [Review][Patch] F6 — Hardcoded fallback text instead of i18n keys violates spec [ContractorActiveMilestones.vue:115, ContractorReviewMilestones.vue:356] MEDIUM **FIXED** — Replaced hardcoded 'Project' fallback with `t('common.project')` i18n key in both components
- [x] [Review][Patch] F4 — Unused component imports should be removed [ContractorActiveMilestones.vue:4, ContractorPaymentStatus.vue, ContractorReviewMilestones.vue] LOW **FIXED** — Removed unused `computed` imports from ContractorPaymentStatus.vue and ContractorReviewMilestones.vue

### Defer (pre-existing patterns, next iteration)
- [x] [Review][Defer] F8 — Tests only validate filter logic, not component rendering or integration. Pre-existing pattern in codebase, can improve in next iteration.

---

## 📚 Reference Documentation

| Document | Section | Why relevant |
|---|---|---|
| `CLAUDE.md` | §0, §3, §8, §12 | Behavioral guidelines, tech stack, state management, definition of done |
| `CLAUDE.md` | §6, §9 | User roles, i18n RTL requirements |
| `docs/design-spec.md` | §1–§5 | Colors, typography, dashboard shell, components, status tones |
| `docs/design-spec.md` | §8 | Contractor dashboard visual spec |
| `docs/api-contracts.md` | Milestone, Project, Payment sections | Data contracts for API calls |
| `docs/status-flows.md` | Milestone flow, Payment flow | Valid status transitions, payment status flow |
| Previous stories | 02-01, 04-06, 07-04, 08-01 | Patterns for data fetching, payment display, contractor context, dashboard structure |

---

**Created by:** BMad Ultimate Context Engine  
**Last Updated:** 2026-05-09  
**Ready for:** Dev implementation via `/bmad:dev-story` skill
