import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Notification } from '~/shared/types/notification'

export const useNotificationsStore = defineStore('notifications', () => {
  const unreadCount = ref(0)
  const notifications = ref<Notification[]>([])

  const setNotifications = (notifs: Notification[]) => {
    notifications.value = notifs
    unreadCount.value = notifs.filter(n => !n.is_read).length
  }

  const decrementUnreadCount = () => {
    unreadCount.value = Math.max(0, unreadCount.value - 1)
  }

  const markAsRead = (notificationId: string) => {
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification) {
      notification.is_read = true
      decrementUnreadCount()
    }
  }

  const markAllAsRead = () => {
    notifications.value.forEach(n => {
      n.is_read = true
    })
    unreadCount.value = 0
  }

  const restoreNotification = (prevState: Notification) => {
    const index = notifications.value.findIndex(n => n.id === prevState.id)
    if (index !== -1) {
      notifications.value[index] = prevState
      unreadCount.value = notifications.value.filter(n => !n.is_read).length
    }
  }

  const restoreNotifications = (prevStates: Notification[]) => {
    notifications.value = prevStates
    unreadCount.value = prevStates.filter(n => !n.is_read).length
  }

  return {
    unreadCount,
    notifications,
    setNotifications,
    decrementUnreadCount,
    markAsRead,
    markAllAsRead,
    restoreNotification,
    restoreNotifications,
  }
})
