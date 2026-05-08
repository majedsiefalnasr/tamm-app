import { computed, ref, onUnmounted } from 'vue'
import type { Milestone } from '~/shared/types/project'
import type { Withdrawal, ContractorBalance } from '~/shared/types/payment'
import { derivePaymentStatus } from '~/utils/statusMachine'

// TODO: Replace with actual API calls when endpoints available
import {
  mockFetchWithdrawals,
  mockSubmitWithdrawalRequest,
  mockGetContractorBalance,
  mockGetWithdrawalCountdown,
} from './\_\_mocks\_\_/usePaymentsWithdrawals'

const POLLING_INTERVAL_MS = 30000 // 30 seconds

export const usePayments = () => {
  const { getMilestones } = useMilestones()
  const { projects } = useProjects()

  // Withdrawal state
  const withdrawals = ref<Withdrawal[]>([])
  const isLoadingWithdrawals = ref(false)
  const isSubmittingWithdrawal = ref(false)
  let pollingIntervalId: ReturnType<typeof setInterval> | null = null

  // Dashboard aggregates - all milestones across all projects
  const dashboardTotals = computed(() => {
    const allMilestones = projects.value.flatMap(project =>
      getMilestones(project.id)
    )

    const committed = allMilestones.reduce((sum, m) => sum + (m.amount || 0), 0)

    const inEscrow = allMilestones
      .filter(m => derivePaymentStatus(m.status) === 'paid')
      .reduce((sum, m) => sum + (m.amount || 0), 0)

    const paidOut = allMilestones
      .filter(m => derivePaymentStatus(m.status) === 'paid_out')
      .reduce((sum, m) => sum + (m.amount || 0), 0)

    return { committed, inEscrow, paidOut }
  })

  // Per-project financials
  const getProjectFinancials = (projectId: string) => {
    const projectMilestones = getMilestones(projectId)

    const value = projectMilestones.reduce((sum, m) => sum + (m.amount || 0), 0)

    const paid = projectMilestones
      .filter(m => {
        const status = derivePaymentStatus(m.status)
        return [
          'paid',
          'awaiting_approval',
          'ready_for_payout',
          'paid_out',
        ].includes(status)
      })
      .reduce((sum, m) => sum + (m.amount || 0), 0)

    const inEscrow = projectMilestones
      .filter(m => derivePaymentStatus(m.status) === 'paid')
      .reduce((sum, m) => sum + (m.amount || 0), 0)

    const remaining = Math.max(0, value - paid)

    return { value, paid, inEscrow, remaining }
  }

  // Withdrawal methods
  const fetchWithdrawals = async () => {
    isLoadingWithdrawals.value = true
    try {
      // TODO: Replace with: withdrawals.value = await $fetch('/withdrawals')
      withdrawals.value = await mockFetchWithdrawals()
    } catch (error) {
      console.error('Failed to fetch withdrawals:', error)
      throw error
    } finally {
      isLoadingWithdrawals.value = false
    }
  }

  const submitWithdrawalRequest = async (
    amount: number,
    iban: string,
    notes?: string
  ) => {
    isSubmittingWithdrawal.value = true
    try {
      // TODO: Replace with: return await $fetch('/withdrawals', { method: 'POST', body: { amount, iban, notes } })
      const withdrawal = await mockSubmitWithdrawalRequest(amount, iban, notes)
      // Optimistic update already done in mock, but refresh list to ensure consistency
      await fetchWithdrawals()
      return withdrawal
    } catch (error) {
      console.error('Failed to submit withdrawal request:', error)
      throw error
    } finally {
      isSubmittingWithdrawal.value = false
    }
  }

  const getContractorBalance = (): ContractorBalance => {
    const allMilestones = projects.value.flatMap(project =>
      getMilestones(project.id)
    )
    // TODO: Replace with actual balance calculation from API when withdrawal data comes from backend
    return mockGetContractorBalance(allMilestones)
  }

  const getWithdrawalCountdown = (approvedAt: string): number => {
    // TODO: Could optimize by using backend-provided countdown field
    return mockGetWithdrawalCountdown(approvedAt)
  }

  const startWithdrawalPolling = () => {
    // Don't start multiple polling intervals
    if (pollingIntervalId !== null) return

    // Initial fetch
    fetchWithdrawals()

    // Poll every 30 seconds
    pollingIntervalId = setInterval(() => {
      fetchWithdrawals()
    }, POLLING_INTERVAL_MS)
  }

  const stopWithdrawalPolling = () => {
    if (pollingIntervalId !== null) {
      clearInterval(pollingIntervalId)
      pollingIntervalId = null
    }
  }

  // Cleanup polling when composable is unmounted
  onUnmounted(() => {
    stopWithdrawalPolling()
  })

  return {
    dashboardTotals,
    getProjectFinancials,
    // Withdrawal state
    withdrawals,
    isLoadingWithdrawals,
    isSubmittingWithdrawal,
    // Withdrawal methods
    fetchWithdrawals,
    submitWithdrawalRequest,
    getContractorBalance,
    getWithdrawalCountdown,
    // Withdrawal polling
    startWithdrawalPolling,
    stopWithdrawalPolling,
  }
}
