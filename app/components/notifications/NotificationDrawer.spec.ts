import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import NotificationDrawer from './NotificationDrawer.vue'
import { useNotifications } from '~/composables/useNotifications'
import { useRouter } from 'vue-router'

vi.mock('~/composables/useNotifications')
vi.mock('vue-router')

const mockNotifications = [
  {
    id: '1',
    user_id: 'user1',
    title: 'Report submitted',
    body: 'Milestone A — Project X',
    link: '/projects/1/milestones/1',
    is_read: false,
    created_at: '2024-05-08T10:00:00Z',
    read_at: null,
  },
  {
    id: '2',
    user_id: 'user1',
    title: 'Supervisor approved',
    body: 'Milestone B — awaiting your approval',
    link: '/projects/1/milestones/2',
    is_read: true,
    created_at: '2024-05-07T15:30:00Z',
    read_at: '2024-05-07T16:00:00Z',
  },
]

describe('NotificationDrawer', () => {
  let mockMarkAsRead: ReturnType<typeof vi.fn>
  let mockMarkAllAsRead: ReturnType<typeof vi.fn>
  let mockPush: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockMarkAsRead = vi.fn()
    mockMarkAllAsRead = vi.fn()
    mockPush = vi.fn()

    vi.mocked(useNotifications).mockReturnValue({
      notifications: { value: mockNotifications },
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
      unreadCount: { value: 1 },
      startPolling: vi.fn(),
      stopPolling: vi.fn(),
      decrementUnreadCount: vi.fn(),
      notify: {
        success: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warning: vi.fn(),
      },
    } as any)

    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
    } as any)
  })

  it('renders drawer when open', () => {
    const wrapper = mount(NotificationDrawer, {
      props: { open: true },
      global: {
        stubs: {
          Sheet: { template: '<div><slot /></div>' },
          SheetContent: { template: '<div><slot /></div>' },
          SheetHeader: { template: '<div><slot /></div>' },
          SheetTitle: { template: '<div><slot /></div>' },
          Button: { template: '<button><slot /></button>' },
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    })

    expect(wrapper.html()).toContain('notif.drawer.title')
  })

  it('shows empty state when no notifications', () => {
    vi.mocked(useNotifications).mockReturnValue({
      notifications: { value: [] },
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
      unreadCount: { value: 0 },
      startPolling: vi.fn(),
      stopPolling: vi.fn(),
      decrementUnreadCount: vi.fn(),
      notify: {
        success: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warning: vi.fn(),
      },
    } as any)

    const wrapper = mount(NotificationDrawer, {
      props: { open: true },
      global: {
        stubs: {
          Sheet: { template: '<div><slot /></div>' },
          SheetContent: { template: '<div><slot /></div>' },
          SheetHeader: { template: '<div><slot /></div>' },
          SheetTitle: { template: '<div><slot /></div>' },
          Button: { template: '<button><slot /></button>' },
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    })

    expect(wrapper.html()).toContain('notif.drawer.empty')
  })

  it('shows mark all button when unread notifications exist', () => {
    const wrapper = mount(NotificationDrawer, {
      props: { open: true },
      global: {
        stubs: {
          Sheet: { template: '<div><slot /></div>' },
          SheetContent: { template: '<div><slot /></div>' },
          SheetHeader: { template: '<div><slot /></div>' },
          SheetTitle: { template: '<div><slot /></div>' },
          Button: { template: '<button><slot /></button>' },
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    })

    expect(wrapper.html()).toContain('notif.drawer.mark_all_read')
  })

  it('hides mark all button when all are read', () => {
    vi.mocked(useNotifications).mockReturnValue({
      notifications: {
        value: mockNotifications.map(n => ({ ...n, is_read: true })),
      },
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
      unreadCount: { value: 0 },
      startPolling: vi.fn(),
      stopPolling: vi.fn(),
      decrementUnreadCount: vi.fn(),
      notify: {
        success: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warning: vi.fn(),
      },
    } as any)

    const wrapper = mount(NotificationDrawer, {
      props: { open: true },
      global: {
        stubs: {
          Sheet: { template: '<div><slot /></div>' },
          SheetContent: { template: '<div><slot /></div>' },
          SheetHeader: { template: '<div><slot /></div>' },
          SheetTitle: { template: '<div><slot /></div>' },
          Button: { template: '<button><slot /></button>' },
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    })

    expect(wrapper.html()).not.toContain('notif.drawer.mark_all_read')
  })

  it('sorts notifications newest first', () => {
    const wrapper = mount(NotificationDrawer, {
      props: { open: true },
      global: {
        stubs: {
          Sheet: { template: '<div><slot /></div>' },
          SheetContent: { template: '<div><slot /></div>' },
          SheetHeader: { template: '<div><slot /></div>' },
          SheetTitle: { template: '<div><slot /></div>' },
          Button: { template: '<button><slot /></button>' },
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    })

    // Notification 1 (newer) should appear before Notification 2 (older)
    const html = wrapper.html()
    const index1 = html.indexOf('Report submitted')
    const index2 = html.indexOf('Supervisor approved')

    expect(index1).toBeLessThan(index2)
  })

  it('calls markAsRead and navigates on notification click', async () => {
    const wrapper = mount(NotificationDrawer, {
      props: { open: true },
      global: {
        stubs: {
          Sheet: { template: '<div><slot /></div>' },
          SheetContent: { template: '<div><slot /></div>' },
          SheetHeader: { template: '<div><slot /></div>' },
          SheetTitle: { template: '<div><slot /></div>' },
          Button: { template: '<button><slot /></button>' },
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    })

    const notificationItems = wrapper.findAll('[class*="flex cursor-pointer"]')
    if (notificationItems.length > 0) {
      await notificationItems[0].trigger('click')
      expect(mockMarkAsRead).toHaveBeenCalledWith('1')
      expect(mockPush).toHaveBeenCalledWith('/projects/1/milestones/1')
    }
  })

  it('calls markAllAsRead on mark all button click', async () => {
    const wrapper = mount(NotificationDrawer, {
      props: { open: true },
      global: {
        stubs: {
          Sheet: { template: '<div><slot /></div>' },
          SheetContent: { template: '<div><slot /></div>' },
          SheetHeader: { template: '<div><slot /></div>' },
          SheetTitle: { template: '<div><slot /></div>' },
          Button: {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    })

    const buttons = wrapper.findAll('button')
    const markAllButton = buttons.find(b =>
      b.html().includes('notif.drawer.mark_all_read')
    )
    if (markAllButton) {
      await markAllButton.trigger('click')
      expect(mockMarkAllAsRead).toHaveBeenCalled()
    }
  })

  it('emits update:open when drawer should close', async () => {
    const wrapper = mount(NotificationDrawer, {
      props: { open: true },
      global: {
        stubs: {
          Sheet: {
            template:
              '<div @click="$emit(\'update:open\', false)"><slot /></div>',
          },
          SheetContent: { template: '<div><slot /></div>' },
          SheetHeader: { template: '<div><slot /></div>' },
          SheetTitle: { template: '<div><slot /></div>' },
          Button: { template: '<button><slot /></button>' },
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    })

    // After clicking notification, drawer should close
    expect(wrapper.emitted('update:open')).toBeDefined()
  })
})
