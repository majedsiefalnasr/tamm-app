/**
 * useApi - Composable for API requests with automatic Bearer token injection and 401 auto-logout
 * Wraps $fetch with auth state management and error handling
 */
import { normalizeRole } from '~/utils/roleRoutes'

export interface ApiResponse<T = any> {
  success: boolean
  data: T
  error?: {
    code: string
    message: string
  }
  message?: string
}

export interface ApiError extends Error {
  statusCode?: number
  status?: number
  data?: any
}

let refreshInFlight: Promise<boolean> | null = null

/**
 * Resolve URL for `/api/v1/...` requests.
 *
 * - `NUXT_PUBLIC_API_BASE` set (any mode): `{base}/api/v1/...` — use your deployed API origin
 *   (e.g. `https://tamm.ultimate-dev2.com`). Swagger lives under `/api/documentation`, not in this value.
 * - `NUXT_PUBLIC_API_BASE` empty **and** `import.meta.dev`: same-origin `/api/v1/...` → Vite/Nitro proxy.
 * - Empty **and** production build: same-origin (reverse-proxy setups).
 *
 * Remote API from localhost requires Laravel CORS to allow your dev origin (`http://localhost:3000`, etc.).
 */
export const resolveApiUrl = (pathAfterV1: string): string => {
  const config = useRuntimeConfig()
  const base = String(config.public.apiBase ?? '')
    .trim()
    .replace(/\/+$/, '')
  const path = `/api/v1${pathAfterV1.startsWith('/') ? '' : '/'}${pathAfterV1}`

  if (import.meta.dev && !base) {
    return path
  }

  return base ? `${base}${path}` : path
}

export const useApi = async <T = any>(
  url: string,
  options?: {
    method?: string
    body?: any
    headers?: Record<string, string>
    skipAuthRefresh?: boolean
    [key: string]: any
  }
): Promise<ApiResponse<T>> => {
  const auth = useAuthStore()
  const requestUrl = resolveApiUrl(url)

  const buildHeaders = (): Record<string, string> => {
    const headers = {
      ...options?.headers,
      'Content-Type': 'application/json',
    }
    if (auth.token) {
      headers.Authorization = `Bearer ${auth.token}`
    }
    return headers
  }

  const sendRequest = async (): Promise<ApiResponse<T>> => {
    return await $fetch<ApiResponse<T>>(requestUrl, {
      ...options,
      headers: buildHeaders(),
    })
  }

  const attemptTokenRefresh = async (): Promise<boolean> => {
    if (refreshInFlight) return refreshInFlight

    refreshInFlight = (async () => {
      try {
        const refreshResponse = await $fetch<
          ApiResponse<{ token: string; user?: any }>
        >(resolveApiUrl('/auth/refresh'), {
          method: 'POST',
          headers: buildHeaders(),
        })

        if (refreshResponse?.success && refreshResponse?.data?.token) {
          auth.token = refreshResponse.data.token
          if (refreshResponse.data.user) {
            const nextUser = { ...refreshResponse.data.user }
            nextUser.role = normalizeRole(nextUser.role)
            auth.user = nextUser
          }
          return true
        }
      } catch {
        // No-op: handled by false return.
      } finally {
        refreshInFlight = null
      }

      return false
    })()

    return refreshInFlight
  }

  try {
    const response = await sendRequest()

    return response
  } catch (error: any) {
    const statusCode =
      error?.statusCode || error?.status || error?.response?.status

    // Handle 401 Unauthorized - trigger auto-logout
    if (statusCode === 401 && !options?.skipAuthRefresh) {
      const refreshed = await attemptTokenRefresh()
      if (refreshed) {
        try {
          return await sendRequest()
        } catch (retryError: any) {
          const retryStatus =
            retryError?.statusCode ||
            retryError?.status ||
            retryError?.response?.status
          if (retryStatus !== 401) {
            const apiError = new Error(
              retryError.message || 'API request failed'
            ) as ApiError
            apiError.statusCode = retryStatus
            apiError.status = retryStatus
            apiError.data = retryError.data
            throw apiError
          }
        }
      }
    }

    if (statusCode === 401) {
      // Clear auth state
      auth.token = null
      auth.user = null
      auth.error = null

      // Redirect to login
      await navigateTo('/login')

      // Re-throw with proper error type
      const apiError = new Error('Unauthorized - session expired') as ApiError
      apiError.statusCode = 401
      apiError.data = error.data
      throw apiError
    }

    // For other errors, re-throw with status code attached
    const apiError = new Error(
      error.message || 'API request failed'
    ) as ApiError
    apiError.statusCode = statusCode
    apiError.status = statusCode
    apiError.data = error.data
    throw apiError
  }
}
