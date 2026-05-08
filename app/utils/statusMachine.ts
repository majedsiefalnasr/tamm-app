// Status machine for validating transitions in TAMM
// Source of truth: docs/status-flows.md

export function canTransition(
  entity: 'project' | 'milestone' | 'payment' | 'withdrawal',
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

  if (entity === 'withdrawal') {
    const validTransitions: Record<string, string[]> = {
      pending: ['approved', 'rejected'],
      approved: ['withdrawable'],
      withdrawable: ['paid'],
      rejected: [],
      paid: [],
    }
    return validTransitions[from]?.includes(to) ?? false
  }

  return false
}

export const PAYMENT_STATUS_META = {
  pending_payment: {
    label: 'payment.status.pending_payment',
    color: 'muted',
    icon: 'Clock',
  },
  paid: { label: 'payment.status.paid', color: 'info', icon: 'Lock' },
  awaiting_approval: {
    label: 'payment.status.awaiting_approval',
    color: 'accent',
    icon: 'Clock',
  },
  ready_for_payout: {
    label: 'payment.status.ready_for_payout',
    color: 'accent',
    icon: 'CheckCircle',
  },
  paid_out: {
    label: 'payment.status.paid_out',
    color: 'primary',
    icon: 'CheckCircle',
  },
} as const

export const WITHDRAWAL_STATUS_META = {
  pending: {
    label: 'withdrawal.status.pending',
    tone: 'accent',
    icon: 'Clock',
  },
  approved: {
    label: 'withdrawal.status.approved',
    tone: 'info',
    icon: 'CheckCircle',
  },
  withdrawable: {
    label: 'withdrawal.status.withdrawable',
    tone: 'primary',
    icon: 'CheckCircle',
  },
  rejected: {
    label: 'withdrawal.status.rejected',
    tone: 'danger',
    icon: 'XCircle',
  },
  paid: {
    label: 'withdrawal.status.paid',
    tone: 'primary',
    icon: 'CheckCircle2',
  },
} as const

export function derivePaymentStatus(milestoneStatus: string): string {
  const mapping: Record<string, string> = {
    not_started: 'pending_payment',
    in_progress: 'paid',
    under_review: 'paid',
    supervisor_approved: 'awaiting_approval',
    approved: 'ready_for_payout',
  }
  return mapping[milestoneStatus] || 'pending_payment'
}
