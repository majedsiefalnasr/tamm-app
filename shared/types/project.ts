export type ProjectStatus =
  | 'new'
  | 'open_for_bids'
  | 'under_review'
  | 'contractor_selected'
  | 'active'
  | 'on_hold'
  | 'completed'

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

export interface ProjectsResponse {
  data: Project[]
  message?: string
}
