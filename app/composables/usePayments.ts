import { computed } from 'vue'
import type { Milestone } from '~/shared/types/project'
import { derivePaymentStatus } from '~/utils/statusMachine'

export const usePayments = () => {
  const { getMilestones } = useMilestones()
  const { projects } = useProjects()

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

  return {
    dashboardTotals,
    getProjectFinancials,
  }
}
