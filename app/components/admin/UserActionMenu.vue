<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '../ui/dropdown-menu'
import { Button } from '../ui/button'
import { Loader2, MoreVertical } from 'lucide-vue-next'
import type { User } from '../../composables/useAdminUsers'

interface Props {
  user: User
  toggling?: boolean
}

withDefaults(defineProps<Props>(), {
  toggling: false,
})

const emit = defineEmits<{
  edit: []
  'toggle-status': []
}>()

const { t } = useI18n()
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="sm" class="h-8 w-8 p-0">
        <MoreVertical class="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      side="bottom"
      align="end"
      :side-offset="6"
      :collision-padding="8"
    >
      <DropdownMenuItem @click="emit('edit')">
        {{ t('admin.users.actions.edit') }}
      </DropdownMenuItem>
      <DropdownMenuItem :disabled="toggling" @click="emit('toggle-status')">
        <Loader2 v-if="toggling" class="me-2 size-4 animate-spin" />
        <span>
          {{
            user.status === 'active'
              ? t('admin.users.actions.deactivate')
              : t('admin.users.actions.activate')
          }}
        </span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
