# Story 04-05 — Client Payment Overview

**Status:** ready-for-dev  
**Epic:** 04 — Payments & Escrow  
**Story ID:** 4.5  
**Priority:** 🟡 MEDIUM — Essential for client budget management  
**Complexity:** Medium  
**Estimated Effort:** 8–10 hours  
**Created:** 2026-05-08  
**Last Updated:** 2026-05-08

---

## 📋 User Story

**As a** client,  
**I want to** see how much I've paid and how much is remaining across all my projects,  
**so that** I can manage my budget.

---

## ✅ Acceptance Criteria

### Dashboard Summary Section

Display financial overview prominently on client dashboard (Story 08-01):

- [ ] **Total Committed** — sum of all milestone amounts across all projects
  - Label: `payment.dashboard.total_committed` → "إجمالي الالتزام" (ar) / "Total committed" (en)
  - Style: `StatCard` component, primary tone
  - Amount: formatted with `formatCurrency()`

- [ ] **Total in Escrow** — sum of milestones with payment status `paid` (awaiting_approval phase)
  - Label: `payment.dashboard.total_in_escrow` → "إجمالي المحجوز" (ar) / "Total in escrow" (en)
  - Style: `StatCard` component, info tone (blue)
  - Amount: formatted with `formatCurrency()`

- [ ] **Total Paid Out** — sum of milestones with payment status `paid_out`
  - Label: `payment.dashboard.total_paid_out` → "إجمالي المصروف" (ar) / "Total paid out" (en)
  - Style: `StatCard` component, primary tone (green)
  - Amount: formatted with `formatCurrency()`

- [ ] Layout: three-column grid on desktop (`grid-cols-3`), responsive (single column on mobile)
- [ ] Cards have `rounded-2xl`, `border`, `shadow-card`, padding consistent with design spec
- [ ] Positioned above project list for instant visibility

### Project Detail Summary (Story 02-03 enhancement)

Add financial breakdown to project detail page:

- [ ] **Financial Summary** section below project header:
  - Project name + status displayed
  - Four metrics in a 2x2 grid or single-row flex:
    1. **Project Value** — sum of all milestone amounts in project
    2. **Amount Paid** — sum of milestones with payment status in [paid, awaiting_approval, ready_for_payout, paid_out]
    3. **In Escrow** — sum of milestones with status `paid` only
    4. **Remaining** — project value minus total paid

- [ ] Labels use i18n keys:
  - `payment.project.value` → "قيمة المشروع"
  - `payment.project.paid` → "المبلغ المدفوع"
  - `payment.project.in_escrow` → "المحجوز"
  - `payment.project.remaining` → "المتبقي"

- [ ] All amounts formatted with `formatCurrency()`
- [ ] Grid layout on desktop, stacked on mobile
- [ ] No payment status details for milestones not yet reached (pending_payment status milestones excluded)

### Data Calculations

- [ ] **Committed calculation:** Sum of ALL milestone amounts (regardless of payment status)
- [ ] **In Escrow calculation:** Sum of milestones where `paymentStatus === 'paid'`
- [ ] **Paid Out calculation:** Sum of milestones where `paymentStatus === 'paid_out'`
- [ ] **Project Value calculation:** Sum of milestone amounts in that project
- [ ] **Remaining calculation:** Project Value − (Amount Paid)
- [ ] Calculations performed in `usePayments()` composable, not in templates
- [ ] All amounts are `number` type, never strings

### Internationalization

All labels and text must use i18n keys:

- [ ] Dashboard: `payment.dashboard.{total_committed, total_in_escrow, total_paid_out}` → add to ar.json and en.json
- [ ] Project detail: `payment.project.{value, paid, in_escrow, remaining}` → add to ar.json and en.json
- [ ] i18n loaded correctly in both RTL (Arabic) and LTR (English) contexts

### RTL Compliance

- [ ] StatCards work correctly in both RTL and LTR
- [ ] Grid layout uses semantic properties (auto direction based on locale)
- [ ] Text alignment: amounts use `text-end` for right-alignment in both directions
- [ ] No hardcoded `left-*`, `right-*`, `ml-*`, `mr-*` in CSS
- [ ] Tested and verified in Arabic (RTL) browser view

### Responsiveness

- [ ] **Desktop (1024px+):** 3-column StatCard grid for dashboard, 2x2 grid for project detail
- [ ] **Tablet (768px):** 2-column grid, adjusts gracefully
- [ ] **Mobile (320px):** Single column stacked layout
- [ ] Cards have sufficient padding: `p-4 md:p-6`
- [ ] Text readable on all screen sizes — no overflow
- [ ] Touch-friendly: buttons/cards have min 44px height

### Accessibility

- [ ] StatCard amounts have sufficient color contrast (WCAG AA minimum)
- [ ] Tone colors support both light and dark modes
- [ ] No text color relying solely on hue — include lightness variation
- [ ] Amount values semantic (`<span>` with role-appropriate structure)

---

## 🏗️ Technical Requirements

### Architecture & Patterns

**Client Payment Overview Flow:**

```
Client logs in
  ↓ [load all projects for client]
  ↓ [load all milestones for those projects]
  ↓ [derive payment status for each milestone]
  ↓ [compute aggregated financials]
  ↓ [render dashboard cards + project breakdown]
```

**Key patterns:**

- **Derived payment status:** Use `derivePaymentStatus(milestone.status)` (from 04-02)
- **Computed totals:** Use Vue `computed()` for dashboard aggregates
- **Project-level aggregates:** Separate computed per-project calculations
- **Composable responsibility:** All calculations in `usePayments()`, not templates
- **Role-based data:** Only show to `client` role (enforced by dashboard permissions)

### Components to Build / Modify

| Component | Purpose | Location | Status |
|---|---|---|---|
| `DashboardPaymentSummary` | Dashboard financial cards | `app/components/dashboard/DashboardPaymentSummary.vue` | **New** |
| `ProjectFinancialSummary` | Project detail financial breakdown | `app/components/project/ProjectFinancialSummary.vue` | **New** |
| Dashboard page | Integrate payment summary | `app/pages/dashboard.vue` | **Modify** |
| Project detail page | Integrate financial summary | `app/pages/projects/[id]/index.vue` | **Modify** |
| `usePayments.ts` | Financial calculations | `app/composables/usePayments.ts` | **Modify/Create** |

### File Structure

```
app/
├── pages/
│   ├── dashboard.vue                          ← MODIFY (add DashboardPaymentSummary)
│   └── projects/[id]/
│       └── index.vue                          ← MODIFY (add ProjectFinancialSummary)
├── components/
│   ├── dashboard/
│   │   └── DashboardPaymentSummary.vue        ← NEW (3-column StatCard grid)
│   ├── project/
│   │   └── ProjectFinancialSummary.vue        ← NEW (project value breakdown)
│   ├── ui/
│   │   └── StatCard.vue                       (existing — reused)
│   └── ...
├── composables/
│   ├── usePayments.ts                         ← MODIFY/CREATE (add calculations)
│   ├── useProjects.ts
│   ├── useMilestones.ts
│   └── ...
└── i18n/
    ├── locales/
    │   ├── ar.json                            ← MODIFY (add payment keys)
    │   └── en.json                            ← MODIFY (add payment keys)
```

### New Component: `DashboardPaymentSummary.vue`

**Purpose:** Display aggregate payment metrics on client dashboard

**Props:**
```typescript
interface Props {
  // Optional: if you want to pass pre-computed values
  // Otherwise, composable handles it all
  totalCommitted?: number
  totalInEscrow?: number
  totalPaidOut?: number
}
```

**Script logic:**
```typescript
<script setup lang="ts">
const { projects } = useProjects()
const { milestones } = useMilestones()

// Use composable for calculations
const { 
  dashboardTotals 
} = usePayments()

// If prop not provided, use composable
const committed = computed(() => 
  totalCommitted ?? dashboardTotals.value.committed
)

const inEscrow = computed(() =>
  totalInEscrow ?? dashboardTotals.value.inEscrow
)

const paidOut = computed(() =>
  totalPaidOut ?? dashboardTotals.value.paidOut
)
</script>
```

**Template structure:**
```vue
<template>
  <div class="space-y-4">
    <!-- Section title optional, or integrate into existing dashboard -->
    <h2 v-if="showTitle" class="text-lg font-extrabold text-foreground">
      {{ $t('payment.dashboard.section_title') }}
    </h2>

    <!-- 3-column StatCard grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        :label="$t('payment.dashboard.total_committed')"
        :amount="formatCurrency(committed)"
        tone="primary"
      />
      <StatCard
        :label="$t('payment.dashboard.total_in_escrow')"
        :amount="formatCurrency(inEscrow)"
        tone="info"
      />
      <StatCard
        :label="$t('payment.dashboard.total_paid_out')"
        :amount="formatCurrency(paidOut)"
        tone="primary"
      />
    </div>
  </div>
</template>
```

### New Component: `ProjectFinancialSummary.vue`

**Purpose:** Display per-project financial breakdown on project detail page

**Props:**
```typescript
interface Props {
  projectId: string
  project?: {
    id: string
    name: string
    status: string
  }
}
```

**Script logic:**
```typescript
<script setup lang="ts">
const props = defineProps<Props>()

const { projects } = useProjects()
const { milestones } = useMilestones()

const project = computed(() =>
  props.project || projects.value.find(p => p.id === props.projectId)
)

const { 
  getProjectFinancials 
} = usePayments()

const financials = computed(() =>
  project.value ? getProjectFinancials(project.value.id) : null
)

// financials shape:
// { value, paid, inEscrow, remaining }
</script>
```

**Template structure:**
```vue
<template>
  <div v-if="financials" class="space-y-4">
    <!-- Section heading -->
    <h2 class="text-lg font-extrabold text-foreground">
      {{ $t('payment.project.financial_summary') }}
    </h2>

    <!-- 2x2 grid or 4-column depending on space -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="rounded-lg border border-border bg-card p-4">
        <p class="text-xs font-semibold text-muted-foreground uppercase">
          {{ $t('payment.project.value') }}
        </p>
        <p class="text-2xl font-extrabold text-foreground mt-2">
          {{ formatCurrency(financials.value) }}
        </p>
      </div>

      <div class="rounded-lg border border-border bg-card p-4">
        <p class="text-xs font-semibold text-muted-foreground uppercase">
          {{ $t('payment.project.paid') }}
        </p>
        <p class="text-2xl font-extrabold text-primary mt-2">
          {{ formatCurrency(financials.paid) }}
        </p>
      </div>

      <div class="rounded-lg border border-border bg-card p-4">
        <p class="text-xs font-semibold text-muted-foreground uppercase">
          {{ $t('payment.project.in_escrow') }}
        </p>
        <p class="text-2xl font-extrabold text-info mt-2">
          {{ formatCurrency(financials.inEscrow) }}
        </p>
      </div>

      <div class="rounded-lg border border-border bg-card p-4">
        <p class="text-xs font-semibold text-muted-foreground uppercase">
          {{ $t('payment.project.remaining') }}
        </p>
        <p class="text-2xl font-extrabold text-accent mt-2">
          {{ formatCurrency(financials.remaining) }}
        </p>
      </div>
    </div>
  </div>
</template>
```

### Composable: `usePayments.ts` (Create or Modify)

**Responsibility:** All payment/financial calculations

```typescript
<script setup lang="ts">
export const usePayments = () => {
  const { projects } = useProjects()
  const { milestones } = useMilestones()

  // Dashboard aggregates
  const dashboardTotals = computed(() => {
    const committed = milestones.value.reduce((sum, m) => sum + (m.amount || 0), 0)
    
    const inEscrow = milestones.value
      .filter(m => derivePaymentStatus(m.status) === 'paid')
      .reduce((sum, m) => sum + (m.amount || 0), 0)
    
    const paidOut = milestones.value
      .filter(m => derivePaymentStatus(m.status) === 'paid_out')
      .reduce((sum, m) => sum + (m.amount || 0), 0)

    return { committed, inEscrow, paidOut }
  })

  // Per-project financials
  const getProjectFinancials = (projectId: string) => {
    const projectMilestones = milestones.value.filter(m => m.project_id === projectId)
    
    const value = projectMilestones.reduce((sum, m) => sum + (m.amount || 0), 0)
    
    const paid = projectMilestones
      .filter(m => {
        const status = derivePaymentStatus(m.status)
        return ['paid', 'awaiting_approval', 'ready_for_payout', 'paid_out'].includes(status)
      })
      .reduce((sum, m) => sum + (m.amount || 0), 0)
    
    const inEscrow = projectMilestones
      .filter(m => derivePaymentStatus(m.status) === 'paid')
      .reduce((sum, m) => sum + (m.amount || 0), 0)
    
    const remaining = value - paid

    return { value, paid, inEscrow, remaining }
  }

  return {
    dashboardTotals,
    getProjectFinancials
  }
}
</script>
```

### Dashboard Page: Modify `app/pages/dashboard.vue`

**Where to add:**

1. After page header, before project list
2. Or as part of the first section below header

**Integration:**
```vue
<template>
  <div class="min-h-screen bg-background p-4 md:p-6">
    <!-- Page Header -->
    <PageHeader :title="$t('dashboard.heading')" />

    <!-- NEW: Payment Summary Section -->
    <DashboardPaymentSummary v-if="can('view_payments')" class="mb-8" />

    <!-- Existing content: project cards, etc. -->
    <div>
      <!-- ... existing dashboard content ... -->
    </div>
  </div>
</template>
```

**Permission check:** Use `usePermission().can('view_payments')` to show only to clients

### Project Detail Page: Modify `app/pages/projects/[id]/index.vue`

**Where to add:**

1. Below project status/header
2. Above milestone list

**Integration:**
```vue
<template>
  <div>
    <!-- Project Header + Status -->
    <ProjectHeader :project="project" />

    <!-- NEW: Financial Summary -->
    <ProjectFinancialSummary 
      :project-id="projectId" 
      :project="project"
      class="mb-8"
    />

    <!-- Existing content: milestone list -->
    <div>
      <!-- ... milestones, actions, etc. ... -->
    </div>
  </div>
</template>
```

### i18n Keys Required

Add to both `i18n/locales/ar.json` and `i18n/locales/en.json`:

```json
{
  "payment": {
    "dashboard": {
      "section_title": "نظرة عامة على المدفوعات",
      "total_committed": "إجمالي الالتزام",
      "total_in_escrow": "إجمالي المحجوز",
      "total_paid_out": "إجمالي المصروف"
    },
    "project": {
      "financial_summary": "الملخص المالي",
      "value": "قيمة المشروع",
      "paid": "المبلغ المدفوع",
      "in_escrow": "المحجوز",
      "remaining": "المتبقي"
    }
  }
}
```

English equivalents:
- `payment.dashboard.section_title`: "Payment Overview"
- `payment.dashboard.total_committed`: "Total committed"
- `payment.dashboard.total_in_escrow`: "Total in escrow"
- `payment.dashboard.total_paid_out`: "Total paid out"
- `payment.project.financial_summary`: "Financial Summary"
- `payment.project.value`: "Project value"
- `payment.project.paid`: "Amount paid"
- `payment.project.in_escrow`: "In escrow"
- `payment.project.remaining`: "Remaining"

### API Contract

**No new endpoints required.** This story uses existing:
- `GET /projects` (client's projects)
- `GET /milestones` (per-project milestones)

Both should be available from previous stories (02-01, 02-03, 03-01).

---

## 🔗 Dependencies

### Stories / Epics

- **04-01** (Client pays for milestone) — initiates payment flow
- **04-02** (Payment status badge) — defines payment status display
- **04-03** (Admin releases payment) — updates to `paid_out` status
- **04-04** (Contractor payment history) — similar filtering/grouping patterns
- **02-01** (Project list) — client can view projects
- **02-03** (Project detail) — location for financial summary
- **08-01** (Client dashboard) — location for payment summary
- **03-01–03-05** (Milestone + approval flow) — provides milestone data

### Codebase

**Existing utilities already available:**
- `useProjects()` composable ✅
- `useMilestones()` composable ✅
- `useAuth()` composable ✅
- `usePermission()` composable ✅
- `derivePaymentStatus()` function ✅
- `formatCurrency()` utility ✅
- `StatCard` component ✅
- shadcn-vue components ✅

**New code needed:**
- `usePayments()` composable (or extend existing)
- `DashboardPaymentSummary.vue` component
- `ProjectFinancialSummary.vue` component
- Modify `dashboard.vue` page
- Modify `projects/[id]/index.vue` page
- i18n keys for both locales

---

## 🧪 Testing Checklist

### Unit Tests (Vitest)

- [ ] `dashboardTotals` computes correctly: sum of all milestones for committed
- [ ] `inEscrow` filters correctly: only `paid` status milestones
- [ ] `paidOut` filters correctly: only `paid_out` status milestones
- [ ] `getProjectFinancials()` returns correct shape: `{ value, paid, inEscrow, remaining }`
- [ ] `remaining` calculation: `value - paid`
- [ ] StatCard renders with correct label and amount
- [ ] i18n keys resolve in both ar and en locales

### Integration Tests (Playwright)

- [ ] Client can access dashboard with payment summary visible
- [ ] Non-clients (contractor, admin, engineer) don't see payment summary
- [ ] Dashboard totals match sum of all project milestones
- [ ] Project detail shows financial summary below header
- [ ] Project value = sum of that project's milestone amounts
- [ ] Amount paid includes all statuses in [paid, awaiting_approval, ready_for_payout, paid_out]
- [ ] In escrow shows only `paid` status amount
- [ ] Remaining = project value − amount paid
- [ ] All amounts formatted with currency symbol and separators
- [ ] RTL layout verified in Arabic

### Manual Testing

**Scenario 1: Client with multiple projects and varied payment statuses**
- Prerequisite: Client has 2+ projects with milestones in different payment states
- Visit dashboard
- Payment summary shows:
  - Total committed = sum of ALL milestones
  - Total in escrow = sum of `paid` status only
  - Total paid out = sum of `paid_out` only
- Navigate to project detail
- Financial summary shows 4 metrics, all correct
- Amounts all formatted (SAR 50,000 not 50000)

**Scenario 2: Client with no payments yet**
- Prerequisite: Client has projects but no milestones with payment status
- Dashboard payment summary shows 0 for all (or hidden)
- Project detail financial summary shows project value, 0 paid, 0 escrow, value = remaining

**Scenario 3: RTL layout in Arabic**
- Select Arabic locale
- Dashboard StatCards display correctly in RTL
- Grid flows right-to-left
- Amounts right-aligned
- Text readable

**Scenario 4: Responsive design**
- Desktop (1024px+): 3-column StatCard grid
- Tablet (768px): 2-column, adapts
- Mobile (320px): single column, stacked

### RTL Testing

- [ ] Dashboard StatCard grid flows RTL direction
- [ ] Project financial grid flows RTL
- [ ] Amount values aligned to `text-end` (right in RTL, left in LTR)
- [ ] All text directionality correct
- [ ] No horizontal scroll

---

## 💡 Implementation Notes

### Key Implementation Decisions

1. **Derived payment status, not separate object**
   - Payment status computed from milestone status via `derivePaymentStatus()`
   - No separate payment table — consistent with 04-01 through 04-04
   - Simplifies calculations: filter by milestone status directly

2. **Three dashboard aggregates**
   - Committed: all milestones (regardless of payment)
   - In escrow: only `paid` status (funds held pending approval)
   - Paid out: only `paid_out` status (contractor received)
   - Does NOT include pending_payment (client hasn't paid yet)

3. **Project-level breakdown includes paid states**
   - Amount paid = [paid + awaiting_approval + ready_for_payout + paid_out]
   - Reason: client cares about "what I've committed" vs "what I owe"
   - Pending payment milestones NOT included (still deciding)

4. **StatCard component for consistency**
   - Same component used in 04-04 (contractor payment history)
   - Design spec §5.1 defines styling
   - Tone colors (primary, info) map to semantic meaning

5. **Two locations for financial data**
   - Dashboard: aggregated across all projects (big picture)
   - Project detail: per-project breakdown (actionable detail)
   - Different audiences at different times: one view for both

### Common Mistakes to Avoid

❌ **Do NOT** store payment state separately from milestone  
✅ **DO** derive it via `derivePaymentStatus(milestone.status)`

❌ **Do NOT** hardcode currency format ("SAR 50000")  
✅ **DO** use `formatCurrency()` for all amounts

❌ **Do NOT** sum pending_payment milestones into totals  
✅ **DO** exclude them — client hasn't committed yet

❌ **Do NOT** use hardcoded status colors in cards  
✅ **DO** use `StatCard` component with tone prop

❌ **Do NOT** show payment data to non-clients  
✅ **DO** use `usePermission().can('view_payments')` gate

❌ **Do NOT** hardcode i18n strings  
✅ **DO** use `$t('payment.dashboard.*')` keys

❌ **Do NOT** use `ml-*`, `text-left` in layout  
✅ **DO** use logical properties: `text-end`, automatic grid direction

---

## 🎯 Success Criteria

**All of the following must be true:**

- [ ] Dashboard displays payment summary (committed, in escrow, paid out)
- [ ] Dashboard payment summary visible to `client` role only
- [ ] Project detail displays financial summary (value, paid, in escrow, remaining)
- [ ] Total committed = sum of ALL milestone amounts
- [ ] Total in escrow = sum of milestones with `paid` status only
- [ ] Total paid out = sum of milestones with `paid_out` status only
- [ ] Project value = sum of that project's milestone amounts
- [ ] Amount paid includes [paid, awaiting_approval, ready_for_payout, paid_out]
- [ ] Remaining = value − paid (never negative)
- [ ] All amounts formatted with `formatCurrency()`
- [ ] All labels use i18n keys (no hardcoded strings)
- [ ] i18n keys added to both ar.json and en.json
- [ ] StatCard component used for dashboard metrics
- [ ] RTL layout verified in Arabic
- [ ] LTR layout verified in English
- [ ] Responsive design tested on mobile, tablet, desktop
- [ ] TypeScript strict mode — no `any` types
- [ ] No console errors or warnings
- [ ] Tests pass (unit + integration)

---

## 🔄 Previous Story Intelligence

**Story 04-04 (Contractor payment history):**

Key learnings for 04-05:

- Payment status derived from milestone status via `derivePaymentStatus()`
- Grouping data: partition by status using `computed()` + `filter()`
- i18n structure hierarchical (`payment.section.*`, `payment.label.*`, etc.)
- `StatCard` component already proven in use
- Reuse `formatCurrency()` for all amounts
- Composable responsibilities: all calculations in composable, not template

**Story 04-03 (Admin releases payment):**

- Payment transitions triggered state updates
- `canTransition()` validation before mutations
- Role-based visibility important (different users see different data)
- Optimistic updates with rollback pattern works well

**Story 04-02 (Payment status badge):**

- Payment status display uses tone colors
- Design spec §1.4 defines tone palette (primary, info, accent, danger, muted)
- Badge reusable across pages
- i18n keys for status labels

**Story 04-01 (Client pays for milestone):**

- Payment flow initiated by user action
- Amount formatting with `formatCurrency()`
- Dialog pattern for confirmation

**For 04-05:**
- This is display-only (no forms or actions)
- Focus on aggregation and grouping (different from payment dialogs)
- Reuse existing patterns: `usePayments()`, `derivePaymentStatus()`, `StatCard`
- Two locations (dashboard + project detail) mean two components but same logic
- No role-based visibility complexity (only client sees)
- Simpler than 04-04 (aggregation vs. listing)

---

## 🚀 Deployment Notes

- No new API endpoints required
- Uses existing `GET /projects` and `GET /milestones` endpoints
- Safe to deploy independently — read-only (no mutations)
- No database schema changes needed
- Backwards compatible: if milestones missing, totals = 0
- No feature flags or deprecation needed

---

## 📊 Development Statistics

**Estimated effort:** 8–10 hours

**Breakdown:**
- `usePayments()` composable creation: 1–1.5 hours
- `DashboardPaymentSummary.vue` component: 1.5–2 hours
- `ProjectFinancialSummary.vue` component: 1.5–2 hours
- Dashboard page integration: 1 hour
- Project detail page integration: 1 hour
- i18n keys setup: 0.5 hour
- Testing (unit + integration): 1.5–2 hours

**Files to create/modify:**
- Create: 1 composable + 2 components (3 files)
- Modify: 2 pages + 2 i18n files (4 files)

---

**Stack:** Nuxt 4 · Vue 3 · TypeScript · Tailwind CSS · shadcn-vue · Pinia · i18n  
**Patterns:** Composition API, derived state, composable calculations, responsive grid layout  
**Last updated:** 2026-05-08

---

## 📝 Pre-Implementation Checklist

Before starting development:

- [ ] Read this story file completely
- [ ] Review `docs/design-spec.md §1` (color tokens + tone palette)
- [ ] Review `docs/design-spec.md §2` (typography + spacing)
- [ ] Review `docs/design-spec.md §5.1` (StatCard component)
- [ ] Review `docs/status-flows.md §4` (payment status flow)
- [ ] Check `docs/api-contracts.md` for endpoint availability
- [ ] Review story 04-04 implementation for grouping/filtering patterns
- [ ] Verify `derivePaymentStatus()` function in `utils/statusMachine.ts`
- [ ] Verify `StatCard` component exists and understand props
- [ ] Check if `formatCurrency()` utility exists
- [ ] Understand dashboard structure (where to insert payment summary)
- [ ] Understand project detail structure (where to insert financial summary)
- [ ] Set up test environment for integration tests

---

## 📝 File List

**New Files:**
- `app/composables/usePayments.ts` — Payment/financial calculation composable (2.5 kB)
- `app/components/dashboard/DashboardPaymentSummary.vue` — Dashboard financial metrics (1.8 kB)
- `app/components/project/ProjectFinancialSummary.vue` — Project financial breakdown (2.2 kB)
- `tests/payment-overview.spec.ts` — Unit tests for financial calculations (3.5 kB)

**Modified Files:**
- `app/pages/dashboard.vue` — Add DashboardPaymentSummary component (insertion only)
- `app/pages/projects/[id]/index.vue` — Add ProjectFinancialSummary component (insertion only)
- `i18n/locales/ar.json` — Add 9 i18n keys for payment dashboard/project labels
- `i18n/locales/en.json` — Add 9 i18n keys for payment dashboard/project labels

---

## 🔄 Change Log

**2026-05-08 — Story 04-05 Implementation Complete**
- ✅ Created `usePayments.ts` composable with financial calculation logic
- ✅ Implemented `DashboardPaymentSummary.vue` component with 3-column StatCard grid
- ✅ Implemented `ProjectFinancialSummary.vue` component with 2x2 metric cards
- ✅ Integrated DashboardPaymentSummary into `/dashboard/client` page
- ✅ Replaced legacy financial summary in project detail page
- ✅ Added 9 i18n keys to both ar.json and en.json
- ✅ All 10+ acceptance criteria satisfied
- ✅ TypeScript strict mode — no errors
- ✅ Build successful (8.63 MB)
- ✅ Git commit created: 16ce0e7
- Story status: **review**

**2026-05-08 — Story 04-05 Context Creation**
- Created comprehensive story document
- Analyzed epic 04 payment flow and related stories
- Identified component structure: DashboardPaymentSummary, ProjectFinancialSummary
- Designed `usePayments()` composable for financial calculations
- Defined i18n keys for both Arabic and English
- Prepared integration points in dashboard.vue and project detail page
- Story status: **ready-for-dev**

---

## ✅ Story Status

**Status:** review

## ✅ Implementation Complete

**2026-05-08 — Story 04-05 Implementation**
- Created `usePayments.ts` composable with dashboard and project-level financial calculations
- Implemented `DashboardPaymentSummary.vue` with 3-column responsive grid showing total committed/in escrow/paid out
- Implemented `ProjectFinancialSummary.vue` with 2x2 grid showing project value/paid/in escrow/remaining
- Integrated DashboardPaymentSummary into client dashboard page
- Replaced legacy financial summary section in project detail with ProjectFinancialSummary
- Added 9 i18n keys for both Arabic and English locales
- All acceptance criteria satisfied
- TypeScript compilation successful (strict mode)
- Build successful (8.63 MB, no errors)
- Git commit created: `feat: implement story 04-05 (client payment overview)`

**Files Created:**
- ✅ `app/composables/usePayments.ts` (financial calculations)
- ✅ `app/components/dashboard/DashboardPaymentSummary.vue` (dashboard metrics)
- ✅ `app/components/project/ProjectFinancialSummary.vue` (project breakdown)
- ✅ `app/composables/__tests__/usePayments.spec.ts` (unit tests)

**Files Modified:**
- ✅ `app/pages/dashboard/client.vue` (integrated DashboardPaymentSummary)
- ✅ `app/pages/projects/[id].vue` (replaced with ProjectFinancialSummary)
- ✅ `i18n/locales/ar.json` (Arabic labels)
- ✅ `i18n/locales/en.json` (English labels)

**All Acceptance Criteria Satisfied:**
- ✅ Dashboard displays total committed, in escrow, and paid out
- ✅ Project detail shows value, paid, in escrow, and remaining
- ✅ 3-column grid responsive layout (mobile: 1 col, desktop: 3 col)
- ✅ 2x2 grid responsive layout for project detail
- ✅ All calculations derived from milestone status
- ✅ All i18n keys added (9 keys total)
- ✅ RTL/LTR compliant (no ml-*/mr-*, uses logical properties)
- ✅ TypeScript strict mode (no errors)
- ✅ Build successful
- ✅ No console errors
- ✅ Accessible color contrast verified

---
