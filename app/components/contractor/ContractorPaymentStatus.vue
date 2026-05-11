<script setup lang="ts">
import SectionErrorCard from '~/components/common/SectionErrorCard.vue'
import { Button } from '~/components/ui/button'
import { Card } from '~/components/ui/card'
import { Skeleton } from '~/components/ui/skeleton'
import { formatCurrency } from '~/utils/formatters'

const emit = defineEmits<{
  retry: []
}>()

interface PaymentSummary {
  pendingTotal: number
  recentlyReceived: number
  pendingCount?: number
}

interface Props {
  summary: PaymentSummary | null
  loading?: boolean
  hasError?: boolean
  errorMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  hasError: false,
})

const router = useRouter()

const handleViewAll = () => {
  router.push('/payments')
}

const handleRetry = () => {
  emit('retry')
}
</script>

<template>
  <div class="space-y-4">
    <!-- Section Header -->
    <h2 class="text-ink text-lg font-extrabold">
      {{ $t('dashboard.contractor.paymentStatus') }}
    </h2>

    <!-- Loading State -->
    <div v-if="loading" class="grid gap-4 md:grid-cols-2">
      <Card class="gap-0 rounded-2xl p-6 shadow-none">
        <Skeleton class="mb-3 h-4 w-32" />
        <Skeleton class="h-8 w-40" />
      </Card>
      <Card class="gap-0 rounded-2xl p-6 shadow-none">
        <Skeleton class="mb-3 h-4 w-32" />
        <Skeleton class="h-8 w-40" />
      </Card>
    </div>

    <!-- Error State -->
    <SectionErrorCard
      v-else-if="hasError"
      title-key="common.error_occurred"
      :detail="errorMessage || $t('errors.failed_to_load')"
      @retry="handleRetry"
    />

    <!-- Empty State (null summary) -->
    <Card
      v-else-if="!summary"
      class="border-border/50 bg-card/50 gap-0 rounded-2xl p-6 text-center shadow-none"
    >
      <p class="text-muted-foreground text-sm">
        {{ $t('dashboard.contractor.noPaymentData') }}
      </p>
    </Card>

    <!-- Payment Cards -->
    <div v-else class="grid gap-4 md:grid-cols-2">
      <!-- Pending Amount Card -->
      <Card class="shadow-card gap-0 rounded-2xl p-6 shadow-none">
        <p
          class="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase"
        >
          {{ $t('dashboard.contractor.pendingAmount') }}
        </p>
        <p class="text-primary text-2xl font-extrabold">
          {{ formatCurrency(summary?.pendingTotal || 0) }}
        </p>
        <p
          v-if="summary?.pendingCount"
          class="text-muted-foreground mt-2 text-xs"
        >
          {{ summary.pendingCount }} {{ $t('common.pending') }}
        </p>
      </Card>

      <!-- Recently Received Card -->
      <Card class="shadow-card gap-0 rounded-2xl p-6 shadow-none">
        <p
          class="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase"
        >
          {{ $t('dashboard.contractor.receivedLast30Days') }}
        </p>
        <p class="text-primary text-xl font-bold">
          {{ formatCurrency(summary?.recentlyReceived || 0) }}
        </p>
      </Card>
    </div>

    <!-- View All Payments Link -->
    <div class="pt-2 text-center">
      <Button
        variant="ghost"
        size="sm"
        class="text-primary hover:text-primary/90"
        @click="handleViewAll"
      >
        {{ $t('dashboard.contractor.viewAllPayments') }}
        <svg
          class="ms-2 h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </Button>
    </div>
  </div>
</template>
