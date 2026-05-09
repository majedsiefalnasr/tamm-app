/**
 * Optional UI/dashboard augmentations for domain types.
 * Separated from core API shapes in `project.ts` so list/dashboard PRs stay reviewable.
 */
export interface ProjectDisplayFields {
  /** Structured street address when available (else UI may fall back to `city`) */
  address?: string
}

export interface MilestoneDisplayFields {
  supervisor_name?: string
  /** When payout completed — preferred over updated_at for “received last 30 days” */
  paid_out_at?: string
  deadline?: string
}
