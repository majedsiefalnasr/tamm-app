# Story 03-02 — Milestone Detail Page

**Status:** ready-for-dev  
**Epic:** 03 — Milestones, Reports & Approval Flow  
**Story ID:** 3.2  
**Priority:** 🔴 CRITICAL — Unblocks report viewing and all approval actions  
**Complexity:** High  
**Estimated Effort:** 10–12 hours  

---

## 📋 User Story

**As a** user,  
**I want to** see the full details of a milestone,  
**so that** I can review the report and take action.

---

## ✅ Acceptance Criteria

### Route & Navigation

- [ ] Route: `/projects/:id/milestones/:mid` exists
- [ ] Breadcrumb navigation: Home > Projects > [Project name] > [Milestone name]
- [ ] Back navigation button returns to project detail page
- [ ] Page title in topbar shows milestone name
- [ ] URL query params (if needed) don't break on refresh

### Milestone Header

- [ ] Displays milestone name prominently
- [ ] Shows milestone order/phase number
- [ ] Shows milestone amount in currency format
- [ ] Shows current status with `StatusTag` component (never raw text)
- [ ] Shows milestone description (if available)
- [ ] All text uses i18n keys — no hardcoded strings

### Report Display

- [ ] Fetches latest report for this milestone (if exists)
- [ ] Shows report content/notes in full
- [ ] Shows all report images in a grid layout:
  - Grid pattern: `grid grid-cols-2 md:grid-cols-3 gap-2`
  - Each image: `rounded-xl overflow-hidden aspect-video object-cover`
  - Images are clickable to open in lightbox (optional for MVP)
- [ ] Shows report submission date and submitter name
- [ ] Shows report status (draft, submitted, approved, rejected)
- [ ] If no report exists, shows empty state: "No report submitted yet"
- [ ] If report is draft, shows badge indicating draft status

### Report History

- [ ] Shows list of all past reports (chronological, newest first)
- [ ] Each history item shows:
  - Submission date
  - Submitter name (field engineer)
  - Report status (submitted, approved, rejected)
  - Preview text (first 100 chars of content)
  - "View details" button to expand/show full report
- [ ] Archived/rejected reports clearly marked
- [ ] Only shows submitted reports (not drafts unless current)
- [ ] Empty state if no history: "No report history"

### Approval Timeline

- [ ] Shows chronological timeline of all approvals/rejections at each stage:
  - `in_progress` → submitted by [engineer] at [time]
  - `under_review` → supervisor approval started
  - `supervisor_approved` → approved by [supervisor] at [time]
  - `approved` → approved by [client] at [time]
  - Rejections: "Rejected by [person] at [time] — Reason: [text]"
- [ ] Timeline is read-only (historical view)
- [ ] Each timeline entry includes:
  - Avatar of person who took action
  - Person's name and role
  - Timestamp (relative + absolute)
  - Action taken (approve/reject)
  - Additional context (reject reason, if any)
- [ ] Empty state if no timeline activity yet

### Action Buttons

- [ ] All action buttons from Story 03-01 available here:
  - Submit report (field_engineer, `in_progress` only)
  - View report (supervisor_engineer, `under_review` only)
  - Approve/Reject supervisor (supervisor_engineer, `under_review` only)
  - Approve/Reject client (client, `supervisor_approved` only)
  - Pay milestone (client, `not_started` only)
- [ ] Buttons positioned consistently (footer or sticky footer)
- [ ] All buttons validate via `canTransition()` before API call
- [ ] All buttons check permissions via `usePermission().can()`
- [ ] Action success updates page automatically (no manual refresh)
- [ ] Action error shows toast notification (no page break)
- [ ] Buttons disabled while action is in progress (loading state)

### Milestone Details Section

- [ ] Shows milestone metadata:
  - Order/phase number
  - Name
  - Description
  - Budget amount (formatted currency)
  - Status
  - Created date
  - Updated date
- [ ] Shows associated tasks:
  - List of all tasks for this milestone
  - Each task shows: title, assigned contractor (if any), completion status
  - Non-interactive (read-only) — no edit capability in this story
- [ ] Shows payment status badge (if payment system exists)
- [ ] All fields use i18n keys for labels

### Loading & Error States

- [ ] While fetching milestone data:
  - Show skeleton/loading state (use `PageSkeleton` component)
  - Disable all buttons until load completes
- [ ] If milestone not found (404):
  - Show error message: "Milestone not found"
  - Show back button to return to projects
- [ ] If fetch fails (other error):
  - Show error toast notification
  - Show retry button
  - Keep existing data visible if stale data available
- [ ] If report images fail to load:
  - Show broken image placeholder
  - Show image load error in toast (optional)
- [ ] All error states logged to console for debugging

### RTL & Internationalization

- [ ] All layout uses logical properties:
  - `ms-*` / `me-*` for margins
  - `ps-*` / `pe-*` for padding
  - `start-*` / `end-*` for positioning
  - `text-start` / `text-end` for text alignment
- [ ] All UI strings use i18n keys (no hardcoded text)
- [ ] Timeline and history items render correctly in RTL
- [ ] Image grid renders correctly in RTL (no directional dependency)
- [ ] Dates formatted using locale (Arabic/English)
- [ ] Currency formatted per locale

### Performance & UX

- [ ] Page loads milestone + latest report in single API call (batch if needed)
- [ ] Report images lazy-load (don't block initial render)
- [ ] No console errors or warnings
- [ ] Page title updates immediately on load
- [ ] Breadcrumb updates project name correctly
- [ ] Smooth scroll to section on action (e.g., scroll to timeline after approval)
- [ ] Back button works without page reload

---

## 🏗️ Developer Context

### Files to Create/Modify

1. **app/pages/projects/[id]/milestones/[mid].vue** — NEW (600–700 lines)
   - Main page component
   - Fetches milestone data on mount
   - Renders header, report section, history, timeline, and action buttons
   - Handles loading/error states
   - Manages breadcrumb and page title
   - Calls composable functions for actions (submit, approve, reject)

2. **app/components/milestone/MilestoneDetail.vue** — NEW (500+ lines)
   - Renders milestone metadata and details
   - Could be extracted into separate component if page gets too large
   - Shows all milestone fields, tasks, payment status
   - Reusable if detail view appears elsewhere

3. **app/components/milestone/ReportDisplay.vue** — NEW (300–400 lines)
   - Renders single report (content + images)
   - Handles image grid layout
   - Shows report metadata (date, submitter, status)
   - Reusable for report history items

4. **app/components/milestone/ReportHistory.vue** — NEW (250–350 lines)
   - Renders list of past reports
   - Each item shows summary + "View details" button
   - Expandable/collapsible history items
   - Toggles between summary and full view

5. **app/components/milestone/ApprovalTimeline.vue** — NEW (300–400 lines)
   - Renders chronological timeline of approvals/rejections
   - Each entry shows avatar, name, action, timestamp, reason (if reject)
   - Read-only historical view
   - RTL-safe timeline rendering

6. **app/composables/useMilestones.ts** — MODIFY/EXTEND
   - Add: `fetchMilestoneDetail(projectId, milestoneId)` — GET /projects/:id/milestones/:mid
   - Add: `fetchMilestoneHistory(milestoneId)` — GET /milestones/:id/reports (all, paginated)
   - Add: `fetchApprovalTimeline(milestoneId)` — GET /milestones/:id/timeline (or derive from responses)
   - Extend existing: `submitReport()`, `approveMilestone()`, `rejectMilestone()` to refresh page state
   - Ensure all functions call `canTransition()` before mutations
   - Ensure all functions use optimistic updates + rollback pattern

7. **shared/types/milestone.ts** — MODIFY/EXTEND
   - Extend `Milestone` type:
     ```ts
     export interface Milestone {
       // ... existing
       description?: string
       createdAt: string
       updatedAt: string
       tasks: Task[]
       reports: Report[]  // full history, not just latest
       timeline?: TimelineEntry[]
     }

     export interface TimelineEntry {
       id: string
       action: 'submitted' | 'approved' | 'rejected' | 'status_changed'
       actionBy: User
       actionAt: string
       status?: string  // milestone status after action
       reason?: string  // rejection reason, if applicable
       details?: Record<string, any>  // additional context
     }

     export interface Report {
       // ... existing
       status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'archived'
       submittedAt?: string
       submittedBy?: User
       images: Image[]
     }

     export interface Image {
       id: string
       url: string
       mimeType: string
       uploadedAt: string
     }
     ```

8. **app/components/milestone/MilestoneActions.vue** — MODIFY (from Story 03-01)
   - Already created, reuse on this page
   - Ensure consistency with button visibility matrix

9. **app/layouts/default.vue** — VERIFY
   - Ensure breadcrumb component exists and can be controlled via route meta
   - Ensure page title is set correctly for this route

10. **i18n/locales/ar.json** — MODIFY
    - Add keys:
      - `milestone.detail.title` → "تفاصيل المرحلة"
      - `milestone.detail.description` → "الوصف"
      - `milestone.detail.budget` → "الميزانية"
      - `milestone.detail.status` → "الحالة"
      - `milestone.detail.createdAt` → "تم الإنشاء في"
      - `milestone.detail.updatedAt` → "آخر تحديث"
      - `milestone.detail.noReport` → "لم يتم رفع أي تقرير بعد"
      - `milestone.report.submittedAt` → "تاريخ الرفع"
      - `milestone.report.submittedBy` → "رفع بواسطة"
      - `milestone.report.status` → "حالة التقرير"
      - `milestone.report.images` → "الصور"
      - `milestone.history.title` → "سجل التقارير"
      - `milestone.history.empty` → "لا توجد تقارير سابقة"
      - `milestone.history.viewDetails` → "عرض التفاصيل"
      - `milestone.timeline.title` → "خط زمني الاعتمادات"
      - `milestone.timeline.empty` → "لا توجد إجراءات بعد"
      - `milestone.timeline.submittedOn` → "تم الرفع على"
      - `milestone.timeline.approvedOn` → "تم الاعتماد في"
      - `milestone.timeline.rejectedOn` → "تم الرفض في"
      - `milestone.timeline.rejectionReason` → "سبب الرفض"
      - `milestone.error.notFound` → "لم يتم العثور على المرحلة"
      - `milestone.error.loadFailed` → "فشل تحميل تفاصيل المرحلة"

11. **i18n/locales/en.json** — MODIFY
    - English translations matching all ar.json keys above

12. **app/components/layout/Breadcrumb.vue** — VERIFY/CREATE IF MISSING
    - Renders breadcrumb with dynamic project name and milestone name
    - Clickable links back to projects list, project detail, etc.
    - RTL-safe rendering

### Implementation Notes

**Page Structure:**
```vue
<template>
  <div class="page-container">
    <!-- Breadcrumb -->
    <Breadcrumb :items="breadcrumbItems" />

    <!-- Loading State -->
    <PageSkeleton v-if="isLoading" />

    <!-- Error State -->
    <ErrorState v-else-if="error" :message="error" @retry="refetch" />

    <!-- Content -->
    <template v-else>
      <!-- Header Section -->
      <MilestoneHeader :milestone="milestone" />

      <!-- Details Tabs/Sections -->
      <div class="grid gap-6">
        <!-- Milestone Details -->
        <MilestoneDetail :milestone="milestone" />

        <!-- Latest Report Section -->
        <ReportDisplay
          v-if="milestone.latestReport"
          :report="milestone.latestReport"
          title="Latest Report"
        />
        <EmptyState v-else message="No report submitted yet" />

        <!-- Report History -->
        <ReportHistory :reports="reportHistory" />

        <!-- Approval Timeline -->
        <ApprovalTimeline :timeline="milestone.timeline || []" />

        <!-- Action Buttons -->
        <MilestoneActions
          :milestone="milestone"
          @action-complete="onActionComplete"
        />
      </div>
    </template>
  </div>
</template>
```

**Data Fetching Pattern:**
```ts
const route = useRoute()
const { milestone, isLoading, error, refresh } = await useMilestones().fetchMilestoneDetail(
  route.params.id,
  route.params.mid
)

const reportHistory = computed(() => {
  return milestone.value?.reports.filter(r => r.status !== 'draft') || []
})

const onActionComplete = async () => {
  // Refresh milestone data after action (approve/reject/submit)
  await refresh()
}
```

**Breadcrumb Data:**
```ts
const breadcrumbItems = computed(() => [
  { label: t('nav.home'), href: '/' },
  { label: t('nav.projects'), href: '/projects' },
  { label: project.value?.name, href: `/projects/${route.params.id}` },
  { label: milestone.value?.name, href: '#' }  // current page, no link
])
```

### API Contracts to Verify

**Check `docs/api-contracts.md` for these endpoints:**

1. **GET /projects/:projectId/milestones/:milestoneId** — Fetch single milestone with full details
   - Response: `{ data: Milestone, message?: string }`
   - Includes: name, description, amount, tasks, latest report, timeline
   - Status: Check if ✅ Available

2. **GET /milestones/:id/reports** — Fetch all reports for a milestone
   - Response: `{ data: Report[], message?: string }`
   - Includes: all past reports (paginated or all)
   - Status: Check if ✅ Available

3. **GET /milestones/:id/timeline** — Fetch approval timeline
   - Response: `{ data: TimelineEntry[], message?: string }`
   - Includes: all approvals, rejections, status changes with timestamps
   - Status: Check if ✅ Available

4. **POST /milestones/:id/reports** — Submit new report (from Story 03-03)
   - Request: `{ content, images: File[] }`
   - Status: Check if ✅ Available

5. **POST /milestones/:id/approve** — Approve milestone (from Story 03-04, 03-05)
   - Request: `{ role: 'supervisor_engineer' | 'client' }`
   - Status: Check if ✅ Available

6. **POST /milestones/:id/reject** — Reject milestone (from Story 03-04, 03-05)
   - Request: `{ reason: string }`
   - Status: Check if ✅ Available

**If any endpoint is NOT available:**
- Build the page component fully
- Create mock in `app/composables/__mocks__/useMilestones.ts`
- Add `// TODO: replace mock — <endpoint name>` comments
- When endpoint is delivered, swap mock for real API call

### Previous Story Intelligence

**From Story 03-01 (Milestone Card):**
- Status badge pattern: Use `StatusTag` component, never raw text
- Permission checks: Use `usePermission().can()`, never role strings
- Optimistic updates: Store state first, API second, rollback on error
- Action button visibility matrix: reuse exact logic from MilestoneActions
- i18n patterns: Nested keys, mirror between ar.json and en.json
- RTL support: Use logical properties only, test in Arabic
- Composable pattern: All API calls in composables, not components

**Applied to this story:**
- Same StatusTag pattern for milestone status
- Same permission pattern for button visibility
- Same optimistic update pattern for actions
- Same i18n structure for all labels
- Same RTL approach with logical properties
- Reuse MilestoneActions component directly from Story 03-01

**From Story 02-03 (Project Detail Page):**
- Page structure: Container with breadcrumb, header, content sections
- Navigation pattern: Use `navigateTo()` for route changes
- Loading states: Use skeleton/spinner components
- Error handling: Toast notifications + error states
- TypeScript: Import from `shared/types/`

**Applied to this story:**
- Breadcrumb with dynamic project/milestone names
- Loading skeleton while fetching
- Error toast + retry button
- TypeScript types from `shared/types/milestone`

### Critical Dependencies

1. **Story 03-01 must be complete first** — MilestoneActions component reused here
2. **API contracts must be defined** — Endpoints for milestone detail, reports, timeline
3. **Design spec must be finalized** — Report layout, timeline styling, button placement

---

## 🎯 Critical Implementation Guardrails

### ✅ Must-Have Checks BEFORE Starting

- [ ] Read `docs/design-spec.md` §9 (Project detail), §10 (Reports) completely
- [ ] Read `docs/status-flows.md` §1 (Milestone flow) for all valid transitions
- [ ] Verify Story 03-01 (Milestone Card) is complete — MilestoneActions component exists
- [ ] Verify `MilestoneActions` component can be imported and reused
- [ ] Verify route `/projects/:id/milestones/:mid` doesn't conflict with existing routes
- [ ] Verify `useMilestones` composable exists with state management
- [ ] Verify `StatusTag` component exists and renders all statuses
- [ ] Verify breadcrumb component exists or can be built
- [ ] Verify `PageSkeleton` and `ErrorState` components exist
- [ ] Verify project data is available in Pinia store (needed for breadcrumb)

### ✅ Must-Verify DURING Implementation

- [ ] Milestone data fetches on page mount (loading state shows)
- [ ] Milestone header displays name, amount, status correctly
- [ ] Latest report displays content + images in grid layout
- [ ] Report history shows all past reports (newest first)
- [ ] Approval timeline shows all status changes + approvals/rejections
- [ ] Each timeline entry shows: avatar, name, action, timestamp, reason (if reject)
- [ ] All action buttons appear based on role + status (from Story 03-01)
- [ ] Buttons validate via `canTransition()` before API call
- [ ] Buttons check permissions via `usePermission().can()`
- [ ] Action success updates page automatically (no manual refresh needed)
- [ ] Action error shows toast + page doesn't break
- [ ] Back button returns to project detail
- [ ] Breadcrumb shows: Home > Projects > [Project] > [Milestone]
- [ ] Breadcrumb items are clickable and navigate correctly
- [ ] Page title in topbar shows milestone name
- [ ] RTL layout tested: all elements align correctly in Arabic
- [ ] All UI strings use i18n keys — no hardcoded text
- [ ] Report images have proper error handling (broken image state)
- [ ] Dates formatted per locale (Arabic/English)
- [ ] Currency formatted per locale
- [ ] No console errors or warnings
- [ ] TypeScript strict mode compliance
- [ ] Build succeeds with no TypeScript errors

### ✅ Integration Points with Existing Code

**From Story 03-01 (Milestone Card):**
- Reuse `MilestoneActions` component directly (button visibility matrix)
- Use same `useMilestones` composable functions
- Use same `StatusTag` component for status display
- Use same permission checks via `usePermission().can()`
- Use same optimistic update pattern

**From Story 02-03 (Project Detail Page):**
- Breadcrumb component pattern (if exists)
- Page layout structure and styling
- Navigation back to project detail
- Loading state and error handling patterns

**From CLAUDE.md §5–11:**
- Use `useApi()` wrapper for all API calls (never direct `$fetch`)
- Use Pinia stores for state (not local component state)
- Use `canTransition()` before every approval/rejection
- Use `usePermission().can()` for permission checks (never role strings)
- Use shadcn-vue `Button` component for all buttons
- Use logical CSS properties for RTL safety
- Use i18n keys for all UI strings
- No `any` types in TypeScript

### ✅ What NOT to Do

- ❌ Make multiple API calls when one batch call would work
  - ✅ Fetch milestone + reports + timeline in single composable call
- ❌ Render action buttons inline in this page
  - ✅ Reuse `MilestoneActions` component from Story 03-01
- ❌ Use CSS margin/padding properties (`ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`)
  - ✅ Use logical properties (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`)
- ❌ Hardcode UI text in templates
  - ✅ Use i18n keys for all strings
- ❌ Skip `canTransition()` check before approval/rejection
  - ✅ Always validate transition before API call
- ❌ Direct API calls from component
  - ✅ Always use composable function from `useMilestones`
- ❌ Update milestone state without optimistic pattern
  - ✅ Always: optimistic update → API → rollback on error
- ❌ Render timeline in RTL-unsafe way
  - ✅ Use logical properties and flexbox direction awareness

---

## 🚀 Success Criteria (Definition of Done)

A story is marked ✅ **only when ALL of these are verified:**

### Functional
- [ ] Page loads milestone data on mount
- [ ] Breadcrumb renders with clickable links
- [ ] Milestone header shows name, amount, status (with StatusTag)
- [ ] Latest report displays if exists (content + images)
- [ ] Empty state shows if no report exists
- [ ] Report history shows all past reports (newest first)
- [ ] Each history item shows summary + view details button
- [ ] Approval timeline shows all status changes in chronological order
- [ ] Each timeline entry shows: person, action, timestamp, reason (if reject)
- [ ] All action buttons appear based on role + status
- [ ] Buttons only appear when user has permission
- [ ] Clicking action button executes composable function
- [ ] Action success updates page automatically
- [ ] Action error shows toast notification
- [ ] Back button navigates to project detail
- [ ] Page title updates in topbar
- [ ] Refresh works without page reload

### Quality
- [ ] All UI strings use i18n keys (no hardcoded text)
- [ ] Status strings from statusMachine.ts (never hardcoded)
- [ ] All action buttons validate via canTransition()
- [ ] Permissions checked via usePermission().can() (never role strings)
- [ ] All CSS uses logical properties (ms, me, ps, pe, start, end)
- [ ] RTL layout tested in Arabic — all elements align correctly
- [ ] TypeScript — no `any` types, strict compliance
- [ ] No console errors or warnings
- [ ] Loading states shown during fetch
- [ ] Error states handled gracefully
- [ ] Images have error handling (broken image state)
- [ ] Dates formatted per locale
- [ ] Currency formatted per locale
- [ ] Toast notifications for all outcomes (success/error)

### Testing
- [ ] Page loads with valid milestone ID
- [ ] Page shows 404 with invalid milestone ID
- [ ] All role/status combinations tested for button visibility
- [ ] All transitions validated via canTransition()
- [ ] Permissions properly enforced
- [ ] RTL layout tested
- [ ] Images lazy-load and display correctly
- [ ] History and timeline render with sample data
- [ ] No memory leaks from composables

### Integration
- [ ] Component integrates with Pinia store
- [ ] Route `/projects/:id/milestones/:mid` works without conflicts
- [ ] Breadcrumb links navigate correctly
- [ ] Back navigation works
- [ ] No breaking changes to Stories 03-01, 02-01 through 02-05

---

## 📚 Reference Documents

| Document | Section | Purpose |
|----------|---------|---------|
| `docs/design-spec.md` | §9 (Project detail), §10 (Reports) | **CRITICAL** — Report layout, timeline styling |
| `docs/status-flows.md` | §1 (Milestone flow) | **CRITICAL** — Valid transitions, timeline entries |
| `CLAUDE.md` | §5–11 | API rules, state management, permissions, i18n, RTL |
| `docs/api-contracts.md` | Milestone endpoints | Fetch detail, reports, timeline, approve, reject |
| Epic 03 spec | "Milestone detail page" section | Full acceptance criteria |
| Story 03-01 output | MilestoneActions component | Reuse for this page |
| Story 02-03 output | Project detail page | Integration point, navigation pattern |
| Story 02-05 output | Status badges, permission checks | Established patterns |

---

## 📝 Previous Story Intelligence (from Epic 03 & 02)

**Key learnings from Story 03-01 (Milestone Card):**

1. **Action button matrix:** Reuse exact logic from MilestoneActions component
2. **Permission enforcement:** Use `usePermission().can()` pattern, NEVER role strings
3. **Status display:** Use `StatusTag` component, never hardcoded colors
4. **Optimistic updates:** Update state first, API second, rollback on error
5. **Confirmation dialogs:** Show before destructive actions (rejection)
6. **i18n patterns:** Nested keys, mirror between ar.json and en.json
7. **RTL testing:** Always test in Arabic before marking done

**Applied to this story:**
- Reuse `MilestoneActions` component directly
- Same permission check pattern
- Same status display pattern
- Same optimistic update pattern
- Same confirmation dialog for rejections
- Same i18n structure
- Same RTL approach

**Key learnings from Story 02-03 (Project Detail Page):**
- Page structure with breadcrumb and header
- Navigation pattern with `navigateTo()`
- Loading state with skeleton component
- Error handling with toast notifications
- Component composition with tabs/sections

**Applied to this story:**
- Breadcrumb pattern (adapt for milestone)
- Navigation back to project detail
- Loading skeleton while fetching
- Error toast + retry button
- Section-based layout (header, details, report, history, timeline)

---

## 🔄 Git Intelligence

**Commit patterns from Epic 03-01:**
- Atomic commits: one component per commit
- Example: `feat: implement milestone detail page`
- Message format: `feat: <description>` for new features
- Files commonly modified together:
  - Page component + composable + types (3 files)
  - i18n translations (both ar.json and en.json)
  - Tests alongside implementation
  - Components + utilities

**Expected workflow:**
1. Create page component: `app/pages/projects/[id]/milestones/[mid].vue`
2. Create child components: ReportDisplay, ReportHistory, ApprovalTimeline
3. Extend `useMilestones` composable with new fetchers
4. Add types to `shared/types/milestone.ts`
5. Add i18n keys to ar.json and en.json
6. Test page with sample data
7. Build and verify no TypeScript errors

---

## ⏭️ What Comes Next (Epic 03 Unblocking)

This story unblocks full report viewing and approval actions:

1. **Story 03-01:** Cards show status + button matrix ✅ (done)
2. **Story 03-02 (THIS):** Detail page shows full history + all data
3. **Story 03-03:** "Submit report" button actually submits (form dialog)
4. **Story 03-04:** "Approve/Reject" buttons as supervisor (approval flow)
5. **Story 03-05:** "Approve/Reject" buttons as client (payment flow)
6. **Story 03-06:** Pending reviews dashboard (supervisor)
7. **Story 03-07:** Client approval queue

This story is foundational — all subsequent stories depend on this page existing and working correctly.

---

## 📍 Current Status

**Last Updated:** 2026-05-08  
**Status:** ready-for-dev  
**Created By:** BMad Ultimate Context Engine  
**Implemented By:** [Awaiting dev agent assignment]  

---

**Ready for implementation** ✨

This story is the foundation for reviewing milestones and taking approval actions. Perfect execution here prevents cascading issues in Stories 03-03 through 03-07.
