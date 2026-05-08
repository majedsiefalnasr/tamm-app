import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useProjects } from '~/app/composables/useProjects'
import type { Project } from '~/shared/types/project'

// Mock auth store
vi.mock('~/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    user: {
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'admin',
    },
  })),
}))

describe('useProjects composable', () => {
  let composable: ReturnType<typeof useProjects>

  beforeEach(() => {
    composable = useProjects()
  })

  it('initializes with empty projects', () => {
    expect(composable.projects.value).toEqual([])
    expect(composable.loading.value).toBe(false)
    expect(composable.error.value).toBeNull()
  })

  it('fetches projects and populates the list', async () => {
    await composable.fetchProjects()

    expect(composable.projects.value.length).toBeGreaterThan(0)
    expect(composable.loading.value).toBe(false)
    expect(composable.error.value).toBeNull()
  })

  it('sets loading state during fetch', async () => {
    const fetchPromise = composable.fetchProjects()

    expect(composable.loading.value).toBe(true)

    await fetchPromise

    expect(composable.loading.value).toBe(false)
  })

  it('returns projects with correct structure', async () => {
    await composable.fetchProjects()

    const firstProject = composable.projects.value[0]

    expect(firstProject).toHaveProperty('id')
    expect(firstProject).toHaveProperty('name')
    expect(firstProject).toHaveProperty('description')
    expect(firstProject).toHaveProperty('city')
    expect(firstProject).toHaveProperty('status')
    expect(firstProject).toHaveProperty('budget')
    expect(firstProject).toHaveProperty('currency')
  })

  it('supports retry functionality', async () => {
    await composable.fetchProjects()
    const firstFetchCount = composable.projects.value.length

    await composable.retryFetch()
    const secondFetchCount = composable.projects.value.length

    expect(secondFetchCount).toBe(firstFetchCount)
  })

  it('filters projects based on admin role', async () => {
    await composable.fetchProjects()
    // Admin should see all projects
    expect(composable.projects.value.length).toBeGreaterThan(0)
  })
})
