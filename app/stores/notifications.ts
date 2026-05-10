import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Notification } from '~/shared/types/notification'
import { useAuthStore } from '~/stores/auth'

function viewerUnreadCount(
  items: Notification[],
  viewerId: string | undefined
): number {
  return items.filter(n => (!n.user_id || n.user_id === viewerId) && !n.is_read)
    .length
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
      (!notification.user_id || notification.user_id === auth.user?.id)
    ) {
      notification.is_read = true
      syncUnreadForViewer()
    }
  }

  const markAllAsRead = () => {
    const auth = useAuthStore()
    const uid = auth.user?.id
    notifications.value.forEach((n: Notification) => {
      if (!n.user_id || n.user_id === uid) {
        n.is_read = true
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
