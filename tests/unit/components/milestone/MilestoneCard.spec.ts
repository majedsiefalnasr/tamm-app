import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import MilestoneCard from '~/components/milestone/MilestoneCard.vue'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

const milestone: any = {
  id: 'ms-1',
  name: 'Foundation Work',
  amount: 50000,
  order: 1,
  status: 'in_progress',
  tasks: [],
}

const project: any = {
  id: 'proj-1',
  name: 'Test Project',
  status: 'active',
  milestones: [milestone],
}

describe('MilestoneCard', () => {
  it('mounts with baseline props', () => {
    const wrapper = mount(MilestoneCard, {
      props: { milestone, project },
      shallow: true,
      global: {
        mocks: {
          $t: (key: string) => key,
        },
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders milestone title content', () => {
    const wrapper = mount(MilestoneCard, {
      props: { milestone, project },
      shallow: true,
      global: {
        mocks: {
          $t: (key: string) => key,
        },
      },
    })
    expect(wrapper.text()).toContain('Foundation Work')
  })
})
