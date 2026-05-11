<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Milestone, ProjectDetail } from '~/shared/types/project'
import { usePermission } from '~/composables/usePermission'
import { useMilestones, type PaymentPayload } from '~/composables/useMilestones'
import { useNotifications } from '~/composables/useNotifications'
import { Button } from '~/components/ui/button'
import ApprovalFlow from './ApprovalFlow.vue'
import ClientApprovalFlow from './ClientApprovalFlow.vue'
import PaymentConfirmDialog from '~/components/payment/PaymentConfirmDialog.vue'
import PaymentReleaseDialog from '~/components/payment/PaymentReleaseDialog.vue'
import { derivePaymentStatus } from '~/utils/statusMachine'
import { milestoneMutationToastId } from '~/utils/mutationFeedback'
import { formatCurrency } from '~/utils/formatters'

interface Props {
  milestone: Milestone
  project: ProjectDetail
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
})

const emits = defineEmits<{
  actionComplete: []
  submitReport: []
}>()

const { t } = useI18n()
const { can } = usePermission()
const {
  approveMilestone,
  rejectMilestone,
  payForMilestone,
  releaseMilestonePayment,
} = useMilestones()
const { notify } = useNotifications()

const approvalFlowOpen = ref(false)
const clientApprovalFlowOpen = ref(false)
const paymentDialogOpen = ref(false)
const releasePaymentDialogOpen = ref(false)
const isPaymentSubmitting = ref(false)
const isReleasePaymentSubmitting = ref(false)
const releasePaymentDialogRef = ref<{ setError: (msg: string) => void } | null>(
  null
)

const visibleActions = computed(() => {
  const actions = []
  const { milestone } = props

  // Submit Report (field_engineer, draft only)
  if (
    milestone.status === 'draft' &&
    can('submit_report', milestone.allowed_actions)
  ) {
    actions.push({
      type: 'submit_report',
      label: t('milestone.actions.submitReport'),
      variant: 'default',
    })
  }

  // Review (supervisor_engineer, under_review only)
  if (
    milestone.status === 'under_review' &&
    can('approve_milestone', milestone.allowed_actions)
  ) {
    actions.push({
      type: 'review',
      label: t('milestone.actions.viewReport'),
      variant: 'outline',
    })
  }

  // Pay Milestone (client, draft only)
  if (
    milestone.status === 'draft' &&
    can('pay_milestone', milestone.allowed_actions)
  ) {
    actions.push({
      type: 'pay_milestone',
      label: t('milestone.actions.payMilestone'),
      variant: 'default',
    })
  }

  // Release Payment (admin, approved status only)
  const paymentStatus =
    milestone.payment_status || derivePaymentStatus(milestone.status)
  if (
    milestone.status === 'approved' &&
    paymentStatus === 'processing' &&
    can('release_payment', milestone.allowed_actions)
  ) {
    actions.push({
      type: 'release_payment',
      label: t('payment.action.release_payment'),
      variant: 'default',
    })
  }

  return actions
})

const handleAction = async (actionType: string) => {
  try {
    switch (actionType) {
      case 'review':
        approvalFlowOpen.value = true
        break
      case 'approve_client':
        clientApprovalFlowOpen.value = true
        break
      case 'reject_client':
        clientApprovalFlowOpen.value = true
        break
      case 'submit_report':
        emits('submitReport')
        break
      case 'pay_milestone':
        paymentDialogOpen.value = true
        break
      case 'release_payment':
        releasePaymentDialogOpen.value = true
        break
    }
  } catch (error) {
    console.error(`Error executing action ${actionType}:`, error)
  }
}

const handlePaymentSubmit = async (payload: PaymentPayload) => {
  isPaymentSubmitting.value = true
  try {
    await notify.promise(
      () => payForMilestone(props.milestone.id, payload),
      {
        loading: t('payment.button.loading'),
        success: t('payment.success.message'),
        error: t('payment.error.message'),
      },
      { id: milestoneMutationToastId('pay', props.milestone.id) }
    )
    paymentDialogOpen.value = false
    // Emit actionComplete only after success confirmed (decision #1 + patch #27)
    emits('actionComplete')
  } catch (error) {
    console.error('Payment error:', error)
  } finally {
    isPaymentSubmitting.value = false
  }
}

const handleApprovalFlowApproved = () => {
  approvalFlowOpen.value = false
  emits('actionComplete')
}

const handleApprovalFlowRejected = () => {
  approvalFlowOpen.value = false
  emits('actionComplete')
}

const handleClientApprovalFlowApproved = () => {
  clientApprovalFlowOpen.value = false
  emits('actionComplete')
}

const handleClientApprovalFlowRejected = () => {
  clientApprovalFlowOpen.value = false
  emits('actionComplete')
}

const handleReleasePaymentConfirm = async () => {
  // Validate contractor exists before attempting release
  if (!props.milestone.contractor?.name) {
    const errorMsg = t('errors.contractor_missing')
    releasePaymentDialogRef.value?.setError(errorMsg)
    return
  }

  // Re-check permission at action boundary (permission may have changed mid-dialog)
  if (!can('release_payment', props.milestone.allowed_actions)) {
    const errorMsg = t('errors.permission_denied')
    releasePaymentDialogRef.value?.setError(errorMsg)
    return
  }

  isReleasePaymentSubmitting.value = true
  try {
    await notify.promise(
      () => releaseMilestonePayment(props.milestone.id),
      {
        loading: t('payment.action.release_confirm_loading'),
        success: t('payment.message.released', {
          amount: formatCurrency(props.milestone.amount || 0),
        }),
        error: error =>
          error instanceof Error ? error.message : t('errors.release_failed'),
      },
      { id: milestoneMutationToastId('release', props.milestone.id) }
    )
    releasePaymentDialogOpen.value = false
    emits('actionComplete')
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : t('errors.release_failed')
    releasePaymentDialogRef.value?.setError(errorMsg)
  } finally {
    isReleasePaymentSubmitting.value = false
  }
}
</script>

<template>
  <div>
    <div v-if="visibleActions.length > 0" class="flex flex-wrap gap-2">
      <Button
        v-for="action in visibleActions"
        :key="action.type"
        :variant="action.variant"
        :disabled="isLoading"
        size="sm"
        class="text-xs"
        @click="handleAction(action.type)"
      >
        {{ action.label }}
      </Button>
    </div>

    <!-- Approval Flow Dialog (Supervisor) -->
    <ApprovalFlow
      :open="approvalFlowOpen"
      :milestone="milestone"
      :report="milestone.latest_report"
      @update:open="approvalFlowOpen = $event"
      @approved="handleApprovalFlowApproved"
      @rejected="handleApprovalFlowRejected"
    />

    <!-- Client Approval Flow Dialog -->
    <ClientApprovalFlow
      :open="clientApprovalFlowOpen"
      :milestone="milestone"
      :report="milestone.latest_report"
      @update:open="clientApprovalFlowOpen = $event"
      @approved="handleClientApprovalFlowApproved"
      @rejected="handleClientApprovalFlowRejected"
    />

    <!-- Payment Dialog -->
    <PaymentConfirmDialog
      :milestone="milestone"
      :open="paymentDialogOpen"
      @close="paymentDialogOpen = false"
      @submit="handlePaymentSubmit"
    />

    <!-- Release Payment Dialog -->
    <PaymentReleaseDialog
      ref="releasePaymentDialogRef"
      :open="releasePaymentDialogOpen"
      :milestone="milestone"
      :is-loading="isReleasePaymentSubmitting"
      @update:open="releasePaymentDialogOpen = $event"
      @confirm="handleReleasePaymentConfirm"
    />
  </div>
</template>
