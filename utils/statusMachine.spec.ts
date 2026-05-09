import { describe, it, expect } from 'vitest'
import { canTransition, getValidTransitions } from './statusMachine'

describe('statusMachine', () => {
  describe('canTransition - Projects', () => {
    it('allows transition from new to open_for_bids', () => {
      expect(canTransition('project', 'new', 'open_for_bids')).toBe(true)
    })

    it('allows transition from open_for_bids to under_review', () => {
      expect(canTransition('project', 'open_for_bids', 'under_review')).toBe(
        true
      )
    })

    it('allows transition from under_review to contractor_selected', () => {
      expect(
        canTransition('project', 'under_review', 'contractor_selected')
      ).toBe(true)
    })

    it('allows transition from contractor_selected to active', () => {
      expect(canTransition('project', 'contractor_selected', 'active')).toBe(
        true
      )
    })

    it('allows transition from active to on_hold', () => {
      expect(canTransition('project', 'active', 'on_hold')).toBe(true)
    })

    it('allows transition from active to completed', () => {
      expect(canTransition('project', 'active', 'completed')).toBe(true)
    })

    it('allows transition from on_hold back to active', () => {
      expect(canTransition('project', 'on_hold', 'active')).toBe(true)
    })

    it('denies invalid transition from open_for_bids to new', () => {
      expect(canTransition('project', 'open_for_bids', 'new')).toBe(false)
    })

    it('denies transition from completed (terminal state)', () => {
      expect(canTransition('project', 'completed', 'active')).toBe(false)
    })

    it('denies transition to invalid status', () => {
      expect(canTransition('project', 'new', 'invalid_status' as any)).toBe(
        false
      )
    })
  })

  describe('canTransition - Milestones', () => {
    it('allows transition from not_started to in_progress', () => {
      expect(canTransition('milestone', 'not_started', 'in_progress')).toBe(
        true
      )
    })

    it('allows transition from in_progress to under_review', () => {
      expect(canTransition('milestone', 'in_progress', 'under_review')).toBe(
        true
      )
    })

    it('allows transition from under_review to supervisor_approved', () => {
      expect(
        canTransition('milestone', 'under_review', 'supervisor_approved')
      ).toBe(true)
    })

    it('allows transition from under_review to rejected', () => {
      expect(canTransition('milestone', 'under_review', 'rejected')).toBe(true)
    })

    it('allows transition from supervisor_approved to approved', () => {
      expect(
        canTransition('milestone', 'supervisor_approved', 'approved')
      ).toBe(true)
    })

    it('allows transition from supervisor_approved to rejected', () => {
      expect(
        canTransition('milestone', 'supervisor_approved', 'rejected')
      ).toBe(true)
    })

    it('allows transition from rejected back to in_progress', () => {
      expect(canTransition('milestone', 'rejected', 'in_progress')).toBe(true)
    })

    it('denies transition from approved (terminal state)', () => {
      expect(canTransition('milestone', 'approved', 'in_progress')).toBe(false)
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
    it('returns valid project transitions from new', () => {
      const valid = getValidTransitions('project', 'new')
      expect(valid).toEqual(['open_for_bids'])
    })

    it('returns valid project transitions from open_for_bids', () => {
      const valid = getValidTransitions('project', 'open_for_bids')
      expect(valid).toEqual(['under_review'])
    })

    it('returns valid milestone transitions from under_review', () => {
      const valid = getValidTransitions('milestone', 'under_review')
      expect(valid).toContain('supervisor_approved')
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
