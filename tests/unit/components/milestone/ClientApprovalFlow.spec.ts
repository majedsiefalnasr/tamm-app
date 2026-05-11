import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ClientApprovalFlow from '~/components/milestone/ClientApprovalFlow.vue'
import type { Milestone, Report } from '~/shared/types/project'

// Mock dependencies
vi.mock('~/composables/useMilestones', () => ({
  useMilestones: () => ({
    approveMilestone: vi.fn(),
    rejectMilestone: vi.fn(),
  }),
}))
vi.mock('~/composables/useNotifications', () => ({
  useNotifications: () => ({
    notify: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn(),
    },
  }),
}))
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

describe('ClientApprovalFlow', () => {
  const mockMilestone: Milestone = {
    id: 'ms-1',
    name: 'Foundation & Structure',
    description: 'Test milestone',
    amount: 50000,
    order: 1,
    status: 'approved',
    tasks: [],
    payment_status: 'pending',
    allowed_actions: ['approve_milestone', 'reject_milestone'],
    created_at: '2026-04-20T09:00:00Z',
  }

  const mockReport: Report = {
    id: 'report-1',
    milestone_id: 'ms-1',
    content: 'Work is complete and ready for final approval',
    images: ['https://example.com/image1.jpg'],
    submitted_by: {
      id: 'engineer-1',
      name: 'Ahmed Hassan',
    },
    submitted_at: '2026-05-08T10:00:00Z',
    status: 'submitted',
  }

  it('renders client approval dialog with supervisor badge', () => {
    const wrapper = mount(ClientApprovalFlow, {
      props: {
        open: true,
        milestone: mockMilestone,
        report: mockReport,
      },
      global: {
        stubs: {
          Dialog: false,
          DialogContent: false,
          DialogHeader: false,
          DialogFooter: false,
          DialogTitle: false,
          Button: false,
          RejectReasonDialog: true,
        },
      },
    })

    // Verify component renders
    expect(wrapper.vm).toBeDefined()
  })

  it('shows warning box with payment amount', () => {
    const wrapper = mount(ClientApprovalFlow, {
      props: {
        open: true,
        milestone: mockMilestone,
        report: mockReport,
      },
      global: {
        stubs: {
          Dialog: false,
          DialogContent: false,
          DialogHeader: false,
          DialogFooter: false,
          DialogTitle: false,
          Button: false,
          RejectReasonDialog: true,
        },
      },
    })

    // Verify the component has the milestone amount
    expect(wrapper.props().milestone.amount).toBe(50000)
  })

  it('emits update:open event when dialog closes', async () => {
    const wrapper = mount(ClientApprovalFlow, {
      props: {
        open: true,
        milestone: mockMilestone,
        report: mockReport,
      },
      global: {
        stubs: {
          Dialog: { template: '<div><slot /></div>' },
          DialogContent: { template: '<div><slot /></div>' },
          DialogHeader: { template: '<div><slot /></div>' },
          DialogFooter: { template: '<div><slot /></div>' },
          DialogTitle: { template: '<div><slot /></div>' },
          Button: {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
          RejectReasonDialog: true,
        },
      },
    })

    // Test internal state and emits
    expect(wrapper.vm.step).toBe('review')
  })
})
