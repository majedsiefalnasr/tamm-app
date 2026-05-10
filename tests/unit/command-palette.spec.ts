import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  COMMAND_PALETTE_MAX_RECENTS,
  COMMAND_PALETTE_RECENTS_KEY,
  mergeRecentHrefs,
  readRecentHrefsFromStorage,
  recordRecentHref,
  writeRecentHrefsToStorage,
  isEditableShortcutTarget,
  shouldBlockPaletteShortcut,
} from '~/utils/commandPalette'

describe('mergeRecentHrefs', () => {
  it('dedupes and caps length', () => {
    expect(mergeRecentHrefs(['/a', '/b'], '/b', 3)).toEqual(['/b', '/a'])
    expect(mergeRecentHrefs([], '/x', COMMAND_PALETTE_MAX_RECENTS)).toEqual([
      '/x',
    ])
    const long = mergeRecentHrefs(
      ['/1', '/2', '/3', '/4', '/5', '/6', '/7', '/8', '/9'],
      '/new',
      COMMAND_PALETTE_MAX_RECENTS
    )
    expect(long).toHaveLength(COMMAND_PALETTE_MAX_RECENTS)
    expect(long[0]).toBe('/new')
  })
})

describe('localStorage recents', () => {
  beforeEach(() => {
    localStorage.clear()
  })
  afterEach(() => {
    localStorage.clear()
  })

  it('read/write round-trip', () => {
    writeRecentHrefsToStorage(['/dashboard', '/projects'])
    expect(readRecentHrefsFromStorage()).toEqual(['/dashboard', '/projects'])
  })

  it('recordRecentHref prepends unique href', () => {
    recordRecentHref('/a')
    recordRecentHref('/b')
    recordRecentHref('/a')
    expect(readRecentHrefsFromStorage()[0]).toBe('/a')
    expect(readRecentHrefsFromStorage()[1]).toBe('/b')
  })

  it('uses stable storage key', () => {
    recordRecentHref('/z')
    expect(localStorage.getItem(COMMAND_PALETTE_RECENTS_KEY)).toBeTruthy()
  })
})

describe('shortcut guard targets', () => {
  it('detects inputs and textareas', () => {
    const wrap = document.createElement('div')
    document.body.appendChild(wrap)
    const input = document.createElement('input')
    wrap.appendChild(input)
    expect(isEditableShortcutTarget(input)).toBe(true)
    expect(isEditableShortcutTarget(document.body)).toBe(false)
    wrap.remove()
  })

  it('allows shortcut past editable targets only when palette is open', () => {
    const input = document.createElement('input')
    expect(shouldBlockPaletteShortcut(input, false)).toBe(true)
    expect(shouldBlockPaletteShortcut(input, true)).toBe(false)
    expect(shouldBlockPaletteShortcut(document.body, false)).toBe(false)
  })
})
