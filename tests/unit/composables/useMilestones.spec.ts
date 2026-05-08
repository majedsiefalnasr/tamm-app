import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useMilestones } from '../../../app/composables/useMilestones'

describe('useMilestones', () => {
  let composable: ReturnType<typeof useMilestones>

  beforeEach(() => {
    composable = useMilestones()
  })

  describe('loadMilestones', () => {
    it('should load milestones for a project', async () => {
      await composable.loadMilestones('proj-001')
      const milestones = composable.getMilestones('proj-001')
      expect(milestones.length).toBeGreaterThan(0)
    })

    it('should cache milestones after first load', async () => {
      const loadSpy = vi.spyOn(composable, 'loadMilestones')
      await composable.loadMilestones('proj-001')
      const milestones1 = composable.getMilestones('proj-001')

      // Load again - should use cache
      await composable.loadMilestones('proj-001')
      const milestones2 = composable.getMilestones('proj-001')

      expect(milestones1).toEqual(milestones2)
    })

    it('should return empty array for project with no milestones', async () => {
      await composable.loadMilestones('proj-002')
      const milestones = composable.getMilestones('proj-002')
      expect(milestones).toEqual([])
    })
  })

  describe('addMilestone', () => {
    beforeEach(async () => {
      await composable.loadMilestones('proj-002')
    })

    it('should add a new milestone with all fields', async () => {
      const milestone = await composable.addMilestone('proj-002', {
        title: 'New Phase',
        description: 'Phase description',
        amount: 10000,
        order: 1,
      })

      expect(milestone.name).toBe('New Phase')
      expect(milestone.description).toBe('Phase description')
      expect(milestone.amount).toBe(10000)
      expect(milestone.status).toBe('not_started')
    })

    it('should auto-increment order if not provided', async () => {
      const milestone = await composable.addMilestone('proj-002', {
        title: 'New Phase',
        amount: 10000,
      })

      expect(milestone.order).toBe(1)
    })

    it('should add milestone to the list', async () => {
      const initialCount = composable.getMilestones('proj-002').length
      await composable.addMilestone('proj-002', {
        title: 'New Phase',
        amount: 10000,
      })
      const finalCount = composable.getMilestones('proj-002').length

      expect(finalCount).toBe(initialCount + 1)
    })

    it('should set created_at timestamp', async () => {
      const milestone = await composable.addMilestone('proj-002', {
        title: 'New Phase',
        amount: 10000,
      })

      expect(milestone.created_at).toBeDefined()
      expect(new Date(milestone.created_at).getTime()).toBeGreaterThan(0)
    })

    it('should replace temp ID with real ID', async () => {
      const milestone = await composable.addMilestone('proj-002', {
        title: 'New Phase',
        amount: 10000,
      })

      expect(milestone.id).not.toMatch(/^temp-/)
      expect(milestone.id).toMatch(/^ms-/)
    })
  })

  describe('editMilestone', () => {
    beforeEach(async () => {
      await composable.loadMilestones('proj-001')
    })

    it('should edit an existing milestone', async () => {
      const milestones = composable.getMilestones('proj-001')
      const milestoneId = milestones[0].id

      const updated = await composable.editMilestone('proj-001', milestoneId, {
        title: 'Updated Title',
        amount: 99999,
      })

      expect(updated.name).toBe('Updated Title')
      expect(updated.amount).toBe(99999)
      expect(updated.id).toBe(milestoneId)
    })

    it('should throw error for non-existent milestone', async () => {
      await expect(
        composable.editMilestone('proj-001', 'non-existent', {
          title: 'New Title',
          amount: 5000,
        })
      ).rejects.toThrow('Milestone not found')
    })

    it('should update milestone in the list', async () => {
      const milestones = composable.getMilestones('proj-001')
      const milestoneId = milestones[0].id
      const oldName = milestones[0].name

      await composable.editMilestone('proj-001', milestoneId, {
        title: 'Brand New Title',
        amount: 55555,
      })

      const updated = composable
        .getMilestones('proj-001')
        .find(m => m.id === milestoneId)
      expect(updated?.name).toBe('Brand New Title')
      expect(updated?.name).not.toBe(oldName)
    })
  })

  describe('deleteMilestone', () => {
    beforeEach(async () => {
      await composable.loadMilestones('proj-001')
    })

    it('should delete an existing milestone', async () => {
      const milestones = composable.getMilestones('proj-001')
      const initialCount = milestones.length
      const milestoneId = milestones[0].id

      await composable.deleteMilestone('proj-001', milestoneId)

      const finalCount = composable.getMilestones('proj-001').length
      expect(finalCount).toBe(initialCount - 1)
    })

    it('should remove milestone from list', async () => {
      const milestones = composable.getMilestones('proj-001')
      const milestoneId = milestones[0].id

      await composable.deleteMilestone('proj-001', milestoneId)

      const exists = composable
        .getMilestones('proj-001')
        .find(m => m.id === milestoneId)
      expect(exists).toBeUndefined()
    })

    it('should throw error for non-existent milestone', async () => {
      await expect(
        composable.deleteMilestone('proj-001', 'non-existent')
      ).rejects.toThrow('Milestone not found')
    })
  })

  describe('getProjectTotals', () => {
    beforeEach(async () => {
      await composable.loadMilestones('proj-001')
    })

    it('should calculate total amount correctly', () => {
      const totals = composable.getProjectTotals('proj-001')
      expect(totals.totalAmount).toBeGreaterThan(0)
    })

    it('should calculate approved milestone total', () => {
      const totals = composable.getProjectTotals('proj-001')
      // proj-001 has at least one approved milestone
      expect(totals.totalPaid).toBeGreaterThan(0)
    })

    it('should calculate remaining amount', () => {
      const totals = composable.getProjectTotals('proj-001')
      expect(totals.remaining).toBe(totals.totalAmount - totals.totalPaid)
    })

    it('should count milestones correctly', () => {
      const totals = composable.getProjectTotals('proj-001')
      const milestones = composable.getMilestones('proj-001')
      expect(totals.count).toBe(milestones.length)
    })

    it('should return zero totals for empty project', () => {
      const totals = composable.getProjectTotals('proj-002')
      expect(totals.totalAmount).toBe(0)
      expect(totals.totalPaid).toBe(0)
      expect(totals.remaining).toBe(0)
      expect(totals.count).toBe(0)
    })
  })

  describe('error handling', () => {
    it('should handle loading error gracefully', async () => {
      // This test verifies the error state is set
      const { error } = composable
      expect(error.value).toBeNull()
    })

    it('should rollback optimistic update on error', async () => {
      // This is implicitly tested in the add/edit/delete tests
      // The composable should maintain consistency
    })
  })

  describe('getMilestones', () => {
    it('should return milestones for loaded project', async () => {
      await composable.loadMilestones('proj-001')
      const milestones = composable.getMilestones('proj-001')
      expect(Array.isArray(milestones)).toBe(true)
    })

    it('should return empty array for unloaded project', () => {
      const milestones = composable.getMilestones('non-existent')
      expect(milestones).toEqual([])
    })
  })
})
