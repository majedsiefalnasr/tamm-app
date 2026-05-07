# design-spec.md — TAMM Dashboard Design Specification

> **Source:** Extracted from `lovable-design/` — the Lovable AI prototype of TAMM.
> **Scope:** Dashboard UI only. Store, landing page, and solar calculator are excluded (WordPress scope).
> **Read by:** All AI tools, all engineers, before implementing any dashboard component or layout.
> **Last updated:** 2026-05-07

---

## 0. How to use this document

This document is a **design reference**, not implementation instructions.
It describes what things look like and how they behave visually.
Implementation rules (file paths, composables, state management) live in `AGENTS.md` and `CLAUDE.md`.

When building any dashboard page or component:

1. Check §1 for color tokens → apply to `app/assets/css/tailwind.css`
2. Check §2 for typography + spacing
3. Check §3 for the dashboard shell layout
4. Check §4 for reusable component primitives
5. Check §5 for sidebar nav per role
6. Check §6–§12 for per-page content specs

---

## 1. Color Tokens → shadcn-vue CSS Variables

The shadcn-vue `components.json` uses `style: "new-york"`, `baseColor: "neutral"`, `cssVariables: true`.
All custom tokens below replace the neutral base and must live in `app/assets/css/tailwind.css`
inside `:root` and `.dark` blocks, aligned with shadcn-vue's variable naming convention.

### 1.1 Light mode

```css
:root {
  /* Surfaces */
  --background: oklch(0.985 0.003 95); /* page base — warm off-white */
  --card: oklch(0.995 0.002 95); /* card surface */
  --popover: oklch(1 0 0); /* highest layer (dropdowns, tooltips) */

  /* Text */
  --foreground: oklch(0.3 0.012 230); /* body text */
  --card-foreground: oklch(0.3 0.012 230);
  --popover-foreground: oklch(0.24 0.014 230);
  /* --ink is a non-shadcn custom token for heavy headings/values */
  --ink: oklch(0.24 0.014 230);

  /* Primary — TAMM green */
  --primary: oklch(0.56 0.1 165);
  --primary-foreground: oklch(0.99 0 0);
  /* --primary-soft is a custom whisper-tint token */
  --primary-soft: oklch(0.965 0.025 165);

  /* Neutral chips */
  --secondary: oklch(0.96 0.005 230);
  --secondary-foreground: oklch(0.32 0.014 230);
  --muted: oklch(0.955 0.005 230);
  --muted-foreground: oklch(0.52 0.014 230);

  /* Accent orange — used sparingly for warnings/pending states */
  --accent: oklch(0.68 0.13 50);
  --accent-foreground: oklch(0.99 0 0);

  /* Destructive */
  --destructive: oklch(0.58 0.18 28);
  --destructive-foreground: oklch(0.99 0 0);

  /* Borders and inputs */
  --border: oklch(0.91 0.006 230);
  --input: oklch(0.91 0.006 230);
  --ring: oklch(0.56 0.1 165);
}
```

### 1.2 Dark mode

```css
.dark {
  /* Surfaces — neutral charcoal, no blue tint */
  --background: oklch(0.165 0 0);
  --card: oklch(0.225 0 0);
  --popover: oklch(0.27 0 0);

  /* Text — warm off-white */
  --foreground: oklch(0.92 0.003 95);
  --card-foreground: oklch(0.92 0.003 95);
  --popover-foreground: oklch(0.96 0.003 95);
  --ink: oklch(0.96 0.003 95);

  /* Primary — TAMM green, muted for dark (AA compliant) */
  --primary: oklch(0.72 0.1 165);
  --primary-foreground: oklch(0.16 0 0);
  --primary-soft: oklch(0.27 0.04 165);

  /* Neutral chips */
  --secondary: oklch(0.28 0 0);
  --secondary-foreground: oklch(0.92 0.003 95);
  --muted: oklch(0.28 0 0);
  --muted-foreground: oklch(0.72 0.005 95);

  /* Accent orange — muted */
  --accent: oklch(0.7 0.1 50);
  --accent-foreground: oklch(0.16 0 0);

  /* Destructive */
  --destructive: oklch(0.65 0.16 25);
  --destructive-foreground: oklch(0.16 0 0);

  /* Borders */
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 14%);
  --ring: oklch(0.78 0.1 165);
}
```

### 1.3 Custom non-shadcn tokens (add to `@theme {}`)

These are TAMM-specific additions beyond shadcn defaults.
Add them inside the Tailwind v4 `@theme {}` block:

```css
@theme {
  /* TAMM custom color aliases */
  --color-ink: var(--ink);
  --color-primary-soft: var(--primary-soft);

  /* Named shadows */
  --shadow-card:
    0 1px 2px oklch(0 0 0 / 0.04), 0 8px 24px -12px oklch(0 0 0 / 0.08);
  --shadow-elevated:
    0 2px 6px oklch(0 0 0 / 0.05), 0 24px 48px -20px oklch(0 0 0 / 0.15);
  --shadow-cta: 0 8px 20px -8px oklch(0.72 0.12 165 / 0.55);

  /* Dark-mode shadow overrides are applied via .dark selector in the CSS file */
}
```

Dark-mode shadow overrides (add after `.dark {}` block):

```css
.dark {
  --shadow-card:
    0 1px 2px oklch(0 0 0 / 0.45), 0 8px 24px -12px oklch(0 0 0 / 0.4);
  --shadow-elevated:
    0 2px 6px oklch(0 0 0 / 0.5), 0 24px 48px -20px oklch(0 0 0 / 0.55);
  --shadow-cta: 0 6px 16px -8px oklch(0.72 0.1 165 / 0.3);
}
```

### 1.4 Status tone palette (for badges/pills)

| Tone    | Background                    | Text                   | Use for                        |
| ------- | ----------------------------- | ---------------------- | ------------------------------ |
| primary | `--primary-soft`              | `--primary`            | Completed, approved, success   |
| accent  | `oklch(0.68 0.13 50 / 0.15)`  | `--accent`             | Pending, in-progress, awaiting |
| info    | `oklch(0.55 0.12 230 / 0.12)` | `oklch(0.45 0.12 230)` | Under review, info states      |
| danger  | `oklch(0.58 0.18 28 / 0.12)`  | `--destructive`        | Rejected, error states         |
| muted   | `--muted`                     | `--muted-foreground`   | Locked, not started, neutral   |

---

## 2. Typography

### 2.1 Font families

```css
@font-face {
  font-family: 'Cairo'; /* Arabic primary — replaces shadcn's Inter for Arabic text */
  font-weight: 400 900;
  font-display: swap;
  /* Load from Google Fonts CDN or local copy */
}

@font-face {
  font-family: 'Inter'; /* Latin secondary */
  font-weight: 100 900;
  font-display: swap;
}
```

Font stack (set as Tailwind `--font-sans`):

```
"Cairo", "Inter", system-ui, sans-serif
```

Headings also use Cairo (set as `--font-display`). Letter-spacing on headings: `-0.01em`.

### 2.2 Font scale

| Class         | Size                        | Weight                               | Use                       |
| ------------- | --------------------------- | ------------------------------------ | ------------------------- |
| Page title    | `text-2xl` / `text-3xl` md  | `font-extrabold`                     | `<h1>` on dashboard pages |
| Section title | `text-lg`                   | `font-extrabold`                     | `SectionCard` headers     |
| Card value    | `text-2xl` to `text-[28px]` | `font-extrabold`                     | `StatCard` metric values  |
| Body          | `text-sm`                   | `font-medium` / `font-semibold`      | General body text         |
| Label / meta  | `text-xs`                   | `font-semibold`                      | Field labels, metadata    |
| Badge / pill  | `text-[11px]`               | `font-bold`                          | Status badges             |
| Caption       | `text-[10px]`               | `font-bold uppercase tracking-wider` | Section group labels      |

### 2.3 Settings — font size scaling

The Settings page allows the user to scale the root font size.
Apply via `document.documentElement.style.fontSize`:

| Setting | Root font-size |
| ------- | -------------- |
| `sm`    | 14px           |
| `md`    | 16px (default) |
| `lg`    | 17.5px         |
| `xl`    | 19px           |

### 2.4 Available Arabic fonts (user-selectable in Settings)

| Key       | Font family          | Sample   |
| --------- | -------------------- | -------- |
| `cairo`   | Cairo (default)      | كايرو    |
| `tajawal` | Tajawal              | تجوال    |
| `ibm`     | IBM Plex Sans Arabic | آي بي إم |
| `noto`    | Noto Sans Arabic     | نوتو     |

---

## 3. Border Radius

shadcn-vue's `--radius` base is set to `0.875rem` (14px) — larger than the default 0.5rem.

```css
:root {
  --radius: 0.875rem;
}
```

Derived scale used in the dashboard:

| Token          | Value                        | Used for                         |
| -------------- | ---------------------------- | -------------------------------- |
| `rounded-xl`   | `calc(var(--radius) - 4px)`  | Icon containers, small buttons   |
| `rounded-2xl`  | `calc(var(--radius))`        | Cards, stat cards, section cards |
| `rounded-3xl`  | `calc(var(--radius) + 12px)` | Large project header cards       |
| `rounded-full` | `9999px`                     | Badges, pills, round buttons     |

---

## 4. Dashboard Shell Layout

### 4.1 Overall structure

```
┌─────────────────────────────────────────────────────────────┐
│  TOPBAR (h-20, sticky, backdrop-blur, full width)           │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│   SIDEBAR    │   MAIN CONTENT AREA                          │
│   (w-64)     │   (flex-1, overflow, scrollable)             │
│   sticky     │                                              │
│   h-screen   │   px-4 pb-16 pt-6 md:px-8 md:pb-20 md:pt-8  │
│              │   max-width: boxed=1400px / wide=1800px      │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

**RTL note:** In RTL (Arabic), the sidebar appears on the **right** side.
Use `dir="rtl"` on `<html>`. Use logical CSS properties everywhere (see `AGENTS.md §4`).

### 4.2 Sidebar

| Property         | Value                                                       |
| ---------------- | ----------------------------------------------------------- |
| Width            | `w-64` (256px)                                              |
| Position         | `sticky top-0 h-screen` — stays fixed while content scrolls |
| Background       | `bg-card/70 backdrop-blur-xl backdrop-saturate-150`         |
| Border           | `border-s border-border` (start side — right in RTL)        |
| Hidden on mobile | `hidden md:flex md:flex-col`                                |
| Logo area        | `h-20` header with border-b, app logo centered vertically   |
| Nav scroll area  | `flex-1 overflow-y-auto p-3 space-y-4`                      |
| Footer           | Logout button, `border-t border-border p-3`                 |

**Nav item (active):**

```
bg-primary-soft text-primary
rounded-xl px-3 py-2.5
flex items-center gap-3 text-sm font-semibold
```

**Nav item (inactive):**

```
text-foreground/80 hover:bg-muted hover:text-primary
rounded-xl px-3 py-2.5 transition
```

**Nav group label** (for grouped sections like "Store", "Other"):

```
text-[10px] font-bold uppercase tracking-wider text-muted-foreground
px-3 pb-1 pt-2
```

### 4.3 Topbar

| Property   | Value                                                      |
| ---------- | ---------------------------------------------------------- |
| Height     | `h-20`                                                     |
| Position   | `sticky top-0 z-20`                                        |
| Background | `bg-card/60 backdrop-blur-xl backdrop-saturate-150`        |
| Border     | `border-b border-border`                                   |
| Padding    | `px-4 md:px-8`                                             |
| Start side | Role icon + role label + tagline (2-line stack)            |
| End side   | Search bar (hidden mobile) + Notification bell + Home icon |

**Search bar:** `rounded-full border border-border bg-background px-3 py-2` — hidden on mobile.

**Notification bell:** Bell icon with unread count badge.
Badge: `absolute -top-1 -end-1 h-4 w-4 rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground`.

### 4.4 Mobile sidebar

On mobile (`md` breakpoint and below), the sidebar is hidden.
A `<select>` dropdown replaces the sidebar navigation:

```
border-b border-border bg-card px-4 py-2
```

Each option in the select maps to a nav section key.

### 4.5 Content width modes (user-selectable in Settings)

| Mode    | Max width class            |
| ------- | -------------------------- |
| `boxed` | `max-w-[1400px]` (default) |
| `wide`  | `max-w-[1800px]`           |
| `full`  | `max-w-none`               |

Applied on the content wrapper: `mx-auto w-full {modeClass}`.

### 4.6 Demo banner (development only)

A floating banner at the bottom of the screen during development/demo:

```
fixed inset-x-0 bottom-4 flex justify-center
rounded-full border border-amber-300/50 bg-amber-50/60 backdrop-blur-xl
text-[11px] font-semibold text-amber-900
```

---

## 5. Reusable Component Primitives

These primitives are the building blocks of every dashboard page.
Implement them as Vue components in `app/components/common/` or `app/components/ui/`.

### 5.1 StatCard

A KPI card for dashboard overview sections.

**Structure:**

```
rounded-2xl border border-border bg-card p-5 shadow-card
  └── flex items-start justify-between gap-3
        ├── label: text-xs font-semibold text-muted-foreground
        ├── value: mt-1.5 text-2xl font-extrabold text-ink md:text-[28px]
        └── hint: mt-1 text-[11px] text-muted-foreground
      └── icon: h-10 w-10 rounded-xl flex items-center justify-center
                [tone class — see below]
```

**Icon tone classes:**

| Tone      | Class                                                                |
| --------- | -------------------------------------------------------------------- |
| `primary` | `bg-primary-soft text-primary`                                       |
| `accent`  | `bg-accent/15 text-accent`                                           |
| `danger`  | `bg-rose-100 text-rose-700` (light) — use dark variants in dark mode |
| `default` | `bg-muted text-foreground/70`                                        |

### 5.2 SectionCard

A general-purpose content container used for every list/table section.

**Structure:**

```
rounded-2xl border border-border bg-card p-5 md:p-6 shadow-card
  └── header: flex items-end justify-between gap-3 mb-4
        ├── title: text-lg font-extrabold text-ink
        └── subtitle: mt-0.5 text-xs text-muted-foreground
      [optional] action: end-aligned button or link
  └── [children]
```

### 5.3 Pill / StatusBadge

Used for all status indicators. Never use raw text for status.

**Structure:** `inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold`

| Tone      | Class                          |
| --------- | ------------------------------ |
| `muted`   | `bg-muted text-foreground/70`  |
| `primary` | `bg-primary-soft text-primary` |
| `accent`  | `bg-accent/15 text-accent`     |
| `danger`  | `bg-rose-100 text-rose-700`    |
| `info`    | `bg-sky-100 text-sky-700`      |

### 5.4 PageHeader

Used at the top of every dashboard section page.

**Structure:**

```
mb-6 (or mb-8)
  └── title: text-2xl font-extrabold text-ink
  └── subtitle: mt-1 text-sm text-muted-foreground (optional)
  [optional] action: end-aligned button
```

### 5.5 Primary button

```
inline-flex items-center gap-2 rounded-full
bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground
shadow-cta transition hover:bg-primary/95 hover:-translate-y-px
```

### 5.6 Outline / ghost button

```
inline-flex items-center gap-2 rounded-full
border border-border bg-card px-4 py-2 text-xs font-bold text-foreground
transition hover:border-primary hover:text-primary
```

### 5.7 Empty state

```
rounded-2xl border border-dashed border-border bg-card p-10 text-center
  └── [icon]: h-10 w-10 text-muted-foreground mx-auto
  └── title: mt-3 text-sm font-bold text-ink
  └── subtitle: mt-1 text-xs text-muted-foreground
```

### 5.8 Progress bar

```
h-2.5 rounded-full bg-muted overflow-hidden
  └── fill: h-full rounded-full bg-gradient-to-[inline-start] from-primary to-emerald-400
             width set via inline style: width: {progress}%
```

**RTL note:** Use `bg-gradient-to-[inline-start]` (logical) not `bg-gradient-to-l`.

### 5.9 Divider row (table/list separator)

`border-b border-border last:border-0`

### 5.10 Card hover effect

All clickable cards use:

```
transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elevated
```

---

## 6. Sidebar Navigation — Per Role

These are the nav items for each role's sidebar. Every item has:

- `key`: internal section identifier
- Arabic label
- Lucide icon

### 6.1 Client (`client`)

| Key           | Label       | Icon            |
| ------------- | ----------- | --------------- |
| `overview`    | لوحة التحكم | LayoutDashboard |
| `projects`    | مشاريعي     | Folder          |
| `new-project` | مشروع جديد  | PlusSquare      |
| `reports`     | التقارير    | ClipboardList   |
| `payments`    | المدفوعات   | CreditCard      |
| `messages`    | المحادثات   | MessageSquare   |
| `settings`    | الإعدادات   | Settings        |

### 6.2 Contractor (`contractor`)

| Key           | Label       | Icon            |
| ------------- | ----------- | --------------- |
| `overview`    | لوحة التحكم | LayoutDashboard |
| `projects`    | مشاريعي     | Briefcase       |
| `tasks`       | المهام      | ListChecks      |
| `reports`     | التقارير    | ClipboardList   |
| `messages`    | المحادثات   | MessageSquare   |
| `withdrawals` | السحوبات    | Wallet          |
| `settings`    | الإعدادات   | Settings        |

### 6.3 Supervisor Engineer (`supervisor_engineer`)

| Key           | Label           | Icon            |
| ------------- | --------------- | --------------- |
| `overview`    | لوحة التحكم     | LayoutDashboard |
| `projects`    | المشاريع        | Building2       |
| `assignments` | طلبات التعيين   | UserPlus        |
| `field-team`  | الفريق الميداني | HardHat         |
| `reports`     | التقارير        | ClipboardList   |
| `approvals`   | الاعتمادات      | ClipboardCheck  |
| `messages`    | المحادثات       | MessageSquare   |
| `settings`    | الإعدادات       | Settings        |

**Badge:** `approvals` nav item shows unread count badge for pending reviews.

### 6.4 Field Engineer (`field_engineer`)

| Key        | Label       | Icon            |
| ---------- | ----------- | --------------- |
| `overview` | لوحة التحكم | LayoutDashboard |
| `projects` | مشاريعي     | Folder          |
| `reports`  | تقاريري     | ClipboardList   |
| `messages` | المحادثات   | MessageSquare   |
| `settings` | الإعدادات   | Settings        |

### 6.5 Admin (`admin`)

| Key           | Label             | Icon            | Group |
| ------------- | ----------------- | --------------- | ----- |
| `overview`    | لوحة التحكم       | LayoutDashboard | —     |
| `projects`    | المشاريع          | Building2       | —     |
| `assignments` | طلبات التعيين     | UserPlus        | —     |
| `payments`    | المدفوعات         | CreditCard      | —     |
| `reports`     | التقارير          | ClipboardList   | —     |
| `messages`    | المحادثات         | MessageSquare   | —     |
| `users`       | المستخدمون        | Users           | —     |
| `workflow`    | إعدادات سير العمل | Workflow        | —     |
| `finance`     | المالية           | TrendingUp      | —     |
| `settings`    | الإعدادات         | Settings        | أخرى  |

### 6.6 Super Admin (`super_admin`)

Same nav as `admin`, plus a "System" group:

| Key            | Label         | Icon        | Group  |
| -------------- | ------------- | ----------- | ------ |
| `system-flags` | إشارات النظام | ShieldCheck | النظام |
| `system-logs`  | سجلات النظام  | FileText    | النظام |

---

## 7. Dashboard Overview Pages (per role)

Each role's `overview` section is the first screen after login.
Priority order: most urgent actions at the top.

### 7.1 Client overview

**Priority order:**

1. **Urgent action banner** (conditional — shown only when there are items):
   - Milestones awaiting client approval (`supervisor_approved` status)
   - Each item: project name, milestone name, amount, approve/reject buttons inline
   - Pill: count badge in section header

2. **Stats row** (4 `StatCard`s):
   - المبلغ المُحرّر (Released amount) — `primary` tone
   - المتبقي محجوز (Remaining in escrow) — `default` tone
   - مراحل مكتملة (Completed phases X/Y) — `accent` tone
   - طلبات بانتظار الموافقة (Pending approvals count) — `danger` tone if > 0

3. **Active project card** (large header card):
   - Project name, ID, city, contractor name, supervisor name
   - Overall progress bar
   - Total budget
   - Background: `bg-gradient-to-[inline-start] from-primary/10 via-card to-card`

4. **Phases timeline** (condensed list inside the active project card or below it):
   - Each phase: name, budget, progress bar, status pill
   - Action: "Pay" button on `not_started` phases (client only)

5. **Charts** (optional, lower priority):
   - Area chart: budget release over time
   - Donut chart: phase status distribution

### 7.2 Contractor overview

**Priority order:**

1. **Stats row** (4 `StatCard`s):
   - الرصيد المتاح (Available balance) — `primary` tone
   - المراحل النشطة (Active phases count) — `accent` tone
   - تحت المراجعة (Under review count) — `info` tone
   - إجمالي المكتسب (Total earned) — `default` tone

2. **Active projects** section (`SectionCard`):
   - Projects with `in_progress` phases assigned to contractor
   - Each item: project name, city, active phase name, progress bar, status pill
   - Action: "View details" link

3. **Tasks pending approval** section (`SectionCard`):
   - Tasks marked done by contractor, awaiting supervisor approval
   - Each task: task name, phase name, project name, status pill (`pending`)

4. **Payment requests** section (`SectionCard`):
   - Phases completed, awaiting payment release
   - Each item: phase name, amount, status pill

5. **Withdrawal balance card**:
   - Earned total, withdrawn/locked total, available to withdraw
   - "Request withdrawal" CTA button

### 7.3 Supervisor Engineer overview

**Priority order:**

1. **Pending reviews banner** (urgent — shown only when items exist):
   - Reports/milestones with `under_review` status awaiting this supervisor
   - Each item: project name, milestone name, field engineer name, submission date
   - Sorted oldest first
   - "Review" button per item
   - Count badge in section header

2. **Stats row** (3 `StatCard`s):
   - بانتظار المراجعة (Pending reviews count) — `danger` tone if > 0
   - مشاريع نشطة (Active projects) — `primary` tone
   - معتمدة هذا الشهر (Approved this month) — `accent` tone

3. **My projects** (`SectionCard`):
   - Projects this supervisor is assigned to
   - Each: project name, city, owner name, overall progress, status pill

4. **Field team** (`SectionCard`):
   - Field engineers assigned to supervisor's projects
   - Each: engineer name, project name, last report date

5. **Recent approvals** (`SectionCard`):
   - Last 5 milestones approved/rejected by this supervisor
   - Each: milestone name, project, decision (approved/rejected), date

### 7.4 Field Engineer overview

**Priority order:**

1. **My active assignments** (`SectionCard`) — highest priority:
   - Milestones in `in_progress` assigned to this engineer
   - Each item: project name, milestone name, project city
   - Primary CTA per item: "Submit report" button
   - Empty state: "لا توجد مهام نشطة"

2. **Due reports** section (conditional):
   - Reports scheduled but not yet submitted
   - Shows "overdue" indicator if past due date

3. **Recently submitted reports** (`SectionCard`):
   - Last 5 reports with their current milestone status
   - Each: report title, phase, date submitted, current status pill

### 7.5 Admin overview

**Priority order:**

1. **Urgent action banners** (row of conditional alert cards):
   - New project requests pending admin approval
   - Payment proofs uploaded by clients, awaiting verification
   - Pending report reviews (all projects)
     Each banner: icon + title + subtitle + action link

2. **Platform stats row** (4 `StatCard`s):
   - مشاريع نشطة (Active projects total) — `primary` tone
   - إجمالي المقاولين (Registered contractors) — `default` tone
   - إجمالي المبالغ المُتتبَّعة (Total tracked SAR) — `accent` tone
   - نزاعات مفتوحة (Open disputes) — `danger` tone if > 0

3. **Activity chart** (`SectionCard`):
   - Area chart: platform activity over 12 months (projects, milestones)

4. **Projects overview table** (`SectionCard`):
   - All active projects: name, city, owner, progress bar, status pill
   - "View" action per row

5. **Disputes** (`SectionCard`):
   - Open and mediating disputes
   - Each: dispute ID, project name, raised by, topic, status pill, opened date
   - "Mediate" action button

6. **Finance bar chart** (optional):
   - SAR tracked per city/region

---

## 8. Projects List Page

Route: `/projects`

**Layout:**

- `PageHeader`: title "مشاريعي" / "المشاريع" (role-dependent), optional "New project" CTA (client only)
- Grid: `grid gap-4 lg:grid-cols-2` (or single column on mobile)
- Skeleton: 3 `ProjectCard` skeletons while loading
- Empty state: dashed border card with icon + message

**ProjectCard:**

```
rounded-2xl border border-border bg-card shadow-card
hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elevated transition
p-5 flex flex-col gap-3
```

Contents:

- Top row: project name (`font-extrabold text-ink`) + status pill
- Meta row: city icon + city name, budget amount
- Progress bar (hidden if no milestones yet)
- Bottom row: contractor name (if assigned) + "View details" link

**Admin-specific:** filter tabs by status above the grid.

---

## 9. Project Detail Page

Route: `/projects/:id`

**Header card** (full width, `rounded-3xl`):

- Project name (large, `font-extrabold`)
- Status pill
- Meta: city, type, area m², budget, owner, contractor, supervisor, field engineer
- Timeline progress bar (overall completion %)
- Background gradient: `from-primary/10 via-card to-card`

**Tab navigation** (below header):

| Tab                  | Visible to                              | Content                              |
| -------------------- | --------------------------------------- | ------------------------------------ |
| المراحل / Phases     | All roles                               | Phase list (§9.1)                    |
| المدفوعات / Payments | Client, Admin, Contractor               | Payment proof uploads, escrow status |
| التقارير / Reports   | All roles (filtered by role)            | Filed reports list                   |
| المحادثة / Chat      | All roles (thread per participant pair) | In-project chat threads              |
| السجل / Timeline     | All roles                               | Chronological project events         |

### 9.1 Phase list (inside project detail)

Each phase rendered as an expandable card:

```
rounded-2xl border border-border bg-card p-4
```

- Phase header: order number, name, budget, progress bar, status pill
- Expanded content: task list (§9.2)
- Actions depend on role + phase status:
  - Client: "Pay" button when `awaiting_payment`
  - Contractor: task checkboxes + "Mark done" per task
  - Supervisor: task approval buttons per task
  - Admin: "Complete phase" button (phase_end trigger)

### 9.2 Task list (inside phase)

Each task row:

```
flex items-center gap-3 border-b border-border py-3 last:border-0
```

- Checkbox (contractor) or approval icon (supervisor)
- Task title (`text-sm font-semibold`)
- Status chip: `todo` / `pending` / `approved` / `rejected`
- If `rejected`: rejection reason shown in small text below

### 9.3 Timeline tab

Chronological list of project events:

```
relative space-y-0 before:absolute before:inset-y-0 before:start-[18px] before:w-px before:bg-border
```

Each event:

- Dot indicator (colored by event kind)
- Label text
- Actor name (`font-semibold`)
- Relative timestamp

### 9.4 Chat tab

Thread list → select thread → chat panel:

- Thread list: shows thread title + last message preview + unread count
- Chat panel: message bubbles, sent messages end-aligned (RTL: start-aligned), received start-aligned
- Input: `rounded-full border` text input + send button

---

## 10. Reports Section

Route: `/reports` (also appears as tab in project detail)

**List view:**

- Filter tabs: All / Pending / Approved / Rejected
- Each report row in a `SectionCard`:
  - Report ID, phase name, engineer name, date, status pill
  - Photo count badge
  - "View" button → opens report viewer dialog

**Report viewer dialog:**

- Full-screen `Dialog` or `Sheet`
- Report title + date + engineer name
- Note/content (full text)
- Image grid: `grid grid-cols-2 md:grid-cols-3 gap-2`
- For supervisor: "Approve" / "Reject" action buttons
- Print/export button (generates PDF)

**Report submission form** (field engineer):

- `Dialog` or dedicated page
- Fields: type (daily/weekly/phase_end), notes (`Textarea`), photo upload
- Photo upload: drag & drop or click, preview thumbnails, remove per photo
- "Save draft" + "Submit" buttons

---

## 11. Payments / Withdrawals Section

### 11.1 Client payments page

Route: `/payments` (client)

- Summary card at top: total paid, total in escrow, total released
- List of all milestone payments grouped by project
- Each item: milestone name, amount, status pill, date

### 11.2 Contractor withdrawals page

Route: `/payments` (contractor — labelled "السحوبات")

- Balance summary card:
  - إجمالي المكتسب (Total earned from completed phases)
  - محجوز أو قيد الصرف (Locked/in-process)
  - متاح للسحب (Available — highlighted in green)
- "Request withdrawal" button → opens dialog:
  - Amount field (`MoneyInput`)
  - IBAN field
  - Notes (optional)
  - Project/phase link (optional)
- Withdrawals list:
  - Each: ID, amount, status pill, requested date, "3-day hold" indicator for approved ones
  - Status tones: pending=accent, approved=info, withdrawable=primary, rejected=danger

### 11.3 Admin payments management

Inside admin section `payments`:

- Payment proof verification queue (clients uploading bank transfer proof)
- Each item: project name, phase, amount, bank name, tx ref, uploaded proof image thumbnail
- "Verify" / "Reject" action buttons
- Withdrawal approval queue (contractor withdrawal requests)
- Each item: contractor name, amount, IBAN, "Approve with transfer proof" / "Reject" buttons

---

## 12. Settings Page

Route: appears as `settings` section in every role's sidebar.

Organized in cards using `SectionCard` pattern, 2-column grid on desktop:

### 12.1 Theme card

- Three-way toggle: Light / Dark / System (follow OS)
- Applies `.dark` class to `<html>` immediately on change

### 12.2 Font family card

- 4 options as button grid: Cairo / Tajawal / IBM Plex Arabic / Noto Sans Arabic
- Each shows font name in its own typeface as a sample
- Applies via CSS variable on `<html>` immediately

### 12.3 Font size card

- 4 options: صغير / متوسط / كبير / كبير جداً
- Applies via `document.documentElement.style.fontSize` immediately

### 12.4 Layout card

- 3 options: محتوى مُؤطّر (boxed) / عريض (wide) / بعرض الشاشة (full)
- Controls max-width of content area

### 12.5 Density card

- 2 options: comfortable (default) / compact
- Compact reduces `--radius` to `0.625rem` and tightens spacing

### 12.6 Accessibility card

- Reduced motion toggle (`prefers-reduced-motion` hint)
- When enabled: all `transition-duration` and `animation-duration` set to `0.001ms`

### 12.7 Per-role preferences (role-dependent)

Each role has additional preferences shown only to that role:

| Role           | Preference                       | Type   |
| -------------- | -------------------------------- | ------ |
| Client         | Show payment reminders           | Toggle |
| Client         | Show project alerts              | Toggle |
| Contractor     | Show withdrawal alerts           | Toggle |
| Contractor     | Default phase view (list/kanban) | Toggle |
| Supervisor     | Auto-approve minor reports       | Toggle |
| Field Engineer | Report reminders                 | Toggle |
| Admin          | Show revenue widget              | Toggle |
| Admin          | Show system health               | Toggle |

---

## 13. Messages / Chat Page

Route: appears as `messages` section in every role's sidebar.

**Layout:**

- Two-panel: thread list (start side) + active chat (end side)
- On mobile: thread list full width → tap to open chat panel

**Thread list:**

- Grouped by project (project name as group header)
- Each thread: title (participant roles), last message preview, timestamp, unread count badge
- Active thread: highlighted with `bg-primary-soft`

**Chat panel:**

- Header: thread title + participant role labels
- Messages list (scrollable):
  - Own messages: `bg-primary text-primary-foreground` bubble, `justify-end`
  - Other messages: `bg-muted` bubble, `justify-start`
  - Each message: author name, text, timestamp
- Input area: `rounded-full border` text input + send icon button
- "New conversation" button for admin (can start dispute threads)

---

## 14. shadcn-vue Configuration Alignment

### 14.1 components.json updates needed

The current `components.json` has:

- `"rtl": false` → **must be updated to `true`** for RTL-aware shadcn-vue components
- `"baseColor": "neutral"` → keep, but CSS variables above override the neutral palette
- `"style": "new-york"` → keep, this matches the design's border-radius and component style
- `"font": "inter"` → keep as fallback; Cairo is the primary via CSS variable

### 14.2 Token naming alignment

shadcn-vue uses these variable names — all must be defined in your `:root` block:
`--background`, `--foreground`, `--card`, `--card-foreground`, `--popover`, `--popover-foreground`,
`--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`,
`--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`,
`--destructive`, `--destructive-foreground`, `--border`, `--input`, `--ring`, `--radius`

Custom TAMM-only additions (not from shadcn): `--ink`, `--primary-soft`, `--shadow-card`, `--shadow-elevated`, `--shadow-cta`.

### 14.3 RTL in shadcn-vue components

With `"rtl": true` in `components.json`, shadcn-vue components automatically:

- Flip `Sheet` open direction
- Flip `Select` dropdown alignment
- Use logical properties internally

You still must use Tailwind logical properties (`ms-*`, `ps-*`, `start-*`, etc.) in your own templates.

---

_Design extracted from: `lovable-design/src/styles.css`, `lovable-design/src/routes/dashboard.tsx`,_
_`lovable-design/src/components/dashboard/`_
_Last updated: 2026-05-07_
