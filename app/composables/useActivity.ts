import { ref, computed } from 'vue'

export interface ActivityEvent {
  id: string
  type:
    | 'project_created'
    | 'milestone_approved'
    | 'payment_released'
    | 'contractor_selected'
  title: string
  projectName: string
  projectId: string
  timestamp: Date
  icon: 'folder' | 'check' | 'credit-card' | 'user-check'
}

export const useActivity = () => {
  const activities = ref<ActivityEvent[]>([])
  /** True until first getRecentActivity() completes — avoids empty-state flash */
  const loading = ref(true)
  const error = ref<string | null>(null)

  // Mock activity data - TO DO: Replace with /api/v1/activity endpoint when available
  const mockActivities: ActivityEvent[] = [
    {
      id: 'act-1',
      type: 'contractor_selected',
      title: 'contractor_selected',
      projectName: 'Downtown Office Tower',
      projectId: 'proj-001',
      timestamp: new Date('2026-05-08T14:30:00'),
      icon: 'user-check',
    },
    {
      id: 'act-2',
      type: 'milestone_approved',
      title: 'milestone_approved',
      projectName: 'Azure Plaza Tower',
      projectId: 'proj-002',
      timestamp: new Date('2026-05-07T10:15:00'),
      icon: 'check',
    },
    {
      id: 'act-3',
      type: 'payment_released',
      title: 'payment_released',
      projectName: 'Downtown Office Tower',
      projectId: 'proj-001',
      timestamp: new Date('2026-05-06T16:45:00'),
      icon: 'credit-card',
    },
    {
      id: 'act-4',
      type: 'milestone_approved',
      title: 'milestone_approved',
      projectName: 'Riverside Development',
      projectId: 'proj-003',
      timestamp: new Date('2026-05-05T09:20:00'),
      icon: 'check',
    },
    {
      id: 'act-5',
      type: 'project_created',
      title: 'project_created',
      projectName: 'Sunset Heights Residential',
      projectId: 'proj-004',
      timestamp: new Date('2026-05-03T13:00:00'),
      icon: 'folder',
    },
  ]

  const getRecentActivity = async (): Promise<ActivityEvent[]> => {
    loading.value = true
    error.value = null

    try {
      // TODO: Replace mock with GET /api/v1/activity endpoint when available
      await new Promise(resolve => setTimeout(resolve, 300))
      activities.value = mockActivities
      return mockActivities
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Failed to load activity'
      return []
    } finally {
      loading.value = false
    }
  }

  const recentActivity = computed(() => activities.value.slice(0, 5))

  return {
    activities,
    recentActivity,
    loading,
    error,
    getRecentActivity,
  }
}
