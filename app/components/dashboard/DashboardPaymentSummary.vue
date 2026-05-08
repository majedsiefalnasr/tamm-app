<script setup lang="ts">
import { computed } from 'vue'
import { formatCurrency } from '~/utils/formatters'
import { usePayments } from '~/composables/usePayments'

interface Props {
  totalCommitted?: number
  totalInEscrow?: number
  totalPaidOut?: number
}

const props = withDefaults(defineProps<Props>(), {
  totalCommitted: undefined,
  totalInEscrow: undefined,
  totalPaidOut: undefined,
})

const { dashboardTotals } = usePayments()

const committed = computed(
  () => props.totalCommitted ?? dashboardTotals.value.committed
)

const inEscrow = computed(
  () => props.totalInEscrow ?? dashboardTotals.value.inEscrow
)

const paidOut = computed(
  () => props.totalPaidOut ?? dashboardTotals.value.paidOut
)
</script>

<template>
  <div class="space-y-4">
    <!-- 3-column StatCard grid -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div
        class="border-border bg-card shadow-card rounded-2xl border p-4 md:p-6"
      >
        <p class="text-muted-foreground text-xs font-semibold uppercase">
          {{ $t('payment.dashboard.total_committed') }}
        </p>
        <p class="text-primary mt-3 text-2xl font-extrabold md:text-3xl">
          {{ formatCurrency(committed) }}
        </p>
      </div>

      <div
        class="border-border bg-card shadow-card rounded-2xl border p-4 md:p-6"
      >
        <p class="text-muted-foreground text-xs font-semibold uppercase">
          {{ $t('payment.dashboard.total_in_escrow') }}
        </p>
        <p
          class="mt-3 text-2xl font-extrabold text-blue-600 md:text-3xl dark:text-blue-400"
        >
          {{ formatCurrency(inEscrow) }}
        </p>
      </div>

      <div
        class="border-border bg-card shadow-card rounded-2xl border p-4 md:p-6"
      >
        <p class="text-muted-foreground text-xs font-semibold uppercase">
          {{ $t('payment.dashboard.total_paid_out') }}
        </p>
        <p class="text-primary mt-3 text-2xl font-extrabold md:text-3xl">
          {{ formatCurrency(paidOut) }}
        </p>
      </div>
    </div>
  </div>
</template>
