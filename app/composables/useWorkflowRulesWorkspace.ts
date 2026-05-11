import { ref } from 'vue'

export interface WorkflowRuleRow {
  id: string
  name: string
  appliesTo: string
  updatedAt: string
}

/**
 * // TODO: replace mock — GET workflow rules when in docs/api-contracts.md
 */
export function useWorkflowRulesWorkspace() {
  const rules = ref<WorkflowRuleRow[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchRules(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      await new Promise<void>(resolve => {
        setTimeout(resolve, 400)
      })
      rules.value = []
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e ?? 'unknown')
    } finally {
      loading.value = false
    }
  }

  return { rules, loading, error, fetchRules }
}
