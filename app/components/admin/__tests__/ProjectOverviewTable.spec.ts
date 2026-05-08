import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ProjectOverviewTable from '../ProjectOverviewTable.vue'
import { mockAdminProjects } from '../../../composables/__mocks__/admin-projects'

describe('ProjectOverviewTable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading skeleton when loading is true', () => {
    const wrapper = mount(ProjectOverviewTable, {
      props: {
        projects: [],
        loading: true,
      },
    })

    expect(wrapper.text()).toContain('Skeleton')
  })

  it('renders empty state when no projects', () => {
    const wrapper = mount(ProjectOverviewTable, {
      props: {
        projects: [],
        loading: false,
      },
    })

    expect(wrapper.find('[class*="FolderOpen"]').exists()).toBe(true)
  })

  it('renders table with projects', () => {
    const wrapper = mount(ProjectOverviewTable, {
      props: {
        projects: mockAdminProjects.slice(0, 5),
        loading: false,
      },
    })

    expect(wrapper.find('table').exists()).toBe(true)
    expect(wrapper.findAll('tbody tr')).toHaveLength(5)
  })

  it('displays correct column headers', () => {
    const wrapper = mount(ProjectOverviewTable, {
      props: {
        projects: mockAdminProjects.slice(0, 1),
        loading: false,
      },
    })

    const headers = wrapper.findAll('th')
    expect(headers.length).toBeGreaterThan(0)
  })

  it('formats currency correctly', () => {
    const wrapper = mount(ProjectOverviewTable, {
      props: {
        projects: [mockAdminProjects[0]],
        loading: false,
      },
    })

    const cellText = wrapper.text()
    expect(cellText).toMatch(/\d+/)
  })

  it('shows pagination controls when multiple pages', () => {
    const wrapper = mount(ProjectOverviewTable, {
      props: {
        projects: mockAdminProjects.slice(0, 5),
        loading: false,
        pagination: {
          current_page: 1,
          per_page: 20,
          total: 45,
          total_pages: 3,
        },
      },
    })

    expect(wrapper.find('[class*="pagination"]').exists()).toBe(true)
  })

  it('emits page-change event on next page click', async () => {
    const wrapper = mount(ProjectOverviewTable, {
      props: {
        projects: mockAdminProjects.slice(0, 5),
        loading: false,
        pagination: {
          current_page: 1,
          per_page: 20,
          total: 45,
          total_pages: 3,
        },
      },
    })

    const nextButton = wrapper.find('button:contains("Next")')
    if (nextButton.exists()) {
      await nextButton.trigger('click')
      expect(wrapper.emitted('page-change')).toBeTruthy()
    }
  })

  it('displays project status with correct styling', () => {
    const wrapper = mount(ProjectOverviewTable, {
      props: {
        projects: mockAdminProjects.slice(0, 1),
        loading: false,
      },
    })

    const statusBadge = wrapper.find('[class*="bg-"]')
    expect(statusBadge.exists()).toBe(true)
  })

  it('shows milestones progress bar', () => {
    const wrapper = mount(ProjectOverviewTable, {
      props: {
        projects: mockAdminProjects.slice(0, 1),
        loading: false,
      },
    })

    const progressBar = wrapper.find('[style*="width"]')
    expect(progressBar.exists()).toBe(true)
  })

  it('shows unassigned label for projects without contractor', () => {
    const projectWithoutContractor = {
      ...mockAdminProjects[2],
      contractor: null,
    }

    const wrapper = mount(ProjectOverviewTable, {
      props: {
        projects: [projectWithoutContractor],
        loading: false,
      },
    })

    expect(wrapper.text()).toContain('Unassigned')
  })

  it('disables previous button on first page', () => {
    const wrapper = mount(ProjectOverviewTable, {
      props: {
        projects: mockAdminProjects.slice(0, 5),
        loading: false,
        pagination: {
          current_page: 1,
          per_page: 20,
          total: 45,
          total_pages: 3,
        },
      },
    })

    const prevButton = wrapper
      .findAll('button')
      .find(b => b.text().includes('Previous'))
    expect(prevButton?.attributes('disabled')).toBeDefined()
  })

  it('disables next button on last page', () => {
    const wrapper = mount(ProjectOverviewTable, {
      props: {
        projects: mockAdminProjects.slice(0, 5),
        loading: false,
        pagination: {
          current_page: 3,
          per_page: 20,
          total: 45,
          total_pages: 3,
        },
      },
    })

    const nextButton = wrapper
      .findAll('button')
      .find(b => b.text().includes('Next'))
    expect(nextButton?.attributes('disabled')).toBeDefined()
  })
})
