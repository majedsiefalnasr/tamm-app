<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import AssignEngineersForm from './AssignEngineersForm.vue'

interface Props {
  projectId: string
  open: boolean
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { $t } = useI18n()

const handleSuccess = () => {
  emit('update:open', false)
  emit('success')
}
</script>

<template>
  <Dialog :open="props.open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle class="text-start">{{
          $t('admin.projects.assign_engineers.title')
        }}</DialogTitle>
      </DialogHeader>
      <AssignEngineersForm :project-id="projectId" @success="handleSuccess" />
    </DialogContent>
  </Dialog>
</template>
