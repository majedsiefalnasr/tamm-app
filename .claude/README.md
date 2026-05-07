# Claude Code Configuration — TAMM

## Quick Start

1. **Read first:** [AGENTS.md](../AGENTS.md) — single source of truth for all AI tools
2. **Read second:** [CLAUDE.md](../CLAUDE.md) — deep-dive context for Claude Code users

## File Map

```
tamm-app/
├── AGENTS.md                        ← START HERE (universal, all tools)
├── CLAUDE.md                        ← Deep-dive context (Claude Code)
└── .claude/
    ├── README.md                    ← You are here
    └── rules/                       ← Empty (rules live in AGENTS.md)
```

## How AGENTS.md and CLAUDE.md Work Together

### AGENTS.md (Root)
- **Reads:** All AI tools (Claude Code, Cursor, Copilot, OpenCode)
- **Contains:** Core rules, behavioral guidelines, tech stack, TAMM project context
- **Length:** ~300 lines
- **Purpose:** Single source of truth

### CLAUDE.md (Root)
- **Reads:** Claude Code (supplementary)
- **Contains:** Deep-dive TAMM architecture, extensive examples, design system details
- **Length:** ~500+ lines
- **Purpose:** Extended context for Claude Code users who want to understand everything

## How to Update AI Instructions

### Adding a Universal Rule (All Tools Should Know)

Edit [AGENTS.md](../AGENTS.md) — that's it.

Examples:
- "Never use arrow functions in Pinia stores"
- "Always validate status transitions before API calls"
- "TypeScript strict mode is required"

### Adding Claude Code-Specific Context

Edit [CLAUDE.md](../CLAUDE.md).

Examples:
- Detailed architecture walkthroughs
- Component design patterns
- API integration deep-dives
- Full code examples

### If You Add a New Tool (e.g., Copilot)

No new files needed. All tools already read [AGENTS.md](../AGENTS.md).

Optional: Create `.github/copilot-instructions.md` with tool-specific hints if needed.

## Why This Structure?

✅ **Industry standard** — AGENTS.md is the unified format (Google, OpenAI, Factory, Cursor)  
✅ **Single source of truth** — no instruction drift across tools  
✅ **No duplication** — one file, not three  
✅ **Git-friendly** — easy to review and track changes  
✅ **Tool-aware** — all tools read AGENTS.md automatically  

## Testing the Setup

Verify all tools can find the config:

```bash
# Check AGENTS.md exists and is readable
cat AGENTS.md | head -5

# Check CLAUDE.md references AGENTS.md
grep "AGENTS.md" CLAUDE.md

# Check OpenCode config points to AGENTS.md
cat .config/opencode/AGENTS.md
```

## Questions?

- "What are the never/always rules?" → [AGENTS.md](../AGENTS.md) §3
- "How is TAMM structured?" → [AGENTS.md](../AGENTS.md) §4 or [CLAUDE.md](../CLAUDE.md)
- "What's the API contract?" → [docs/api-contracts.md](../docs/api-contracts.md)
- "How do I add a shadcn component?" → [AGENTS.md](../AGENTS.md) §4
