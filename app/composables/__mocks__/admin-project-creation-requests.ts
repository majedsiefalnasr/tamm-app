import type {
  ProjectCreationRequest,
  ProjectCreationRequestSupervisorOption,
} from '#shared/types/projectCreationRequest'

/** TODO: replace mock — GET /admin/projects/creation-requests (or contract TBD with backend). */
export const MOCK_PROJECT_CREATION_REQUESTS: ProjectCreationRequest[] = [
  {
    id: 'pcr-majed-1',
    project_number: 'PRJ-2069',
    title: 'محل تجاري — حي السلام',
    city: 'تعز',
    owner_name: 'ماجد سيف النصر',
    status: 'pending_admin_review',
    created_at: '2026-05-07T10:30:00.000Z',
    type_key: 'commercial',
    budget_amount: 9500,
    currency: 'SAR',
    area_sqm: 120,
    default_contractor_name: 'شركة البناء المتقن',
  },
]

export const MOCK_SUPERVISOR_OPTIONS: ProjectCreationRequestSupervisorOption[] =
  [
    { id: 'sup-laila', name: 'م. ليلى العمراني' },
    { id: 'sup-ahmad', name: 'م. أحمد الكبسي' },
  ]
