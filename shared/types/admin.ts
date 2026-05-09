// Dashboard types
export interface UrgentAction {
  new_projects: number
  pending_payments: number
  disputes: number
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

export interface RecentEvent {
  id: string
  type:
    | 'project_created'
    | 'milestone_approved'
    | 'payment_released'
    | 'user_created'
  title: string
  timestamp: string
  related_entity_id?: string
}

export interface DashboardSummary {
  summary_stats: {
    active_projects: number
    total_contractors: number
    total_tracked_value: number
    open_disputes: number
  }
  urgent_actions: UrgentAction
  recent_projects: RecentProject[]
  open_disputes: RecentDispute[]
  activity_data: ActivityChartData
  recent_events: RecentEvent[]
}

export interface DashboardResponse {
  success: boolean
  data: DashboardSummary
}
