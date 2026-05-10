import { ref, computed } from 'vue'
import type { Milestone, MilestoneStatus, Report } from '~/shared/types/project'
import { canTransition, derivePaymentStatus } from '~/utils/statusMachine'
import { useNotifications } from '~/composables/useNotifications'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '~/stores/auth'

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

/** Supervisor dashboard + /reviews share one pending-review queue */
export interface SupervisorReviewDecision {
  milestoneId: string
  milestoneName: string
  projectId: string
  projectName: string
  decision: 'approved' | 'rejected'
  decidedAt: string
}

const pendingReviewsShared = ref<Milestone[]>([])
const supervisorDecisionLogShared = ref<SupervisorReviewDecision[]>([])

/** Seed for dashboard until GET supervisor review history exists */
const SEED_SUPERVISOR_RECENT_DECISIONS: SupervisorReviewDecision[] = [
  {
    milestoneId: 'ms-seed-1',
    milestoneName: 'Structural inspection',
    projectId: 'proj-001',
    projectName: 'Villa Project A',
    decision: 'approved',
    decidedAt: '2026-05-02T14:00:00Z',
  },
  {
    milestoneId: 'ms-seed-2',
    milestoneName: 'Concrete pour — phase A',
    projectId: 'proj-002',
    projectName: 'Apartment Complex B',
    decision: 'rejected',
    decidedAt: '2026-05-07T09:30:00Z',
  },
]

export const useMilestones = () => {
  // Store milestones by projectId for efficient updates
  const milestonesMap = ref<Record<string, Milestone[]>>({})
  const loading = ref(false)
  const error = ref<string | null>(null)
  const releasingMilestones = ref<Set<string>>(new Set())

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
      {
        id: 'ms-90',
        name: 'Façade inspection',
        description: 'Safety walkthrough and photo report',
        amount: 12000,
        order: 4,
        status: 'under_review',
        tasks: [],
        payment_status: 'pending_payment',
        allowed_actions: [
          'review_milestone',
          'approve_milestone',
          'reject_milestone',
        ],
        created_at: '2026-05-03T09:00:00Z',
        updated_at: '2026-05-05T11:00:00Z',
        project_id: 'proj-001',
        project: { id: 'proj-001', name: 'Villa Project A' },
        supervisor: { id: 'user-201', name: 'Khaled Ibrahim' },
        field_engineer: { id: 'user-202', name: 'Mohammed Hassan' },
        latest_report: {
          id: 'report-ms90',
          milestone_id: 'ms-90',
          content: 'Façade checklist completed.',
          images: [],
          submitted_at: '2026-05-05T10:00:00Z',
          status: 'submitted',
        },
      },
      {
        id: 'ms-91',
        name: 'Electrical rough-in review',
        description: 'Verify conduit runs before slab pour',
        amount: 18500,
        order: 5,
        status: 'under_review',
        tasks: [],
        payment_status: 'pending_payment',
        allowed_actions: [
          'review_milestone',
          'approve_milestone',
          'reject_milestone',
        ],
        created_at: '2026-05-04T09:00:00Z',
        updated_at: '2026-05-08T12:30:00Z',
        project_id: 'proj-001',
        project: { id: 'proj-001', name: 'Villa Project A' },
        supervisor: { id: 'user-201', name: 'Khaled Ibrahim' },
        field_engineer: { id: 'user-203', name: 'Youssef Ali' },
        latest_report: {
          id: 'report-ms91',
          milestone_id: 'ms-91',
          content: 'Conduit photos uploaded.',
          images: [],
          submitted_at: '2026-05-08T09:15:00Z',
          status: 'submitted',
        },
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

  const pendingReviewSubmissionTs = (m: Milestone): string =>
    m.latest_report?.submitted_at ?? m.updated_at ?? m.created_at

  const pushSupervisorDecision = (
    milestone: Milestone,
    projectId: string,
    decision: 'approved' | 'rejected'
  ): void => {
    supervisorDecisionLogShared.value = [
      {
        milestoneId: milestone.id,
        milestoneName: milestone.name,
        projectId,
        projectName: milestone.project?.name ?? '—',
        decision,
        decidedAt: new Date().toISOString(),
      },
      ...supervisorDecisionLogShared.value,
    ].slice(0, 40)
  }

  const supervisorRecentDecisionsMerged = computed(() => {
    const merged = [
      ...supervisorDecisionLogShared.value,
      ...SEED_SUPERVISOR_RECENT_DECISIONS,
    ]
    merged.sort(
      (a, b) =>
        new Date(b.decidedAt).getTime() - new Date(a.decidedAt).getTime()
    )
    return merged
  })

  const supervisorRecentDecisionsTop = computed(() =>
    supervisorRecentDecisionsMerged.value.slice(0, 5)
  )

  const supervisorApprovedThisMonthCount = computed(() => {
    const now = new Date()
    return supervisorRecentDecisionsMerged.value.filter(d => {
      if (d.decision !== 'approved') return false
      const dt = new Date(d.decidedAt)
      return (
        dt.getMonth() === now.getMonth() &&
        dt.getFullYear() === now.getFullYear()
      )
    }).length
  })

  const getSupervisorRecentDecisions = async (
    limit = 5
  ): Promise<SupervisorReviewDecision[]> => {
    // TODO: replace mock — GET /milestones/supervisor/review-history?limit={limit}
    await new Promise(resolve => setTimeout(resolve, 120))
    return supervisorRecentDecisionsMerged.value.slice(0, limit)
  }

  const getPendingReviews = async (): Promise<Milestone[]> => {
    loading.value = true
    error.value = null

    try {
      // TODO: replace mock — GET /milestones?supervisor_id={auth.id}&status=under_review endpoint
      await new Promise(resolve => setTimeout(resolve, 300))

      await loadMilestones('proj-001')

      const queued: Milestone[] = []
      for (const milestones of Object.values(milestonesMap.value)) {
        queued.push(...milestones.filter(m => m.status === 'under_review'))
      }

      const sorted = [...queued].sort(
        (a, b) =>
          new Date(pendingReviewSubmissionTs(a)).getTime() -
          new Date(pendingReviewSubmissionTs(b)).getTime()
      )

      pendingReviewsShared.value = sorted
      return sorted
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Failed to load pending reviews'
      pendingReviewsShared.value = []
      throw err
    } finally {
      loading.value = false
    }
  }

  const refreshPendingReviews = async (): Promise<void> => {
    await getPendingReviews()
  }

  const removePendingReview = (milestoneId: string): void => {
    pendingReviewsShared.value = pendingReviewsShared.value.filter(
      m => m.id !== milestoneId
    )
  }

  const pendingReviewsCount = computed(() => pendingReviewsShared.value.length)

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
      removePendingReview(milestoneId)
      if (role === 'supervisor_engineer') {
        pushSupervisorDecision(prevMilestone, projectId, 'approved')
      }
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
      removePendingReview(milestoneId)
      if (role === 'supervisor_engineer') {
        pushSupervisorDecision(prevMilestone, projectId, 'rejected')
      }
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
      error.value = 'Milestone not found'
      throw new Error(error.value)
    }

    // Validate transition
    if (!canTransition('payment', milestone.payment_status, 'paid')) {
      error.value = `Cannot transition payment from ${milestone.payment_status} to paid`
      throw new Error(error.value)
    }

    // Validate milestone still exists after lookup
    const milestonesArray = milestonesMap.value[projectId]
    if (!milestonesArray || !milestonesArray[milestoneIndex]) {
      error.value = 'Milestone state corrupted during lookup'
      throw new Error(error.value)
    }

    const prevMilestone = { ...milestone }

    // Optimistic update: payment -> paid (milestone status derived from API response per decision #2)
    const updatedMilestone: Milestone = {
      ...milestone,
      payment_status: 'paid',
      updated_at: new Date().toISOString(),
    }

    milestonesMap.value[projectId][milestoneIndex] = updatedMilestone

    try {
      // TODO: replace mock — POST /milestones/:id/pay endpoint
      // Decision #2: Backend returns the updated milestone with its new status
      const response = await new Promise<Milestone>(resolve => {
        setTimeout(() => {
          resolve({
            ...updatedMilestone,
            status: 'in_progress' as MilestoneStatus,
          })
        }, 500)
      })

      // Update with API response (derive milestone status from backend)
      milestonesMap.value[projectId][milestoneIndex] = response
      return response
    } catch (err) {
      // Rollback on error
      milestonesMap.value[projectId][milestoneIndex] = prevMilestone

      // Map 422 validation errors if available
      if (err instanceof Error && 'errors' in err) {
        const validationErrors = (err as any).errors as Record<string, string[]>
        error.value = JSON.stringify(validationErrors)
      } else {
        error.value =
          err instanceof Error ? err.message : 'Failed to process payment'
      }

      throw err
    }
  }

  // Release payment to contractor (admin only)
  const releaseMilestonePayment = async (
    milestoneId: string
  ): Promise<Milestone> => {
    // Prevent concurrent releases of same milestone
    if (releasingMilestones.value.has(milestoneId)) {
      throw new Error('Payment release already in progress for this milestone')
    }

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

    // Derive actual payment status from milestone status
    const paymentStatus = derivePaymentStatus(milestone.status)

    // Validate transition from current payment status to paid_out
    if (!canTransition('payment', paymentStatus, 'paid_out')) {
      throw new Error(
        'Invalid payment transition: payment is not in ready_for_payout state'
      )
    }

    releasingMilestones.value.add(milestoneId)
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
      // Expected: await useApi(`/payments/${milestoneId}/release`, { method: 'POST' })
      await new Promise(resolve => setTimeout(resolve, 500))
      return updatedMilestone
    } catch (err) {
      // Rollback on error
      milestonesMap.value[projectId][milestoneIndex] = prevMilestone
      error.value =
        err instanceof Error ? err.message : 'Failed to release payment'
      throw err
    } finally {
      releasingMilestones.value.delete(milestoneId)
    }
  }

  // Fetch all milestones for contractor (used by payment history page)
  const allMilestones = ref<Milestone[]>([])

  const fetchMilestones = async () => {
    loading.value = true
    error.value = null
    try {
      // Flatten all milestones from all projects (ensure project_id for dashboard filters)
      const flattened: Milestone[] = []
      for (const [projectId, projectMilestones] of Object.entries(
        mockMilestones
      )) {
        for (const m of projectMilestones) {
          flattened.push({
            ...m,
            project_id: m.project_id ?? projectId,
            project: m.project ?? {
              id: projectId,
              name: m.project?.name ?? '',
            },
          })
        }
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

  // Get milestones for field engineer (by status or all statuses)
  interface FieldEngineerMilestoneData extends Milestone {
    project_name?: string
    project_address?: string
    field_engineer_id?: string
    deadline?: string
    order_number?: number
  }

  const fieldEngineerMilestones = ref<FieldEngineerMilestoneData[]>([])

  const getMilestonesByFieldEngineer = (status?: string | null) => {
    const auth = useAuthStore()
    const engineerId = auth.user?.id ?? 'eng-1'
    loading.value = true
    error.value = null
    fieldEngineerMilestones.value = []

    queueMicrotask(() => {
      try {
        // Mock data for field engineer assignments (attribute to signed-in user for demo)
        const mockFieldEngineerData: FieldEngineerMilestoneData[] = [
          {
            id: 'ms-1',
            name: 'المرحلة الأولى - الأساسات',
            description: 'Excavation, foundation, concrete structure',
            amount: 50000,
            order: 1,
            status: 'in_progress',
            project_id: 'proj-1',
            project_name: 'مشروع البناء الأساسي',
            project_address: 'شارع النيل، القاهرة',
            field_engineer_id: engineerId,
            deadline: '2026-05-20T23:59:59Z',
            order_number: 1,
            created_at: '2026-05-01T09:00:00Z',
          },
          {
            id: 'ms-2',
            name: 'المرحلة الثانية - الجدران',
            description: 'Walls, finishing, internal work',
            amount: 75000,
            order: 2,
            status: 'in_progress',
            project_id: 'proj-1',
            project_name: 'مشروع البناء الأساسي',
            project_address: 'شارع النيل، القاهرة',
            field_engineer_id: engineerId,
            deadline: '2026-05-25T23:59:59Z',
            order_number: 2,
            created_at: '2026-05-02T09:00:00Z',
          },
          {
            id: 'ms-3',
            name: 'المرحلة الثالثة - الإنهاء',
            description: 'Final checks and handover',
            amount: 125000,
            order: 3,
            status: 'under_review',
            project_id: 'proj-2',
            project_name: 'مشروع الترميم',
            project_address: 'حي المعادي، القاهرة',
            field_engineer_id: engineerId,
            deadline: '2026-06-01T23:59:59Z',
            order_number: 3,
            created_at: '2026-05-03T09:00:00Z',
          },
          {
            id: 'ms-4',
            name: 'المرحلة الرابعة - التسليم',
            description: 'Project handover and completion',
            amount: 100000,
            order: 4,
            status: 'supervisor_approved',
            project_id: 'proj-2',
            project_name: 'مشروع الترميم',
            project_address: 'حي المعادي، القاهرة',
            field_engineer_id: engineerId,
            deadline: '2026-06-05T23:59:59Z',
            order_number: 4,
            created_at: '2026-05-04T09:00:00Z',
          },
        ]

        // Filter by engineer and status
        let filtered = mockFieldEngineerData.filter(
          m => m.field_engineer_id === engineerId
        )

        if (status !== null && status !== undefined) {
          filtered = filtered.filter(m => m.status === status)
        }

        // Sort by deadline ascending (oldest/closest first)
        filtered.sort(
          (a, b) =>
            new Date(a.deadline || a.created_at).getTime() -
            new Date(b.deadline || b.created_at).getTime()
        )

        fieldEngineerMilestones.value = filtered
        // TODO: replace mock — GET /api/v1/milestones?field_engineer_id={engineerId}&status={status}
      } catch (err) {
        error.value =
          err instanceof Error
            ? err.message
            : 'Failed to load field engineer milestones'
        fieldEngineerMilestones.value = []
      } finally {
        loading.value = false
      }
    })

    return {
      data: computed(() => fieldEngineerMilestones.value),
      loading: computed(() => loading.value),
      error: computed(() => error.value),
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
    pendingReviews: computed(() => pendingReviewsShared.value),
    pendingReviewsCount,
    getSupervisorRecentDecisions,
    supervisorRecentDecisionsTop,
    supervisorApprovedThisMonthCount,
    getPendingApprovals,
    refreshPendingApprovals,
    removePendingApproval,
    pendingApprovals: computed(() => pendingApprovals.value),
    pendingApprovalsCount,
    payForMilestone,
    releaseMilestonePayment,
    fetchMilestones,
    milestones: computed(() => allMilestones.value),
    getMilestonesByFieldEngineer,
  }
}
