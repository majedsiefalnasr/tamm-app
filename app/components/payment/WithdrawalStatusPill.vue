<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { WITHDRAWAL_STATUS_META } from '~/utils/statusMachine'
import type { WithdrawalStatus } from '~/shared/types/payment'

interface Props {
  status: WithdrawalStatus
  approvedAt?: string | null
}

const props = defineProps<Props>()

const { t } = useI18n()

const meta = computed(() => {
  return WITHDRAWAL_STATUS_META[props.status]
})

const countdownDays = computed(() => {
  if (props.status !== 'approved' || !props.approvedAt) return null

  const now = Date.now()
  const approvedTime = new Date(props.approvedAt).getTime()
  const threeDaysMs = 3 * 24 * 60 * 60 * 1000
  const endTime = approvedTime + threeDaysMs
  const daysRemaining = Math.ceil((endTime - now) / (24 * 60 * 60 * 1000))
  return Math.max(1, daysRemaining)
})

const toneClasses = computed(() => {
  const toneMap: Record<string, string> = {
    accent:
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold bg-accent/15 text-accent',
    info: 'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold bg-sky-100 text-sky-700',
    primary:
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold bg-primary-soft text-primary',
    danger:
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold bg-rose-100 text-rose-700',
  }
  return toneMap[meta.value.tone] || toneMap.accent
})
</script>

<template>
  <div class="flex flex-col gap-1">
    <!-- Status Pill -->
    <div :class="toneClasses">
      {{ t(meta.label) }}
    </div>

    <!-- Countdown Text (for approved status) -->
    <div v-if="countdownDays !== null" class="text-muted-foreground text-xs">
      {{ t('withdrawal.approved_at', { days: countdownDays }) }}
    </div>
  </div>
</template>
