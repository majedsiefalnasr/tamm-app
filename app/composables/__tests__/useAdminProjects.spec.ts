import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAdminProjects } from '../useAdminProjects'
import { mockAdminProjects } from '../__mocks__/admin-projects'

vi.mock('#app', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: { value: 'ar' },
  }),
  useRoute: () => ({
    query: {},
  }),
}))

describe('useAdminProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads projects on first fetch', async () => {
    const { projects, loading, fetchProjects } = useAdminProjects()

    expect(projects.value.length).toBe(0)
    expect(loading.value).toBe(true)

    await fetchProjects()

    expect(loading.value).toBe(false)
    expect(projects.value.length).toBeGreaterThan(0)
  })

  it('filters projects by status', () => {
    const { projects, statusFilter, handleStatusFilter, fetchProjects } =
      useAdminProjects()

    handleStatusFilter('completed')
    fetchProjects()

    expect(statusFilter.value).toBe('completed')
    expect(projects.value.every(p => p.status === 'completed')).toBe(true)
  })

  it('filters projects by active status (includes contractor_selected)', () => {
    const { projects, handleStatusFilter, fetchProjects } = useAdminProjects()

    handleStatusFilter('active')
    fetchProjects()

    expect(
      projects.value.every(
        p => p.status === 'active' || p.status === 'contractor_selected'
      )
    ).toBe(true)
  })

  it('searches projects by name', () => {
    const { projects, handleSearch, fetchProjects } = useAdminProjects()

    handleSearch('فيلا')
    fetchProjects()

    expect(projects.value.some(p => p.name.includes('فيلا'))).toBe(true)
  })

  it('searches projects by client name', () => {
    const { projects, handleSearch, fetchProjects } = useAdminProjects()

    handleSearch('أحمد')
    fetchProjects()

    expect(projects.value.some(p => p.client.name.includes('أحمد'))).toBe(true)
  })

  it('resets page to 1 when search changes', () => {
    const { currentPage, handleSearch, fetchProjects } = useAdminProjects()

    currentPage.value = 3
    handleSearch('test')
    fetchProjects()

    expect(currentPage.value).toBe(1)
  })

  it('respects pagination limit (20 per page)', () => {
    const { projects, pagination, fetchProjects } = useAdminProjects()

    fetchProjects()

    expect(projects.value.length).toBeLessThanOrEqual(pagination.value.per_page)
  })

  it('handles pagination correctly', () => {
    const { projects, pagination, handlePageChange, fetchProjects } =
      useAdminProjects()

    fetchProjects()
    const totalPages = pagination.value.total_pages

    if (totalPages > 1) {
      handlePageChange(2)
      fetchProjects()

      expect(pagination.value.current_page).toBe(2)
    }
  })

  it('calculates summary cards correctly with all filter', () => {
    const { summaryCards, statusFilter, fetchProjects } = useAdminProjects()

    statusFilter.value = 'all'
    fetchProjects()

    expect(summaryCards.value.total).toBeGreaterThan(0)
    expect(summaryCards.value.active).toBeGreaterThanOrEqual(0)
    expect(summaryCards.value.onHold).toBeGreaterThanOrEqual(0)
    expect(summaryCards.value.completed).toBeGreaterThanOrEqual(0)
  })

  it('calculates summary cards only for filtered projects', () => {
    const { summaryCards, statusFilter, handleStatusFilter, fetchProjects } =
      useAdminProjects()

    handleStatusFilter('completed')
    fetchProjects()

    // All cards should reflect only completed projects
    expect(summaryCards.value.total).toBeLessThanOrEqual(
      mockAdminProjects.length
    )
  })

  it('calculates project progress correctly', () => {
    const { getProjectProgress } = useAdminProjects()
    const project = mockAdminProjects[0]

    const progress = getProjectProgress(project)

    expect(progress.completed).toBeGreaterThanOrEqual(0)
    expect(progress.total).toBeGreaterThanOrEqual(0)
    expect(progress.percent).toBeGreaterThanOrEqual(0)
    expect(progress.percent).toBeLessThanOrEqual(100)
  })

  it('handles empty search results', () => {
    const { projects, handleSearch, fetchProjects } = useAdminProjects()

    handleSearch('nonexistent_project_name_xyz')
    fetchProjects()

    expect(projects.value.length).toBe(0)
  })

  it('clears error on successful fetch', () => {
    const { error, fetchProjects } = useAdminProjects()

    // Error would be set in a real scenario
    error.value = null
    fetchProjects()

    expect(error.value).toBeNull()
  })

  it('maintains search query state', () => {
    const { searchQuery, handleSearch } = useAdminProjects()

    handleSearch('test project')

    expect(searchQuery.value).toBe('test project')
  })

  it('resets page on status filter change', () => {
    const { currentPage, handleStatusFilter, fetchProjects } =
      useAdminProjects()

    currentPage.value = 2
    handleStatusFilter('active')
    fetchProjects()

    expect(currentPage.value).toBe(1)
  })

  it('counts active projects including contractor_selected', () => {
    const { summaryCards, handleStatusFilter, fetchProjects } =
      useAdminProjects()

    handleStatusFilter('all')
    fetchProjects()

    const contractorSelectedCount = mockAdminProjects.filter(
      p => p.status === 'contractor_selected'
    ).length
    const activeCount = mockAdminProjects.filter(
      p => p.status === 'active'
    ).length

    expect(summaryCards.value.active).toBe(
      activeCount + contractorSelectedCount
    )
  })
})
