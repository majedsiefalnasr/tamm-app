# Sprint Plan — TAMM vs Lovable Design Alignment (2026-05-11)

## Scope and Assumptions

- This sprint aligns **navigation + dashboard/inner page content** between TAMM and `lovable-design`.
- We inherit only what matches TAMM product scope and backend domain.
- We **exclude Store domain** (`store`, `products`, `categories`, `orders`, `purchases`, `buy-materials`) from implementation.
- We preserve TAMM architecture constraints: Nuxt pages + composables + permission/status rules.

---

## Current Comparison (Role-by-Role)

## 1) Sidebar Navigation Comparison

### Admin

- **Lovable:** `overview`, `projects`, `assignments`, `payments`, `reports`, `messages`, `users`, `workflow`, `finance`, `store`, `products`, `categories`, `orders`, `settings`
- **TAMM:** `overview`, `projects`, `payments`, `reports`, `messages`, `users`, `settings`
- **Decision:**
  - Keep: existing TAMM entries
  - Add: `assignments`, `workflow`, `finance` (TAMM-aligned)
  - Exclude: `store`, `products`, `categories`, `orders` (out of TAMM scope)

### Super Admin

- **Lovable:** no explicit separate role config (admin-centric model)
- **TAMM:** admin set + `system-flags`, `system-logs`
- **Decision:**
  - Keep TAMM `system-flags`, `system-logs`
  - Mirror new admin additions for super-admin too (`assignments`, `workflow`, `finance`)

### Client (Lovable `owner`)

- **Lovable owner:** `overview`, `projects`, `new-project`, `reports`, `payments`, `messages`, `purchases`, `settings`
- **TAMM client:** `overview`, `projects`, `reports`, `payments`, `messages`, `settings`
- **Decision:**
  - Add: `new-project` if mapped to TAMM create-project flow
  - Keep: shared items
  - Exclude: `purchases`

### Contractor

- **Lovable:** `overview`, `projects`, `tasks`, `reports`, `messages`, `withdrawals`, `buy-materials`, `settings`
- **TAMM:** `overview`, `projects`, `reports`, `messages`, `withdrawals`, `settings`
- **Decision:**
  - Add: `tasks`
  - Exclude: `buy-materials`

### Supervisor Engineer (Lovable `supervisor`)

- **Lovable:** `overview`, `projects`, `assignments`, `field-team`, `reports`, `approvals`, `messages`, `settings`
- **TAMM:** `overview`, `projects`, `reports`, `approvals`, `messages`, `settings`
- **Decision:**
  - Add: `assignments`, `field-team`
  - Keep: existing items

### Field Engineer (Lovable `field`)

- **Lovable:** `overview`, `projects`, `reports`, `messages`, `settings`
- **TAMM:** `overview`, `projects`, `reports`, `messages`, `settings`
- **Decision:** no nav delta

---

## 2) Inner Pages / Section Content Comparison

### Cross-role gap

- `messages` is in TAMM nav for all roles but no dedicated page exists (`/messages` currently unresolved).
- **Priority:** create role-aware messages module/page first, because it is a broken nav destination.

### Admin content gap (TAMM vs Lovable)

- Lovable has dedicated sections for:
  - Assignments queue
  - Workflow configuration
  - Finance analytics/withdrawal operations
- TAMM currently has:
  - Strong dashboard and user management
  - Admin projects panel
  - Payments page is contractor-centric (admin sees empty state)
- **Decision:** implement Admin Assignments, Workflow, Finance as TAMM-native pages/components.

### Client content gap

- Lovable includes explicit `new-project` section.
- TAMM project list has disabled create CTA, and no dedicated creation page.
- **Decision:** add TAMM `new-project` page/flow (or enable existing flow endpoint if available).

### Contractor content gap

- Lovable has tasks view + withdrawals + materials buying.
- TAMM has withdrawals but no dedicated tasks page.
- **Decision:** add contractor tasks page; skip materials buying.

### Supervisor content gap

- Lovable has assignments + field-team operational sections.
- TAMM supervisor dashboard already shows similar signals but as dashboard blocks, not dedicated pages.
- **Decision:** add dedicated `assignments` and `field-team` pages; keep existing dashboard widgets.

### Field content gap

- Field role is mostly aligned (overview/projects/reports/settings/messages pattern).
- **Decision:** keep current structure, improve content parity only where useful.

---

## Inheritance Rules (What to Bring from Lovable)

- **Bring directly (same domain):**
  - Role-specific nav taxonomy
  - Assignments and field-team operational workflows
  - Contractor tasks breakdown
  - Client quick-entry to project creation
  - Messages-first unified communication entry
- **Bring with adaptation (same intent, different TAMM architecture/backend):**
  - Page information architecture, cards, list sections, queue layouts
  - Workflow/finance admin surfaces
- **Do not bring:**
  - Any Store/e-commerce features and related UI/state/routes

---

## Full Sprint Backlog (Proposed)

## Sprint Name

`Sprint 11 — Role Navigation & Page Parity (Lovable-Aligned, TAMM-Scoped)`

## Goal

Make TAMM role navigation and inner pages match the strongest Lovable UX patterns for TAMM-relevant logic, while excluding Store domain and preserving TAMM permissions/status rules.

## Duration

10 working days (2 weeks)

## Epic A — Navigation Contract Alignment

### Story A1 — Expand role nav map for TAMM-relevant sections

- Update role nav definitions to include:
  - Admin/super-admin: `assignments`, `workflow`, `finance`
  - Client: `new-project`
  - Contractor: `tasks`
  - Supervisor: `assignments`, `field-team`
- Ensure every added entry maps to a real route.
- **Acceptance:**
  - No nav item points to missing routes
  - Role-based visibility remains permission-safe

### Story A2 — Sidebar grouping parity

- Group admin nav with clear sections (`platform`, `operations`, `other`, `system`) while preserving TAMM i18n.
- **Acceptance:**
  - RTL/LTR rendering preserved
  - No hardcoded labels (i18n only)

---

## Epic B — Missing Route Delivery

### Story B1 — Messages module baseline

- Create `/messages` route and role-aware message layout.
- Include empty/loading/error states and conversation list shell.
- **Acceptance:**
  - All role nav clicks to `messages` resolve successfully
  - Basic message shell renders with role context

### Story B2 — Admin operations routes

- Add:
  - `/assignments`
  - `/workflow`
  - `/finance`
- Build from current TAMM domain data and composables.
- **Acceptance:**
  - Pages available only to admin/super-admin
  - Critical lists/cards load with graceful empty/error states

### Story B3 — Supervisor operational routes

- Add:
  - `/assignments` (supervisor variant, or role-aware page)
  - `/field-team`
- Reuse existing supervisor dashboard logic where possible.
- **Acceptance:**
  - Role-safe access
  - Action queues visible and actionable

### Story B4 — Contractor tasks route

- Add `/tasks` page with milestone/task queue for contractor.
- **Acceptance:**
  - Tasks reflect contractor domain data
  - Clear action/status metadata shown

### Story B5 — Client new project route

- Add `/projects/new` (or `/new-project` mapped route) and wire CTA from nav/projects.
- **Acceptance:**
  - Client can access flow
  - Form state and validation present (or mocked if endpoint unavailable)

---

## Epic C — Content Parity Upgrade (Per Page)

### Story C1 — Align projects inner-page content by role

- Improve role-specific project list/detail blocks (queues, quick actions, progress context).
- **Acceptance:** each role sees relevant project context without store concepts.

### Story C2 — Align dashboard-to-inner-page continuity

- Ensure dashboard cards deep-link into newly created pages.
- **Acceptance:** dashboard interactions route to valid operational pages.

### Story C3 — Remove dead links and orphan nav states

- Audit nav hrefs against real route files and permissions.
- **Acceptance:** zero dead links for all six TAMM roles.

---

## Epic D — Quality, Permissions, and Regression

### Story D1 — Permission matrix enforcement audit

- Validate all new pages/actions through `usePermission().can()`.
- **Acceptance:** no role-string checks in templates for authorization logic.

### Story D2 — Status/transition safety checks

- Ensure newly introduced actions that mutate milestones/payments call `canTransition()` and rollback pattern.
- **Acceptance:** invalid transitions blocked with user feedback.

### Story D3 — RTL + i18n regression sweep

- Verify all added nav/page strings in `ar` + `en`.
- **Acceptance:** no hardcoded text, no physical CSS directions (`ml/pl/left`).

### Story D4 — Smoke tests

- Add/adjust Vitest and Playwright smoke coverage for:
  - role nav visibility
  - route access control
  - key page rendering
- **Acceptance:** tests pass in CI/local run.

---

## Delivery Sequence (Recommended)

1. **A1 + B1 first** (fix broken messages route and nav contract)
2. **B2/B3/B4/B5** (deliver missing pages by role priority)
3. **C1/C2/C3** (content parity polish)
4. **D1/D2/D3/D4** (hardening and regression)

---

## Out-of-Scope (Explicit)

- Store/e-commerce domain:
  - products
  - orders
  - categories
  - purchases
  - buy materials
- Any WordPress/WooCommerce integrations

---

## Risks and Mitigations

- **Risk:** route collisions for `/assignments` across admin and supervisor.
  - **Mitigation:** role-aware single page container or namespaced routes (`/admin/assignments`, `/supervisor/assignments`).
- **Risk:** backend endpoint gaps for new operational pages.
  - **Mitigation:** composable mocks with TODO contract markers.
- **Risk:** nav expansion without feature completeness.
  - **Mitigation:** ship pages with robust empty/loading/error states before advanced actions.

---

## Definition of Done for This Sprint

- All TAMM-relevant Lovable nav concepts are either implemented or consciously excluded with rationale.
- No dead nav links for any role.
- New pages are role-safe, i18n-complete, RTL-safe, and composable-driven.
- No Store-domain leakage into TAMM frontend.

