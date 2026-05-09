import { ref, computed, readonly, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import type {
  AdminProjectOverviewItem,
  AdminProjectsResponse,
  AdminProjectStatus,
  ProjectOverviewFilter,
} from '#shared/types/project'
import { mockAdminProjects } from './__mocks__/admin-projects'

const API_ENDPOINT = '/admin/projects'
const USE_MOCK = true // Set to false when API is available
const DEBOUNCE_MS = 300

export function useAdminProjects() {
  const projects = ref<AdminProjectOverviewItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const statusFilter = ref<AdminProjectStatus>('all')
  const searchQuery = ref('')
  const currentPage = ref(1)
  const pagination = ref({
    current_page: 1,
    per_page: 20,
    total: 0,
    total_pages: 0,
  })

  // Apply filters to dataset
  const applyFilters = (dataset: AdminProjectOverviewItem[]) => {
    let filtered = dataset

    // Apply status filter
    if (statusFilter.value !== 'all') {
      if (statusFilter.value === 'active') {
        filtered = filtered.filter(
          p => p.status === 'active' || p.status === 'contractor_selected'
        )
      } else {
        filtered = filtered.filter(p => p.status === statusFilter.value)
      }
    }

    // Apply search filter
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      filtered = filtered.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.client.name.toLowerCase().includes(q)
      )
    }

    return filtered
  }

  const fetchProjects = async () => {
    loading.value = true
    error.value = null
    try {
      if (USE_MOCK) {
        // Mock: client-side filtering and pagination
        const filtered = applyFilters(mockAdminProjects)
        const total = filtered.length
        const perPage = 20
        const totalPages = total > 0 ? Math.ceil(total / perPage) : 0
        const startIdx = (currentPage.value - 1) * perPage
        const endIdx = startIdx + perPage

        pagination.value = {
          current_page: total > 0 ? currentPage.value : 1,
          per_page: perPage,
          total,
          total_pages: totalPages,
        }
        projects.value = filtered.slice(startIdx, endIdx)
      } else {
        // Real API: server-side filtering
        const params = new URLSearchParams()

        if (statusFilter.value !== 'all') {
          params.append('status', statusFilter.value)
        }

        if (searchQuery.value.trim()) {
          params.append('search', searchQuery.value.trim())
        }

        params.append('page', currentPage.value.toString())
        params.append('per_page', '20')

        const queryString = params.toString()
        const url = queryString
          ? `${API_ENDPOINT}?${queryString}`
          : API_ENDPOINT

        const response = await useApi(url)

        if (!response || typeof response !== 'object') {
          throw new Error('Invalid API response format')
        }

        const data = response as AdminProjectsResponse

        if (!Array.isArray(data.data)) {
          throw new Error('API response missing or invalid data array')
        }

        projects.value = data.data
        pagination.value = {
          current_page: data.pagination?.current_page ?? 1,
          per_page: data.pagination?.per_page ?? 20,
          total: data.pagination?.total ?? 0,
          total_pages: data.pagination?.total_pages ?? 0,
        }
      }
    } catch (e) {
      error.value = (e as any)?.message || 'Failed to fetch projects'
      projects.value = []
    } finally {
      loading.value = false
    }
  }

  // Debounced search
  const debouncedSearch = useDebounceFn(() => {
    currentPage.value = 1 // Reset to page 1 on new search
    fetchProjects()
  }, DEBOUNCE_MS)

  const handleSearch = (value: string) => {
    searchQuery.value = value
    debouncedSearch()
  }

  const handleStatusFilter = (status: AdminProjectStatus) => {
    statusFilter.value = status
    currentPage.value = 1 // Reset to page 1 on filter change
    fetchProjects()
  }

  const handlePageChange = (page: number) => {
    currentPage.value = page
    fetchProjects()
  }

  // Summary card calculations — reflect FILTERED counts, not global
  const summaryCards = computed(() => {
    if (USE_MOCK) {
      // Mock: recalculate from full dataset respecting current filter
      let filtered = mockAdminProjects

      if (statusFilter.value !== 'all') {
        if (statusFilter.value === 'active') {
          filtered = filtered.filter(
            p => p.status === 'active' || p.status === 'contractor_selected'
          )
        } else {
          filtered = filtered.filter(p => p.status === statusFilter.value)
        }
      }

      return {
        total: mockAdminProjects.length,
        active: filtered.filter(
          p => p.status === 'active' || p.status === 'contractor_selected'
        ).length,
        onHold: filtered.filter(p => p.status === 'on_hold').length,
        completed: filtered.filter(p => p.status === 'completed').length,
      }
    } else {
      // Real API: use pagination data from last fetch
      return {
        total: pagination.value.total,
        active: projects.value.filter(
          p => p.status === 'active' || p.status === 'contractor_selected'
        ).length,
        onHold: projects.value.filter(p => p.status === 'on_hold').length,
        completed: projects.value.filter(p => p.status === 'completed').length,
      }
    }
  })

  // Expose computed milestone progress for each project
  const getProjectProgress = (project: AdminProjectOverviewItem) => {
    if (!project.milestones || project.milestones.length === 0) {
      return { completed: 0, total: 0, percent: 0 }
    }

    const completed = project.milestones.filter(m => {
      if (!m || typeof m !== 'object') return false
      return m.status === 'approved' || m.status === 'completed'
    }).length
    const total = project.milestones.length
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0

    return { completed, total, percent }
  }

  return {
    projects: readonly(projects),
    loading: readonly(loading),
    error: readonly(error),
    statusFilter: readonly(statusFilter),
    searchQuery: readonly(searchQuery),
    currentPage: readonly(currentPage),
    pagination: readonly(pagination),
    summaryCards,
    handleSearch,
    handleStatusFilter,
    handlePageChange,
    fetchProjects,
    getProjectProgress,
  }
}
