# Story 10.2: Milestone trust timeline

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created. -->

## Story

As a **project participant** (client, contractor, engineer, or admin),

I want **a chronological trust timeline on milestone detail** that explains **how** the milestone reached its current state and **who** acted,

So that **I can verify submissions, approvals, rejections (with reasons), and payment-related steps** without guessing from status badges alone.

## Acceptance Criteria

1. **Vertical timeline — domain narrative:** Ordered chronologically (oldest → newest), the timeline surfaces domain-significant events at minimum:
   - Milestone created  
   - Report submitted (when evidence exists)  
   - Supervisor decision (approval path vs rejection when captured)  
   - Client final approval when milestone reached `approved`  
   - Payment-adjacent steps **when applicable**: client payment recorded (`payment_status` progressed toward/at `paid`), contractor payout completed (`paid_out_at` / `payment_status: paid_out`), aligned with existing payment derivation rules in `~/utils/statusMachine.ts`.

2. **Actor + timestamp + evidence navigation:** Each row shows **localized title**, **timestamp**, and **actor** where known (`submitted_by`, `supervisor`, client label from project context, or a neutral **system** label via i18n). When a submitted report exists for “submission” events, provide an inline control that jumps to the evidence section on the same page (hash link `#milestone-report-evidence`), without inventing routes.

3. **Rejection reason (user-facing only):** When a milestone carries a persisted **`rejection_reason`** (supervisor or client rejection flows), the timeline shows that **exact string**—never placeholder label text. Do **not** render unknown/internal audit fields; only this explicit user-visible reason field.

4. **Loading & empty behavior:** While milestone/project data is refreshing, the timeline card shows **`Skeleton`** placeholders (not a blank card). If a milestone record exists, the timeline is **never empty** — at minimum the **created** event is always emitted.

5. **RTL & stack compliance:** Milestone-owned layout uses **logical** Tailwind utilities; all new copy via **`ar` / `en` locale files** under `i18n/locales/`.

6. **No duplicate narrative:** Replace the heuristic-only `ApprovalTimeline` logic with a **single builder** (pure function) so ordering and labels stay consistent; extend rather than fork permission/payment rules.

### BDD-style scenarios

```gherkin
Given a milestone with created_at
When the trust timeline renders
Then at least one "created" event exists ordered by time

Given latest_report.submitted_at and submitted_by exist
When the trust timeline renders
Then a report submission event appears with actor and a link to #milestone-report-evidence

Given rejection_reason is set on the milestone
When status is not rejected (workflow bounced to in_progress)
Then the timeline still lists the rejection event with the stored reason text

Given payment_status transitioned to paid_out with paid_out_at
When the viewer has permission context consistent with payment visibility elsewhere
Then a payout-completed style event appears after payment prerequisites in the ordered list
```

## Tasks / Subtasks

- [x] **Data model —** Extend `Milestone` in `~/shared/types/project.ts` with optional narrative fields the UI controls:
  - `rejection_reason?: string | null`
  - `last_rejection_role?: 'supervisor_engineer' | 'client'` (for localized labels only — never render internal notes)
  - `last_rejection_at?: string`
  - `client_approved_at?: string`
  - `payment_confirmed_at?: string` (set when client payment succeeds in composable mock path)

- [x] **Composable alignment —** Update `~/app/composables/useMilestones.ts`:
  - On **reject**: persist `rejection_reason`, `last_rejection_at`, `last_rejection_role`; keep status machine bounce to `in_progress`.
  - On **approve** (`supervisor_engineer` | `client`): set `supervisor_approved_at` (existing) / `client_approved_at` appropriately.
  - On **submitReport**: clear prior `rejection_reason` / `last_rejection_*` when starting a fresh submission cycle (prevents stale reasons dominating trust UX).
  - On **payForMilestone** success path: stamp `payment_confirmed_at`.
  - On **releaseMilestonePayment**: set `paid_out_at` (already on display fields) consistently.

- [x] **Pure builder —** Add `~/app/utils/milestoneTrustTimeline.ts`:
  - Export typed **trust events** with sort keys, stable `id`, `kind`, ISO timestamp, optional actor, optional `rejection_reason`, optional `evidenceAnchor`.
  - Import **`derivePaymentStatus`** only where payment milestone events need milestone-status context (reuse existing derivation — no parallel payment rules).

- [x] **UI —** Refactor `~/app/components/milestone/ApprovalTimeline.vue`:
  - Consume builder output; compose **`Card`** styling (keep outer surface), **`Badge`** per event kind, **`Separator`** between rows (from `~/components/ui/*`).
  - Optional: **`Tooltip`** / **`HoverCard`** for long rejection copy if truncation is needed — prefer Tooltip for simplicity.
  - Implement **`Skeleton`** state via prop (e.g. `pending`) with fixed rows.

- [x] **Page wiring —** `~/app/pages/projects/[id]/milestones/[mid].vue`:
  - `await loadMilestones(projectId)` alongside project fetch so **`useMilestones`** map participates.
  - **`mergedMilestone`** computed: merge project-detail milestone with `getMilestones(projectId)` entry by `id` (overlay wins on overlapping keys).
  - Pass **`project`** (client name), **`reports`** array (start from `[latest_report]` filter truthy — preserve existing limitation; document TODO if multi-report API arrives).
  - Add **`id="milestone-report-evidence"`** anchor on the primary report panel wrapper.

- [x] **Tests —** Unit-test `buildMilestoneTrustTimeline` (ordering, minimum created event, rejection_reason surfaced, payment events gated correctly). Run **`pnpm exec vitest run`** + RTL guard file unchanged scope.

- [x] **Manual RTL —** Arabic: verify connector alignment uses logical spacing (`ms-*`, `border-s-*`, `text-start`).

## Dev Notes

### Developer context (guardrails)

| Topic | Instruction |
|-------|-------------|
| Permissions | Payment visibility follows existing patterns (`PaymentStatusTag` / `view_payment_status`). Timeline must not leak payout detail copy to roles blocked elsewhere — mirror composable data only; do not add parallel role string checks in template. |
| Status machine | Always **`canTransition()`** before mutating status in composables (already enforced — preserve). |
| No new packages | Use existing shadcn-vue local primitives & `@heroicons/vue`. |
| API gap | No milestone audit endpoint in `docs/api-contracts.md` — derive narrative from milestone surface fields + reports until backend ships history. |

### Files to touch (expected)

| Action | Path |
|--------|------|
| UPDATE | `shared/types/project.ts` |
| UPDATE | `app/composables/useMilestones.ts` |
| NEW | `app/utils/milestoneTrustTimeline.ts` |
| UPDATE | `app/components/milestone/ApprovalTimeline.vue` |
| UPDATE | `app/pages/projects/[id]/milestones/[mid].vue` |
| UPDATE | `i18n/locales/en.json`, `i18n/locales/ar.json` |
| NEW | `tests/unit/milestone-trust-timeline.spec.ts` (or equivalent) |

### Current code intelligence

- **`ApprovalTimeline`** now consumes **`buildMilestoneTrustTimeline`** and shows persisted **`rejection_reason`** only (no placeholder label as body).
- Detail page currently pulls **`useProjects().getProjectById`** only; interactive flows mutate **`useMilestones`** map — merge required for trustworthy narrative.

### Architecture / traceability

- **FR-10.2** — `_bmad-output/planning-artifacts/prd.md` §5  
- **Epic 10 / Story 10-02** — `_bmad-output/planning-artifacts/epic-10-product-experience-advancement.md`  
- **UX journey** — `_bmad-output/planning-artifacts/ux-design-specification.md` §3 (trust timeline + drill-down)

### Previous story intelligence (10-01)

- Prefer **`provide`/inject composables** only when necessary; here keep props explicit from page.  
- RTL Tailwind guard:** `tests/unit/rtl/tamm-no-physical-tailwind.spec.ts`** — avoid physical directional classes in TAMM-owned Vue.  
- **`project-context.md`** — not present; follow **`AGENTS.md`** / **`docs/design-spec.md`**.

### Testing commands

- `pnpm lint`
- `pnpm exec vitest run`

### Open questions (non-blocking)

- Future **`GET /milestones/:id/activity`** — replace builder inputs with API-fed events when contract lands.

## Dev Agent Record

### Agent Model Used

GPT-5.2 (Cursor agent)

### Debug Log References

- Sprint: `10-02-milestone-trust-timeline` advanced **`ready-for-dev` → `done`** after implementation + review.

### Completion Notes List

- **`buildMilestoneTrustTimeline`** centralizes ordering; **`ApprovalTimeline`** adds Badge/Separator/Skeleton, payment rows gated by **`can('view_payment_status')`**.
- Milestone detail **`useAsyncData`** now **`loadMilestones`** then merges **`useMilestones`** overlay so reject/report/payment mutations surface on the narrative.
- **`useMilestones`** persists **`rejection_*`**, approval timestamps, **`payment_confirmed_at`**, **`paid_out_at`**; clears rejection fields on successful **`submitReport`**.
- Report submissions deduped by **`report.id`** in the builder.

### File List

- `shared/types/project.ts`
- `app/utils/milestoneTrustTimeline.ts`
- `app/composables/useMilestones.ts`
- `app/composables/useProjects.ts`
- `app/components/milestone/ApprovalTimeline.vue`
- `app/pages/projects/[id]/milestones/[mid].vue`
- `i18n/locales/en.json`
- `i18n/locales/ar.json`
- `tests/unit/milestone-trust-timeline.spec.ts`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/10-02-milestone-trust-timeline.md`

## Change Log

- **2026-05-11:** Implemented milestone trust timeline (builder + UI), milestone/composable narrative fields, detail page merge + evidence anchor, i18n + unit tests; lint + full Vitest green.

---

## Code review (adversarial triage)

### Blind Hunter

- [x] Duplicate report rows — mitigated by deduping **`report.id`** in **`buildMilestoneTrustTimeline`**.

### Edge Case Hunter

- [x] Payment leakage — payout/payment rows render only when **`canViewPayment`** is true.

### Acceptance Auditor

- [x] Rejection body — only **`rejection_reason`** string is shown in the destructive callout (no i18n placeholder as surrogate content).

**Story completion:** `done` — review patches applied in-tree.

