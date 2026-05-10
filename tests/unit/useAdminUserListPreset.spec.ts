import { describe, it, expect, beforeEach, vi } from 'vitest'
import { nextTick } from 'vue'
import {
  ADMIN_USER_LIST_TABLE_PRESET_KEY,
  parseAdminUserListTablePreset,
  useAdminUserListPreset,
} from '~/composables/useAdminUserListPreset'

describe('parseAdminUserListTablePreset', () => {
  it('returns default for empty / invalid', () => {
    expect(parseAdminUserListTablePreset(null)).toBe('default')
    expect(parseAdminUserListTablePreset('')).toBe('default')
    expect(parseAdminUserListTablePreset('bogus')).toBe('default')
  })

  it('accepts valid presets', () => {
    expect(parseAdminUserListTablePreset('compact')).toBe('compact')
    expect(parseAdminUserListTablePreset('minimal')).toBe('minimal')
    expect(parseAdminUserListTablePreset('default')).toBe('default')
  })
})

describe('useAdminUserListPreset', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('hydrates from localStorage on creation', () => {
    localStorage.setItem(ADMIN_USER_LIST_TABLE_PRESET_KEY, 'minimal')
    const { preset } = useAdminUserListPreset()
    expect(preset.value).toBe('minimal')
  })

  it('persists when preset changes', async () => {
    const { preset, setPreset } = useAdminUserListPreset()
    expect(preset.value).toBe('default')
    setPreset('compact')
    await nextTick()
    expect(localStorage.getItem(ADMIN_USER_LIST_TABLE_PRESET_KEY)).toBe(
      'compact'
    )
  })

  it('handles localStorage.setItem throwing', async () => {
    const spy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new DOMException('quota')
      })
    const { setPreset } = useAdminUserListPreset()
    expect(() => setPreset('minimal')).not.toThrow()
    spy.mockRestore()
  })
})
