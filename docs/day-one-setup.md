# day-one-setup.md — TAMM Frontend, Day One

> This document covers everything from empty folder to first story building.
> Follow the steps in exact order. Do not skip steps.
> Estimated time: 3–4 hours for both developers together.

---

## Before you start — what you need

- Node.js 20+ installed (`node --version`)
- pnpm installed (`npm install -g pnpm`)
- VSCode + Claude Code extension installed and authenticated
- Git configured
- Empty GitHub repo created for `tamm-frontend`

---

## Phase 1 — Nuxt 4 project scaffold

**Who:** Dev A alone. Dev B reads all epic files during this time.
**Time:** ~45 minutes.

### Step 1 — Create the Nuxt 4 project

```bash
npx nuxi@latest init tamm-frontend
cd tamm-frontend
```

When prompted: select `pnpm` as package manager, TypeScript, no additional modules yet.

### Step 2 — Install all dependencies

```bash
# State management
pnpm add @pinia/nuxt pinia

# i18n
pnpm add @nuxtjs/i18n

# Forms + validation
pnpm add vee-validate @vee-validate/zod zod

# Icons
pnpm add @heroicons/vue

# Tailwind v4
pnpm add -D tailwindcss @tailwindcss/vite

# Testing
pnpm add -D vitest @vitejs/plugin-vue playwright @playwright/test
```

### Step 3 — Initialize shadcn-vue

```bash
pnpm dlx shadcn-vue@latest init
```

Answer the prompts:
- TypeScript: **yes**
- Framework: **Nuxt**
- Style: **new-york**
- Base color: your choice (we use slate)
- Global CSS path: `app/assets/css/main.css`
- CSS variables: **yes**
- Components directory: `app/components/ui`

### Step 4 — Configure Nuxt 4

```ts
// nuxt.config.ts
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  future: { compatibilityVersion: 4 },  // enables app/ directory
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    'shadcn-nuxt',
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  css: ['~/assets/css/main.css'],
  i18n: {
    locales: [
      { code: 'ar', dir: 'rtl', file: 'ar.json' },
      { code: 'en', dir: 'ltr', file: 'en.json' },
    ],
    defaultLocale: 'ar',
    langDir: 'i18n/',
  },
  shadcn: {
    prefix: '',
    componentDir: './app/components/ui',
  },
})
```

### Step 5 — Set up Tailwind v4

```css
/* app/assets/css/main.css */
@import "tailwindcss";

@theme {
  /* TAMM brand colors */
  --color-primary-50:  oklch(0.97 0.015 240);
  --color-primary-100: oklch(0.93 0.03  240);
  --color-primary-500: oklch(0.54 0.18  240);
  --color-primary-600: oklch(0.46 0.17  240);
  --color-primary-900: oklch(0.22 0.08  240);

  /* Status colors */
  --color-success-500: oklch(0.54 0.16 145);
  --color-warning-500: oklch(0.72 0.18 85);
  --color-danger-500:  oklch(0.56 0.20 25);

  /* Typography */
  --font-sans:    "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-arabic:  "Cairo", "Tajawal", ui-sans-serif, sans-serif;
}
```

### Step 6 — Create the Nuxt 4 app/ folder structure

```bash
mkdir -p app/{components/{ui,common,layout,project,milestone,payment,report,notifications},composables/__mocks__,layouts,middleware,pages/{projects,admin,reports,reviews},assets/css}
mkdir -p shared/types
mkdir -p stores
mkdir -p utils
mkdir -p i18n
```

### Step 7 — Create i18n placeholder files

```bash
echo '{}' > i18n/ar.json
echo '{}' > i18n/en.json
```

### Step 8 — Verify the project runs

```bash
pnpm dev
```

Should start at `http://localhost:3000` with no errors.

### Step 9 — Initialize git and push

```bash
git init
git add .
git commit -m "chore: init Nuxt 4 + Tailwind v4 + shadcn-vue"
git remote add origin https://github.com/your-org/tamm-frontend.git
git push -u origin main
```

---

## Phase 2 — Drop in all TAMM docs

**Who:** Dev A continues. Dev B still reading epics.
**Time:** ~15 minutes.

Create the `docs/` folder and copy in every document we wrote:

```
tamm-frontend/
├── CLAUDE.md                          ← project root (Claude Code reads this)
└── docs/
    ├── coding-standards.md
    ├── status-flows.md
    ├── api-contracts.md
    ├── frontend-spec.md
    ├── parallel-execution.md
    └── stories/
        ├── epic-01-auth.md
        ├── epic-02-projects.md
        ├── epic-03-milestones.md
        ├── epic-04-payments.md
        ├── epic-05-notifications.md
        └── epic-06-admin.md
```

`CLAUDE.md` must be in the **project root**, not inside `docs/`.
Claude Code looks for it at root level.

```bash
git add .
git commit -m "docs: add TAMM planning docs and CLAUDE.md"
git push
```

---

## Phase 3 — Install BMAD v6

**Who:** Dev A. Dev B can do this on their machine simultaneously.
**Time:** ~10 minutes.

### Step 10 — Run the BMAD installer

Navigate to your project root and run:

```bash
npx bmad-method install
```

The installer will ask a series of questions. Answer as follows:

| Prompt | Answer |
|---|---|
| Installation directory | `.` (current directory — project root) |
| Modules to install | `BMM` (BMad Method Module) — the core agile workflow |
| IDE / tool | `claude-code` |
| Your name | your name |
| Communication language | English (or Arabic if you prefer) |
| Output folder | `docs` |

### Step 11 — What the installer creates

After installation, your project root will have:

```
tamm-frontend/
├── _bmad/                          ← BMAD runtime (do not edit manually)
│   ├── core/                       ← core skills (bmad-help, etc.)
│   ├── bmm/                        ← BMad Method module
│   │   ├── agents/                 ← pm.md, architect.md, dev.md, sm.md...
│   │   ├── workflows/              ← sharded workflow files
│   │   └── config.yaml             ← BMM module settings
│   ├── config.toml                 ← central BMAD config
│   ├── custom/                     ← your TOML overrides go here
│   └── _config/
│       ├── manifest.yaml
│       └── agent-manifest.csv
├── _bmad-output/                   ← AI writes planning artifacts here
└── .claude/
    └── commands/                   ← slash command stubs auto-created
```

### Step 12 — Restart Claude Code

BMAD slash commands only load on startup.

```
Close Claude Code → reopen in the tamm-frontend project folder
```

### Step 13 — Verify BMAD is working

In Claude Code, type:

```
/bmad-help
```

It should respond with the BMAD workflow guide and recommend your next step.
If it doesn't respond, close and reopen Claude Code again.

---

## Phase 4 — Configure BMAD for TAMM

**Who:** Dev A (one person, in Claude Code).
**Time:** ~20 minutes.

### Step 14 — Initialize the BMAD project config

In Claude Code, run:

```
/workflow-init
```

This creates `bmad/config.yaml` (note: `bmad/`, not `_bmad/`) in your project root.
Fill in the prompts or edit the file directly after creation:

```yaml
# bmad/config.yaml — created by /workflow-init
project:
  name: "TAMM Frontend"
  type: "web-app"
  level: 3
  description: "Construction project management platform — Nuxt 4, Vue 3.5, Tailwind v4, shadcn-vue, Arabic-first RTL"

paths:
  output_folder: "docs"
  stories_folder: "docs/stories"
  status_file: "docs/bmm-workflow-status.yaml"
  sprint_file: "docs/sprint-status.yaml"

workflow:
  phase_1_analysis:
    product_brief: "skip"      # already done — we have our planning docs
    research: "skip"
  phase_2_planning:
    prd: "skip"                # already done
    ux_design: "skip"          # already done — frontend-spec.md
  phase_3_solutioning:
    architecture: "skip"       # already done — CLAUDE.md + coding-standards.md
  phase_4_implementation:
    stories: "required"
    dev_stories: "required"
```

Setting phases 1–3 to `skip` tells BMAD we're jumping straight to Phase 4 (implementation) because all our planning is already done.

### Step 15 — Configure the Dev agent to always load TAMM docs

The most important configuration. Open `_bmad/bmm/config.yaml` and add:

```yaml
# _bmad/bmm/config.yaml
# Add or update this section:

dev_load_always_files:
  - CLAUDE.md
  - docs/coding-standards.md
  - docs/status-flows.md
  - docs/api-contracts.md
```

This means every time `@dev` (Amelia) activates, she automatically reads these four files.
She always knows the TAMM rules, stack decisions, status machine, and current API state.
You never have to paste instructions into the chat.

### Step 16 — Verify the config is correct

In Claude Code:

```
/workflow-status
```

Expected output:
```
Project: TAMM Frontend (Level 3)
Phase 1 Analysis:    SKIPPED
Phase 2 Planning:    SKIPPED
Phase 3 Solutioning: SKIPPED
Phase 4 Implementation: READY TO START

Recommended next step: /sprint-planning or /create-story
```

---

## Phase 5 — First BMAD session (both developers together)

**Who:** Both Dev A and Dev B together.
**Time:** ~45 minutes.

This is the paired planning session. Do this together once per sprint.

### Step 17 — Run the PO checklist

The Product Owner validates all existing docs before any story is written:

```
/bmad-help

I have completed all planning docs for TAMM:
- CLAUDE.md (architecture + behavioral rules)
- docs/coding-standards.md
- docs/status-flows.md
- docs/api-contracts.md
- docs/frontend-spec.md
- docs/stories/epic-01-auth.md through epic-06-admin.md

Act as @po and run the master checklist to validate
consistency before we start Sprint 1.
```

Review every issue the PO raises. Fix the docs if anything is flagged.

### Step 18 — Generate story files for Sprint 1

Now activate the Scrum Master to shard Epic 01 into individual story files:

```
/create-story

Act as @sm.
Source epic: docs/stories/epic-01-auth.md

Generate story files for Sprint 1.
Start with story-auth-login and story-auth-session only.
Pause after those two and wait for my approval before continuing.
Output to: docs/stories/
```

SM produces `story-auth-login.md` and `story-auth-session.md`.

Review both files together:
- Are the acceptance criteria binary (pass/fail)?
- Is the scope tight enough for one developer-day?
- Are the technical notes accurate for TAMM's stack?
- Are out-of-scope items explicitly listed?

Approve and continue:

```
These two look good. Generate story-auth-role-redirect and story-auth-topbar.
```

Repeat until all Sprint 1 stories are generated and approved.

### Step 19 — Create sprint-status.yaml

```yaml
# docs/sprint-status.yaml
sprint: 1
status: in-progress
start_date: "YYYY-MM-DD"

stories:
  - id: story-auth-login
    status: ready
    epic: epic-01-auth
    track: A
    assignee: dev-a

  - id: story-auth-session
    status: ready
    epic: epic-01-auth
    track: A
    assignee: dev-a

  - id: story-auth-role-redirect
    status: ready
    epic: epic-01-auth
    track: A
    assignee: dev-a

  - id: story-auth-topbar
    status: ready
    epic: epic-01-auth
    track: A
    assignee: dev-a

  - id: story-design-system
    status: ready
    epic: shared-ui
    track: A
    assignee: dev-a

blockers: []
```

```bash
git add .
git commit -m "chore: BMAD v6 configured, Sprint 1 story files generated"
git push
```

---

## Phase 6 — Split into tracks and start building

**Who:** Dev A and Dev B independently from here.
**Time:** Rest of Day 1 and onwards.

### Step 20 — Create track branches

Both developers create their own branch:

```bash
# Dev A
git checkout -b feat/track-a

# Dev B
git checkout -b feat/track-b
```

### Step 21 — Dev A: first dev session

Dev A opens Claude Code on `feat/track-a` and runs:

```
/dev-story story-auth-login
```

BMAD's dev agent (Amelia) activates. She reads:
1. `story-auth-login.md` — the story contract
2. `CLAUDE.md` — behavioral rules and stack decisions
3. `docs/coding-standards.md` — how to write code
4. `docs/status-flows.md` — state machine rules
5. `docs/api-contracts.md` — current API state

She then presents her implementation plan. **Review and approve the plan before she writes a line of code.** This is the Karpathy rule from `CLAUDE.md §0.4`.

### Step 22 — Dev B: Sprint 1 foundation work

While Dev A builds auth, Dev B has parallel work that has zero dependencies:

```
Open Claude Code on feat/track-b.

Act as @dev.

I am Dev B on Track B. Auth is not yet available.
My Sprint 1 work is to build the foundation layer:

1. Write all shared TypeScript types in shared/types/
   - project.ts, milestone.ts, payment.ts, user.ts, api.ts

2. Write utils/statusMachine.ts (pure TypeScript, no Vue dependencies)

3. Write utils/permissions.ts (pure TypeScript, no Vue dependencies)

4. Write utils/formatters.ts (formatCurrency, formatDate)

5. Write mock composables in app/composables/__mocks__/:
   - useProjects.mock.ts
   - usePayments.mock.ts
   - useMilestones.mock.ts

Read CLAUDE.md and docs/coding-standards.md first,
then present your plan for shared/types/ before writing anything.
```

Dev B can run Vitest on all utilities immediately — they have zero Vue dependencies.

---

## End of Day 1 — checklist

By end of Day 1, both devs verify:

**Dev A:**
- [ ] Nuxt 4 project runs at localhost:3000
- [ ] BMAD v6 installed, `/bmad-help` responds
- [ ] `bmad/config.yaml` created with TAMM settings
- [ ] `_bmad/bmm/config.yaml` updated with `dev_load_always_files`
- [ ] All sprint 1 story files generated in `docs/stories/`
- [ ] `story-auth-login` implementation in progress on `feat/track-a`

**Dev B:**
- [ ] `shared/types/` fully written and TypeScript-clean
- [ ] `utils/statusMachine.ts` written with all transitions
- [ ] `utils/permissions.ts` written with all role maps
- [ ] `utils/formatters.ts` written
- [ ] All three mock composables written
- [ ] Vitest passing on all utilities

**Both:**
- [ ] `docs/sprint-status.yaml` created and committed
- [ ] Both track branches pushed to origin

---

## Troubleshooting

### `/bmad-help` doesn't respond
Close and fully reopen Claude Code. Slash commands load on startup only.

### `_bmad/bmm/config.yaml` doesn't have `dev_load_always_files`
BMAD v6 uses TOML for some config and YAML for others. Check `_bmad/config.toml` —
the key may be there instead. If neither, add it manually to `_bmad/bmm/config.yaml`.

### Agents activate but don't know TAMM rules
The `dev_load_always_files` may not have taken effect. Verify the paths are correct
relative to the project root (not relative to `_bmad/`). The correct paths are:
```yaml
dev_load_always_files:
  - CLAUDE.md               # not docs/CLAUDE.md — it's in root
  - docs/coding-standards.md
  - docs/status-flows.md
  - docs/api-contracts.md
```
Restart Claude Code after any config change.

### `/workflow-init` creates the wrong folder structure
If `bmad/config.yaml` ends up inside `_bmad/`, that's wrong. It should be at
`tamm-frontend/bmad/config.yaml` — a separate `bmad/` folder at project root.
Create it manually if needed.

### Nuxt 4 `app/` directory not detected
Make sure `future: { compatibilityVersion: 4 }` is in `nuxt.config.ts`.
Run `npx nuxi upgrade` if issues persist.

---

## What happens on Day 2

Day 2 is the first full parallel sprint day:

```
Dev A:
  /dev-story story-auth-session       ← continue auth track
  /dev-story story-auth-role-redirect
  /dev-story story-auth-topbar

Dev B:
  Open Claude Code on feat/track-b
  /dev-story story-design-system      ← StatusTag, EmptyState, Skeleton components
```

At end of Day 2, Dev B's `StatusTag` and `EmptyState` are available.
Dev A can start consuming them in auth components.

---

*BMAD v6 · Nuxt 4 · TAMM Frontend Team*
*Last updated: Sprint 1 setup*
