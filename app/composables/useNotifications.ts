import { storeToRefs } from 'pinia'
import type { Notification } from '~/shared/types/notification'
import { useNotificationsStore } from '~/stores/notifications'

const POLLING_INTERVAL = 30000 // 30 seconds
let globalPollTimer: number | undefined
let globalVisibilityListener: (() => void) | undefined
let pollingStartCount = 0

export const useNotifications = () => {
  const store = useNotificationsStore()

  const poll = async () => {
    if (!import.meta.client) return
    const isHidden = document.hidden
    if (isHidden) return

    try {
      const response = await useApi<Notification[]>('/notifications')
      const notifs = response.data ?? []
      store.setNotifications(notifs)
    } catch (e) {
      console.error('Failed to fetch notifications:', e)
    }
  }

  const startPolling = () => {
    if (!import.meta.client) return
    pollingStartCount++
    if (globalPollTimer) return

    poll()
    globalPollTimer = window.setInterval(poll, POLLING_INTERVAL)

    if (globalVisibilityListener) {
      document.removeEventListener('visibilitychange', globalVisibilityListener)
    }

    globalVisibilityListener = () => {
      if (!document.hidden) poll()
    }
    document.addEventListener('visibilitychange', globalVisibilityListener)
  }

  const stopPolling = () => {
    if (!import.meta.client) return
    pollingStartCount = Math.max(0, pollingStartCount - 1)
    if (pollingStartCount > 0) return

    if (globalPollTimer) {
      clearInterval(globalPollTimer)
      globalPollTimer = undefined
    }
    if (globalVisibilityListener) {
      document.removeEventListener('visibilitychange', globalVisibilityListener)
      globalVisibilityListener = undefined
    }
  }

  const markAsRead = async (notificationId: string) => {
    const notification = store.notifications.find(n => n.id === notificationId)
    if (!notification) return

    store.markAsRead(notificationId)

    try {
      await useApi(`/notifications/${notificationId}/read`, { method: 'POST' })
    } catch (e) {
      console.error('Failed to mark notification as read:', e)
    }
  }

  const markAllAsRead = async () => {
    store.markAllAsRead()

    try {
      await useApi('/notifications/read-all', { method: 'POST' })
    } catch (e) {
      console.error('Failed to mark all notifications as read:', e)
    }
  }

  const { unreadCount, notifications } = storeToRefs(store)

  return {
    unreadCount,
    notifications,
    startPolling,
    stopPolling,
    markAsRead,
    markAllAsRead,
  }
}
