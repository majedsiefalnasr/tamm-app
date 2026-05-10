import { describe, expect, it } from 'vitest'
import type { ActivityChartData } from '~/shared/types/admin'
import type { Milestone, Project, Report } from '~/shared/types/project'
import {
  buildAdminActivityChartDefinition,
  buildClientProjectProgressChart,
  buildContractorMonthlyPaidOutChart,
  buildFieldEngineerMonthlyReportsChart,
  buildSupervisorMonthlyDecisionChart,
} from '~/utils/roleDashboardCharts'

describe('roleDashboardCharts', () => {
  it('buildAdminActivityChartDefinition returns null for empty data', () => {
    expect(buildAdminActivityChartDefinition(null)).toBeNull()
    expect(
      buildAdminActivityChartDefinition({ months: [], data: [] })
    ).toBeNull()
  })

  it('buildAdminActivityChartDefinition maps activity rows', () => {
    const data: ActivityChartData = {
      months: ['Jan', 'Feb'],
      data: [
        { month: 'Jan', milestones: 3, projects: 1 },
        { month: 'Feb', milestones: 5, projects: 2 },
      ],
    }
    const def = buildAdminActivityChartDefinition(data)
    expect(def?.seriesKeys).toEqual(['milestones', 'projects'])
    expect(def?.points).toHaveLength(2)
    expect(def?.points[0]).toMatchObject({
      x: 0,
      xLabel: 'Jan',
      values: { milestones: 3, projects: 1 },
    })
    expect(def?.xTickKind).toBe('verbatim')
  })

  it('buildClientProjectProgressChart skips empty totals', () => {
    expect(buildClientProjectProgressChart([])).toBeNull()
    expect(
      buildClientProjectProgressChart([
        {
          id: 'p1',
          name: 'Short',
          description: '',
          city: 'X',
          area_m2: 1,
          budget: 1,
          currency: 'EGP',
          status: 'active',
          created_at: '2026-01-01T00:00:00Z',
          completed_milestones: 0,
          total_milestones: 0,
        },
      ])
    ).toBeNull()
  })

  it('buildClientProjectProgressChart derives completion percent', () => {
    const projects: Project[] = [
      {
        id: 'p1',
        name: 'Alpha Site Long Name',
        description: '',
        city: 'X',
        area_m2: 1,
        budget: 1,
        currency: 'EGP',
        status: 'active',
        created_at: '2026-01-01T00:00:00Z',
        completed_milestones: 2,
        total_milestones: 5,
      },
    ]
    const def = buildClientProjectProgressChart(projects)
    expect(def?.seriesKeys).toEqual(['progress'])
    expect(def?.points[0]?.values.progress).toBe(40)
  })

  it('buildContractorMonthlyPaidOutChart aggregates paid_out milestones', () => {
    const milestones: Milestone[] = [
      {
        id: 'm1',
        name: 'M',
        order: 1,
        amount: 100,
        status: 'approved',
        tasks: [],
        payment_status: 'paid_out',
        allowed_actions: [],
        created_at: '2026-01-01T00:00:00Z',
        paid_out_at: '2026-03-15T10:00:00Z',
      },
      {
        id: 'm2',
        name: 'M2',
        order: 2,
        amount: 100,
        status: 'approved',
        tasks: [],
        payment_status: 'paid_out',
        allowed_actions: [],
        created_at: '2026-01-01T00:00:00Z',
        paid_out_at: '2026-03-20T10:00:00Z',
      },
      {
        id: 'm3',
        name: 'M3',
        order: 3,
        amount: 100,
        status: 'in_progress',
        tasks: [],
        payment_status: 'pending_payment',
        allowed_actions: [],
        created_at: '2026-01-01T00:00:00Z',
      },
    ]
    const def = buildContractorMonthlyPaidOutChart(milestones)
    expect(def?.seriesKeys).toEqual(['payouts'])
    expect(def?.points).toHaveLength(1)
    expect(def?.points[0]?.values.payouts).toBe(2)
    expect(def?.xTickKind).toBe('iso_month')
  })

  it('buildFieldEngineerMonthlyReportsChart requires two active months', () => {
    const oneMonth: Report[] = [
      {
        id: 'r1',
        milestone_id: 'm',
        content: 'x',
        images: [],
        submitted_at: '2026-05-01T10:00:00Z',
        status: 'submitted',
      },
      {
        id: 'r2',
        milestone_id: 'm2',
        content: 'y',
        images: [],
        submitted_at: '2026-05-10T10:00:00Z',
        status: 'submitted',
      },
    ]
    expect(buildFieldEngineerMonthlyReportsChart(oneMonth)).toBeNull()

    const twoMonths: Report[] = [
      ...oneMonth,
      {
        id: 'r3',
        milestone_id: 'm3',
        content: 'z',
        images: [],
        submitted_at: '2026-06-02T10:00:00Z',
        status: 'submitted',
      },
    ]
    const def = buildFieldEngineerMonthlyReportsChart(twoMonths)
    expect(def?.points.length).toBeGreaterThanOrEqual(2)
  })

  it('buildSupervisorMonthlyDecisionChart requires >=2 decisions and months', () => {
    expect(buildSupervisorMonthlyDecisionChart([])).toBeNull()
    expect(
      buildSupervisorMonthlyDecisionChart([
        { decidedAt: '2026-05-01T10:00:00Z' },
        { decidedAt: '2026-05-02T10:00:00Z' },
      ])
    ).toBeNull()

    const def = buildSupervisorMonthlyDecisionChart([
      { decidedAt: '2026-04-01T10:00:00Z' },
      { decidedAt: '2026-05-02T10:00:00Z' },
    ])
    expect(def?.seriesKeys).toEqual(['decisions'])
    expect(def?.points).toHaveLength(2)
  })
})
