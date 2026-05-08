import type { ProjectDetail, ProjectStatus } from '~/shared/types/project'
import { canTransition } from '~/utils/statusMachine'

export function useProjectActions() {
  const { t } = useI18n()
  const { notify } = useNotifications()
  const projectsStore = useProjects()

  async function transitionProject(
    projectId: string,
    newStatus: ProjectStatus,
    project: ProjectDetail
  ): Promise<void> {
    const fromStatus = project.status

    // Validate transition
    if (!canTransition('project', fromStatus, newStatus)) {
      notify.error(t('errors.invalidTransition'))
      throw new Error(`Invalid transition: ${fromStatus} → ${newStatus}`)
    }

    // Optimistic update
    projectsStore.updateProjectStatus(projectId, newStatus)

    try {
      await useApi(`/projects/${projectId}/status`, {
        method: 'PUT',
        body: { status: newStatus },
      })

      // Success — notify based on transition type
      const notificationKey = getNotificationKey(fromStatus, newStatus)
      if (notificationKey) {
        notify.success(t(notificationKey))
      }
    } catch (err: any) {
      // Rollback on error
      projectsStore.updateProjectStatus(projectId, fromStatus)

      // Show error with specific reason if available
      const errorMessage = err?.data?.message || t('errors.transitionFailed')
      notify.error(errorMessage)

      throw err
    }
  }

  async function activateProject(
    projectId: string,
    project: ProjectDetail
  ): Promise<void> {
    await transitionProject(projectId, 'active', project)
  }

  async function pauseProject(
    projectId: string,
    project: ProjectDetail
  ): Promise<void> {
    await transitionProject(projectId, 'on_hold', project)
  }

  async function resumeProject(
    projectId: string,
    project: ProjectDetail
  ): Promise<void> {
    await transitionProject(projectId, 'active', project)
  }

  function getNotificationKey(
    fromStatus: ProjectStatus,
    toStatus: ProjectStatus
  ): string | null {
    const key = `${fromStatus}-${toStatus}`
    const keyMap: Record<string, string> = {
      'contractor_selected-active': 'project.notifications.activated',
      'active-on_hold': 'project.notifications.paused',
      'on_hold-active': 'project.notifications.resumed',
    }
    return keyMap[key] ?? null
  }

  return {
    transitionProject,
    activateProject,
    pauseProject,
    resumeProject,
  }
}
