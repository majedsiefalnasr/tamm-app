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

  const fetchProjects = async () => {
    loading.value = true
    error.value = null
    try {
      if (USE_MOCK) {
        // Mock implementation with client-side filtering and pagination
        let filtered = mockAdminProjects

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

        // Calculate pagination
        const total = filtered.length
        const perPage = 20
        const totalPages = Math.ceil(total / perPage)
        const startIdx = (currentPage.value - 1) * perPage
        const endIdx = startIdx + perPage

        pagination.value = {
          current_page: currentPage.value,
          per_page: perPage,
          total,
          total_pages: totalPages,
        }

        projects.value = filtered.slice(startIdx, endIdx)
      } else {
        // Real API implementation
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
        const data = response as AdminProjectsResponse

        projects.value = data.data || []
        pagination.value = data.pagination || {
          current_page: 1,
          per_page: 20,
          total: 0,
          total_pages: 0,
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
    const allFiltered = projects.value

    // If showing multiple pages, we need total counts from pagination
    const statusFilteredTotal =
      statusFilter.value === 'all' ? pagination.value.total : allFiltered.length

    return {
      total: pagination.value.total,
      active: allFiltered.filter(
        p => p.status === 'active' || p.status === 'contractor_selected'
      ).length,
      onHold: allFiltered.filter(p => p.status === 'on_hold').length,
      completed: allFiltered.filter(p => p.status === 'completed').length,
    }
  })

  // Expose computed milestone progress for each project
  const getProjectProgress = (project: AdminProjectOverviewItem) => {
    if (!project.milestones || project.milestones.length === 0) {
      return { completed: 0, total: 0, percent: 0 }
    }

    const completed = project.milestones.filter(
      m => m.status === 'approved' || m.status === 'completed'
    ).length
    const total = project.milestones.length
    const percent = Math.round((completed / total) * 100)

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
