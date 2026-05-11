import { describe, it, expect } from 'vitest'
import { canTransition, getValidTransitions } from './statusMachine'

describe('statusMachine', () => {
  describe('canTransition - Projects', () => {
    it('allows transition from draft to pending_admin_approval', () => {
      expect(canTransition('project', 'draft', 'pending_admin_approval')).toBe(
        true
      )
    })

    it('allows transition from approved to supervisor_assigned', () => {
      expect(canTransition('project', 'approved', 'supervisor_assigned')).toBe(
        true
      )
    })

    it('allows transition from awaiting_bids to bid_accepted', () => {
      expect(canTransition('project', 'awaiting_bids', 'bid_accepted')).toBe(
        true
      )
    })

    it('allows transition from bid_accepted to in_progress', () => {
      expect(canTransition('project', 'bid_accepted', 'in_progress')).toBe(true)
    })

    it('allows transition from in_progress to on_hold', () => {
      expect(canTransition('project', 'in_progress', 'on_hold')).toBe(true)
    })

    it('allows transition from in_progress to completed', () => {
      expect(canTransition('project', 'in_progress', 'completed')).toBe(true)
    })

    it('allows transition from on_hold back to in_progress', () => {
      expect(canTransition('project', 'on_hold', 'in_progress')).toBe(true)
    })

    it('denies invalid transition from draft to in_progress', () => {
      expect(canTransition('project', 'draft', 'in_progress')).toBe(false)
    })

    it('denies transition from completed (terminal state)', () => {
      expect(canTransition('project', 'completed', 'in_progress')).toBe(false)
    })

    it('denies transition to invalid status', () => {
      expect(canTransition('project', 'draft', 'invalid_status' as any)).toBe(
        false
      )
    })
  })

  describe('canTransition - Milestones', () => {
    it('allows transition from draft to submitted', () => {
      expect(canTransition('milestone', 'draft', 'submitted')).toBe(true)
    })

    it('allows transition from submitted to under_review', () => {
      expect(canTransition('milestone', 'submitted', 'under_review')).toBe(true)
    })

    it('allows transition from under_review to rejected', () => {
      expect(canTransition('milestone', 'under_review', 'rejected')).toBe(true)
    })

    it('allows transition from under_review to approved', () => {
      expect(canTransition('milestone', 'under_review', 'approved')).toBe(true)
    })

    it('allows transition from rejected back to draft', () => {
      expect(canTransition('milestone', 'rejected', 'draft')).toBe(true)
    })

    it('denies transition from approved (terminal state)', () => {
      expect(canTransition('milestone', 'approved', 'draft')).toBe(false)
    })
  })

  describe('canTransition - Reports', () => {
    it('allows transition from draft to submitted', () => {
      expect(canTransition('report', 'draft', 'submitted')).toBe(true)
    })

    it('allows transition from submitted to under_review', () => {
      expect(canTransition('report', 'submitted', 'under_review')).toBe(true)
    })

    it('denies transition from under_review (terminal state)', () => {
      expect(canTransition('report', 'under_review', 'draft')).toBe(false)
    })
  })

  describe('getValidTransitions', () => {
    it('returns valid project transitions from draft', () => {
      const valid = getValidTransitions('project', 'draft')
      expect(valid).toEqual(['pending_admin_approval'])
    })

    it('returns valid project transitions from awaiting_bids', () => {
      const valid = getValidTransitions('project', 'awaiting_bids')
      expect(valid).toEqual(['bid_accepted', 'on_hold', 'cancelled'])
    })

    it('returns valid milestone transitions from under_review', () => {
      const valid = getValidTransitions('milestone', 'under_review')
      expect(valid).toContain('approved')
      expect(valid).toContain('rejected')
    })

    it('returns empty array for terminal states', () => {
      expect(getValidTransitions('project', 'completed')).toEqual([])
      expect(getValidTransitions('milestone', 'approved')).toEqual([])
    })

    it('returns empty array for invalid status', () => {
      expect(getValidTransitions('project', 'invalid_status')).toEqual([])
    })
  })
})
