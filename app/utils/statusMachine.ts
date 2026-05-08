// Status machine for validating transitions in TAMM
// Source of truth: docs/status-flows.md

export function canTransition(
  entity: 'project' | 'milestone' | 'payment',
  from: string,
  to: string
): boolean {
  if (entity === 'project') {
    const validTransitions: Record<string, string[]> = {
      new: ['open_for_bids'],
      open_for_bids: ['under_review'],
      under_review: ['contractor_selected'],
      contractor_selected: ['active'],
      active: ['on_hold', 'completed'],
      on_hold: ['active'],
      completed: [],
    }
    return validTransitions[from]?.includes(to) ?? false
  }

  if (entity === 'milestone') {
    const validTransitions: Record<string, string[]> = {
      not_started: ['in_progress'],
      in_progress: ['under_review'],
      under_review: ['supervisor_approved', 'rejected'],
      supervisor_approved: ['approved', 'rejected'],
      approved: [],
      rejected: ['in_progress'],
    }
    return validTransitions[from]?.includes(to) ?? false
  }

  if (entity === 'payment') {
    const validTransitions: Record<string, string[]> = {
      pending_payment: ['paid'],
      paid: ['awaiting_approval'],
      awaiting_approval: ['ready_for_payout'],
      ready_for_payout: ['paid_out'],
      paid_out: [],
    }
    return validTransitions[from]?.includes(to) ?? false
  }

  return false
}
