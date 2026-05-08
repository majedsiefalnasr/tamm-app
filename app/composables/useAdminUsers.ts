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
const USE_MOCK = true // Set to false when API is available

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
        } else {
          result = mockAdminUsers.filter(u => u.role === roleToFetch)
        }
      } else {
        // Real API implementation
        const params = new URLSearchParams()
        const roleToFetch = role || selectedRole.value
        if (roleToFetch !== 'all') {
          params.append('role', roleToFetch)
        }

        const queryString = params.toString()
        const url = queryString
          ? `${API_ENDPOINT}?${queryString}`
          : API_ENDPOINT

        const response = await useApi(url)
        result = response.data as User[]
      }

      users.value = result
    } catch (e) {
      error.value = (e as any)?.message || 'Failed to fetch users'
      users.value = []
    } finally {
      loading.value = false
    }
  }

  const creating = ref(false)

  const toggleUserStatus = async (userId: string) => {
    const user = users.value.find(u => u.id === userId)
    if (!user) return

    const previousStatus = user.status
    const newStatus = user.status === 'active' ? 'inactive' : 'active'

    // Optimistic update
    user.status = newStatus

    try {
      // API call would go here when endpoint is available
      if (!USE_MOCK) {
        await useApi(`/admin/users/${userId}`, {
          method: 'PUT',
          body: { status: newStatus },
        })
      }
    } catch (e) {
      // Rollback on error
      user.status = previousStatus
      error.value = (e as any)?.message || 'Failed to update user status'
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
        const response = await useApi('/users', {
          method: 'POST',
          body: { ...payload, password },
        })

        // Refetch users list to include new user
        await fetchUsers(
          selectedRole.value === 'all'
            ? undefined
            : (selectedRole.value as Role)
        )
      }

      return payload
    } catch (e: any) {
      if (e?.data?.error?.errors) {
        throw e
      }
      throw e
    } finally {
      creating.value = false
    }
  }

  const userCountByRole = computed(() => {
    const counts: Record<Role | 'all', number> = {
      all: users.value.length,
      admin: users.value.filter(u => u.role === 'admin').length,
      client: users.value.filter(u => u.role === 'client').length,
      contractor: users.value.filter(u => u.role === 'contractor').length,
      field_engineer: users.value.filter(u => u.role === 'field_engineer')
        .length,
      supervisor_engineer: users.value.filter(
        u => u.role === 'supervisor_engineer'
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
  }
}
