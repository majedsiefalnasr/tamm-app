<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Milestone, Report } from '~/shared/types/project'
import { useMilestones } from '~/composables/useMilestones'
import { useNotifications } from '~/composables/useNotifications'
import { milestoneMutationToastId } from '~/utils/mutationFeedback'
import { useI18n } from 'vue-i18n'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import RejectReasonDialog from './RejectReasonDialog.vue'

interface Props {
  open: boolean
  milestone: Milestone
  report?: Report
}

const emit = defineEmits<{
  'update:open': [value: boolean]
  approved: []
  rejected: []
}>()

const props = defineProps<Props>()

const { approveMilestone, rejectMilestone } = useMilestones()
const { notify } = useNotifications()
const { t } = useI18n()

const step = ref<'review' | 'confirm-approve' | 'confirm-reject'>('review')
const loading = ref(false)
const error = ref<string | null>(null)
const showRejectDialog = ref(false)

const localOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

const handleApprove = () => {
  step.value = 'confirm-approve'
}

const handleConfirmApprove = async () => {
  loading.value = true
  error.value = null

  try {
    await approveMilestone(props.milestone.id, 'client')
    notify.success(t('success.client_milestone_approved'), {
      id: milestoneMutationToastId('client-approve', props.milestone.id),
    })
    emit('approved')
    localOpen.value = false
    step.value = 'review'
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
    notify.error(
      t('errors.client_milestone_approval_failed', {
        message: error.value,
      }),
      {
        id: milestoneMutationToastId(
          'client-approve-error',
          props.milestone.id
        ),
      }
    )
  } finally {
    loading.value = false
  }
}

const handleReject = () => {
  showRejectDialog.value = true
}

const handleConfirmReject = async (reason: string) => {
  loading.value = true
  error.value = null
  showRejectDialog.value = false

  try {
    await rejectMilestone(props.milestone.id, reason, 'client')
    notify.success(t('success.client_milestone_rejected'), {
      id: milestoneMutationToastId('client-reject', props.milestone.id),
    })
    emit('rejected')
    localOpen.value = false
    step.value = 'review'
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
    notify.error(
      t('errors.client_milestone_rejection_failed', {
        message: error.value,
      }),
      {
        id: milestoneMutationToastId('client-reject-error', props.milestone.id),
      }
    )
  } finally {
    loading.value = false
  }
}

const handleCancelApprove = () => {
  step.value = 'review'
  error.value = null
}

const handleCancelReject = () => {
  showRejectDialog.value = false
  error.value = null
}

const dialogTitle = computed(() => {
  if (step.value === 'confirm-approve') {
    return t('milestones.client_approve_confirm.title')
  }
  return t('milestones.client_approval_dialog.title')
})
</script>

<template>
  <div>
    <!-- Main Review Dialog -->
    <Dialog v-model:open="localOpen">
      <DialogContent class="flex max-h-screen max-w-2xl flex-col">
        <DialogHeader>
          <DialogTitle>{{ dialogTitle }}</DialogTitle>
        </DialogHeader>

        <!-- Review Step -->
        <div
          v-if="step === 'review'"
          class="flex flex-1 flex-col overflow-hidden"
        >
          <!-- Report Content (Scrollable) -->
          <div class="flex-1 overflow-y-auto ps-4 pe-4">
            <!-- Supervisor Approval Confirmation Badge -->
            <div
              class="bg-primary/5 mb-4 flex items-center gap-2 rounded-lg p-3"
            >
              <span class="text-primary text-lg">✓</span>
              <p class="text-foreground text-sm font-semibold">
                {{
                  t(
                    'milestones.client_approval_dialog.supervisor_approved_badge'
                  )
                }}
              </p>
            </div>

            <!-- Warning Box -->
            <div
              class="border-warning/20 bg-warning/5 mb-6 rounded-lg border p-4"
            >
              <p class="text-warning font-bold">
                {{ t('milestones.client_approval_dialog.warning_title') }}
              </p>
              <p class="text-muted-foreground mt-2 text-sm">
                {{ t('milestones.client_approval_dialog.warning_message') }}
              </p>
              <div class="mt-4 flex items-baseline gap-2">
                <span class="text-muted-foreground text-sm font-semibold">
                  {{ t('milestones.client_approval_dialog.amount_label') }}:
                </span>
                <span class="text-primary text-2xl font-extrabold">
                  {{ milestone.amount.toLocaleString() }} EGP
                </span>
              </div>
            </div>

            <!-- Report Content -->
            <div v-if="report" class="space-y-4">
              <div>
                <h3 class="text-ink mb-2 text-sm font-semibold">
                  {{ t('report.content') }}
                </h3>
                <p class="text-foreground text-sm whitespace-pre-wrap">
                  {{ report.content }}
                </p>
              </div>

              <!-- Report Images Grid -->
              <div v-if="report.images && report.images.length > 0">
                <h3 class="text-ink mb-2 text-sm font-semibold">
                  {{ t('report.images') }}
                </h3>
                <div class="grid grid-cols-2 gap-2 md:grid-cols-3">
                  <img
                    v-for="(image, idx) in report.images"
                    :key="idx"
                    :src="image"
                    :alt="`Report image ${idx + 1}`"
                    class="aspect-video overflow-hidden rounded-xl object-cover"
                  />
                </div>
              </div>
            </div>

            <!-- Error Message -->
            <div
              v-if="error"
              class="border-destructive/40 bg-destructive/10 text-destructive rounded-lg border p-3 text-sm"
            >
              {{ error }}
            </div>
          </div>

          <!-- Action Buttons (Footer) -->
          <DialogFooter class="mt-6 gap-2">
            <Button
              variant="outline"
              :disabled="loading"
              class="border-destructive text-destructive hover:bg-destructive/10"
              @click="handleReject"
            >
              {{ t('milestones.client_approval_dialog.reject_button') }}
            </Button>
            <Button :disabled="loading" @click="handleApprove">
              {{ t('milestones.client_approval_dialog.final_approve_button') }}
            </Button>
          </DialogFooter>
        </div>

        <!-- Confirm Approve Step -->
        <div v-if="step === 'confirm-approve'" class="flex flex-col gap-4">
          <p class="text-foreground text-sm">
            {{ t('milestones.client_approve_confirm.message') }}
          </p>

          <div
            v-if="error"
            class="border-destructive/40 bg-destructive/10 text-destructive rounded-lg border p-3 text-sm"
          >
            {{ error }}
          </div>

          <DialogFooter class="gap-2">
            <Button
              variant="ghost"
              :disabled="loading"
              @click="handleCancelApprove"
            >
              {{ t('common.cancel') }}
            </Button>
            <Button :disabled="loading" @click="handleConfirmApprove">
              <span v-if="loading" class="me-2 inline-block">⏳</span>
              {{ t('common.confirm') }}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Reject Reason Dialog -->
    <RejectReasonDialog
      :open="showRejectDialog"
      :loading="loading"
      @confirm="handleConfirmReject"
      @cancel="handleCancelReject"
    />
  </div>
</template>
