import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MilestoneDetail from '~/components/milestone/MilestoneDetail.vue'
import type { Milestone } from '~/shared/types/project'
import { createI18n } from 'vue-i18n'

const i18n = createI18n({
  locale: 'en',
  messages: {
    en: {
      milestone: {
        detail: {
          details: 'Milestone Details',
          phase: 'Phase',
          phaseNumber: 'Phase {number}',
          status: 'Status',
          budget: 'Budget',
          tasks: 'Tasks',
          noTasks: 'No tasks defined',
          assignedTo: 'Assigned to: {name}',
          paymentStatus: 'Payment Status',
        },
        status: {
          draft: 'Draft',
          in_progress: 'In Progress',
          under_review: 'Under Review',
          approved: 'Approved',
          rejected: 'Rejected',
        },
      },
      common: {
        completed: 'Completed',
      },
    },
  },
})

describe('MilestoneDetail Component', () => {
  let mockMilestone: Milestone

  beforeEach(() => {
    mockMilestone = {
      id: 'ms-1',
      name: 'Foundation Work',
      description: 'Foundation and structure',
      amount: 50000,
      order: 1,
      status: 'in_progress',
      tasks: [
        {
          id: 'task-1',
          milestone_id: 'ms-1',
          title: 'Excavation',
          contractor: { id: 'cont-1', name: 'John Contractor' },
          completed: true,
        },
        {
          id: 'task-2',
          milestone_id: 'ms-1',
          title: 'Foundation',
          contractor: { id: 'cont-1', name: 'John Contractor' },
          completed: false,
        },
      ],
      latest_report: undefined,
      payment_status: 'pending',
      allowed_actions: [],
      created_at: '2026-05-01T10:00:00Z',
    }
  })

  it('should render phase number', () => {
    const wrapper = mount(MilestoneDetail, {
      props: { milestone: mockMilestone },
      global: { plugins: [i18n] },
    })

    expect(wrapper.text()).toContain('Phase 1')
  })

  it('should render milestone status', () => {
    const wrapper = mount(MilestoneDetail, {
      props: { milestone: mockMilestone },
      global: { plugins: [i18n] },
    })

    expect(wrapper.text()).toContain('In Progress')
  })

  it('should render budget amount', () => {
    const wrapper = mount(MilestoneDetail, {
      props: { milestone: mockMilestone },
      global: { plugins: [i18n] },
    })

    // Budget should be displayed (formatted)
    expect(wrapper.text()).toMatch(/50[, ]?000|EGP/i)
  })

  it('should render payment status', () => {
    const wrapper = mount(MilestoneDetail, {
      props: { milestone: mockMilestone },
      global: { plugins: [i18n] },
    })

    expect(wrapper.text()).toContain('Payment Status')
  })

  it('should render all tasks with titles', () => {
    const wrapper = mount(MilestoneDetail, {
      props: { milestone: mockMilestone },
      global: { plugins: [i18n] },
    })

    expect(wrapper.text()).toContain('Excavation')
    expect(wrapper.text()).toContain('Foundation')
  })

  it('should render completion status for tasks', () => {
    const wrapper = mount(MilestoneDetail, {
      props: { milestone: mockMilestone },
      global: { plugins: [i18n] },
    })

    // First task is completed
    const text = wrapper.text()
    expect(text).toContain('Excavation')
    expect(text).toContain('Completed')
  })

  it('should render assigned contractor names', () => {
    const wrapper = mount(MilestoneDetail, {
      props: { milestone: mockMilestone },
      global: { plugins: [i18n] },
    })

    expect(wrapper.text()).toContain('John Contractor')
  })

  it('should display empty state when no tasks', () => {
    const noTasksMilestone = { ...mockMilestone, tasks: [] }
    const wrapper = mount(MilestoneDetail, {
      props: { milestone: noTasksMilestone },
      global: { plugins: [i18n] },
    })

    expect(wrapper.text()).toContain('No tasks defined')
  })

  it('should render all metadata fields', () => {
    const wrapper = mount(MilestoneDetail, {
      props: { milestone: mockMilestone },
      global: { plugins: [i18n] },
    })

    const text = wrapper.text()
    expect(text).toContain('Phase')
    expect(text).toContain('Status')
    expect(text).toContain('Budget')
    expect(text).toContain('Tasks')
  })
})
