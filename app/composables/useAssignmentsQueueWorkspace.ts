import { ref } from 'vue'

/** Row for admin/supervisor assignment queue UI. */
export interface AssignmentQueueRow {
  id: string
  projectId: string
  projectName: string
  milestoneId: string
  milestoneName: string
  statusKey: string
  updatedAt: string
}

/**
 * Assignment queue for `/assignments` (admin / supervisor roles).
 * // TODO: replace mock — wire to assignments admin API when marked Available in docs/api-contracts.md
 */
export function useAssignmentsQueueWorkspace() {
  const rows = ref<AssignmentQueueRow[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchQueue(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      await new Promise<void>(resolve => {
        setTimeout(resolve, 450)
      })
      rows.value = []
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e ?? 'unknown')
    } finally {
      loading.value = false
    }
  }

  return {
    rows,
    loading,
    error,
    fetchQueue,
  }
}
