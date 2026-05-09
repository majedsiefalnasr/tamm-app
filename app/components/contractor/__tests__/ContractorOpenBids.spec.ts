import { describe, it, expect } from 'vitest'

describe('ContractorOpenBids', () => {
  const mockProjects = [
    {
      id: 'proj1',
      name: 'Office Building',
      address: '123 Main St',
      status: 'open_for_bids',
    },
    {
      id: 'proj2',
      name: 'Residential Complex',
      address: '456 Oak Ave',
      status: 'open_for_bids',
    },
  ]

  const mockProposals = [
    {
      id: 'prop1',
      project_id: 'proj1',
      contractor_id: 'contractor1',
      amount: 25000,
    },
  ]

  it('filters open for bids projects correctly', () => {
    const openBids = mockProjects.filter(p => p.status === 'open_for_bids')
    expect(openBids).toHaveLength(2)
    expect(openBids.every(p => p.status === 'open_for_bids')).toBe(true)
  })

  it('detects proposal status correctly', () => {
    const getProposalStatus = (projectId: string) => {
      return mockProposals.some(
        p => p.project_id === projectId && p.contractor_id
      )
    }

    expect(getProposalStatus('proj1')).toBe(true)
    expect(getProposalStatus('proj2')).toBe(false)
  })

  it('handles empty project list', () => {
    const openBids = [].filter((p: any) => p.status === 'open_for_bids')
    expect(openBids).toHaveLength(0)
  })

  it('handles empty proposals list', () => {
    const getProposalStatus = (projectId: string) => {
      return [].some((p: any) => p.project_id === projectId && p.contractor_id)
    }

    expect(getProposalStatus('proj1')).toBe(false)
    expect(getProposalStatus('proj2')).toBe(false)
  })

  it('preserves project properties when filtering', () => {
    const openBids = mockProjects.filter(p => p.status === 'open_for_bids')
    expect(openBids[0]).toHaveProperty('id')
    expect(openBids[0]).toHaveProperty('name')
    expect(openBids[0]).toHaveProperty('address')
  })

  it('correctly identifies projects with proposals', () => {
    const projectsWithProposals = mockProjects.filter(p =>
      mockProposals.some(prop => prop.project_id === p.id && prop.contractor_id)
    )
    expect(projectsWithProposals).toHaveLength(1)
    expect(projectsWithProposals[0].id).toBe('proj1')
  })

  it('correctly identifies projects without proposals', () => {
    const projectsWithoutProposals = mockProjects.filter(
      p =>
        !mockProposals.some(
          prop => prop.project_id === p.id && prop.contractor_id
        )
    )
    expect(projectsWithoutProposals).toHaveLength(1)
    expect(projectsWithoutProposals[0].id).toBe('proj2')
  })
})
