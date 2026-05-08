<script setup lang="ts">
import type { Milestone } from '~/shared/types/project'
import PaymentRow from './PaymentRow.vue'

interface Props {
  title: string
  payments: Milestone[]
  count: number
}

defineProps<Props>()
</script>

<template>
  <div class="space-y-3">
    <!-- Section Header -->
    <h2 class="text-foreground text-lg font-extrabold">
      {{ title }}
      <span v-if="count > 0" class="text-muted-foreground ms-2 text-sm">
        ({{ count }})
      </span>
    </h2>

    <!-- Empty State -->
    <div
      v-if="payments.length === 0"
      class="text-muted-foreground py-8 text-center"
    >
      {{ $t('common.none') }}
    </div>

    <!-- Payment List -->
    <div v-else class="space-y-2">
      <PaymentRow
        v-for="payment in payments"
        :key="payment.id"
        :payment="payment"
      />
    </div>
  </div>
</template>
