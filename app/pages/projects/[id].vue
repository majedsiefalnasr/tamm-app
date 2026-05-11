<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronLeft } from 'lucide-vue-next'
import type { ProjectDetail, ProposalData } from '~/shared/types/project'
import { mockAdminUsers } from '~/composables/__mocks__/admin-users'
import type { SelectContractorFailure } from '~/composables/useProjects'
import { canTransition } from '~/utils/statusMachine'
import ErrorState from '~/components/common/ErrorState.vue'
import { Button } from '~/components/ui/button'
import AssignEngineersDialog from '~/components/project/AssignEngineersDialog.vue'
import CloseBiddingDialog from '~/components/project/CloseBiddingDialog.vue'
import OpenForBidsDialog from '~/components/project/OpenForBidsDialog.vue'
import ProjectDetailOverviewLovable from '~/components/project/ProjectDetailOverviewLovable.vue'
import ProposalSummary from '~/components/project/ProposalSummary.vue'
import ProposalsList from '~/components/project/ProposalsList.vue'
import SubmitProposalDialog from '~/components/project/SubmitProposalDialog.vue'

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

const projectErrorMessage = computed(() => {
  const e = error.value as unknown
  if (e == null) return t('common.error_description')
  if (typeof e === 'string') return e
  if (e instanceof Error) return e.message
  if (typeof e === 'object' && e !== null && 'message' in e) {
    const m = (e as { message?: unknown }).message
    if (typeof m === 'string') return m
  }
  return t('common.error_description')
})

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

const showOpenForBidsButton = computed(() => {
  if (!project.value || !can('manage_project')) return false
  return project.value.status === 'new'
})

const showCloseBiddingButton = computed(() => {
  if (!project.value || !can('manage_project')) return false
  return project.value.status === 'open_for_bids'
})

const showAssignEngineersButton = computed(() => {
  if (!project.value || !can('manage_project')) return false
  return project.value.status === 'contractor_selected'
})

const proposalCount = computed(() => proposalsList.value.length)

const canCloseBidding = computed(() => {
  return proposalCount.value > 0
})

const canSubmitProposal = computed(() => can('submit_proposal'))

const showSubmitProposalButton = computed(() => {
  if (!project.value || !canSubmitProposal.value) return false
  if (project.value.status !== 'open_for_bids') return false
  if (hasSubmittedProposal(project.value.id)) return false
  return auth.user?.id
    ? isContractorInvited(project.value.id, auth.user.id)
    : false
})

const showSubmittedProposal = computed(() => {
  if (!project.value || !canSubmitProposal.value) return false
  return hasSubmittedProposal(project.value.id)
})

// Open for bids dialog
const isOpenForBidsDialogOpen = ref(false)
const isSubmittingBids = ref(false)

// Submit proposal dialog
const isSubmitProposalDialogOpen = ref(false)
const {
  getProposal,
  hasSubmittedProposal,
  isContractorInvited,
  setInvitations,
  getProjectProposals,
  getInvitations,
} = useProposals()

// Close bidding dialog
const isCloseBiddingDialogOpen = ref(false)
const isClosingBidding = ref(false)

const invitedContractorCount = computed(() => {
  if (!project.value) return 0
  return getInvitations(project.value.id).length
})

// Assign engineers dialog
const isAssignEngineersDialogOpen = ref(false)

// Proposals section
const proposalsList = ref<ProposalData[]>([])
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
    const { getSelectedProposal } = useProposals()
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

/** Proposal counts for "Close bidding" — section hidden while still open_for_bids */
const loadProposalsForBiddingAdmin = async () => {
  if (!project.value) return
  if (project.value.status !== 'open_for_bids') return
  if (!can('manage_project')) return
  proposalsLoading.value = true
  proposalsError.value = false
  try {
    const list = await getProjectProposals(project.value.id)
    proposalsList.value = list
  } catch (error) {
    console.error('Failed to load proposals for bidding:', error)
    proposalsError.value = true
    proposalsList.value = []
  } finally {
    proposalsLoading.value = false
  }
}

const loadCurrentContractorProposal = async () => {
  if (!project.value || !canSubmitProposal.value) return
  try {
    await getProjectProposals(project.value.id)
  } catch {
    // Contractors may not be allowed to list proposals until the endpoint ships.
  }
}

const selectFailureMessage = (failure: SelectContractorFailure) => {
  const keys: Record<SelectContractorFailure, string> = {
    project_not_found: 'projects.proposals.selectErrors.projectNotFound',
    invalid_status: 'projects.proposals.selectErrors.invalidStatus',
    network: 'projects.proposals.selectErrors.network',
    server_error: 'projects.proposals.selectErrors.server',
    validation: 'projects.proposals.selectErrors.validation',
    unknown: 'projects.proposals.selectErrors.unknown',
  }
  return t(keys[failure])
}

const confirmContractorSelection = async (data: {
  proposalId: string
  contractorId: string
  price: number
}) => {
  if (!project.value) {
    return {
      success: false,
      errorMessage: t('projects.proposals.selectErrors.projectNotFound'),
    }
  }

  const { isContractorInvited } = useProposals()
  if (!isContractorInvited(project.value.id, data.contractorId)) {
    return {
      success: false,
      errorMessage: t('errors.contractor_not_invited'),
    }
  }

  try {
    const projectsComposable = useProjects()
    const result = await projectsComposable.selectContractor(
      project.value.id,
      data.proposalId
    )

    if (!result.success) {
      return {
        success: false,
        errorMessage: selectFailureMessage(result.failure),
      }
    }

    const { setSelectedProposal } = useProposals()
    setSelectedProposal(project.value.id, data.proposalId)
    selectedProposalId.value = data.proposalId
    useNotification().success(t('projects.proposals.selectionSuccess'))

    const proposalMeta = proposalsList.value.find(p => p.id === data.proposalId)
    const contractorDisplayName = proposalMeta?.contractorName ?? ''

    const { pushLocalNotification } = useNotifications()

    pushLocalNotification({
      id: `local-${crypto.randomUUID()}`,
      user_id: data.contractorId,
      title: t('notif.events.contractor_selected_contractor.title'),
      body: t('notif.events.contractor_selected_contractor.body', {
        project: project.value.name,
      }),
      link: `/projects/${project.value.id}`,
      is_read: false,
      created_at: new Date().toISOString(),
      read_at: null,
    })

    const admins = mockAdminUsers.filter(
      u =>
        (u.role === 'admin' || u.role === 'super_admin') &&
        u.status === 'active'
    )
    for (const admin of admins) {
      pushLocalNotification({
        id: `local-${crypto.randomUUID()}`,
        user_id: admin.id,
        title: t('notif.events.contractor_selected_admin.title'),
        body: t('notif.events.contractor_selected_admin.body', {
          contractor: contractorDisplayName,
          project: project.value.name,
        }),
        link: `/projects/${project.value.id}`,
        is_read: false,
        created_at: new Date().toISOString(),
        read_at: null,
      })
    }

    await refresh()
    return { success: true }
  } catch {
    return {
      success: false,
      errorMessage: t('projects.proposals.selectErrors.network'),
    }
  }
}

const handleEngineersAssigned = async () => {
  await refresh()
}

// Load proposals when status changes to under_review or contractor_selected
watch(
  () => project.value?.status,
  async newStatus => {
    if (showProposalsSection.value) {
      await loadProposals()
    } else if (newStatus === 'open_for_bids') {
      await loadProposalsForBiddingAdmin()
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
  await loadCurrentContractorProposal()
  if (showProposalsSection.value) {
    await loadProposals()
  }
  await loadProposalsForBiddingAdmin()
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

    // Store invitations for display on re-open
    setInvitations(id, contractorIds)

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

const getPrefillContractorIds = (): string[] => {
  // Return stored invitations for re-opening the dialog
  const { getInvitations } = useProposals()
  return getInvitations(id)
}

const handleSubmitProposalCompleted = async () => {
  isSubmitProposalDialogOpen.value = false
  await refresh()
  if (project.value?.status === 'open_for_bids' && can('manage_project')) {
    await loadProposalsForBiddingAdmin()
  }
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
  const { pushLocalNotification } = useNotifications()

  isClosingBidding.value = true
  try {
    project.value.status = 'under_review'

    await useProjects().closeBiddingForReview(id)

    pushLocalNotification({
      id: `local-${crypto.randomUUID()}`,
      user_id: project.value.client_id,
      title: t('notif.events.bidding_closed.title'),
      body: t('notif.events.bidding_closed.body', {
        project: project.value.name,
      }),
      link: `/projects/${id}`,
      is_read: false,
      created_at: new Date().toISOString(),
      read_at: null,
    })

    useNotification().success(t('projects.closeBidding.successMessage'))
    isCloseBiddingDialogOpen.value = false

    await refresh()
  } catch (err) {
    project.value.status = prevStatus
    const errorMsg =
      err instanceof Error
        ? err.message
        : t('projects.closeBidding.errorMessage')
    useNotification().error(errorMsg)
  } finally {
    isClosingBidding.value = false
  }
}
</script>

<template>
  <!-- Loading state -->
  <div v-if="pending" class="min-h-screen space-y-6">
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
    <ErrorState :message="projectErrorMessage" @action="refresh()" />
  </div>

  <!-- Main content -->
  <div v-else-if="project" class="space-y-6">
    <Button
      variant="ghost"
      size="sm"
      class="text-muted-foreground -ms-2 gap-1"
      as-child
    >
      <NuxtLink to="/projects" class="inline-flex items-center gap-1">
        <ChevronLeft class="size-4 rtl:rotate-180" aria-hidden="true" />
        {{ t('projects.detailLovable.back') }}
      </NuxtLink>
    </Button>
    <ProjectDetailOverviewLovable
      :project="project"
      :progress-percent="progressPercent"
      :show-financial="showFinancial"
    >
      <template #adminActions>
        <div class="flex flex-wrap gap-2 pt-1">
          <Button
            v-if="showOpenForBidsButton"
            :disabled="isSubmittingBids"
            @click="isOpenForBidsDialogOpen = true"
          >
            {{ t('projects.openForBids.button') }}
          </Button>
          <Button
            v-if="showCloseBiddingButton"
            :disabled="!canCloseBidding"
            @click="isCloseBiddingDialogOpen = true"
          >
            {{ t('projects.closeBidding.button') }}
          </Button>
          <Button
            v-if="showAssignEngineersButton"
            @click="isAssignEngineersDialogOpen = true"
          >
            {{
              project.supervisor_engineer_id && project.field_engineer_id
                ? t('projects.assignEngineers.updateButton')
                : t('projects.assignEngineers.button')
            }}
          </Button>
          <Button
            v-if="showSubmitProposalButton"
            variant="secondary"
            @click="isSubmitProposalDialogOpen = true"
          >
            {{ t('projects.submitProposal.button') }}
          </Button>
        </div>
      </template>
    </ProjectDetailOverviewLovable>

    <!-- Proposal Summary (after submission) -->
    <div
      v-if="showSubmittedProposal && getProposal(project.id)"
      class="space-y-2"
    >
      <ProposalSummary :proposal="getProposal(project.id)!" />
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
        :confirm-contractor-selection="confirmContractorSelection"
        @retry-load="loadProposals"
      />
    </div>
  </div>

  <!-- Open for Bids Dialog -->
  <OpenForBidsDialog
    v-if="project"
    :is-open="isOpenForBidsDialogOpen"
    :project-id="project.id"
    :project-name="project.name"
    :prefilled-contractor-ids="
      project.status === 'open_for_bids' ? getPrefillContractorIds() : undefined
    "
    @update:is-open="isOpenForBidsDialogOpen = $event"
    @submitted="handleOpenForBidsSubmitted"
  />

  <!-- Submit Proposal Dialog -->
  <SubmitProposalDialog
    v-if="project"
    :is-open="isSubmitProposalDialogOpen"
    :project-id="project.id"
    :project-name="project.name"
    :project-status="project.status"
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
    :invited-count="invitedContractorCount || undefined"
    :confirm-pending="isClosingBidding"
    @update:is-open="isCloseBiddingDialogOpen = $event"
    @confirmed="handleCloseBiddingConfirmed"
  />

  <!-- Assign Engineers Dialog -->
  <AssignEngineersDialog
    v-if="project"
    :is-open="isAssignEngineersDialogOpen"
    :project-id="project.id"
    :current-supervisor-id="project.supervisor_engineer_id"
    :current-field-engineer-id="project.field_engineer_id"
    @close="isAssignEngineersDialogOpen = false"
    @assigned="handleEngineersAssigned"
  />
</template>
