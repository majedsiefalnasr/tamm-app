// Status machine — single source of truth for valid transitions
// Reference: docs/status-flows.md

export type ProjectStatus =
  | 'draft'
  | 'pending_admin_approval'
  | 'approved'
  | 'supervisor_assigned'
  | 'supervisor_accepted'
  | 'milestones_being_created'
  | 'milestones_ready'
  | 'awaiting_bids'
  | 'bid_accepted'
  | 'in_progress'
  | 'on_hold'
  | 'completed'
  | 'cancelled'
  | 'disputed'

export type MilestoneStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'

export type TaskStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'approved'
  | 'rejected'

export type PaymentStatus =
  | 'pending'
  | 'awaiting_release'
  | 'processing'
  | 'paid'
  | 'failed'

export type FieldReportStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'request_changes'

export type WithdrawalStatus =
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'processing'
  | 'completed'
  | 'rejected'
  | 'cancelled'

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export type AssignmentStatus = 'pending' | 'accepted' | 'rejected' | 'revoked'

// Project status transitions (docs/status-flows.md §2)
const projectTransitions: Record<ProjectStatus, ProjectStatus[]> = {
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
  milestones_ready: ['awaiting_bids', 'bid_accepted', 'in_progress', 'on_hold'],
  awaiting_bids: ['bid_accepted', 'on_hold', 'cancelled'],
  bid_accepted: ['in_progress', 'on_hold'],
  in_progress: ['on_hold', 'completed', 'disputed', 'cancelled'],
  on_hold: ['in_progress', 'cancelled'],
  disputed: ['in_progress', 'cancelled', 'completed'],
  completed: [],
  cancelled: [],
}

// Milestone status transitions (docs/status-flows.md §1)
const milestoneTransitions: Record<MilestoneStatus, MilestoneStatus[]> = {
  draft: ['submitted'],
  submitted: ['under_review'],
  under_review: ['approved', 'rejected'],
  approved: [],
  rejected: ['draft'],
}

// Field report status transitions
const fieldReportTransitions: Record<FieldReportStatus, FieldReportStatus[]> = {
  draft: ['submitted'],
  submitted: ['under_review', 'approved', 'rejected', 'request_changes'],
  under_review: ['approved', 'rejected', 'request_changes'],
  approved: [],
  rejected: ['draft'],
  request_changes: ['draft'],
}

const paymentTransitions: Record<PaymentStatus, PaymentStatus[]> = {
  pending: ['awaiting_release'],
  awaiting_release: ['processing'],
  processing: ['paid', 'failed'],
  failed: ['pending'],
  paid: [],
}

const taskTransitions: Record<TaskStatus, TaskStatus[]> = {
  pending: ['in_progress'],
  in_progress: ['completed'],
  completed: ['approved', 'rejected'],
  approved: [],
  rejected: ['in_progress'],
}

const withdrawalTransitions: Record<WithdrawalStatus, WithdrawalStatus[]> = {
  pending: ['under_review', 'cancelled'],
  under_review: ['approved', 'rejected'],
  approved: ['processing'],
  processing: ['completed'],
  completed: [],
  rejected: [],
  cancelled: [],
}

const approvalTransitions: Record<ApprovalStatus, ApprovalStatus[]> = {
  pending: ['approved', 'rejected', 'cancelled'],
  approved: [],
  rejected: [],
  cancelled: [],
}

const assignmentTransitions: Record<AssignmentStatus, AssignmentStatus[]> = {
  pending: ['accepted', 'rejected'],
  accepted: ['revoked'],
  rejected: [],
  revoked: [],
}

type EntityType =
  | 'project'
  | 'milestone'
  | 'field_report'
  | 'report'
  | 'payment'
  | 'task'
  | 'withdrawal'
  | 'approval'
  | 'assignment'

export function canTransition(
  entityType: EntityType,
  fromStatus: string,
  toStatus: string
): boolean {
  if (entityType === 'project') {
    const transitions = projectTransitions[fromStatus as ProjectStatus]
    return transitions ? transitions.includes(toStatus as ProjectStatus) : false
  }

  if (entityType === 'milestone') {
    const transitions = milestoneTransitions[fromStatus as MilestoneStatus]
    return transitions
      ? transitions.includes(toStatus as MilestoneStatus)
      : false
  }

  if (entityType === 'field_report' || entityType === 'report') {
    const transitions = fieldReportTransitions[fromStatus as FieldReportStatus]
    return transitions
      ? transitions.includes(toStatus as FieldReportStatus)
      : false
  }

  if (entityType === 'payment') {
    const transitions = paymentTransitions[fromStatus as PaymentStatus]
    return transitions ? transitions.includes(toStatus as PaymentStatus) : false
  }

  if (entityType === 'task') {
    const transitions = taskTransitions[fromStatus as TaskStatus]
    return transitions ? transitions.includes(toStatus as TaskStatus) : false
  }

  if (entityType === 'withdrawal') {
    const transitions = withdrawalTransitions[fromStatus as WithdrawalStatus]
    return transitions
      ? transitions.includes(toStatus as WithdrawalStatus)
      : false
  }

  if (entityType === 'approval') {
    const transitions = approvalTransitions[fromStatus as ApprovalStatus]
    return transitions
      ? transitions.includes(toStatus as ApprovalStatus)
      : false
  }

  if (entityType === 'assignment') {
    const transitions = assignmentTransitions[fromStatus as AssignmentStatus]
    return transitions
      ? transitions.includes(toStatus as AssignmentStatus)
      : false
  }

  return false
}

export function getValidTransitions(
  entityType: EntityType,
  fromStatus: string
): string[] {
  if (entityType === 'project') {
    return projectTransitions[fromStatus as ProjectStatus] || []
  }

  if (entityType === 'milestone') {
    return milestoneTransitions[fromStatus as MilestoneStatus] || []
  }

  if (entityType === 'field_report' || entityType === 'report') {
    return fieldReportTransitions[fromStatus as FieldReportStatus] || []
  }

  if (entityType === 'payment') {
    return paymentTransitions[fromStatus as PaymentStatus] || []
  }

  if (entityType === 'task') {
    return taskTransitions[fromStatus as TaskStatus] || []
  }

  if (entityType === 'withdrawal') {
    return withdrawalTransitions[fromStatus as WithdrawalStatus] || []
  }

  if (entityType === 'approval') {
    return approvalTransitions[fromStatus as ApprovalStatus] || []
  }

  if (entityType === 'assignment') {
    return assignmentTransitions[fromStatus as AssignmentStatus] || []
  }

  return []
}
