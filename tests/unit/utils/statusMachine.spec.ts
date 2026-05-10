import { describe, it, expect } from 'vitest'
import { canTransition } from '~/utils/statusMachine'

describe('statusMachine - Project Transitions', () => {
  it('allows new → open_for_bids', () => {
    expect(canTransition('project', 'new', 'open_for_bids')).toBe(true)
  })

  it('allows open_for_bids → under_review', () => {
    expect(canTransition('project', 'open_for_bids', 'under_review')).toBe(true)
  })

  it('allows under_review → contractor_selected', () => {
    expect(
      canTransition('project', 'under_review', 'contractor_selected')
    ).toBe(true)
  })

  it('allows contractor_selected → active', () => {
    expect(canTransition('project', 'contractor_selected', 'active')).toBe(true)
  })

  it('allows active → on_hold', () => {
    expect(canTransition('project', 'active', 'on_hold')).toBe(true)
  })

  it('allows active → completed', () => {
    expect(canTransition('project', 'active', 'completed')).toBe(true)
  })

  it('allows on_hold → active', () => {
    expect(canTransition('project', 'on_hold', 'active')).toBe(true)
  })

  it('rejects completed → any (terminal state)', () => {
    expect(canTransition('project', 'completed', 'active')).toBe(false)
    expect(canTransition('project', 'completed', 'on_hold')).toBe(false)
    expect(canTransition('project', 'completed', 'new')).toBe(false)
  })

  it('rejects invalid transitions', () => {
    expect(canTransition('project', 'new', 'active')).toBe(false)
    expect(canTransition('project', 'new', 'contractor_selected')).toBe(false)
    expect(canTransition('project', 'on_hold', 'new')).toBe(false)
  })
})

describe('statusMachine - Milestone Transitions', () => {
  it('allows not_started → in_progress', () => {
    expect(canTransition('milestone', 'not_started', 'in_progress')).toBe(true)
  })

  it('allows in_progress → under_review', () => {
    expect(canTransition('milestone', 'in_progress', 'under_review')).toBe(true)
  })

  it('allows under_review → supervisor_approved', () => {
    expect(
      canTransition('milestone', 'under_review', 'supervisor_approved')
    ).toBe(true)
  })

  it('allows under_review → rejected', () => {
    expect(canTransition('milestone', 'under_review', 'rejected')).toBe(true)
  })

  it('allows supervisor_approved → approved', () => {
    expect(canTransition('milestone', 'supervisor_approved', 'approved')).toBe(
      true
    )
  })

  it('allows supervisor_approved → rejected', () => {
    expect(canTransition('milestone', 'supervisor_approved', 'rejected')).toBe(
      true
    )
  })

  it('allows rejected → in_progress (auto-reject flow)', () => {
    expect(canTransition('milestone', 'rejected', 'in_progress')).toBe(true)
  })

  it('rejects approved → any (terminal state)', () => {
    expect(canTransition('milestone', 'approved', 'in_progress')).toBe(false)
    expect(canTransition('milestone', 'approved', 'under_review')).toBe(false)
  })
})

describe('statusMachine - Payment Transitions', () => {
  it('allows pending_payment → paid', () => {
    expect(canTransition('payment', 'pending_payment', 'paid')).toBe(true)
  })

  it('allows paid → awaiting_approval', () => {
    expect(canTransition('payment', 'paid', 'awaiting_approval')).toBe(true)
  })

  it('allows awaiting_approval → ready_for_payout', () => {
    expect(
      canTransition('payment', 'awaiting_approval', 'ready_for_payout')
    ).toBe(true)
  })

  it('allows ready_for_payout → paid_out', () => {
    expect(canTransition('payment', 'ready_for_payout', 'paid_out')).toBe(true)
  })

  it('rejects paid_out → any (terminal state)', () => {
    expect(canTransition('payment', 'paid_out', 'pending_payment')).toBe(false)
    expect(canTransition('payment', 'paid_out', 'paid')).toBe(false)
  })
})

describe('statusMachine - Invalid Entities', () => {
  it('returns false for unknown entity type', () => {
    expect(canTransition('unknown' as any, 'new', 'active')).toBe(false)
  })

  it('returns false for unknown statuses', () => {
    expect(canTransition('project', 'unknown_from', 'unknown_to')).toBe(false)
  })
})
