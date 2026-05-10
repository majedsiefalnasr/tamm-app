<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import CreateUserForm from './CreateUserForm.vue'

interface Props {
  open: boolean
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()

const handleSuccess = () => {
  emit('update:open', false)
  emit('success')
}

const handleCancel = () => {
  emit('update:open', false)
}
</script>

<template>
  <Dialog :open="props.open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle class="text-start">{{
          t('admin.users.create.title')
        }}</DialogTitle>
      </DialogHeader>
      <CreateUserForm @success="handleSuccess" @cancel="handleCancel" />
    </DialogContent>
  </Dialog>
</template>
