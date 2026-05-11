<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/sheet'
import { Button } from '~/components/ui/button'
import { useNotifications } from '~/composables/useNotifications'
import { formatRelativeTime } from '~/utils/formatters'
import EmptyState from '~/components/common/EmptyState.vue'
import type { Notification } from '~/shared/types/notification'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [boolean]
}>()

const router = useRouter()
const auth = useAuthStore()
const { notifications, unreadCount, markAsRead, markAllAsRead } =
  useNotifications()

const showMarkAllButton = computed(() => {
  return unreadCount.value > 0
})

const drawerOpen = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

const visibleNotifications = computed(() => {
  const uid = auth.user?.id
  return notifications.value.filter(
    n => !n.user_id || String(n.user_id) === String(uid ?? '')
  )
})

const sortedNotifications = computed(() => {
  return [...visibleNotifications.value].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
})

const handleNotificationClick = (notification: Notification) => {
  markAsRead(notification.id)
  if (notification.data?.action_url) {
    router.push(notification.data.action_url)
  } else if (
    notification.data?.resource_type &&
    notification.data?.resource_id
  ) {
    router.push(
      `/${notification.data.resource_type}/${notification.data.resource_id}`
    )
  }
  emit('update:open', false)
}

const handleMarkAllAsRead = () => {
  markAllAsRead()
}
</script>

<template>
  <Sheet v-model:open="drawerOpen">
    <SheetContent side="end" class="w-[380px] md:w-[420px]">
      <!-- Header -->
      <SheetHeader class="border-border border-b px-0 py-4">
        <div class="flex items-center justify-between gap-3 px-4">
          <SheetTitle class="text-lg font-extrabold">
            {{ $t('notif.drawer.title') }}
          </SheetTitle>
          <Button
            v-if="showMarkAllButton"
            variant="ghost"
            size="sm"
            class="text-sm"
            @click="handleMarkAllAsRead"
          >
            {{ $t('notif.drawer.mark_all_read') }}
          </Button>
        </div>
      </SheetHeader>

      <!-- Content -->
      <div class="mt-0 overflow-y-auto">
        <!-- Empty state -->
        <EmptyState
          v-if="visibleNotifications.length === 0"
          icon="bell"
          class="flex h-64 flex-col items-center justify-center"
          title="notif.drawer.empty"
        />

        <!-- Notification list -->
        <div v-else>
          <div
            v-for="notification in sortedNotifications"
            :key="notification.id"
            class="border-border hover:bg-muted/50 flex cursor-pointer items-start gap-3 border-b px-4 py-3 transition last:border-0"
            :class="{
              'bg-primary-50/40': !notification.read_at,
              'bg-background': !!notification.read_at,
            }"
            @click="handleNotificationClick(notification)"
          >
            <!-- Unread dot -->
            <div
              v-if="!notification.read_at"
              class="bg-primary mt-1.5 h-2 w-2 shrink-0 rounded-full"
            />

            <!-- Content -->
            <div class="min-w-0 flex-1">
              <p class="text-ink text-sm font-semibold">
                {{ notification.title }}
              </p>
              <p class="text-muted-foreground mt-0.5 line-clamp-2 text-xs">
                {{ notification.message }}
              </p>
              <p class="text-muted-foreground mt-1 text-[10px]">
                {{ formatRelativeTime(notification.created_at) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>
