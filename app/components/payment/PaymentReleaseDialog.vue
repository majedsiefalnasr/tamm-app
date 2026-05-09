<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Milestone } from '~/shared/types/project'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { formatCurrency } from '~/utils/formatters'

interface Props {
  open: boolean
  milestone: Milestone
  isLoading?: boolean
}

interface Emits {
  'update:open': (value: boolean) => void
  confirm: () => void
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
})

const emit = defineEmits<Emits>()

const { t } = useI18n()
const dialogError = ref<string | null>(null)

// Clear error when dialog closes
watch(
  () => props.open,
  newVal => {
    if (!newVal) {
      dialogError.value = null
    }
  }
)

const handleConfirm = () => {
  dialogError.value = null
  emit('confirm')
}

const handleCancel = () => {
  // Prevent closing dialog while request is in-flight
  if (props.isLoading) {
    return
  }
  emit('update:open', false)
}

// Expose error setter for parent component
const setError = (msg: string) => {
  dialogError.value = msg
}

defineExpose({ setError })
</script>

<template>
  <Dialog
    :open="open"
    @update:open="newVal => !isLoading && emit('update:open', newVal)"
  >
    <DialogContent
      class="max-w-md"
      :class="{ 'pointer-events-none': isLoading }"
    >
      <DialogHeader>
        <DialogTitle>{{ t('payment.dialog.release_title') }}</DialogTitle>
      </DialogHeader>

      <!-- Warning banner -->
      <div
        class="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800"
      >
        <span class="block text-center"
          >⚠️ {{ t('payment.dialog.cannot_undo') }}</span
        >
      </div>

      <!-- Summary section -->
      <div class="my-4 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-muted-foreground text-sm"
            >{{ t('milestone.label') }}:</span
          >
          <span class="text-sm font-semibold">{{ milestone.name }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-muted-foreground text-sm"
            >{{ t('payment.contractor') }}:</span
          >
          <span class="text-sm font-semibold">{{
            milestone.contractor?.name || 'N/A'
          }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-muted-foreground text-sm"
            >{{ t('payment.amount') }}:</span
          >
          <span class="text-primary text-lg font-bold">{{
            formatCurrency(milestone.amount)
          }}</span>
        </div>
      </div>

      <!-- Error message (if any) -->
      <div
        v-if="dialogError"
        class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-xs"
      >
        {{ dialogError }}
      </div>

      <!-- Footer -->
      <DialogFooter class="flex gap-2">
        <Button :disabled="isLoading" variant="outline" @click="handleCancel">
          {{ t('common.cancel') }}
        </Button>
        <Button :disabled="isLoading" @click="handleConfirm">
          {{
            t('payment.action.release_amount', {
              amount: formatCurrency(milestone.amount),
            })
          }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
