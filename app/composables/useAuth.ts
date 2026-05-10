import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'

/**
 * Thin wrapper around the auth store for components that prefer a composable API.
 * `auth` is an alias for `user` (legacy naming in a few components).
 */
export function useAuth() {
  const store = useAuthStore()
  const { user, token, isLoading, error, statusCode, isAuthenticated } =
    storeToRefs(store)

  return {
    user,
    auth: user,
    token,
    isLoading,
    error,
    statusCode,
    isAuthenticated,
    login: store.login,
    logout: store.logout,
    init: store.init,
  }
}
