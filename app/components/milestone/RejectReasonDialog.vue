<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'

interface Props {
  open: boolean
  loading?: boolean
}

const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: [reason: string]
  cancel: []
}>()

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const { t } = useI18n()
const reason = ref('')

const localOpen = computed({
  get: () => props.open,
  set: value => {
    if (!value) {
      reason.value = ''
    }
    emit('update:open', value)
  },
})

const isValid = computed(() => {
  return reason.value.trim().length >= 10
})

const validationError = computed(() => {
  if (reason.value.length > 0 && reason.value.length < 10) {
    return t('milestones.reject_reason_dialog.min_chars_error')
  }
  return null
})

const handleConfirm = () => {
  if (isValid.value) {
    emit('confirm', reason.value)
    reason.value = ''
  }
}

const handleCancel = () => {
  localOpen.value = false
  emit('cancel')
  reason.value = ''
}
</script>

<template>
  <Dialog v-model:open="localOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {{ t('milestones.reject_reason_dialog.title') }}
        </DialogTitle>
      </DialogHeader>

      <div class="space-y-4">
        <Textarea
          v-model="reason"
          :placeholder="t('milestones.reject_reason_dialog.reason_placeholder')"
          class="h-32"
          :disabled="loading"
        />

        <div v-if="validationError" class="text-destructive text-sm">
          {{ validationError }}
        </div>
      </div>

      <DialogFooter class="gap-2">
        <Button variant="ghost" :disabled="loading" @click="handleCancel">
          {{ t('common.cancel') }}
        </Button>
        <Button :disabled="loading || !isValid" @click="handleConfirm">
          <span v-if="loading" class="me-2 inline-block">⏳</span>
          {{ t('common.confirm') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
