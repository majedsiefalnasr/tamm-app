/**
 * useApi - Composable for API requests with automatic Bearer token injection and 401 auto-logout
 * Wraps $fetch with auth state management and error handling
 */

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

export const useApi = async <T = any>(
  url: string,
  options?: {
    method?: string
    body?: any
    headers?: Record<string, string>
    [key: string]: any
  }
): Promise<ApiResponse<T>> => {
  const auth = useAuthStore()

  try {
    // Prepare request headers with Bearer token
    const headers = {
      ...options?.headers,
      'Content-Type': 'application/json',
    }

    // Add Bearer token if user is authenticated
    if (auth.token) {
      headers.Authorization = `Bearer ${auth.token}`
    }

    // Make the request
    const response = await $fetch<ApiResponse<T>>(`/api/v1${url}`, {
      ...options,
      headers,
    })

    return response
  } catch (error: any) {
    const statusCode =
      error?.statusCode || error?.status || error?.response?.status

    // Handle 401 Unauthorized - trigger auto-logout
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
