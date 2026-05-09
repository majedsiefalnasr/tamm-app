import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { DashboardSummary, DashboardResponse } from '~/shared/types/admin'
import { mockDashboardData } from './__mocks__/admin-dashboard'

export function useAdminDashboard() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const data = ref<DashboardSummary | null>(null)
  let abortController: AbortController | null = null

  // TODO: replace with environment variable when API is ready
  const USE_MOCK = import.meta.env.DEV && !import.meta.env.VITE_API_READY

  const bannerCounts = computed(() => ({
    newProjects: data.value?.urgent_actions?.new_projects ?? 0,
    pendingPayments: data.value?.urgent_actions?.pending_payments ?? 0,
    disputes: data.value?.urgent_actions?.disputes ?? 0,
  }))

  const stats = computed(() => [
    {
      title: 'admin.dashboard.stats.active_projects',
      value: data.value?.summary_stats?.active_projects ?? 0,
      icon: 'FolderOpen',
      tone: 'primary' as const,
      link: '/admin/projects?status=active',
    },
    {
      title: 'admin.dashboard.stats.registered_contractors',
      value: data.value?.summary_stats?.total_contractors ?? 0,
      icon: 'Users',
      tone: 'default' as const,
      link: '/admin/users?role=contractor',
    },
    {
      title: 'admin.dashboard.stats.total_tracked_value',
      value: data.value?.summary_stats?.total_tracked_value ?? 0,
      icon: 'TrendingUp',
      tone: 'accent' as const,
      isCurrency: true,
      link: '/admin/payments',
    },
  ])

  const disputesStat = computed(() => {
    if (
      !data.value?.summary_stats ||
      !data.value.summary_stats.open_disputes ||
      data.value.summary_stats.open_disputes === 0
    ) {
      return null
    }
    return {
      title: 'admin.dashboard.stats.open_disputes',
      value: data.value.summary_stats.open_disputes,
      icon: 'AlertCircle',
      tone: 'danger' as const,
      link: '/admin/disputes',
    }
  })

  async function fetchDashboard() {
    loading.value = true
    error.value = null
    abortController = new AbortController()

    try {
      if (USE_MOCK) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500))
        data.value = mockDashboardData
      } else {
        const response = await useApi<DashboardResponse>('/admin/dashboard', {
          method: 'GET',
          timeout: 10000,
          signal: abortController.signal,
        })

        if (!response || !response.data) {
          throw new Error('Invalid API response: missing data')
        }

        data.value = response.data
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was cancelled, don't show error
        return
      }

      const { $t } = useI18n()
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'

      if (
        errorMessage.includes('401') ||
        errorMessage.includes('Unauthorized')
      ) {
        error.value = $t('errors.unauthorized')
      } else if (errorMessage.includes('timeout')) {
        error.value = $t('errors.timeout')
      } else if (errorMessage.includes('Failed to fetch')) {
        error.value = $t('errors.network')
      } else {
        error.value = $t('errors.server')
      }

      console.error('Dashboard fetch error:', err)
    } finally {
      loading.value = false
    }
  }

  function retry() {
    error.value = null
    fetchDashboard()
  }

  // Load data on composable creation
  onMounted(() => {
    fetchDashboard()
  })

  // Clean up on unmount
  onUnmounted(() => {
    if (abortController) {
      abortController.abort()
    }
  })

  return {
    loading,
    error,
    data,
    bannerCounts,
    stats,
    disputesStat,
    fetchDashboard,
    retry,
  }
}
