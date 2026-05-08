<script setup lang="ts">
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

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('update:open', false)
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-w-md">
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
