import { beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import * as Vue from 'vue'

const vueAutoImports = [
  'ref',
  'reactive',
  'computed',
  'watch',
  'watchEffect',
  'onMounted',
  'onUnmounted',
  'nextTick',
]

for (const key of vueAutoImports) {
  if (!(key in globalThis)) {
    ;(globalThis as Record<string, unknown>)[key] = (
      Vue as unknown as Record<string, unknown>
    )[key]
  }
}

beforeEach(() => {
  setActivePinia(createPinia())
})

vi.stubGlobal('useI18n', () => ({
  t: (key: string) => key,
  locale: { value: 'en' },
}))

vi.stubGlobal('useRoute', () => ({
  query: {},
  params: {},
  path: '/',
  fullPath: '/',
}))

vi.stubGlobal('useRouter', () => ({
  push: vi.fn(),
  replace: vi.fn(),
}))

vi.stubGlobal('navigateTo', vi.fn())

vi.stubGlobal(
  '$fetch',
  vi.fn(async () => ({ data: {} }))
)

vi.stubGlobal('useRuntimeConfig', () => ({
  public: {},
}))

// Nuxt's useCookie behaves like a Ref in stores/composables.
vi.stubGlobal('useCookie', () => ref(null))

vi.stubGlobal(
  'useApi',
  vi.fn(async () => ({
    success: true,
    data: {},
  }))
)

vi.stubGlobal('useRoleRoutes', () => ({
  getHomePageForRole: () => '/dashboard',
}))

vi.stubGlobal('useAdminProjects', () => ({
  getProjectProgress: () => ({ completed: 0, total: 0, percent: 0 }),
}))

vi.stubGlobal('useMilestones', () => ({
  approveMilestone: vi.fn(),
  rejectMilestone: vi.fn(),
}))

vi.stubGlobal('useAuthStore', () => ({
  user: { id: 'test-user', role: 'admin' },
  token: null,
  isLoading: false,
  logout: vi.fn(),
}))
