<script setup lang="ts">
import type { Milestone } from '~/shared/types/project'
import { Inbox } from 'lucide-vue-next'
import PaymentRow from './PaymentRow.vue'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '~/components/ui/empty'

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
    <Empty
      v-if="payments.length === 0"
      class="border-border bg-card text-muted-foreground"
    >
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Inbox />
        </EmptyMedia>
        <EmptyTitle>{{ $t('common.none') }}</EmptyTitle>
        <EmptyDescription>{{ $t('payment.empty.none') }}</EmptyDescription>
      </EmptyHeader>
    </Empty>

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
