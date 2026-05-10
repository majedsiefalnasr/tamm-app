---
stepsCompleted: ['UX-consolidated']
document_type: ux-design-specification
product: TAMM
date: 2026-05-10
authors:
  - US Egypt Frontend team
related_documents:
  - docs/design-spec.md
  - _bmad-output/planning-artifacts/prd.md
status: draft
---

# UX Design Specification — TAMM (Post-MVP Wave)

## 1. Purpose

Complements **`docs/design-spec.md`** (visual tokens & layout) with **interaction patterns**, **information architecture emphasis**, and **shadcn-vue component mapping** for **Epic 10**.

---

## 2. Design Principles

1. **Evidence before funds** — never imply money can move without surfacing prerequisites.  
2. **One primary action per view** — secondary actions defer to menus or sheets.  
3. **Explain blockers in human language** — tie to role + next step.  
4. **RTL is native** — mirror icons, maintain predictable tab order.  
5. **Progressive disclosure** — advanced controls appear on intent (filters sheet, command palette).

---

## 3. Core Journeys (CONDENSED)

### Client — Approve milestone payment

1. Dashboard alert row highlights awaiting milestones.  
2. Milestone detail shows **trust timeline** + evidence list.  
3. Primary CTA: approve / reject (destructive confirm).  
4. Toast acknowledges outcome; dashboard refreshes optimistic state then reconciles.

### Contractor — Understand payout delay

1. Dashboard shows blocked milestone with **stage pill**.  
2. Drill-down timeline identifies pending supervisor vs client vs admin action.

### Supervisor — Review report

1. Pending reviews module pins counts.  
2. Review surface emphasizes attachments + checklist; rejection requires reason.

### Field engineer — Submit report

1. Minimal steps on mobile-width layout; sticky submit with loading guard.

### Admin — Operator overview

1. Dense tables + optional column presets; bulk-safe dialogs.

---

## 4. Component Mapping (shadcn-vue)

| UX capability | Components (local imports) | Notes |
|---------------|---------------------------|-------|
| Global navigation | `Sidebar`, `NavigationMenu`, `Sheet` | Mobile nav in sheet/drawer pattern |
| Quick jump | `Command`, `Dialog` | Palette triggered from topbar + shortcut |
| Confirm destructive | `AlertDialog` | Payment release, irreversible admin ops |
| Async feedback | `Sonner` | Mutation success/failure standard verbs |
| Loading | `Skeleton`, `Spinner` | Prefer skeleton for route-level |
| Status | `Badge` | Tie colors to semantic tokens in design-spec |
| Data-heavy lists | Table primitives / Data Table | Column presets story |
| Empty states | `Empty` | Illustrate next action |
| Supplementary detail | `HoverCard`, `Tooltip` | Truncated IDs, helper explanations |
| Filters | `Drawer` / `Sheet`, `DropdownMenu` | Avoid clutter on narrow widths |
| Charts | `Chart` | Only when metric definitions stable |
| Settings/help | `Accordion`, `Kbd` | Shortcut transparency |
| Forms | `Field`, `Input`, `Select`, switches | Already normalized Epic 09 |

---

## 5. Milestone Detail — Trust Timeline Spec

**Structure (vertical):**

1. Header: title, amount, composite status pill.  
2. **Timeline**: nodes for report submitted → supervisor decision → client decision → payment milestone (if applicable). Each node shows actor + timestamp + link to evidence.  
3. Sidebar/stack: attachments summary, participants.

**States:**

- Pending: muted node with dashed connector.  
- Completed: solid connector + `Badge` success semantic.  
- Rejected: destructive semantic + expandable reason.

---

## 6. Command Palette Behavior

**Invocation:** Primary shortcut documented in help (implementation chooses actual binding per OS).

**Contents:**

- Navigation targets filtered by permission.  
- Context actions (e.g., “Go to pending reviews”) if feasible without deep coupling.

**Empty query:** Show recents + role shortcuts.

---

## 7. RTL & Accessibility Checklist (Epic 10)

- Palette aligns to visual start edge; arrow icons mirror.  
- Focus order follows DOM order after mirroring.  
- Charts: readable labels localized; color + pattern redundancy for status.

---

## 8. Open Questions

- Which KPI time-series are API-backed vs client-derived?  
- Should contractor ETA copy be heuristic-only until modeled backend SLA exists?

---

## 9. Traceability

- Requirements: `prd.md` §5 Epic 10.  
- Visual tokens: `docs/design-spec.md`.
