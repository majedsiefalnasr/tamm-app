# TAMM Frontend — Development Guide

## Local Development Setup

### Initial Setup

```bash
pnpm install
pnpm prepare
```

The `pnpm prepare` script installs Husky git hooks automatically.

---

## Code Quality

### Linting & Formatting

All code must pass linting and formatting checks before merging to `develop` or `main`.

#### Local Checks

Run these commands before committing:

```bash
# Lint code (shows issues)
pnpm lint

# Lint and fix auto-fixable issues
pnpm lint:fix

# Format code with Prettier
pnpm format

# Check formatting without changing files
pnpm format:check

# Type check
pnpm type:check
```

#### Automated Checks

**Pre-commit hook** (runs automatically on `git commit`):

- Runs `lint-staged` — lints only staged files
- Auto-fixes and stages changes
- Prevents committing code that doesn't pass linting

**Pre-push hook** (runs automatically on `git push`):

- Runs full `lint:fix`
- Runs `format`
- Runs type checking
- Prevents pushing broken code to remote

**GitHub CI/CD** (runs on every push and PR):

- Lint workflow: checks formatting and linting
- Build workflow: builds project and checks types
- Pre-commit workflow: runs on PRs

---

## Configuration Files

### ESLint (`.eslintrc.cjs`)

- **Parser**: Vue + TypeScript
- **Extends**: Nuxt default config + Prettier
- **Rules**:
  - No `any` types allowed
  - Explicit return types required (except Vue components)
  - `console.log` warnings (except `console.warn` and `console.error`)
  - Multi-word component names disabled (Nuxt 4 auto-imports work with single words)

### Prettier (`.prettierrc`)

- **Semi-colons**: Off
- **Quotes**: Single quotes
- **Tab width**: 2 spaces
- **Trailing commas**: ES5 compatible
- **Arrow parens**: Omitted when possible
- **Tailwind**: Automatic class sorting

### Lint-staged (`.lintstagedrc.json`)

Runs on pre-commit hook. Configuration:

- `.js, .jsx, .ts, .tsx, .vue` → ESLint fix + Prettier format
- `.json, .css, .md, .yaml, .yml` → Prettier format only

---

## GitHub Workflows

### 1. Lint & Format Check (`.github/workflows/lint.yml`)

**Triggers**: Push to develop/main, PRs to develop/main

**Steps**:

1. Checkout code
2. Setup Node.js 20.x with pnpm cache
3. Install dependencies
4. Check formatting with Prettier
5. Lint with ESLint

### 2. Build & Test (`.github/workflows/build.yml`)

**Triggers**: Push to develop/main, PRs to develop/main

**Steps**:

1. Checkout code
2. Setup Node.js 20.x with pnpm cache
3. Install dependencies
4. Build project (`pnpm build`)
5. Type check (`pnpm nuxt prepare`)
6. Upload build artifact

### 3. Pre-Commit Checks (`.github/workflows/pre-commit.yml`)

**Triggers**: PRs to develop/main

**Steps**:

1. Checkout code
2. Setup Node.js 20.x with pnpm cache
3. Install dependencies
4. Run lint-staged
5. Type checking (non-blocking)

---

## Best Practices

### Before Committing

1. **Run local checks**:

   ```bash
   pnpm lint:fix    # Auto-fix linting issues
   pnpm format      # Format code
   pnpm type:check  # Verify types
   ```

2. **Stage your changes**:

   ```bash
   git add .
   ```

3. **Commit** (pre-commit hook runs automatically):

   ```bash
   git commit -m "feat: add new feature"
   ```

4. **Review the auto-fixed changes** in your editor

5. **Push** (pre-push hook runs automatically):
   ```bash
   git push
   ```

### Code Style Rules

#### TypeScript

- **No `any` types** — use proper types or `unknown` with proper narrowing
- **Explicit return types** on functions (except Vue setup/components)
- **Strict mode enabled** — all errors must be resolved

#### Vue Components

- **Use `<script setup lang="ts">`** only (no Options API)
- **Import types**: `import type { ... }`
- **Props must be typed** — no untyped props
- **Define emits with types**
- **No `v-html`** — use text content or components only

#### CSS & Tailwind

- **Use logical properties** only (RTL-safe):
  - `ms-*` / `me-*` instead of `ml-*` / `mr-*`
  - `ps-*` / `pe-*` instead of `pl-*` / `pr-*`
  - `border-s-*` / `border-e-*` instead of `border-l-*` / `border-r-*`
  - `text-start` / `text-end` instead of `text-left` / `text-right`

- **Tailwind v4 CSS-first config** — no `tailwind.config.js`

#### i18n

- **No hardcoded text** in templates — use i18n keys
- **Import from**: `~/locales/` or configure in setup

---

## Troubleshooting

### Pre-commit hook fails

**Issue**: Hook runs but doesn't auto-fix

**Solution**:

```bash
# Run manually
pnpm lint:fix
pnpm format

# Stage the changes
git add .

# Try committing again
git commit -m "message"
```

### Pre-push hook fails

**Issue**: Push blocked due to type or lint errors

**Solution**:

```bash
# Fix issues locally first
pnpm lint:fix
pnpm format
pnpm type:check

# Stage and commit fixes
git add .
git commit -m "fix: resolve linting and type errors"

# Push again
git push
```

### ESLint can't find files

**Issue**: ESLint complains about missing parser or plugins

**Solution**:

```bash
# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Clear ESLint cache
rm -rf .eslintcache

# Try linting again
pnpm lint
```

### Prettier overwrites code I like

**Issue**: Prettier formats code differently than expected

**Solution**:

- Prettier rules are defined in `.prettierrc`
- The Tailwind plugin automatically sorts Tailwind classes
- If you disagree with a rule, discuss with the team before changing `.prettierrc`

---

## Git Workflow

### Standard workflow:

```bash
# 1. Create a feature branch
git checkout -b feature/my-feature

# 2. Work on code
# ... edit files ...

# 3. Run local checks
pnpm lint:fix && pnpm format

# 4. Stage and commit (pre-commit hook runs)
git add .
git commit -m "feat: add my feature"

# 5. Push (pre-push hook runs)
git push origin feature/my-feature

# 6. Create PR on GitHub
# ... GitHub workflows run ...

# 7. When PR is merged, branch is cleaned up automatically
```

---

## Reference

- **ESLint**: https://eslint.org
- **Prettier**: https://prettier.io
- **Husky**: https://typicode.github.io/husky/
- **Lint-staged**: https://github.com/okonet/lint-staged
- **Nuxt**: https://nuxt.com
- **Tailwind CSS v4**: https://tailwindcss.com
