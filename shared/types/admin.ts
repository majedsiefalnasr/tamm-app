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
  /** When set, UI prefers `t(name_key)` over `name` (demo / i18n rows). */
  name_key?: string
  city: string
  city_key?: string
  client_name: string
  client_name_key?: string
  status: string
  milestones_completed: number
  milestones_total: number
  progress_percentage: number
}

export interface RecentDispute {
  id: string
  dispute_number: string
  project_name: string
  /** When set, table shows `t(project_display_key)` instead of `project_name`. */
  project_display_key?: string
  requester_name: string
  /** When set, table shows `t(requester_label_key)` instead of `requester_name`. */
  requester_label_key?: string
  subject: string
  /** When set, table shows `t(subject_key)` instead of `subject`. */
  subject_key?: string
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

/** Rich admin home layout (mock today; align GET /admin/dashboard when backend ships). */
export interface AdminLovablePrimaryKpi {
  id: string
  title_key: string
  value: number
  subtitle_key: string
  subtitle_params?: Record<string, string | number>
  icon: string
  tone: 'primary' | 'default' | 'accent' | 'danger' | 'success' | 'warning'
  href: string
  format?: 'number' | 'compact_sar'
}

export interface AdminLovableSparklineKpi {
  id: string
  title_key: string
  value_label_key: string
  value_label_params?: Record<string, string | number>
  /** When set, shows `t(value_display_key)` instead of `value_label_key` (demo-friendly). */
  value_display_key?: string
  series: number[]
  tone: 'warning' | 'primary' | 'success'
  href: string
}

export interface AdminLovableProjectSlice {
  label_key: string
  percent: number
  /** Tailwind bg-* token for legend segment (e.g. emerald-500). */
  color_class: string
}

export interface AdminLovablePlatformPoint {
  month: string
  closed_projects: number
}

export interface AdminLovableRegistrationRow {
  id: string
  name_key: string
  role_key: string
  minutes_ago: number
}

export interface AdminLovableWeeklyBar {
  role_key: string
  count: number
}

export interface AdminLovableOverview {
  alert_field_reports: number
  alert_new_project_requests: number
  primary_kpis: AdminLovablePrimaryKpi[]
  sparkline_kpis: AdminLovableSparklineKpi[]
  project_distribution: AdminLovableProjectSlice[]
  platform_activity: AdminLovablePlatformPoint[]
  latest_registrations: AdminLovableRegistrationRow[]
  weekly_registrations: AdminLovableWeeklyBar[]
  weekly_registrations_total: number
  weekly_registrations_delta_percent: number
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
  /** Optional Lovable-aligned blocks; mocked until API returns them. */
  lovable_overview?: AdminLovableOverview | null
}

export interface DashboardResponse {
  success: boolean
  data: DashboardSummary
}
