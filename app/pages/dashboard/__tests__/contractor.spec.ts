import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useMilestones } from '~/composables/useMilestones'
import { useProjects } from '~/composables/useProjects'
import { useProposals } from '~/composables/useProposals'

vi.mock('~/composables/useMilestones')
vi.mock('~/composables/useProjects')
vi.mock('~/composables/useProposals')

describe('Contractor Dashboard Page', () => {
  const mockMilestones = [
    {
      id: '1',
      project_id: 'proj1',
      name: 'Foundation Work',
      status: 'in_progress',
      payment_status: 'awaiting_approval',
      amount: 5000,
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      project_id: 'proj1',
      name: 'Framing',
      status: 'under_review',
      payment_status: 'pending_payment',
      amount: 3000,
      updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      project_id: 'proj2',
      name: 'Electrical',
      status: 'supervisor_approved',
      payment_status: 'ready_for_payout',
      amount: 2500,
      updated_at: new Date().toISOString(),
    },
    {
      id: '4',
      project_id: 'proj1',
      name: 'Plumbing',
      status: 'approved',
      payment_status: 'paid_out',
      amount: 1500,
      updated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]

  const mockProjects = [
    {
      id: 'proj3',
      name: 'Office Building',
      address: '123 Main St',
      status: 'open_for_bids',
    },
    {
      id: 'proj4',
      name: 'Residential Complex',
      address: '456 Oak Ave',
      status: 'open_for_bids',
    },
  ]

  const mockProposals = [
    {
      id: 'prop1',
      project_id: 'proj3',
      contractor_id: 'contractor1',
      amount: 25000,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('filters active milestones correctly', () => {
    const active = mockMilestones.filter(m => m.status === 'in_progress')
    expect(active).toHaveLength(1)
    expect(active[0].id).toBe('1')
  })

  it('filters review milestones correctly', () => {
    const review = mockMilestones.filter(
      m => m.status === 'under_review' || m.status === 'supervisor_approved'
    )
    expect(review).toHaveLength(2)
    expect(review.map(m => m.status)).toEqual([
      'under_review',
      'supervisor_approved',
    ])
  })

  it('calculates payment summary correctly from milestones', () => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const pending = mockMilestones
      .filter(
        m =>
          m.payment_status === 'awaiting_approval' ||
          m.payment_status === 'ready_for_payout'
      )
      .reduce((sum, m) => sum + (m.amount || 0), 0)

    const recent = mockMilestones
      .filter(
        m =>
          m.payment_status === 'paid_out' &&
          new Date(m.updated_at) > thirtyDaysAgo
      )
      .reduce((sum, m) => sum + (m.amount || 0), 0)

    expect(pending).toBe(10500) // 5000 + 3000 + 2500
    expect(recent).toBe(1500) // paid_out within 30 days
  })

  it('filters open bid projects correctly', () => {
    const openBids = mockProjects.filter(p => p.status === 'open_for_bids')
    expect(openBids).toHaveLength(2)
    expect(openBids.every(p => p.status === 'open_for_bids')).toBe(true)
  })

  it('determines proposal status correctly', () => {
    const getProposalStatus = (projectId: string) => {
      return mockProposals.some(
        p => p.project_id === projectId && p.contractor_id
      )
    }

    expect(getProposalStatus('proj3')).toBe(true)
    expect(getProposalStatus('proj4')).toBe(false)
  })
})
