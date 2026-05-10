/** Unified chart payload for role dashboards (Story 10-03). */

export type RoleDashboardChartXTicks =
  | 'verbatim'
  /** `xLabel` values are `YYYY-MM` bucket keys — format in UI with locale. */
  | 'iso_month'

export interface RoleDashboardChartPoint {
  x: number
  xLabel: string
  values: Record<string, number>
}

export interface RoleDashboardChartDefinition {
  readonly seriesKeys: readonly string[]
  readonly points: readonly RoleDashboardChartPoint[]
  readonly xTickKind?: RoleDashboardChartXTicks
}

export interface SupervisorDecisionChartInput {
  decidedAt: string
}
