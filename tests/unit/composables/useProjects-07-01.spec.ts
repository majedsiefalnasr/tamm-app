import { describe, it, expect, beforeEach } from 'vitest'
import { useProjects } from '~/composables/useProjects'

describe('useProjects - Story 07-01', () => {
  let projects: any

  beforeEach(() => {
    projects = useProjects()
  })

  describe('inviteContractors', () => {
    it('should successfully invite contractors', async () => {
      const projectId = 'proj-003'
      const contractorIds = ['cont-001', 'cont-002']

      await expect(
        projects.inviteContractors(projectId, contractorIds)
      ).resolves.toBeUndefined()
    })

    it('should handle empty contractor list', async () => {
      const projectId = 'proj-003'
      const contractorIds: string[] = []

      await expect(
        projects.inviteContractors(projectId, contractorIds)
      ).resolves.toBeUndefined()
    })
  })

  describe('updateProjectStatus', () => {
    it('should update project status to open_for_bids', async () => {
      const projectId = 'proj-003'

      await projects.updateProjectStatus(projectId, 'open_for_bids')

      const projectDetail = await projects.getProjectById(projectId)
      expect(projectDetail.status).toBe('open_for_bids')
    })

    it('should preserve other project properties', async () => {
      const projectId = 'proj-003'
      const initialProject = await projects.getProjectById(projectId)

      await projects.updateProjectStatus(projectId, 'open_for_bids')

      const updatedProject = await projects.getProjectById(projectId)
      expect(updatedProject.name).toBe(initialProject.name)
      expect(updatedProject.id).toBe(initialProject.id)
    })
  })

  describe('integration test - open for bids flow', () => {
    it('should complete the open for bids workflow', async () => {
      const projectId = 'proj-003'
      const contractorIds = ['cont-001', 'cont-002', 'cont-003']

      // Get initial project
      const initialProject = await projects.getProjectById(projectId)
      expect(initialProject.status).toBe('new')

      // Invite contractors
      await expect(
        projects.inviteContractors(projectId, contractorIds)
      ).resolves.toBeUndefined()

      // Update status
      await projects.updateProjectStatus(projectId, 'open_for_bids')

      // Verify final state
      const finalProject = await projects.getProjectById(projectId)
      expect(finalProject.status).toBe('open_for_bids')
    })
  })
})
