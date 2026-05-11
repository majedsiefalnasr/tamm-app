<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { CreditCard } from 'lucide-vue-next'
import type { Withdrawal } from '~/shared/types/payment'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '~/components/ui/empty'
import WithdrawalStatusPill from './WithdrawalStatusPill.vue'
import { formatCurrency } from '~/utils/formatters'

interface Props {
  withdrawals: Withdrawal[]
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
})

const { t, locale } = useI18n()

const groupedWithdrawals = computed(() => {
  const groups: Record<string, Withdrawal[]> = {
    pending: [],
    approved: [],
    withdrawable: [],
    rejected: [],
    paid: [],
  }

  props.withdrawals.forEach(w => {
    if (groups[w.status]) {
      groups[w.status].push(w)
    } else {
      // Fallback: unknown status warning (should not happen with valid API)
      console.warn(`Unknown withdrawal status: ${w.status}`)
    }
  })

  return groups
})

const hasAnyWithdrawals = computed(() => {
  return props.withdrawals.length > 0
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString(locale.value || 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <div class="space-y-6" data-testid="withdrawals-list">
    <!-- Empty State -->
    <Empty
      v-if="!hasAnyWithdrawals && !isLoading"
      class="border-border bg-card"
    >
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CreditCard />
        </EmptyMedia>
        <EmptyTitle>{{ t('withdrawal.empty.title') }}</EmptyTitle>
        <EmptyDescription>{{
          t('withdrawal.empty.subtitle')
        }}</EmptyDescription>
      </EmptyHeader>
    </Empty>

    <!-- Withdrawal Groups -->
    <template
      v-for="(statusWithdrawals, status) in groupedWithdrawals"
      :key="status"
    >
      <div v-if="statusWithdrawals.length > 0" class="space-y-3">
        <!-- Status Header -->
        <h4 class="text-muted-foreground text-xs font-bold uppercase">
          {{ t(`withdrawal.status.${status}`) }} ({{
            statusWithdrawals.length
          }})
        </h4>

        <!-- Withdrawal Items -->
        <div class="space-y-2">
          <div
            v-for="item in statusWithdrawals"
            :key="item.id"
            data-testid="withdrawal-item"
            class="bg-card hover:border-primary/40 hover:shadow-elevated rounded-lg border p-4 transition hover:-translate-y-0.5"
          >
            <div class="flex items-start justify-between gap-4">
              <!-- Left: ID, Amount, Date -->
              <div class="min-w-0 flex-1 space-y-2">
                <p class="text-muted-foreground text-xs font-medium">
                  #{{ item.id }}
                </p>
                <p class="text-ink text-lg font-bold">
                  {{ formatCurrency(item.amount) }}
                </p>
                <p class="text-muted-foreground text-xs">
                  {{ formatDate(item.requested_at) }}
                </p>
              </div>

              <!-- Right: Status -->
              <div class="shrink-0">
                <WithdrawalStatusPill
                  :status="item.status"
                  :approved-at="item.approved_at"
                />
              </div>
            </div>

            <!-- Rejection Reason (if rejected) -->
            <div
              v-if="item.status === 'rejected' && item.rejection_reason"
              class="border-border mt-3 border-t pt-3"
            >
              <p class="text-destructive text-xs">
                <span class="font-medium">Reason:</span>
                {{ item.rejection_reason }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
