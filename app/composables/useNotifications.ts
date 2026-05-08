import { ref, onBeforeUnmount } from 'vue'
import type { Ref } from 'vue'
import type {
  Notification,
  NotificationResponse,
} from '~/shared/types/notification'

const POLLING_INTERVAL = 30000 // 30 seconds
const UNREAD_COUNT_THRESHOLD = 99

export const useNotifications = () => {
  const unreadCount: Ref<number> = ref(0)
  const notifications: Ref<Notification[]> = ref([])
  let pollTimer: number | undefined
  let visibilityListener: (() => void) | undefined

  const poll = async () => {
    if (document.hidden) return

    try {
      const response = await useApi<NotificationResponse>('/notifications')
      const notifs = response.data ?? []
      notifications.value = notifs
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

  const markAsRead = async (notificationId: string) => {
    const notification = notifications.value.find(n => n.id === notificationId)
    if (!notification) return

    // Optimistic update
    notification.is_read = true
    decrementUnreadCount()

    // API call (fire-and-forget, polling will correct any errors)
    useApi(`/notifications/${notificationId}/read`, { method: 'POST' }).catch(
      () => {}
    )
  }

  const markAllAsRead = async () => {
    // Optimistic update
    notifications.value.forEach(n => {
      n.is_read = true
    })
    unreadCount.value = 0

    // API call (fire-and-forget, polling will correct any errors)
    useApi('/notifications/read-all', { method: 'POST' }).catch(() => {})
  }

  onBeforeUnmount(() => {
    stopPolling()
  })

  return {
    unreadCount,
    notifications,
    startPolling,
    stopPolling,
    decrementUnreadCount,
    markAsRead,
    markAllAsRead,
  }
}
