import { ref, computed, readonly, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import type {
  AdminProjectOverviewItem,
  AdminProjectsResponse,
  AdminProjectStatus,
} from '#shared/types/project'
import { derivePaymentStatus } from '~/utils/statusMachine'
import { mockAdminProjects } from './__mocks__/admin-projects'

const API_ENDPOINT = '/admin/projects'
const USE_MOCK = true // Set to false when API is available
const DEBOUNCE_MS = 300

const STATUS_QUERY_VALUES: AdminProjectStatus[] = [
  'all',
  'new',
  'open_for_bids',
  'under_review',
  'contractor_selected',
  'active',
  'on_hold',
  'completed',
]

function statusFromRouteQuery(
  raw: string | string[] | null | undefined
): AdminProjectStatus | null {
  const s = Array.isArray(raw) ? raw[0] : raw
  if (!s) return null
  return STATUS_QUERY_VALUES.includes(s as AdminProjectStatus)
    ? (s as AdminProjectStatus)
    : null
}

export function useAdminProjects() {
  const route = useRoute()

  const projects = ref<AdminProjectOverviewItem[]>([])
  /** True until first fetch completes (avoids empty UI flash before onMounted) */
  const loading = ref(true)
  const error = ref<string | null>(null)
  const statusFilter = ref<AdminProjectStatus>(
    statusFromRouteQuery(route.query.status) ?? 'all'
  )
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

    const mq = route.query.milestone_review
    const milestoneReviewOn =
      mq === '1' ||
      mq === 'true' ||
      (Array.isArray(mq) && mq.some(v => v === '1' || v === 'true'))
    if (milestoneReviewOn) {
      filtered = filtered.filter(p =>
        p.milestones.some(m => m.status === 'under_review')
      )
    }

    const pr = route.query.payment_release
    const paymentReleaseOn =
      pr === '1' ||
      pr === 'true' ||
      (Array.isArray(pr) && pr.some(v => v === '1' || v === 'true'))
    if (paymentReleaseOn) {
      filtered = filtered.filter(p =>
        p.milestones.some(m => derivePaymentStatus(m.status) === 'processing')
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

  watch(
    () => route.query,
    () => {
      const next = statusFromRouteQuery(route.query.status)
      if (next !== null) {
        statusFilter.value = next
      }
      currentPage.value = 1
      fetchProjects()
    },
    { deep: true }
  )

  function computeSummaryCounts(dataset: AdminProjectOverviewItem[]) {
    return {
      total: dataset.length,
      active: dataset.filter(
        p => p.status === 'active' || p.status === 'contractor_selected'
      ).length,
      onHold: dataset.filter(p => p.status === 'on_hold').length,
      completed: dataset.filter(p => p.status === 'completed').length,
    }
  }

  // Summary card calculations — always global (must not change with table filters).
  const summaryCards = computed(() => {
    if (USE_MOCK) {
      return computeSummaryCounts(mockAdminProjects)
    } else {
      // Real API currently returns paginated rows only; keep values stable and global-like:
      // - `total` comes from backend pagination metadata
      // - status buckets are derived from the currently loaded dataset snapshot
      const currentSnapshot = computeSummaryCounts(projects.value)
      return {
        total: pagination.value.total,
        active: currentSnapshot.active,
        onHold: currentSnapshot.onHold,
        completed: currentSnapshot.completed,
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
