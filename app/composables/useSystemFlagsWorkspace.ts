import { ref } from 'vue'

export interface SystemFlagRow {
  id: string
  key: string
  enabled: boolean
  description: string
  updatedAt: string
}

/**
 * // TODO: replace mock — GET system flags when in docs/api-contracts.md
 */
export function useSystemFlagsWorkspace() {
  const flags = ref<SystemFlagRow[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchFlags(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      await new Promise<void>(resolve => {
        setTimeout(resolve, 400)
      })
      flags.value = []
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e ?? 'unknown')
    } finally {
      loading.value = false
    }
  }

  return { flags, loading, error, fetchFlags }
}
