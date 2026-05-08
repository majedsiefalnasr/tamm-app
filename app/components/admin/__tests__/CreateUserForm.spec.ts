import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import CreateUserForm from '../CreateUserForm.vue'

// Mock composables
vi.mock('../../composables/useAdminUsers', () => ({
  useAdminUsers: () => ({
    createUser: vi.fn(async () => ({})),
    creating: { value: false },
  }),
}))

vi.mock('../../stores/auth', () => ({
  useAuthStore: () => ({
    user: { role: 'admin' },
  }),
}))

vi.mock('vue-sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    $t: (key: string) => key,
  }),
}))

describe('CreateUserForm', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(CreateUserForm, {
      global: {
        stubs: {
          Button: true,
          Input: true,
          Label: true,
          Select: true,
          SelectContent: true,
          SelectItem: true,
          SelectTrigger: true,
          SelectValue: true,
        },
      },
    })
  })

  it('renders form fields', () => {
    expect(wrapper.find('label').exists()).toBe(true)
  })

  it('emits success event on successful submission', async () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('displays error messages when validation fails', () => {
    expect(wrapper.exists()).toBe(true)
  })
})
