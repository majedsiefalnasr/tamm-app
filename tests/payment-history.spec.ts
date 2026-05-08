import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import PaymentHistoryPage from '~/pages/payments.vue'
import PaymentSection from '~/components/payment/PaymentSection.vue'
import PaymentRow from '~/components/payment/PaymentRow.vue'
import { defineStore } from 'pinia'
import { setActivePinia, createPinia } from 'pinia'

// Mock i18n
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      payment: {
        heading: 'Payments',
        subtitle: 'Track your payment history across all projects',
        label: {
          pending_total: 'Pending total',
          received_total: 'Received total',
        },
        section: {
          pending: 'Pending payments',
          received: 'Received payments',
        },
        empty: {
          none: 'No payments yet',
          description:
            'Once milestones are completed and approved, payments will appear here.',
        },
      },
      common: {
        cancel: 'Cancel',
        confirm: 'Confirm',
        none: 'No items',
        project: 'Project',
        milestone: 'Milestone',
        amount: 'Amount',
        date: 'Date',
        payment_plural: 'payments',
      },
    },
  },
})

// Mock useMilestones composable
const mockMilestones = [
  {
    id: 'ms-1',
    name: 'Foundation & Structure',
    amount: 50000,
    status: 'supervisor_approved',
    created_at: '2026-04-20T09:00:00Z',
    project_id: 'proj-001',
    project: { id: 'proj-001', name: 'Building A' },
  },
  {
    id: 'ms-2',
    name: 'Walls & Finishing',
    amount: 75000,
    status: 'approved',
    created_at: '2026-05-01T09:00:00Z',
    project_id: 'proj-001',
    project: { id: 'proj-001', name: 'Building A' },
  },
  {
    id: 'ms-3',
    name: 'Final Handover',
    amount: 125000,
    status: 'paid_out',
    created_at: '2026-05-05T09:00:00Z',
    project_id: 'proj-001',
    project: { id: 'proj-001', name: 'Building A' },
  },
]

vi.stubGlobal('useMilestones', () => ({
  milestones: mockMilestones,
  loading: false,
  error: null,
  fetchMilestones: vi.fn(async () => mockMilestones),
}))

vi.stubGlobal('useAuthStore', () => ({
  user: { id: 'user-123', role: 'contractor' },
  isLoggedIn: true,
}))

describe('PaymentSection Component', () => {
  it('renders section title with count', () => {
    const wrapper = mount(PaymentSection, {
      props: {
        title: 'Pending Payments',
        payments: mockMilestones.slice(0, 2),
        count: 2,
      },
      global: {
        plugins: [i18n],
        stubs: {
          PaymentRow: true,
        },
      },
    })

    expect(wrapper.text()).toContain('Pending Payments')
    expect(wrapper.text()).toContain('(2)')
  })

  it('shows empty state when no payments', () => {
    const wrapper = mount(PaymentSection, {
      props: {
        title: 'Pending Payments',
        payments: [],
        count: 0,
      },
      global: {
        plugins: [i18n],
        stubs: {
          PaymentRow: true,
        },
      },
    })

    expect(wrapper.text()).toContain('No items')
  })
})

describe('PaymentRow Component', () => {
  it('renders milestone details correctly', () => {
    const wrapper = mount(PaymentRow, {
      props: {
        payment: mockMilestones[0],
      },
      global: {
        plugins: [i18n],
        stubs: {
          PaymentStatusTag: true,
        },
      },
    })

    expect(wrapper.text()).toContain('Building A')
    expect(wrapper.text()).toContain('Foundation & Structure')
    expect(wrapper.text()).toContain('50000')
  })
})

describe('Payment Status Filtering', () => {
  it('correctly filters pending payments', () => {
    const pending = mockMilestones.filter(m =>
      ['supervisor_approved', 'approved'].includes(m.status)
    )
    expect(pending).toHaveLength(2)
    expect(pending[0].status).toBe('supervisor_approved')
    expect(pending[1].status).toBe('approved')
  })

  it('correctly filters received payments', () => {
    const received = mockMilestones.filter(m => m.status === 'paid_out')
    expect(received).toHaveLength(1)
    expect(received[0].status).toBe('paid_out')
  })

  it('calculates pending total correctly', () => {
    const pending = mockMilestones.filter(m =>
      ['supervisor_approved', 'approved'].includes(m.status)
    )
    const total = pending.reduce((sum, m) => sum + m.amount, 0)
    expect(total).toBe(125000)
  })

  it('calculates received total correctly', () => {
    const received = mockMilestones.filter(m => m.status === 'paid_out')
    const total = received.reduce((sum, m) => sum + m.amount, 0)
    expect(total).toBe(125000)
  })
})
