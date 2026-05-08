import { ref, onBeforeUnmount } from 'vue'
import type { Ref } from 'vue'
import type { NotificationResponse } from '~/shared/types/notification'

const POLLING_INTERVAL = 30000 // 30 seconds
const UNREAD_COUNT_THRESHOLD = 99

export const useNotifications = () => {
  const unreadCount: Ref<number> = ref(0)
  let pollTimer: number | undefined
  let visibilityListener: (() => void) | undefined

  const notify = {
    success: (message: string) => {
      console.warn('✓ Success:', message)
    },
    error: (message: string) => {
      console.error('✗ Error:', message)
    },
    info: (message: string) => {
      console.warn('ℹ Info:', message)
    },
    warning: (message: string) => {
      console.warn('⚠ Warning:', message)
    },
  }

  const poll = async () => {
    if (document.hidden) return

    try {
      const response = await useApi<NotificationResponse>('/notifications')
      const notifs = response.data ?? []
      unreadCount.value = notifs.filter(n => !n.is_read).length
    } catch (e) {
      console.error('Failed to fetch notifications:', e)
    }
  }

  const startPolling = () => {
    poll()
    pollTimer = window.setInterval(poll, POLLING_INTERVAL)

    visibilityListener = () => {
      if (!document.hidden) poll()
    }
    document.addEventListener('visibilitychange', visibilityListener)
  }

  const stopPolling = () => {
    if (pollTimer) clearInterval(pollTimer)
    if (visibilityListener) {
      document.removeEventListener('visibilitychange', visibilityListener)
    }
  }

  const decrementUnreadCount = () => {
    unreadCount.value = Math.max(0, unreadCount.value - 1)
  }

  onBeforeUnmount(() => {
    stopPolling()
  })

  return {
    notify,
    unreadCount,
    startPolling,
    stopPolling,
    decrementUnreadCount,
  }
}
