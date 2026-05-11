import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Notification } from '~/shared/types/notification'
import { useAuthStore } from '~/stores/auth'

function viewerUnreadCount(
  items: Notification[],
  viewerId: number | string | undefined
): number {
  return items.filter(n => {
    const belongsToViewer =
      !n.user_id || String(n.user_id) === String(viewerId ?? '')
    return belongsToViewer && !n.read_at
  }).length
}

export const useNotificationsStore = defineStore('notifications', () => {
  const unreadCount = ref(0)
  const notifications = ref<Notification[]>([])

  const syncUnreadForViewer = () => {
    const auth = useAuthStore()
    unreadCount.value = viewerUnreadCount(notifications.value, auth.user?.id)
  }

  const setNotifications = (notifs: Notification[]) => {
    notifications.value = notifs
    syncUnreadForViewer()
  }

  const prependNotification = (notification: Notification) => {
    notifications.value = [notification, ...notifications.value]
    syncUnreadForViewer()
  }

  const decrementUnreadCount = () => {
    unreadCount.value = Math.max(0, unreadCount.value - 1)
  }

  const markAsRead = (notificationId: string) => {
    const auth = useAuthStore()
    const notification = notifications.value.find(
      (n: Notification) => n.id === notificationId
    )
    if (
      notification &&
      (!notification.user_id ||
        String(notification.user_id) === String(auth.user?.id ?? ''))
    ) {
      notification.read_at = new Date().toISOString()
      syncUnreadForViewer()
    }
  }

  const markAllAsRead = () => {
    const auth = useAuthStore()
    const uid = auth.user?.id
    notifications.value.forEach((n: Notification) => {
      if (!n.user_id || String(n.user_id) === String(uid ?? '')) {
        n.read_at = new Date().toISOString()
      }
    })
    syncUnreadForViewer()
  }

  return {
    unreadCount,
    notifications,
    setNotifications,
    prependNotification,
    decrementUnreadCount,
    markAsRead,
    markAllAsRead,
  }
})
