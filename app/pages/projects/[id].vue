<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ProjectDetail } from '~/shared/types/project'
import { formatCurrency } from '~/utils/formatters'
import { canTransition } from '~/utils/statusMachine'

definePageMeta({
  layout: 'default',
  roles: [
    'client',
    'contractor',
    'field_engineer',
    'supervisor_engineer',
    'admin',
    'super_admin',
  ],
})

const route = useRoute()
const { can } = usePermission()
const auth = useAuthStore()
const { t } = useI18n()

const id = route.params.id as string

const {
  data: project,
  pending,
  error,
  refresh,
} = await useAsyncData(`project-${id}`, () => useProjects().getProjectById(id))

const isAdmin = computed(() =>
  ['admin', 'super_admin'].includes(auth.user?.role || '')
)

const progressPercent = computed(() => {
  if (!project.value?.milestones.length) return 0
  const completed = project.value.milestones.filter(
    m => m.status === 'approved'
  ).length
  return Math.round((completed / project.value.milestones.length) * 100)
})

const showFinancial = computed(
  () => (project.value?.milestones.length ?? 0) > 0
)

const canAddMilestone = computed(() => {
  if (!project.value) return false
  if (['admin', 'super_admin'].includes(auth.user?.role || '')) return true
  if (
    auth.user?.role === 'contractor' &&
    auth.user?.id === project.value?.contractor_id
  )
    return true
  return false
})

const showContractor = computed(() => {
  if (!project.value) return false
  return ['contractor_selected', 'active', 'on_hold', 'completed'].includes(
    project.value.status
  )
})

const showEngineers = computed(() => {
  if (!project.value) return false
  return ['contractor_selected', 'active', 'on_hold', 'completed'].includes(
    project.value.status
  )
})

const showOpenForBidsButton = computed(() => {
  if (!project.value || !isAdmin.value) return false
  return project.value.status === 'new'
})

const showCloseBiddingButton = computed(() => {
  if (!project.value || !isAdmin.value) return false
  return project.value.status === 'open_for_bids'
})

const showAssignEngineersButton = computed(() => {
  if (!project.value || !isAdmin.value) return false
  return project.value.status === 'contractor_selected'
})

const proposalCount = computed(() => proposalsList.value.length)

const canCloseBidding = computed(() => {
  return proposalCount.value > 0
})

const isContractor = computed(() => auth.user?.role === 'contractor')

const showSubmitProposalButton = computed(() => {
  if (!project.value || !isContractor.value) return false
  if (project.value.status !== 'open_for_bids') return false
  if (hasSubmittedProposal(project.value.id)) return false
  return isContractorInvited(project.value.id, auth.user?.id || '')
})

const showSubmittedProposal = computed(() => {
  if (!project.value || !isContractor.value) return false
  if (project.value.status !== 'open_for_bids') return false
  return hasSubmittedProposal(project.value.id)
})

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    villa: 'Villa',
    apartment: 'Apartment',
    commercial: 'Commercial',
    other: 'Other',
  }
  return labels[type] || type
}

const getMilestoneStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    not_started: 'Not Started',
    in_progress: 'In Progress',
    under_review: 'Under Review',
    supervisor_approved: 'Supervisor Approved',
    approved: 'Approved',
    rejected: 'Rejected',
  }
  return labels[status] || status
}

// Open for bids dialog
const isOpenForBidsDialogOpen = ref(false)
const isSubmittingBids = ref(false)

// Submit proposal dialog
const isSubmitProposalDialogOpen = ref(false)
const { getProposal, hasSubmittedProposal, isContractorInvited } =
  useProposals()

// Close bidding dialog
const isCloseBiddingDialogOpen = ref(false)

// Assign engineers dialog
const isAssignEngineersDialogOpen = ref(false)

// Proposals section
const proposalsList = ref<any[]>([])
const proposalsLoading = ref(false)
const proposalsError = ref(false)
const selectedProposalId = ref<string | undefined>()

const showProposalsSection = computed(() => {
  if (!project.value) return false
  // Show proposals section when status is under_review or contractor_selected
  if (!['under_review', 'contractor_selected'].includes(project.value.status)) {
    return false
  }
  // Only show to client (project owner) and admin
  const isProjectOwner = auth.user?.id === project.value.client_id
  const isAdminRole = ['admin', 'super_admin'].includes(auth.user?.role || '')
  return isProjectOwner || isAdminRole
})

const canSelectProposal = computed(() => {
  if (!project.value) return false
  // Can only select when status is under_review AND user is project owner
  if (project.value.status !== 'under_review') return false
  const isProjectOwner = auth.user?.id === project.value.client_id
  return isProjectOwner
})

const loadProposals = async () => {
  if (!project.value) return
  proposalsLoading.value = true
  proposalsError.value = false
  try {
    const { getProjectProposals, getSelectedProposal } = useProposals()
    const proposals = await getProjectProposals(project.value.id)
    proposalsList.value = proposals
    selectedProposalId.value = getSelectedProposal(project.value.id)
  } catch (error) {
    console.error('Failed to load proposals:', error)
    proposalsError.value = true
  } finally {
    proposalsLoading.value = false
  }
}

const handleProposalSelected = async (data: {
  proposalId: string
  contractorId: string
  price: number
}) => {
  if (!project.value) return

  // Validate contractor was invited
  const { isContractorInvited } = useProposals()
  if (!isContractorInvited(project.value.id, data.contractorId)) {
    useNotification().error(t('errors.contractor_not_invited'))
    return
  }

  try {
    const projectsComposable = useProjects()
    const result = await projectsComposable.selectContractor(
      project.value.id,
      data.proposalId
    )

    if (result.success) {
      const { setSelectedProposal } = useProposals()
      setSelectedProposal(project.value.id, data.proposalId)
      selectedProposalId.value = data.proposalId
      useNotification().success(t('projects.proposals.selectionSuccess'))

      // Refresh project data to get updated status
      await refresh()
    } else {
      useNotification().error(
        result.error || t('projects.proposals.selectionFailed')
      )
      // Rollback selectedProposal on error
      selectedProposalId.value = undefined
      const { setSelectedProposal } = useProposals()
      setSelectedProposal(project.value.id, '')
    }
  } catch (err) {
    const errorMsg =
      err instanceof Error
        ? err.message
        : t('projects.proposals.selectionFailed')
    useNotification().error(errorMsg)
    // Rollback selectedProposal on error
    selectedProposalId.value = undefined
    const { setSelectedProposal } = useProposals()
    setSelectedProposal(project.value.id, '')
  }
}

const handleEngineersAssigned = async () => {
  isAssignEngineersDialogOpen.value = false
  await refresh()
}

// Load proposals when status changes to under_review or contractor_selected
watch(
  () => project.value?.status,
  async newStatus => {
    if (showProposalsSection.value) {
      await loadProposals()
    } else if (
      newStatus &&
      !['under_review', 'contractor_selected'].includes(newStatus)
    ) {
      // Clear stale selectedProposal when status reverts away
      const { setSelectedProposal } = useProposals()
      if (project.value) {
        setSelectedProposal(project.value.id, '')
        selectedProposalId.value = undefined
      }
    }
  }
)

// Load proposals on initial page load if section should be visible
onMounted(async () => {
  if (showProposalsSection.value) {
    await loadProposals()
  }
})

const handleOpenForBidsSubmitted = async (contractorIds: string[]) => {
  if (!project.value || !canTransition('project', 'new', 'open_for_bids')) {
    useNotification().error(t('errors.invalid_transition'))
    return
  }

  if (isSubmittingBids.value) return

  isSubmittingBids.value = true
  useNotification().info(t('projects.openForBids.loadingMessage'))

  const prevStatus = project.value.status
  project.value.status = 'open_for_bids'

  try {
    // Invite contractors (if endpoint available)
    try {
      await useProjects().inviteContractors(id, contractorIds)
    } catch (err) {
      const is404 =
        (err instanceof Error && err.message.includes('404')) ||
        err?.response?.status === 404

      if (!is404) {
        throw err
      }
    }

    // Update project status
    await useProjects().updateProjectStatus(id, 'open_for_bids')

    useNotification().success(t('projects.openForBids.successMessage'))
    isOpenForBidsDialogOpen.value = false

    // Refresh project data
    await refresh()
  } catch (err) {
    // Rollback
    project.value.status = prevStatus
    const errorMsg =
      err instanceof Error
        ? err.message
        : t('projects.openForBids.errorMessage')
    useNotification().error(errorMsg)
  } finally {
    isSubmittingBids.value = false
  }
}

const handleSubmitProposalCompleted = async () => {
  isSubmitProposalDialogOpen.value = false
  // Refresh project data to reflect proposal status
  await refresh()
}

const handleCloseBiddingConfirmed = async () => {
  if (
    !project.value ||
    !canTransition('project', 'open_for_bids', 'under_review')
  ) {
    useNotification().error(t('errors.invalid_transition'))
    return
  }

  const prevStatus = project.value.status

  try {
    project.value.status = 'under_review'

    // Call API to update project status
    await useProjects().closeBiddingForReview(id)

    useNotification().success(t('projects.closeBidding.successMessage'))
    isCloseBiddingDialogOpen.value = false

    // Refresh project data
    await refresh()
  } catch (err) {
    // Rollback
    project.value.status = prevStatus
    const errorMsg =
      err instanceof Error
        ? err.message
        : t('projects.closeBidding.errorMessage')
    useNotification().error(errorMsg)
  }
}
</script>

<template>
  <!-- Loading state -->
  <div v-if="pending" class="min-h-screen space-y-6 p-4 md:p-8">
    <div class="space-y-3">
      <div class="bg-muted-foreground/20 h-10 w-1/3 rounded-lg" />
      <div class="bg-muted-foreground/20 h-4 w-1/2 rounded-lg" />
    </div>
    <div class="grid gap-6 md:grid-cols-2">
      <div class="bg-muted-foreground/20 h-40 rounded-2xl" />
      <div class="bg-muted-foreground/20 h-40 rounded-2xl" />
    </div>
  </div>

  <!-- Error state -->
  <div v-else-if="error" class="min-h-screen">
    <ErrorState :error="error" @retry="refresh()" />
  </div>

  <!-- Main content -->
  <div v-else-if="project" class="space-y-6 p-4 md:p-8">
    <!-- Header card -->
    <div
      class="border-border bg-card shadow-card rounded-3xl border p-6 md:p-8"
      :style="{
        background: `linear-gradient(to inline-start, rgba(var(--color-primary-rgb), 0.1), var(--color-card))`,
      }"
    >
      <div class="flex flex-col gap-4 md:gap-6">
        <h1 class="text-ink text-2xl font-extrabold md:text-3xl">
          {{ project.name }}
        </h1>

        <!-- Meta information -->
        <div class="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <p class="text-muted-foreground text-xs">Client</p>
            <p class="text-ink text-sm font-semibold">
              {{ project.client_name }}
            </p>
          </div>
          <div>
            <p class="text-muted-foreground text-xs">Address</p>
            <p class="text-ink text-sm font-semibold">{{ project.city }}</p>
          </div>
          <div>
            <p class="text-muted-foreground text-xs">Type</p>
            <p class="text-ink text-sm font-semibold">
              {{ getTypeLabel(project.type) }}
            </p>
          </div>
          <div>
            <p class="text-muted-foreground text-xs">Area</p>
            <p class="text-ink text-sm font-semibold">
              {{ project.area_m2 }} m²
            </p>
          </div>
        </div>

        <!-- Progress bar -->
        <div v-if="showFinancial" class="space-y-2">
          <div class="flex items-center justify-between">
            <p class="text-ink text-sm font-semibold">Progress</p>
            <p class="text-muted-foreground text-xs">{{ progressPercent }}%</p>
          </div>
          <div class="bg-muted-foreground/20 h-2 w-full rounded-full">
            <div
              class="bg-primary h-2 rounded-full transition-all duration-300"
              :style="{ width: progressPercent + '%' }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Open for Bids button (admin only, status = new) -->
    <div v-if="showOpenForBidsButton" class="flex gap-3">
      <Button
        :disabled="isSubmittingBids"
        @click="isOpenForBidsDialogOpen = true"
      >
        {{ t('projects.openForBids.button') }}
      </Button>
    </div>

    <!-- Close Bidding button (admin only, status = open_for_bids) -->
    <div v-if="showCloseBiddingButton" class="flex gap-3">
      <Button
        :disabled="!canCloseBidding"
        @click="isCloseBiddingDialogOpen = true"
      >
        {{ t('projects.closeBidding.button') }}
      </Button>
    </div>

    <!-- Assign Engineers button (admin only, status = contractor_selected) -->
    <div v-if="showAssignEngineersButton" class="flex gap-3">
      <Button @click="isAssignEngineersDialogOpen = true">
        {{ t('projects.assignEngineers.button') }}
      </Button>
    </div>

    <!-- Submit Proposal button (contractor, if invited and status = open_for_bids) -->
    <div v-if="showSubmitProposalButton" class="flex gap-3">
      <Button @click="isSubmitProposalDialogOpen = true">
        {{ t('projects.submitProposal.button') }}
      </Button>
    </div>

    <!-- Proposal Summary (after submission) -->
    <div
      v-if="showSubmittedProposal && getProposal(project.id)"
      class="space-y-2"
    >
      <h3 class="text-ink text-sm font-semibold">
        {{ t('projects.submitProposal.proposalSummary') }}
      </h3>
      <ProposalSummary :proposal="getProposal(project.id)!" />
    </div>

    <!-- Contractor section -->
    <div
      v-if="showContractor"
      class="border-border bg-card shadow-card rounded-2xl border p-4"
    >
      <h2 class="text-ink mb-3 text-lg font-bold">Contractor</h2>
      <p class="text-ink text-sm font-semibold">
        {{ project.contractor_name }}
      </p>
    </div>

    <!-- Awaiting contractor badge -->
    <div
      v-else
      class="border-border bg-card shadow-card rounded-2xl border p-4"
    >
      <h2 class="text-ink mb-3 text-lg font-bold">Contractor</h2>
      <div
        class="border-primary/30 bg-primary/10 inline-flex rounded-full border px-3 py-1"
      >
        <p class="text-primary text-xs font-semibold">
          Awaiting contractor selection
        </p>
      </div>
    </div>

    <!-- Proposals section -->
    <div v-if="showProposalsSection">
      <ProposalsList
        :project-id="project.id"
        :proposals="proposalsList"
        :is-loading="proposalsLoading"
        :has-error="proposalsError"
        :can-select="canSelectProposal"
        :selected-proposal-id="selectedProposalId"
        @proposal-selected="handleProposalSelected"
        @retry-load="loadProposals"
      />
    </div>

    <!-- Engineers section -->
    <div
      v-if="showEngineers"
      class="border-border bg-card shadow-card rounded-2xl border p-4"
    >
      <h2 class="text-ink mb-3 text-lg font-bold">Team</h2>
      <div class="space-y-2">
        <div v-if="project.supervisor_name">
          <p class="text-muted-foreground text-xs">Supervisor Engineer</p>
          <p class="text-ink text-sm font-semibold">
            {{ project.supervisor_name }}
          </p>
        </div>
        <div v-if="project.field_engineer_name">
          <p class="text-muted-foreground text-xs">Field Engineer</p>
          <p class="text-ink text-sm font-semibold">
            {{ project.field_engineer_name }}
          </p>
        </div>
      </div>
    </div>

    <!-- Not yet assigned -->
    <div
      v-else
      class="border-border bg-card shadow-card rounded-2xl border p-4"
    >
      <h2 class="text-ink mb-3 text-lg font-bold">Team</h2>
      <div
        class="border-muted-foreground/30 bg-muted-foreground/10 inline-flex rounded-full border px-3 py-1"
      >
        <p class="text-muted-foreground text-xs font-semibold">
          Not yet assigned
        </p>
      </div>
    </div>

    <!-- Financial summary -->
    <div
      v-if="showFinancial"
      class="border-border bg-card shadow-card rounded-2xl border p-4"
    >
      <h2 class="text-ink mb-4 text-lg font-bold">Financial Summary</h2>
      <div class="grid gap-4 sm:grid-cols-3">
        <div>
          <p class="text-muted-foreground text-xs">Total Amount</p>
          <p class="text-ink mt-1 text-lg font-bold">
            {{ formatCurrency(project.total_amount) }}
          </p>
        </div>
        <div>
          <p class="text-muted-foreground text-xs">Paid Amount</p>
          <p class="text-success mt-1 text-lg font-bold">
            {{ formatCurrency(project.total_paid) }}
          </p>
        </div>
        <div>
          <p class="text-muted-foreground text-xs">Remaining</p>
          <p class="text-warning mt-1 text-lg font-bold">
            {{ formatCurrency(project.total_amount - project.total_paid) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Milestones section -->
    <div class="border-border bg-card shadow-card rounded-2xl border p-4">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-ink text-lg font-bold">Milestones</h2>
        <Button v-if="canAddMilestone" size="sm" variant="outline">
          Add Milestone
        </Button>
      </div>

      <div
        v-if="!project.milestones.length"
        class="border-border rounded-lg border-2 border-dashed p-8 text-center"
      >
        <p class="text-muted-foreground text-sm">No milestones yet</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="milestone in project.milestones"
          :key="milestone.id"
          class="border-border flex items-center justify-between rounded-lg border p-3"
        >
          <div class="flex-1">
            <h3 class="text-ink text-sm font-semibold">{{ milestone.name }}</h3>
            <p class="text-muted-foreground text-xs">
              {{ formatCurrency(milestone.amount) }}
            </p>
          </div>
          <div
            class="bg-muted-foreground/10 inline-flex rounded-full px-2 py-1"
          >
            <span class="text-muted-foreground text-xs font-semibold">
              {{ getMilestoneStatusLabel(milestone.status) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Admin actions (placeholder for Story 02-05) -->
    <div
      v-if="isAdmin"
      class="border-border bg-card shadow-card rounded-2xl border p-4"
    >
      <h2 class="text-ink mb-4 text-lg font-bold">Admin Actions</h2>
      <p class="text-muted-foreground text-sm">
        Admin actions will be available here (Story 02-05)
      </p>
    </div>
  </div>

  <!-- Open for Bids Dialog -->
  <OpenForBidsDialog
    v-if="project"
    :is-open="isOpenForBidsDialogOpen"
    :project-id="project.id"
    :project-name="project.name"
    @update:is-open="isOpenForBidsDialogOpen = $event"
    @submitted="handleOpenForBidsSubmitted"
  />

  <!-- Submit Proposal Dialog -->
  <SubmitProposalDialog
    v-if="project"
    :is-open="isSubmitProposalDialogOpen"
    :project-id="project.id"
    :project-name="project.name"
    @update:open="isSubmitProposalDialogOpen = $event"
    @submitted="handleSubmitProposalCompleted"
  />

  <!-- Close Bidding Dialog -->
  <CloseBiddingDialog
    v-if="project"
    :is-open="isCloseBiddingDialogOpen"
    :project-id="project.id"
    :project-name="project.name"
    :proposal-count="proposalCount"
    @update:is-open="isCloseBiddingDialogOpen = $event"
    @confirmed="handleCloseBiddingConfirmed"
  />

  <!-- Assign Engineers Dialog -->
  <AssignEngineersDialog
    v-if="project"
    :open="isAssignEngineersDialogOpen"
    :project-id="project.id"
    :project="project"
    @update:open="isAssignEngineersDialogOpen = $event"
    @success="handleEngineersAssigned"
  />
</template>
