import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Topbar from '~/components/layout/Topbar.vue'
import { useRoute } from 'vue-router'

vi.mock('vue-router')
vi.mock('~/components/layout/NotificationBell.vue', () => ({
  default: {
    name: 'NotificationBell',
    template: '<div class="notification-bell-stub" />',
  },
}))
vi.mock('~/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    user: { role: 'client' as const },
  })),
}))

describe('Topbar (app shell)', () => {
  beforeEach(() => {
    vi.mocked(useRoute).mockReturnValue({
      path: '/dashboard',
      meta: {},
    } as ReturnType<typeof useRoute>)
  })

  it('uses design-spec header height h-20 for shell alignment', () => {
    const wrapper = mount(Topbar, {
      global: {
        stubs: {
          NuxtLink: { template: '<a><slot /></a>' },
          SidebarTrigger: { template: '<button type="button">toggle</button>' },
          Separator: { template: '<div />' },
          Breadcrumb: { template: '<nav><slot /></nav>' },
          BreadcrumbList: { template: '<ol><slot /></ol>' },
          BreadcrumbItem: { template: '<li><slot /></li>' },
          BreadcrumbLink: { template: '<span><slot /></span>' },
          BreadcrumbPage: { template: '<span><slot /></span>' },
          BreadcrumbSeparator: { template: '<span />' },
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    })

    const header = wrapper.find('header')
    expect(header.classes()).toContain('h-20')
  })
})
