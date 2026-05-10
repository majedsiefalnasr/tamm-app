---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments: []
workflowType: research
lastStep: 6
research_type: domain
research_topic: Construction milestone delivery, escrow-style fund control, and multi-party approvals in owner–contractor–engineer workflows
research_goals: Align TAMM terminology, trust mechanisms, and UX guardrails with industry practice and specialized payment platforms.
user_name: US Egypt Frontend team
date: 2026-05-10
web_research_enabled: true
source_verification: true
scope_confirmed: true
---

# Research Report: domain

**Date:** 2026-05-10  
**Author:** US Egypt Frontend team  
**Research Type:** domain  

---

## Research Overview

Domain research connects **construction delivery mechanics** (milestones, inspections, reports) with **payment psychology** (escrow, staged release, disputes). TAMM models milestones through an explicit **status machine** (`utils/statusMachine.ts`) — this document grounds why those states matter economically and socially.

---

## Research Initialization

### Confirmed domain focus

| Area | Depth |
|------|--------|
| Milestone-based progress billing | High |
| Escrow / held funds patterns | High |
| Multi-tier approval (technical vs commercial) | High |
| Legal specifics per country | Low — require counsel for production claims |

---

## Domain Concepts & Vocabulary

### Milestones vs generic tasks

- **Milestone**: Binary or staged gate tied to **measurable scope** and often **invoice/payment trigger**.
- **Practical expectation**: Owners expect **documentation** (photos, reports, BOQ references) before funds move.

### Escrow pattern (conceptual)

Industry-facing products emphasize:

- **Prefunding** into a controlled account.
- **Objective release criteria** (approval + evidence).
- **Dispute channel** before forced release.

Illustrative ecosystem players documented on the open web (Renno, EZescrow, MidPay, Build Safe Escrow) converge on: **milestones + proof + mutual visibility**.

**TAMM mapping:** Treat UI language consistently — “held”, “released”, “pending approval” must match API contract terms in `docs/api-contracts.md` when integrated.

### Roles as control points

Typical real-world sequence:

1. **Execution** (contractor + field engineer evidence).  
2. **Technical QA** (supervisor).  
3. **Commercial acceptance** (client).  
4. **Operator oversight** (admin / platform policy).

TAMM encodes this split — domain implication: **never collapse supervisor and client approval into one opaque “approved” without explaining whose criteria were met**.

---

## Failure Modes (domain-rooted UX risks)

| Failure mode | User impact | UX mitigation |
|--------------|-------------|----------------|
| Funds released without agreed evidence | Legal conflict, churn | Strong confirmation patterns (`AlertDialog`), immutable activity timeline |
| Stuck “under review” | Contractor cash-flow freeze | Dashboard “blocked by” + aging cues |
| Opaque rejection | Rework loops | Structured rejection reasons in milestone/report flows |
| Role misunderstanding | Wrong approver | Clear badges, permission-driven CTAs via `usePermission().can()` |

---

## Regulatory & Operational Caveats

- Products advertised as “regulated” or “FDIC-insured” operate under **specific jurisdictions** — TAMM frontend must **not claim regulatory status** unless backend/legal confirms exact wording.
- Blockchain-enabled escrow products (e.g. EZescrow positioning) highlight **lien waivers** and **subcontractor waterfalls** — if TAMM expands into subcontractors, domain complexity jumps materially.

---

## Recommendations for Product Language & UX

1. Standardize glossary keys in i18n for: milestone states, payment states, escrow-adjacent verbs.  
2. Prefer **evidence → approval → payment** mental model in page hierarchy.  
3. Surface **auditability**: timestamps, actor, reason — aligns with domain expectations from escrow-first competitors.

---

## Sources

- Public positioning pages for milestone/escrow platforms (Renno, EZescrow, MidPay, Build Safe Escrow) — **pattern-level**, not contractual guarantees.
- Internal sources of truth: `docs/status-flows.md`, `utils/statusMachine.ts`, `AGENTS.md` role definitions.

---

## Status

**Complete** — ready for **PRD** non-functional trust requirements and **UX specification** content strategy.
