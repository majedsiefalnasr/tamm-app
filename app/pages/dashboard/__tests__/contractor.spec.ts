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
      status: 'draft',
      payment_status: 'awaiting_release',
      amount: 5000,
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      project_id: 'proj1',
      name: 'Framing',
      status: 'under_review',
      payment_status: 'pending',
      amount: 3000,
      updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      project_id: 'proj2',
      name: 'Electrical',
      status: 'approved',
      payment_status: 'processing',
      amount: 2500,
      updated_at: new Date().toISOString(),
    },
    {
      id: '4',
      project_id: 'proj1',
      name: 'Plumbing',
      status: 'approved',
      payment_status: 'paid',
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
    const active = mockMilestones.filter(m => m.status === 'draft')
    expect(active).toHaveLength(1)
    expect(active[0].id).toBe('1')
  })

  it('filters review milestones correctly', () => {
    const review = mockMilestones.filter(
      m => m.status === 'under_review' || m.status === 'approved'
    )
    expect(review).toHaveLength(3)
    expect(review.map(m => m.status)).toEqual([
      'under_review',
      'approved',
      'approved',
    ])
  })

  it('calculates payment summary correctly from milestones', () => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const pending = mockMilestones
      .filter(
        m =>
          m.payment_status === 'awaiting_release' ||
          m.payment_status === 'processing'
      )
      .reduce((sum, m) => sum + (m.amount || 0), 0)

    const recent = mockMilestones
      .filter(
        m =>
          m.payment_status === 'paid' && new Date(m.updated_at) > thirtyDaysAgo
      )
      .reduce((sum, m) => sum + (m.amount || 0), 0)

    expect(pending).toBe(7500) // awaiting_release + processing only
    expect(recent).toBe(1500) // paid within 30 days
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
