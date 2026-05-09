# Story 07-04 — Client Reviews Proposals

**Status:** ready-for-dev  
**Epic:** 07 — Proposals & Contractor Selection  
**Story ID:** 7.4  
**Priority:** 🟢 HIGH — Core bidding workflow  
**Complexity:** Medium  
**Estimated Effort:** 8–10 hours  
**Created:** 2026-05-09  
**Dependencies:** Story 07-01 (Admin opens bidding), Story 07-02 (Contractor submits proposal), Story 07-03 (Admin closes bidding)

---

## 📋 User Story

**As a** client,  
**I want to** compare all submitted proposals for my project,  
**so that** I can make an informed decision about which contractor to hire.

---

## ✅ Acceptance Criteria

### Visibility & Access Control
- [ ] "العروض" (Proposals) tab/section visible in project detail only to:
  - Project owner (`client` role who created the project)
  - `admin` and `super_admin` roles
- [ ] Section only displayed when project status is `under_review` OR `contractor_selected`
- [ ] Hidden when project status is `new`, `open_for_bids`, `active`, `on_hold`, or `completed`
- [ ] Non-client/non-admin users: section not visible (no access warning — just hidden)
- [ ] Client receives in-app notification when admin closes bidding (from Story 07-03)

### Proposals List Display
- [ ] All submitted proposals displayed in a scrollable list
- [ ] Each proposal shown as a card with `rounded-2xl border border-border bg-card p-5 shadow-card` styling
- [ ] Cards sorted by submission date (oldest first — ascending chronological order)
- [ ] No limit on number of proposals shown — all proposals visible without pagination or truncation
- [ ] Loading state while fetching proposals: `PageSkeleton` component with 3-4 placeholder cards
- [ ] Empty state if no proposals yet: "لا توجد عروض حتى الآن" (No proposals yet) message
- [ ] Error state if API fails: error message + retry button

### Individual Proposal Card Content
Each proposal card displays:
- [ ] **Contractor name:** `text-base font-extrabold text-ink` — left-aligned (RTL: right-aligned)
- [ ] **Total price:** `text-2xl font-extrabold text-primary` — formatted with `formatCurrency()`
  - Example: "250,000 ر.س" (Saudi Riyal locale)
  - Left-aligned (RTL: right-aligned)
- [ ] **Estimated timeline:** `text-sm text-muted-foreground` — format as "{N} يوم" (days)
  - Example: "90 يوم" (90 days)
- [ ] **Notes/Description:** `text-sm text-foreground/80 mt-2`
  - Only shown if provided by contractor
  - Collapsible if text exceeds 150 characters (optional: show "Read more" link)
- [ ] **Submission date:** `text-[11px] text-muted-foreground` — formatted with `formatDate()`
  - Example: "تم التقديم في 9 مايو 2026 في 2:30 م" (Submitted on May 9, 2026 at 2:30 PM)
- [ ] **"اختيار هذا المقاول" (Select this contractor) button:** primary button style
  - Only visible when:
    - Project status is exactly `under_review`
    - Current user is the project owner (`client`)
  - Hidden when status is `contractor_selected` or other statuses
  - Prominent and easy to click (min 44px height for accessibility)
- [ ] **Status badge/pill (shown when status is `contractor_selected`):**
  - Selected contractor: green pill "تم الاختيار" (Selected) — primary tone
  - Unselected contractors: dimmed pill "لم يتم الاختيار" (Not Selected) — muted tone
  - Card opacity reduced to `opacity-60` for unselected proposals
  - Badge replaces button on non-selected cards

### Proposal Sorting & Ordering
- [ ] Sort order: submission date ascending (oldest first)
- [ ] Cannot be changed by user (no sort UI controls)
- [ ] If two proposals have same timestamp, maintain API order (stable sort)

### State Transitions & Visual Feedback
- [ ] When client clicks "اختيار هذا المقاول" button:
  1. Button shows loading state (spinner + "جاري..." text)
  2. Card remains fully visible (no dimming yet)
  3. Button is disabled to prevent double-click
- [ ] On successful selection (from Story 07-05):
  1. Selected card shows "تم الاختيار" badge (green/primary tone)
  2. Button removed from selected card
  3. All other cards dim to `opacity-60` and show "لم يتم الاختيار" badge
  4. All "اختيار هذا المقاول" buttons removed from all cards
  5. Page remains on proposals section (no navigation)
- [ ] On selection error:
  1. Button reverts to normal state (no loading spinner)
  2. Error toast shown to user
  3. Card state unchanged — button remains functional for retry
  4. Dialog (from Story 07-05) may show if confirmation was sent but selection failed

### Currency & Date Formatting
- [ ] All prices formatted with `formatCurrency()` function
  - Format: "250,000 ر.س" (Saudi Riyal locale, thousands separator: comma)
  - RTL-safe alignment (right-aligned in RTL context)
- [ ] All dates formatted with `formatDate()` function
  - Format in Arabic: "9 مايو 2026" (date only, no time in card) or full datetime if shown
  - Format in English: "May 9, 2026" (date only)
  - Can include time if design calls for it: "at 2:30 PM" / "في 2:30 م"

### Responsive Design
- [ ] Cards stack vertically on mobile (full width minus padding)
- [ ] Proposal card text remains readable on small screens (no truncation of price)
- [ ] Button remains clickable on mobile (min 44px tap target)
- [ ] Desktop: cards may be in a grid or single column (follow design-spec §9)

### General Requirements
- [ ] All text uses i18n keys (no hardcoded strings)
- [ ] RTL layout verified in Arabic:
  - All text: `text-start` (not `text-left`)
  - Price/timeline: `text-start`
  - Date: `text-[11px]` (no special alignment, flows with text-start)
  - Card layout: logical properties only (no `ml-*`, `pl-*`, `left-*`, `right-*`)
- [ ] No console errors or warnings
- [ ] TypeScript: strict mode, no `any` types
- [ ] Loading state: uses `PageSkeleton` component for list skeleton
- [ ] Error handling: error message + retry button shown to user
- [ ] Component uses `<script setup lang="ts">` (Vue 3 Composition API)
- [ ] Props are TypeScript-typed

---

## 🏗️ Developer Context

### Files to Create / Modify

#### 1. **app/pages/projects/[id].vue** (Modify)
- **Current state:** Displays project detail with milestones, team, milestones, and other sections
- **Changes required:**
  - Add "العروض" (Proposals) tab/section to the page layout
  - Section visibility: only show when `project.status === 'under_review' || project.status === 'contractor_selected'`
  - AND user is project owner OR admin
  - Import and use `ProposalsList` component (see next section)
  - Pass `projectId` and `canSelect` (true if status is `under_review` AND user is owner) props to component
  - Handle proposal selection events: listen for `@proposal-selected` event from component
  - Refresh project state after selection (call `useProjects().getProjectById(id)` to update cards)
  - Add state: track if selection is in progress

#### 2. **app/components/project/ProposalsList.vue** (Create new)
- **Purpose:** Display all proposals for a project in a browsable list format
- **Props:**
  ```ts
  interface Props {
    projectId: string
    proposals: ProposalData[]
    isLoading?: boolean
    hasError?: boolean
    canSelect?: boolean  // whether client can select a contractor
    selectedProposalId?: string  // if any proposal is selected
  }
  ```
- **Emits:**
  ```ts
  emit('proposal-selected', { proposalId: string, contractorId: string, price: number })
  emit('retry-load')  // when user clicks retry on error
  ```
- **Internal state:**
  - `isSelecting: ref<string | null>` — tracks which proposal is being selected
  - Local copy of proposals for UI state
- **Template structure:**
  - Header: "العروض" title
  - Loading state: `PageSkeleton` with 3-4 placeholder cards
  - Error state: error message + retry button
  - Empty state: "لا توجد عروض حتى الآن" message
  - List: sorted proposals, each with `ProposalCard` component
  - No pagination — all proposals on one view

#### 3. **app/components/project/ProposalCard.vue** (Create new)
- **Purpose:** Individual proposal card display
- **Props:**
  ```ts
  interface Props {
    proposal: ProposalData
    isSelected?: boolean  // true if client has selected this contractor
    isSelecting?: boolean  // true if selection in progress
    canSelect?: boolean  // whether to show select button
  }
  ```
- **Emits:**
  ```ts
  emit('select-clicked')  // when user clicks select button
  ```
- **Display sections:**
  1. **Header row:** Contractor name (text-base font-extrabold text-ink, left-aligned)
  2. **Price row:** Price formatted (text-2xl font-extrabold text-primary, left-aligned)
  3. **Timeline row:** "{N} يوم" (text-sm text-muted-foreground)
  4. **Notes section:** If notes provided, show as text-sm text-foreground/80
     - Collapsible if > 150 chars (optional)
  5. **Date row:** Submission date (text-[11px] text-muted-foreground)
  6. **Footer:** Button or badge
     - If `canSelect && !isSelected`: "اختيار هذا المقاول" button (primary style)
     - If `isSelected`: "تم الاختيار" badge (primary tone pill)
     - If `!canSelect && !isSelected && status is contractor_selected`: "لم يتم الاختيار" badge (muted tone)
- **Visual states:**
  - Normal: full opacity, button visible
  - Selecting: button shows loading spinner + disabled
  - Selected: card dims to `opacity-60`, badge shown, button removed
  - Not selected (when another is selected): card dims to `opacity-60`, badge shown

#### 4. **app/composables/useProposals.ts** (Modify/Extend from Story 07-02)
- **Existing methods:** `submitProposal()`, `getProposal()`, `isContractorInvited()`, `hasSubmittedProposal()`
- **Add new methods:**
  ```ts
  async function getProjectProposals(projectId: string): Promise<ProposalData[]>
    // Fetch all proposals for a project
    // Only returns proposals if user is owner or admin (backend enforces)
    // Throws 403 if user not authorized
    
  async function selectContractor(projectId: string, proposalId: string): Promise<{
    success: boolean
    project?: ProjectData
  }>
    // Called when client clicks "Select this contractor" button
    // Calls POST /projects/:id/proposals/:proposalId/select
    // Updates project status to contractor_selected
    // Returns updated project data
  ```
- **State (Pinia):**
  - Add: `proposals: Map<string, ProposalData[]>` — per-project proposals list
  - Existing: `selectedProposalId: Map<string, string>` — which proposal selected per project
- **API calls:**
  - `GET /projects/:id/proposals` — fetch all proposals (paginated if backend requires, but UI shows all)
  - Handle 403 Forbidden: user not owner or admin
  - Handle 404 Not Found: project doesn't exist

#### 5. **app/components/project/ProjectDetail.vue** (Modify — if separate from [id].vue)
- Or if proposals section is directly in `[id].vue`, no separate file needed
- Add section layout with conditional rendering for proposals tab

#### 6. **shared/types/project.ts** (Verify/Extend)
- **Verify:** `ProposalData` type includes all fields:
  ```ts
  interface ProposalData {
    id: string
    projectId: string
    contractorId: string
    contractorName?: string  // Add if API returns it
    price: number
    estimatedDays: number
    notes?: string
    createdAt: string
    updatedAt: string
  }
  ```
- **Verify:** `ProjectStatus` union includes all valid statuses (already done in previous stories)

#### 7. **app/stores/projects.ts** (Modify)
- **Current state:** Manages project list and detail state
- **Add to state:**
  - `proposals: Map<string, ProposalData[]>` — all proposals for each project
  - `selectedProposalId: Map<string, string | null>` — selected proposal ID per project
- **Add methods:**
  - `setProposals(projectId: string, proposals: ProposalData[])`
  - `getProposals(projectId: string): ProposalData[] | undefined`
  - `setSelectedProposal(projectId: string, proposalId: string | null)`
  - `getSelectedProposal(projectId: string): string | null | undefined`

#### 8. **i18n/locales/ar.json** (Add/Update keys)
```json
{
  "projects": {
    "proposals": {
      "sectionTitle": "العروض",
      "tabLabel": "العروض",
      "noProposals": "لا توجد عروض حتى الآن",
      "loadingError": "فشل تحميل العروض",
      "retryButton": "إعادة المحاولة",
      "submitDate": "تم التقديم في",
      "daysFormat": "يوم",
      "selectButtonLabel": "اختيار هذا المقاول",
      "selectedBadge": "تم الاختيار",
      "notSelectedBadge": "لم يتم الاختيار",
      "selectingMessage": "جاري الاختيار..."
    }
  }
}
```

#### 9. **i18n/locales/en.json** (Add/Update keys)
```json
{
  "projects": {
    "proposals": {
      "sectionTitle": "Proposals",
      "tabLabel": "Proposals",
      "noProposals": "No proposals yet",
      "loadingError": "Failed to load proposals",
      "retryButton": "Retry",
      "submitDate": "Submitted on",
      "daysFormat": "days",
      "selectButtonLabel": "Select this contractor",
      "selectedBadge": "Selected",
      "notSelectedBadge": "Not Selected",
      "selectingMessage": "Selecting..."
    }
  }
}
```

#### 10. **docs/api-contracts.md** (Update when endpoint available)
When Laravel team delivers the endpoint, add:
```markdown
### GET /projects/:id/proposals

**Status:** ✅ Available
**Purpose:** Fetch all proposals for a project (client and admin only)

**Response (200):**
```json
{
  "data": [
    {
      "id": "string",
      "projectId": "string",
      "contractorId": "string",
      "contractorName": "string",
      "price": number,
      "estimatedDays": number,
      "notes": string | null,
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  ]
}
```

**Error (403):**
```json
{
  "message": "You are not authorized to view proposals for this project"
}
```
```

---

## 🎯 Implementation Guardrails

### ✅ Must-Have Checks Before Starting
- [ ] Read `CLAUDE.md` §0 (behavioral guidelines) — state assumptions
- [ ] Read `CLAUDE.md` §7 (status system) — project status flow
- [ ] Read `CLAUDE.md` §11 (component rules) — Vue 3 Composition API only
- [ ] Read `docs/design-spec.md` §5 (button/dialog styles) — card styling, shadows
- [ ] Read `docs/design-spec.md` §9 (project detail) — layout reference
- [ ] Read `docs/status-flows.md` §2 (project statuses) — valid state transitions
- [ ] Review Story 07-02 (Contractor submits proposal) — understand ProposalData type
- [ ] Review Story 07-03 (Admin closes bidding) — understand when this section becomes visible
- [ ] Review Story 07-05 (Client selects contractor) — understand selection flow interaction

### 🔬 Code Patterns to Follow (from Stories 07-01 & 07-02)
- **List state:** Parent manages loading/error states, passes to child component
- **Card components:** Stateless (props-driven), emit events for parent to handle
- **Sorting:** Do in composable, not in component (single source of truth)
- **Visibility rules:** Check in parent page component, render conditionally
- **Loading state:** Use `PageSkeleton` for list, not individual card skeletons
- **i18n pattern:** `domain.feature.element` (e.g., `projects.proposals.selectButtonLabel`)
- **RTL compliance:** text-start for all content, no logical positioning (left/right)
- **Optimistic updates:** Not needed here — selection is handled by Story 07-05

### ⚠️ Critical Implementation Details
- **Access control:** Only client (project owner) + admin/super_admin can view proposals
  - Do NOT show section to contractors
  - Do NOT show section when status is not `under_review` or `contractor_selected`
- **Sorting:** Always sort by submission date (oldest first, ascending chronological)
- **Visibility of select button:** Only when:
  - Project status is `under_review` (not `contractor_selected`)
  - Current user is the project owner
  - No other proposal is selected
- **After selection:** All buttons removed, dimmed cards with badges appear
  - This is coordinated with Story 07-05 (client selection confirmation dialog)
  - Selected card gets green "Selected" badge
  - Unselected cards get gray "Not Selected" badges
- **Loading state:** Button should show "جاري الاختيار..." text + spinner, disabled
- **Price/Date formatting:** Use utility functions consistently across all proposals
- **Notes collapsibility:** Optional, but if implemented, expand on click (not hover)

### 🧪 Testing Checklist
- [ ] Client can see proposals section when status is `under_review`
- [ ] Client cannot see proposals when status is `new`, `open_for_bids`, `active`, etc.
- [ ] Contractor cannot see proposals section (hidden entirely)
- [ ] Admin can see proposals section for any project
- [ ] Proposals sorted by submission date (oldest first)
- [ ] All prices formatted with currency symbol and thousands separator
- [ ] All dates formatted correctly with locale (Arabic/English)
- [ ] "Select this contractor" button visible only when status is `under_review` and user is client
- [ ] Button disabled/showing loading state during selection
- [ ] After selection: button removed, card dimmed, badge shown
- [ ] Empty state shown when no proposals
- [ ] Error state shown when API fails, retry button works
- [ ] Notes display (with collapsible if long)
- [ ] RTL layout: all text flows RTL, no left/right CSS properties
- [ ] No console errors or TypeScript errors
- [ ] Responsive on mobile (full width cards, readable text)

### 📊 Success Criteria
- [ ] All ACs pass (see ✅ section above)
- [ ] Component builds with no TypeScript errors
- [ ] Proposals list loads and displays correctly
- [ ] Selection flow works end-to-end (integrates with Story 07-05)
- [ ] RTL verified in Arabic — text direction, pricing, dates all correct
- [ ] i18n keys present for all user-facing text
- [ ] Mock API returns proposals if backend endpoint not ready
- [ ] No breaking changes to existing project detail page
- [ ] Coordinates properly with Story 07-05 (selection confirmation)

---

## 🔄 Previous Story Learnings

### Story 07-01 — Admin Opens Bidding
- Dialog patterns use shadcn-vue `Dialog` with title layout
- Multi-select pattern for contractor selection
- Optimistic updates with rollback on error
- State validation via `canTransition()` before API calls

### Story 07-02 — Contractor Submits Proposal
- Form validation with VeeValidate + Zod
- Character counter for text fields (real-time updates)
- Loading state on submit button (spinner + text)
- Field-level validation errors shown inline
- After submission: replace button with badge/summary view
- **Key pattern:** Contractor privacy — only see their own proposal

### Story 07-03 — Admin Closes Bidding
- Confirmation dialog before status change
- Count of proposals received shown to admin
- Client notification when bidding closes
- Button disabled if zero proposals (business rule)

### Differences in this story
- **Read-only view** — no form submission, just display
- **Access control more complex** — only client/admin, status-dependent
- **Sorting required** — proposals in chronological order
- **Conditional button visibility** — select button only in `under_review` status
- **Integration point** — leads directly to Story 07-05 (client selection)

---

## 🎬 Git Context (Last 5 commits)

```
5ad36ba feat: RTK integration for all AI tools
c64e5f1 feat: Story 07-01 — Admin Opens Bidding and Invites Contractors
911dcaf feat: Story 06-02 — Create User (Admin)
fbd4b8a feat: Story 06-05 — Admin Dashboard
b9d98f7 feat: Story 06-04 — Admin Project Overview
```

**Recent patterns in Epic 07:**
- Story 07-01: Dialog-based contractor selection
- Story 07-02: Form submission with validation and optimistic updates
- Story 07-03: Confirmation dialog, status transitions
- Story 07-04 (this one): Read-only list display + conditional actions
- Story 07-05 (next): Selection confirmation with alerts

**Key established patterns:**
- All API calls through composables, not components
- Pinia stores for project/proposal state
- VeeValidate + Zod for form validation
- Optimistic updates with rollback
- i18n for all user-facing text
- Logical CSS properties for RTL compliance

---

## 📝 Story Completion Definition

A task is complete only when **all** of the following are true:

**Behavioral (from CLAUDE.md §0)**
- [ ] Assumptions stated before implementation
- [ ] No code changed outside scope of request
- [ ] Unused imports/variables created by this change removed

**Functional**
- [ ] Proposals section visible only to client/admin when status is `under_review` or `contractor_selected`
- [ ] All proposals displayed in sorted order (submission date ascending)
- [ ] Each proposal card shows: contractor name, price, timeline, notes, date
- [ ] Select button visible only in `under_review` status for client
- [ ] After selection: button hidden, card dimmed, badge shown
- [ ] Currency and date formatting applied correctly
- [ ] Empty state and error states handled

**Quality**
- [ ] RTL layout tested and verified in Arabic
- [ ] All UI strings use i18n keys — no hardcoded text
- [ ] TypeScript — no errors, no `any`
- [ ] No console errors or warnings
- [ ] Loading state uses `PageSkeleton` component
- [ ] Error states handled and shown to user
- [ ] Responsive design verified on mobile
- [ ] No breaking changes to existing project detail page

---

## 📚 Reference Documentation

| Document | Section | Relevance |
|---|---|---|
| CLAUDE.md | §0 (Behavioral) | State assumptions, simplicity first |
| CLAUDE.md | §7 (Status system) | Project statuses, transitions |
| CLAUDE.md | §8 (State management) | Pinia patterns, store actions |
| CLAUDE.md | §9 (i18n) | RTL, logical CSS properties |
| CLAUDE.md | §11 (Components) | Script setup, Props typing |
| design-spec.md | §1 (Colors) | Card background, shadows |
| design-spec.md | §2 (Typography) | Font scales, font weights |
| design-spec.md | §5 (Buttons) | Button styles, loading states |
| design-spec.md | §9 (Project detail) | Layout reference |
| status-flows.md | §2 (Project status) | Valid transitions, `under_review` meaning |
| api-contracts.md | Projects section | API endpoints |
| Epic 07 | Story 07-04 AC | Acceptance criteria (source of truth) |

---

**Created:** 2026-05-09  
**Status:** ready-for-dev  
**Next:** Run `/bmad-dev-story 07-04-client-reviews-proposals.md` to begin implementation
