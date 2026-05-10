import type {
  MilestoneDisplayFields,
  ProjectDisplayFields,
} from './project-display'

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

export interface Project extends ProjectDisplayFields {
  id: string
  name: string
  description: string
  city: string
  area_m2: number
  budget: number
  currency: string
  status: ProjectStatus
  contractor_id?: string
  contractor_name?: string
  created_at: string
  completed_milestones: number
  total_milestones: number
}

export type PaymentStatus =
  | 'pending_payment'
  | 'paid'
  | 'awaiting_approval'
  | 'ready_for_payout'
  | 'paid_out'

export interface Task {
  id: string
  milestone_id: string
  title: string
  contractor?: {
    id: string
    name: string
  }
  completed?: boolean
}

export interface Report {
  id: string
  milestone_id: string
  content: string
  images: string[]
  submitted_by?: {
    id: string
    name: string
  }
  submitted_at?: string
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
}

export interface Milestone extends MilestoneDisplayFields {
  id: string
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
  project_id?: string
  project?: {
    id: string
    name: string
  }
  supervisor_id?: string
  supervisor?: {
    id: string
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
  id: string
  name: string
}

export interface ProjectDetail {
  id: string
  name: string
  description: string
  city: string
  area_m2: number
  type: 'villa' | 'apartment' | 'commercial' | 'other'
  budget: number
  currency: string
  status: ProjectStatus
  /** Set when client selects a winning proposal (mock + API-backed detail). */
  selected_proposal_id?: string
  client_id: string
  client_name: string
  contractor_id?: string
  contractor_name?: string
  supervisor_engineer_id?: string
  supervisor_engineer?: Engineer
  supervisor_name?: string
  field_engineer_id?: string
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
  id: string
  project_number: string
  name: string
  status: ProjectStatus
  client: {
    id: string
    name: string
  }
  contractor: {
    id: string
    name: string
  } | null
  total_value: number
  created_at: string
  milestones: Array<{
    id: string
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
  id: string
  projectId: string
  contractorId: string
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
  supervisor_engineer_id: string
  field_engineer_id: string
}
