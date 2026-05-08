<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { BellIcon } from '@heroicons/vue/24/outline'
import { Button } from '~/components/ui/button'
import NotificationDrawer from '~/components/notifications/NotificationDrawer.vue'
import { useNotifications } from '~/composables/useNotifications'

const { unreadCount, startPolling } = useNotifications()

const UNREAD_COUNT_THRESHOLD = 99
const drawerOpen = ref(false)

const displayCount = computed(() => {
  return unreadCount.value > UNREAD_COUNT_THRESHOLD ? '99+' : unreadCount.value
})

const showBadge = computed(() => unreadCount.value > 0)

const handleBellClick = () => {
  drawerOpen.value = true
}

onMounted(() => {
  startPolling()
})
</script>

<template>
  <div class="relative">
    <Button
      variant="ghost"
      size="icon"
      class="border-border bg-background hover:border-primary hover:text-primary relative inline-flex h-10 w-10 items-center justify-center rounded-full border transition"
      :aria-label="$t('common.notifications')"
      @click="handleBellClick"
    >
      <BellIcon class="h-5 w-5" />
    </Button>

    <!-- Badge -->
    <div
      v-if="showBadge"
      class="bg-destructive text-destructive-foreground absolute -end-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[9px] font-bold"
    >
      {{ displayCount }}
    </div>

    <!-- Notification drawer -->
    <NotificationDrawer :open="drawerOpen" @update:open="drawerOpen = $event" />
  </div>
</template>
