import { defineStore } from 'pinia'

export interface AuthUser {
  id: string
  name: string
  email: string
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
    maxAge: 60 * 60 * 24 * 7,
  })
  const user = ref<AuthUser | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const statusCode = ref<number | null>(null)

  /** Deduplicate concurrent `/auth/me` when middleware + plugins both call `init()` */
  let initInflight: Promise<void> | null = null

  const isAuthenticated = computed(() => !!token.value && !!user.value)

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
        user.value = response.data.user

        // Redirect to role-based home page (not hardcoded /dashboard)
        const { getHomePageForRole } = useRoleRoutes()
        const homePage = getHomePageForRole(response.data.user.role)
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
            user.value = response.data
          } else {
            token.value = null
            user.value = null
          }
        } catch {
          token.value = null
          user.value = null
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
  }
})
