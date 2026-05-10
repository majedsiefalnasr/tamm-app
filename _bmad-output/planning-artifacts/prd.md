---
stepsCompleted: ['MR', 'DR', 'DT', 'PRD-consolidated']
document_type: prd
product: TAMM
version: 1.1-post-mvp-wave
date: 2026-05-10
authors:
  - US Egypt Frontend team
input_documents:
  - _bmad-output/planning-artifacts/research/market-tamm-construction-collaboration-platform-research-2026-05-10.md
  - _bmad-output/planning-artifacts/research/domain-construction-milestone-escrow-multi-party-research-2026-05-10.md
  - _bmad-output/design-thinking-2026-05-10.md
  - docs/design-spec.md
  - AGENTS.md
status: draft-for-governance
---

# Product Requirements Document — TAMM (Construction Management Core)

## 1. Executive Summary

**TAMM** is a **construction project management** web application for owners, contractors, engineers, and administrators. It coordinates **projects**, **milestones**, **field reports**, **multi-stage approvals**, **proposals/bidding**, **payments**, and **in-app notifications**. The **default UX locale is Arabic (RTL)**; English is secondary.

This PRD **retro-documents** the delivered MVP surface (Epics 01–09) and defines **Epic 10 — Product Experience Advancement**: market-informed UX depth using established **shadcn-vue** primitives.

---

## 2. Goals & Non-goals

### Goals

1. **Trustworthy money-motion UX** — users always understand prerequisites to pay or release.  
2. **Role-efficient operations** — each dashboard answers “what must I do now?”  
3. **RTL-native polish** — no mirrored-afterthought layouts.  
4. **Composable UI system** — prefer local `~/components/ui/*` patterns over bespoke one-offs.

### Non-goals

- WordPress store / solar calculator (explicitly out of scope per `AGENTS.md`).  
- Replacing full enterprise AEC document control (submittals/drawing control parity with Procore/ACC).  
- Guaranteeing regulatory characterization of funds handling without legal review.

---

## 3. Users & Permissions

Six roles: `super_admin`, `admin`, `client`, `contractor`, `field_engineer`, `supervisor_engineer`.

**Requirement:** Capability checks use **`usePermission().can()`**, not hardcoded role strings in templates.

---

## 4. Functional Requirements (Core — Maintained)

### 4.1 Authentication & session

- Secure login, session persistence, auto logout on 401, role-based landing.

### 4.2 Projects

- List/create/detail; milestone definitions; admin project controls per contracts.

### 4.3 Milestones, reports, approvals

- Field submission → supervisor review → client final approval; invalid transitions blocked (`canTransition`).

### 4.4 Payments & escrow semantics

- Client payment flows, badges, admin release, histories, withdrawals — tied to milestone truth.

### 4.5 Notifications

- Bell, drawer, read state, content per event type.

### 4.6 Admin

- Users, assignments, project oversight dashboards.

### 4.7 Proposals & contractor selection

- Bidding lifecycle through assignment of engineers post-selection.

### 4.8 Dashboards

- Role dashboards aggregating actions from upstream domains.

### 4.9 Design system alignment

- shadcn-vue components, overlays, forms, lists — completed under Epic 09.

---

## 5. Epic 10 — Product Experience Advancement (New)

### Theme

Make **progress + payment blockers** impossible to misunderstand while giving **power users** faster paths.

### FR-10.1 Global command palette

- **Requirement:** Keyboard-invoked command surface listing navigable routes and high-value actions discoverable per permission.
- **Components:** `Command`, `Dialog` or `Popover`, optional `Kbd` hints.

### FR-10.2 Trust-oriented milestone timeline

- **Requirement:** Milestone detail presents **chronological narrative** (status changes, submissions, approvals, attachments references).
- **Components:** `Card`, `Separator`, `Badge`, `Tooltip` / `HoverCard`.

### FR-10.3 Dashboard analytics selective charts

- **Requirement:** Add charts only for KPIs with stable definitions; empty states explain missing data.
- **Components:** `Chart`, `Card`, `Empty`, `Skeleton`.

### FR-10.4 Admin data surfaces upgrades

- **Requirement:** Column visibility / density presets for large lists (stored client-side minimum).
- **Components:** `DataTable` patterns, `DropdownMenu`, `Sheet` for filters on mobile.

### FR-10.5 Unified async feedback

- **Requirement:** Mutations surface consistent toast semantics for success/failure; destructive flows confirm via `AlertDialog`.
- **Components:** `Sonner`, `AlertDialog`, `Spinner`.

### FR-10.6 Contextual education layer

- **Requirement:** Complex fields expose inline helper patterns without `v-html`.
- **Components:** `HoverCard`, `Accordion` (optional).

### FR-10.7 Shortcut transparency

- **Requirement:** Document shortcuts in Settings/help; show `Kbd` glyphs consistent with OS conventions where feasible.

---

## 6. Non-functional Requirements

| Area | Requirement |
|------|-------------|
| i18n | No hardcoded user-visible strings |
| RTL | Logical CSS properties only (`ms-*`, `ps-*`, `start-*`, etc.) |
| Accessibility | Focus traps in dialogs; labels tied to inputs |
| Performance | Skeletons on route transitions; avoid blocking mega-imports |
| Security | No `v-html`; API via composables |

---

## 7. Dependencies & Risks

- **API availability** per `docs/api-contracts.md` — chart KPIs may need backend aggregates.  
- **Legal** copy on payments must be reviewed before marketing claims.  
- **Scope creep** — Epic 10 must not reopen Epic 09 normalization except for regressions.

---

## 8. Release & Validation

1. Epic/story acceptance tests per story file.  
2. RTL regression checklist (`ux-brief-epic-09-shadcn-alignment.md` lineage).  
3. Optional `bmad-check-implementation-readiness` after architecture touchpoints if backend contracts shift.

---

## 9. Traceability

| Research | Artifact |
|----------|----------|
| Market | `planning-artifacts/research/market-tamm-construction-collaboration-platform-research-2026-05-10.md` |
| Domain | `planning-artifacts/research/domain-construction-milestone-escrow-multi-party-research-2026-05-10.md` |
| Design thinking | `_bmad-output/design-thinking-2026-05-10.md` |

---

_End of PRD v1.1 draft — Epic 10 reflects forward requirements; Epics 01–09 treated as delivered baseline._
