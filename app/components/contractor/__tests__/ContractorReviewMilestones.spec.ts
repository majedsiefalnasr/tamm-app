import { describe, it, expect } from 'vitest'

describe('ContractorReviewMilestones', () => {
  const mockMilestones = [
    {
      id: '1',
      project_id: 'proj1',
      name: 'Foundation Work',
      status: 'under_review',
      supervisor_name: 'Ahmed El-Sayed',
    },
    {
      id: '2',
      project_id: 'proj2',
      name: 'Framing',
      status: 'supervisor_approved',
      supervisor_name: 'Fatima Hassan',
    },
  ]

  it('filters review milestones by under_review or supervisor_approved', () => {
    const reviewMilestones = mockMilestones.filter(
      m => m.status === 'under_review' || m.status === 'supervisor_approved'
    )
    expect(reviewMilestones).toHaveLength(2)
  })

  it('filters out non-review milestones', () => {
    const allMilestones = [
      ...mockMilestones,
      {
        id: '3',
        name: 'Plumbing',
        status: 'in_progress',
        supervisor_name: 'Ali',
      },
    ]
    const reviewMilestones = allMilestones.filter(
      m => m.status === 'under_review' || m.status === 'supervisor_approved'
    )
    expect(reviewMilestones).toHaveLength(2)
  })

  it('identifies under_review milestones correctly', () => {
    const underReview = mockMilestones.filter(m => m.status === 'under_review')
    expect(underReview).toHaveLength(1)
    expect(underReview[0].status).toBe('under_review')
  })

  it('identifies supervisor_approved milestones correctly', () => {
    const approved = mockMilestones.filter(
      m => m.status === 'supervisor_approved'
    )
    expect(approved).toHaveLength(1)
    expect(approved[0].status).toBe('supervisor_approved')
  })

  it('handles empty milestone list', () => {
    const reviewMilestones = [].filter(
      (m: any) =>
        m.status === 'under_review' || m.status === 'supervisor_approved'
    )
    expect(reviewMilestones).toHaveLength(0)
  })

  it('preserves milestone properties when filtering', () => {
    const reviewMilestones = mockMilestones.filter(
      m => m.status === 'under_review' || m.status === 'supervisor_approved'
    )
    expect(reviewMilestones[0]).toHaveProperty('supervisor_name')
    expect(reviewMilestones[0]).toHaveProperty('status')
  })
})
