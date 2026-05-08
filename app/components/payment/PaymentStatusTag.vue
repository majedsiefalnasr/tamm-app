<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePermission } from '~/composables/usePermission'
import { derivePaymentStatus, PAYMENT_STATUS_META } from '~/utils/statusMachine'
import { Badge } from '~/components/ui/badge'
import { cn } from '~/lib/utils'

interface Props {
  milestone: {
    status: string
  }
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
  return derivePaymentStatus(props.milestone.status)
})

const meta = computed(() => {
  return PAYMENT_STATUS_META[
    paymentStatus.value as keyof typeof PAYMENT_STATUS_META
  ]
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
  return colorMap[meta.value.color] || 'default'
})
</script>

<template>
  <div v-if="canViewPayment" class="inline-flex items-center gap-2">
    <!-- Divider -->
    <div class="bg-border h-4 w-px"></div>

    <!-- Payment Status Badge -->
    <Badge :variant="variant" :class="cn('inline-flex')">
      {{ t(meta.label) }}
    </Badge>
  </div>
</template>
