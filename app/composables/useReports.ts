import { ref, computed } from 'vue'
import type { Report } from '~/shared/types/project'

export interface ReportData {
  id: string
  milestone_id: string
  milestone_name: string
  project_id: string
  project_name: string
  field_engineer_id: string
  submitted_at: string
  status:
    | 'submitted'
    | 'under_review'
    | 'supervisor_approved'
    | 'approved'
    | 'rejected'
  current_milestone_status: string
}

export const useReports = () => {
  const reports = ref<ReportData[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Mock reports data
  const mockReports: ReportData[] = [
    {
      id: 'report-1',
      milestone_id: 'ms-1',
      milestone_name: 'المرحلة الأولى - الأساسات',
      project_id: 'proj-1',
      project_name: 'مشروع البناء الأساسي',
      field_engineer_id: 'eng-1',
      submitted_at: '2026-05-08T10:30:00Z',
      status: 'submitted',
      current_milestone_status: 'under_review',
    },
    {
      id: 'report-2',
      milestone_id: 'ms-2',
      milestone_name: 'المرحلة الثانية - الجدران',
      project_id: 'proj-1',
      project_name: 'مشروع البناء الأساسي',
      field_engineer_id: 'eng-1',
      submitted_at: '2026-05-07T14:15:00Z',
      status: 'submitted',
      current_milestone_status: 'supervisor_approved',
    },
    {
      id: 'report-3',
      milestone_id: 'ms-3',
      milestone_name: 'المرحلة الثالثة - الإنهاء',
      project_id: 'proj-2',
      project_name: 'مشروع الترميم',
      field_engineer_id: 'eng-1',
      submitted_at: '2026-05-06T09:00:00Z',
      status: 'submitted',
      current_milestone_status: 'approved',
    },
  ]

  const getReportsByFieldEngineer = (
    engineerId: string | undefined,
    limit: number = 5
  ) => {
    loading.value = true
    error.value = null

    try {
      // TODO: replace mock — GET /api/v1/reports?field_engineer_id={engineerId}&limit=5&sort=submitted_at:desc
      const engineerReports = mockReports
        .filter(r => r.field_engineer_id === engineerId)
        .sort(
          (a, b) =>
            new Date(b.submitted_at).getTime() -
            new Date(a.submitted_at).getTime()
        )
        .slice(0, limit)

      reports.value = engineerReports
      return {
        data: computed(() => reports.value),
        loading: computed(() => false),
        error: computed(() => null),
      }
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Failed to load reports'
      reports.value = []
      return {
        data: computed(() => []),
        loading: computed(() => false),
        error: computed(() => error.value),
      }
    } finally {
      loading.value = false
    }
  }

  const getReportByMilestoneId = (milestoneId: string) => {
    const report = reports.value.find(r => r.milestone_id === milestoneId)
    return report
  }

  return {
    reports: computed(() => reports.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    getReportsByFieldEngineer,
    getReportByMilestoneId,
  }
}
