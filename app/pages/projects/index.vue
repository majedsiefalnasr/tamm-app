<script setup lang="ts">
import { ref, computed } from 'vue'
import { Skeleton } from '~/components/ui/skeleton'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import ProjectCard from '~/components/project/ProjectCard.vue'
import EmptyState from '~/components/common/EmptyState.vue'
import ErrorState from '~/components/common/ErrorState.vue'
import AdminProjectsPanel from '~/components/admin/AdminProjectsPanel.vue'
import PageContentSkeleton from '~/components/common/PageContentSkeleton.vue'
import type { Project, ProjectStatus } from '~/shared/types/project'

definePageMeta({
  roles: [
    'client',
    'contractor',
    'field_engineer',
    'supervisor_engineer',
    'admin',
    'super_admin',
  ],
  pageTitle: 'pages.projects',
})

const route = useRoute()
const auth = useAuthStore()
const { can } = usePermission()
const { projects, loading, error, fetchProjects, retryFetch } = useProjects()

/** Until first fetch runs — covers gap before onMounted when loading is still false */
const projectsRouteHydrating = ref(true)

const isAdminProjectsUi = computed(() =>
  ['admin', 'super_admin'].includes(auth.user?.role ?? '')
)

const isClient = computed(() => auth.user?.role === 'client')

const userRole = computed(() => auth.user?.role ?? '')

type ProjectsContextLink = { to: string; labelKey: string }

const projectsRoleContext = computed(
  (): {
    titleKey: string
    descKey: string
    links: ProjectsContextLink[]
  } | null => {
    const r = userRole.value
    if (['admin', 'super_admin'].includes(r)) return null
    if (r === 'client') {
      const links: ProjectsContextLink[] = [
        { to: '/payments', labelKey: 'nav.payments' },
        { to: '/reports', labelKey: 'nav.reports' },
        { to: '/messages', labelKey: 'nav.messages' },
      ]
      if (can('create_project')) {
        links.unshift({ to: '/projects/new', labelKey: 'nav.new_project' })
      }
      return {
        titleKey: 'pages.projects_role_context.client_title',
        descKey: 'pages.projects_role_context.client_desc',
        links,
      }
    }
    if (r === 'contractor') {
      return {
        titleKey: 'pages.projects_role_context.contractor_title',
        descKey: 'pages.projects_role_context.contractor_desc',
        links: [
          { to: '/tasks', labelKey: 'nav.tasks' },
          { to: '/reports', labelKey: 'nav.reports' },
          { to: '/messages', labelKey: 'nav.messages' },
        ],
      }
    }
    if (r === 'field_engineer') {
      return {
        titleKey: 'pages.projects_role_context.field_title',
        descKey: 'pages.projects_role_context.field_desc',
        links: [
          { to: '/assignments', labelKey: 'nav.assignments' },
          { to: '/reports', labelKey: 'nav.reports' },
        ],
      }
    }
    if (r === 'supervisor_engineer') {
      return {
        titleKey: 'pages.projects_role_context.supervisor_title',
        descKey: 'pages.projects_role_context.supervisor_desc',
        links: [
          { to: '/assignments', labelKey: 'nav.assignments' },
          { to: '/field-team', labelKey: 'nav.field_team' },
          { to: '/reviews', labelKey: 'nav.approvals' },
        ],
      }
    }
    return null
  }
)

const filterProjectStatus = computed((): ProjectStatus | null => {
  const rawFilter = route.query.filter
  const rawStatus = route.query.status
  const raw = rawFilter ?? rawStatus
  if (raw === undefined || raw === null) return null
  const s = Array.isArray(raw) ? raw[0] : raw
  if (typeof s !== 'string') return null
  if (s.includes(':')) {
    const [key, value] = s.split(':')
    if (key !== 'status' || !value) return null
    return value as ProjectStatus
  }
  return s as ProjectStatus
})

const displayProjects = computed(() => {
  const list = projects.value
  const st = filterProjectStatus.value
  if (!st) return list
  return list.filter((p: Project) => p.status === st)
})

onMounted(async () => {
  if (!isAdminProjectsUi.value) {
    try {
      await fetchProjects()
    } finally {
      projectsRouteHydrating.value = false
    }
  } else {
    projectsRouteHydrating.value = false
  }
})

const hasProjects = computed(() => projects.value.length > 0)
const hasFilteredProjects = computed(() => displayProjects.value.length > 0)
const showEmpty = computed(
  () => !loading.value && !error.value && !hasProjects.value
)
const showFilteredEmpty = computed(
  () =>
    !loading.value &&
    !error.value &&
    hasProjects.value &&
    !hasFilteredProjects.value
)
const showError = computed(() => !loading.value && error.value)
const showProjects = computed(
  () => !loading.value && !error.value && hasFilteredProjects.value
)
const showLoading = computed(
  () => loading.value || projectsRouteHydrating.value
)
</script>

<template>
  <AdminProjectsPanel v-if="isAdminProjectsUi" />

  <div v-else class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">{{ $t('pages.projects') }}</h1>
        <p class="text-muted-foreground mt-2">
          {{ $t('project.subtitle') }}
        </p>
      </div>
      <Button v-if="isClient && can('create_project')" as-child class="gap-2">
        <NuxtLink to="/projects/new">
          <span>{{ $t('project.create_project') }}</span>
        </NuxtLink>
      </Button>
    </div>

    <Card v-if="projectsRoleContext" class="shadow-none">
      <CardHeader class="pb-3">
        <CardTitle class="text-base font-semibold">
          {{ $t(projectsRoleContext.titleKey) }}
        </CardTitle>
        <CardDescription>
          {{ $t(projectsRoleContext.descKey) }}
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-wrap gap-2 pt-0">
        <Button
          v-for="link in projectsRoleContext.links"
          :key="link.to"
          variant="outline"
          size="sm"
          as-child
        >
          <NuxtLink :to="link.to">{{ $t(link.labelKey) }}</NuxtLink>
        </Button>
      </CardContent>
    </Card>

    <PageContentSkeleton
      v-if="showLoading && !hasProjects"
      :show-cards="true"
      :rows="5"
    />

    <div v-else-if="showLoading" class="grid gap-4 lg:grid-cols-2">
      <Skeleton class="h-80 rounded-2xl" />
      <Skeleton class="h-80 rounded-2xl" />
      <Skeleton class="h-80 rounded-2xl" />
    </div>

    <ErrorState
      v-else-if="showError"
      :message="error || undefined"
      @action="retryFetch"
    />

    <EmptyState
      v-else-if="showEmpty"
      icon="folder"
      title="project.no_projects"
      description="project.no_projects_description"
    >
      <div class="flex flex-wrap justify-center gap-2">
        <Button v-if="isClient && can('create_project')" as-child>
          <NuxtLink to="/projects/new">
            {{ $t('project.create_project') }}
          </NuxtLink>
        </Button>
        <Button
          v-else-if="userRole === 'contractor'"
          as-child
          variant="outline"
        >
          <NuxtLink to="/tasks">{{ $t('nav.tasks') }}</NuxtLink>
        </Button>
        <Button
          v-else-if="userRole === 'field_engineer'"
          as-child
          variant="outline"
        >
          <NuxtLink to="/assignments">{{ $t('nav.assignments') }}</NuxtLink>
        </Button>
        <Button
          v-else-if="userRole === 'supervisor_engineer'"
          as-child
          variant="outline"
        >
          <NuxtLink to="/reviews">{{ $t('nav.approvals') }}</NuxtLink>
        </Button>
      </div>
    </EmptyState>

    <EmptyState
      v-else-if="showFilteredEmpty"
      icon="folder"
      title="project.filter_empty_title"
      description="project.filter_empty_description"
    >
      <Button as-child variant="outline" class="mt-1">
        <NuxtLink to="/projects">{{
          $t('project.filter_clear_action')
        }}</NuxtLink>
      </Button>
    </EmptyState>

    <div v-else-if="showProjects" class="grid gap-4 lg:grid-cols-2">
      <ProjectCard
        v-for="project in displayProjects"
        :key="project.id"
        :project="project"
      />
    </div>
  </div>
</template>
