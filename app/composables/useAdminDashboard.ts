import { ref, computed, onMounted } from 'vue'
import type { DashboardSummary, DashboardResponse } from '~/shared/types/admin'
import { mockDashboardData } from './__mocks__/admin-dashboard'

export function useAdminDashboard() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const data = ref<DashboardSummary | null>(null)

  const USE_MOCK = true // TODO: replace with real API when endpoint available

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
    if (!data.value || data.value.summary_stats.open_disputes === 0) {
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

    try {
      if (USE_MOCK) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500))
        data.value = mockDashboardData
      } else {
        const response = await $fetch<DashboardResponse>(
          '/api/admin/dashboard',
          {
            method: 'GET',
          }
        )

        if (response.success && response.data) {
          data.value = response.data
        } else {
          error.value = 'Failed to load dashboard data'
        }
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err)
      error.value = 'Error loading dashboard'
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
