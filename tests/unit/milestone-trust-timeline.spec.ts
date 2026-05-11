import { describe, it, expect } from 'vitest'
import { buildMilestoneTrustTimeline } from '~/utils/milestoneTrustTimeline'
import type { Milestone, Report } from '~/shared/types/project'

function baseMilestone(overrides: Partial<Milestone>): Milestone {
  return {
    id: 'm-1',
    name: 'Test',
    amount: 1000,
    order: 1,
    status: 'draft',
    tasks: [],
    payment_status: 'pending',
    allowed_actions: [],
    created_at: '2026-05-01T08:00:00Z',
    ...overrides,
  }
}

describe('buildMilestoneTrustTimeline', () => {
  it('always includes milestone_created', () => {
    const m = baseMilestone({})
    const events = buildMilestoneTrustTimeline({
      milestone: m,
      project: { client_name: 'Client A' },
      reports: [],
      canViewPayment: false,
    })
    expect(events.some(e => e.kind === 'milestone_created')).toBe(true)
    expect(events.length).toBeGreaterThanOrEqual(1)
  })

  it('adds report_submitted with evidence anchor', () => {
    const report: Report = {
      id: 'r-1',
      milestone_id: 'm-1',
      content: 'Done',
      images: [],
      status: 'submitted',
      submitted_at: '2026-05-02T09:00:00Z',
      submitted_by: { id: 'fe', name: 'Engineer' },
    }
    const m = baseMilestone({
      status: 'under_review',
      latest_report: report,
    })
    const events = buildMilestoneTrustTimeline({
      milestone: m,
      reports: [report],
      canViewPayment: false,
    })
    const row = events.find(e => e.kind === 'report_submitted')
    expect(row?.evidenceAnchor).toBe('#milestone-report-evidence')
    expect(row?.actor?.name).toBe('Engineer')
  })

  it('surfaces rejection_reason with decision_rejected', () => {
    const m = baseMilestone({
      status: 'in_progress',
      rejection_reason: 'Photos incomplete.',
      last_rejection_at: '2026-05-03T11:00:00Z',
      last_rejection_role: 'supervisor_engineer',
      supervisor: { id: 's1', name: 'Supervisor X' },
    })
    const events = buildMilestoneTrustTimeline({
      milestone: m,
      reports: [],
      canViewPayment: false,
    })
    const row = events.find(e => e.kind === 'decision_rejected')
    expect(row?.rejection_reason).toBe('Photos incomplete.')
  })

  it('orders events chronologically', () => {
    const report: Report = {
      id: 'r-1',
      milestone_id: 'm-1',
      content: 'Hi',
      images: [],
      status: 'submitted',
      submitted_at: '2026-05-10T12:00:00Z',
    }
    const m = baseMilestone({
      created_at: '2026-05-01T08:00:00Z',
      status: 'under_review',
      latest_report: report,
    })
    const events = buildMilestoneTrustTimeline({
      milestone: m,
      reports: [report],
      canViewPayment: false,
    })
    for (let i = 1; i < events.length; i++) {
      expect(new Date(events[i]!.timestamp).getTime()).toBeGreaterThanOrEqual(
        new Date(events[i - 1]!.timestamp).getTime()
      )
    }
  })

  it('emits payment rows only when canViewPayment', () => {
    const withPayment = baseMilestone({
      status: 'approved',
      payment_status: 'paid',
      payment_confirmed_at: '2026-05-04T10:00:00Z',
      client_approved_at: '2026-05-04T09:00:00Z',
      supervisor_approved_at: '2026-05-03T09:00:00Z',
    })
    const hidden = buildMilestoneTrustTimeline({
      milestone: withPayment,
      canViewPayment: false,
      reports: [],
    })
    expect(hidden.some(e => e.kind === 'payment_confirmed')).toBe(false)

    const visible = buildMilestoneTrustTimeline({
      milestone: withPayment,
      canViewPayment: true,
      reports: [],
    })
    expect(visible.some(e => e.kind === 'payment_confirmed')).toBe(true)
  })
})
