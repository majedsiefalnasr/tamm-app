# Design Thinking Session: TAMM

**Date:** 2026-05-10  
**Facilitator:** US Egypt Frontend team  
**Design Challenge:** Deepen trust, clarity, and speed across Arabic-first construction collaboration after core MVP delivery (Epics 01–09).

---

## Design Challenge

Post-MVP differentiation for TAMM: users already have baseline dashboards, milestones, proposals, and notifications. The next leap is **confidence** — every role should instantly see **what blocks money or progress**, **why**, and **what to do next**, without ERP-level complexity.

---

## EMPATHIZE: Understanding Users

### User Insights

- **Clients** anchor on capital protection and clarity of acceptance criteria; they fear paying for incomplete or disputed work.
- **Contractors** anchor on predictable liquidity; delays feel personal even when causes are structural (missing report, supervisor queue).
- **Supervisors** fear reputational liability — they need defensible approvals and readable evidence trails.
- **Field engineers** optimize for speed under physical site constraints; friction drops compliance.
- **Admins** manage exceptions at scale; they need dense tables, safe confirmations, and bulk insight.

### Key Observations

- Market entrants emphasizing escrow/milestones win on **transparency** and **dispute ergonomics**, not on feature count.
- Middle East digitization narratives stress **trust in recommendations** and **adoption friction** — UX must bias toward explainability.
- RTL-first execution is a **differentiator** versus imported AEC suites where Arabic is often secondary.

### Empathy Map Summary

| Role | Says | Thinks | Does | Feels |
|------|------|--------|------|-------|
| Client | “I'm not releasing funds blindly.” | “Is this really done?” | Pays, approves, disputes | Anxious, cautious |
| Contractor | “Where is my payment stuck?” | “Who do I nudge?” | Submits proof, follows up | Frustrated when opaque |
| Supervisor | “I won’t sign weak evidence.” | “Can I justify this?” | Reviews, rejects with cause | Pressure |
| Field engineer | “Let me upload and go.” | “Forms waste my day.” | Mobile uploads | Rushed |
| Admin | “Show me outliers.” | “Bulk fixes?” | Filters, reassigns | Overloaded |

---

## DEFINE: Frame the Problem

### Point of View Statement

**A construction client funding milestones through TAMM** needs **a transparent, role-aware approval chain with evidence at every gate** because **trust breaks when money moves faster than clarity**.

### How Might We Questions

1. HMW make **blockers** visible within **one glance** on each role’s home surface?  
2. HMW pair **financial actions** with **human-readable Preconditions** (reports, approvals)?  
3. HMW give **power users** speed (shortcuts, palettes) without harming **novice** simplicity?  
4. HMW localize **every critical verb** so Arabic UX feels native, not mirrored English?

### Key Insights

- The problem is less “missing features” and more **narrative cohesion** across milestones, payments, and people.  
- **Evidence + actor + time** is the atomic triangle of trust.

---

## IDEATE: Generate Solutions

### Selected Methods

- **How Might We expansion** (structured divergence).  
- **Competitive pattern harvest** (escrow-first products + AEC suites).  
- **Role-based storyboarding** (five primary dashboards).

### Generated Ideas (condensed)

Surface blocker ribbons; timeline of approvals; “why can’t I pay” explainer modals; consolidated digest notifications; command palette for jump-nav; saved table views for admin; chart overlays on KPI cards; contextual shortcuts cheatsheet; progressive disclosure on milestone detail; client-facing simplified approval drawer; contractor payout ETA heuristic copy (API-backed later).

### Top Concepts

1. **Trust Timeline** on milestone detail — merges status transitions + attachments + payer gates.  
2. **Command Menu** for cross-role navigation and actions discovery.  
3. **Operational dashboards 2.0** — charts only where they answer “am I improving week over week?”.

---

## PROTOTYPE: Make Ideas Tangible

### Prototype Approach

Low-fi: annotated flows on existing `design-spec.md` patterns + shadcn component mapping (see `ux-design-specification.md`). Hi-fi deferred to story implementation.

### Prototype Description

- Milestone detail: vertical **timeline** using existing cards + subtle separators; rejection expands inline reason.  
- Global **Command** palette from topbar; mobile opens `Sheet`.  
- Dashboards: `Chart` embedded only on stats that already exist in data layer.

### Key Features to Test

- Time-to-understand “blocked by”.  
- Arabic RTL scanning order on timeline.  
- Error recovery after failed payment action.

---

## TEST: Validate with Users

### Testing Plan

- Five moderated sessions (one champion user per role), tasks: approve milestone, reject report, release payment (staging), find blocked item.  
- Capture **SUS** optional + qualitative friction tags.

### User Feedback

_Placeholder — run sessions after Epic 10 prototypes ship._

### Key Learnings

_Pending empirical validation._

---

## Next Steps

### Refinements Needed

- Replace placeholder test section with real outcomes.  
- Validate payment copy with legal/compliance stakeholders per market.

### Action Items

1. Lock PRD requirements for Epic 10 (`prd.md`).  
2. Expand UX spec component mapping (`ux-design-specification.md`).  
3. Implement stories in priority order (`epic-10-product-experience-advancement.md`).

### Success Metrics

- Reduced support-like contacts (proxy: fewer ambiguous statuses reported).  
- Faster median time from supervisor approval to client action (product analytics).  
- Accessibility + RTL regression suites remain green.

---

_Generated using BMAD Creative Intelligence Suite — Design Thinking Workflow (consolidated non-interactive run)._  
