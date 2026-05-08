import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import MilestoneCard from '~/components/milestone/MilestoneCard.vue'
import type { Milestone, ProjectDetail } from '~/shared/types/project'
import { createI18n } from 'vue-i18n'

const i18n = createI18n({
  locale: 'en',
  messages: {
    en: {
      common: { expand: 'Expand', collapse: 'Collapse' },
      milestone: {
        status: {
          notStarted: 'Not Started',
          inProgress: 'In Progress',
          underReview: 'Under Review',
          supervisorApproved: 'Supervisor Approved',
          approved: 'Approved',
          rejected: 'Rejected',
        },
        section: {
          tasks: 'Tasks',
          latestReport: 'Latest Report',
          paymentStatus: 'Payment Status',
        },
        emptyState: {
          noTasks: 'No tasks defined',
        },
        actions: {
          submitReport: 'Submit Report',
          approveMilestone: 'Approve Milestone',
        },
      },
      payment: {
        status: {
          pending_payment: 'Pending Payment',
          paid: 'Paid',
          awaiting_approval: 'Awaiting Approval',
          ready_for_payout: 'Ready for Payout',
          paid_out: 'Paid Out',
        },
      },
    },
  },
})

describe('MilestoneCard', () => {
  let mockMilestone: Milestone
  let mockProject: ProjectDetail

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
          completed: true,
        },
        {
          id: 'task-2',
          milestone_id: 'ms-1',
          title: 'Foundation',
          completed: false,
        },
      ],
      latest_report: {
        id: 'report-1',
        milestone_id: 'ms-1',
        content: 'Work is progressing well',
        images: [],
        status: 'submitted',
        submitted_at: '2026-05-08T10:00:00Z',
      },
      payment_status: 'pending_payment',
      allowed_actions: ['submit_report'],
      created_at: '2026-04-20T09:00:00Z',
      updated_at: '2026-05-08T10:00:00Z',
    }

    mockProject = {
      id: 'proj-1',
      name: 'Test Project',
      description: 'Test description',
      city: 'Cairo',
      area_m2: 500,
      type: 'villa',
      budget: 500000,
      currency: 'EGP',
      status: 'active',
      client_id: 'client-1',
      client_name: 'Test Client',
      total_amount: 500000,
      total_paid: 0,
      created_at: '2026-04-01T09:00:00Z',
      milestones: [mockMilestone],
    }
  })

  it('renders card with milestone information', () => {
    const wrapper = mount(MilestoneCard, {
      props: {
        milestone: mockMilestone,
        project: mockProject,
      },
      global: {
        plugins: [i18n],
        stubs: {
          StatusTag: true,
          MilestoneActions: true,
          Button: true,
          ChevronDownIcon: true,
        },
      },
    })

    expect(wrapper.text()).toContain('Foundation Work')
    expect(wrapper.text()).toContain('50000')
  })

  it('displays phase order number correctly', () => {
    const wrapper = mount(MilestoneCard, {
      props: {
        milestone: mockMilestone,
        project: mockProject,
      },
      global: {
        plugins: [i18n],
        stubs: {
          StatusTag: true,
          MilestoneActions: true,
          Button: true,
          ChevronDownIcon: true,
        },
      },
    })

    expect(wrapper.text()).toContain('1')
  })

  it('toggles expand/collapse on chevron click', async () => {
    const wrapper = mount(MilestoneCard, {
      props: {
        milestone: mockMilestone,
        project: mockProject,
      },
      global: {
        plugins: [i18n],
        stubs: {
          StatusTag: true,
          MilestoneActions: true,
          Button: true,
          ChevronDownIcon: true,
        },
      },
    })

    expect(wrapper.find('[role="button"]').exists()).toBe(true)
    await wrapper.find('[role="button"]').trigger('click')

    // Verify expanded content is visible
    const content = wrapper.find('[class*="space-y-4"]')
    expect(content.exists()).toBe(true)
  })

  it('renders tasks when expanded', async () => {
    const wrapper = mount(MilestoneCard, {
      props: {
        milestone: mockMilestone,
        project: mockProject,
      },
      global: {
        plugins: [i18n],
        stubs: {
          StatusTag: true,
          MilestoneActions: true,
          Button: true,
          ChevronDownIcon: true,
        },
      },
    })

    // Expand the card
    await wrapper.find('[role="button"]').trigger('click')

    expect(wrapper.text()).toContain('Tasks')
    expect(wrapper.text()).toContain('Excavation')
    expect(wrapper.text()).toContain('Foundation')
  })

  it('renders empty state when no tasks', async () => {
    const milestoneNoTasks = { ...mockMilestone, tasks: [] }

    const wrapper = mount(MilestoneCard, {
      props: {
        milestone: milestoneNoTasks,
        project: mockProject,
      },
      global: {
        plugins: [i18n],
        stubs: {
          StatusTag: true,
          MilestoneActions: true,
          Button: true,
          ChevronDownIcon: true,
        },
      },
    })

    // Expand the card
    await wrapper.find('[role="button"]').trigger('click')

    expect(wrapper.text()).toContain('No tasks defined')
  })

  it('applies correct styling based on expanded state', async () => {
    const wrapper = mount(MilestoneCard, {
      props: {
        milestone: mockMilestone,
        project: mockProject,
      },
      global: {
        plugins: [i18n],
        stubs: {
          StatusTag: true,
          MilestoneActions: true,
          Button: true,
          ChevronDownIcon: true,
        },
      },
    })

    const card = wrapper.find('div[class*="rounded-2xl"]')
    expect(card.classes()).toContain('border-border')

    // Expand and check style changes
    await wrapper.find('[role="button"]').trigger('click')
    expect(card.classes()).toContain('border-primary/40')
  })

  it('displays progress bar when in_progress', () => {
    const wrapper = mount(MilestoneCard, {
      props: {
        milestone: mockMilestone,
        project: mockProject,
      },
      global: {
        plugins: [i18n],
        stubs: {
          StatusTag: true,
          MilestoneActions: true,
          Button: true,
          ChevronDownIcon: true,
        },
      },
    })

    const progressBar = wrapper.find('[class*="h-1.5"]')
    expect(progressBar.exists()).toBe(true)
  })

  it('hides progress bar when not_started', () => {
    const milestoneNotStarted = {
      ...mockMilestone,
      status: 'not_started' as const,
    }

    const wrapper = mount(MilestoneCard, {
      props: {
        milestone: milestoneNotStarted,
        project: mockProject,
      },
      global: {
        plugins: [i18n],
        stubs: {
          StatusTag: true,
          MilestoneActions: true,
          Button: true,
          ChevronDownIcon: true,
        },
      },
    })

    const progressBar = wrapper.find('[class*="h-1.5"]')
    expect(progressBar.exists()).toBe(false)
  })
})
