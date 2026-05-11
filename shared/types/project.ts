import type {
  MilestoneDisplayFields,
  ProjectDisplayFields,
} from './project-display'

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
  // Legacy statuses kept temporarily while migrating older UI flows.
  | 'new'
  | 'open_for_bids'
  | 'under_review'
  | 'contractor_selected'
  | 'active'

export type MilestoneStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  // Legacy statuses kept temporarily while migrating older UI flows.
  | 'not_started'
  | 'in_progress'
  | 'supervisor_approved'

export type ProjectEntityId = number
export type LegacyEntityId = string
export type ApiEntityId = ProjectEntityId | LegacyEntityId

export interface Project extends ProjectDisplayFields {
  id: ApiEntityId
  name: string
  description: string
  city: string
  area_m2: number
  budget: number
  currency: string
  status: ProjectStatus
  contractor_id?: ApiEntityId
  contractor_name?: string
  created_at: string
  completed_milestones: number
  total_milestones: number
}

export type PaymentStatus =
  | 'pending'
  | 'awaiting_release'
  | 'processing'
  | 'paid'
  | 'failed'
  // Legacy statuses kept temporarily while migrating older UI flows.
  | 'pending_payment'
  | 'awaiting_approval'
  | 'ready_for_payout'
  | 'paid_out'

export type TaskStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'approved'
  | 'rejected'

export interface Task {
  id: ApiEntityId
  milestone_id: ApiEntityId
  title: string
  status?: TaskStatus
  contractor?: {
    id: ApiEntityId
    name: string
  }
  completed?: boolean
}

export interface Report {
  id: ApiEntityId
  milestone_id: ApiEntityId
  content: string
  images: string[]
  submitted_by?: {
    id: ApiEntityId
    name: string
  }
  submitted_at?: string
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
}

export interface Milestone extends MilestoneDisplayFields {
  id: ApiEntityId
  name: string
  description?: string
  amount: number
  order: number
  status: MilestoneStatus
  tasks: Task[]
  latest_report?: Report
  payment_status: PaymentStatus
  allowed_actions: string[]
  created_at: string
  updated_at?: string
  field_engineer?: {
    id: string
    name: string
  }
  project_id?: ApiEntityId
  project?: {
    id: ApiEntityId
    name: string
  }
  supervisor_id?: ApiEntityId
  supervisor?: {
    id: ApiEntityId
    name: string
  }
  supervisor_approved_at?: string
  /** ISO timestamp — client final approval (trust timeline narrative). */
  client_approved_at?: string
  /** Last user-visible rejection reason (never internal audit notes). */
  rejection_reason?: string | null
  /** Cleared when a new report submission cycle begins (frontend heuristic until audit API). */
  last_rejection_at?: string
  last_rejection_role?: 'supervisor_engineer' | 'client'
  /** Client payment recorded (escrow) — trust timeline timestamp. */
  payment_confirmed_at?: string
}

export interface Engineer {
  id: ApiEntityId
  name: string
}

export interface ProjectDetail {
  id: ApiEntityId
  name: string
  description: string
  city: string
  area_m2: number
  type: 'villa' | 'apartment' | 'commercial' | 'other'
  budget: number
  currency: string
  status: ProjectStatus
  /** Set when client selects a winning proposal (mock + API-backed detail). */
  selected_proposal_id?: ApiEntityId
  client_id: ApiEntityId
  client_name: string
  contractor_id?: ApiEntityId
  contractor_name?: string
  supervisor_engineer_id?: ApiEntityId
  supervisor_engineer?: Engineer
  supervisor_name?: string
  field_engineer_id?: ApiEntityId
  field_engineer?: Engineer
  field_engineer_name?: string
  total_amount: number
  total_paid: number
  created_at: string
  milestones: Milestone[]
}

export interface ProjectsResponse {
  data: Project[]
  message?: string
}

export interface ProjectDetailResponse {
  data: ProjectDetail
  message?: string
}

// Admin project overview types
export interface AdminProjectOverviewItem {
  id: ApiEntityId
  project_number: string
  name: string
  status: ProjectStatus
  client: {
    id: ApiEntityId
    name: string
  }
  contractor: {
    id: ApiEntityId
    name: string
  } | null
  total_value: number
  created_at: string
  milestones: Array<{
    id: ApiEntityId
    status: MilestoneStatus
  }>
}

export interface AdminProjectsResponse {
  success: boolean
  data: AdminProjectOverviewItem[]
  pagination: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  }
}

export type AdminProjectStatus = ProjectStatus | 'all'

export interface ProjectOverviewFilter {
  status: AdminProjectStatus
  search: string
  page: number
}

// Proposal types
export interface ProposalData {
  id: ApiEntityId
  projectId: ApiEntityId
  contractorId: ApiEntityId
  contractorName: string
  price: number
  estimatedDays: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface ProposalPayload {
  price: number
  estimated_days: number
  notes?: string
}

export interface AssignEngineersPayload {
  supervisor_engineer_id: ApiEntityId
  field_engineer_id: ApiEntityId
}
