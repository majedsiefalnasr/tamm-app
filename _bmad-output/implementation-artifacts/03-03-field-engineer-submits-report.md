# Story 03-03 — Field Engineer Submits Report

**Status:** ready-for-dev  
**Epic:** 03 — Milestones, Reports & Approval Flow  
**Story ID:** 3.3  
**Priority:** 🔴 CRITICAL — Unblocks entire approval flow (milestones cannot progress without reports)  
**Complexity:** High  
**Estimated Effort:** 10–12 hours  

---

## 📋 User Story

**As a** field engineer,  
**I want to** submit a progress report for a milestone,  
**so that** the supervisor can review the work done.

---

## ✅ Acceptance Criteria

### Report Submission Entry Point

- [ ] "Submit report" button visible **only** to `field_engineer` role when milestone status is `in_progress`
- [ ] Button uses visibility matrix from Story 03-01: `field_engineer` + `in_progress` status only
- [ ] Button checks permission via `usePermission().can('submit_report', milestone.allowedActions)` before rendering
- [ ] Clicking button opens report submission form (via Dialog or new page — see Technical notes)

### Report Form UI

- [ ] Form renders as a full-height Dialog or navigates to `/projects/:id/milestones/:mid/report`
- [ ] Form title: "تقديم تقرير — [milestone name]" (Arabic first, English fallback)
- [ ] All form labels use i18n keys (no hardcoded text)

#### Notes/Content Field
- [ ] Textarea input for report content/notes
- [ ] Required field — min 20 characters
- [ ] Placeholder text from i18n: "اكتب ملاحظاتك حول المرحلة..."
- [ ] Character counter shows current/max (optional nice-to-have)
- [ ] Validation error if < 20 chars on submit attempt

#### Image Upload Zone
- [ ] Dashed border container: `rounded-2xl border-dashed border-border p-6 text-center`
- [ ] Drag & drop support: User can drag images onto zone
- [ ] Click zone: Opens file picker for multiple file selection
- [ ] Hidden `<input type="file" multiple accept="image/*">` controlled by component
- [ ] File restrictions:
  - **Max files:** 10 images
  - **Max file size:** 5MB per image
  - **Allowed formats:** jpg, jpeg, png, webp only
- [ ] Error messages if limit exceeded:
  - "Maximum 10 images allowed" (if trying to add 11th)
  - "[filename] exceeds 5MB" (per file)
  - "[filename] is not a supported format" (non-image types)
- [ ] All error messages use i18n

#### Image Preview Grid
- [ ] After files are selected, show preview grid: `grid grid-cols-3 gap-2`
- [ ] Each preview:
  - Thumbnail: `rounded-xl aspect-square object-cover`
  - Relative positioning container for remove button
  - Remove button: `absolute top-1 end-1 h-5 w-5 rounded-full bg-card/80 text-destructive cursor-pointer hover:bg-destructive hover:text-destructive-foreground`
  - Clicking remove deletes image from selection (not from API)
- [ ] Grid updates immediately as user adds/removes files
- [ ] RTL safe: grid flows naturally without directional dependency

### Form Submission Buttons

- [ ] "حفظ كمسودة" (Save as draft) button
  - Style: Outline button `§5.6` from design spec
  - Saves form data to **local state only** (NOT to API)
  - Does NOT change milestone status
  - Notifies user: "Draft saved locally" (toast)
  - Allows user to navigate away and return to draft later
  - Draft persists if user closes dialog and reopens

- [ ] "رفع التقرير" (Submit report) button
  - Style: Primary button `§5.5` from design spec
  - Validates form before submission:
    - Content required, min 20 chars
    - No validation on images (optional, 0–10 allowed)
  - Shows loading spinner during submission
  - Disabled while request in flight
  - On success (see API section):
    - Milestone status updates optimistically to `under_review`
    - Dialog/page closes
    - Toast notification: "Report submitted successfully"
    - User redirected to milestone detail or project page
  - On error:
    - Error toast: "Failed to submit report: [error message]"
    - Form remains open, data preserved
    - Rollback milestone status to previous state

### Validation & Error Handling

- [ ] Client-side validation before submit:
  - Content min 20 chars: error message "أقل حد أدنى 20 حرف" (i18n)
  - No more than 10 images: error message (i18n)
  - All images < 5MB each: error message per file (i18n)
  - All images are jpg/png/webp: error message per file (i18n)
- [ ] Form shows validation errors near the field that failed
- [ ] Validation errors prevent form submission
- [ ] API errors show as toast notifications (do not block form)

### RTL & Internationalization

- [ ] All layout uses logical properties:
  - `ms-*` / `me-*` for margins
  - `ps-*` / `pe-*` for padding
  - `start-*` / `end-*` for positioning
  - `text-start` / `text-end` for text alignment
- [ ] Upload zone is directionally neutral (centered, no left/right dependencies)
- [ ] Remove button on images uses `end-1 top-1` not `right-1 top-1`
- [ ] All UI strings use i18n keys (dialog title, button labels, placeholders, error messages)
- [ ] Form tested in both Arabic and English RTL/LTR modes

### Loading & Error States

- [ ] While form is being submitted:
  - Submit button shows loading spinner
  - Submit button disabled (no double-submit)
  - All form inputs remain enabled (user can keep editing)
- [ ] If image upload fails (too large, wrong format):
  - Error message appears below upload zone
  - User can remove problem image and try again
  - Form does not submit while errors exist
- [ ] If API request fails:
  - Toast error notification with backend error message
  - Form data persists (user can retry)
  - Milestone status rolls back to previous state
  - User remains on form

### Draft Auto-Save (Local State)

- [ ] Form state saved to component's local reactive variable (not Pinia, not localStorage)
- [ ] If user closes dialog without submitting:
  - Content and selected images are lost (intended — local only)
  - On reopening dialog, form is empty (new draft starts)
- [ ] If user navigates away accidentally:
  - Browser may prompt "unsaved changes" if form has content (optional)
  - On returning to form, previous draft is gone (not persisted to disk)
- [ ] Draft button label makes clear this is local-only: "حفظ كمسودة" (no "to server" indicator needed)

---

## 🏗️ Developer Context

### Files to Create/Modify

1. **app/components/milestone/ReportForm.vue** — NEW (400–500 lines)
   - Main form component
   - Manages form state: content (textarea), images (file array), loading state
   - Handles file selection (click + drag-drop)
   - Renders preview grid with remove buttons
   - Two submission paths: save draft (local) and submit (API + optimistic update)
   - Props: `milestoneId`, `projectId`, `milestoneName`
   - Emits: `@submit` (successful submission), `@cancel` (user closes)
   - Form opens as Dialog component from parent

2. **app/composables/useMilestones.ts** — MODIFY
   - New function: `submitReport(milestoneId, reportData)` with signature:
     ```ts
     async submitReport(
       milestoneId: string,
       content: string,
       images: File[]
     ): Promise<Report>
     ```
   - Implementation pattern:
     1. Call `canTransition('milestone', currentStatus, 'under_review')` before API call
     2. Optimistically update milestone status to `under_review` in store
     3. POST to `/milestones/:id/reports` with multipart/form-data:
        - `content`: string
        - `images`: File[] (FormData with multiple file entries)
     4. Then POST to `/reports/:id/submit` (if required by API — check contracts)
     5. On success: return Report object
     6. On error: rollback milestone status, throw error for caller to handle
   - All requests through `useApi` wrapper (not $fetch directly)
   - No notification sent from composable (let component handle toast)

3. **app/pages/projects/[id]/milestones/[mid]/report.vue** — NEW (optional, depends on UX choice)
   - If form opens as a page (not Dialog), create this route
   - Renders `ReportForm` component
   - Handles success/error from form
   - Redirects on success to milestone detail page
   - Provides back button to return to milestone

4. **app/components/milestone/MilestoneCard.vue** — MODIFY
   - Add "Submit report" button using visibility matrix from Story 03-01
   - Button visible only when:
     - User role is `field_engineer` AND
     - Milestone status is `in_progress` AND
     - `usePermission().can('submit_report', milestone.allowedActions)` returns true
   - On click: open ReportForm dialog
   - After form submission succeeds: refresh milestone data (refetch from API)

5. **shared/types/milestone.ts** — CREATE/MODIFY
   ```ts
   export interface Report {
     id: string
     milestoneId: string
     engineerId: string  // field engineer who submitted
     engineerName: string
     content: string
     images: string[]  // array of image URLs
     status: 'draft' | 'submitted' | 'approved' | 'rejected'
     submittedAt?: string
     createdAt: string
     updatedAt: string
   }
   ```

6. **app/composables/usePermission.ts** — VERIFY
   - Ensure `can('submit_report', allowedActions)` works
   - Map `submit_report` action to appropriate permission check
   - `allowedActions` array comes from milestone response from API

7. **utils/statusMachine.ts** — VERIFY
   - Ensure transition `in_progress` → `under_review` is valid
   - Function `canTransition('milestone', 'in_progress', 'under_review')` returns true

8. **app/assets/css/main.css** — VERIFY
   - Ensure dashed border utilities exist: `border-dashed`
   - Ensure aspect-square exists for image thumbnails

### API Integration Points

From `docs/api-contracts.md`, the report endpoints should be:

**POST /milestones/:id/reports**
- Request: multipart/form-data
  - `content`: string (required, min 20 chars)
  - `images`: File[] (optional, max 10 files, max 5MB each)
- Response: Report object with ID, timestamps, URL list
- Error: 422 validation error with field-specific messages

**POST /reports/:id/submit** (if required)
- Request: `{ /* empty or milestone_id */ }`
- Response: Updated Report with status = `submitted`

⚠️ **If these endpoints are not available in API contracts**, create mock in `app/composables/__mocks__/`:
- Mock returns success after 500ms delay
- Mock stores data in memory (lost on refresh)
- Add TODO comment: "Replace mock — POST /milestones/:id/reports endpoint"

### Component Communication Flow

```
MilestoneCard
  ↓ (user clicks "Submit report")
  ↓ (opens Dialog)
ReportForm
  ↓ (user selects images + content)
  ↓ (user clicks "Submit")
  ↓
useMilestones.submitReport()
  ↓ (optimistic update + API call)
  ↓
Pinia store (milestone status = under_review)
  ↓ (success)
  ↓
ReportForm emits @submit
  ↓
MilestoneCard closes dialog + refreshes data
```

---

## 🧪 Testing Checklist (Before Calling Done)

### Functional Tests
- [ ] Form opens when "Submit report" button clicked
- [ ] Form closes when user clicks X or Cancel
- [ ] Content textarea accepts text, enforces min 20 chars
- [ ] Image upload zone accepts drag-drop AND click-to-select
- [ ] Image preview grid shows all selected images
- [ ] Remove button on each image removes it from preview
- [ ] Max 10 images enforced (11th file shows error)
- [ ] File size validation: 5MB+ file shows error
- [ ] File type validation: non-image file shows error
- [ ] "Save draft" button saves to local state (no API call)
- [ ] Closing + reopening form after draft save shows empty form (local only, not persistent)
- [ ] "Submit report" button:
  - Disabled while loading
  - Shows spinner during request
  - On success: dialog closes, milestone status updates to `under_review`, success toast shown
  - On error: error toast shown, form remains open, data preserved, milestone status unchanged

### Permission & Status Tests
- [ ] Button only visible to `field_engineer` role
- [ ] Button only visible when milestone status is `in_progress`
- [ ] Button hidden if `usePermission().can('submit_report')` returns false
- [ ] Form submission calls `canTransition('milestone', 'in_progress', 'under_review')` before API
- [ ] If transition invalid (status already changed), form submission rejected with error

### Validation Tests
- [ ] Submitting with empty content shows error: "Field required"
- [ ] Submitting with < 20 chars shows error: "Minimum 20 characters"
- [ ] Submitting with 0 images succeeds (images optional)
- [ ] Submitting with 1–10 images succeeds
- [ ] Submitting with 11+ images shows error before submission

### RTL Tests (Test in Arabic language)
- [ ] Upload zone is centered, no L-R bias
- [ ] Image grid flows left-to-right in Arabic (natural for LTR numbers like image count)
- [ ] Remove button on images positioned at `end-1 top-1` (visually correct in RTL)
- [ ] Dialog buttons: Cancel on start side, Submit on end side
- [ ] All strings render in Arabic (i18n working)
- [ ] Form submits successfully in RTL mode

### UX & Performance
- [ ] No console errors or warnings
- [ ] Form renders without layout shift
- [ ] Image preview renders immediately (no delay)
- [ ] Remove button hover state visible
- [ ] Loading spinner smooth (no jank)
- [ ] Form works on mobile (full height, image grid responsive)

### Integration Tests
- [ ] After successful submission:
  - Milestone detail page shows new report
  - Report status shows as "submitted"
  - Report content matches what was entered
  - Report images are accessible and render correctly
  - Milestone status is `under_review` in milestone card and detail page
- [ ] Supervisor can now see "Review report" button (prepared for Story 03-04)

---

## 📖 Technical Notes

### File Upload via multipart/form-data

The form uses `FormData` API to send images + content together:

```ts
const formData = new FormData()
formData.append('content', content)
images.forEach((file, idx) => {
  formData.append(`images[${idx}]`, file)  // or just append 'images' multiple times
})
// Send via POST /milestones/:id/reports
```

`$fetch` / `useFetch` handles FormData automatically — do not set `Content-Type` header manually.

### Image Preview Strategy

Store selected files in component state (not Pinia):
```ts
const selectedImages = ref<File[]>([])
```

Generate preview URLs via `URL.createObjectURL()` for thumbnails:
```ts
<img :src="URL.createObjectURL(file)" />
```

⚠️ Clean up object URLs when component unmounts to prevent memory leaks:
```ts
onUnmounted(() => {
  selectedImages.value.forEach(f => URL.revokeObjectURL(URL.createObjectURL(f)))
})
```

### Optimistic Update Pattern

```ts
async function submitReport(...) {
  const prev = store.milestones.get(milestoneId)?.status
  store.setMilestoneStatus(milestoneId, 'under_review')  // optimistic

  try {
    const res = await useApi(`/milestones/${milestoneId}/reports`, {
      method: 'POST',
      body: formData  // FormData sent as-is
    })
    return res.data
  } catch (error) {
    store.setMilestoneStatus(milestoneId, prev)  // rollback
    throw error
  }
}
```

### Dialog vs Page Navigation

Current design spec shows report form as Dialog (Story 03-03 design reference).
If implementation chooses to navigate instead, create `/projects/:id/milestones/:mid/report` route.
Either approach is valid — choose based on UX preference (modal focus vs full page).

**Recommendation:** Dialog is less disruptive, keeps context visible. Use Dialog.

### Local Draft Persistence

The story specifies "Save draft" → local state only, not persisted to localStorage/sessionStorage.
This is intentional — drafts are session-only, not durable across browser restarts.

If user wants durability, they should use "Submit" button (which saves to server as `status: submitted`).

---

## 🎯 Success Criteria Summary

- [ ] Field engineer can submit report with content + images
- [ ] Form validates before submission (content min 20 chars, image limits)
- [ ] Images stored as multipart/form-data in POST request
- [ ] Milestone status updates to `under_review` optimistically on success
- [ ] Error handling with rollback on failure
- [ ] RTL tested and working
- [ ] All UI strings use i18n keys
- [ ] No console errors
- [ ] Permission checks via `usePermission().can()` and visibility matrix

---

## 📚 Reference & Context

### Story 03-01 & 03-02 Learnings

From the previous stories, these patterns are already established:
- `MilestoneCard` component structure and props
- `useMilestones` composable with optimistic update pattern
- Permission checks via `usePermission().can()`
- Status validation via `canTransition()`
- Pinia store mutations for milestone state

**Use these exact patterns in this story** to maintain consistency.

### Epic 03 Overall Flow

This story is step 1 of the approval flow:
1. **03-03 (this story):** Field engineer submits report → `in_progress` → `under_review`
2. **03-04:** Supervisor reviews and approves/rejects → `under_review` → `supervisor_approved` or `in_progress`
3. **03-05:** Client gives final approval → `supervisor_approved` → `approved`

Do NOT implement approval logic here — that's 03-04 and 03-05.
This story **only** submits the report and transitions status to `under_review`.

### Design Reference

Full specs for form layout: `docs/design-spec.md §10 (reports)`
- Report form as Dialog with textarea + image grid
- Dashed border upload zone
- Photo preview grid with remove buttons
- Two action buttons: "Save draft" (outline) and "Submit" (primary)

### API Reference

Check `docs/api-contracts.md` for:
- `POST /milestones/:id/reports` endpoint
- Request/response schemas
- Multipart handling
- Error response format

If endpoints not yet available, create mocks in `app/composables/__mocks__/` with TODO comments.

### i18n Keys Required

- `fields.content` or `report.content` → "المحتوى" (AR) / "Content" (EN)
- `fields.images` or `report.images` → "الصور" (AR) / "Images" (EN)
- `actions.submit_report` → "رفع التقرير" (AR) / "Submit Report" (EN)
- `actions.save_draft` → "حفظ كمسودة" (AR) / "Save as Draft" (EN)
- `validation.required` → "مطلوب" (AR) / "Required" (EN)
- `validation.min_length` → "الحد الأدنى {n} أحرف" (AR) / "Minimum {n} characters" (EN)
- `errors.max_images` → "الحد الأقصى 10 صور" (AR) / "Maximum 10 images" (EN)
- `errors.file_too_large` → "{filename} يتجاوز 5MB" (AR) / "{filename} exceeds 5MB" (EN)
- `errors.unsupported_format` → "{filename} ليس صيغة مدعومة" (AR) / "{filename} is not supported" (EN)
- `success.report_submitted` → "تم رفع التقرير بنجاح" (AR) / "Report submitted successfully" (EN)
- `errors.submission_failed` → "فشل رفع التقرير: {message}" (AR) / "Failed to submit report: {message}" (EN)

---

## 🔗 Dependencies & Blockers

### Unblocked By
- ✅ Story 03-01 (MilestoneCard exists, action buttons visible)
- ✅ Story 03-02 (Milestone detail page exists, shows reports)

### Blocks
- ⏳ Story 03-04 (Supervisor approval — depends on this story's report submission)
- ⏳ Story 03-05 (Client approval — depends on 03-04, indirectly on this)

### API Dependencies
- ⏳ `POST /milestones/:id/reports` endpoint must be available OR mocked
- ⏳ Report response schema must match shared/types/Report interface

---

## 📝 Implementation Notes for Developer

### Key Decisions Made

1. **Dialog vs Page:** Using Dialog for form (less disruptive, keeps context visible)
2. **Draft Persistence:** Local-only (session), not persisted to server or localStorage
3. **Image Strategy:** Store File objects in component state, use URL.createObjectURL for previews
4. **Validation:** Client-side before submission, API errors trigger rollback
5. **Optimistic Updates:** Milestone status updated immediately, rolled back on error

### Avoid Common Mistakes

- ❌ Don't send images as separate API calls — batch in multipart FormData
- ❌ Don't hardcode status strings — use `canTransition()` and types
- ❌ Don't forget to clean up object URLs on unmount
- ❌ Don't persist draft to localStorage — local state only
- ❌ Don't forget i18n keys for all UI strings
- ❌ Don't use `ml-*` / `mr-*` / `left-*` / `right-*` — use logical properties
- ❌ Don't check role in template — use `usePermission().can()`

### Code Quality Standards (From CLAUDE.md)

- TypeScript: strict mode, no `any`
- Props: fully typed, no untyped interfaces
- Composition API: `<script setup lang="ts">` only
- State: all through Pinia store or component ref (no global vars)
- Imports: organize (1. imports, 2. props/emits, 3. store, 4. composables, 5. computed, 6. methods, 7. lifecycle)
- No `v-html` (XSS risk)
- No direct $fetch — always through composables/useApi
- Comments: only when WHY is non-obvious

### Testing in Browser

Before marking done:
1. Open browser DevTools → Network tab
2. Open milestone detail page
3. Click "Submit report" (field_engineer role only)
4. Form dialog opens, fill content + select images
5. Click "Submit report" button
6. Network tab shows POST request to `/milestones/:id/reports`
7. On success: dialog closes, milestone card updates to `under_review` status
8. Reload page: milestone detail shows new report with content + images

---

**Status:** ✅ Ultimate context engine analysis completed — comprehensive developer guide created  
**Ready for:** dev-story implementation  
**Next step:** Run `/bmad-dev-story 03-03-field-engineer-submits-report.md`
