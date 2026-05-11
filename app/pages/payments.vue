<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Skeleton } from '~/components/ui/skeleton'
import PageContentSkeleton from '~/components/common/PageContentSkeleton.vue'
import EmptyState from '~/components/common/EmptyState.vue'
import ErrorState from '~/components/common/ErrorState.vue'
import PaymentSection from '~/components/payment/PaymentSection.vue'
import BalanceSummaryCard from '~/components/payment/BalanceSummaryCard.vue'
import WithdrawalRequestDialog from '~/components/payment/WithdrawalRequestDialog.vue'
import WithdrawalsList from '~/components/payment/WithdrawalsList.vue'
import { derivePaymentStatus } from '~/utils/statusMachine'
import { formatCurrency } from '~/utils/formatters'
import { useAuthStore } from '~/stores/auth'
import { useMilestones } from '~/composables/useMilestones'
import { usePayments } from '~/composables/usePayments'
import type { Milestone } from '~/shared/types/project'

definePageMeta({
  roles: ['contractor', 'admin', 'super_admin'],
  pageTitle: 'payment.heading',
})

const auth = useAuthStore()
const route = useRoute()

const isContractorPayments = computed(() => auth.user?.role === 'contractor')

const isAdminPayments = computed(() =>
  ['admin', 'super_admin'].includes(auth.user?.role ?? '')
)

watch(
  [isAdminPayments, () => route.path],
  () => {
    const meta = route.meta as { pageTitle?: string }
    meta.pageTitle = isAdminPayments.value
      ? 'pages.admin_payments_title'
      : 'payment.heading'
  },
  { immediate: true }
)
const {
  milestones: allMilestones,
  loading,
  error,
  fetchMilestones,
} = useMilestones()

// Derive payment statuses
const milestonesWithPaymentStatus = computed(() =>
  allMilestones.value.map(m => ({
    ...m,
    paymentStatus: derivePaymentStatus(m.status),
  }))
)

// Group by payment status
const pendingPayments = computed(() =>
  milestonesWithPaymentStatus.value
    .filter(m => ['awaiting_release', 'processing'].includes(m.paymentStatus))
    .sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime()
      const dateB = new Date(b.created_at || 0).getTime()
      return dateB - dateA
    })
)

const receivedPayments = computed(() =>
  milestonesWithPaymentStatus.value
    .filter(m => m.paymentStatus === 'paid')
    .sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime()
      const dateB = new Date(b.created_at || 0).getTime()
      return dateB - dateA
    })
)

// Compute totals
const pendingTotal = computed(() =>
  pendingPayments.value.reduce((sum, m) => sum + (m.amount || 0), 0)
)

const receivedTotal = computed(() =>
  receivedPayments.value.reduce((sum, m) => sum + (m.amount || 0), 0)
)

const hasAnyPayments = computed(
  () => milestonesWithPaymentStatus.value.length > 0
)

const retryFetch = () => {
  fetchMilestones()
}

// Withdrawal state
const {
  withdrawals,
  isLoadingWithdrawals,
  isSubmittingWithdrawal,
  getContractorBalance,
  startWithdrawalPolling,
  stopWithdrawalPolling,
  submitWithdrawalRequest,
  fetchWithdrawals,
} = usePayments()

const isWithdrawalDialogOpen = ref(false)

const pollingStarted = ref(false)

/** Until first contractor milestones fetch finishes */
const paymentsBootstrap = ref(true)

const contractorBalance = computed(() => getContractorBalance())

const handleRequestWithdrawal = () => {
  isWithdrawalDialogOpen.value = true
}

const handleCloseDialog = () => {
  isWithdrawalDialogOpen.value = false
}

const handleSubmitWithdrawal = async (data: {
  amount: number
  iban: string
  notes?: string
}) => {
  try {
    await submitWithdrawalRequest(data.amount, data.iban, data.notes)
    isWithdrawalDialogOpen.value = false
    await fetchWithdrawals()
  } catch (error) {
    console.error('Withdrawal submission failed:', error)
  }
}

onMounted(async () => {
  if (isContractorPayments.value) {
    try {
      await fetchMilestones()
      await startWithdrawalPolling()
      pollingStarted.value = true
    } finally {
      paymentsBootstrap.value = false
    }
  } else if (isAdminPayments.value) {
    try {
      await fetchMilestones()
    } finally {
      paymentsBootstrap.value = false
    }
  } else {
    paymentsBootstrap.value = false
  }
})

onUnmounted(() => {
  if (pollingStarted.value) {
    stopWithdrawalPolling()
  }
})
</script>

<template>
  <div class="bg-background min-h-0 flex-1">
    <template v-if="isAdminPayments">
      <div class="space-y-6">
        <div class="mb-8 space-y-2">
          <h1 class="text-3xl font-bold">
            {{ $t('pages.admin_payments_title') }}
          </h1>
          <p class="text-muted-foreground">
            {{ $t('pages.admin_payments_description') }}
          </p>
          <p class="text-muted-foreground text-sm">
            {{ $t('pages.admin_payments_subtitle') }}
          </p>
        </div>

        <PageContentSkeleton
          v-if="loading || paymentsBootstrap"
          :show-cards="true"
          :rows="5"
        />

        <ErrorState
          v-else-if="error"
          :message="error || undefined"
          @action="retryFetch"
        />

        <EmptyState
          v-else-if="!hasAnyPayments"
          icon="card"
          title="pages.admin_payments_empty_title"
          description="pages.admin_payments_empty_description"
        />

        <template v-else>
          <div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div class="border-border bg-card rounded-lg border p-4 shadow-sm">
              <p class="text-muted-foreground mb-2 text-sm">
                {{ $t('payment.label.pending_total') }}
              </p>
              <p class="text-accent text-2xl font-extrabold">
                {{ formatCurrency(pendingTotal) }}
              </p>
              <p
                v-if="pendingPayments.length > 0"
                class="text-muted-foreground mt-2 text-xs"
              >
                {{ pendingPayments.length }} {{ $t('common.payment_plural') }}
              </p>
            </div>
            <div class="border-border bg-card rounded-lg border p-4 shadow-sm">
              <p class="text-muted-foreground mb-2 text-sm">
                {{ $t('payment.label.received_total') }}
              </p>
              <p class="text-primary text-2xl font-extrabold">
                {{ formatCurrency(receivedTotal) }}
              </p>
              <p
                v-if="receivedPayments.length > 0"
                class="text-muted-foreground mt-2 text-xs"
              >
                {{ receivedPayments.length }} {{ $t('common.payment_plural') }}
              </p>
            </div>
          </div>
          <div class="space-y-8">
            <PaymentSection
              :title="$t('payment.section.pending')"
              :payments="pendingPayments"
              :count="pendingPayments.length"
            />
            <PaymentSection
              :title="$t('payment.section.received')"
              :payments="receivedPayments"
              :count="receivedPayments.length"
            />
          </div>
        </template>
      </div>
    </template>

    <template v-else>
      <!-- Page Header -->
      <div class="mb-8 space-y-2">
        <h1 class="text-3xl font-bold">{{ $t('payment.heading') }}</h1>
        <p class="text-muted-foreground">{{ $t('payment.subtitle') }}</p>
      </div>

      <!-- Withdrawal Section (Contractor-only) -->
      <div v-if="isContractorPayments" class="mb-12 space-y-6">
        <!-- Balance Card -->
        <BalanceSummaryCard
          data-testid="balance-summary-card"
          :earned="contractorBalance.earned"
          :locked="contractorBalance.locked"
          :available="contractorBalance.available"
          :is-loading="isLoadingWithdrawals"
          @request-withdrawal="handleRequestWithdrawal"
        />

        <!-- Withdrawal Request Dialog -->
        <WithdrawalRequestDialog
          :open="isWithdrawalDialogOpen"
          :is-submitting="isSubmittingWithdrawal"
          :available-balance="contractorBalance.available"
          @close="handleCloseDialog"
          @submit="handleSubmitWithdrawal"
        />

        <!-- Withdrawals List -->
        <WithdrawalsList
          data-testid="withdrawals-list"
          :withdrawals="withdrawals"
          :is-loading="isLoadingWithdrawals"
        />
      </div>

      <!-- Loading State -->
      <div v-if="loading || paymentsBootstrap" class="space-y-6">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Skeleton class="h-24 rounded-lg" />
          <Skeleton class="h-24 rounded-lg" />
        </div>
        <div class="space-y-3">
          <Skeleton class="h-8 w-32 rounded" />
          <Skeleton class="h-16 rounded-lg" />
          <Skeleton class="h-16 rounded-lg" />
        </div>
      </div>

      <!-- Error State -->
      <ErrorState v-else-if="error" :message="error" @action="retryFetch" />

      <!-- Empty State -->
      <EmptyState
        v-else-if="!hasAnyPayments"
        icon="card"
        title="payment.empty.none"
        description="payment.empty.description"
      />

      <!-- Content -->
      <template v-else>
        <!-- Totals Section -->
        <div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <!-- Pending Total -->
          <div class="border-border bg-card rounded-lg border p-4 shadow-sm">
            <p class="text-muted-foreground mb-2 text-sm">
              {{ $t('payment.label.pending_total') }}
            </p>
            <p class="text-accent text-2xl font-extrabold">
              {{ formatCurrency(pendingTotal) }}
            </p>
            <p
              v-if="pendingPayments.length > 0"
              class="text-muted-foreground mt-2 text-xs"
            >
              {{ pendingPayments.length }} {{ $t('common.payment_plural') }}
            </p>
          </div>

          <!-- Received Total -->
          <div class="border-border bg-card rounded-lg border p-4 shadow-sm">
            <p class="text-muted-foreground mb-2 text-sm">
              {{ $t('payment.label.received_total') }}
            </p>
            <p class="text-primary text-2xl font-extrabold">
              {{ formatCurrency(receivedTotal) }}
            </p>
            <p
              v-if="receivedPayments.length > 0"
              class="text-muted-foreground mt-2 text-xs"
            >
              {{ receivedPayments.length }} {{ $t('common.payment_plural') }}
            </p>
          </div>
        </div>

        <!-- Payment Lists -->
        <div class="space-y-8">
          <!-- Pending Payments -->
          <PaymentSection
            :title="$t('payment.section.pending')"
            :payments="pendingPayments"
            :count="pendingPayments.length"
          />

          <!-- Received Payments -->
          <PaymentSection
            :title="$t('payment.section.received')"
            :payments="receivedPayments"
            :count="receivedPayments.length"
          />
        </div>
      </template>
    </template>
  </div>
</template>
