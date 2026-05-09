<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import ContractorActiveMilestones from '~/components/contractor/ContractorActiveMilestones.vue'
import ContractorReviewMilestones from '~/components/contractor/ContractorReviewMilestones.vue'
import ContractorPaymentStatus from '~/components/contractor/ContractorPaymentStatus.vue'
import ContractorOpenBids from '~/components/contractor/ContractorOpenBids.vue'
import { useMilestones } from '~/composables/useMilestones'
import { useProjects } from '~/composables/useProjects'
import { useProposals } from '~/composables/useProposals'

definePageMeta({
  roles: ['contractor'],
  pageTitle: 'pages.contractor_dashboard',
})

// Fetch data
const {
  milestones,
  loading: milestonesLoading,
  fetchMilestones,
} = useMilestones()
const { projects, loading: projectsLoading } = useProjects()
const { getProjectProposals } = useProposals()

// Local state for proposals
const proposals = ref<Map<string, any>>(new Map())
const proposalsLoading = ref(false)
const milestonesError = ref(false)
const milestonesErrorMessage = ref('')
const projectsError = ref(false)
const projectsErrorMessage = ref('')

// Fetch on mount
onMounted(async () => {
  await Promise.all([fetchMilestones(), loadProjectProposals()])
})

// Load proposals from all open bid projects
const loadProjectProposals = async () => {
  proposalsLoading.value = true
  try {
    const projectIds = openBidProjects.value?.map(p => p.id) || []
    if (projectIds.length === 0) return

    for (const projectId of projectIds) {
      const projectProposals = await getProjectProposals(projectId)
      if (projectProposals?.length > 0) {
        projectProposals.forEach(p => {
          proposals.value.set(`${projectId}`, p)
        })
      }
    }
  } finally {
    proposalsLoading.value = false
  }
}

// Filter milestones by status
const activeMilestones = computed(() =>
  (milestones.value || []).filter(m => m.status === 'in_progress')
)

const reviewMilestones = computed(() =>
  (milestones.value || []).filter(
    m => m.status === 'under_review' || m.status === 'supervisor_approved'
  )
)

// Calculate payment totals from milestones
const paymentSummary = computed(() => {
  const allMilestones = milestones.value || []

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
    .filter(
      m =>
        m.payment_status === 'paid_out' &&
        m.updated_at &&
        new Date(m.updated_at) > thirtyDaysAgo
    )
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

// Get open bid projects
const openBidProjects = computed(() =>
  (projects.value || []).filter(p => p.status === 'open_for_bids')
)
</script>

<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div>
      <h1 class="text-ink text-3xl font-bold">
        {{ $t('pages.contractor_dashboard') }}
      </h1>
      <p class="text-muted-foreground mt-1">
        {{ $t('pages.contractor_dashboard_subtitle') }}
      </p>
    </div>

    <!-- Main content -->
    <div class="grid gap-6">
      <!-- Active Milestones Section -->
      <ContractorActiveMilestones
        :milestones="activeMilestones"
        :loading="milestonesLoading"
        :has-error="milestonesError"
        :error-message="milestonesErrorMessage"
        @retry="fetchMilestones"
      />

      <!-- Under Review Milestones Section -->
      <ContractorReviewMilestones
        :milestones="reviewMilestones"
        :loading="milestonesLoading"
      />

      <!-- Payment Status Section -->
      <ContractorPaymentStatus
        :summary="paymentSummary"
        :loading="milestonesLoading"
      />

      <!-- Open Bids Section -->
      <ContractorOpenBids
        :projects="openBidProjects"
        :proposals="proposals"
        :loading="projectsLoading || proposalsLoading"
        :has-error="projectsError"
        :error-message="projectsErrorMessage"
        @retry="fetchMilestones()"
      />
    </div>
  </div>
</template>
