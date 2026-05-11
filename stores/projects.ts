import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  Project,
  ProjectDetail,
  ProjectStatus,
} from '~/shared/types/project'
import { canTransition } from '~/utils/statusMachine'
import { useNotifications } from '~/composables/useNotifications'
import { useAuthStore } from './auth'

const projectsMap = ref<Record<string, ProjectDetail>>({})
const projectsList = ref<Project[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

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
]

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
        tasks: [],
        payment_status: 'paid',
        allowed_actions: ['view_report'],
        created_at: '2026-04-20T09:00:00Z',
      },
      {
        id: 'ms-2',
        name: 'Walls & Finishing',
        description: 'Walls, finishing, internal work',
        amount: 75000,
        order: 2,
        status: 'in_progress',
        tasks: [],
        payment_status: 'pending',
        allowed_actions: ['submit_report'],
        created_at: '2026-05-01T09:00:00Z',
      },
      {
        id: 'ms-3',
        name: 'Final Handover',
        description: 'Final checks and handover',
        amount: 125000,
        order: 3,
        status: 'draft',
        tasks: [],
        payment_status: 'pending',
        allowed_actions: [],
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

export const useProjectsStore = defineStore('projects', () => {
  const auth = useAuthStore()

  // Fetch projects list
  const fetchProjects = async () => {
    loading.value = true
    error.value = null

    try {
      // TODO: replace mock — GET /projects endpoint
      await new Promise(resolve => setTimeout(resolve, 200))
      projectsList.value = mockProjects
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Failed to fetch projects'
    } finally {
      loading.value = false
    }
  }

  // Get project details by ID
  const getProjectById = async (projectId: string): Promise<ProjectDetail> => {
    if (projectsMap.value[projectId]) {
      return projectsMap.value[projectId]
    }

    loading.value = true
    error.value = null

    try {
      // TODO: replace mock — GET /projects/:id endpoint
      await new Promise(resolve => setTimeout(resolve, 300))
      const project = mockProjectDetails[projectId]
      if (!project) throw new Error('Project not found')
      projectsMap.value[projectId] = project
      return project
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Failed to fetch project'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update project status
  const updateProjectStatus = async (
    projectId: string,
    newStatus: ProjectStatus
  ) => {
    const { notify } = useNotifications()
    const project = projectsMap.value[projectId]
    if (!project) throw new Error('Project not found')

    if (!canTransition('project', project.status, newStatus)) {
      throw new Error('Invalid status transition')
    }

    const previousStatus = project.status
    project.status = newStatus

    try {
      // TODO: replace mock — PUT /projects/:id/status endpoint
      await new Promise(resolve => setTimeout(resolve, 300))
      notify.success('project.notifications.activated')
    } catch (err) {
      project.status = previousStatus
      notify.error('errors.projectStatusUpdateFailed')
      throw err
    }
  }

  // Get filtered projects based on role
  const getFilteredProjects = (allProjects: Project[]): Project[] => {
    const userRole = auth.user?.role

    switch (userRole) {
      case 'client':
        return allProjects.slice(0, 3)
      case 'contractor':
        return allProjects.filter(
          p =>
            p.contractor_id === 'cont-001' ||
            p.contractor_id === 'cont-002' ||
            p.contractor_id === 'cont-004'
        )
      case 'field_engineer':
      case 'supervisor_engineer':
        return allProjects.filter(
          p => p.contractor_id === 'cont-001' || p.contractor_id === 'cont-002'
        )
      case 'admin':
      case 'super_admin':
        return allProjects
      default:
        return []
    }
  }

  // Computed filtered projects
  const filteredProjects = computed(() =>
    getFilteredProjects(projectsList.value)
  )

  return {
    projectsList,
    projectsMap,
    loading,
    error,
    filteredProjects,
    fetchProjects,
    getProjectById,
    updateProjectStatus,
  }
})
