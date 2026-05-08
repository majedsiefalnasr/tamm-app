<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '../ui/dropdown-menu'
import { Button } from '../ui/button'
import { MoreVertical } from 'lucide-vue-next'
import type { User } from '../../composables/useAdminUsers'

interface Props {
  user: User
}

defineProps<Props>()

const emit = defineEmits<{
  edit: []
  'toggle-status': []
}>()

const { $t } = useI18n()
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="sm" class="h-8 w-8 p-0">
        <MoreVertical class="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start">
      <DropdownMenuItem @click="emit('edit')">
        {{ $t('admin.users.actions.edit') }}
      </DropdownMenuItem>
      <DropdownMenuItem @click="emit('toggle-status')">
        {{
          user.status === 'active'
            ? $t('admin.users.actions.deactivate')
            : $t('admin.users.actions.activate')
        }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
