<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Skeleton } from '~/components/ui/skeleton'
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
  roles: ['contractor'],
  pageTitle: 'payment.heading',
})

const auth = useAuthStore()
const {
  milestones: allMilestones,
  loading,
  error,
  fetchMilestones,
} = useMilestones()

// Fetch milestones on mount
onMounted(async () => {
  await fetchMilestones()
})

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
    .filter(m =>
      ['awaiting_approval', 'ready_for_payout'].includes(m.paymentStatus)
    )
    .sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime()
      const dateB = new Date(b.created_at || 0).getTime()
      return dateB - dateA
    })
)

const receivedPayments = computed(() =>
  milestonesWithPaymentStatus.value
    .filter(m => m.paymentStatus === 'paid_out')
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
const { t } = useI18n()

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
  await fetchMilestones()
  await startWithdrawalPolling()
})

const pageUnmounted = onUnmounted(() => {
  stopWithdrawalPolling()
})
</script>

<template>
  <div class="bg-background min-h-screen p-4 md:p-6">
    <!-- Page Header -->
    <div class="mb-8 space-y-2">
      <h1 class="text-3xl font-bold">{{ $t('payment.heading') }}</h1>
      <p class="text-muted-foreground">{{ $t('payment.subtitle') }}</p>
    </div>

    <!-- Withdrawal Section (Contractor-only) -->
    <div v-if="auth.user?.role === 'contractor'" class="mb-12 space-y-6">
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
    <div v-if="loading" class="space-y-6">
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
    <ErrorState v-else-if="error" :message="error" @retry="retryFetch" />

    <!-- Empty State -->
    <EmptyState
      v-else-if="!hasAnyPayments"
      :message="$t('payment.empty.none')"
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
  </div>
</template>
