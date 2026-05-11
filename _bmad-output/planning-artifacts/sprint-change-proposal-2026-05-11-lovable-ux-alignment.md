# Sprint Change Proposal — Lovable UX Alignment Wave (2026-05-11)

## 1) Issue Summary

### Trigger

The team requested a direct comparison between TAMM and `lovable-design` to upgrade role dashboards, sidebar navigation, and inner-page UX while keeping TAMM domain boundaries.

### What changed

The comparison surfaced a scope mismatch between:

- TAMM current role navigation/content, and
- Lovable’s richer role-based operational sections.

It also surfaced a critical execution gap:

- TAMM sidebar includes `messages` for all roles, but TAMM currently has no `/messages` page route.

### Why this matters now

Without course correction, TAMM keeps:

- dead navigation links,
- inconsistent role operations depth,
- and missed UX opportunities already validated in Lovable patterns.

---

## 2) Impact Analysis

### Epic Impact

- Existing Epics 01–10 remain valid and delivered.
- A new implementation wave is needed for role-nav/page parity and UX continuity.
- This is a **new epic addition**, not a rollback.

### Story Impact

- New story set required for:
  - route parity (`messages`, role operations pages),
  - role navigation parity,
  - UX cohesion between dashboard cards and inner pages.

### Artifact Conflicts

- PRD currently defines goals and Epic 10 UX but does not explicitly encode Lovable-based role page parity.
- UX spec has generic interaction principles but not explicit role parity mapping for this alignment wave.

### Technical Impact

- Touches role nav config, route surfaces, role-aware page content modules, i18n keys, and routing guards.
- No store/e-commerce scope should be introduced.

---

## 3) Recommended Approach

### Chosen path: Direct Adjustment (Moderate)

1. Add a dedicated Epic 11 for role navigation + UX parity.
2. Keep TAMM domain boundaries strict (exclude Store sections).
3. Execute UX-focused story sequencing so broken nav and role experience are fixed first.

### Rationale

- Preserves completed work.
- Fixes immediate usability issues (`/messages` dead route).
- Delivers high-value UX parity without domain drift.

### Effort / risk / timeline

- **Effort:** 1 sprint (2 weeks)
- **Risk:** Medium (multi-role route/nav/content touchpoints)
- **Timeline impact:** Low-to-medium, bounded and incremental

---

## 4) Detailed Change Proposals (Old → New)

## A) Backlog Structure

**OLD**
- Sprint status ends at Epic 10.

**NEW**
- Add Epic 11: `Role Navigation & UX Parity (Lovable-Aligned, TAMM-Scoped)`.

**Rationale**
- Makes this scope trackable and executable without contaminating previous epics.

## B) Navigation Coverage

**OLD**
- Some role nav entries from Lovable are absent in TAMM.
- `messages` nav exists but route is missing.

**NEW**
- Add TAMM-relevant nav sections by role:
  - Admin/Super Admin: `assignments`, `workflow`, `finance`
  - Supervisor: `assignments`, `field-team`
  - Contractor: `tasks`
  - Client: `new-project`
- Deliver `/messages` route baseline for all roles.

**Rationale**
- Resolves dead links and improves role-specific workflow depth.

## C) UX Scope Definition

**OLD**
- UX direction exists in high-level form only.

**NEW**
- Add an Epic 11 UX brief that:
  - maps role-by-role page parity targets,
  - defines adopt/adapt/exclude rules from Lovable,
  - codifies information architecture for new pages.

**Rationale**
- Avoids ad-hoc implementation and reduces UX drift between roles.

## D) Out-of-Scope Guardrail

**OLD**
- Lovable includes Store domain mixed with role sections.

**NEW**
- Explicitly exclude Store-related sections in this wave:
  - `store`, `products`, `categories`, `orders`, `purchases`, `buy-materials`.

**Rationale**
- Keeps TAMM aligned to agreed product boundaries.

---

## 5) Implementation Handoff

### Scope Classification

**Moderate** — backlog reorganization + implementation sequencing required.

### Handoff Recipients

- Product Owner/Planning agent: Epic 11 backlog sequencing
- Developer agent: implementation per story order
- UX agent: validate role-page IA and content parity decisions

### Success Criteria

- No dead sidebar links for any TAMM role.
- Every added nav entry maps to a real, permission-safe page.
- Role inner-page UX parity improves without importing Store scope.
- Sprint status updated to include Epic 11 with story tracking.

