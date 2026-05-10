import { describe, it, expect } from 'vitest'
import { mockDashboardData } from '~/composables/__mocks__/admin-dashboard'

describe('admin dashboard mock (Story 08-05)', () => {
  it('includes Epic 08-05 dashboard payload shape', () => {
    expect(
      mockDashboardData.summary_stats.active_projects
    ).toBeGreaterThanOrEqual(0)
    expect(
      mockDashboardData.summary_stats.milestones_pending_review
    ).toBeGreaterThanOrEqual(0)
    expect(
      mockDashboardData.summary_stats.payments_ready_for_release
    ).toBeGreaterThanOrEqual(0)
    expect(
      mockDashboardData.urgent_actions.pending_reports
    ).toBeGreaterThanOrEqual(0)
    expect(mockDashboardData.action_queues.open_bidding.length).toBeGreaterThan(
      0
    )
    expect(mockDashboardData.recent_events.length).toBeGreaterThanOrEqual(10)

    const slice = mockDashboardData.recent_events.slice(0, 10)
    expect(slice).toHaveLength(10)
  })
})
