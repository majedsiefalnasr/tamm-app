import { defineStore } from 'pinia'
import { normalizeRole } from '~/utils/roleRoutes'

export interface AuthUser {
  id: number | string
  name: string
  email: string | null
  phone: string | null
  role: string
  status: string
  avatar_url?: string | null
}

export interface AuthState {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  error: string | null
  statusCode: number | null
}

export const useAuthStore = defineStore('auth', () => {
  const token = useCookie<string | null>('auth_token', {
    // refresh token TTL is two weeks (backend contract)
    maxAge: 60 * 60 * 24 * 14,
  })
  const user = ref<AuthUser | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const statusCode = ref<number | null>(null)

  /** Deduplicate concurrent `/auth/me` when middleware + plugins both call `init()` */
  let initInflight: Promise<void> | null = null
  let refreshInflight: Promise<void> | null = null
  let proactiveRefreshTimer: ReturnType<typeof setTimeout> | null = null

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  const normalizeAuthUser = (raw: any): AuthUser => {
    return {
      ...raw,
      role: normalizeRole(raw?.role),
    }
  }

  const clearRefreshTimer = () => {
    if (!import.meta.client) return
    if (proactiveRefreshTimer) {
      clearTimeout(proactiveRefreshTimer)
      proactiveRefreshTimer = null
    }
  }

  const scheduleProactiveRefresh = () => {
    if (!import.meta.client || !token.value) return
    clearRefreshTimer()
    proactiveRefreshTimer = setTimeout(
      () => {
        refreshSession().catch(() => {
          // Silent failure fallback: request-time 401 path still handles logout.
        })
      },
      // Backend: access token 1h — refresh at 55m or on 401 (see docs/BACKEND_BLOCKERS.md).
      55 * 60 * 1000
    )
  }

  const refreshSession = async () => {
    if (!token.value) return
    if (refreshInflight) return refreshInflight

    refreshInflight = (async () => {
      try {
        const response = await useApi('/auth/refresh', {
          method: 'POST',
          skipAuthRefresh: true,
        })
        if (response.success && response.data?.token) {
          token.value = response.data.token
          if (response.data.user) {
            user.value = normalizeAuthUser(response.data.user)
          }
          scheduleProactiveRefresh()
          return
        }
      } catch {
        // fall through to clear auth state
      }

      token.value = null
      user.value = null
      clearRefreshTimer()
    })().finally(() => {
      refreshInflight = null
    })

    await refreshInflight
  }

  const login = async (email: string, password: string) => {
    isLoading.value = true
    error.value = null
    statusCode.value = null
    try {
      const response = await useApi('/auth/login', {
        method: 'POST',
        body: { identifier: email, password },
      })

      if (response.success) {
        token.value = response.data.token
        user.value = normalizeAuthUser(response.data.user)
        scheduleProactiveRefresh()

        // Redirect to role-based home page (not hardcoded /dashboard)
        const { getHomePageForRole } = useRoleRoutes()
        const homePage = getHomePageForRole(user.value.role)
        await navigateTo(homePage)

        return response.data
      } else {
        throw new Error(response.error?.message || 'Login failed')
      }
    } catch (err: any) {
      error.value = err.message || 'An error occurred during login'
      statusCode.value = err.statusCode || err.status || null
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    isLoading.value = true
    try {
      await useApi('/auth/logout', { method: 'POST' })
    } finally {
      token.value = null
      user.value = null
      error.value = null
      statusCode.value = null
      clearRefreshTimer()
      isLoading.value = false
      await navigateTo('/login')
    }
  }

  const init = async () => {
    if (!token.value || user.value) {
      return
    }
    if (!initInflight) {
      initInflight = (async () => {
        isLoading.value = true
        try {
          const response = await useApi('/auth/me')
          if (response.success) {
            user.value = normalizeAuthUser(response.data)
            scheduleProactiveRefresh()
          } else {
            token.value = null
            user.value = null
            clearRefreshTimer()
          }
        } catch {
          token.value = null
          user.value = null
          clearRefreshTimer()
        } finally {
          isLoading.value = false
        }
      })().finally(() => {
        initInflight = null
      })
    }
    await initInflight
  }

  return {
    user,
    token,
    isLoading,
    error,
    statusCode,
    isAuthenticated,
    login,
    logout,
    init,
    refreshSession,
  }
})
