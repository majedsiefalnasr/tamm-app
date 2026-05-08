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

export interface Project {
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

export interface Milestone {
  id: string
  name: string
  description?: string
  amount: number
  order: number
  status: MilestoneStatus
  created_at: string
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
  client_id: string
  client_name: string
  contractor_id?: string
  contractor_name?: string
  supervisor_engineer_id?: string
  supervisor_name?: string
  field_engineer_id?: string
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
