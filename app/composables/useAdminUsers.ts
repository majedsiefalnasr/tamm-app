import { ref, computed, readonly, watch, onMounted } from 'vue'
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
const API_TIMEOUT_MS = 10000 // 10 second timeout for API calls

// Helper to add timeout to async operations
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
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
  const users = ref<User[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const selectedRole = ref<Role | 'all'>(initialRole || 'all')

  const fetchUsers = async (role?: Role | 'all' | null) => {
    loading.value = true
    error.value = null
    try {
      let result: User[] = []

      if (USE_MOCK) {
        // Mock implementation
        const roleToFetch = role || selectedRole.value
        if (roleToFetch === 'all') {
          result = mockAdminUsers
        } else if (roleToFetch === 'engineer') {
          // Union filter: both field_engineer and supervisor_engineer
          result = mockAdminUsers.filter(
            u => u.role === 'field_engineer' || u.role === 'supervisor_engineer'
          )
        } else {
          result = mockAdminUsers.filter(u => u.role === roleToFetch)
        }
      } else {
        // Real API implementation
        const params = new URLSearchParams()
        const roleToFetch = role || selectedRole.value
        if (roleToFetch !== 'all') {
          params.append(
            'role',
            roleToFetch === 'engineer' ? 'engineer' : roleToFetch
          )
        }

        const queryString = params.toString()
        const url = queryString
          ? `${API_ENDPOINT}?${queryString}`
          : API_ENDPOINT

        const response = await withTimeout(useApi(url), API_TIMEOUT_MS)
        result = response.data as User[]
      }

      users.value = result
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to fetch users'
      error.value = message
      users.value = []
    } finally {
      loading.value = false
    }
  }

  const creating = ref(false)

  const toggleUserStatus = async (userId: string) => {
    const user = users.value.find(u => u.id === userId)
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
          API_TIMEOUT_MS
        )
      }
    } catch (e) {
      // Rollback on error
      user.status = previousStatus
      const message =
        e instanceof Error ? e.message : 'Failed to update user status'
      error.value = message
    }
  }

  const createUser = async (payload: CreateUserPayload) => {
    creating.value = true
    error.value = null
    try {
      // Generate random password (16 chars) — backend will override with auto-generated
      const password = Math.random().toString(36).slice(2, 18)

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
        users.value.unshift(newUser)
      } else {
        // Real API implementation
        const response = await withTimeout(
          useApi('/users', {
            method: 'POST',
            body: { ...payload, password },
          }),
          API_TIMEOUT_MS
        )

        // Refetch users list to include new user
        await fetchUsers(
          selectedRole.value === 'all'
            ? undefined
            : (selectedRole.value as Role)
        )
      }

      return payload
    } finally {
      creating.value = false
    }
  }

  const userCountByRole = computed(() => {
    const counts: Record<string, number> = {
      all: users.value.length,
      admin: users.value.filter(u => u.role === 'admin').length,
      client: users.value.filter(u => u.role === 'client').length,
      contractor: users.value.filter(u => u.role === 'contractor').length,
      engineer: users.value.filter(
        u => u.role === 'field_engineer' || u.role === 'supervisor_engineer'
      ).length,
      super_admin: users.value.filter(u => u.role === 'super_admin').length,
    }
    return counts
  })

  // Fetch on mount
  onMounted(() => {
    fetchUsers()
  })

  // Watch for role changes
  watch(selectedRole, newRole => {
    fetchUsers(newRole)
  })

  const fetchEngineersByRole = async (
    role: Role
  ): Promise<Array<{ id: string; name: string }>> => {
    try {
      const filtered = users.value.filter(u => u.role === role)
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
      const hasContractors = users.value.some(u => u.role === 'contractor')
      if (users.value.length === 0 || !hasContractors) {
        await fetchUsers('all')
      }
      const contractors = users.value.filter(u => u.role === 'contractor')
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
    users: readonly(users),
    loading: readonly(loading),
    error: readonly(error),
    selectedRole,
    userCountByRole,
    creating: readonly(creating),
    fetchUsers,
    toggleUserStatus,
    createUser,
    refetch: () => fetchUsers(),
    fetchEngineersByRole,
    getContractorsList,
  }
}
