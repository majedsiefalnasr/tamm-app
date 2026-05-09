// Status machine — single source of truth for valid transitions
// Reference: docs/status-flows.md

export type ProjectStatus =
  | 'new'
  | 'open_for_bids'
  | 'under_review'
  | 'contractor_selected'
  | 'active'
  | 'on_hold'
  | 'completed'

export type MilestoneStatus =
  | 'not_started'
  | 'in_progress'
  | 'under_review'
  | 'supervisor_approved'
  | 'approved'
  | 'rejected'

export type ReportStatus = 'draft' | 'submitted' | 'under_review'

// Project status transitions (docs/status-flows.md §2)
const projectTransitions: Record<ProjectStatus, ProjectStatus[]> = {
  new: ['open_for_bids'],
  open_for_bids: ['under_review'],
  under_review: ['contractor_selected'],
  contractor_selected: ['active'],
  active: ['on_hold', 'completed'],
  on_hold: ['active'],
  completed: [],
}

// Milestone status transitions (docs/status-flows.md §1)
const milestoneTransitions: Record<MilestoneStatus, MilestoneStatus[]> = {
  not_started: ['in_progress'],
  in_progress: ['under_review'],
  under_review: ['supervisor_approved', 'rejected'],
  supervisor_approved: ['approved', 'rejected'],
  approved: [],
  rejected: ['in_progress'], // Always bounces back to in_progress
}

// Report status transitions (docs/status-flows.md §3)
const reportTransitions: Record<ReportStatus, ReportStatus[]> = {
  draft: ['submitted'],
  submitted: ['under_review'],
  under_review: [], // Terminal — report status doesn't change on approve/reject
}

export function canTransition(
  entityType: 'project' | 'milestone' | 'report',
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

  if (entityType === 'report') {
    const transitions = reportTransitions[fromStatus as ReportStatus]
    return transitions ? transitions.includes(toStatus as ReportStatus) : false
  }

  return false
}

export function getValidTransitions(
  entityType: 'project' | 'milestone' | 'report',
  fromStatus: string
): string[] {
  if (entityType === 'project') {
    return projectTransitions[fromStatus as ProjectStatus] || []
  }

  if (entityType === 'milestone') {
    return milestoneTransitions[fromStatus as MilestoneStatus] || []
  }

  if (entityType === 'report') {
    return reportTransitions[fromStatus as ReportStatus] || []
  }

  return []
}
