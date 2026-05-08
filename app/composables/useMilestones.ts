import { ref, computed } from 'vue'
import type { Milestone, MilestoneStatus, Report } from '~/shared/types/project'
import { canTransition } from '~/utils/statusMachine'
import { useNotifications } from '~/composables/useNotifications'
import { useI18n } from 'vue-i18n'

export interface MilestoneInput {
  title: string
  description?: string
  amount: number
  order?: number
}

export interface ReportInput {
  content: string
  images: File[]
}

export interface PaymentPayload {
  payment_method: 'bank_transfer'
  bank_name: string
  transaction_reference: string
  receipt_image: File
  notes?: string
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

  // Approve milestone (supervisor or client)
  const approveMilestone = async (
    milestoneId: string,
    role: 'supervisor_engineer' | 'client'
  ): Promise<Milestone> => {
    // Find milestone in any project
    let milestone: Milestone | undefined
    let projectId: string | undefined
    let milestoneIndex: number = -1

    for (const [pId, milestones] of Object.entries(milestonesMap.value)) {
      const idx = milestones.findIndex(m => m.id === milestoneId)
      if (idx !== -1) {
        projectId = pId
        milestone = milestones[idx]
        milestoneIndex = idx
        break
      }
    }

    if (!milestone || !projectId) {
      throw new Error('Milestone not found')
    }

    // Validate transition
    const targetStatus =
      role === 'supervisor_engineer' ? 'supervisor_approved' : 'approved'
    if (!canTransition('milestone', milestone.status, targetStatus)) {
      throw new Error('Invalid transition')
    }

    const prevMilestone = { ...milestone }

    // Optimistic update
    const updatedMilestone: Milestone = {
      ...milestone,
      status: targetStatus as MilestoneStatus,
      updated_at: new Date().toISOString(),
    }

    milestonesMap.value[projectId][milestoneIndex] = updatedMilestone

    try {
      // TODO: replace mock — POST /milestones/:id/approve endpoint
      await new Promise(resolve => setTimeout(resolve, 300))
      return updatedMilestone
    } catch (err) {
      // Rollback on error
      milestonesMap.value[projectId][milestoneIndex] = prevMilestone
      error.value =
        err instanceof Error ? err.message : 'Failed to approve milestone'
      throw err
    }
  }

  // Reject milestone
  const rejectMilestone = async (
    milestoneId: string,
    reason: string,
    role: 'supervisor_engineer' | 'client' = 'supervisor_engineer'
  ): Promise<Milestone> => {
    // Find milestone in any project
    let milestone: Milestone | undefined
    let projectId: string | undefined
    let milestoneIndex: number = -1

    for (const [pId, milestones] of Object.entries(milestonesMap.value)) {
      const idx = milestones.findIndex(m => m.id === milestoneId)
      if (idx !== -1) {
        projectId = pId
        milestone = milestones[idx]
        milestoneIndex = idx
        break
      }
    }

    if (!milestone || !projectId) {
      throw new Error('Milestone not found')
    }

    // Validate transition to rejected
    if (!canTransition('milestone', milestone.status, 'rejected')) {
      throw new Error('Invalid transition')
    }

    const prevMilestone = { ...milestone }

    // Optimistic update: status goes to in_progress (auto-transitioned)
    const updatedMilestone: Milestone = {
      ...milestone,
      status: 'in_progress' as MilestoneStatus,
      updated_at: new Date().toISOString(),
    }

    milestonesMap.value[projectId][milestoneIndex] = updatedMilestone

    try {
      // TODO: replace mock — POST /milestones/:id/reject endpoint
      await new Promise(resolve => setTimeout(resolve, 300))
      return updatedMilestone
    } catch (err) {
      // Rollback on error
      milestonesMap.value[projectId][milestoneIndex] = prevMilestone
      error.value =
        err instanceof Error ? err.message : 'Failed to reject milestone'
      throw err
    }
  }

  // Submit report for a milestone
  const submitReport = async (
    projectId: string,
    milestoneId: string,
    reportData: ReportInput
  ): Promise<Report> => {
    const { notify } = useNotifications()
    const { t } = useI18n()

    // Find milestone
    const milestones = milestonesMap.value[projectId] || []
    const index = milestones.findIndex(m => m.id === milestoneId)

    if (index === -1) {
      throw new Error('Milestone not found')
    }

    const milestone = milestones[index]

    // Validate transition
    if (!canTransition('milestone', milestone.status, 'under_review')) {
      throw new Error('Invalid status transition')
    }

    const prevStatus = milestone.status
    const prevMilestone = { ...milestone }

    // Optimistic update
    milestonesMap.value[projectId][index] = {
      ...milestone,
      status: 'under_review' as MilestoneStatus,
      updated_at: new Date().toISOString(),
    }

    try {
      // TODO: replace mock — POST /milestones/:id/reports endpoint
      const mockReport: Report = {
        id: `report-${Date.now()}`,
        milestone_id: milestoneId,
        content: reportData.content,
        images: [], // Mock: no actual image upload
        submitted_by: {
          id: 'fe-001',
          name: 'Field Engineer',
        },
        submitted_at: new Date().toISOString(),
        status: 'submitted',
      }

      await new Promise(resolve => setTimeout(resolve, 500))

      // Update milestone with latest report
      milestonesMap.value[projectId][index] = {
        ...milestonesMap.value[projectId][index],
        latest_report: mockReport,
      }

      return mockReport
    } catch (err) {
      // Rollback on error
      milestonesMap.value[projectId][index] = prevMilestone
      error.value =
        err instanceof Error ? err.message : 'Failed to submit report'
      throw err
    }
  }

  // Get pending reviews for the authenticated supervisor
  const pendingReviews = ref<Milestone[]>([])

  const getPendingReviews = async (): Promise<Milestone[]> => {
    loading.value = true
    error.value = null

    try {
      // TODO: replace mock — GET /milestones?supervisor_id={auth.id}&status=under_review endpoint
      await new Promise(resolve => setTimeout(resolve, 300))

      // Mock data: pending reviews sorted by submission date (oldest first)
      const mockPendingReviews: Milestone[] = [
        {
          id: 'ms-2',
          name: 'Walls & Finishing',
          description: 'Walls, finishing, internal work',
          amount: 75000,
          order: 2,
          status: 'under_review',
          tasks: [],
          payment_status: 'pending_payment',
          allowed_actions: [
            'review_milestone',
            'approve_milestone',
            'reject_milestone',
          ],
          created_at: '2026-05-01T09:00:00Z',
        },
      ]

      // Sort by created_at ascending (oldest first)
      const sorted = [...mockPendingReviews].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )

      pendingReviews.value = sorted
      return sorted
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Failed to load pending reviews'
      pendingReviews.value = []
      throw err
    } finally {
      loading.value = false
    }
  }

  const refreshPendingReviews = async (): Promise<void> => {
    await getPendingReviews()
  }

  const removePendingReview = (milestoneId: string): void => {
    pendingReviews.value = pendingReviews.value.filter(
      m => m.id !== milestoneId
    )
  }

  const pendingReviewsCount = computed(() => pendingReviews.value.length)

  // Get pending approvals for the authenticated client
  const pendingApprovals = ref<Milestone[]>([])

  const getPendingApprovals = async (): Promise<Milestone[]> => {
    loading.value = true
    error.value = null

    try {
      // TODO: replace mock — GET /milestones?client_id={auth.id}&status=supervisor_approved endpoint
      await new Promise(resolve => setTimeout(resolve, 300))

      // Mock data: pending approvals sorted by supervisor_approved_at (oldest first)
      const mockPendingApprovals: Milestone[] = [
        {
          id: 'ms-2',
          name: 'Walls & Finishing',
          description: 'Walls, finishing, internal work',
          amount: 75000,
          order: 2,
          status: 'supervisor_approved',
          tasks: [],
          payment_status: 'pending_payment',
          allowed_actions: ['approve_milestone', 'reject_milestone'],
          created_at: '2026-05-01T09:00:00Z',
          supervisor_approved_at: '2026-05-06T10:15:00Z',
          supervisor: {
            id: 'sup-001',
            name: 'Fatima Al-Mansouri',
          },
          project: {
            id: 'proj-001',
            name: 'Downtown Office Tower',
          },
          project_id: 'proj-001',
        },
        {
          id: 'ms-3',
          name: 'Electrical Work',
          description: 'Electrical installation and testing',
          amount: 50000,
          order: 3,
          status: 'supervisor_approved',
          tasks: [],
          payment_status: 'pending_payment',
          allowed_actions: ['approve_milestone', 'reject_milestone'],
          created_at: '2026-05-02T09:00:00Z',
          supervisor_approved_at: '2026-05-05T14:30:00Z',
          supervisor: {
            id: 'sup-002',
            name: 'Ahmed Hassan',
          },
          project: {
            id: 'proj-002',
            name: 'Azure Plaza Tower',
          },
          project_id: 'proj-002',
        },
      ]

      // Sort by supervisor_approved_at ascending (oldest first)
      const sorted = [...mockPendingApprovals].sort(
        (a, b) =>
          new Date(a.supervisor_approved_at || a.created_at).getTime() -
          new Date(b.supervisor_approved_at || b.created_at).getTime()
      )

      pendingApprovals.value = sorted
      return sorted
    } catch (err) {
      error.value = 'errors.approval_queue_load_failed'
      pendingApprovals.value = []
      throw err
    } finally {
      loading.value = false
    }
  }

  const refreshPendingApprovals = async (): Promise<void> => {
    await getPendingApprovals()
  }

  const removePendingApproval = (milestoneId: string): void => {
    pendingApprovals.value = pendingApprovals.value.filter(
      m => m.id !== milestoneId
    )
  }

  const pendingApprovalsCount = computed(() => pendingApprovals.value.length)

  // Pay for a milestone
  const payForMilestone = async (
    milestoneId: string,
    payload: PaymentPayload
  ): Promise<Milestone> => {
    // Find milestone in any project
    let milestone: Milestone | undefined
    let projectId: string | undefined
    let milestoneIndex: number = -1

    for (const [pId, milestones] of Object.entries(milestonesMap.value)) {
      const idx = milestones.findIndex(m => m.id === milestoneId)
      if (idx !== -1) {
        projectId = pId
        milestone = milestones[idx]
        milestoneIndex = idx
        break
      }
    }

    if (!milestone || !projectId) {
      throw new Error('Milestone not found')
    }

    // Validate transition
    if (!canTransition('payment', milestone.payment_status, 'paid')) {
      throw new Error('Invalid payment transition')
    }

    const prevMilestone = { ...milestone }

    // Optimistic update: payment -> paid, milestone -> in_progress
    const updatedMilestone: Milestone = {
      ...milestone,
      status: 'in_progress' as MilestoneStatus,
      payment_status: 'paid',
      updated_at: new Date().toISOString(),
    }

    milestonesMap.value[projectId][milestoneIndex] = updatedMilestone

    try {
      // TODO: replace mock — POST /milestones/:id/pay endpoint
      await new Promise(resolve => setTimeout(resolve, 500))
      return updatedMilestone
    } catch (err) {
      // Rollback on error
      milestonesMap.value[projectId][milestoneIndex] = prevMilestone
      error.value =
        err instanceof Error ? err.message : 'Failed to process payment'
      throw err
    }
  }

  // Release payment to contractor (admin only)
  const releaseMilestonePayment = async (
    milestoneId: string
  ): Promise<Milestone> => {
    // Find milestone in any project
    let milestone: Milestone | undefined
    let projectId: string | undefined
    let milestoneIndex: number = -1

    for (const [pId, milestones] of Object.entries(milestonesMap.value)) {
      const idx = milestones.findIndex(m => m.id === milestoneId)
      if (idx !== -1) {
        projectId = pId
        milestone = milestones[idx]
        milestoneIndex = idx
        break
      }
    }

    if (!milestone || !projectId) {
      throw new Error('Milestone not found')
    }

    // Validate transition from ready_for_payout to paid_out
    if (!canTransition('payment', 'ready_for_payout', 'paid_out')) {
      throw new Error('Invalid payment transition')
    }

    const prevMilestone = { ...milestone }

    // Optimistic update: payment -> paid_out
    const updatedMilestone: Milestone = {
      ...milestone,
      payment_status: 'paid_out',
      updated_at: new Date().toISOString(),
    }

    milestonesMap.value[projectId][milestoneIndex] = updatedMilestone

    try {
      // TODO: replace mock — POST /payments/:id/release endpoint
      await new Promise(resolve => setTimeout(resolve, 500))
      return updatedMilestone
    } catch (err) {
      // Rollback on error
      milestonesMap.value[projectId][milestoneIndex] = prevMilestone
      error.value =
        err instanceof Error ? err.message : 'Failed to release payment'
      throw err
    }
  }

  // Fetch all milestones for contractor (used by payment history page)
  const allMilestones = ref<Milestone[]>([])

  const fetchMilestones = async () => {
    loading.value = true
    error.value = null
    try {
      // Flatten all milestones from all projects
      const flattened: Milestone[] = []
      for (const projectMilestones of Object.values(mockMilestones)) {
        flattened.push(...projectMilestones)
      }
      allMilestones.value = flattened
      // TODO: replace mock — GET /milestones?contractor_id={id} endpoint
      return flattened
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Failed to load milestones'
      throw err
    } finally {
      loading.value = false
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
    approveMilestone,
    rejectMilestone,
    submitReport,
    getPendingReviews,
    refreshPendingReviews,
    removePendingReview,
    pendingReviews: computed(() => pendingReviews.value),
    pendingReviewsCount,
    getPendingApprovals,
    refreshPendingApprovals,
    removePendingApproval,
    pendingApprovals: computed(() => pendingApprovals.value),
    pendingApprovalsCount,
    payForMilestone,
    releaseMilestonePayment,
    fetchMilestones,
    milestones: computed(() => allMilestones.value),
  }
}
