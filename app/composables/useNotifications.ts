import { onBeforeUnmount } from 'vue'
import type { NotificationResponse } from '~/shared/types/notification'
import { useNotificationsStore } from '~/stores/notifications'

const POLLING_INTERVAL = 30000 // 30 seconds

export const useNotifications = () => {
  const store = useNotificationsStore()
  let pollTimer: number | undefined
  let visibilityListener: (() => void) | undefined

  const poll = async () => {
    // Atomic check to prevent race condition during visibility toggle
    const isHidden = document.hidden
    if (isHidden) return

    try {
      const response = await useApi<NotificationResponse>('/notifications')
      const notifs = response.data ?? []
      store.setNotifications(notifs)
    } catch (e) {
      console.error('Failed to fetch notifications:', e)
      // Reset count on persistent failure (fire-and-forget polling pattern)
      store.setNotifications([])
    }
  }

  const startPolling = () => {
    // Guard: prevent duplicate timers on remount
    if (pollTimer) return

    poll()
    pollTimer = window.setInterval(poll, POLLING_INTERVAL)

    // Cleanup old listener if it exists (defensive against remount edge case)
    if (visibilityListener) {
      document.removeEventListener('visibilitychange', visibilityListener)
    }

    visibilityListener = () => {
      if (!document.hidden) poll()
    }
    document.addEventListener('visibilitychange', visibilityListener)
  }

  const stopPolling = () => {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = undefined
    }
    if (visibilityListener) {
      document.removeEventListener('visibilitychange', visibilityListener)
      visibilityListener = undefined
    }
  }

  const markAsRead = async (notificationId: string) => {
    // Optimistic update through store
    store.markAsRead(notificationId)

    // API call (fire-and-forget, polling will correct any errors)
    useApi(`/notifications/${notificationId}/read`, { method: 'POST' }).catch(
      () => {}
    )
  }

  const markAllAsRead = async () => {
    // Optimistic update through store
    store.markAllAsRead()

    // API call (fire-and-forget, polling will correct any errors)
    useApi('/notifications/read-all', { method: 'POST' }).catch(() => {})
  }

  onBeforeUnmount(() => {
    stopPolling()
  })

  return {
    unreadCount: store.unreadCount,
    notifications: store.notifications,
    startPolling,
    stopPolling,
    markAsRead,
    markAllAsRead,
  }
}
