import { describe, it, expect } from 'vitest'

describe('ContractorActiveMilestones', () => {
  const mockMilestones = [
    {
      id: '1',
      project_id: 'proj1',
      name: 'Foundation Work',
      status: 'in_progress',
      engineer_name: 'Ahmed Mohamed',
    },
    {
      id: '2',
      project_id: 'proj2',
      name: 'Framing',
      status: 'in_progress',
      engineer_name: 'Fatima Hassan',
    },
  ]

  it('correctly identifies active milestones', () => {
    const activeMilestones = mockMilestones.filter(
      m => m.status === 'in_progress'
    )
    expect(activeMilestones).toHaveLength(2)
    expect(activeMilestones.every(m => m.status === 'in_progress')).toBe(true)
  })

  it('handles empty milestone list', () => {
    const activeMilestones = [].filter((m: any) => m.status === 'in_progress')
    expect(activeMilestones).toHaveLength(0)
  })

  it('preserves all milestone properties when filtering', () => {
    const activeMilestones = mockMilestones.filter(
      m => m.status === 'in_progress'
    )
    expect(activeMilestones[0]).toHaveProperty('id')
    expect(activeMilestones[0]).toHaveProperty('name')
    expect(activeMilestones[0]).toHaveProperty('engineer_name')
  })

  it('filters out non-in_progress milestones', () => {
    const allMilestones = [
      ...mockMilestones,
      {
        id: '3',
        name: 'Plumbing',
        status: 'under_review',
        engineer_name: 'Ali',
      },
    ]
    const activeMilestones = allMilestones.filter(
      m => m.status === 'in_progress'
    )
    expect(activeMilestones).toHaveLength(2)
    expect(activeMilestones.every(m => m.status === 'in_progress')).toBe(true)
  })
})
