import { ref } from 'vue'

export interface SystemLogRow {
  id: string
  level: 'info' | 'warning' | 'error'
  message: string
  source: string
  createdAt: string
}

/**
 * // TODO: replace mock — GET audit/system logs when in docs/api-contracts.md
 */
export function useSystemLogsWorkspace() {
  const logs = ref<SystemLogRow[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchLogs(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      await new Promise<void>(resolve => {
        setTimeout(resolve, 400)
      })
      logs.value = []
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e ?? 'unknown')
    } finally {
      loading.value = false
    }
  }

  return { logs, loading, error, fetchLogs }
}
