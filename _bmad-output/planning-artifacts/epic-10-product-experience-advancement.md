# Epic 10 — Product Experience Advancement

> **Goal:** Translate market + domain insights and consolidated PRD/UX specs into shippable increments that deepen **trust**, **clarity**, and **operator speed** — without regressing RTL or Epic 09 normalization.
>
> **Inputs:**  
> - `_bmad-output/planning-artifacts/prd.md` (§5 Epic 10)  
> - `_bmad-output/planning-artifacts/ux-design-specification.md`  
> - Research: `planning-artifacts/research/market-*` & `domain-*` (2026-05-10)  
> - Visual tokens: `docs/design-spec.md`

---

## Design guardrails

- **i18n only** for user-visible strings (`ar` default, `en` secondary).  
- **Logical CSS** properties everywhere.  
- **Permissions:** `usePermission().can()` — no template role string checks.  
- **Status transitions:** `canTransition()` before mutations.  
- **Components:** import from `~/components/ui/*` (shadcn-vue local copy).

---

## Story backlog

### Story 10-01 — Global command palette (navigation & discovery)

**User outcome:** Any logged-in user can open a command surface and jump to allowed destinations/actions faster than sidebar drilling alone.

**Acceptance criteria**

1. Palette opens from topbar control and keyboard shortcut (document shortcut in help/settings).  
2. Results filter by query; unauthorized routes never appear.  
3. RTL layout mirrors correctly; focus trapped while open; Esc closes.  
4. Strings fully localized.

**Primary components:** `Command`, `Dialog`, optional `Kbd`.

---

### Story 10-02 — Milestone trust timeline

**User outcome:** Milestone detail explains **how** the milestone reached its current state and **who** acted.

**Acceptance criteria**

1. Vertical timeline lists domain-significant events (submission, supervisor decision, client decision, payment-related transitions where applicable).  
2. Each event shows actor (or system), timestamp, and links/navigation to evidence details where they exist.  
3. Rejection displays stored reason without leaking internal-only notes.  
4. Loading uses `Skeleton`; empty timeline impossible if milestone exists (minimum: created event).

**Primary components:** `Card`, `Badge`, `Separator`, `HoverCard` or `Tooltip`.

---

### Story 10-03 — Role dashboard charts (selective KPI visualization)

**User outcome:** Dashboards gain **at most one** primary chart per role surface where data definitions exist; otherwise graceful empty states.

**Acceptance criteria**

1. Chart appears only when backing series is defined in composable/store contract (no fabricated metrics).  
2. Empty state uses `Empty` with actionable guidance.  
3. Dark mode and RTL readable (tick density sane).  
4. Loading uses `Skeleton` placeholders matching chart footprint.

**Primary components:** `Chart`, `Card`, `Empty`, `Skeleton`.

---

### Story 10-04 — Admin list density & column presets

**User outcome:** High-volume admin tables become scannable with optional column presets persisted locally.

**Acceptance criteria**

1. At least one admin list page gains preset toggle (e.g. default vs compact vs minimal columns).  
2. Preference persists per browser (localStorage) until server prefs exist.  
3. Mobile uses `Sheet` for column/filter controls without horizontal trap.

**Primary components:** Table/Data Table patterns, `DropdownMenu`, `Sheet`, `Switch` (optional).

---

### Story 10-05 — Mutation feedback normalization audit

**User outcome:** Success/error patterns feel consistent after async operations across audited flows.

**Acceptance criteria**

1. Documented list of audited mutations (payments, approvals, admin destructive actions).  
2. Destructive confirmations use `AlertDialog`.  
3. Non-blocking outcomes use `Sonner` with consistent verbs tied to i18n keys.  
4. No duplicate toast storms from optimistic + refetch (explicit dedupe strategy).

**Primary components:** `Sonner`, `AlertDialog`, `Spinner`.

---

### Story 10-06 — Contextual helpers on complex milestone/payment fields

**User outcome:** Users encountering unfamiliar financial/status fields get inline explanation without leaving the page.

**Acceptance criteria**

1. Minimum coverage: payment-related forms + ambiguous milestone states.  
2. No `v-html`; helpers stored as i18n strings or structured text components.

**Primary components:** `HoverCard`, optional `Accordion`.

---

### Story 10-07 — Shortcut transparency panel

**User outcome:** Users discover keyboard affordances from within the app.

**Acceptance criteria**

1. Settings or help surface lists shortcuts with `Kbd` styling.  
2. Mirrors RTL; strings localized.

**Primary components:** `Kbd`, `Card`, `Dialog` or dedicated page section.

---

### Story 10-08 — Epic 10 RTL & regression sweep

**User outcome:** Ship Epic 10 without RTL/a11y regressions.

**Acceptance criteria**

1. Follow/adapt checklist lineage from `ux-brief-epic-09-shadcn-alignment.md`.  
2. Produce short markdown log under `implementation-artifacts/10-08-*` documenting waived items.

---

## Dependencies

- Backend aggregates for charts (**Story 10-03**) — confirm against `docs/api-contracts.md` before implementing real series; otherwise stub + TODO mock per project rules.

---

## Definition of done (epic level)

- All stories reach `done` in `sprint-status.yaml`.  
- PRD traceability preserved (FR-10.x satisfied or explicitly deferred with rationale in story).
