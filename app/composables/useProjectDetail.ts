import { ref, computed, readonly } from 'vue'
import type {
  ProjectDetail,
  AssignEngineersPayload,
} from '~/shared/types/project'
import type { Role } from '#shared/types/user'
import { useProjects } from './useProjects'

const USE_MOCK = true // Set to false when API is available

export function useProjectDetail(projectId: string) {
  const project = ref<ProjectDetail | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Assignment state
  const assigningEngineers = ref(false)
  const assignmentError = ref<Record<string, string[]> | null>(null)

  // Fetch project detail
  const fetchProjectDetail = async () => {
    loading.value = true
    error.value = null
    try {
      const { getProjectById } = useProjects()
      project.value = await getProjectById(projectId)
    } catch (e) {
      error.value = (e as any)?.message || 'Failed to fetch project'
      project.value = null
    } finally {
      loading.value = false
    }
  }

  // Assign engineers to project
  const assignEngineers = async (payload: AssignEngineersPayload) => {
    assigningEngineers.value = true
    assignmentError.value = null

    // Store previous values for rollback
    const prevSupervisor = project.value?.supervisor_id
    const prevSupervisorName = project.value?.supervisor_name
    const prevField = project.value?.field_engineer_id
    const prevFieldName = project.value?.field_engineer_name

    try {
      // Optimistic update
      if (project.value) {
        project.value.supervisor_id = payload.supervisor_engineer_id
        project.value.field_engineer_id = payload.field_engineer_id
        // TODO: Update with engineer names from response
      }

      if (USE_MOCK) {
        // Mock implementation - simulate API call
        await new Promise(resolve => setTimeout(resolve, 500))
        // In mock, we just keep the optimistic update
      } else {
        // Real API implementation
        const response = await useApi(
          `/admin/projects/${projectId}/assign-engineers`,
          {
            method: 'POST',
            body: payload,
          }
        )

        // Update with response data (includes full engineer objects)
        if (response.data && project.value) {
          project.value.supervisor_id = response.data.supervisor_engineer_id
          project.value.supervisor_name =
            response.data.supervisor_engineer?.name
          project.value.field_engineer_id = response.data.field_engineer_id
          project.value.field_engineer_name = response.data.field_engineer?.name
        }
      }

      return project.value
    } catch (e: any) {
      // Rollback on error
      if (project.value) {
        project.value.supervisor_id = prevSupervisor
        project.value.supervisor_name = prevSupervisorName
        project.value.field_engineer_id = prevField
        project.value.field_engineer_name = prevFieldName
      }

      if (e?.data?.error?.errors) {
        assignmentError.value = e.data.error.errors
      }
      throw e
    } finally {
      assigningEngineers.value = false
    }
  }

  return {
    project: readonly(project),
    loading: readonly(loading),
    error: readonly(error),
    assigningEngineers: readonly(assigningEngineers),
    assignmentError: readonly(assignmentError),
    fetchProjectDetail,
    assignEngineers,
  }
}
