# RTK Setup & Configuration — Per-Project Integration

**Skill**: `rtk-setup`  
**Purpose**: Install, configure, and enable RTK (Rust Token Killer) for a project so all AI tools (Claude Code, Copilot, Cursor, Opencode) can leverage token optimization (60-90% savings).

---

## What is RTK?

RTK is a token-optimized CLI proxy that intercepts common commands and rewrites them for efficiency:
- `git status` → optimized version (60-90% token savings)
- `git log` → filtered, concise output
- `npm test` → abbreviated results
- Works transparently via hooks — no manual invocation needed

**Result**: Faster responses, lower costs, same functionality.

---

## Prerequisites

- [ ] RTK binary installed globally: `rtk --version` works
- [ ] Project has a `.claude/` directory
- [ ] Project is a git repository
- [ ] Zsh or Bash shell (RTK supports both)

If RTK isn't installed:
```bash
brew install rtk-ai/rtk/rtk  # macOS
# or visit https://github.com/rtk-ai/rtk for other platforms
```

---

## Setup Flow (Choose One)

### Option A: Global Setup (Recommended First-Time)

RTK works **globally** once installed — all projects inherit it automatically via shell hooks.

**Step 1: Verify installation**
```bash
rtk --version        # Should output: rtk X.Y.Z
rtk gain             # Should show: token savings analytics
```

**Step 2: Verify hook is active**
```bash
# Check if RTK hook is in your shell profile
grep -i "rtk" ~/.zshrc  # or ~/.bashrc

# If not found, RTK installer should have added it
# It looks like: eval "$(rtk hook zsh)" or similar
```

**Result**: All projects automatically use RTK via shell hooks. Done.

---

### Option B: Project-Based Setup (For Specific Projects)

Use this if you want explicit per-project control or global setup didn't work.

**Step 1: Create project RTK config**
```bash
# Inside project root
mkdir -p .claude/rtk
touch .claude/rtk/.env.local
```

**Step 2: Add to `.claude/rtk/.env.local`**
```bash
# RTK Configuration
RTK_ENABLED=true
RTK_BINARY=$(which rtk)
RTK_GAIN_DISPLAY=true
```

**Step 3: Wire into your shell (add to `.zshrc` or `.bashrc`)**
```bash
# RTK per-project integration
if [ -f "./.claude/rtk/.env.local" ]; then
  source ./.claude/rtk/.env.local
  if [ -n "$RTK_ENABLED" ]; then
    eval "$(${RTK_BINARY:-rtk} hook zsh)"
  fi
fi
```

**Step 4: Reload shell**
```bash
source ~/.zshrc  # or ~/.bashrc
```

**Result**: RTK is active for this project only when you're in the project directory.

---

## Verify Setup

Run these commands to confirm RTK is working:

```bash
# 1. Check RTK is installed
rtk --version

# 2. View token savings from your command history
rtk gain
rtk gain --history

# 3. Discover missed optimization opportunities
rtk discover

# 4. Test a command (should be intercepted by RTK)
git status          # Should use RTK's optimized version
git log --oneline   # Should use RTK's optimized version
```

**Expected output for `rtk gain`:**
```
RTK Token Savings Report
========================
Total commands: 42
Total savings: ~2,850 tokens (68% reduction)
Most used: git status (12x)
```

---

## Configuration for AI Tools

### Claude Code
Already configured — RTK hook is active in your shell. Commands run through Claude Code automatically use RTK.

### Copilot (VS Code)
1. Open VS Code settings: `Cmd+,` (macOS) or `Ctrl+,` (Windows/Linux)
2. Search: `terminal.integrated.shellArgs`
3. Ensure default shell is Zsh or Bash (not PowerShell)
4. RTK hook should activate automatically from your shell profile

### Cursor
Same as Copilot — uses your system shell, inherits RTK from shell profile.

### Opencode
1. Check Opencode's terminal settings
2. Verify it uses your system shell (Zsh/Bash)
3. RTK hook should be inherited

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `rtk: command not found` | Install RTK: `brew install rtk-ai/rtk/rtk` |
| `rtk gain` shows "0 commands" | RTK hook not active in current shell. Run `eval "$(rtk hook zsh)"` manually, then test. |
| Commands not being optimized | Check RTK hook is in `~/.zshrc`: `grep "rtk hook" ~/.zshrc`. If missing, add it. |
| Conflicting with another RTK | You may have `reachingforthejack/rtk` (Rust Type Kit). Uninstall: `brew uninstall rtk`. Then install correct one: `brew install rtk-ai/rtk/rtk` |
| Still not working after setup | Run `rtk proxy <cmd>` to bypass hooks and debug: `rtk proxy git status` |

---

## Project-Level Documentation

After setup, document in your project:

**Add to `CLAUDE.md`** (or `.claude/RTK.md`):
```markdown
## RTK Token Optimization

This project uses RTK for 60-90% token savings on CLI operations.

### Verify it's active
\`\`\`bash
rtk gain  # Shows savings analytics
\`\`\`

### Available commands
- `rtk gain` — Show cumulative token savings
- `rtk gain --history` — Show per-command savings
- `rtk discover` — Find commands that could be optimized
- `rtk proxy <cmd>` — Run command without RTK (debugging)

### For AI tools
All tools (Claude Code, Copilot, Cursor, Opencode) automatically inherit RTK from shell hooks.
No additional configuration needed.
```

---

## Usage Patterns

### For AI Tools

Commands typed in Claude Code / Copilot / Cursor automatically go through RTK:

```bash
# All of these are optimized by RTK automatically
git status
git log --oneline -20
npm test
npm ls
pnpm dlx
find . -name "*.ts"
grep -r "function"
```

### For Humans

Use meta commands to monitor savings:

```bash
# View analytics
rtk gain
rtk gain --history

# Discover optimization opportunities
rtk discover

# Debug — run without optimization
rtk proxy git status
```

---

## Next Steps

1. **Verify setup is working** — run `rtk gain` and confirm non-zero savings
2. **Add to CLAUDE.md** — document RTK in your project's guidelines
3. **Teach your team** — share this skill so everyone benefits
4. **Monitor savings** — periodically run `rtk gain --history` to see cumulative impact

---

## Reference

- **Official repo**: https://github.com/rtk-ai/rtk
- **Installation**: https://github.com/rtk-ai/rtk#installation
- **Global config**: `~/.claude/RTK.md` (user's global instructions)
- **Project config**: `.claude/RTK.md` (project-specific overrides, if any)

---

*RTK Setup Skill v1.0 — Last updated 2026-05-09*
*For questions: Check GitHub issues or your RTK.md docs*
