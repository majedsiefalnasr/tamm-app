<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import AssignEngineersForm from './AssignEngineersForm.vue'
import type { ProjectDetail } from '~/shared/types/project'

interface Props {
  projectId: string
  project: ProjectDetail
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

const handleClose = () => {
  emit('update:open', false)
}
</script>

<template>
  <Dialog :open="props.open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle class="text-start">{{
          t('admin.projects.assign_engineers.title')
        }}</DialogTitle>
      </DialogHeader>
      <AssignEngineersForm
        :project-id="projectId"
        :project="project"
        @success="handleSuccess"
        @close="handleClose"
      />
    </DialogContent>
  </Dialog>
</template>
