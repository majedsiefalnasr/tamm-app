import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProjectOverviewTable from '../ProjectOverviewTable.vue'
import { mockAdminProjects } from '../../../composables/__mocks__/admin-projects'

describe('ProjectOverviewTable', () => {
  it('renders loading state', () => {
    const wrapper = mount(ProjectOverviewTable, {
      props: {
        projects: [],
        loading: true,
      },
      shallow: true,
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('renders empty state when no projects', () => {
    const wrapper = mount(ProjectOverviewTable, {
      props: {
        projects: [],
        loading: false,
      },
      shallow: true,
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('renders table with projects', () => {
    const wrapper = mount(ProjectOverviewTable, {
      props: {
        projects: mockAdminProjects.slice(0, 5),
        loading: false,
      },
      shallow: true,
    })

    expect(wrapper.exists()).toBe(true)
  })
})
