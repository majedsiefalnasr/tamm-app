<script setup lang="ts">
import type { Milestone } from '~/shared/types/project'
import { formatCurrency } from '~/utils/formatters'
import { formatDate } from '~/utils/formatters'
import PaymentStatusTag from './PaymentStatusTag.vue'

interface Props {
  payment: Milestone & {
    project?: { id?: string; name?: string }
  }
}

const props = defineProps<Props>()
const router = useRouter()

const navigateToMilestone = () => {
  if (props.payment.projectId && props.payment.id) {
    router.push(
      `/projects/${props.payment.projectId}/milestones/${props.payment.id}`
    )
  }
}
</script>

<template>
  <div
    class="border-border hover:bg-secondary/50 flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors"
    @click="navigateToMilestone"
  >
    <!-- Left: Project + Milestone -->
    <div class="min-w-0 flex-1">
      <p class="text-foreground truncate font-semibold">
        {{ payment.project?.name || payment.projectId || $t('common.project') }}
      </p>
      <p class="text-muted-foreground truncate text-sm">
        {{ payment.name }}
      </p>
      <p class="text-muted-foreground text-xs">
        {{ formatDate(payment.created_at) }}
      </p>
    </div>

    <!-- Middle: Status -->
    <div class="mx-4 flex-shrink-0">
      <PaymentStatusTag :milestone="{ status: payment.status }" />
    </div>

    <!-- Right: Amount -->
    <div class="flex-shrink-0 text-end">
      <p class="text-foreground text-lg font-extrabold">
        {{ formatCurrency(payment.amount) }}
      </p>
    </div>
  </div>
</template>
