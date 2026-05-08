import { ref, computed } from 'vue'
import type { Project } from '~/shared/types/project'

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

  const retryFetch = async () => {
    await fetchProjects()
  }

  return {
    projects: computed(() => projects.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    fetchProjects,
    retryFetch,
  }
}
