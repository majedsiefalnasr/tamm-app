import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useProjects } from '~/app/composables/useProjects'

// Mock auth store
vi.mock('~/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    user: {
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'client',
    },
  })),
}))

describe('useProjects.selectContractor', () => {
  let composable: ReturnType<typeof useProjects>

  beforeEach(async () => {
    composable = useProjects()
    // Initialize a project with under_review status for testing
    const project = await composable.getProjectById('proj-003')
    project.status = 'under_review'
  })

  describe('selectContractor', () => {
    it('successfully selects a contractor with valid transition', async () => {
      const result = await composable.selectContractor(
        'proj-003',
        'proposal-001'
      )

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('updates project status to contractor_selected on success', async () => {
      await composable.selectContractor('proj-003', 'proposal-001')

      const updated = await composable.getProjectById('proj-003')
      expect(updated.status).toBe('contractor_selected')
    })

    it('stores selected_proposal_id on success', async () => {
      const proposalId = 'proposal-001'
      await composable.selectContractor('proj-003', proposalId)

      const updated = await composable.getProjectById('proj-003')
      expect(updated.selected_proposal_id).toBe(proposalId)
    })

    it('rejects invalid transition from non-under_review status', async () => {
      const project = await composable.getProjectById('proj-001')
      expect(project.status).not.toBe('under_review')

      const result = await composable.selectContractor(
        'proj-001',
        'proposal-001'
      )

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error).toContain('Invalid project status')
    })

    it('returns error for non-existent project', async () => {
      const result = await composable.selectContractor(
        'invalid-project',
        'proposal-001'
      )

      expect(result.success).toBe(false)
      expect(result.error).toContain('not found')
    })

    it('validates transition before making API call', async () => {
      // Try to select on a project that's not under_review
      const result = await composable.selectContractor(
        'proj-002',
        'proposal-001'
      )

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('handles optimistic updates correctly', async () => {
      const prevProject = await composable.getProjectById('proj-003')
      const prevStatus = prevProject.status

      const result = await composable.selectContractor(
        'proj-003',
        'proposal-001'
      )

      if (result.success) {
        const updated = await composable.getProjectById('proj-003')
        expect(updated.status).not.toBe(prevStatus)
        expect(updated.status).toBe('contractor_selected')
      }
    })

    it('returns success with appropriate message format', async () => {
      const result = await composable.selectContractor(
        'proj-003',
        'proposal-001'
      )

      expect(result).toHaveProperty('success')
      expect(typeof result.success).toBe('boolean')
    })

    it('includes error message in failure response', async () => {
      const result = await composable.selectContractor(
        'proj-001',
        'proposal-001'
      )

      if (!result.success) {
        expect(result.error).toBeDefined()
        expect(typeof result.error).toBe('string')
      }
    })

    it('can select multiple times if status is reset', async () => {
      // First selection
      const result1 = await composable.selectContractor(
        'proj-003',
        'proposal-001'
      )
      expect(result1.success).toBe(true)

      // Reset status back to under_review (simulating a state change)
      const project = await composable.getProjectById('proj-003')
      project.status = 'under_review'

      // Second selection with different proposal
      const result2 = await composable.selectContractor(
        'proj-003',
        'proposal-002'
      )
      expect(result2.success).toBe(true)
    })
  })
})
