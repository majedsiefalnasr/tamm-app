import { describe, it, expect } from 'vitest'
import { useMilestones } from '../useMilestones'

describe('useMilestones - Field Engineer Methods', () => {
  describe('getMilestonesByFieldEngineer', () => {
    it('should return all milestones when status is null', () => {
      const { getMilestonesByFieldEngineer } = useMilestones()
      const { data } = getMilestonesByFieldEngineer(null)

      expect(data.value).toBeDefined()
      expect(data.value.length).toBeGreaterThan(0)
    })

    it('should return only in_progress milestones when filtered by status', () => {
      const { getMilestonesByFieldEngineer } = useMilestones()
      const { data } = getMilestonesByFieldEngineer('in_progress')

      expect(data.value).toBeDefined()
      expect(data.value.every(m => m.status === 'in_progress')).toBe(true)
    })

    it('should return under_review milestones when filtered by status', () => {
      const { getMilestonesByFieldEngineer } = useMilestones()
      const { data } = getMilestonesByFieldEngineer('under_review')

      expect(data.value).toBeDefined()
      expect(data.value.every(m => m.status === 'under_review')).toBe(true)
    })

    it('should return milestones sorted by deadline ascending', () => {
      const { getMilestonesByFieldEngineer } = useMilestones()
      const { data } = getMilestonesByFieldEngineer(null)

      expect(data.value).toBeDefined()
      if (data.value && data.value.length > 1) {
        for (let i = 0; i < data.value.length - 1; i++) {
          const milestone = data.value[i] as any
          const nextMilestone = data.value[i + 1] as any
          const current = new Date(
            milestone.deadline || milestone.created_at
          ).getTime()
          const next = new Date(
            nextMilestone.deadline || nextMilestone.created_at
          ).getTime()
          expect(current).toBeLessThanOrEqual(next)
        }
      }
    })

    it('should include project_name and project_address fields', () => {
      const { getMilestonesByFieldEngineer } = useMilestones()
      const { data } = getMilestonesByFieldEngineer('in_progress')

      expect(data.value).toBeDefined()
      if (data.value.length > 0) {
        expect(data.value[0]).toHaveProperty('project_name')
        expect(data.value[0]).toHaveProperty('project_address')
      }
    })

    it('should include field_engineer_id for filtering', () => {
      const { getMilestonesByFieldEngineer } = useMilestones()
      const { data } = getMilestonesByFieldEngineer('in_progress')

      expect(data.value).toBeDefined()
      if (data.value.length > 0) {
        expect(data.value[0]).toHaveProperty('field_engineer_id')
      }
    })
  })
})
