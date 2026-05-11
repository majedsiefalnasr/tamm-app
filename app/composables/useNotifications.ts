import { storeToRefs } from 'pinia'
import { toast } from 'vue-sonner'
import type { Notification } from '~/shared/types/notification'
import { useNotificationsStore } from '~/stores/notifications'

/** Options forwarded to vue-sonner — use `id` to dedupe/replace toasts per mutation. */
export type SonnerToastOptions = {
  id?: string
  duration?: number
}
export type SonnerPromiseMessages<T> = {
  loading: string
  success: string | ((data: T) => string)
  error: string | ((error: unknown) => string)
}

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

  const showNotification = (payload: {
    type: 'success' | 'error' | 'info'
    message: string
    duration?: number
    id?: string
  }) => {
    const opts: SonnerToastOptions = {}
    if (payload.duration != null) opts.duration = payload.duration
    if (payload.id != null) opts.id = payload.id
    const toastOpts = Object.keys(opts).length ? opts : undefined
    if (payload.type === 'success') {
      toast.success(payload.message, toastOpts)
    } else if (payload.type === 'error') {
      toast.error(payload.message, toastOpts)
    } else {
      toast.info(payload.message, toastOpts)
    }
  }

  const { unreadCount, notifications } = storeToRefs(store)

  const notify = {
    success: (message: string, opts?: SonnerToastOptions) =>
      opts ? toast.success(message, opts) : toast.success(message),
    error: (message: string, opts?: SonnerToastOptions) =>
      opts ? toast.error(message, opts) : toast.error(message),
    info: (message: string, opts?: SonnerToastOptions) =>
      opts ? toast.info(message, opts) : toast.info(message),
    warning: (message: string, opts?: SonnerToastOptions) =>
      opts ? toast.warning(message, opts) : toast.warning(message),
    promise: <T>(
      promiseFactory: () => Promise<T>,
      messages: SonnerPromiseMessages<T>,
      opts?: SonnerToastOptions
    ) => toast.promise(promiseFactory, messages, opts),
  }

  const pushLocalNotification = (notification: Notification) => {
    store.prependNotification(notification)
  }

  const decrementUnreadCount = () => {
    store.decrementUnreadCount()
  }

  return {
    unreadCount,
    notifications,
    notify,
    pushLocalNotification,
    showNotification,
    startPolling,
    stopPolling,
    markAsRead,
    markAllAsRead,
    decrementUnreadCount,
  }
}
