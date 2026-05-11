/** Pending new-project submission awaiting admin acceptance (mock until API exists). */
export type ProjectCreationRequestStatus = 'pending_admin_review'

export interface ProjectCreationRequestSupervisorOption {
  id: string
  /** Display name (Arabic copy in mock; UI can swap via i18n later). */
  name: string
}

export interface ProjectCreationRequest {
  id: string
  project_number: string
  /** Short display title for the requested project. */
  title: string
  city: string
  owner_name: string
  status: ProjectCreationRequestStatus
  /** ISO date string — shown in dialog subtitle. */
  created_at: string
  /** Building / use type i18n key under admin.projects.creation_requests.types */
  type_key: string
  budget_amount: number
  currency: 'SAR'
  area_sqm: number
  /** Shown as helper text under supervisor select. */
  default_contractor_name: string
}
