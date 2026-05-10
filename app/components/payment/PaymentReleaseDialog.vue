<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Milestone } from '~/shared/types/project'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog'
import { Loader2 } from 'lucide-vue-next'
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

watch(
  () => props.open,
  newVal => {
    if (!newVal) {
      dialogError.value = null
    }
  }
)

const handleOpenChange = (next: boolean) => {
  if (!next && props.isLoading) return
  emit('update:open', next)
}

const handleConfirm = () => {
  dialogError.value = null
  emit('confirm')
}

const setError = (msg: string) => {
  dialogError.value = msg
}

defineExpose({ setError })
</script>

<template>
  <AlertDialog :open="open" @update:open="handleOpenChange">
    <AlertDialogContent
      class="max-w-md"
      :class="{ 'pointer-events-none': isLoading }"
    >
      <AlertDialogHeader>
        <AlertDialogTitle>{{
          t('payment.dialog.release_title')
        }}</AlertDialogTitle>
        <AlertDialogDescription>{{
          t('payment.dialog.release_description')
        }}</AlertDialogDescription>
      </AlertDialogHeader>

      <div
        class="rounded-xl border border-amber-200 bg-amber-50 p-3 text-center text-xs text-amber-800"
      >
        {{ t('payment.dialog.cannot_undo') }}
      </div>

      <div class="my-4 space-y-3 text-start">
        <div class="flex items-center justify-between gap-2">
          <span class="text-muted-foreground text-sm">{{
            t('milestone.label')
          }}</span>
          <span class="text-sm font-semibold">{{ milestone.name }}</span>
        </div>
        <div class="flex items-center justify-between gap-2">
          <span class="text-muted-foreground text-sm">{{
            t('payment.contractor')
          }}</span>
          <span class="text-sm font-semibold">{{
            milestone.contractor?.name || 'N/A'
          }}</span>
        </div>
        <div class="flex items-center justify-between gap-2">
          <span class="text-muted-foreground text-sm">{{
            t('payment.amount')
          }}</span>
          <span class="text-primary text-lg font-bold">{{
            formatCurrency(milestone.amount)
          }}</span>
        </div>
      </div>

      <div
        v-if="dialogError"
        class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-xs"
        role="alert"
      >
        {{ dialogError }}
      </div>

      <AlertDialogFooter class="gap-2 sm:justify-between">
        <AlertDialogCancel class="border-border mt-0" :disabled="isLoading">
          {{ t('common.cancel') }}
        </AlertDialogCancel>
        <AlertDialogAction
          class="bg-primary text-primary-foreground hover:bg-primary/90"
          :disabled="isLoading"
          @click.prevent="handleConfirm"
        >
          <span v-if="isLoading" class="inline-flex items-center gap-2">
            <Loader2 class="h-4 w-4 animate-spin" aria-hidden="true" />
            {{ t('payment.dialog.release_confirm_loading') }}
          </span>
          <span v-else>{{
            t('payment.action.release_amount', {
              amount: formatCurrency(milestone.amount),
            })
          }}</span>
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
