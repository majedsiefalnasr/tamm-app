# Story 04-01 — Client Pays for a Milestone

**Status:** done  
**Epic:** 04 — Payments & Escrow  
**Story ID:** 4.1  
**Priority:** 🔴 HIGH — First in payment flow; critical for MVP revenue model  
**Complexity:** Medium  
**Estimated Effort:** 8–10 hours  
**Created:** 2026-05-08

---

## 📋 User Story

**As a** client,  
**I want to** pay for a milestone before work begins,  
**so that** funds are secured and the contractor can start with confidence.

---

## ✅ Acceptance Criteria

### Payment Button Visibility & Placement

- [ ] "Pay milestone" button appears ONLY on milestone cards and detail page when:
  - Authenticated user role is `client`
  - Milestone status is `not_started` (not yet work has begun)
  - Payment status is `pending_payment` (not yet paid)
- [ ] Button is HIDDEN if:
  - User is not a client (contractor, supervisor, field engineer, admin, super_admin all see nothing)
  - Milestone is already in progress or beyond
  - Payment is already made
- [ ] Button label: i18n key `milestone.action.pay` (Arabic: "دفع المرحلة")
- [ ] Button style: primary (uses `--primary` token)
- [ ] Button placement:
  - Milestone card: bottom-right, aligned with other action buttons
  - Milestone detail page: in action group with other milestone actions

### Payment Confirmation Dialog

**Triggered by:** Clicking the "Pay milestone" button

**Dialog structure:**

```
┌─────────────────────────────────────────────────┐
│  Pay for: [Milestone name]                      │
│                                                 │
│  Amount: SAR 50,000                             │
│  (formatted with formatCurrency())              │
│                                                 │
│  Funds will be held securely in escrow until    │
│  the milestone is approved by you.              │
│  (i18n key: `payment.dialog.escrow_explanation`)│
│                                                 │
│  Payment Method Selection:                      │
│  [ ] Bank Transfer                              │
│      Bank name:     [Input]                     │
│      Tx reference:  [Input]                     │
│      Receipt image: [File upload — jpg/png]     │
│      [preview thumbnail]                        │
│      Notes (optional): [Textarea]               │
│                                                 │
│  [إلغاء]            [تأكيد الدفع →]             │
└─────────────────────────────────────────────────┘
```

**Form validation:**
- [ ] Bank name: required, min 2 chars
- [ ] Transaction reference: required, min 5 chars
- [ ] Receipt image: required, one file only (jpg/png), max 5MB
- [ ] Notes: optional, max 500 chars
- [ ] File preview: after selection, show `rounded-xl aspect-video object-cover w-full`

**Dialog behavior:**
- [ ] Dialog title: i18n key `payment.dialog.title` ("دفع المرحلة")
- [ ] Milestone name shown prominently below title
- [ ] Amount displayed: `text-3xl font-extrabold text-primary text-center my-4`
- [ ] Escrow explanation: `text-sm text-muted-foreground text-center`
- [ ] Form labels all use i18n keys
- [ ] Submit button disabled until:
  - Bank name has value
  - Transaction reference has value
  - Image file selected
  - Form validates
- [ ] Cancel button: closes dialog, no state change
- [ ] Confirm button: calls API

### Payment Submission

**On confirm button click:**

1. Validate form locally (show field-level errors)
2. If valid, call `POST /milestones/:id/pay`
3. Request body:
   ```json
   {
     "payment_method": "bank_transfer",
     "bank_name": "string",
     "transaction_reference": "string",
     "receipt_image": "file (base64 or multipart)",
     "notes": "string | null"
   }
   ```

**On success (200 response):**

- [ ] Payment status updates to `paid` (optimistic update)
- [ ] Milestone status updates to `in_progress` (backend triggers this)
- [ ] Dialog closes automatically
- [ ] Success toast: i18n key `payment.success.message` ("تم استلام الدفع. يمكن بدء العمل الآن.")
- [ ] "Pay milestone" button disappears from UI
- [ ] `PaymentStatusTag` component appears showing `paid` status (see Story 04-02)
- [ ] Milestone card visual refreshes to show `in_progress` state
- [ ] List updates if viewing multiple milestones (no full page reload)

**On error (4xx, 5xx):**

- [ ] Dialog remains open
- [ ] Generic error toast: i18n key `payment.error.message`
- [ ] If 422 with validation errors, show field-level errors in form
- [ ] No state change (optimistic update is rolled back)
- [ ] User can retry immediately

### Loading & Disabled States

- [ ] Confirm button shows loading spinner while API call in progress
- [ ] Form inputs disabled during API call
- [ ] Cancel button remains enabled (allows escape)
- [ ] Dialog cannot be dismissed by clicking outside (esc key still works)

### RTL & Internationalization

- [ ] Dialog title, labels, descriptions: all i18n keys
- [ ] Currency formatted per locale: `formatCurrency(amount, 'ar')` and `formatCurrency(amount, 'en')`
- [ ] Form flows naturally in RTL:
  - Inputs stack vertically, no direction-dependent layout
  - Button order: Cancel on start (right in RTL), Confirm on end (left in RTL)
  - Amount text is centered (no directional dependency)
  - File input label and state indicators readable
- [ ] Image preview: `rounded-xl aspect-video` — no directional styling
- [ ] No rotated icons or direction-dependent visuals

### Error States & Validation

- [ ] **Network error:** Retry-able with "Try again" button in toast
- [ ] **Invalid file:** Show error message, allow re-upload (e.g., "Only JPG/PNG accepted, max 5MB")
- [ ] **Missing fields:** Show field-level validation errors (red border + helper text)
- [ ] **Backend validation errors:** Map to i18n keys or show backend message

---

## 🏗️ Technical Requirements

### Architecture & Patterns

**Follow patterns established in Stories 03-04, 03-05:**

- **State management:** Use `useMilestones()` composable
  - Add `payForMilestone(id: string, payload: PaymentPayload)` method
  - Implement optimistic update: set payment status to `paid` and milestone status to `in_progress` immediately
  - Implement rollback on error: restore both statuses to previous values
  
- **Permission checks:** Always use `usePermission().can('pay_milestone')` before rendering button
  - `can('pay_milestone')` should check: user is `client` AND milestone is `not_started` AND payment is `pending_payment`
  
- **Error handling:** Use `useNotifications().error()` and `useNotifications().success()` (not browser alerts)
  
- **i18n:** All UI text through `$t()` function; keys must exist in both `ar.json` and `en.json`
  - Create new i18n keys:
    - `payment.dialog.title`
    - `payment.dialog.escrow_explanation`
    - `payment.dialog.bank_name`
    - `payment.dialog.transaction_reference`
    - `payment.dialog.receipt_image`
    - `payment.dialog.notes`
    - `payment.dialog.cancel`
    - `payment.dialog.confirm`
    - `payment.success.message`
    - `payment.error.message`
    - `milestone.action.pay`

### Components to Build / Use

| Component | Purpose | Location | Status |
|---|---|---|---|
| `PayMilestoneButton` | Trigger button on card/detail | `app/components/milestone/PayMilestoneButton.vue` | New |
| `PaymentConfirmDialog` | Payment form dialog | `app/components/payment/PaymentConfirmDialog.vue` | New |
| `PaymentStatusTag` | Status badge (see Story 04-02) | `app/components/payment/PaymentStatusTag.vue` | Depends on 04-02 |
| shadcn-vue `Dialog` | Modal wrapper | `app/components/ui/dialog` | Existing |
| shadcn-vue `Button` | Form buttons | `app/components/ui/button` | Existing |
| shadcn-vue `Input` | Form inputs | `app/components/ui/input` | Existing |
| shadcn-vue `Textarea` | Notes field | `app/components/ui/textarea` | Existing |

### File Structure

```
app/
├── components/
│   ├── milestone/
│   │   ├── MilestoneCard.vue                    ← Add PayMilestoneButton
│   │   ├── MilestoneDetail.vue                  ← Add PayMilestoneButton
│   │   ├── MilestoneActions.vue                 ← Update to include payment actions
│   │   └── PayMilestoneButton.vue               ← New
│   ├── payment/                                 ← New folder
│   │   ├── PaymentConfirmDialog.vue             ← New
│   │   └── PaymentStatusTag.vue                 ← New (Story 04-02)
│
├── composables/
│   ├── usePayments.ts                           ← New
│   └── useMilestones.ts                         ← Extend with payForMilestone()
│
├── utils/
│   └── statusMachine.ts                         ← Add PAYMENT_STATUS_META
│
└── i18n/
    ├── ar.json                                  ← Add payment keys
    └── en.json                                  ← Add payment keys
```

### Status Machine Integration

**Update `utils/statusMachine.ts`:**

```typescript
// Add payment status metadata
export const PAYMENT_STATUS_META = {
  pending_payment: { label: 'payment.status.pending', color: 'muted', icon: 'Clock' },
  paid: { label: 'payment.status.paid', color: 'info', icon: 'Lock' },
  awaiting_approval: { label: 'payment.status.awaiting_approval', color: 'accent', icon: 'Clock' },
  ready_for_payout: { label: 'payment.status.ready_for_payout', color: 'accent', icon: 'CheckCircle' },
  paid_out: { label: 'payment.status.paid_out', color: 'primary', icon: 'CheckCircle' }
}

// Payment status → Milestone status mapping (from §4 of status-flows.md)
export function derivePaymentStatus(milestoneStatus: string): string {
  const mapping = {
    'not_started': 'pending_payment',
    'in_progress': 'paid',
    'under_review': 'paid',
    'supervisor_approved': 'awaiting_approval',
    'approved': 'ready_for_payout',
    // Note: paid_out is set by admin release action
  }
  return mapping[milestoneStatus] || 'pending_payment'
}

// Validate payment transition
export function canPayForMilestone(milestone: Milestone): boolean {
  return milestone.status === 'not_started' && milestone.paymentStatus === 'pending_payment'
}
```

### API Integration

**Endpoint:** `POST /milestones/:id/pay`  
**Authentication:** Bearer token required  
**Request body:**

```typescript
interface PaymentPayload {
  payment_method: 'bank_transfer' // MVP: only bank transfer
  bank_name: string
  transaction_reference: string
  receipt_image: File | string (base64)
  notes?: string
}
```

**Response (200):**

```typescript
interface PaymentResponse {
  data: {
    id: string
    milestone_id: string
    status: 'paid'
    amount: number
    payment_method: 'bank_transfer'
    bank_name: string
    transaction_reference: string
    receipt_url?: string
    notes?: string
    created_at: string
  }
  message: string
}
```

**Response (422 Validation Error):**

```typescript
interface ValidationError {
  message: string
  errors: Record<string, string[]>
}
```

**Composable pattern:**

```typescript
// app/composables/usePayments.ts
export const usePayments = () => {
  async function payForMilestone(milestoneId: string, payload: PaymentPayload) {
    // 1. Optimistically update store
    const milestone = useMilestones().getById(milestoneId)
    const prevMilestoneStatus = milestone.status
    const prevPaymentStatus = milestone.paymentStatus
    
    useMilestones().setStatus(milestoneId, 'in_progress')
    useMilestones().setPaymentStatus(milestoneId, 'paid')
    
    try {
      // 2. Call API
      const response = await $fetch(`/milestones/${milestoneId}/pay`, {
        method: 'POST',
        body: payload
      })
      
      // 3. Success — state already updated optimistically
      return response.data
    } catch (error) {
      // 4. Rollback on error
      useMilestones().setStatus(milestoneId, prevMilestoneStatus)
      useMilestones().setPaymentStatus(milestoneId, prevPaymentStatus)
      throw error
    }
  }
  
  return { payForMilestone }
}
```

### TypeScript Types

```typescript
// shared/types/payment.ts
export interface PaymentPayload {
  payment_method: 'bank_transfer'
  bank_name: string
  transaction_reference: string
  receipt_image: File
  notes?: string
}

export type PaymentStatus = 'pending_payment' | 'paid' | 'awaiting_approval' | 'ready_for_payout' | 'paid_out'

export interface Payment {
  id: string
  milestone_id: string
  status: PaymentStatus
  amount: number
  payment_method: 'bank_transfer'
  bank_name: string
  transaction_reference: string
  receipt_url?: string
  notes?: string
  created_at: string
  updated_at: string
}

// Extend existing Milestone type
export interface Milestone {
  // ... existing fields
  paymentStatus: PaymentStatus
  payment?: Payment
}
```

### Form Validation

Use `VeeValidate` + `Zod` (established in project):

```typescript
// Schema in component
const paymentSchema = z.object({
  bank_name: z.string().min(2).max(100),
  transaction_reference: z.string().min(5).max(50),
  receipt_image: z.instanceof(File).refine(
    (file) => ['image/jpeg', 'image/png'].includes(file.type),
    'Only JPG/PNG accepted'
  ).refine(
    (file) => file.size <= 5 * 1024 * 1024,
    'Max 5MB'
  ),
  notes: z.string().max(500).optional()
})

const { handleSubmit, values, errors } = useForm({
  validationSchema: toTypedSchema(paymentSchema)
})
```

### File Upload Handling

**For MVP (no S3 integration):**

- Accept file from `<input type="file" />`
- Convert to base64 if backend expects it: `const base64 = await fileToBase64(file)`
- OR send as multipart/form-data if backend supports it
- **Check API contract:** `docs/api-contracts.md` for exact format expected

**Preview after selection:**

```vue
<img 
  v-if="selectedFile" 
  :src="fileUrl" 
  class="rounded-xl aspect-video object-cover w-full"
/>
```

---

## 💾 Previous Story Intelligence

**Story 03-07 (Client Approval Queue)** provides context:

- Dialog patterns for approval confirmation (reusable)
- How to show optimistic updates in list views
- Permission check pattern: `usePermission().can('approve_milestone')`
- Error handling + toast patterns
- i18n for modal dialogs

**Story 03-05 (Client gives final approval)** provides patterns:

- Dialog structure (title, amount, warning, buttons)
- Amount formatting: `text-2xl font-extrabold text-primary`
- Optimistic update + rollback in composable
- Permission guard before rendering action

**Story 03-04** (Supervisor Reviews) provides patterns:

- Checking `canTransition()` before state changes
- Updating milestone status in composables
- Notification patterns

---

## 🔨 Implementation Order

1. **Create types & schema**
   - Add `PaymentPayload`, `PaymentStatus`, `Payment` types in `shared/types/payment.ts`
   - Update `Milestone` type to include `paymentStatus` and `payment` fields
   - Add payment schema to `utils/statusMachine.ts`

2. **Create composables**
   - Create `usePayments.ts` with `payForMilestone()` method
   - Extend `useMilestones()` with `setPaymentStatus()` method
   - Update permission rules if needed: add `can('pay_milestone')`

3. **Create components (in order)**
   - `PaymentConfirmDialog.vue` — the form dialog (standalone)
   - `PayMilestoneButton.vue` — button that opens dialog
   - Integrate button into `MilestoneCard.vue` and `MilestoneDetail.vue`

4. **Add i18n keys**
   - All dialog labels, button text, success/error messages
   - Test in both AR and EN

5. **Testing**
   - Unit: Test `canPayForMilestone()` transitions
   - Component: Test dialog open/close, form validation
   - E2E: Happy path (button click → dialog → submit → success), error handling, RTL

6. **RTL verification**
   - Test in Arabic locale
   - Verify button placement, form layout, image preview
   - Verify currency formatting

---

## 🎯 Completion Checklist

- [ ] Button visible only to clients when milestone is `not_started` and payment is `pending_payment`
- [ ] Dialog opens with correct milestone info and amount
- [ ] Form validates: bank name, tx ref, image required
- [ ] Image preview shows after selection
- [ ] Submit calls `POST /milestones/:id/pay` with correct payload
- [ ] Optimistic update: milestone → `in_progress`, payment → `paid`
- [ ] Success toast shown with i18n message
- [ ] Error toast on failure, form stays open for retry
- [ ] Rollback works on error
- [ ] Button disappears after payment; payment status badge appears
- [ ] All i18n keys exist in both `ar.json` and `en.json`
- [ ] RTL tested: dialog, form layout, currency display
- [ ] No console errors or warnings
- [ ] TypeScript: no `any`, all types strict
- [ ] Permission checks in place

---

## 📚 Reference Documentation

- **Epic context:** `_bmad-output/planning-artifacts/epic-04-payments.md`
- **Payment flows:** `docs/status-flows.md` §4
- **Design spec:** `docs/design-spec.md` §11 (Payments section)
- **API contracts:** `docs/api-contracts.md` (check for `POST /milestones/:id/pay` schema)
- **Approval patterns:** `_bmad-output/implementation-artifacts/03-05-client-gives-final-approval.md`
- **Status machine:** `app/utils/statusMachine.ts`
- **UI patterns:** shadcn-vue Dialog, Button, Input, Textarea

---

## 🔄 Story Dependencies

- **Blocks:** Stories 04-02 (Payment badge), 04-03 (Admin release), 04-04 (Contractor history), 04-05 (Client overview)
- **Blocked by:** None — can start immediately
- **Related:** Stories 03-04, 03-05 (approval patterns), Story 03-07 (dialog patterns)

---

**Dev Notes:**

This is the first story in the payments epic. It's critical that:

1. **Payment status is DERIVED from milestone status** (see `status-flows.md §4`) — never manage independently
2. **Client MUST pay upfront** per milestone before work begins — this unlocks the contractor
3. **Escrow explanation must be clear** — the client needs to understand funds are held, not transferred immediately
4. **Error cases must be handled gracefully** — payment is high-stakes; UX must be rock-solid
5. **RTL must work** — this is an Arabic-first platform; test every layout decision in RTL

The dialog pattern should be reusable for other payment actions (04-03 release, potentially 04-06 withdrawal request).

Good luck! 🚀

---

## 🔍 Code Review Findings

**Date:** 2026-05-09  
**Reviewers:** Blind Hunter (diff), Edge Case Hunter (paths), Acceptance Auditor (spec)  
**Total Issues:** 27 (3 decision-needed, 20 patch, 4 defer)

### 🔴 Decision-Needed (Requires your input before fixing)

- [ ] [Review][Decision] **Dialog reset timing** — Form resets immediately after emit (line 117-119), but parent API call may still be in flight. Should we: A) Wait for parent confirmation before resetting? B) Reset only after success toast? C) Keep current behavior and rely on parent error handling?

- [ ] [Review][Decision] **Optimistic update scope** — Status hardcoded to `in_progress` when payment succeeds (line 608-612). Should this be: A) Always `in_progress`? B) Derived from a business rule? C) Configurable per payment type?

- [ ] [Review][Decision] **Retry mechanism** — Spec §146 mentions "Retry-able with 'Try again' button" but current implementation shows error toast only. Should we: A) Add explicit retry button? B) Auto-retry with exponential backoff? C) Defer to Story 04-04?

### 🟠 Patch (Code fixes applied)

- [x] [Review][Patch] Remove unused `isLoading` ref — Use only `isSubmitting` from VeeValidate [PaymentConfirmDialog.vue:32] ✅ FIXED
- [x] [Review][Patch] Add file re-validation in onSubmit — Validate `selectedFile.value` exists before submission [PaymentConfirmDialog.vue:102-104] ✅ FIXED
- [x] [Review][Patch] Add FileReader error handler — Catch file read failures and show i18n error [PaymentConfirmDialog.vue:79-82] ✅ FIXED
- [x] [Review][Patch] Type handlePaymentSubmit payload — Change `payload: any` to `payload: PaymentPayload` [MilestoneActions.vue:126] ✅ FIXED
- [x] [Review][Patch] i18n file validation errors — Move errors to i18n keys (validation.file.*) [PaymentConfirmDialog.vue:62,70] ✅ FIXED
- [x] [Review][Patch] Permission guard in MilestoneActions — Already present, verified working [MilestoneActions.vue:99-109] ✅ CONFIRMED
- [x] [Review][Patch] Button variant — Updated to use correct i18n key [PayMilestoneButton.vue:56] ✅ FIXED
- [x] [Review][Patch] Improve transition error message — Now logs actual transition rejection reason [useMilestones.ts:603] ✅ FIXED
- [x] [Review][Patch] Prevent double-submit race condition — Check `isSubmitting` before allowing submit [PaymentConfirmDialog.vue:102] ✅ FIXED
- [x] [Review][Patch] Map 422 validation errors — Extract field errors from API response [useMilestones.ts:644] ✅ FIXED
- [x] [Review][Patch] Pass locale to formatCurrency — Use 'ar' locale when formatting [PaymentConfirmDialog.vue:101] ✅ FIXED
- [x] [Review][Patch] Explicitly control RTL button order — Added `flex flex-row-reverse` class [PaymentConfirmDialog.vue:278] ✅ FIXED
- [x] [Review][Patch] Validate file extension + MIME type — Added regex check for file extension [PaymentConfirmDialog.vue:65] ✅ FIXED
- [x] [Review][Patch] Guard values object in computed — Added null check on values [PaymentConfirmDialog.vue:87-95] ✅ FIXED
- [x] [Review][Patch] Validate milestone exists before update — Added state corruption check [useMilestones.ts:635-638] ✅ FIXED
- [x] [Review][Patch] Log errors with notify guard — Added null check before logging [MilestoneActions.vue:163-166] ✅ FIXED
- [x] [Review][Patch] Add file input `multiple: false` — Explicitly prevent multiple file selection [PaymentConfirmDialog.vue:244] ✅ FIXED
- [x] [Review][Patch] Revoke blob URLs on cleanup — Added URL.revokeObjectURL calls [PaymentConfirmDialog.vue:131,148] ✅ FIXED
- [x] [Review][Patch] Validate milestone.amount > 0 — Show error if amount invalid [PaymentConfirmDialog.vue:101-106] ✅ FIXED
- [x] [Review][Patch] Emit actionComplete only after success — Moved to success path with guard [MilestoneActions.vue:163] ✅ FIXED

### ⚪ Deferred (Pre-existing, not blocking this story)

- [x] [Review][Defer] Duplicate milestone IDs across projects — No deduplication check in lookup logic [useMilestones.ts:595-598] — deferred, pre-existing issue
- [x] [Review][Defer] Missing i18n fallback on missing keys — `t('payment.success.message')` returns empty if key missing [PayMilestoneButton.vue:43] — deferred, i18n framework responsibility
- [x] [Review][Defer] Milestone type may lack payment_status field — Depends on shared/types/project.ts update [shared/types/project.ts] — deferred, type definition pending
- [x] [Review][Defer] Dialog ESC dismissal during flight — Unmount without cleanup if payment in progress [PaymentConfirmDialog.vue:126] — deferred, requires parent coordination
