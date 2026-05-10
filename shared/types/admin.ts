// Dashboard types

export interface UrgentAction {
  new_projects: number
  pending_payments: number
  disputes: number
  pending_reports: number
}

export interface RecentProject {
  id: string
  project_number: string
  name: string
  city: string
  client_name: string
  status: string
  milestones_completed: number
  milestones_total: number
  progress_percentage: number
}

export interface RecentDispute {
  id: string
  dispute_number: string
  project_name: string
  requester_name: string
  subject: string
  status: 'open' | 'mediating' | 'resolved'
  created_at: string
}

export interface ActivityChartDataPoint {
  month: string
  milestones: number
  projects: number
}

export interface ActivityChartData {
  months: string[]
  data: ActivityChartDataPoint[]
}

export type RecentEventType =
  | 'project_created'
  | 'milestone_approved'
  | 'payment_released'
  | 'user_created'
  | 'contractor_selected'
  | 'bidding_opened'
  | 'milestone_under_review'

export interface RecentEvent {
  id: string
  type: RecentEventType
  title: string
  subtitle?: string
  timestamp: string
  related_entity_id?: string
  related_name?: string
}

export interface AdminDashboardSummaryStats {
  active_projects: number
  milestones_pending_review: number
  payments_ready_for_release: number
  projects_awaiting_contractor_selection: number
  new_users_this_month: number
  open_disputes: number
}

export type ActionQueueKind =
  | 'open_bidding'
  | 'assign_engineers'
  | 'release_payment'

export interface ActionQueueItem {
  id: string
  kind: ActionQueueKind
  title: string
  subtitle: string
  project_id: string
  milestone_id?: string
  action_href: string
  action_label_key: string
}

export interface ActionQueues {
  open_bidding: ActionQueueItem[]
  assign_engineers: ActionQueueItem[]
  release_payment: ActionQueueItem[]
}

export interface SuperAdminDashboardFlags {
  pending_permission_requests: number
}

export interface DashboardSummary {
  summary_stats: AdminDashboardSummaryStats
  urgent_actions: UrgentAction
  recent_projects: RecentProject[]
  open_disputes: RecentDispute[]
  activity_data: ActivityChartData
  recent_events: RecentEvent[]
  action_queues: ActionQueues
  super_admin_flags?: SuperAdminDashboardFlags
}

export interface DashboardResponse {
  success: boolean
  data: DashboardSummary
}
