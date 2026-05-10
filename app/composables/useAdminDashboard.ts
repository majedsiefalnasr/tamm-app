import { ref, computed, onMounted, onUnmounted } from 'vue'
import type {
  DashboardSummary,
  DashboardResponse,
  ActionQueues,
  RecentEvent,
  SuperAdminDashboardFlags,
} from '~/shared/types/admin'
import { mockDashboardData } from './__mocks__/admin-dashboard'

function normalizeDashboardPayload(raw: DashboardSummary): DashboardSummary {
  const ss = raw.summary_stats ?? {
    active_projects: 0,
    milestones_pending_review: 0,
    payments_ready_for_release: 0,
    projects_awaiting_contractor_selection: 0,
    new_users_this_month: 0,
    open_disputes: 0,
  }
  return {
    ...raw,
    summary_stats: {
      active_projects: ss.active_projects ?? 0,
      milestones_pending_review: ss.milestones_pending_review ?? 0,
      payments_ready_for_release: ss.payments_ready_for_release ?? 0,
      projects_awaiting_contractor_selection:
        ss.projects_awaiting_contractor_selection ?? 0,
      new_users_this_month: ss.new_users_this_month ?? 0,
      open_disputes: ss.open_disputes ?? 0,
    },
    urgent_actions: {
      new_projects: raw.urgent_actions?.new_projects ?? 0,
      pending_payments: raw.urgent_actions?.pending_payments ?? 0,
      disputes: raw.urgent_actions?.disputes ?? 0,
      pending_reports: raw.urgent_actions?.pending_reports ?? 0,
    },
    action_queues: raw.action_queues ?? {
      open_bidding: [],
      assign_engineers: [],
      release_payment: [],
    },
    recent_events: raw.recent_events ?? [],
    recent_projects: raw.recent_projects ?? [],
    open_disputes: raw.open_disputes ?? [],
    activity_data: raw.activity_data ?? { months: [], data: [] },
  }
}

export interface DashboardStatCard {
  testId: string
  titleKey: string
  value: number
  icon: string
  tone: 'primary' | 'default' | 'accent' | 'danger' | 'success' | 'warning'
  link: string
  isCurrency?: boolean
}

export function useAdminDashboard() {
  /** True until first onMounted fetch runs — avoids empty-state flash before fetch starts */
  const loading = ref(true)
  const error = ref<string | null>(null)
  const data = ref<DashboardSummary | null>(null)
  let abortController: AbortController | null = null

  const USE_MOCK = import.meta.env.DEV && !import.meta.env.VITE_API_READY

  const bannerCounts = computed(() => ({
    newProjects: data.value?.urgent_actions?.new_projects ?? 0,
    pendingPayments: data.value?.urgent_actions?.pending_payments ?? 0,
    disputes: data.value?.urgent_actions?.disputes ?? 0,
    pendingReports: data.value?.urgent_actions?.pending_reports ?? 0,
  }))

  const stats = computed((): DashboardStatCard[] => {
    const s = data.value?.summary_stats
    if (!s) {
      return []
    }
    return [
      {
        testId: 'stat-active-projects',
        titleKey: 'admin.dashboard.stats.active_projects',
        value: s.active_projects,
        icon: 'FolderOpen',
        tone: 'primary',
        link: '/projects?status=active',
      },
      {
        testId: 'stat-pending-milestone-review',
        titleKey: 'admin.dashboard.stats.milestones_pending_review',
        value: s.milestones_pending_review,
        icon: 'ClipboardList',
        tone: s.milestones_pending_review > 0 ? 'warning' : 'default',
        link: '/projects?milestone_review=1',
      },
      {
        testId: 'stat-payments-ready-release',
        titleKey: 'admin.dashboard.stats.payments_ready_for_release',
        value: s.payments_ready_for_release,
        icon: 'Banknote',
        tone: 'accent',
        link: '/projects?payment_release=1',
      },
      {
        testId: 'stat-awaiting-contractor-selection',
        titleKey:
          'admin.dashboard.stats.projects_awaiting_contractor_selection',
        value: s.projects_awaiting_contractor_selection,
        icon: 'Briefcase',
        tone:
          s.projects_awaiting_contractor_selection > 0 ? 'accent' : 'default',
        link: '/projects?status=under_review',
      },
      {
        testId: 'stat-new-users-month',
        titleKey: 'admin.dashboard.stats.new_users_this_month',
        value: s.new_users_this_month,
        icon: 'UserPlus',
        tone: 'default',
        link: '/users',
      },
    ]
  })

  const disputesStat = computed((): DashboardStatCard | null => {
    const n = data.value?.summary_stats?.open_disputes
    if (n === undefined || n === null || n === 0) {
      return null
    }
    return {
      testId: 'stat-open-disputes',
      titleKey: 'admin.dashboard.stats.open_disputes',
      value: n,
      icon: 'AlertCircle',
      tone: 'danger',
      link: '/disputes',
    }
  })

  const actionQueues = computed(
    (): ActionQueues =>
      data.value?.action_queues ?? {
        open_bidding: [],
        assign_engineers: [],
        release_payment: [],
      }
  )

  const recentEventsFeed = computed((): RecentEvent[] => {
    const events = data.value?.recent_events ?? []
    return events.slice(0, 10)
  })

  const superAdminFlags = computed(
    (): SuperAdminDashboardFlags | null => data.value?.super_admin_flags ?? null
  )

  async function fetchDashboard() {
    loading.value = true
    error.value = null
    abortController = new AbortController()

    try {
      if (USE_MOCK) {
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

        data.value = normalizeDashboardPayload(
          response.data as DashboardSummary
        )
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }

      const { t } = useI18n()
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'

      if (
        errorMessage.includes('401') ||
        errorMessage.includes('Unauthorized')
      ) {
        error.value = t('errors.unauthorized')
        console.error('[useAdminDashboard] Authentication error (401):', err)
      } else if (
        errorMessage.includes('timeout') ||
        errorMessage.includes('timed out')
      ) {
        error.value = t('errors.timeout')
        console.error('[useAdminDashboard] Request timeout:', err)
      } else if (
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('NetworkError')
      ) {
        error.value = t('errors.network')
        console.error('[useAdminDashboard] Network error:', err)
      } else {
        error.value = t('errors.server')
        console.error('[useAdminDashboard] Server error:', err)
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

  onMounted(() => {
    fetchDashboard()
  })

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
    actionQueues,
    recentEventsFeed,
    superAdminFlags,
    fetchDashboard,
    retry,
  }
}
