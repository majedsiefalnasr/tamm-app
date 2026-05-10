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
        role: 'admin',
      },
      token: null as string | null,
    }))
  )
  ;({ useProjects } = await import('~/composables/useProjects'))
})

describe('useProjects.assignEngineers', () => {
  let composable: ReturnType<typeof useProjects>

  beforeEach(async () => {
    vi.clearAllMocks()
    mockedUseApi.mockResolvedValue({
      success: true,
      data: {
        supervisor_engineer_id: 'eng-001',
        field_engineer_id: 'eng-002',
        supervisor_engineer: { id: 'eng-001', name: 'Khaled Ibrahim' },
        field_engineer: { id: 'eng-002', name: 'Mohammed Hassan' },
      },
    })
    composable = useProjects()
  })

  it('calls assign-engineers API with contract body', async () => {
    const result = await composable.assignEngineers(
      'proj-002',
      'eng-001',
      'eng-002'
    )

    expect(result.success).toBe(true)
    expect(mockedUseApi).toHaveBeenCalledWith(
      '/admin/projects/proj-002/assign-engineers',
      {
        method: 'POST',
        body: {
          supervisor_engineer_id: 'eng-001',
          field_engineer_id: 'eng-002',
        },
      }
    )
  })

  it('merges engineer names from API data into project detail', async () => {
    await composable.assignEngineers('proj-002', 'eng-001', 'eng-002')

    const updated = await composable.getProjectById('proj-002')
    expect(updated.supervisor_engineer_id).toBe('eng-001')
    expect(updated.field_engineer_id).toBe('eng-002')
    expect(updated.supervisor_name).toBe('Khaled Ibrahim')
    expect(updated.field_engineer_name).toBe('Mohammed Hassan')
  })

  it('returns failure for non-existent project', async () => {
    const result = await composable.assignEngineers(
      'invalid-project',
      'eng-001',
      'eng-002'
    )

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('not found')
    }
    expect(mockedUseApi).not.toHaveBeenCalled()
  })

  it('rejects when project status is not contractor_selected', async () => {
    const result = await composable.assignEngineers(
      'proj-001',
      'eng-001',
      'eng-002'
    )

    expect(result.success).toBe(false)
    expect(mockedUseApi).not.toHaveBeenCalled()
  })

  it('rejects empty engineer ids before calling API', async () => {
    const result = await composable.assignEngineers('proj-002', '', 'eng-002')

    expect(result.success).toBe(false)
    expect(mockedUseApi).not.toHaveBeenCalled()
  })

  it('rolls back assignments when API returns a logical failure', async () => {
    const before = await composable.getProjectById('proj-002')

    mockedUseApi.mockResolvedValueOnce({
      success: false,
      data: {} as never,
      message: 'Validation failed',
    })

    const result = await composable.assignEngineers(
      'proj-002',
      'eng-001',
      'eng-002'
    )

    expect(result.success).toBe(false)
    const after = await composable.getProjectById('proj-002')
    expect(after.supervisor_engineer_id).toBe(before.supervisor_engineer_id)
    expect(after.field_engineer_id).toBe(before.field_engineer_id)
  })

  it('rolls back assignments when API throws', async () => {
    const before = await composable.getProjectById('proj-002')

    const apiErr = new Error('Server error') as ApiError
    apiErr.statusCode = 500
    mockedUseApi.mockRejectedValueOnce(apiErr)

    const result = await composable.assignEngineers(
      'proj-002',
      'eng-001',
      'eng-002'
    )

    expect(result.success).toBe(false)
    const after = await composable.getProjectById('proj-002')
    expect(after.supervisor_engineer_id).toBe(before.supervisor_engineer_id)
    expect(after.field_engineer_id).toBe(before.field_engineer_id)
  })

  it('keeps optimistic assignment when API is unavailable (mock fallback)', async () => {
    const apiErr = new Error('Not Found') as ApiError
    apiErr.statusCode = 404
    mockedUseApi.mockRejectedValueOnce(apiErr)

    const result = await composable.assignEngineers(
      'proj-002',
      'eng-003',
      'eng-004'
    )

    expect(result.success).toBe(true)
    const updated = await composable.getProjectById('proj-002')
    expect(updated.supervisor_engineer_id).toBe('eng-003')
    expect(updated.field_engineer_id).toBe('eng-004')
  })
})
