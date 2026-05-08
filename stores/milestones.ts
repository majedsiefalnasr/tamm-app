import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Milestone, MilestoneStatus } from '~/shared/types/project'
import { canTransition } from '~/utils/statusMachine'
import { useNotifications } from '~/composables/useNotifications'

export interface MilestoneInput {
  title: string
  description?: string
  amount: number
  order?: number
}

// Global singleton state by projectId
const milestonesMap = ref<Record<string, Milestone[]>>({})
const loading = ref(false)
const error = ref<string | null>(null)

const mockMilestones: Record<string, Milestone[]> = {
  'proj-001': [
    {
      id: 'ms-1',
      name: 'Foundation & Structure',
      description: 'Excavation, foundation, concrete structure',
      amount: 50000,
      order: 1,
      status: 'approved',
      tasks: [],
      payment_status: 'paid',
      allowed_actions: ['view_report'],
      created_at: '2026-04-20T09:00:00Z',
    },
    {
      id: 'ms-2',
      name: 'Walls & Finishing',
      description: 'Walls, finishing, internal work',
      amount: 75000,
      order: 2,
      status: 'in_progress',
      tasks: [
        { id: 'task-1', title: 'Wall construction', completed: false },
        { id: 'task-2', title: 'Internal finishing', completed: false },
      ],
      payment_status: 'pending_payment',
      allowed_actions: ['submit_report', 'view_report'],
      created_at: '2026-05-01T09:00:00Z',
    },
    {
      id: 'ms-3',
      name: 'Final Handover',
      description: 'Final checks and handover',
      amount: 125000,
      order: 3,
      status: 'not_started',
      tasks: [],
      payment_status: 'pending_payment',
      allowed_actions: ['submit_report'],
      created_at: '2026-05-05T09:00:00Z',
    },
  ],
  'proj-002': [],
}

export const useMilestonesStore = defineStore('milestones', () => {
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
    const { notify } = useNotifications()
    const tempId = `temp-${Date.now()}-${Math.random()}`
    const milestones = milestonesMap.value[projectId] || []
    const nextOrder =
      data.order ||
      (milestones.length > 0
        ? Math.max(...milestones.map(m => m.order)) + 1
        : 1)

    const newMilestone: Milestone = {
      id: tempId,
      name: data.title,
      description: data.description,
      amount: data.amount,
      order: nextOrder,
      status: 'not_started',
      tasks: [],
      payment_status: 'pending_payment',
      allowed_actions: [],
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

      const realId = `ms-${Date.now()}`
      const createdMilestone = { ...newMilestone, id: realId }

      const index = milestonesMap.value[projectId].findIndex(
        m => m.id === tempId
      )
      if (index !== -1) {
        milestonesMap.value[projectId][index] = createdMilestone
      }

      return createdMilestone
    } catch (err) {
      milestonesMap.value[projectId] = milestonesMap.value[projectId].filter(
        m => m.id !== tempId
      )
      error.value =
        err instanceof Error ? err.message : 'Failed to add milestone'
      throw err
    }
  }

  // Update milestone status (optimistic)
  const updateMilestoneStatus = async (
    projectId: string,
    milestoneId: string,
    newStatus: MilestoneStatus
  ) => {
    const { notify } = useNotifications()
    const milestones = milestonesMap.value[projectId]
    if (!milestones) throw new Error('Project not found')

    const milestone = milestones.find(m => m.id === milestoneId)
    if (!milestone) throw new Error('Milestone not found')

    if (!canTransition('milestone', milestone.status, newStatus)) {
      throw new Error('Invalid status transition')
    }

    const previousStatus = milestone.status
    milestone.status = newStatus

    try {
      // TODO: replace mock — PUT /milestones/:id/status endpoint
      await new Promise(resolve => setTimeout(resolve, 300))
    } catch (err) {
      milestone.status = previousStatus
      error.value =
        err instanceof Error ? err.message : 'Failed to update milestone'
      throw err
    }
  }

  // Approve milestone (supervisor)
  const approveMilestoneAsSupervisor = async (
    projectId: string,
    milestoneId: string
  ) => {
    const { notify } = useNotifications()
    try {
      await updateMilestoneStatus(projectId, milestoneId, 'supervisor_approved')
      notify.success('milestone.status.supervisor_approved')
    } catch (err) {
      notify.error('errors.milestone_approval_failed')
      throw err
    }
  }

  // Approve milestone (client)
  const approveMilestoneAsClient = async (
    projectId: string,
    milestoneId: string
  ) => {
    const { notify } = useNotifications()
    try {
      await updateMilestoneStatus(projectId, milestoneId, 'approved')
      notify.success('success.client_milestone_approved')
    } catch (err) {
      notify.error('errors.client_milestone_approval_failed')
      throw err
    }
  }

  // Reject milestone
  const rejectMilestone = async (
    projectId: string,
    milestoneId: string,
    reason?: string
  ) => {
    const { notify } = useNotifications()
    const milestones = milestonesMap.value[projectId]
    if (!milestones) throw new Error('Project not found')

    const milestone = milestones.find(m => m.id === milestoneId)
    if (!milestone) throw new Error('Milestone not found')

    const previousStatus = milestone.status
    milestone.status = 'rejected'

    try {
      // TODO: replace mock — POST /milestones/:id/reject endpoint with reason
      await new Promise(resolve => setTimeout(resolve, 300))
      // Auto-transition to in_progress (per status machine)
      milestone.status = 'in_progress'
      notify.success('success.milestone_rejected')
    } catch (err) {
      milestone.status = previousStatus
      notify.error('errors.milestone_rejection_failed')
      throw err
    }
  }

  // Submit report for milestone
  const submitReport = async (
    projectId: string,
    milestoneId: string,
    content: string,
    images: File[]
  ) => {
    const { notify } = useNotifications()
    const milestones = milestonesMap.value[projectId]
    if (!milestones) throw new Error('Project not found')

    const milestone = milestones.find(m => m.id === milestoneId)
    if (!milestone) throw new Error('Milestone not found')

    const previousStatus = milestone.status
    milestone.status = 'under_review'

    try {
      // TODO: replace mock — POST /reports endpoint
      await new Promise(resolve => setTimeout(resolve, 500))
      notify.success('success.report_submitted')
    } catch (err) {
      milestone.status = previousStatus
      notify.error('errors.report_submission_failed')
      throw err
    }
  }

  return {
    loading,
    error,
    getMilestones,
    loadMilestones,
    addMilestone,
    updateMilestoneStatus,
    approveMilestoneAsSupervisor,
    approveMilestoneAsClient,
    rejectMilestone,
    submitReport,
  }
})
