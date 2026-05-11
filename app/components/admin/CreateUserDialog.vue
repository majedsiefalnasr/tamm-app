<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import CreateUserForm from './CreateUserForm.vue'
import type { User } from '../../composables/useAdminUsers'

interface Props {
  open: boolean
  user?: User | null
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
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle class="text-start">{{
          props.user
            ? t('admin.users.actions.edit')
            : t('admin.users.create.title')
        }}</DialogTitle>
        <DialogDescription class="text-start">
          {{
            props.user
              ? t('admin.users.create.edit_description')
              : t('admin.users.create.description')
          }}
        </DialogDescription>
      </DialogHeader>
      <CreateUserForm
        :user="props.user"
        @success="handleSuccess"
        @cancel="handleCancel"
      />
    </DialogContent>
  </Dialog>
</template>
