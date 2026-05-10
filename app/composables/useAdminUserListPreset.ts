import { ref, watch, readonly } from 'vue'

// TODO: replace localStorage with API-backed user preference when server endpoint exists.

/** localStorage key for admin Users table preset (Story 10-04). */
export const ADMIN_USER_LIST_TABLE_PRESET_KEY = 'tamm.admin.users.tablePreset'

export type AdminUserListTablePreset = 'default' | 'compact' | 'minimal'

const VALID_PRESETS: readonly AdminUserListTablePreset[] = [
  'default',
  'compact',
  'minimal',
]

export function parseAdminUserListTablePreset(
  raw: string | null
): AdminUserListTablePreset {
  if (!raw) return 'default'
  const v = raw.trim()
  return VALID_PRESETS.includes(v as AdminUserListTablePreset)
    ? (v as AdminUserListTablePreset)
    : 'default'
}

function readStoredPreset(): AdminUserListTablePreset {
  if (typeof localStorage === 'undefined') return 'default'
  try {
    return parseAdminUserListTablePreset(
      localStorage.getItem(ADMIN_USER_LIST_TABLE_PRESET_KEY)
    )
  } catch {
    return 'default'
  }
}

export function useAdminUserListPreset() {
  const preset = ref<AdminUserListTablePreset>(readStoredPreset())

  watch(
    preset,
    val => {
      if (typeof localStorage === 'undefined') return
      try {
        localStorage.setItem(ADMIN_USER_LIST_TABLE_PRESET_KEY, val)
      } catch {
        /* quota / privacy mode */
      }
    },
    { flush: 'post' }
  )

  function setPreset(next: AdminUserListTablePreset) {
    preset.value = next
  }

  return {
    preset: readonly(preset),
    setPreset,
  }
}
