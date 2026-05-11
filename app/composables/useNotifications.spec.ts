import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('vue-sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}))

import { toast } from 'vue-sonner'
import { useNotifications } from './useNotifications'

// Mock useApi
vi.mock('#app', async () => ({
  useApi: vi.fn(),
}))

vi.mock('~/stores/auth', () => ({
  useAuthStore: () => ({
    user: { id: 1 },
  }),
}))

const mockNotifications = [
  {
    id: '1',
    user_id: 1,
    title: 'Report submitted',
    message: 'Milestone A',
    data: {
      resource_type: 'milestones',
      resource_id: 1,
      action_url: '/projects/1/milestones/1',
      actor_name: 'System',
    },
    created_at: '2024-05-08T10:00:00Z',
    read_at: null,
  },
  {
    id: '2',
    user_id: 1,
    title: 'Approved',
    message: 'Milestone B',
    data: {
      resource_type: 'milestones',
      resource_id: 2,
      action_url: '/projects/1/milestones/2',
      actor_name: 'System',
    },
    created_at: '2024-05-07T15:30:00Z',
    read_at: '2024-05-07T16:00:00Z',
  },
]

describe('useNotifications composable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  it('initializes with empty notifications and 0 unread count', () => {
    const { notifications, unreadCount } = useNotifications()

    expect(notifications.value).toEqual([])
    expect(unreadCount.value).toBe(0)
  })

  it('exposes notifications array for drawer to consume', () => {
    const { notifications } = useNotifications()

    expect(Array.isArray(notifications.value)).toBe(true)
  })

  it('decrements unread count correctly', () => {
    const { unreadCount, decrementUnreadCount } = useNotifications()
    unreadCount.value = 5

    decrementUnreadCount()

    expect(unreadCount.value).toBe(4)
  })

  it('guards against negative unread count', () => {
    const { unreadCount, decrementUnreadCount } = useNotifications()
    unreadCount.value = 0

    decrementUnreadCount()

    expect(unreadCount.value).toBe(0)
  })

  it('marks a single notification as read', async () => {
    const { notifications, markAsRead, unreadCount } = useNotifications()
    notifications.value = [...mockNotifications]
    unreadCount.value = 1

    await markAsRead('1')

    const notification = notifications.value.find(n => n.id === '1')
    expect(notification?.read_at).toBeTruthy()
    expect(unreadCount.value).toBe(0)
  })

  it('handles markAsRead for non-existent notification gracefully', async () => {
    const { markAsRead } = useNotifications()

    // Should not throw
    await expect(markAsRead('non-existent')).resolves.toBeUndefined()
  })

  it('marks all notifications as read', async () => {
    const { notifications, markAllAsRead, unreadCount } = useNotifications()
    notifications.value = [...mockNotifications]
    unreadCount.value = 1

    await markAllAsRead()

    expect(notifications.value.every(n => !!n.read_at)).toBe(true)
    expect(unreadCount.value).toBe(0)
  })

  it('has notify object for error handling', () => {
    const { notify } = useNotifications()

    expect(notify).toBeDefined()
    expect(typeof notify.error).toBe('function')
    expect(typeof notify.success).toBe('function')
    expect(typeof notify.info).toBe('function')
    expect(typeof notify.warning).toBe('function')
  })

  it('forwards Sonner options from notify.success', () => {
    const { notify } = useNotifications()
    notify.success('saved', { id: 'mutation:save', duration: 1500 })
    expect(toast.success).toHaveBeenCalledWith('saved', {
      id: 'mutation:save',
      duration: 1500,
    })
  })
})
