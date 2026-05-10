import { describe, it, expect } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { useReports } from '../useReports'

describe('useReports', () => {
  describe('getReportsByFieldEngineer', () => {
    it('should return reports for the given engineer ID', async () => {
      const { getReportsByFieldEngineer } = useReports()
      const { data } = getReportsByFieldEngineer('eng-1')

      await flushPromises()
      expect(data.value).toBeDefined()
      expect(data.value.length).toBeGreaterThan(0)
    })

    it('should limit results to specified count', async () => {
      const { getReportsByFieldEngineer } = useReports()
      const { data } = getReportsByFieldEngineer('eng-1', 2)

      await flushPromises()
      expect(data.value).toBeDefined()
      expect(data.value.length).toBeLessThanOrEqual(2)
    })

    it('should return reports sorted by submission date descending', async () => {
      const { getReportsByFieldEngineer } = useReports()
      const { data } = getReportsByFieldEngineer('eng-1')

      await flushPromises()
      expect(data.value).toBeDefined()
      if (data.value.length > 1) {
        for (let i = 0; i < data.value.length - 1; i++) {
          const current = new Date(data.value[i].submitted_at).getTime()
          const next = new Date(data.value[i + 1].submitted_at).getTime()
          expect(current).toBeGreaterThanOrEqual(next)
        }
      }
    })

    it('should include required fields for display', async () => {
      const { getReportsByFieldEngineer } = useReports()
      const { data } = getReportsByFieldEngineer('eng-1')

      await flushPromises()
      expect(data.value).toBeDefined()
      if (data.value.length > 0) {
        const report = data.value[0]
        expect(report).toHaveProperty('id')
        expect(report).toHaveProperty('milestone_id')
        expect(report).toHaveProperty('milestone_name')
        expect(report).toHaveProperty('project_name')
        expect(report).toHaveProperty('submitted_at')
        expect(report).toHaveProperty('current_milestone_status')
      }
    })

    it('should return empty array for unknown engineer', async () => {
      const { getReportsByFieldEngineer } = useReports()
      const { data } = getReportsByFieldEngineer('unknown-engineer')

      await flushPromises()
      expect(data.value).toBeDefined()
      expect(data.value.length).toBe(0)
    })
  })

  describe('getReportByMilestoneId', () => {
    it('should return report for given milestone ID', async () => {
      const { getReportsByFieldEngineer, getReportByMilestoneId } = useReports()
      getReportsByFieldEngineer('eng-1')

      await flushPromises()
      const report = getReportByMilestoneId('ms-1')
      expect(report).toBeDefined()
    })

    it('should return undefined for non-existent milestone', () => {
      const { getReportByMilestoneId } = useReports()
      const report = getReportByMilestoneId('non-existent')

      expect(report).toBeUndefined()
    })
  })
})
