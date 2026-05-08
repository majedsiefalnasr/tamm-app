<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { Skeleton } from '~/components/ui/skeleton'
import EmptyState from '~/components/common/EmptyState.vue'
import ErrorState from '~/components/common/ErrorState.vue'
import PaymentSection from '~/components/payment/PaymentSection.vue'
import BalanceSummaryCard from '~/components/payment/BalanceSummaryCard.vue'
import WithdrawalRequestDialog from '~/components/payment/WithdrawalRequestDialog.vue'
import WithdrawalsList from '~/components/payment/WithdrawalsList.vue'
import { derivePaymentStatus } from '~/utils/statusMachine'
import { formatCurrency } from '~/utils/formatters'
import type { Milestone } from '~/shared/types/project'

definePageMeta({
  roles: ['contractor'],
  pageTitle: 'payment.heading',
})

const auth = useAuthStore()
const route = useRoute()
const {
  milestones: allMilestones,
  loading,
  error,
  fetchMilestones,
} = useMilestones()
const {
  withdrawals,
  isLoadingWithdrawals,
  isSubmittingWithdrawal,
  fetchWithdrawals,
  submitWithdrawalRequest,
  getContractorBalance,
  startWithdrawalPolling,
  stopWithdrawalPolling,
} = usePayments()

// UI state
const isDialogOpen = ref(false)

// Fetch data on mount and start polling
onMounted(async () => {
  await Promise.all([fetchMilestones(), fetchWithdrawals()])
  startWithdrawalPolling()
})

// Stop polling when leaving the page
onUnmounted(() => {
  stopWithdrawalPolling()
})

// Get contractor balance
const contractorBalance = computed(() => getContractorBalance())

// Handle withdrawal submission
const handleSubmitWithdrawal = async (data: {
  amount: number
  iban: string
  notes?: string
}) => {
  try {
    await submitWithdrawalRequest(data.amount, data.iban, data.notes)
    isDialogOpen.value = false
    // Show success notification
    const { $toast } = useNuxtApp()
    $toast?.({ title: 'Success', description: 'Withdrawal request submitted' })
  } catch (err) {
    console.error('Failed to submit withdrawal:', err)
    const { $toast } = useNuxtApp()
    $toast?.({
      title: 'Error',
      description: 'Failed to submit withdrawal request',
      variant: 'destructive',
    })
  }
}

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
</script>

<template>
  <div class="bg-background min-h-screen p-4 md:p-6">
    <!-- Page Header -->
    <div class="mb-8 space-y-2">
      <h1 class="text-3xl font-bold">{{ $t('withdrawal.title') }}</h1>
      <p class="text-muted-foreground">
        Manage your withdrawal requests and payment history
      </p>
    </div>

    <!-- Withdrawal Dialog -->
    <WithdrawalRequestDialog
      :open="isDialogOpen"
      :is-submitting="isSubmittingWithdrawal"
      :available-balance="contractorBalance.available"
      @close="isDialogOpen = false"
      @submit="handleSubmitWithdrawal"
    />

    <!-- Balance Summary Card -->
    <div v-if="!loading && !error" class="mb-8">
      <BalanceSummaryCard
        :earned="contractorBalance.earned"
        :locked="contractorBalance.locked"
        :available="contractorBalance.available"
        :is-loading="isLoadingWithdrawals"
        @request-withdrawal="isDialogOpen = true"
      />
    </div>

    <!-- Loading State -->
    <div v-if="loading || isLoadingWithdrawals" class="space-y-6">
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
      icon="💳"
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

      <!-- Withdrawals Section -->
      <div class="mb-12">
        <h2 class="mb-4 text-lg font-bold">{{ $t('withdrawal.title') }}</h2>
        <WithdrawalsList
          :withdrawals="withdrawals"
          :is-loading="isLoadingWithdrawals"
        />
      </div>

      <!-- Payment History Section -->
      <div>
        <h2 class="mb-4 text-lg font-bold">{{ $t('payment.heading') }}</h2>
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
      </div>
    </template>
  </div>
</template>
