import { describe, it, expect, beforeEach, vi } from 'vitest'
import { usePayments } from '../usePayments'

// Mock the composables
vi.mock('../useMilestones', () => ({
  useMilestones: () => ({
    getMilestones: (projectId: string) => {
      const mockData: Record<string, any[]> = {
        'proj-001': [
          {
            id: 'ms-1',
            name: 'Foundation',
            amount: 50000,
            status: 'approved',
          },
          {
            id: 'ms-2',
            name: 'Walls',
            amount: 75000,
            status: 'in_progress',
          },
        ],
        'proj-002': [
          {
            id: 'ms-3',
            name: 'Final',
            amount: 125000,
            status: 'draft',
          },
        ],
      }
      return mockData[projectId] || []
    },
  }),
}))

vi.mock('../useProjects', () => ({
  useProjects: () => ({
    projects: {
      value: [
        { id: 'proj-001', name: 'Project 1' },
        { id: 'proj-002', name: 'Project 2' },
      ],
    },
  }),
}))

vi.mock('~/utils/statusMachine', () => ({
  derivePaymentStatus: (status: string) => {
    const mapping: Record<string, string> = {
      approved: 'paid',
      in_progress: 'processing',
      draft: 'pending',
    }
    return mapping[status] || status
  },
}))

describe('usePayments', () => {
  let payments: any

  beforeEach(() => {
    payments = usePayments()
  })

  it('calculates dashboard totals correctly', () => {
    const totals = payments.dashboardTotals.value

    // Total committed = all milestones: 50000 + 75000 + 125000 = 250000
    expect(totals.committed).toBe(250000)

    // In escrow = only 'paid' status: in_progress (75000)
    expect(totals.inEscrow).toBe(75000)

    // Paid out = only 'paid' status: approved (50000)
    expect(totals.paidOut).toBe(50000)
  })

  it('calculates project financials correctly', () => {
    const proj1 = payments.getProjectFinancials('proj-001')

    // Value = sum of all milestones: 50000 + 75000 = 125000
    expect(proj1.value).toBe(125000)

    // Paid = milestones in [awaiting_release, processing, paid]
    // approved (50000) and in_progress (75000) = 125000
    expect(proj1.paid).toBe(125000)

    // In escrow = only 'paid' status (75000)
    expect(proj1.inEscrow).toBe(75000)

    // Remaining = value - paid = 0
    expect(proj1.remaining).toBe(0)
  })

  it('returns zero for non-existent project', () => {
    const proj = payments.getProjectFinancials('non-existent')

    expect(proj.value).toBe(0)
    expect(proj.paid).toBe(0)
    expect(proj.inEscrow).toBe(0)
    expect(proj.remaining).toBe(0)
  })

  it('ensures remaining never goes negative', () => {
    // Even if somehow paid > value, remaining should be 0
    const proj1 = payments.getProjectFinancials('proj-001')
    expect(proj1.remaining).toBeGreaterThanOrEqual(0)
  })
})
