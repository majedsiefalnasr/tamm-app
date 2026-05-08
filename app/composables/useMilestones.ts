import { ref, computed } from 'vue'
import type { Milestone, MilestoneStatus } from '~/shared/types/project'

export interface MilestoneInput {
  title: string
  description?: string
  amount: number
  order?: number
}

export interface MilestoneWithProject extends Milestone {
  projectId?: string
}

export const useMilestones = () => {
  // Store milestones by projectId for efficient updates
  const milestonesMap = ref<Record<string, Milestone[]>>({})
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Mock milestones (will be replaced by API)
  const mockMilestones: Record<string, Milestone[]> = {
    'proj-001': [
      {
        id: 'ms-1',
        name: 'Foundation & Structure',
        description: 'Excavation, foundation, concrete structure',
        amount: 50000,
        order: 1,
        status: 'approved',
        created_at: '2026-04-20T09:00:00Z',
      },
      {
        id: 'ms-2',
        name: 'Walls & Finishing',
        description: 'Walls, finishing, internal work',
        amount: 75000,
        order: 2,
        status: 'in_progress',
        created_at: '2026-05-01T09:00:00Z',
      },
      {
        id: 'ms-3',
        name: 'Final Handover',
        description: 'Final checks and handover',
        amount: 125000,
        order: 3,
        status: 'not_started',
        created_at: '2026-05-05T09:00:00Z',
      },
    ],
    'proj-002': [],
  }

  // Get milestones for a project
  const getMilestones = (projectId: string): Milestone[] => {
    return milestonesMap.value[projectId] || []
  }

  // Load milestones for a project
  const loadMilestones = async (projectId: string) => {
    if (milestonesMap.value[projectId]) {
      return milestonesMap.value[projectId]
    }

    loading.value = true
    error.value = null

    try {
      // TODO: replace mock — GET /projects/:id/milestones endpoint
      await new Promise(resolve => setTimeout(resolve, 200))
      milestonesMap.value[projectId] = mockMilestones[projectId] || []
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Failed to load milestones'
      milestonesMap.value[projectId] = []
    } finally {
      loading.value = false
    }
  }

  // Add a new milestone (optimistic update)
  const addMilestone = async (
    projectId: string,
    data: MilestoneInput
  ): Promise<Milestone> => {
    const tempId = `temp-${Date.now()}-${Math.random()}`
    const milestones = milestonesMap.value[projectId] || []
    const nextOrder =
      data.order ||
      (milestones.length > 0
        ? Math.max(...milestones.map(m => m.order)) + 1
        : 1)

    const newMilestone: Milestone = {
      id: tempId,
      name: data.title, // Map 'title' from form to 'name' in Milestone type
      description: data.description,
      amount: data.amount,
      order: nextOrder,
      status: 'not_started',
      created_at: new Date().toISOString(),
    }

    // Optimistic update
    if (!milestonesMap.value[projectId]) {
      milestonesMap.value[projectId] = []
    }
    milestonesMap.value[projectId].push(newMilestone)

    try {
      // TODO: replace mock — POST /projects/:id/milestones endpoint
      await new Promise(resolve => setTimeout(resolve, 300))

      // Simulate API response with real ID
      const realId = `ms-${Date.now()}`
      const createdMilestone = { ...newMilestone, id: realId }

      // Replace temp ID with real ID
      const index = milestonesMap.value[projectId].findIndex(
        m => m.id === tempId
      )
      if (index !== -1) {
        milestonesMap.value[projectId][index] = createdMilestone
      }

      return createdMilestone
    } catch (err) {
      // Rollback on error
      milestonesMap.value[projectId] = milestonesMap.value[projectId].filter(
        m => m.id !== tempId
      )
      error.value =
        err instanceof Error ? err.message : 'Failed to add milestone'
      throw err
    }
  }

  // Edit a milestone (optimistic update)
  const editMilestone = async (
    projectId: string,
    milestoneId: string,
    data: MilestoneInput
  ): Promise<Milestone> => {
    const milestones = milestonesMap.value[projectId] || []
    const index = milestones.findIndex(m => m.id === milestoneId)

    if (index === -1) {
      throw new Error('Milestone not found')
    }

    const oldMilestone = { ...milestones[index] }
    const nextOrder =
      data.order ||
      (milestones.length > 0
        ? Math.max(...milestones.map(m => m.order)) + 1
        : 1)

    const updatedMilestone: Milestone = {
      ...oldMilestone,
      name: data.title,
      description: data.description,
      amount: data.amount,
      order: nextOrder,
    }

    // Optimistic update
    milestonesMap.value[projectId][index] = updatedMilestone

    try {
      // TODO: replace mock — PUT /projects/:id/milestones/:milestoneId endpoint
      await new Promise(resolve => setTimeout(resolve, 300))
      return updatedMilestone
    } catch (err) {
      // Rollback on error
      milestonesMap.value[projectId][index] = oldMilestone
      error.value =
        err instanceof Error ? err.message : 'Failed to edit milestone'
      throw err
    }
  }

  // Delete a milestone (optimistic update)
  const deleteMilestone = async (
    projectId: string,
    milestoneId: string
  ): Promise<void> => {
    const milestones = milestonesMap.value[projectId] || []
    const index = milestones.findIndex(m => m.id === milestoneId)

    if (index === -1) {
      throw new Error('Milestone not found')
    }

    const deletedMilestone = { ...milestones[index] }

    // Optimistic update
    milestonesMap.value[projectId] = milestones.filter(
      m => m.id !== milestoneId
    )

    try {
      // TODO: replace mock — DELETE /projects/:id/milestones/:milestoneId endpoint
      await new Promise(resolve => setTimeout(resolve, 300))
    } catch (err) {
      // Rollback on error
      milestonesMap.value[projectId] = [
        ...milestonesMap.value[projectId].slice(0, index),
        deletedMilestone,
        ...milestonesMap.value[projectId].slice(index),
      ]
      error.value =
        err instanceof Error ? err.message : 'Failed to delete milestone'
      throw err
    }
  }

  // Calculate totals for a project
  const getProjectTotals = (projectId: string) => {
    const milestones = milestonesMap.value[projectId] || []
    const totalAmount = milestones.reduce((sum, m) => sum + m.amount, 0)
    // Total paid would come from payment status in future
    const totalPaid = milestones
      .filter(m => m.status === 'approved')
      .reduce((sum, m) => sum + m.amount, 0)
    const remaining = totalAmount - totalPaid

    return {
      totalAmount,
      totalPaid,
      remaining,
      count: milestones.length,
    }
  }

  return {
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    getMilestones,
    loadMilestones,
    addMilestone,
    editMilestone,
    deleteMilestone,
    getProjectTotals,
  }
}
