<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'

interface Props {
  projectId: string
  projectName: string
  proposalCount: number
  invitedCount?: number
  isOpen: boolean
  /** Parent-controlled: covers async close + API call */
  confirmPending?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  confirmPending: false,
})
const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  confirmed: []
}>()

const { t } = useI18n()

const handleConfirm = () => {
  emit('confirmed')
}

const handleCancel = () => {
  emit('update:isOpen', false)
}
</script>

<template>
  <Dialog :open="isOpen" @update:open="emit('update:isOpen', $event)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>
          {{ t('projects.closeBidding.dialogTitle') }}
        </DialogTitle>
      </DialogHeader>

      <div class="space-y-4">
        <!-- Main message -->
        <p class="text-ink text-sm">
          {{ t('projects.closeBidding.dialogMessage') }}
        </p>

        <!-- Proposal count -->
        <div class="bg-muted/50 border-border rounded-lg border p-4">
          <p class="text-muted-foreground mb-2 text-xs font-medium">
            {{ t('projects.closeBidding.proposalCount') }}
          </p>
          <p class="text-ink text-2xl font-extrabold">
            {{ proposalCount }}
          </p>
          <p v-if="invitedCount" class="text-muted-foreground mt-2 text-xs">
            {{ proposalCount }} {{ t('common.of') }} {{ invitedCount }}
            {{ t('projects.closeBidding.invitedContractors') }}
          </p>
        </div>

        <!-- Info message -->
        <p class="text-muted-foreground text-xs">
          {{ t('projects.closeBidding.info') }}
        </p>
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          :disabled="confirmPending"
          @click="handleCancel"
        >
          {{ t('projects.closeBidding.cancelButton') }}
        </Button>
        <Button :disabled="confirmPending" @click="handleConfirm">
          <span v-if="confirmPending" class="me-2 inline-block">
            <svg
              class="inline-block h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="2"
                stroke-dasharray="15.7"
              />
            </svg>
          </span>
          {{ t('projects.closeBidding.confirmButton') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
