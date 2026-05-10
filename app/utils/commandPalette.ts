/** localStorage key for palette navigation recents (Story 10-01). */
export const COMMAND_PALETTE_RECENTS_KEY = 'tamm.commandPalette.recents'

export const COMMAND_PALETTE_MAX_RECENTS = 8

export function mergeRecentHrefs(
  existing: readonly string[],
  href: string,
  max: number
): string[] {
  const next = [href, ...existing.filter(h => h !== href)]
  return next.slice(0, max)
}

export function readRecentHrefsFromStorage(): string[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(COMMAND_PALETTE_RECENTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((x): x is string => typeof x === 'string')
  } catch {
    return []
  }
}

export function writeRecentHrefsToStorage(hrefs: string[]): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(COMMAND_PALETTE_RECENTS_KEY, JSON.stringify(hrefs))
}

export function recordRecentHref(href: string): void {
  const merged = mergeRecentHrefs(
    readRecentHrefsFromStorage(),
    href,
    COMMAND_PALETTE_MAX_RECENTS
  )
  writeRecentHrefsToStorage(merged)
}

/** Skip global Ctrl/Cmd+K when focus is in text fields (preserve native behavior while palette is closed). */
export function isEditableShortcutTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false
  const el = target.closest(
    'input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"], [role="textbox"]'
  )
  return el !== null
}

export function shouldBlockPaletteShortcut(
  target: EventTarget | null,
  paletteOpen: boolean
): boolean {
  if (!isEditableShortcutTarget(target)) return false
  return !paletteOpen
}
