<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuth } from '~/composables/useAuth'
import { usePermission } from '~/composables/usePermission'
import { useMilestones, type PaymentPayload } from '~/composables/useMilestones'
import { useNotifications } from '~/composables/useNotifications'
import { Button } from '~/components/ui/button'
import PaymentConfirmDialog from '~/components/payment/PaymentConfirmDialog.vue'
import type { Milestone } from '~/shared/types/project'

const props = defineProps<{
  milestone: Milestone
  projectId?: string
}>()

const { t } = useI18n()
const { auth } = useAuth()
const { can } = usePermission()
const { payForMilestone } = useMilestones()
const { notify } = useNotifications()

const dialogOpen = ref(false)
const isSubmitting = ref(false)

// Check if button should be visible
const isVisible = () => {
  return (
    auth.value?.role === 'client' &&
    can('pay_milestone', props.milestone.allowed_actions) &&
    props.milestone.status === 'not_started' &&
    props.milestone.payment_status === 'pending_payment'
  )
}

// Handle payment submission
const handlePaymentSubmit = async (payload: PaymentPayload) => {
  isSubmitting.value = true

  try {
    await payForMilestone(props.milestone.id, payload)
    dialogOpen.value = false
    notify.success(t('payment.success.message'))
  } catch (error) {
    console.error('Payment error:', error)
    notify.error(t('payment.error.message'))
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div v-if="isVisible()">
    <Button
      variant="default"
      size="sm"
      :disabled="isSubmitting"
      @click="dialogOpen = true"
    >
      {{ t('milestone.actions.payMilestone') }}
    </Button>

    <PaymentConfirmDialog
      :milestone="milestone"
      :open="dialogOpen"
      @close="dialogOpen = false"
      @submit="handlePaymentSubmit"
    />
  </div>
</template>
