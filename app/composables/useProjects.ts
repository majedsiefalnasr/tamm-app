import { ref, computed } from 'vue'
import type {
  Project,
  ProjectDetail,
  Milestone,
  ProjectStatus,
} from '~/shared/types/project'
import { useApi, type ApiError } from '~/composables/useApi'
import { canTransition } from '~/utils/statusMachine'

export type SelectContractorFailure =
  | 'project_not_found'
  | 'invalid_status'
  | 'network'
  | 'server_error'
  | 'validation'
  | 'unknown'

export type SelectContractorResult =
  | { success: true }
  | { success: false; failure: SelectContractorFailure }

export const useProjects = () => {
  const projects = ref<Project[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const auth = useAuthStore()

  // Mock projects for development
  const mockProjects: Project[] = [
    {
      id: 'proj-001',
      name: 'Villa Project A',
      description: 'Modern villa in New Cairo',
      city: 'Cairo',
      area_m2: 400,
      budget: 250000,
      currency: 'EGP',
      status: 'active',
      contractor_id: 'cont-001',
      contractor_name: 'Elite Builders',
      created_at: '2026-04-15T10:30:00Z',
      completed_milestones: 2,
      total_milestones: 5,
    },
    {
      id: 'proj-002',
      name: 'Apartment Complex B',
      description: 'Residential apartment complex in Giza',
      city: 'Giza',
      area_m2: 1200,
      budget: 500000,
      currency: 'EGP',
      status: 'in_progress',
      contractor_id: 'cont-002',
      contractor_name: 'BuildRight Corp',
      created_at: '2026-03-20T14:15:00Z',
      completed_milestones: 1,
      total_milestones: 4,
    },
    {
      id: 'proj-003',
      name: 'Commercial Space C',
      description: 'Modern office space in Downtown',
      city: 'Cairo',
      area_m2: 800,
      budget: 350000,
      currency: 'EGP',
      status: 'new',
      created_at: '2026-05-01T09:00:00Z',
      completed_milestones: 0,
      total_milestones: 0,
    },
    {
      id: 'proj-004',
      name: 'Retail Store D',
      description: 'Shopping center in New Administrative Capital',
      city: 'New Administrative Capital',
      area_m2: 2000,
      budget: 750000,
      currency: 'EGP',
      status: 'completed',
      contractor_id: 'cont-003',
      contractor_name: 'Construction Pro',
      created_at: '2026-02-10T11:45:00Z',
      completed_milestones: 3,
      total_milestones: 3,
    },
    {
      id: 'proj-005',
      name: 'Villa Project E',
      description: 'Luxury villa with smart home features',
      city: 'New Cairo',
      area_m2: 550,
      budget: 380000,
      currency: 'EGP',
      status: 'on_hold',
      contractor_id: 'cont-004',
      contractor_name: 'Smart Build',
      created_at: '2026-03-05T15:20:00Z',
      completed_milestones: 2,
      total_milestones: 5,
    },
    {
      id: 'proj-bid-open-001',
      name: 'Warehouse Expansion',
      description: 'Industrial warehouse retrofit',
      city: 'Alexandria',
      address: 'Khorshid Industrial Zone, Plot 12',
      area_m2: 3000,
      budget: 900000,
      currency: 'EGP',
      status: 'open_for_bids',
      created_at: '2026-05-06T08:00:00Z',
      completed_milestones: 0,
      total_milestones: 0,
    },
  ]

  // Mock project details
  const mockProjectDetails: Record<string, ProjectDetail> = {
    'proj-001': {
      id: 'proj-001',
      name: 'Villa Project A',
      description: 'Modern villa in New Cairo with luxury finishes',
      city: 'Cairo',
      area_m2: 400,
      type: 'villa',
      budget: 250000,
      currency: 'EGP',
      status: 'active',
      client_id: 'user-101',
      client_name: 'Ahmed Al-Masri',
      contractor_id: 'cont-001',
      contractor_name: 'Elite Builders',
      supervisor_engineer_id: 'user-201',
      supervisor_name: 'Khaled Ibrahim',
      field_engineer_id: 'user-202',
      field_engineer_name: 'Mohammed Hassan',
      total_amount: 250000,
      total_paid: 100000,
      created_at: '2026-04-15T10:30:00Z',
      milestones: [
        {
          id: 'ms-1',
          name: 'Foundation & Structure',
          description: 'Excavation, foundation, concrete structure',
          amount: 50000,
          order: 1,
          status: 'approved',
          created_at: '2026-04-20T09:00:00Z',
        },
        {
          id: 'ms-2',
          name: 'Walls & Finishing',
          description: 'Walls, finishing, internal work',
          amount: 75000,
          order: 2,
          status: 'in_progress',
          created_at: '2026-05-01T09:00:00Z',
        },
        {
          id: 'ms-3',
          name: 'Final Handover',
          description: 'Final checks and handover',
          amount: 125000,
          order: 3,
          status: 'not_started',
          created_at: '2026-05-05T09:00:00Z',
        },
      ],
    },
    'proj-002': {
      id: 'proj-002',
      name: 'Apartment Complex B',
      description: 'Residential apartment complex in Giza',
      city: 'Giza',
      area_m2: 1200,
      type: 'apartment',
      budget: 500000,
      currency: 'EGP',
      status: 'contractor_selected',
      client_id: 'user-102',
      client_name: 'Fatima Al-Sayed',
      contractor_id: 'cont-002',
      contractor_name: 'BuildRight Corp',
      supervisor_engineer_id: 'user-201',
      supervisor_name: 'Khaled Ibrahim',
      total_amount: 500000,
      total_paid: 0,
      created_at: '2026-03-20T14:15:00Z',
      milestones: [],
    },
    'proj-003': {
      id: 'proj-003',
      name: 'Commercial Space C',
      description: 'Modern office space in Downtown Cairo',
      city: 'Cairo',
      area_m2: 800,
      type: 'commercial',
      budget: 350000,
      currency: 'EGP',
      status: 'new',
      client_id: 'user-103',
      client_name: 'Mohamed Karim',
      total_amount: 350000,
      total_paid: 0,
      created_at: '2026-05-01T09:00:00Z',
      milestones: [],
    },
  }

  // Get role-filtered projects
  const getFilteredProjects = (allProjects: Project[]): Project[] => {
    const userRole = auth.user?.role

    switch (userRole) {
      case 'client':
        // Clients see only their own projects (mock: first 3)
        return allProjects.slice(0, 3)
      case 'contractor': {
        const assigned = allProjects.filter(
          p =>
            p.contractor_id === 'cont-001' ||
            p.contractor_id === 'cont-002' ||
            p.contractor_id === 'cont-004'
        )
        const invitedOpen = allProjects.filter(
          p => p.status === 'open_for_bids' && p.id === 'proj-bid-open-001'
        )
        const seen = new Set<string>()
        const merged: Project[] = []
        for (const p of [...assigned, ...invitedOpen]) {
          if (!seen.has(p.id)) {
            seen.add(p.id)
            merged.push(p)
          }
        }
        return merged
      }
      case 'field_engineer':
      case 'supervisor_engineer':
        // Field/supervisor engineers see assigned projects (mock: projects 1, 2)
        return allProjects.filter(
          p => p.contractor_id === 'cont-001' || p.contractor_id === 'cont-002'
        )
      case 'admin':
      case 'super_admin':
        // Admins see all projects
        return allProjects
      default:
        return allProjects.slice(0, 3)
    }
  }

  const fetchProjects = async () => {
    loading.value = true
    error.value = null

    try {
      // TODO: replace mock — GET /projects endpoint
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))

      const filteredProjects = getFilteredProjects(mockProjects)
      projects.value = filteredProjects
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Failed to fetch projects'
      projects.value = []
    } finally {
      loading.value = false
    }
  }

  const getProjectById = async (id: string): Promise<ProjectDetail> => {
    // TODO: replace mock — GET /projects/:id endpoint
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300))

    const detail = mockProjectDetails[id]
    if (!detail) {
      throw new Error(`Project ${id} not found`)
    }
    return detail
  }

  const retryFetch = async () => {
    await fetchProjects()
  }

  // Store for in-memory project state (until full API integration)
  const projectState = ref<Record<string, ProjectDetail>>({})

  function isUnavailableProjectApiError(err: unknown): boolean {
    if (!err || typeof err !== 'object') return false
    const e = err as ApiError
    const code = e.statusCode ?? e.status
    if (code === 404 || code === 501 || code === 503) return true
    const msg = e.message ?? ''
    return (
      msg.includes('404') ||
      msg.includes('fetch failed') ||
      msg.includes('Failed to fetch')
    )
  }

  function classifySelectContractorFailure(
    err: unknown
  ): SelectContractorFailure {
    if (!err || typeof err !== 'object') return 'unknown'
    const e = err as ApiError
    const code = e.statusCode ?? e.status
    if (code === undefined) {
      const msg = (e.message ?? '').toLowerCase()
      if (
        msg.includes('fetch failed') ||
        msg.includes('failed to fetch') ||
        msg.includes('network')
      ) {
        return 'network'
      }
      return 'unknown'
    }
    if (code === 408 || code >= 502) return 'network'
    if (code >= 500) return 'server_error'
    if (code === 422 || code === 400 || code === 409) return 'validation'
    return 'unknown'
  }

  const syncMockDetailStatus = (
    projectId: string,
    newStatus: ProjectStatus
  ): void => {
    const detail = mockProjectDetails[projectId]
    if (detail) {
      detail.status = newStatus
    }
    const st = projectState.value[projectId]
    if (st) {
      st.status = newStatus
    }
  }

  const updateProjectStatus = async (
    projectId: string,
    newStatus: ProjectStatus
  ): Promise<void> => {
    const mockFallback = async () => {
      await new Promise(resolve => setTimeout(resolve, 400))
      syncMockDetailStatus(projectId, newStatus)
    }

    try {
      const response = await useApi<{ status?: ProjectStatus }>(
        `/projects/${projectId}`,
        {
          method: 'PUT',
          body: { status: newStatus },
        }
      )

      if (
        typeof response === 'object' &&
        response !== null &&
        'success' in response &&
        response.success === false
      ) {
        throw new Error(
          response.message ||
            response.error?.message ||
            'Failed to update project status'
        )
      }

      syncMockDetailStatus(projectId, newStatus)
    } catch (err) {
      if (isUnavailableProjectApiError(err)) {
        await mockFallback()
        return
      }
      throw err instanceof Error
        ? err
        : new Error('Failed to update project status')
    }
  }

  const inviteContractors = async (
    projectId: string,
    contractorIds: string[]
  ): Promise<void> => {
    try {
      // TODO: replace mock — POST /projects/:id/invitations
      await $fetch(`/api/v1/projects/${projectId}/invitations`, {
        method: 'POST',
        body: { contractor_ids: contractorIds },
      })
    } catch (err) {
      // API not available, use mock
      await new Promise(resolve => setTimeout(resolve, 300))
    }
  }

  const closeBiddingForReview = async (projectId: string): Promise<void> => {
    await updateProjectStatus(projectId, 'under_review')
  }

  const selectContractor = async (
    projectId: string,
    proposalId: string
  ): Promise<SelectContractorResult> => {
    const project = mockProjectDetails[projectId]
    if (!project) {
      return { success: false, failure: 'project_not_found' }
    }

    if (!canTransition('project', project.status, 'contractor_selected')) {
      return { success: false, failure: 'invalid_status' }
    }

    const prevStatus = project.status
    const prevSelectedProposalId = project.selected_proposal_id

    project.status = 'contractor_selected'
    project.selected_proposal_id = proposalId

    try {
      const response = await useApi<unknown>(
        `/projects/${projectId}/proposals/${proposalId}/select`,
        {
          method: 'POST',
        }
      )

      if (
        typeof response === 'object' &&
        response !== null &&
        'success' in response &&
        (response as { success?: boolean }).success === false
      ) {
        project.status = prevStatus
        project.selected_proposal_id = prevSelectedProposalId
        return { success: false, failure: 'validation' }
      }
    } catch (apiErr) {
      if (isUnavailableProjectApiError(apiErr)) {
        await new Promise(resolve => setTimeout(resolve, 400))
        return { success: true }
      }
      project.status = prevStatus
      project.selected_proposal_id = prevSelectedProposalId
      return {
        success: false,
        failure: classifySelectContractorFailure(apiErr),
      }
    }

    return { success: true }
  }

  const assignEngineers = async (
    projectId: string,
    supervisorId: string,
    fieldEngineerId: string
  ) => {
    const projectDetail = mockProjectDetails[projectId]
    if (!projectDetail) {
      return { success: false, error: 'Project not found' }
    }

    if (projectDetail.status !== 'contractor_selected') {
      return {
        success: false,
        error: 'Project must be in contractor_selected status',
      }
    }

    const prevSupervisor = projectDetail.supervisor_engineer_id
    const prevField = projectDetail.field_engineer_id

    try {
      projectDetail.supervisor_engineer_id = supervisorId
      projectDetail.field_engineer_id = fieldEngineerId

      const mockEngineers: Record<string, { id: string; name: string }> = {
        'eng-001': { id: 'eng-001', name: 'Khaled Ibrahim' },
        'eng-002': { id: 'eng-002', name: 'Mohammed Hassan' },
        'eng-003': { id: 'eng-003', name: 'Fatima Ahmed' },
        'eng-004': { id: 'eng-004', name: 'Ali Mohammed' },
      }

      projectDetail.supervisor_engineer = mockEngineers[supervisorId] || {
        id: supervisorId,
        name: 'Engineer',
      }
      projectDetail.field_engineer = mockEngineers[fieldEngineerId] || {
        id: fieldEngineerId,
        name: 'Engineer',
      }

      return { success: true }
    } catch (err) {
      projectDetail.supervisor_engineer_id = prevSupervisor
      projectDetail.field_engineer_id = prevField
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to assign engineers'
      return { success: false, error: errorMsg }
    }
  }

  return {
    projects: computed(() => projects.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    fetchProjects,
    getProjectById,
    retryFetch,
    updateProjectStatus,
    inviteContractors,
    closeBiddingForReview,
    selectContractor,
    assignEngineers,
  }
}
