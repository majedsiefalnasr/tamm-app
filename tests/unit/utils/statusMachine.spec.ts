import { describe, it, expect } from 'vitest'
import { canTransition } from '~/utils/statusMachine'

describe('statusMachine - Project Transitions', () => {
  it('allows draft → pending_admin_approval', () => {
    expect(canTransition('project', 'draft', 'pending_admin_approval')).toBe(
      true
    )
  })

  it('allows approved → supervisor_assigned', () => {
    expect(canTransition('project', 'approved', 'supervisor_assigned')).toBe(
      true
    )
  })

  it('allows awaiting_bids → bid_accepted', () => {
    expect(canTransition('project', 'awaiting_bids', 'bid_accepted')).toBe(true)
  })

  it('allows bid_accepted → in_progress', () => {
    expect(canTransition('project', 'bid_accepted', 'in_progress')).toBe(true)
  })

  it('allows in_progress → on_hold', () => {
    expect(canTransition('project', 'in_progress', 'on_hold')).toBe(true)
  })

  it('allows in_progress → completed', () => {
    expect(canTransition('project', 'in_progress', 'completed')).toBe(true)
  })

  it('allows on_hold → in_progress', () => {
    expect(canTransition('project', 'on_hold', 'in_progress')).toBe(true)
  })

  it('rejects completed → any (terminal state)', () => {
    expect(canTransition('project', 'completed', 'in_progress')).toBe(false)
    expect(canTransition('project', 'completed', 'on_hold')).toBe(false)
    expect(canTransition('project', 'completed', 'draft')).toBe(false)
  })

  it('rejects invalid transitions', () => {
    expect(canTransition('project', 'draft', 'in_progress')).toBe(false)
    expect(canTransition('project', 'draft', 'bid_accepted')).toBe(false)
    expect(canTransition('project', 'on_hold', 'draft')).toBe(false)
  })
})

describe('statusMachine - Milestone Transitions', () => {
  it('allows draft → submitted', () => {
    expect(canTransition('milestone', 'draft', 'submitted')).toBe(true)
  })

  it('allows submitted → under_review', () => {
    expect(canTransition('milestone', 'submitted', 'under_review')).toBe(true)
  })

  it('allows under_review → rejected', () => {
    expect(canTransition('milestone', 'under_review', 'rejected')).toBe(true)
  })

  it('allows under_review → approved', () => {
    expect(canTransition('milestone', 'under_review', 'approved')).toBe(true)
  })

  it('allows rejected → draft (auto-reject flow)', () => {
    expect(canTransition('milestone', 'rejected', 'draft')).toBe(true)
  })

  it('rejects approved → any (terminal state)', () => {
    expect(canTransition('milestone', 'approved', 'draft')).toBe(false)
    expect(canTransition('milestone', 'approved', 'under_review')).toBe(false)
  })
})

describe('statusMachine - Payment Transitions', () => {
  it('allows pending → awaiting_release', () => {
    expect(canTransition('payment', 'pending', 'awaiting_release')).toBe(true)
  })

  it('allows awaiting_release → processing', () => {
    expect(canTransition('payment', 'awaiting_release', 'processing')).toBe(
      true
    )
  })

  it('allows processing → paid', () => {
    expect(canTransition('payment', 'processing', 'paid')).toBe(true)
  })

  it('allows processing → failed', () => {
    expect(canTransition('payment', 'processing', 'failed')).toBe(true)
  })

  it('allows failed → pending', () => {
    expect(canTransition('payment', 'failed', 'pending')).toBe(true)
  })

  it('rejects paid → any (terminal state)', () => {
    expect(canTransition('payment', 'paid', 'pending')).toBe(false)
    expect(canTransition('payment', 'paid', 'processing')).toBe(false)
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
