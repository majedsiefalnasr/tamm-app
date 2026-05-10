import { describe, it, expect, beforeEach } from 'vitest'
import { useMilestones } from '~/composables/useMilestones'
import { canTransition } from '~/utils/statusMachine'

describe('useMilestones', () => {
  let composable: ReturnType<typeof useMilestones>

  beforeEach(() => {
    composable = useMilestones()
  })

  describe('getMilestones', () => {
    it('loads milestones for a project', async () => {
      await composable.loadMilestones('proj-001')
      const milestones = composable.getMilestones('proj-001')

      expect(Array.isArray(milestones)).toBe(true)
      expect(milestones.length).toBe(5)
    })

    it('returns empty array for non-existent project', () => {
      const milestones = composable.getMilestones('proj-nonexistent')
      expect(milestones).toEqual([])
    })

    it('contains proper milestone structure', async () => {
      await composable.loadMilestones('proj-001')
      const milestones = composable.getMilestones('proj-001')
      const milestone = milestones[0]

      expect(milestone).toHaveProperty('id')
      expect(milestone).toHaveProperty('name')
      expect(milestone).toHaveProperty('amount')
      expect(milestone).toHaveProperty('status')
      expect(milestone).toHaveProperty('order')
      expect(milestone).toHaveProperty('created_at')
    })
  })

  describe('getProjectTotals', () => {
    it('calculates correct totals', async () => {
      await composable.loadMilestones('proj-001')
      const totals = composable.getProjectTotals('proj-001')

      expect(totals.totalAmount).toBeGreaterThan(0)
      expect(totals.totalPaid).toBeGreaterThanOrEqual(0)
      expect(totals.remaining).toBe(totals.totalAmount - totals.totalPaid)
      expect(totals.count).toBe(composable.getMilestones('proj-001').length)
    })

    it('calculates paid only from approved milestones', async () => {
      await composable.loadMilestones('proj-001')
      const totals = composable.getProjectTotals('proj-001')
      const milestones = composable.getMilestones('proj-001')
      const approvedTotal = milestones
        .filter(m => m.status === 'approved')
        .reduce((sum, m) => sum + m.amount, 0)

      expect(totals.totalPaid).toBe(approvedTotal)
    })
  })

  describe('Milestone transitions', () => {
    it('validates approved milestone cannot go to supervisor_approved', () => {
      expect(
        canTransition('milestone', 'approved', 'supervisor_approved')
      ).toBe(false)
    })

    it('validates in_progress can transition to under_review', () => {
      expect(canTransition('milestone', 'in_progress', 'under_review')).toBe(
        true
      )
    })

    it('validates rejected transitions to in_progress', () => {
      expect(canTransition('milestone', 'rejected', 'in_progress')).toBe(true)
    })
  })
})
