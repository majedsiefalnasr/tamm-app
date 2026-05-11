import { computed, ref } from 'vue'
import type { Milestone, MilestoneStatus } from '~/shared/types/project'

export type ContractorTaskKind = 'task' | 'milestone'

export interface ContractorTaskRow {
  kind: ContractorTaskKind
  id: string
  title: string
  detail: string
  projectId: string
  milestoneId: string
  statusKey: string
}

const MILESTONE_TASK_FALLBACK: MilestoneStatus[] = [
  'draft',
  'submitted',
  'under_review',
  'in_progress',
  'not_started',
  'supervisor_approved',
]

function isOpenTaskStatus(
  status: string | undefined,
  completed?: boolean
): boolean {
  if (completed) return false
  const s = status ?? 'pending'
  return s !== 'completed' && s !== 'approved'
}

export function useContractorTasks() {
  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
    fetchProjects,
  } = useProjects()
  const {
    milestones,
    loading: milestonesLoading,
    error: milestonesError,
    fetchMilestones,
  } = useMilestones()

  const bootstrapError = ref<string | null>(null)

  const loading = computed(
    () => projectsLoading.value || milestonesLoading.value
  )

  const error = computed(
    () => projectsError.value ?? milestonesError.value ?? bootstrapError.value
  )

  const contractorProjectIds = computed(
    () => new Set((projects.value || []).map(p => String(p.id)))
  )

  function resolveProjectName(projectId: string, m: Milestone): string {
    const fromMilestone = m.project?.name
    if (fromMilestone) return fromMilestone
    const p = projects.value.find(x => String(x.id) === projectId)
    return p?.name ?? ''
  }

  const rows = computed((): ContractorTaskRow[] => {
    const out: ContractorTaskRow[] = []
    const ids = contractorProjectIds.value

    for (const m of milestones.value || []) {
      const pidRaw = m.project_id ?? m.project?.id
      if (!pidRaw) continue
      const pid = String(pidRaw)
      if (!ids.has(pid)) continue

      const projectName = resolveProjectName(pid, m)
      const milestoneLabel = m.name

      const openTasks = (m.tasks || []).filter(t =>
        isOpenTaskStatus(t.status, t.completed)
      )

      for (const t of openTasks) {
        out.push({
          kind: 'task',
          id: `task-${String(t.id)}`,
          title: t.title,
          detail: `${projectName} · ${milestoneLabel}`,
          projectId: pid,
          milestoneId: String(m.id),
          statusKey: t.status ?? 'pending',
        })
      }
    }

    if (out.length > 0) return out

    for (const m of milestones.value || []) {
      const pidRaw = m.project_id ?? m.project?.id
      if (!pidRaw) continue
      const pid = String(pidRaw)
      if (!ids.has(pid)) continue
      if (!MILESTONE_TASK_FALLBACK.includes(m.status)) continue

      out.push({
        kind: 'milestone',
        id: `milestone-${String(m.id)}`,
        title: m.name,
        detail: resolveProjectName(pid, m),
        projectId: pid,
        milestoneId: String(m.id),
        statusKey: m.status,
      })
    }

    return out
  })

  async function load(): Promise<void> {
    bootstrapError.value = null
    try {
      await Promise.all([fetchProjects(), fetchMilestones()])
    } catch (e) {
      bootstrapError.value =
        e instanceof Error ? e.message : String(e ?? 'load failed')
    }
  }

  return {
    rows,
    loading,
    error,
    load,
  }
}
