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

type ApiUserStatus =
  | 'active'
  | 'suspended'
  | 'pending_verification'
  | 'banned'
  | 'inactive'

const API_ENDPOINT = '/users'
// Admin users must always use real backend persistence.
const USE_MOCK = false
// List fetch: 10s (may load many users); mutation: 5s (faster feedback for user creation)
const TIMEOUT_MS = {
  fetch: 10000,
  mutate: 5000,
}

// Shared module state so all consumers stay in sync (list, dialogs, menus).
const allUsersState = ref<User[]>([])
const loadingState = ref(true)
const errorState = ref<string | null>(null)
const creatingState = ref(false)
const togglingStatusIdsState = ref<Set<string>>(new Set())
const hasFetchedUsersState = ref(false)

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

function normalizeUser(raw: any): User {
  const createdAtRaw = raw?.created_at ?? raw?.createdAt ?? raw?.created
  const updatedAtRaw = raw?.updated_at ?? raw?.updatedAt ?? createdAtRaw
  const rawStatus = String(raw?.status ?? '').toLowerCase() as ApiUserStatus
  const uiStatus: User['status'] =
    rawStatus === 'active' ? 'active' : 'inactive'
  return {
    id: String(raw?.id ?? ''),
    name: String(raw?.name ?? ''),
    email: String(raw?.email ?? ''),
    phone: raw?.phone == null ? null : String(raw.phone),
    role: (raw?.role ?? 'client') as Role,
    status: uiStatus,
    created_at:
      typeof createdAtRaw === 'string'
        ? createdAtRaw
        : new Date().toISOString(),
    updated_at:
      typeof updatedAtRaw === 'string'
        ? updatedAtRaw
        : new Date().toISOString(),
  }
}

function toApiStatus(uiStatus: User['status']): ApiUserStatus {
  return uiStatus === 'active' ? 'active' : 'suspended'
}

function isSamePhone(a: string | null, b: string | null): boolean {
  return (a ?? '') === (b ?? '')
}

function extractUsersList(payload: any): User[] {
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : []
  return list.map(normalizeUser)
}

function assertApiSuccess(response: any, fallbackMessage: string): void {
  if (response?.success === false) {
    const message =
      response?.error?.message || response?.message || fallbackMessage
    throw new Error(message)
  }
}

async function fetchAllUsersFromApi(): Promise<User[]> {
  const first = await withTimeout(useApi(API_ENDPOINT), TIMEOUT_MS.fetch)
  const firstPageUsers = extractUsersList(first.data)

  const pagination = (first as any)?.meta?.pagination
  const lastPage = Number(pagination?.last_page ?? 1)
  const currentPage = Number(pagination?.current_page ?? 1)
  const limit = Number(pagination?.limit ?? 50)

  if (!Number.isFinite(lastPage) || lastPage <= currentPage) {
    return firstPageUsers
  }

  const allUsers = [...firstPageUsers]
  for (let page = currentPage + 1; page <= lastPage; page++) {
    const pageResponse = await withTimeout(
      useApi(`${API_ENDPOINT}?page=${page}&limit=${limit}`),
      TIMEOUT_MS.fetch
    )
    allUsers.push(...extractUsersList(pageResponse.data))
  }

  return allUsers
}

async function fetchUserByIdFromApi(userId: string): Promise<User | null> {
  const response = await withTimeout(
    useApi(`/users/${userId}`),
    TIMEOUT_MS.fetch
  )
  assertApiSuccess(response, 'Failed to fetch user')
  const payload = response?.data
  const raw =
    payload && !Array.isArray(payload) && typeof payload === 'object'
      ? ((payload as any).data ?? payload)
      : null
  return raw ? normalizeUser(raw) : null
}

export function useAdminUsers(initialRole?: Role | 'all' | null) {
  /** Full list from API/mock — tab counts and filters derive from this */
  const allUsers = allUsersState
  /** True until first onMounted fetch completes */
  const loading = loadingState
  const error = errorState
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
        result = await fetchAllUsersFromApi()
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

  const creating = creatingState

  const toggleUserStatus = async (userId: string) => {
    const user = allUsers.value.find(u => u.id === userId)
    if (!user) {
      error.value = 'User not found'
      return
    }

    const previousStatus = user.status
    const newStatus = user.status === 'active' ? 'inactive' : 'active'
    const apiStatus = toApiStatus(newStatus)

    // Guard concurrent toggles for same user
    if (togglingStatusIdsState.value.has(userId)) {
      return
    }

    togglingStatusIdsState.value.add(userId)

    // Optimistic update
    user.status = newStatus

    try {
      // API call would go here when endpoint is available
      if (!USE_MOCK) {
        const response = await withTimeout(
          useApi(`/users/${userId}`, {
            method: 'PUT',
            body: { status: apiStatus },
          }),
          TIMEOUT_MS.mutate
        )
        assertApiSuccess(response, 'Failed to update user status')
        const persistedUser = await fetchUserByIdFromApi(userId)
        if (persistedUser) {
          if (persistedUser.status !== newStatus) {
            throw new Error('User status was not persisted by backend')
          }
          Object.assign(user, persistedUser)
        } else if (response?.data) {
          Object.assign(user, normalizeUser(response.data))
        }
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
      throw new Error(message)
    } finally {
      togglingStatusIdsState.value.delete(userId)
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
        assertApiSuccess(response, 'Failed to create user')
        if (response?.data) {
          allUsers.value.unshift(normalizeUser(response.data))
        } else {
          // Fallback when backend returns success without user payload.
          await fetchUsers()
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
        const response = await withTimeout(
          useApi(`/users/${userId}`, {
            method: 'PUT',
            body: payload,
          }),
          TIMEOUT_MS.mutate
        )
        assertApiSuccess(response, 'Failed to update user')
        const persistedUser = await fetchUserByIdFromApi(userId)
        if (persistedUser) {
          const expectedPhone = payload.phone ?? null
          const persistedRole = persistedUser.role as Role
          const didPersist =
            persistedUser.name === payload.name &&
            persistedUser.email === payload.email &&
            persistedRole === payload.role &&
            isSamePhone(persistedUser.phone, expectedPhone)
          if (!didPersist) {
            throw new Error('User changes were not persisted by backend')
          }
          Object.assign(user, persistedUser)
        } else if (response?.data) {
          Object.assign(user, normalizeUser(response.data))
        }
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
    if (!hasFetchedUsersState.value) {
      hasFetchedUsersState.value = true
      fetchUsers()
    }
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
    togglingStatusIds: readonly(togglingStatusIdsState),
    createUser,
    updateUser,
    refetch: () => fetchUsers(),
    fetchEngineersByRole,
    getContractorsList,
  }
}
