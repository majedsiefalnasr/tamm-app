// @vitest-environment node

/**
 * Epic 09 guardrail: TAMM-owned Vue must use logical Tailwind (ms/ps/start/end),
 * not physical ml/pl/left/right/text-left/etc. Vendor `app/components/ui/**` is excluded.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const APP_ROOT = join(__dirname, '../../../app')
const REPO_ROOT = join(__dirname, '../../..')

/** Mirrors `_bmad-output/implementation-artifacts/09-01-audit-shadcn-gaps-and-cli-plan.md` RTL grep. */
const PHYSICAL_TAILWIND_RE =
  /\b(ml-|mr-|pl-|pr-|left-|right-|text-left|text-right|border-l-|border-r-|rounded-l-|rounded-r-)/

function collectTamVueFiles(dir: string): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    const rel = relative(APP_ROOT, full).replace(/\\/g, '/')
    if (rel === 'components/ui' || rel.startsWith('components/ui/')) continue

    const st = statSync(full)
    if (st.isDirectory()) {
      out.push(...collectTamVueFiles(full))
    } else if (name.endsWith('.vue')) {
      out.push(full)
    }
  }
  return out
}

describe('RTL guard — no physical directional Tailwind in TAMM Vue', () => {
  it('app/**/*.vue outside components/ui has zero forbidden utility matches per line', () => {
    const files = collectTamVueFiles(APP_ROOT)
    const violations: { file: string; line: number; snippet: string }[] = []

    for (const file of files) {
      const content = readFileSync(file, 'utf8')
      const lines = content.split(/\r?\n/)
      lines.forEach((line, idx) => {
        PHYSICAL_TAILWIND_RE.lastIndex = 0
        if (PHYSICAL_TAILWIND_RE.test(line)) {
          violations.push({
            file: relative(REPO_ROOT, file),
            line: idx + 1,
            snippet: line.trim().slice(0, 160),
          })
        }
      })
    }

    expect(violations, JSON.stringify(violations, null, 2)).toEqual([])
  })
})
