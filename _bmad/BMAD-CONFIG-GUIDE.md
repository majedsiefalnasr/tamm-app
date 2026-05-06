# BMAD Configuration Guide — TAMM Project

This guide explains how BMAD is configured for the TAMM frontend project and how to make changes.

## Configuration Structure

BMAD uses a **three-layer override system** where each layer merges on top of the previous:

```
Base Config (read-only)
    ↓ (merged by)
Team Config (custom/config.toml — committed)
    ↓ (merged by)
Personal Config (custom/config.user.toml — gitignored)
```

**Only the top two layers matter for your workflow:**

| Layer | File | Committed? | When to Edit | Audience |
|-------|------|-----------|--------------|----------|
| **Team** | `_bmad/custom/config.toml` | ✅ Yes | Project-wide settings, agent roles, MCP integrations | All developers |
| **Personal** | `_bmad/custom/config.user.toml` | ❌ No (gitignored) | Your preferences, skill levels, work style | You only |

---

## What's Configured (A, C, D)

### A: Enhanced Agents & New Agents

**Enhanced Existing Agents** with TAMM domain expertise:

1. **bmad-agent-dev** — Senior Software Engineer
   - Knows Nuxt 4 structure, Vue 3.5 Composition API, Tailwind v4, Pinia
   - Enforces surgical precision, type safety, RTL-first
   - Uses SocratiCode for dependency analysis

2. **bmad-agent-architect** — System Architect
   - Validates API contracts, enforces role-based access
   - Maps Nuxt 4 layers, ensures state machine compliance
   - Impact analysis for refactoring

3. **bmad-agent-tech-writer** — Technical Writer
   - Maintains API contracts, status flows, coding standards docs
   - Extracts code examples, keeps docs in sync

4. **bmad-agent-analyst** — Business Analyst
   - Maps 6-role system (super_admin, admin, client, contractor, field_engineer, supervisor_engineer)
   - Validates workflow transitions, finds edge cases

5. **bmad-agent-ux-designer** — UX Designer
   - RTL-first design, uses Code Connect for Figma → shadcn-vue mapping

**New Specialized Agents** for TAMM workflows:

6. **bmad-api-contract-guardian** (Atlas) — API Contract Specialist
   - Audits Laravel REST API contracts
   - Maintains mock endpoints for unavailable APIs
   - Flags backend blockers early

7. **bmad-state-machine-validator** (Dimitri) — State Machine Validator
   - Validates milestone and payment state machines
   - Ensures all 6 roles flow correctly
   - Prevents invalid state transitions

8. **bmad-rtl-accessibility-auditor** (Leila) — RTL & Accessibility Auditor
   - Tests every layout in Arabic (RTL) and English (LTR)
   - Enforces logical CSS properties only
   - Catches WCAG 2.1 regressions

### C: Personal Preferences

**Your Profile:**
- **Role:** Frontend Team Lead
- **Skill Levels:** Advanced in BMM and TEA, Intermediate in CIS
- **Work Style:** Concise responses, include plan before coding, surface trade-offs

**Your Enforcement Rules** (for TAMM project):
- ✅ Surgical changes only — no scope creep
- ✅ Type safety — strict TypeScript, no 'any'
- ✅ RTL testing — every layout in Arabic
- ✅ API contract validation
- ✅ Status machine validation
- ✅ Permission enforcement

**Your Persistent Facts** — agents use these to shape responses:
- Simplicity first — minimum code
- Surgical precision — every line traces to requirement
- Type-safe by default
- RTL-first design
- State machine validation
- Clean architecture

### D: Team Settings

**MCP Servers Enabled:**
1. **SocratiCode** — semantic codebase search, dependency analysis
   - Used by: dev, architect, tech-writer, analyst
2. **Figma** — design-to-code integration
   - Used by: UX designer

**Project Context Documents:**
- `CLAUDE.md` — behavioral guidelines and tech stack
- `docs/api-contracts.md` — API endpoint specs
- `docs/status-flows.md` — state machine diagrams
- `docs/frontend-spec.md` — design system
- `docs/coding-standards.md` — code patterns

---

## How to Use This Configuration

### When You Start a Task

The agents will:
1. Read your persistent facts (simplicity first, type-safe, RTL-first, etc.)
2. Know the 6 roles and permission matrices
3. Know the status machines and valid transitions
4. Know the API contracts and which endpoints exist
5. Use SocratiCode to explore code before making changes

### How to Add New Agents

Edit `_bmad/custom/config.toml` and add an agent block:

```toml
[agents.bmad-your-agent-name]
module = "bmm"                          # which BMAD module
team = "software-development"
name = "Sarah"                          # display name
title = "Your Specialist"
icon = "🎯"
domain_expertise = "Your domain, Vue patterns, Tailwind"
project_constraints = [
  "Constraint 1",
  "Constraint 2"
]
description = "What this agent does and how it thinks."
```

### How to Update Your Preferences

Edit `_bmad/custom/config.user.toml`:

```toml
[preferences]
response_style = "concise"              # change how agents respond
code_review_focus = ["type_safety", "rtl_safety"]  # what matters to you

[persistent_facts]
items = [
  "Your new fact here"
]
```

### How to Change Module Settings

Add to `_bmad/custom/config.user.toml`:

```toml
[modules.tea]
test_focus = "component_integration"
prefer_playwright = true
```

---

## TAMM-Specific Enforcement

These agents **always enforce** these rules for TAMM:

### Type Safety
```ts
// ❌ Never
const data: any = response

// ✅ Always
const data: ProjectType = response
```

### Surgical Changes
```ts
// ❌ Never change unrelated code
useAuth()
  .logout()
  .then(() => {
    // Also reorganize imports, rename variables, etc.
  })

// ✅ Only touch what was requested
if (condition) {
  useAuth().logout()
}
```

### Status Validation
```ts
// ❌ Never
milestone.status = 'approved'

// ✅ Always validate first
if (canTransition('milestone', milestone.status, 'approved')) {
  await store.approve(milestone.id)
}
```

### Permission Checks
```ts
// ❌ Never hardcode roles
if (auth.role === 'supervisor_engineer') { ... }

// ✅ Always use permission system
if (can('approve_milestone', milestone.allowedActions)) { ... }
```

### RTL Testing
```
// ❌ Never ship without testing in Arabic
<div class="ml-4 pl-2 border-l-2">...</div>

// ✅ Always use logical properties, test both languages
<div class="ms-4 ps-2 border-s-2">...</div>
```

---

## MCP Servers

### SocratiCode Integration

Used by agents for **semantic codebase search** and **dependency analysis**:

```
// Agent can now:
1. Find where permissions are enforced
2. Trace component dependencies
3. Map milestone state machine flows
4. Identify impact of refactoring
5. Validate architectural decisions against actual code
```

**Agents using it:** dev, architect, tech-writer, analyst

### Figma Integration

Used by UX designer for **design-to-code** workflows:

```
// Agent can:
1. Link Figma components to shadcn-vue
2. Extract design context (colors, spacing, typography)
3. Generate reference code from designs
4. Map Code Connect metadata
```

---

## FAQ

**Q: Can I modify the base config?**
A: No, it gets regenerated on every BMAD install. Use `_bmad/custom/config.toml` (team) and `_bmad/custom/config.user.toml` (personal) instead.

**Q: Can I change an agent's personality?**
A: Yes! Edit the agent's `description` or `enhanced_description` in `_bmad/custom/config.toml`.

**Q: How do agents know the TAMM tech stack?**
A: They read `CLAUDE.md` (listed in team config) which contains all tech stack, patterns, and rules.

**Q: What if I disagree with a persistent fact?**
A: Update it in your personal config (`config.user.toml`). Your personal facts override team facts.

**Q: Do I need to reload BMAD after changing config?**
A: No, changes take effect immediately on the next agent invocation.

**Q: Can I disable an agent?**
A: Comment out its block in `_bmad/custom/config.toml` or just don't invoke it.

---

## Next Steps

1. **Verify the config** — run `/bmad-help` to see if agents show your preferences
2. **Test a skill** — try `bmad-create-prd` or `bmad-create-epics-and-stories` to see agents in action
3. **Adjust as needed** — if an agent's style doesn't match your preference, edit the config
4. **Share with team** — commit `_bmad/custom/config.toml` so the team gets the same agents and settings

---

*Configuration created: 2026-05-06*
*TAMM Project Version: 1.0*
*Frontend Team Lead: Majed Sief Alnasr*
