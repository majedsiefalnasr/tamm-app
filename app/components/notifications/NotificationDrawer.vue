<script setup lang="ts">
import { computed, ref } from 'vue'
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
const { notifications, unreadCount, markAsRead, markAllAsRead } =
  useNotifications()
const isLoading = ref(false)

const showMarkAllButton = computed(() => {
  return unreadCount.value > 0
})

const sortedNotifications = computed(() => {
  return [...notifications.value].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
})

const handleNotificationClick = async (notification: Notification) => {
  if (isLoading.value) return
  isLoading.value = true
  try {
    await markAsRead(notification.id)
    if (notification.link) {
      router.push(notification.link)
    }
    emit('update:open', false)
  } finally {
    isLoading.value = false
  }
}

const handleMarkAllAsRead = async () => {
  if (isLoading.value) return
  isLoading.value = true
  try {
    await markAllAsRead()
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <Sheet :open="open" @update:open="emit('update:open', $event)">
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
            :disabled="isLoading"
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
          v-if="notifications.length === 0"
          class="flex h-64 flex-col items-center justify-center"
          :title="$t('notif.drawer.empty')"
        />

        <!-- Notification list -->
        <div v-else>
          <div
            v-for="notification in sortedNotifications"
            :key="notification.id"
            class="border-border hover:bg-muted/50 flex cursor-pointer items-start gap-3 border-b px-4 py-3 transition last:border-0"
            :class="{
              'bg-primary-50/40': !notification.is_read,
              'bg-background': notification.is_read,
            }"
            :style="{
              pointerEvents: isLoading ? 'none' : 'auto',
              opacity: isLoading ? 0.6 : 1,
            }"
            @click="handleNotificationClick(notification)"
          >
            <!-- Unread dot -->
            <div
              v-if="!notification.is_read"
              class="bg-primary mt-1.5 h-2 w-2 shrink-0 rounded-full"
            />

            <!-- Content -->
            <div class="min-w-0 flex-1">
              <p class="text-ink text-sm font-semibold">
                {{ notification.title }}
              </p>
              <p class="text-muted-foreground mt-0.5 line-clamp-2 text-xs">
                {{ notification.body }}
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
