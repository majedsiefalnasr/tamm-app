import type { Milestone, ProjectDetail, Report } from '~/shared/types/project'
import { derivePaymentStatus } from '~/utils/statusMachine'

export type TrustTimelineEventKind =
  | 'milestone_created'
  | 'report_submitted'
  | 'supervisor_approved'
  | 'decision_rejected'
  | 'client_approved'
  | 'payment_confirmed'
  | 'payout_completed'

export interface TrustTimelineActor {
  kind: 'person' | 'system'
  name?: string
  /** i18n key for role label (passed to `t()`). */
  roleKey?: string
}

export interface MilestoneTrustTimelineEvent {
  id: string
  kind: TrustTimelineEventKind
  timestamp: string
  actor?: TrustTimelineActor
  rejection_reason?: string
  rejection_role?: 'supervisor_engineer' | 'client'
  evidenceAnchor?: string
}

export interface BuildMilestoneTrustTimelineInput {
  milestone: Milestone
  project?: Pick<ProjectDetail, 'client_name'> | null
  reports: Report[]
  canViewPayment: boolean
}

function sortIso(a: string, b: string): number {
  return new Date(a).getTime() - new Date(b).getTime()
}

function dedupeById(
  events: MilestoneTrustTimelineEvent[]
): MilestoneTrustTimelineEvent[] {
  const seen = new Set<string>()
  const out: MilestoneTrustTimelineEvent[] = []
  for (const e of events) {
    if (seen.has(e.id)) continue
    seen.add(e.id)
    out.push(e)
  }
  return out
}

/**
 * Builds a chronological trust narrative from milestone surface fields and reports.
 * When GET /milestones/:id/activity ships, replace inputs — keep ordering rules centralized here.
 */
export function buildMilestoneTrustTimeline(
  input: BuildMilestoneTrustTimelineInput
): MilestoneTrustTimelineEvent[] {
  const { milestone: m, project, reports, canViewPayment } = input
  const events: MilestoneTrustTimelineEvent[] = []

  events.push({
    id: `created-${m.created_at}`,
    kind: 'milestone_created',
    timestamp: m.created_at,
    actor: { kind: 'system' },
  })

  const seenReportIds = new Set<string>()
  const reportList = [...reports]
    .filter(r => r.submitted_at)
    .sort((a, b) => sortIso(a.submitted_at!, b.submitted_at!))

  for (const r of reportList) {
    if (seenReportIds.has(r.id)) continue
    seenReportIds.add(r.id)
    events.push({
      id: `report-${r.id}-${r.submitted_at}`,
      kind: 'report_submitted',
      timestamp: r.submitted_at!,
      actor: r.submitted_by
        ? {
            kind: 'person',
            name: r.submitted_by.name,
            roleKey: 'milestone.trustTimeline.actor.fieldEngineer',
          }
        : { kind: 'system' },
      evidenceAnchor: '#milestone-report-evidence',
    })
  }

  const showSupervisorApproved =
    Boolean(m.supervisor_approved_at) || m.status === 'supervisor_approved'

  if (showSupervisorApproved) {
    const ts = m.supervisor_approved_at || m.updated_at || m.created_at
    events.push({
      id: `supervisor-approved-${ts}`,
      kind: 'supervisor_approved',
      timestamp: ts,
      actor: m.supervisor
        ? {
            kind: 'person',
            name: m.supervisor.name,
            roleKey: 'milestone.trustTimeline.actor.supervisor',
          }
        : { kind: 'system' },
    })
  }

  const rejectionReason =
    typeof m.rejection_reason === 'string' ? m.rejection_reason.trim() : ''
  if (rejectionReason && m.last_rejection_at) {
    const role: 'supervisor_engineer' | 'client' =
      m.last_rejection_role === 'client' ? 'client' : 'supervisor_engineer'
    events.push({
      id: `reject-${m.last_rejection_at}`,
      kind: 'decision_rejected',
      timestamp: m.last_rejection_at,
      rejection_reason: rejectionReason,
      rejection_role: role,
      actor:
        role === 'client' && project?.client_name
          ? {
              kind: 'person',
              name: project.client_name,
              roleKey: 'milestone.trustTimeline.actor.client',
            }
          : m.supervisor
            ? {
                kind: 'person',
                name: m.supervisor.name,
                roleKey: 'milestone.trustTimeline.actor.supervisor',
              }
            : { kind: 'system' },
    })
  }

  if (m.status === 'approved') {
    const ts = m.client_approved_at || m.updated_at || m.created_at
    events.push({
      id: `client-approved-${ts}`,
      kind: 'client_approved',
      timestamp: ts,
      actor: project?.client_name
        ? {
            kind: 'person',
            name: project.client_name,
            roleKey: 'milestone.trustTimeline.actor.client',
          }
        : { kind: 'system' },
    })
  }

  const paymentStatus = m.payment_status ?? derivePaymentStatus(m.status)

  if (
    canViewPayment &&
    m.payment_confirmed_at &&
    paymentStatus !== 'pending_payment'
  ) {
    events.push({
      id: `payment-${m.payment_confirmed_at}`,
      kind: 'payment_confirmed',
      timestamp: m.payment_confirmed_at,
      actor: project?.client_name
        ? {
            kind: 'person',
            name: project.client_name,
            roleKey: 'milestone.trustTimeline.actor.client',
          }
        : { kind: 'system' },
    })
  }

  if (
    canViewPayment &&
    m.payment_status === 'paid_out' &&
    (m.paid_out_at || m.updated_at)
  ) {
    const ts = m.paid_out_at || m.updated_at!
    events.push({
      id: `payout-${ts}`,
      kind: 'payout_completed',
      timestamp: ts,
      actor: { kind: 'system' },
    })
  }

  events.sort((a, b) => sortIso(a.timestamp, b.timestamp))

  return dedupeById(events)
}
