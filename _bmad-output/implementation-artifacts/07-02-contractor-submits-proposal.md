# Story 07-02 — Contractor Submits Proposal

**Status:** done  
**Epic:** 07 — Proposals & Contractor Selection  
**Story ID:** 7.2  
**Priority:** 🟢 HIGH — Core bidding workflow  
**Complexity:** Medium-High  
**Estimated Effort:** 10–12 hours  
**Created:** 2026-05-09  
**Dependencies:** Story 07-01 (Admin opens bidding), Story 02-03 (Project detail)

---

## 📋 User Story

**As an** invited contractor,  
**I want to** submit a proposal for a project I've been invited to bid on,  
**so that** the client can consider my offer.

---

## ✅ Acceptance Criteria

### Visibility & Access Control
- [ ] Invited contractor sees project in their "مشاريعي" (My Projects) list with status "Open for Bids"
- [ ] Status pill on project card:
  - Text: "مفتوح للعروض" (Open for Bids)
  - Tone: `accent` (orange)
  - Component: `Pill` from shadcn-vue
- [ ] "تقديم عرض" (Submit Proposal) CTA button visible on project card
- [ ] Button only visible when:
  - Project status is exactly `open_for_bids`
  - Current user is invited to this project's bidding
  - Contractor has NOT yet submitted a proposal for this project
- [ ] Non-invited contractors: do NOT see the project in their list OR see it without the button
- [ ] After proposal submission: card shows "تم تقديم العرض" (Proposal Submitted) pill (primary tone), button removed

### Proposal Submission Dialog
- [ ] Clicking "تقديم العرض" button opens `Dialog` component
- [ ] Dialog title: "تقديم عرض لـ [project name]" (Submit Proposal for [project name])
- [ ] Form fields with VeeValidate + Zod schema validation:
  1. **السعر الإجمالي** (Total Price)
     - Input type: `text` (for currency formatting)
     - Required: ✅ yes
     - Validation: positive number, >= 0
     - Formatted with `formatCurrency()` on blur/display
     - Shows formatted value to user (e.g., "100,000 ر.س")
     - Component: Custom `MoneyInput` or standard `Input` with money formatting
  2. **المدة التقديرية بالأيام** (Estimated Timeline in Days)
     - Input type: `number`
     - Required: ✅ yes
     - Validation: positive integer only (no decimals)
     - Min: 1, Max: 3650 (10 years reasonable upper bound)
  3. **الملاحظات** (Notes/Description)
     - Input type: `textarea`
     - Required: ❌ no (optional)
     - Max length: 500 characters
     - Character counter below: `text-[10px] text-muted-foreground text-end`
     - Counter format: "[current]/[max]" e.g., "45/500"
     - Counter updates in real-time as user types
- [ ] Dialog buttons:
  - Cancel (outline style): "إلغاء" (Cancel)
  - Submit (primary style): "تقديم العرض" (Submit Proposal) — disabled when validation fails
- [ ] Dialog closes on Cancel
- [ ] Dialog closes on successful Submit
- [ ] Form validation happens on blur and submit (VeeValidate `v-autoAnimate` friendly)

### Form Validation & Error Handling
- [ ] Invalid inputs show inline error messages below each field
- [ ] Submit button disabled until all required fields are valid
- [ ] If user tries to submit empty form: first error field gets focus, inline message shown
- [ ] During form submit: button shows loading spinner + text "جاري..." (Processing...)
- [ ] On validation error from API: show error toast or inline message, form stays open for retry
- [ ] On API success: close dialog, show success toast

### API Integration
- [ ] On submit, call **`POST /projects/:id/proposals`**
  - Payload:
    ```json
    {
      "price": 250000,
      "estimated_days": 90,
      "notes": "Optional notes here"
    }
    ```
  - Response: `{ data: { id: string, price: number, estimated_days: number, notes: string, created_at: datetime }, message?: string }`
- [ ] If endpoint not available, create mock in `app/composables/__mocks__/useProposals.ts`
  - Mock returns success after 300ms delay
  - Add comment: `// TODO: replace mock — POST /projects/:id/proposals`
- [ ] Handle 422 validation errors from API: display field-specific error messages
- [ ] Handle 403 Forbidden: user is not invited or already submitted

### Optimistic Update & Rollback
- [ ] On submit button click:
  1. Update local project store: proposal status state changes
  2. Update project card: pill changes to "تم تقديم العرض" (Proposal Submitted)
  3. Remove button from card
  4. Disable submit button + show loading state
- [ ] On API error:
  1. Revert project card state (show button again, pill reverts)
  2. Show error toast with message from API
  3. Dialog remains open for retry
  4. User can edit form and retry or cancel

### Read-Only Proposal Summary (After Submission)
- [ ] After successful submission, project card shows read-only proposal summary:
  - Price: formatted with `formatCurrency()`
  - Timeline: "90 يوم" (90 days)
  - Notes: displayed if provided (can be collapsible if long)
  - Submission timestamp: `formatDate(created_at)` — e.g., "May 9, 2026 at 2:30 PM"
- [ ] Contractor can view their own proposal in project detail page
- [ ] No "Edit" or "Delete" button — proposals are immutable after submission

### Contractor Privacy & Visibility
- [ ] Contractor sees their own submitted proposal only
- [ ] Contractor **cannot** see other contractors' proposals — verified via backend permission
- [ ] Client and admin can see all proposals (Story 07-04)
- [ ] API endpoint enforces contractor ID validation — contractor can only see their own proposal

### Currency & Date Formatting
- [ ] All prices formatted with `formatCurrency()` function
  - Format: "250,000 ر.س" (Saudi Riyal locale)
  - Thousands separator: comma
- [ ] All dates formatted with `formatDate()` function
  - Format in Arabic: "9 مايو 2026 في 2:30 م"
  - Format in English: "May 9, 2026 at 2:30 PM"

### State Transition Validation
- [ ] Before API call, validate: `canTransition('proposal', null, 'submitted')`
  - (Note: proposals don't have complex state machine — check project status is `open_for_bids`)
  - If project status changed since dialog opened, show error: "Project status has changed. Please refresh."
- [ ] Prevent double-submission: disable button during submission

### General Requirements
- [ ] All text uses i18n keys (no hardcoded strings)
- [ ] RTL layout verified in Arabic (text-start, price-start, counter text-end)
- [ ] No console errors or warnings
- [ ] TypeScript: strict mode, no `any` types
- [ ] Loading state: submit button shows spinner + "جاري..." text
- [ ] Error handling: inline field errors + toast notifications
- [ ] Responsive: dialog adapts to mobile (full width with bottom sheet optional)
- [ ] Component uses `<script setup lang="ts">` (Vue 3 Composition API)
- [ ] Props are TypeScript-typed

---

## 🏗️ Developer Context

### Files to Create / Modify

#### 1. **app/pages/projects/[id].vue** (Modify)
- **Current state:** Displays project detail with milestones, team, and other sections
- **Changes required:**
  - Add visibility check: if `project.status === 'open_for_bids' && userIsInvited()`
  - Show "تقديم عرض" button in a prominent location (near project header or in actions row)
  - After proposal submitted: show proposal summary component instead of button
  - Add state: `isProposalDialogOpen: ref(false)`
  - Handle dialog events: `@update:open="isProposalDialogOpen = $event"`
  - Call composable to refresh project after submission: `await useProjects().getProjectById(id)`

#### 2. **app/components/project/SubmitProposalDialog.vue** (Create new)
- **Purpose:** Form dialog for contractor to submit proposal
- **Props:**
  ```ts
  interface Props {
    projectId: string
    projectName: string
    isOpen: boolean
  }
  ```
- **Emits:**
  ```ts
  emit('update:open', boolean)  // Control dialog visibility
  emit('submitted', { price: number, estimatedDays: number, notes?: string })
  ```
- **Internal state:**
  - Form data: `price`, `estimatedDays`, `notes`
  - Loading state: `isSubmitting`
  - Validation errors from VeeValidate schema
- **Template structure:**
  - Dialog wrapper (shadcn-vue)
  - Form with VeeValidate + Zod
  - Three input fields
  - Character counter for notes
  - Button row: Cancel + Submit
  - Show error toast on submission error
- **Validation schema (Zod):**
  ```ts
  const proposalSchema = z.object({
    price: z.number().positive('Price must be positive'),
    estimatedDays: z.number().int().positive('Timeline must be positive integer'),
    notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional()
  })
  ```

#### 3. **app/composables/useProposals.ts** (Create new)
- **Purpose:** Manage proposal state and API calls
- **Methods:**
  ```ts
  async function submitProposal(projectId: string, payload: {
    price: number
    estimated_days: number
    notes?: string
  }): Promise<{ success: boolean, proposal?: ProposalData }>
  
  async function getProposal(projectId: string): Promise<ProposalData | null>
  
  function isContractorInvited(projectId: string): boolean
  
  function hasSubmittedProposal(projectId: string): boolean
  ```
- **State (Pinia):**
  - Store submitted proposals in a map: `{ projectId: proposalData }`
  - Track invitation status per project
- **API call:**
  - `POST /projects/:id/proposals` with payload
  - Handle 403 Forbidden: contractor not invited
  - Handle 422 Validation: field errors
  - Handle 409 Conflict: already submitted
- **Mock implementation** (while endpoint not available):
  - `app/composables/__mocks__/useProposals.ts`
  - Return success after 300ms
  - Add comment: `// TODO: replace mock — POST /projects/:id/proposals`

#### 4. **app/components/project/ProposalSummary.vue** (Create new)
- **Purpose:** Display submitted proposal in read-only format on project card or detail
- **Props:**
  ```ts
  interface Props {
    proposal: ProposalData
  }
  ```
- **Display format:**
  - Price: `formatCurrency(proposal.price)`
  - Timeline: `proposal.estimatedDays + " يوم"` (days)
  - Notes: collapsible if > 100 chars
  - Submitted: `formatDate(proposal.createdAt)`
- **No interactive elements** — read-only display only

#### 5. **app/components/project/ProjectCard.vue** (Modify)
- **Current state:** Shows project summary with status pill and actions
- **Changes required:**
  - Check contractor status: if invited and `project.status === 'open_for_bids'`
    - Show "تقديم عرض" button
    - Show "مفتوح للعروض" accent pill
  - If proposal submitted: replace button with pill "تم تقديم العرض" (primary tone)
  - Show proposal summary instead of button
  - Update reactive: refresh from store when project updates

#### 6. **shared/types/project.ts** (Verify/Extend)
- **Verify:** `ProjectStatus` union includes `'open_for_bids'` and `'under_review'`, `'contractor_selected'`
- **Add new type:**
  ```ts
  interface ProposalData {
    id: string
    projectId: string
    contractorId: string
    price: number
    estimatedDays: number
    notes?: string
    createdAt: string
    updatedAt: string
  }
  ```

#### 7. **app/stores/projects.ts** (Modify)
- **Current state:** Manages project list and detail state
- **Add to state:**
  - `proposals: Map<string, ProposalData>`  // per-project proposal data
  - `contractorInvitations: Map<string, string[]>`  // projectId → contractor IDs
- **Add methods:**
  - `setProposal(projectId: string, proposal: ProposalData)`
  - `getProposal(projectId: string): ProposalData | undefined`
  - `setInvitations(projectId: string, contractorIds: string[])`
  - `isContractorInvited(projectId: string, contractorId: string): boolean`

#### 8. **i18n/locales/ar.json** (Add keys)
```json
{
  "projects": {
    "submitProposal": {
      "button": "تقديم عرض",
      "dialogTitle": "تقديم عرض لـ",
      "priceLabel": "السعر الإجمالي",
      "priceError": "السعر مطلوب وعليه أن يكون موجباً",
      "timelineLabel": "المدة التقديرية بالأيام",
      "timelineError": "المدة مطلوبة وعليها أن تكون رقماً موجباً",
      "notesLabel": "الملاحظات",
      "notesPlaceholder": "أضف أي ملاحظات هنا (اختياري)",
      "notesError": "الملاحظات لا يمكن أن تتجاوز 500 حرف",
      "confirmButton": "تقديم العرض",
      "cancelButton": "إلغاء",
      "loadingMessage": "جاري...",
      "successMessage": "تم تقديم العرض بنجاح",
      "errorMessage": "فشل تقديم العرض. يرجى المحاولة مرة أخرى",
      "submittedPill": "تم تقديم العرض",
      "openForBidsPill": "مفتوح للعروض",
      "proposalSummary": "ملخص عرضك"
    }
  }
}
```

#### 9. **i18n/locales/en.json** (Add keys)
```json
{
  "projects": {
    "submitProposal": {
      "button": "Submit Proposal",
      "dialogTitle": "Submit Proposal for ",
      "priceLabel": "Total Price",
      "priceError": "Price is required and must be positive",
      "timelineLabel": "Estimated Timeline (Days)",
      "timelineError": "Timeline is required and must be a positive number",
      "notesLabel": "Notes",
      "notesPlaceholder": "Add any notes here (optional)",
      "notesError": "Notes cannot exceed 500 characters",
      "confirmButton": "Submit Proposal",
      "cancelButton": "Cancel",
      "loadingMessage": "Processing...",
      "successMessage": "Proposal submitted successfully",
      "errorMessage": "Failed to submit proposal. Please try again",
      "submittedPill": "Proposal Submitted",
      "openForBidsPill": "Open for Bids",
      "proposalSummary": "Your Proposal"
    }
  }
}
```

#### 10. **app/composables/__mocks__/useProposals.ts** (Create new)
```ts
// Mock proposal data for development
export function useProposals() {
  async function submitProposal(projectId: string, payload: any) {
    // TODO: replace mock — POST /projects/:id/proposals
    await new Promise(resolve => setTimeout(resolve, 300))
    return {
      success: true,
      proposal: {
        id: `prop_${Date.now()}`,
        projectId,
        contractorId: 'current-user-id',
        price: payload.price,
        estimatedDays: payload.estimated_days,
        notes: payload.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }
  }
  
  // ... other methods with mocks
}
```

#### 11. **utils/formatters.ts** (Verify/Extend)
- **Verify:** `formatCurrency()` function exists and formats to locale (Saudi Riyal)
  - Format: "250,000 ر.س"
  - Thousands separator: comma
  - Currency symbol: right-aligned (RTL-friendly)
- **Verify:** `formatDate()` function exists and formats to locale (Arabic/English)
  - Format: "9 مايو 2026 في 2:30 م" (Arabic) or "May 9, 2026 at 2:30 PM" (English)

#### 12. **docs/api-contracts.md** (Update when endpoint available)
When Laravel team delivers the endpoint, update the API contracts with:
```markdown
### POST /projects/:id/proposals

**Status:** ✅ Available
**Purpose:** Submit proposal for a project bid

**Request:**
```json
{
  "price": number (required, positive),
  "estimated_days": number (required, positive integer),
  "notes": string (optional, max 500 chars)
}
```

**Response (201):**
```json
{
  "data": {
    "id": "string",
    "projectId": "string",
    "contractorId": "string",
    "price": number,
    "estimatedDays": number,
    "notes": string | null,
    "createdAt": "datetime",
    "updatedAt": "datetime"
  },
  "message": "Proposal submitted successfully"
}
```

**Error (403):**
```json
{
  "message": "You are not invited to bid on this project"
}
```

**Error (409):**
```json
{
  "message": "You have already submitted a proposal for this project"
}
```
```

---

## 🎯 Implementation Guardrails

### ✅ Must-Have Checks Before Starting
- [ ] Read `CLAUDE.md` §0 (behavioral guidelines) — state assumptions
- [ ] Read `CLAUDE.md` §7 (status system) — project status flow
- [ ] Read `CLAUDE.md` §11 (component rules) — Vue 3 Composition API only
- [ ] Read `docs/design-spec.md` §5 (button/dialog styles) — UI component specifications
- [ ] Read `docs/status-flows.md` §2 (project statuses) — valid state transitions
- [ ] Read `docs/api-contracts.md` — check endpoint availability before implementing

### 🔬 Code Patterns to Follow (from Story 07-01)
- **Dialog state:** Parent manages `isDialogOpen` ref, pass via `:isOpen` + `@update:open`
- **Optimistic updates:** Update store first, rollback on error (do not silently swallow)
- **Validation:** VeeValidate + Zod schema, disable submit button until valid
- **Loading state:** Button shows spinner + "جاري..." text, disabled during submission
- **Error handling:** Inline field errors + toast notifications
- **i18n pattern:** `domain.feature.element` (e.g., `projects.submitProposal.button`)
- **RTL compliance:** text-start for content, text-end for counters, logical CSS properties only

### ⚠️ Critical Implementation Details
- **Contractor privacy:** Verify backend enforces contractor can only see their own proposal
- **Double-submission prevention:** Disable button during submission + check `hasSubmittedProposal()` before showing button
- **Currency formatting:** Use `formatCurrency()` consistently for all price displays
- **Character counter:** Real-time update, format "[current]/[max]" e.g., "45/500"
- **Form focus:** On validation error, focus first invalid field
- **Modal keyboard:** Escape key closes dialog (standard behavior)

### 🧪 Testing Checklist
- [ ] Invited contractor sees "مفتوح للعروض" pill + "تقديم عرض" button
- [ ] Non-invited contractor does NOT see the button
- [ ] Form validation works: empty fields show inline errors, submit disabled
- [ ] Submitting valid form: button shows loading state, dialog stays open until success
- [ ] On success: dialog closes, card shows "تم تقديم العرض" pill, button removed
- [ ] On API error: card state reverts, error toast shown, form stays open for retry
- [ ] Price formatting: entered as "250000" displays as "250,000 ر.س"
- [ ] Timeline: integer validation, rejects decimals
- [ ] Notes: character counter shows "45/500", updates in real-time
- [ ] RTL layout: all text flows RTL, buttons RTL-aware, counters right-aligned
- [ ] No console errors or TypeScript errors

### 📊 Success Criteria
- [ ] All AC pass (see ✅ section above)
- [ ] Component builds with no TypeScript errors
- [ ] Dialog is responsive (mobile-friendly)
- [ ] Optimistic update + rollback verified in browser
- [ ] RTL verified in Arabic — text direction, counters, buttons all correct
- [ ] i18n keys present for all user-facing text
- [ ] Mock replaced with real API endpoint when Laravel delivers
- [ ] No breaking changes to existing pages/components

---

## 🔄 Previous Story Learnings (Story 07-01 — Admin Opens Bidding)

**Key patterns established:**
1. **Admin dialogs** use shadcn-vue `Dialog` with title + subtitle layout
2. **Contractor multi-select** can be List or Select with multiple: true
3. **Button loading states** require explicit spinner + disabled state
4. **Optimistic updates** MUST have rollback — never silently fail
5. **i18n keys** follow `domain.feature.element` pattern for consistency
6. **State validation** via `canTransition()` before API calls
7. **Error handling** shows inline + toast, keeps dialog open for retry

**Differences in this story:**
- This is **contractor-initiated**, not admin-initiated
- Form has **field-level validation** (not just multi-select)
- **Visibility rules** are more complex (invited? already submitted? project status?)
- **Privacy** is critical — contractor can only see their own proposal
- **Character counter** requires real-time updates

---

## 🎬 Git Context (Last 5 commits)

```
c64e5f1 feat: Story 07-01 — Admin Opens Bidding and Invites Contractors
911dcaf feat: Story 06-02 — Create User (Admin)
fbd4b8a feat: Story 06-05 — Admin Dashboard
b9d98f7 feat: Story 06-04 — Admin Project Overview
805ef9f feat: Story 06-03 — Assign engineers to project
```

**Patterns to follow from recent commits:**
- Admin features use consistent dialog patterns (title + subtitle + form + buttons)
- State management through composables + Pinia stores
- Optimistic updates implemented in composables, not components
- All text externalized to i18n (no hardcoded strings)
- TypeScript strict mode throughout

---

## 📝 Story Completion Definition

A task is complete only when **all** of the following are true:

**Behavioral (from CLAUDE.md §0)**
- [ ] Assumptions were stated before implementation
- [ ] No code was changed outside the scope of the request
- [ ] Unused imports/variables created by this change are removed

**Functional**
- [ ] Contractor can submit proposal form (all ACs pass)
- [ ] Project card shows correct status pill + button visibility
- [ ] After submission: button replaced by "Proposal Submitted" status
- [ ] Optimistic update + rollback verified
- [ ] Contractor cannot see other proposals (privacy enforced)
- [ ] Currency/date formatting applied correctly

**Quality**
- [ ] RTL layout tested and verified in Arabic
- [ ] All UI strings use i18n keys — no hardcoded text
- [ ] TypeScript — no errors, no `any`
- [ ] No console errors or warnings
- [ ] Loading states use shadcn `Skeleton` or spinner
- [ ] Error states handled and shown to user
- [ ] Character counter works and updates in real-time
- [ ] Form validation prevents invalid submissions
- [ ] Mock removed if endpoint is now available

---

### Review Findings

Review date: 2026-05-09. Diff base: `origin/lovable` (incremental delta only; primary 07-02 UI lives on that baseline).

- [x] [Review][Patch resolved] Split dashboard/UI optional fields into `shared/types/project-display.ts` and compose via `extends` on `Project` / `Milestone` in `shared/types/project.ts`.
- [x] [Review][Patch resolved] Mock `getProjectProposals`: contractors receive only proposals where `contractorId` matches the signed-in user; mock POST submit includes `contractor_id` when using the mock path; replaced `any` error handling with `unknown` + `ApiProposalRow` typing in `useProposals.ts`.

Review date: 2026-05-09. Diff source: story commits `feda4a4` and `e867870`.

- [x] [Review][Patch resolved] Bind `defineProps` result before using `props` in computed values [app/components/project/ProposalSummary.vue:11]
- [x] [Review][Patch resolved] Do not treat every proposal POST failure as mock success; preserve 403/409/422/server failures [app/composables/useProposals.ts:67]
- [x] [Review][Patch resolved] Include `statusCode`/response status when narrowing `$fetch` errors [app/composables/useProposals.ts:5]
- [x] [Review][Patch resolved] Wire notes counter to the textarea value, not the DOM input event object [app/components/project/SubmitProposalDialog.vue:161]
- [x] [Review][Patch resolved] Keep submitted proposal summary visible after project leaves `open_for_bids` [app/pages/projects/[id].vue:106]
- [x] [Review][Patch resolved] Hydrate submitted proposal/invitation state from API or Pinia so refresh/deep links do not lose visibility state [app/composables/useProposals.ts:44]
- [x] [Review][Patch resolved] Implement proposal card/list CTA, open-for-bids pill, submitted pill, and summary behavior from the story AC [app/components/project/ProjectCard.vue:63]
- [x] [Review][Patch resolved] Add optimistic proposal update and rollback instead of only updating after successful response [app/composables/useProposals.ts:85]
- [x] [Review][Patch resolved] Use text money input formatting with `formatCurrency()` instead of a raw number field [app/components/project/SubmitProposalDialog.vue:119]
- [x] [Review][Patch resolved] Enforce timeline max of 3650 days in validation [app/components/project/SubmitProposalDialog.vue:43]
- [x] [Review][Patch resolved] Focus the first invalid field and map 422 validation errors to field-specific messages [app/components/project/SubmitProposalDialog.vue:76]
- [x] [Review][Patch resolved] Check project status is still `open_for_bids` before submitting the proposal [app/components/project/SubmitProposalDialog.vue:76]
- [x] [Review][Patch resolved] Replace direct contractor role checks with permission/capability checks [app/pages/projects/[id].vue:95]
- [x] [Review][Patch resolved] Replace `catch (error: any)` with `unknown` narrowing for dialog errors [app/components/project/SubmitProposalDialog.vue:92]
- [x] [Review][Patch resolved] Disable submit from form validity metadata, not only current `errors` keys [app/components/project/SubmitProposalDialog.vue:181]
- [x] [Review][Patch resolved] Remove duplicate proposal summary heading between parent and child components [app/pages/projects/[id].vue:490]

---

## 📚 Reference Documentation

| Document | Section | Relevance |
|---|---|---|
| CLAUDE.md | §0 (Behavioral) | State assumptions, simplicity first |
| CLAUDE.md | §7 (Status system) | Project statuses, canTransition() |
| CLAUDE.md | §8 (State management) | Pinia patterns, optimistic updates |
| CLAUDE.md | §9 (i18n) | RTL, logical CSS properties |
| CLAUDE.md | §11 (Components) | Script setup, no Options API |
| design-spec.md | §5 (Buttons/Dialogs) | UI component styling |
| design-spec.md | §9 (Project detail) | Layout reference |
| status-flows.md | §2 (Project status flow) | Valid transitions |
| api-contracts.md | Projects section | API endpoints (check availability) |
| Epic 07 | Story 07-02 AC | Acceptance criteria (source of truth) |

---

**Created:** 2026-05-09  
**Status:** done  
**Next:** Run `/bmad-dev-story 07-02-contractor-submits-proposal.md` to begin implementation
