import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest'
import type { ApiError } from '~/composables/useApi'
import { useApi } from '~/composables/useApi'

vi.mock('~/composables/useApi')

const mockedUseApi = vi.mocked(useApi)

let useProjects: typeof import('~/composables/useProjects').useProjects

beforeAll(async () => {
  vi.stubGlobal(
    'useAuthStore',
    vi.fn(() => ({
      user: {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'client',
      },
      token: null as string | null,
    }))
  )
  ;({ useProjects } = await import('~/composables/useProjects'))
})

describe('useProjects.selectContractor', () => {
  let composable: ReturnType<typeof useProjects>

  beforeEach(async () => {
    vi.clearAllMocks()
    mockedUseApi.mockResolvedValue({ success: true, data: {} })
    composable = useProjects()
    const project = await composable.getProjectById('proj-003')
    project.status = 'under_review'
    delete project.selected_proposal_id
  })

  describe('selectContractor', () => {
    it('successfully selects a contractor with valid transition', async () => {
      const result = await composable.selectContractor(
        'proj-003',
        'proposal-001'
      )

      expect(result.success).toBe(true)
      expect(mockedUseApi).toHaveBeenCalledWith(
        '/projects/proj-003/proposals/proposal-001/select',
        { method: 'POST' }
      )
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
      if (!result.success) {
        expect(result.failure).toBe('invalid_status')
      }
      expect(mockedUseApi).not.toHaveBeenCalled()
    })

    it('returns failure for non-existent project', async () => {
      const result = await composable.selectContractor(
        'invalid-project',
        'proposal-001'
      )

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.failure).toBe('project_not_found')
      }
      expect(mockedUseApi).not.toHaveBeenCalled()
    })

    it('validates transition before making API call', async () => {
      const result = await composable.selectContractor(
        'proj-002',
        'proposal-001'
      )

      expect(result.success).toBe(false)
      expect(mockedUseApi).not.toHaveBeenCalled()
    })

    it('rolls back status and proposal id when API returns server error', async () => {
      const projectBefore = await composable.getProjectById('proj-003')
      projectBefore.selected_proposal_id = 'prev-prop'

      const apiErr = new Error('Server error') as ApiError
      apiErr.statusCode = 500
      mockedUseApi.mockRejectedValueOnce(apiErr)

      const result = await composable.selectContractor(
        'proj-003',
        'proposal-001'
      )

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.failure).toBe('server_error')
      }

      const updated = await composable.getProjectById('proj-003')
      expect(updated.status).toBe('under_review')
      expect(updated.selected_proposal_id).toBe('prev-prop')
    })

    it('returns success when API is unavailable (mock fallback)', async () => {
      const apiErr = new Error('Not Found') as ApiError
      apiErr.statusCode = 404
      mockedUseApi.mockRejectedValueOnce(apiErr)

      const result = await composable.selectContractor(
        'proj-003',
        'proposal-001'
      )

      expect(result.success).toBe(true)
      const updated = await composable.getProjectById('proj-003')
      expect(updated.status).toBe('contractor_selected')
    })

    it('returns validation failure when API response reports failure', async () => {
      mockedUseApi.mockResolvedValueOnce({
        success: false,
        data: {},
        message: 'Rejected',
      })

      const result = await composable.selectContractor(
        'proj-003',
        'proposal-001'
      )

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.failure).toBe('validation')
      }
      const updated = await composable.getProjectById('proj-003')
      expect(updated.status).toBe('under_review')
    })

    it('can select again after status reset', async () => {
      const result1 = await composable.selectContractor(
        'proj-003',
        'proposal-001'
      )
      expect(result1.success).toBe(true)

      const project = await composable.getProjectById('proj-003')
      project.status = 'under_review'

      const result2 = await composable.selectContractor(
        'proj-003',
        'proposal-002'
      )
      expect(result2.success).toBe(true)
    })
  })
})
