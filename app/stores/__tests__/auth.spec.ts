import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth'

// Mock $fetch
vi.mock('#app', async () => {
  const actual = await vi.importActual('#app')
  return {
    ...actual,
    useFetch: vi.fn(),
  }
})

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with empty state', () => {
    const auth = useAuthStore()
    expect(auth.user).toBeNull()
    expect(auth.token).toBeNull()
    expect(auth.isLoading).toBe(false)
    expect(auth.error).toBeNull()
    expect(auth.isAuthenticated).toBe(false)
  })

  it('updates state when login succeeds', async () => {
    const auth = useAuthStore()

    // Mock successful login
    global.$fetch = vi.fn().mockResolvedValueOnce({
      success: true,
      data: {
        token: 'mock-token',
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          phone: null,
          role: 'client',
          status: 'active',
        },
      },
    })

    await auth.login('test@example.com', 'password123')

    expect(auth.token).toBe('mock-token')
    expect(auth.user?.email).toBe('test@example.com')
    expect(auth.isAuthenticated).toBe(true)
    expect(auth.error).toBeNull()
  })

  it('clears state on logout', async () => {
    const auth = useAuthStore()
    auth.token = 'mock-token'
    auth.user = {
      id: '1',
      name: 'Test',
      email: 'test@example.com',
      phone: null,
      role: 'client',
      status: 'active',
    }

    global.$fetch = vi.fn().mockResolvedValueOnce({})

    await auth.logout()

    expect(auth.token).toBeNull()
    expect(auth.user).toBeNull()
    expect(auth.error).toBeNull()
  })

  it('sets error on login failure', async () => {
    const auth = useAuthStore()

    global.$fetch = vi
      .fn()
      .mockRejectedValueOnce(new Error('Invalid credentials'))

    try {
      await auth.login('test@example.com', 'wrong')
    } catch {}

    expect(auth.error).toBe('Invalid credentials')
    expect(auth.token).toBeNull()
    expect(auth.user).toBeNull()
  })

  it('shows loading state during login', async () => {
    const auth = useAuthStore()

    global.$fetch = vi
      .fn()
      .mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )

    const promise = auth.login('test@example.com', 'password123')
    expect(auth.isLoading).toBe(true)

    await promise.catch(() => {})
    expect(auth.isLoading).toBe(false)
  })
})
