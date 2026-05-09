<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'
import { formatCurrency } from '~/utils/formatters'

interface PaymentSummary {
  pendingTotal: number
  recentlyReceived: number
  pendingCount?: number
}

interface Props {
  summary: PaymentSummary | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const router = useRouter()

const handleViewAll = () => {
  router.push('/payments')
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
      <div class="border-border bg-card rounded-2xl border p-6">
        <Skeleton class="mb-3 h-4 w-32" />
        <Skeleton class="h-8 w-40" />
      </div>
      <div class="border-border bg-card rounded-2xl border p-6">
        <Skeleton class="mb-3 h-4 w-32" />
        <Skeleton class="h-8 w-40" />
      </div>
    </div>

    <!-- Empty State (null summary) -->
    <div
      v-else-if="!summary"
      class="border-border/50 bg-card/50 rounded-2xl border p-6 text-center"
    >
      <p class="text-muted-foreground text-sm">
        {{ $t('dashboard.contractor.noPaymentData') }}
      </p>
    </div>

    <!-- Payment Cards -->
    <div v-else class="grid gap-4 md:grid-cols-2">
      <!-- Pending Amount Card -->
      <div class="border-border bg-card shadow-card rounded-2xl border p-6">
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
      </div>

      <!-- Recently Received Card -->
      <div class="border-border bg-card shadow-card rounded-2xl border p-6">
        <p
          class="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase"
        >
          {{ $t('dashboard.contractor.receivedLast30Days') }}
        </p>
        <p class="text-primary text-xl font-bold">
          {{ formatCurrency(summary?.recentlyReceived || 0) }}
        </p>
      </div>
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
