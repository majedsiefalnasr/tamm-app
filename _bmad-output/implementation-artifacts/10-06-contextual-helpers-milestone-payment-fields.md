# Story 10.6: Contextual helpers on complex milestone/payment fields

Status: done

## Story

As a **user filling milestone or payment flows**,

I want **inline explanations for unfamiliar financial and status concepts**,

So that **I understand fields and badges without leaving the page or guessing**.

## Acceptance Criteria

1. **Coverage — payment-related forms:** `PaymentConfirmDialog.vue` exposes contextual helpers (HoverCard or equivalent) for **bank name**, **transaction reference**, **receipt upload**, and **notes** (optional helper).
2. **Coverage — milestone definition:** `MilestoneDialog.vue` exposes helpers for **amount** (contract/payout meaning) and **order** (sequence vs execution).
3. **Coverage — ambiguous milestone + payment surface:** Users see a concise explanation of **work status vs derived payment/escrow status** on **`MilestoneCard.vue`** (badge cluster) and **`MilestoneDetail.vue`** (status/payment grid).
4. **Safety:** No `v-html`; all helper copy in **`i18n/locales/en.json`** and **`ar.json`** under **`contextHelpers.*`**.
5. **A11y / RTL:** Helper triggers are **`button type="button"`** with **`aria-label`** (`common.field_help` / **`common.field_help_status_payment`** for status badges); layout uses logical Tailwind; HoverCard content **`text-start`**.

## Tasks / Subtasks

- [x] Add **`FieldContextHint.vue`** under **`app/components/common/`** using **`~/components/ui/hover-card`** + **`InformationCircleIcon`** (`@heroicons/vue/24/outline`).
- [x] Wire helpers into **`PaymentConfirmDialog.vue`** beside **`FieldLabel`** rows (bank, reference, receipt, notes).
- [x] Wire helpers into **`MilestoneDialog.vue`** **`FormItem`** rows for **amount** and **order** (label row: label + hint).
- [x] Add **combined status/payment** helper on **`MilestoneCard.vue`** near status badges and **`MilestoneDetail.vue`** near status/payment labels.
- [x] Add **`common.field_help`**, **`common.field_help_status_payment`**, and **`contextHelpers`** to i18n **`en`/`ar`**.
- [x] **`pnpm lint`**, **`pnpm exec vitest run`**, **`pnpm exec nuxt build`** green.

## Dev Notes

### Developer guardrails

| Topic | Instruction |
|-------|---------------|
| Stack | Nuxt 4 **`app/`** tree; **no new packages**. |
| UI | **`HoverCard`** from **`~/components/ui/hover-card`**. |
| i18n | Arabic default RTL — hints verified via strings + **`text-start`**. |

### Files touched

| Action | Path |
|--------|------|
| NEW | `app/components/common/FieldContextHint.vue` |
| UPDATE | `app/components/payment/PaymentConfirmDialog.vue` |
| UPDATE | `app/components/project/MilestoneDialog.vue` |
| UPDATE | `app/components/milestone/MilestoneCard.vue` |
| UPDATE | `app/components/milestone/MilestoneDetail.vue` |
| UPDATE | `i18n/locales/en.json`, `i18n/locales/ar.json` |

## Dev Agent Record

### Agent Model Used

Composer (Cursor agent)

### Completion Notes List

- **`FieldContextHint`** uses **`@click.stop`** so milestone card navigation ignores hint taps.
- Status/payment helpers reuse **`contextHelpers.milestone.statusVsPayment`** with distinct **`aria-label-key`** for badge contexts.

### File List

- `app/components/common/FieldContextHint.vue`
- `app/components/payment/PaymentConfirmDialog.vue`
- `app/components/project/MilestoneDialog.vue`
- `app/components/milestone/MilestoneCard.vue`
- `app/components/milestone/MilestoneDetail.vue`
- `i18n/locales/en.json`
- `i18n/locales/ar.json`

## Change Log

- **2026-05-12:** Story authored (`ready-for-dev`), implemented contextual HoverCard helpers, a11y labels, lint/tests/build verified (`done`).

## Code review (adversarial triage)

### Blind Hunter

- [x] **Generic duplicate aria-label** — status/payment hints use **`common.field_help_status_payment`**; form fields use **`common.field_help`**.

### Edge Case Hunter

- [x] **Card click / navigation** — hint trigger stops propagation.

### Acceptance Auditor

- [x] Payment form + milestone form + badge/grid surfaces covered; **no `v-html`**; i18n-only copy.

## Story completion status

Implementation complete; sprint status **`done`**.
