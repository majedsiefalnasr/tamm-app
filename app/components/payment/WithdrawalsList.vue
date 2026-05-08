<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Withdrawal } from '~/shared/types/payment'
import WithdrawalStatusPill from './WithdrawalStatusPill.vue'
import { formatCurrency } from '~/utils/formatters'

interface Props {
  withdrawals: Withdrawal[]
  isLoading?: boolean
}

withDefaults(defineProps<Props>(), {
  isLoading: false,
})

const { t } = useI18n()

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
    }
  })

  return groups
})

const hasAnyWithdrawals = computed(() => {
  return props.withdrawals.length > 0
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <div class="space-y-6">
    <!-- Empty State -->
    <div
      v-if="!hasAnyWithdrawals && !isLoading"
      class="border-border bg-card rounded-2xl border border-dashed p-10 text-center"
    >
      <div
        class="text-muted-foreground mx-auto mb-4 flex h-10 w-10 items-center justify-center"
      >
        💳
      </div>
      <h3 class="text-ink mb-1 text-sm font-bold">
        {{ t('withdrawal.empty.title') }}
      </h3>
      <p class="text-muted-foreground text-xs">
        {{ t('withdrawal.empty.subtitle') }}
      </p>
    </div>

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
              <div class="flex-shrink-0">
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
