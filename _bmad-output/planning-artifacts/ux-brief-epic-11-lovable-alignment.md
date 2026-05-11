# UX Brief — Epic 11 Lovable Alignment (TAMM Scope)

## Purpose

Define exactly how TAMM should inherit Lovable UX patterns for role navigation and inner-page content while preventing domain drift into Store features.

---

## UX Objective

Deliver role experiences where users can:

1. instantly understand where to go from sidebar navigation,
2. land on operationally useful pages (not placeholders/dead links),
3. move from dashboard insight to page action in one click.

---

## Inheritance Model

## Adopt directly

- Role-specific nav taxonomy for TAMM-relevant operations.
- Operational sections: assignments, field-team, tasks, finance/workflow style pages.
- Dashboard-to-inner-page continuity patterns (quick-link and queue-first content).

## Adapt

- Page structures/cards/queues from Lovable into TAMM component/composable architecture.
- Copy and interaction patterns into TAMM i18n and permission model.

## Exclude

- Store/e-commerce features:
  - products
  - categories
  - orders
  - purchases
  - buy-materials

---

## Role-by-Role IA Target

## Admin / Super Admin

- Keep current TAMM base sections.
- Add operational sections:
  - assignments
  - workflow
  - finance
- Preserve super-admin system sections.

## Client

- Add explicit `new-project` entry and route.
- Keep projects/reports/payments/messages/settings.

## Contractor

- Add `tasks` section and route.
- Keep withdrawals flow.
- Do not add materials buying/store behaviors.

## Supervisor Engineer

- Add dedicated `assignments` and `field-team` pages.
- Keep approvals/reports/projects/messages/settings.

## Field Engineer

- Keep current nav model.
- Improve page hierarchy clarity and empty-state action guidance.

---

## Page Content Pattern (for all new/updated pages)

1. **Header:** role-relevant title + one-sentence operational subtitle.
2. **Action strip:** primary CTA and optional secondary actions.
3. **Status cards:** compact counters for immediate triage.
4. **Main list/queue:** actionable rows/cards ordered by urgency.
5. **Fallback states:** loading, empty, error each with clear next action.

---

## UX Acceptance Checklist

- Every sidebar item resolves to a route page.
- Every page has one clear primary action.
- Every page has empty/error/loading states.
- Dashboard links route to concrete inner pages.
- All strings are i18n; no hardcoded copy.
- RTL/LTR both verified for new screens.

---

## Risks

- New nav entries without implemented routes create repeated dead-link regressions.
- Route overlap (`/assignments`) across roles can cause ambiguity.
- Over-inheriting from Lovable risks scope creep into excluded Store domain.

---

## Mitigations

- Implement route and nav in same story.
- Prefer role-aware route container or explicit route namespaces when needed.
- Enforce explicit out-of-scope review in each story acceptance.

