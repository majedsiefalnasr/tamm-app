import { ref, computed, readonly, onMounted } from 'vue'
import type { Role, CreateUserPayload } from '#shared/types/user'
import { mockAdminUsers } from './__mocks__/admin-users'

export interface User {
  id: string
  name: string
  email: string
  phone: string | null
  role: Role
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

const API_ENDPOINT = '/admin/users'
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'
// List fetch: 10s (may load many users); mutation: 5s (faster feedback for user creation)
const TIMEOUT_MS = {
  fetch: 10000,
  mutate: 5000,
}

// Helper to add timeout to async operations with configurable durations
function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = TIMEOUT_MS.fetch
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Operation timed out after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ])
}

export function useAdminUsers(initialRole?: Role | 'all' | null) {
  /** Full list from API/mock — tab counts and filters derive from this */
  const allUsers = ref<User[]>([])
  /** True until first onMounted fetch completes */
  const loading = ref(true)
  const error = ref<string | null>(null)
  const selectedRole = ref<Role | 'all'>(initialRole || 'all')

  const users = computed<User[]>(() => {
    const role = selectedRole.value
    const list = allUsers.value
    if (role === 'all') return list
    if (role === 'engineer') {
      return list.filter(
        u => u.role === 'field_engineer' || u.role === 'supervisor_engineer'
      )
    }
    return list.filter(u => u.role === role)
  })

  /** Always loads the complete user list; role tabs filter client-side so counts stay stable */
  const fetchUsers = async () => {
    loading.value = true
    error.value = null
    try {
      let result: User[] = []

      if (USE_MOCK) {
        result = [...mockAdminUsers]
      } else {
        const response = await withTimeout(
          useApi(API_ENDPOINT),
          TIMEOUT_MS.fetch
        )
        result = response.data as User[]
      }

      allUsers.value = result
    } catch (e) {
      const message =
        e instanceof Error && e.message
          ? e.message
          : typeof e === 'string'
            ? e
            : 'Failed to fetch users'
      error.value = message
      allUsers.value = []
    } finally {
      loading.value = false
    }
  }

  const creating = ref(false)

  const toggleUserStatus = async (userId: string) => {
    const user = allUsers.value.find(u => u.id === userId)
    if (!user) {
      error.value = 'User not found'
      return
    }

    const previousStatus = user.status
    const newStatus = user.status === 'active' ? 'inactive' : 'active'

    // Optimistic update
    user.status = newStatus

    try {
      // API call would go here when endpoint is available
      if (!USE_MOCK) {
        await withTimeout(
          useApi(`/admin/users/${userId}`, {
            method: 'PUT',
            body: { status: newStatus },
          }),
          TIMEOUT_MS.mutate
        )
      }
    } catch (e) {
      // Rollback on error
      user.status = previousStatus
      const message =
        e instanceof Error && e.message
          ? e.message
          : typeof e === 'string'
            ? e
            : 'Failed to update user status'
      error.value = message
    }
  }

  const createUser = async (payload: CreateUserPayload) => {
    creating.value = true
    error.value = null
    try {
      if (USE_MOCK) {
        // Mock implementation
        const newUser: User = {
          id: `user-${Date.now()}`,
          ...payload,
          phone: payload.phone || null,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        allUsers.value.unshift(newUser)
      } else {
        // Real API implementation
        // Backend auto-generates password and emails user — don't send password in request
        const response = await withTimeout(
          useApi('/users', {
            method: 'POST',
            body: payload,
          }),
          TIMEOUT_MS.mutate
        )

        // Refetch users list to include new user
        try {
          await fetchUsers()
        } catch (refetchError) {
          // Log refetch failure but don't block success; user was created server-side
          console.warn(
            'Failed to refetch users after creation (user was created):',
            refetchError
          )
        }
      }

      return payload
    } catch (e: any) {
      // Preserve error for form-level error handling (422 validation, etc.)
      if (e?.data?.error?.errors) {
        throw e
      }
      throw e
    } finally {
      creating.value = false
    }
  }

  const updateUser = async (userId: string, payload: CreateUserPayload) => {
    creating.value = true
    error.value = null
    const user = allUsers.value.find(u => u.id === userId)
    if (!user) {
      creating.value = false
      throw new Error('User not found')
    }

    const previousUser = { ...user }
    user.name = payload.name
    user.email = payload.email
    user.role = payload.role as Role
    user.phone = payload.phone || null
    user.updated_at = new Date().toISOString()

    try {
      if (!USE_MOCK) {
        await withTimeout(
          useApi(`/admin/users/${userId}`, {
            method: 'PUT',
            body: payload,
          }),
          TIMEOUT_MS.mutate
        )
      }
      return user
    } catch (e) {
      Object.assign(user, previousUser)
      throw e
    } finally {
      creating.value = false
    }
  }

  const userCountByRole = computed(() => {
    const list = allUsers.value
    const counts: Record<Role | 'all' | 'engineer', number> = {
      all: list.length,
      admin: list.filter(u => u.role === 'admin').length,
      client: list.filter(u => u.role === 'client').length,
      contractor: list.filter(u => u.role === 'contractor').length,
      field_engineer: list.filter(u => u.role === 'field_engineer').length,
      supervisor_engineer: list.filter(u => u.role === 'supervisor_engineer')
        .length,
      engineer: list.filter(
        u => u.role === 'field_engineer' || u.role === 'supervisor_engineer'
      ).length,
      super_admin: list.filter(u => u.role === 'super_admin').length,
    }
    return counts
  })

  // Fetch on mount
  onMounted(() => {
    fetchUsers()
  })

  const fetchEngineersByRole = async (
    role: Role
  ): Promise<Array<{ id: string; name: string }>> => {
    try {
      // Ensure users are loaded before filtering (in case called before onMounted completes)
      if (allUsers.value.length === 0) {
        await fetchUsers()
      }
      const filtered = allUsers.value.filter(u => u.role === role)
      return filtered.map(u => ({
        id: u.id,
        name: u.name,
      }))
    } catch (error) {
      console.error(`Failed to fetch ${role} engineers:`, error)
      return []
    }
  }

  const getContractorsList = async (): Promise<
    Array<{ id: string; name: string; email: string }>
  > => {
    try {
      // Ensure contractors are loaded (only fetch if we don't have any users yet)
      const hasContractors = allUsers.value.some(u => u.role === 'contractor')
      if (allUsers.value.length === 0 || !hasContractors) {
        await fetchUsers()
      }
      const contractors = allUsers.value.filter(u => u.role === 'contractor')
      return contractors.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
      }))
    } catch (error) {
      console.error('Failed to fetch contractors:', error)
      return []
    }
  }

  return {
    users,
    loading: readonly(loading),
    error: readonly(error),
    selectedRole,
    userCountByRole,
    creating: readonly(creating),
    fetchUsers,
    toggleUserStatus,
    createUser,
    updateUser,
    refetch: () => fetchUsers(),
    fetchEngineersByRole,
    getContractorsList,
  }
}
