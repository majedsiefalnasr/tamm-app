import { ref } from 'vue'

export interface FinanceOverviewStats {
  platformRevenueEgp: number
  pendingWithdrawalsEgp: number
  settledPayoutsEgp: number
}

/**
 * // TODO: replace mock — GET admin finance summary when in docs/api-contracts.md
 */
export function useFinanceOverviewWorkspace() {
  const stats = ref<FinanceOverviewStats | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchOverview(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      await new Promise<void>(resolve => {
        setTimeout(resolve, 400)
      })
      stats.value = {
        platformRevenueEgp: 0,
        pendingWithdrawalsEgp: 0,
        settledPayoutsEgp: 0,
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e ?? 'unknown')
    } finally {
      loading.value = false
    }
  }

  return { stats, loading, error, fetchOverview }
}
