# Story 02-02 — Create Project (Client)

**Status:** ready-for-dev  
**Epic:** 02 — Project Management  
**Story ID:** 2.2  
**Priority:** 🟡 HIGH — Enables client workflow  
**Complexity:** Medium  
**Estimated Effort:** 4–5 hours  

---

## 📋 User Story

**As a** client,  
**I want to** create a new construction project,  
**so that** I can start the process of finding a contractor through TAMM.

---

## ✅ Acceptance Criteria

- [ ] "Create project" button visible to `client` role only (on `/projects` page from story 02-01)
- [ ] Button opens a dialog (not a new page)
- [ ] Dialog title: i18n key `dialogs.create_project` (TBD — add to i18n)
- [ ] Form fields:
  - [ ] Project name (required, `Input` component, min 3 chars)
  - [ ] Description (optional, `Textarea` component)
  - [ ] Address / City (required, `Select` dropdown)
  - [ ] Project type (optional, `Select`: villa / apartment / commercial / other)
  - [ ] Area m² (optional, `Input` type=number)
  - [ ] Budget estimate (optional, formatted currency input)
- [ ] Form validates with Zod schema before submit
- [ ] On submit: calls `POST /projects` via `useApi`
- [ ] On success: dialog closes, new project card appears in list (story 02-01), success toast
- [ ] On validation error from API: field errors shown inline
- [ ] Submit button disabled during request
- [ ] Form resets on successful close
- [ ] New project always starts with status `new`
- [ ] RTL layout verified

---

## 🏗️ Developer Context

### Architecture & Tech Stack Requirements

**Framework & Stack (Locked — from CLAUDE.md §2):**
- Nuxt 4.x (all code in `app/` directory)
- Vue 3.5.x — `<script setup lang="ts">` only
- TypeScript — strict mode, no `any`
- Tailwind CSS v4.x — CSS-first, logical properties (`ms-*`, `start-*`, `ps-*`)
- shadcn-vue: `Button`, `Dialog`, `Input`, `Textarea`, `Select`, `Form`
- VeeValidate + Zod — schema-first validation
- Pinia — state management
- i18n — all text from `i18n/ar.json` and `i18n/en.json`
- `$fetch` / `useFetch` — never axios

**Never Use:**
- Options API, `any` types, direct API calls from components
- Physical CSS directions (`ml-*`, `mr-*`, `left-*`, `right-*`) — breaks RTL
- `v-html` (XSS risk)

---

### Current Project State

**From Stories 01-01 to 01-04 (✅ Complete):**
- Auth system fully functional
- User data available in store with `user.role`
- Topbar renders on authenticated pages
- Role-based access control working
- i18n system operational

**From Story 02-01 (✅ ready-for-dev):**
- `/projects` page exists with `definePageMeta({ roles: ['client', 'contractor'] })`
- `ProjectCard` component displays projects
- "Create project" button placeholder exists (disabled or hidden)
- `useProjects()` composable fetches projects

**What This Story Builds On:**
- Client role can access `/projects` page
- `useProjects()` composable manages project state
- Form infrastructure from login page (VeeValidate + Zod)
- Dialog pattern from shadcn-vue
- API wrapper (`useApi`) handles POST requests with Bearer token

---

### Files Affected

**NEW FILES:**
- `app/components/project/CreateProjectDialog.vue` — dialog component with form
- `app/composables/useCreateProject.ts` — form submission logic + mock
- `app/composables/__mocks__/useCreateProject.mock.ts` — mock for form (if separate)
- `tests/projects/create-project.spec.ts` — e2e tests
- `tests/unit/composables/useCreateProject.spec.ts` — unit tests

**MODIFIED FILES:**
- `app/pages/projects/index.vue` — add button, import dialog, bind to create state
- `i18n/locales/ar.json` — add form labels, placeholders, messages
- `i18n/locales/en.json` — add form labels, placeholders, messages

---

### API Contract

**Endpoint:** `POST /projects`  
**Status:** ❌ NOT YET AVAILABLE  
**Expected Request:**
```json
{
  "name": "Villa Project A",
  "description": "Modern villa in New Cairo",
  "address": "5 North Avenue, New Cairo",
  "city": "Cairo",
  "project_type": "villa",
  "area_m2": 400,
  "budget": 250000,
  "currency": "EGP"
}
```

**Expected Response (Success 200):**
```json
{
  "success": true,
  "data": {
    "id": "proj-123",
    "name": "Villa Project A",
    "description": "Modern villa in New Cairo",
    "address": "5 North Avenue, New Cairo",
    "city": "Cairo",
    "project_type": "villa",
    "area_m2": 400,
    "budget": 250000,
    "currency": "EGP",
    "status": "new",
    "contractor_id": null,
    "created_at": "2026-05-08T12:00:00Z"
  },
  "message": "Project created successfully"
}
```

**Expected Response (Validation Error 422):**
```json
{
  "success": false,
  "error": {
    "code": "validation_error",
    "message": "Validation failed"
  },
  "errors": {
    "name": ["Project name is required", "Project name must be at least 3 characters"],
    "address": ["Address is required"]
  }
}
```

**ACTION:** Since endpoint is not available, build form + composable fully and create mock. Add comment: `// TODO: replace mock — POST /projects endpoint`. When backend delivers, replace mock and update contract file.

---

### Design System Requirements

**From `docs/design-spec.md §8.3` (New Project Form):**

**Dialog Layout:**
- Title: `dialogs.create_project` (i18n key)
- Width: `max-w-md` or `w-full md:max-w-lg` (responsive)
- Scroll: form fits in viewport on mobile, scrollable if needed

**Form Fields Visual:**
1. **Project Name** — Required
   - `Input` component
   - Placeholder: i18n key `forms.project_name_placeholder`
   - Label: i18n key `forms.project_name`
   - Validation: required, min 3 chars, max 100 chars
   - Error: field-level inline error

2. **Description** — Optional
   - `Textarea` component
   - Placeholder: i18n key `forms.description_placeholder`
   - Label: i18n key `forms.description`
   - Rows: 3-4

3. **Address / City** — Required
   - `Select` component (dropdown)
   - Label: i18n key `forms.city`
   - Options: hardcoded list of Egyptian cities (Cairo, Giza, Alexandria, etc.) or API call (TBD)
   - Placeholder: i18n key `forms.select_city`

4. **Project Type** — Optional
   - `Select` component
   - Label: i18n key `forms.project_type`
   - Options: villa, apartment, commercial, other
   - Placeholder: i18n key `forms.select_type`

5. **Area m²** — Optional
   - `Input` type=number
   - Label: i18n key `forms.area_m2`
   - Placeholder: "400"

6. **Budget Estimate** — Optional
   - Currency input (formatted)
   - Label: i18n key `forms.budget`
   - Placeholder: "250,000"
   - Format: `formatCurrency()` utility for display

**Dialog Actions:**
- Cancel button: closes dialog, discards form
- Submit button: "Create Project" (i18n key `forms.create_project`)
  - Primary style: `bg-primary px-6 py-3 rounded-full`
  - Disabled during request: `disabled: isSubmitting`
  - Shows loading state: spinner or text change (TBD)

**RTL Notes:**
- Form labels: `text-start` (RTL-safe)
- Input end-aligned icons: use `start-*` not `end-*` for RTL
- Select dropdown: naturally RTL-aware
- Dialog content: all text uses logical properties

---

### Data Shapes

**Project Form Schema (Zod):**
```ts
const createProjectSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  address: z.string().min(5).max(255),
  city: z.string().nonempty('City is required'),
  project_type: z.enum(['villa', 'apartment', 'commercial', 'other']).optional(),
  area_m2: z.number().positive().optional(),
  budget: z.number().positive().optional(),
})

type CreateProjectInput = z.infer<typeof createProjectSchema>
```

**useCreateProject Composable Return:**
```ts
const isOpen = ref(false)
const isSubmitting = ref(false)
const formError = ref<string | null>(null)
const fieldErrors = ref<Record<string, string[]>>({})

const openDialog = () => { isOpen.value = true }
const closeDialog = () => { isOpen.value = false; resetForm() }
const submitForm = async (data: CreateProjectInput) => { ... }
const resetForm = () => { /* clear all state */ }
```

---

### Implementation Approach

**Step 1: Create Zod Schema**
- Define `createProjectSchema` with all validations
- Type inference: `type CreateProjectInput`
- Reuse from login form pattern (VeeValidate already set up)

**Step 2: Create `useCreateProject` Composable**
- Dialog open/close state
- Form submission logic with `useApi('/projects', { method: 'POST', body })`
- Error handling (validation + server errors)
- Mock implementation for now: `// TODO: replace mock`

**Step 3: Create `CreateProjectDialog` Component**
- Import `Dialog`, `Input`, `Textarea`, `Select`, `Button` from shadcn-vue
- Use `@vee-validate/nuxt` for form binding
- Field-level error display
- Submit button disabled during request
- Dialog closed on success

**Step 4: Update `/projects` Page**
- Import `CreateProjectDialog` component
- Add button: `<Button @click="createProject.openDialog()">Create project</Button>`
- Only visible for `client` role
- Dialog slot in template below content

**Step 5: Add i18n Keys**
- Form labels (ar.json + en.json)
- Placeholders
- Error messages
- Success/error toasts
- Dialog title

**Step 6: Test**
- Form validation (required, min/max)
- Success submission
- Error handling (API errors)
- Dialog open/close
- Form reset after submit

---

### Previous Story Intelligence

**Story 02-01 (Project List Page — ✅ ready-for-dev):**
- `/projects` page structure established
- `ProjectCard` component pattern
- `useProjects()` composable for fetching
- Empty state when no projects
- Role-based access control in place

**Learning from 02-01:**
- Form pattern: VeeValidate + Zod (established in story 01-01)
- Dialog pattern: shadcn-vue `Dialog` component
- Error handling: field-level errors
- i18n pattern: all strings via keys
- API wrapper: `useApi()` for all requests

**Avoid Mistakes from Previous Stories:**
- ✅ Use logical properties (ms-*, text-start, etc.)
- ✅ All form labels via i18n
- ✅ No hardcoded role checks in component (use middleware)
- ✅ Proper error state handling (not silent failures)

---

### Git Insights (Recent Commits)

**Pattern from Stories 01-01 to 01-04:**
- New composables in `app/composables/`
- Components in `app/components/<feature>/`
- Tests in parallel structure: `tests/`, `tests/unit/`
- i18n updates in parallel: `ar.json`, `en.json`
- Story specs in `_bmad-output/implementation-artifacts/`

**Recent File Locations:**
```
app/
├── components/
│   ├── layout/Topbar.vue
│   └── project/ProjectCard.vue  ← This story adds CreateProjectDialog
├── composables/
│   ├── useAuth.ts
│   └── useProjects.ts            ← This story adds useCreateProject
├── pages/
│   └── projects/index.vue        ← Button added here
└── stores/
    └── auth.ts
```

---

### Testing Strategy

**Unit Tests (`tests/unit/composables/useCreateProject.spec.ts`):**
- Test schema validation (required fields, min/max length)
- Test form submission with mock API
- Test error handling (validation + server errors)
- Test form reset after success
- Test field error display

**E2E Tests (`tests/projects/create-project.spec.ts`):**
- Navigate to `/projects`
- Click "Create project" button
- Fill form (client role only)
- Submit form
- Verify success toast
- Verify new project appears in list
- Test validation errors
- Test error retry

**Manual Testing Checklist:**
- [ ] Login as client
- [ ] Navigate to `/projects`
- [ ] Click "Create project" button
- [ ] Dialog opens
- [ ] Try submitting empty form (validation error)
- [ ] Fill form with valid data
- [ ] Submit (mock creates project)
- [ ] Dialog closes, new card appears in list
- [ ] Test in Arabic (RTL layout)
- [ ] Test on mobile (responsive dialog)

---

### Component Dependencies

**shadcn-vue Components (Already Installed):**
- `Button`
- `Input`
- `Textarea`
- `Select`
- `Dialog`
- `Form` (optional, if using form composition)

**New Components Needed:**
- None! All dependencies already available.

**Internal Dependencies:**
- `useCreateProject` composable
- `useProjects` composable (to update list after success)
- Zod schema (already used in login form)

---

### No Blocking Dependencies

✅ Auth system ready (stories 01-01 to 01-04)  
✅ Project list page ready (story 02-01)  
✅ Form infrastructure ready (VeeValidate + Zod from 01-01)  
✅ Dialog component available (shadcn-vue)  
✅ i18n system ready (from stories 01-02, 01-03, 01-04)  

⚠️ Backend endpoint `POST /projects` NOT YET AVAILABLE — use mock  
⚠️ City list may be hardcoded or need separate API (clarify with PM)

---

### Definition of Done

A story is complete when:

**Behavioral (CLAUDE.md §0):**
- [ ] Assumptions stated explicitly before implementation
- [ ] No code outside scope of this story
- [ ] Unused imports/variables removed

**Functional:**
- [ ] All acceptance criteria verified
- [ ] Form validates before submit
- [ ] Dialog opens/closes correctly
- [ ] Success message shows
- [ ] New project appears in list
- [ ] Client role only (no unauthorized access)

**Quality:**
- [ ] RTL layout tested and verified in Arabic
- [ ] All UI strings use i18n keys — no hardcoded text
- [ ] Only logical CSS properties used
- [ ] Error states handled and shown to user
- [ ] Loading states on submit button
- [ ] TypeScript — no errors, no `any`
- [ ] No console errors or warnings
- [ ] Mock removed comment added: `// TODO: replace mock — POST /projects`

---

## 📝 Notes for Developer

**Start Here:**
1. Read `docs/design-spec.md §8.3` (New Project Form) for visual spec
2. Read story 02-01 to understand project list context
3. Check `app/pages/login.vue` for form pattern (VeeValidate + Zod)

**Key Decisions Made:**
- Dialog, not page (users stay on projects list)
- No contractor or milestone fields (selected later via proposals/bidding)
- Client role only — contractor cannot create (confirmed in story specs)
- Status always `new` — admin opens bidding later (Epic 07)

**Tricky Parts:**
- Field error handling: display server errors inline per field
- Dialog closing on success: reset form state
- City list: clarify source (hardcoded or API) with PM
- Currency formatting: use `formatCurrency()` utility

---

## ✨ Status

- **Story Status:** ready-for-dev
- **Analysis Completed:** 2026-05-08
- **Ready for:** `bmad-dev-story` agent
- **Next Step:** Implement, test, then run `/bmad-code-review` before marking done

