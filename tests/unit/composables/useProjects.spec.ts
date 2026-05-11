import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useProjects } from '~/composables/useProjects'
import type { Project, ProjectDetail } from '~/shared/types/project'

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

  describe('fetchProjects', () => {
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

      const project = composable.projects.value[0]
      expect(project).toHaveProperty('id')
      expect(project).toHaveProperty('name')
      expect(project).toHaveProperty('status')
      expect(project).toHaveProperty('city')
      expect(project).toHaveProperty('budget')
    })

    it('clears error on successful fetch', async () => {
      // First, cause an error by trying to fetch a bad project
      try {
        await composable.getProjectById('invalid')
      } catch (e) {
        // Expected to error
      }

      // Now fetch projects should succeed
      await composable.fetchProjects()

      expect(composable.error.value).toBeNull()
    })
  })

  describe('getProjectById', () => {
    it('fetches a single project by ID', async () => {
      const project = await composable.getProjectById('proj-001')

      expect(project).toBeDefined()
      expect(project.id).toBe('proj-001')
      expect(project.name).toBe('Villa Project A')
    })

    it('returns project with all detail fields', async () => {
      const project = await composable.getProjectById('proj-001')

      expect(project).toHaveProperty('id')
      expect(project).toHaveProperty('name')
      expect(project).toHaveProperty('status')
      expect(project).toHaveProperty('client_id')
      expect(project).toHaveProperty('client_name')
      expect(project).toHaveProperty('total_amount')
      expect(project).toHaveProperty('total_paid')
      expect(project).toHaveProperty('milestones')
    })

    it('returns project with milestones array', async () => {
      const project = await composable.getProjectById('proj-001')

      expect(Array.isArray(project.milestones)).toBe(true)
      expect(project.milestones.length).toBeGreaterThan(0)
    })

    it('milestone objects have correct structure', async () => {
      const project = await composable.getProjectById('proj-001')

      const milestone = project.milestones[0]
      expect(milestone).toHaveProperty('id')
      expect(milestone).toHaveProperty('name')
      expect(milestone).toHaveProperty('amount')
      expect(milestone).toHaveProperty('status')
      expect(milestone).toHaveProperty('order')
    })

    it('throws error for non-existent project', async () => {
      await expect(composable.getProjectById('invalid-id')).rejects.toThrow()
    })

    it('returns correct contractor information when assigned', async () => {
      const project = await composable.getProjectById('proj-001')

      expect(project.contractor_id).toBeDefined()
      expect(project.contractor_name).toBe('Elite Builders')
    })

    it('returns project with no contractor when not assigned', async () => {
      const project = await composable.getProjectById('proj-003')

      expect(project.contractor_id).toBeUndefined()
    })

    it('returns project with team information when assigned', async () => {
      const project = await composable.getProjectById('proj-001')

      expect(project.supervisor_name).toBeDefined()
      expect(project.supervisor_name).toBe('Khaled Ibrahim')
    })

    it('returns project with empty milestones for new projects', async () => {
      const project = await composable.getProjectById('proj-003')

      expect(Array.isArray(project.milestones)).toBe(true)
      expect(project.milestones.length).toBe(0)
    })

    it('calculates total amounts correctly', async () => {
      const project = await composable.getProjectById('proj-001')

      expect(project.total_amount).toBe(250000)
      expect(project.total_paid).toBe(100000)
      expect(project.total_amount - project.total_paid).toBe(150000)
    })

    it('returns milestones with all status types', async () => {
      const project = await composable.getProjectById('proj-001')

      const statuses = project.milestones.map(m => m.status)
      expect(statuses).toContain('approved')
      expect(statuses).toContain('in_progress')
      expect(statuses).toContain('draft')
    })
  })

  describe('retryFetch', () => {
    it('retries fetching projects', async () => {
      await composable.retryFetch()

      expect(composable.projects.value.length).toBeGreaterThan(0)
      expect(composable.loading.value).toBe(false)
    })
  })
})
