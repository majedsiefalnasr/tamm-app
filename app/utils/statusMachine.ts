// Status machine for validating transitions in TAMM
// Source of truth: docs/status-flows.md

export function canTransition(
  entity:
    | 'project'
    | 'milestone'
    | 'payment'
    | 'withdrawal'
    | 'task'
    | 'field_report'
    | 'report'
    | 'approval'
    | 'assignment',
  from: string,
  to: string
): boolean {
  if (entity === 'project') {
    const validTransitions: Record<string, string[]> = {
      draft: ['pending_admin_approval'],
      pending_admin_approval: ['approved', 'cancelled'],
      approved: ['supervisor_assigned', 'on_hold', 'cancelled'],
      supervisor_assigned: ['supervisor_accepted', 'approved', 'on_hold'],
      supervisor_accepted: [
        'milestones_being_created',
        'milestones_ready',
        'in_progress',
        'on_hold',
      ],
      milestones_being_created: ['milestones_ready', 'on_hold'],
      milestones_ready: [
        'awaiting_bids',
        'bid_accepted',
        'in_progress',
        'on_hold',
      ],
      awaiting_bids: ['bid_accepted', 'on_hold', 'cancelled'],
      bid_accepted: ['in_progress', 'on_hold'],
      in_progress: ['on_hold', 'completed', 'disputed', 'cancelled'],
      on_hold: ['in_progress', 'cancelled'],
      disputed: ['in_progress', 'cancelled', 'completed'],
      completed: [],
      cancelled: [],
    }
    return validTransitions[from]?.includes(to) ?? false
  }

  if (entity === 'milestone') {
    const validTransitions: Record<string, string[]> = {
      draft: ['submitted'],
      submitted: ['under_review'],
      under_review: ['approved', 'rejected'],
      approved: [],
      rejected: ['draft'],
    }
    return validTransitions[from]?.includes(to) ?? false
  }

  if (entity === 'payment') {
    const validTransitions: Record<string, string[]> = {
      pending: ['awaiting_release'],
      awaiting_release: ['processing'],
      processing: ['paid', 'failed'],
      failed: ['pending'],
      paid: [],
    }
    return validTransitions[from]?.includes(to) ?? false
  }

  if (entity === 'withdrawal') {
    const validTransitions: Record<string, string[]> = {
      pending: ['under_review', 'cancelled'],
      under_review: ['approved', 'rejected'],
      approved: ['processing'],
      processing: ['completed'],
      completed: [],
      rejected: [],
      cancelled: [],
    }
    return validTransitions[from]?.includes(to) ?? false
  }

  if (entity === 'task') {
    const validTransitions: Record<string, string[]> = {
      pending: ['in_progress'],
      in_progress: ['completed'],
      completed: ['approved', 'rejected'],
      approved: [],
      rejected: ['in_progress'],
    }
    return validTransitions[from]?.includes(to) ?? false
  }

  if (entity === 'field_report' || entity === 'report') {
    const validTransitions: Record<string, string[]> = {
      draft: ['submitted'],
      submitted: ['under_review', 'approved', 'rejected', 'request_changes'],
      under_review: ['approved', 'rejected', 'request_changes'],
      request_changes: ['draft'],
      rejected: ['draft'],
      approved: [],
    }
    return validTransitions[from]?.includes(to) ?? false
  }

  if (entity === 'approval') {
    const validTransitions: Record<string, string[]> = {
      pending: ['approved', 'rejected', 'cancelled'],
      approved: [],
      rejected: [],
      cancelled: [],
    }
    return validTransitions[from]?.includes(to) ?? false
  }

  if (entity === 'assignment') {
    const validTransitions: Record<string, string[]> = {
      pending: ['accepted', 'rejected'],
      accepted: ['revoked'],
      rejected: [],
      revoked: [],
    }
    return validTransitions[from]?.includes(to) ?? false
  }

  return false
}

export const PAYMENT_STATUS_META = {
  pending: {
    label: 'payment.status.pending',
    color: 'muted',
    icon: 'Clock',
  },
  awaiting_release: {
    label: 'payment.status.awaiting_release',
    color: 'info',
    icon: 'Clock',
  },
  processing: {
    label: 'payment.status.processing',
    color: 'accent',
    icon: 'Clock',
  },
  paid: { label: 'payment.status.paid', color: 'primary', icon: 'CheckCircle' },
  failed: {
    label: 'payment.status.failed',
    color: 'danger',
    icon: 'XCircle',
  },
} as const

export const WITHDRAWAL_STATUS_META = {
  pending: {
    label: 'withdrawal.status.pending',
    tone: 'accent',
    icon: 'Clock',
  },
  under_review: {
    label: 'withdrawal.status.under_review',
    tone: 'info',
    icon: 'Clock',
  },
  approved: {
    label: 'withdrawal.status.approved',
    tone: 'info',
    icon: 'CheckCircle',
  },
  processing: {
    label: 'withdrawal.status.processing',
    tone: 'primary',
    icon: 'CheckCircle',
  },
  completed: {
    label: 'withdrawal.status.completed',
    tone: 'primary',
    icon: 'CheckCircle2',
  },
  rejected: {
    label: 'withdrawal.status.rejected',
    tone: 'danger',
    icon: 'XCircle',
  },
  cancelled: {
    label: 'withdrawal.status.cancelled',
    tone: 'muted',
    icon: 'XCircle',
  },
} as const

export function derivePaymentStatus(milestoneStatus: string): string {
  const mapping: Record<string, string> = {
    draft: 'pending',
    submitted: 'awaiting_release',
    under_review: 'processing',
    approved: 'processing',
    rejected: 'pending',
    in_progress: 'paid',
  }
  return mapping[milestoneStatus] || 'pending'
}
