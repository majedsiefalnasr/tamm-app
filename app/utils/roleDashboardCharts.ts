import type { ActivityChartData } from '~/shared/types/admin'
import type {
  RoleDashboardChartDefinition,
  RoleDashboardChartPoint,
  SupervisorDecisionChartInput,
} from '~/shared/types/role-dashboard-chart'
import type { Milestone, Project, Report } from '~/shared/types/project'

function sortIsoMonthKeys(keys: string[]): string[] {
  return [...keys].sort((a, b) => a.localeCompare(b, 'en'))
}

function monthBucketUtc(iso: string): string | null {
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return null
  const d = new Date(t)
  const y = d.getUTCFullYear()
  const m = d.getUTCMonth() + 1
  return `${y}-${String(m).padStart(2, '0')}`
}

/** Admin activity — contract shape `docs/api-contracts.md` GET /admin/dashboard.activity_data */
export function buildAdminActivityChartDefinition(
  data: ActivityChartData | null | undefined
): RoleDashboardChartDefinition | null {
  if (!data?.data?.length) return null

  const points: RoleDashboardChartPoint[] = data.data.map((row, idx) => ({
    x: idx,
    xLabel: row.month,
    values: {
      milestones: row.milestones,
      projects: row.projects,
    },
  }))

  return {
    seriesKeys: ['milestones', 'projects'],
    points,
    xTickKind: 'verbatim',
  }
}

/** Client — completion % for projects that already have milestone totals */
export function buildClientProjectProgressChart(
  projects: Project[]
): RoleDashboardChartDefinition | null {
  const eligible = projects.filter(p => p.total_milestones > 0)
  if (!eligible.length) return null

  const points: RoleDashboardChartPoint[] = eligible.map((p, idx) => ({
    x: idx,
    xLabel: p.name.length > 14 ? `${p.name.slice(0, 11)}…` : p.name,
    values: {
      progress: Math.round((p.completed_milestones / p.total_milestones) * 100),
    },
  }))

  return {
    seriesKeys: ['progress'],
    points,
    xTickKind: 'verbatim',
  }
}

/** Contractor — paid-out milestones grouped by payout month */
export function buildContractorMonthlyPaidOutChart(
  milestones: Milestone[]
): RoleDashboardChartDefinition | null {
  const counts = new Map<string, number>()
  for (const m of milestones) {
    if (m.payment_status !== 'paid_out') continue
    const ts = m.paid_out_at ?? m.updated_at
    if (!ts) continue
    const key = monthBucketUtc(ts)
    if (!key) continue
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  const keys = sortIsoMonthKeys([...counts.keys()])
  if (keys.length < 1) return null

  const points: RoleDashboardChartPoint[] = keys.map((k, idx) => ({
    x: idx,
    xLabel: k,
    values: { payouts: counts.get(k) ?? 0 },
  }))

  return {
    seriesKeys: ['payouts'],
    points,
    xTickKind: 'iso_month',
  }
}

/** Field engineer — submitted reports per calendar month */
export function buildFieldEngineerMonthlyReportsChart(
  reports: Report[]
): RoleDashboardChartDefinition | null {
  const counts = new Map<string, number>()
  for (const r of reports) {
    const ts = r.submitted_at
    if (!ts) continue
    const key = monthBucketUtc(ts)
    if (!key) continue
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  const activeMonths = [...counts.keys()].filter(k => (counts.get(k) ?? 0) > 0)
  if (activeMonths.length < 2) return null

  const keys = sortIsoMonthKeys(activeMonths)
  const points: RoleDashboardChartPoint[] = keys.map((k, idx) => ({
    x: idx,
    xLabel: k,
    values: { reports: counts.get(k) ?? 0 },
  }))

  return {
    seriesKeys: ['reports'],
    points,
    xTickKind: 'iso_month',
  }
}

/** Supervisor — decision volume per calendar month */
export function buildSupervisorMonthlyDecisionChart(
  decisions: SupervisorDecisionChartInput[]
): RoleDashboardChartDefinition | null {
  if (decisions.length < 2) return null

  const counts = new Map<string, number>()
  for (const d of decisions) {
    const key = monthBucketUtc(d.decidedAt)
    if (!key) continue
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  const keys = sortIsoMonthKeys([...counts.keys()])
  if (keys.length < 2) return null

  const points: RoleDashboardChartPoint[] = keys.map((k, idx) => ({
    x: idx,
    xLabel: k,
    values: { decisions: counts.get(k) ?? 0 },
  }))

  return {
    seriesKeys: ['decisions'],
    points,
    xTickKind: 'iso_month',
  }
}
