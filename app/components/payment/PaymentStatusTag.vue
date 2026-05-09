<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Milestone } from '~/shared/types/project'
import { usePermission } from '~/composables/usePermission'
import { derivePaymentStatus, PAYMENT_STATUS_META } from '~/utils/statusMachine'
import { Badge } from '~/components/ui/badge'
import { cn } from '~/lib/utils'

interface Props {
  milestone: Milestone
  showIfHidden?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showIfHidden: false,
})

const { t } = useI18n()
const { can } = usePermission()

const canViewPayment = computed(() => {
  return props.showIfHidden || can('view_payment_status')
})

const paymentStatus = computed(() => {
  if (!props.milestone?.status) return 'pending_payment'
  return derivePaymentStatus(props.milestone.status)
})

const meta = computed(() => {
  const status = paymentStatus.value as keyof typeof PAYMENT_STATUS_META
  const metadata = PAYMENT_STATUS_META[status]
  if (!metadata) {
    return PAYMENT_STATUS_META.pending_payment
  }
  return metadata
})

const variant = computed(() => {
  const colorMap: Record<
    string,
    'default' | 'secondary' | 'destructive' | 'outline'
  > = {
    muted: 'secondary',
    info: 'outline',
    accent: 'default',
    primary: 'default',
  }
  return colorMap[meta.value?.color || 'muted'] || 'default'
})
</script>

<template>
  <div
    v-if="canViewPayment && meta"
    class="inline-flex items-center gap-2"
    data-testid="payment-status-badge"
  >
    <!-- Divider -->
    <div class="bg-border h-4 w-px"></div>

    <!-- Payment Status Badge -->
    <Badge
      :variant="variant"
      :class="cn('inline-flex')"
      :data-status="paymentStatus"
    >
      {{ meta.label ? t(meta.label) : t('payment.status.pending_payment') }}
    </Badge>
  </div>
</template>
