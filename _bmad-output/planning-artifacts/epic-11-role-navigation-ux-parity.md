# Epic 11 — Role Navigation & UX Parity (Lovable-Aligned, TAMM-Scoped)

> **Goal:** Align TAMM role navigation and operational inner-page UX with Lovable’s strongest patterns, while inheriting only TAMM-relevant logic and excluding Store domain features.
>
> **Inputs:**  
> - `_bmad-output/planning-artifacts/sprint-lovable-alignment-2026-05-11.md`  
> - `_bmad-output/planning-artifacts/sprint-change-proposal-2026-05-11-lovable-ux-alignment.md`  
> - `_bmad-output/planning-artifacts/ux-brief-epic-11-lovable-alignment.md`  
> - `app/utils/roleRoutes.ts`  
> - `app/components/layout/AppSidebar.vue`

---

## Design guardrails

- Use i18n keys only for all user-visible labels.
- Use logical CSS utilities only; preserve RTL-first behavior.
- Permission checks must use `usePermission().can()` (no template role-string auth checks).
- Any status mutations in new pages must preserve `canTransition()` + rollback patterns.
- Exclude Store domain pages/features from this epic.

---

## Story backlog

### Story 11-01 — Fix universal messages route baseline

**User outcome:** Every role can click sidebar `messages` and reach a valid page.

**Acceptance criteria**

1. Add TAMM `/messages` route with role-aware shell (loading/empty/error states).
2. Sidebar `messages` links are no longer dead for any role.
3. Page is fully localized and RTL-safe.

---

### Story 11-02 — Admin and super-admin operations nav parity

**User outcome:** Admin roles can access assignment/workflow/finance operational pages from sidebar.

**Acceptance criteria**

1. Add nav entries for `assignments`, `workflow`, `finance` to admin/super-admin.
2. All entries map to implemented routes with role-safe access.
3. Existing `system-flags`/`system-logs` remain untouched.

---

### Story 11-03 — Supervisor operational nav parity

**User outcome:** Supervisor can access dedicated assignments and field-team pages from sidebar.

**Acceptance criteria**

1. Add supervisor nav entries for `assignments` and `field-team`.
2. Pages reflect supervisor operation context (queues/team visibility).
3. Existing approvals/reports flows remain functional.

---

### Story 11-04 — Contractor tasks page parity

**User outcome:** Contractor has a dedicated task-focused page from sidebar navigation.

**Acceptance criteria**

1. Add contractor `tasks` nav entry and page route.
2. Task page presents active/pending task queue from TAMM domain data.
3. No Store purchasing features are introduced.

---

### Story 11-05 — Client new project entry parity

**User outcome:** Client has a clear sidebar/pathway to create a new project.

**Acceptance criteria**

1. Add client `new-project` nav entry mapping to TAMM create-project route.
2. New-project flow is available with validation and role-safe access.
3. Existing projects list CTA behavior is consistent with new route.

---

### Story 11-06 — Role page content parity uplift

**User outcome:** Inner pages reflect role-specific operational context similar to Lovable patterns.

**Acceptance criteria**

1. Projects/operations pages include role-specific context blocks (queues, summary cards, next actions).
2. Dashboard cards deep-link to corresponding role operational pages.
3. Empty states always include a clear next action.

---

### Story 11-07 — Navigation dead-link and permission audit

**User outcome:** Navigation is reliable and permission-safe across all six TAMM roles.

**Acceptance criteria**

1. No sidebar entry points to non-existent routes.
2. Route guard and permission behavior is validated for each role.
3. Unauthorized pages route to `403` safely.

---

### Story 11-08 — Epic 11 UX/RTL/i18n regression sweep

**User outcome:** New role nav/page UX ships without localization or RTL regressions.

**Acceptance criteria**

1. All newly added labels/strings exist in `ar` and `en`.
2. RTL and LTR layout checks pass for added pages.
3. No physical direction classes are introduced.

---

## Out of scope

- `store`, `products`, `categories`, `orders`, `purchases`, `buy-materials`
- Any WooCommerce/WordPress behavior

---

## Dependencies

- Backend route availability for new operational pages; mock where endpoint is unavailable.
- Role permission matrix completeness for newly introduced actions.

---

## Definition of done (epic level)

- Epic 11 stories tracked in `sprint-status.yaml`.
- All role sidebar destinations resolve to valid pages.
- UX parity objectives delivered for TAMM-relevant sections only.

