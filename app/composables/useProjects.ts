import { ref, computed } from 'vue'
import type { Project, ProjectDetail, Milestone } from '~/shared/types/project'
import { canTransition } from '~/utils/statusMachine'

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
      case 'contractor':
        // Contractors see only projects where they're assigned (mock: projects 1, 2, 4)
        return allProjects.filter(
          p =>
            p.contractor_id === 'cont-001' ||
            p.contractor_id === 'cont-002' ||
            p.contractor_id === 'cont-004'
        )
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

  const updateProjectStatus = async (
    projectId: string,
    newStatus: string
  ): Promise<void> => {
    try {
      // TODO: replace mock — PUT /projects/:id
      // Try real API first
      const response = await $fetch(`/api/v1/projects/${projectId}`, {
        method: 'PUT',
        body: { status: newStatus },
      })

      if (response?.data) {
        // Update local state
        const project = projectState.value[projectId]
        if (project) {
          project.status = newStatus
        }
      }
    } catch (err) {
      // API not available, use mock
      await new Promise(resolve => setTimeout(resolve, 400))
      const project = projectState.value[projectId]
      if (project) {
        project.status = newStatus
      }
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
    // Delegates to updateProjectStatus with validation
    await updateProjectStatus(projectId, 'under_review')
  }

  const getProposalCount = (projectId: string): number => {
    // Will be enhanced when API returns proposal count
    // For now, returns 0 (mock data)
    return 0
  }

  const selectContractor = async (
    projectId: string,
    proposalId: string
  ): Promise<{ success: boolean; error?: string }> => {
    const project = projectState.value[projectId]
    if (!project) {
      return {
        success: false,
        error: 'Project not found',
      }
    }

    // Validate transition before attempting API call
    if (!canTransition('project', project.status, 'contractor_selected')) {
      return {
        success: false,
        error: 'Cannot select contractor. Invalid project status.',
      }
    }

    const prevStatus = project.status

    try {
      // Optimistic update: update immediately
      project.status = 'contractor_selected'
      project.selected_proposal_id = proposalId

      // Try API call
      try {
        await $fetch(
          `/api/v1/projects/${projectId}/proposals/${proposalId}/select`,
          {
            method: 'POST',
          }
        )
      } catch (apiErr) {
        // API not available yet, use mock
        await new Promise(resolve => setTimeout(resolve, 400))
      }

      return { success: true }
    } catch (err) {
      // Rollback on error
      project.status = prevStatus
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to select contractor'
      return {
        success: false,
        error: errorMsg,
      }
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
    getProposalCount,
    selectContractor,
  }
}
