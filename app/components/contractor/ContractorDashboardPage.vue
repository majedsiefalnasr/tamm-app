<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import ContractorActiveMilestones from '~/components/contractor/ContractorActiveMilestones.vue'
import ContractorReviewMilestones from '~/components/contractor/ContractorReviewMilestones.vue'
import ContractorPaymentStatus from '~/components/contractor/ContractorPaymentStatus.vue'
import ContractorOpenBids from '~/components/contractor/ContractorOpenBids.vue'
import { useMilestones } from '~/composables/useMilestones'
import { useProjects } from '~/composables/useProjects'
import { useProposals } from '~/composables/useProposals'
import type { ProposalData } from '~/shared/types/project'

const {
  milestones,
  loading: milestonesLoading,
  fetchMilestones,
} = useMilestones()
const { projects, loading: projectsLoading, fetchProjects } = useProjects()
const { getProjectProposals } = useProposals()

const proposalsForContractor = ref<ProposalData[]>([])
const proposalsLoading = ref(false)
const milestonesError = ref(false)
const milestonesErrorMessage = ref('')
const projectsError = ref(false)
const projectsErrorMessage = ref('')

const contractorProjectIds = computed(() => {
  const ids = new Set<string>()
  for (const p of projects.value || []) {
    ids.add(p.id)
  }
  return ids
})

const milestonesForContractor = computed(() =>
  (milestones.value || []).filter(m => {
    const pid = m.project_id ?? m.project?.id
    return pid ? contractorProjectIds.value.has(pid) : false
  })
)

const activeMilestones = computed(() =>
  milestonesForContractor.value.filter(m => m.status === 'in_progress')
)

const reviewMilestones = computed(() =>
  milestonesForContractor.value.filter(
    m => m.status === 'under_review' || m.status === 'supervisor_approved'
  )
)

const paymentSummary = computed(() => {
  const allMilestones = milestonesForContractor.value

  const pending = allMilestones
    .filter(
      m =>
        m.payment_status === 'awaiting_approval' ||
        m.payment_status === 'ready_for_payout'
    )
    .reduce((sum, m) => sum + (m.amount || 0), 0)

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const recent = allMilestones
    .filter(m => {
      if (m.payment_status !== 'paid_out') return false
      const paidAt = m.paid_out_at ?? m.updated_at
      if (!paidAt) return false
      return new Date(paidAt) > thirtyDaysAgo
    })
    .reduce((sum, m) => sum + (m.amount || 0), 0)

  return {
    pendingTotal: pending,
    recentlyReceived: recent,
    pendingCount: allMilestones.filter(
      m =>
        m.payment_status === 'awaiting_approval' ||
        m.payment_status === 'ready_for_payout'
    ).length,
  }
})

const openBidProjects = computed(() =>
  (projects.value || []).filter(p => p.status === 'open_for_bids')
)

async function loadProjectProposals() {
  proposalsLoading.value = true
  projectsError.value = false
  projectsErrorMessage.value = ''
  try {
    const ids = openBidProjects.value.map(p => p.id)
    const combined: ProposalData[] = []
    for (const projectId of ids) {
      const projectProposals = await getProjectProposals(projectId)
      combined.push(...projectProposals)
    }
    proposalsForContractor.value = combined
  } catch (e) {
    projectsError.value = true
    projectsErrorMessage.value =
      e instanceof Error ? e.message : String(e ?? 'Failed to load proposals')
  } finally {
    proposalsLoading.value = false
  }
}

async function refreshProjectsAndProposals() {
  projectsError.value = false
  projectsErrorMessage.value = ''
  try {
    await fetchProjects()
    await loadProjectProposals()
  } catch (e) {
    projectsError.value = true
    projectsErrorMessage.value =
      e instanceof Error ? e.message : String(e ?? 'Failed to load projects')
  }
}

async function refreshMilestones() {
  milestonesError.value = false
  milestonesErrorMessage.value = ''
  try {
    await fetchMilestones()
  } catch (e) {
    milestonesError.value = true
    milestonesErrorMessage.value =
      e instanceof Error ? e.message : String(e ?? 'Failed to load milestones')
  }
}

onMounted(async () => {
  await refreshProjectsAndProposals()
  await refreshMilestones()
})
</script>

<template>
  <div
    class="mx-auto max-w-[1400px] space-y-6 px-4 pt-6 pb-16 md:px-8 md:pt-8 md:pb-20"
  >
    <div>
      <h1 class="text-ink text-3xl font-bold">
        {{ $t('pages.contractor_dashboard') }}
      </h1>
      <p class="text-muted-foreground mt-1">
        {{ $t('pages.contractor_dashboard_subtitle') }}
      </p>
    </div>

    <div class="grid gap-6">
      <ContractorActiveMilestones
        :milestones="activeMilestones"
        :loading="milestonesLoading"
        :has-error="milestonesError"
        :error-message="milestonesErrorMessage"
        @retry="refreshMilestones"
      />

      <ContractorReviewMilestones
        :milestones="reviewMilestones"
        :loading="milestonesLoading"
        :has-error="milestonesError"
        :error-message="milestonesErrorMessage"
        @retry="refreshMilestones"
      />

      <ContractorPaymentStatus
        :summary="paymentSummary"
        :loading="milestonesLoading"
        :has-error="milestonesError"
        :error-message="milestonesErrorMessage"
        @retry="refreshMilestones"
      />

      <ContractorOpenBids
        :projects="openBidProjects"
        :proposals="proposalsForContractor"
        :loading="projectsLoading || proposalsLoading"
        :has-error="projectsError"
        :error-message="projectsErrorMessage"
        @retry="refreshProjectsAndProposals"
      />
    </div>
  </div>
</template>
