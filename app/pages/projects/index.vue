<script setup lang="ts">
import { ref } from 'vue'
import { Skeleton } from '~/components/ui/skeleton'
import { Button } from '~/components/ui/button'
import ProjectCard from '~/components/project/ProjectCard.vue'
import EmptyState from '~/components/common/EmptyState.vue'
import ErrorState from '~/components/common/ErrorState.vue'
import AdminProjectsPanel from '~/components/admin/AdminProjectsPanel.vue'
import PageContentSkeleton from '~/components/common/PageContentSkeleton.vue'
import type { ProjectStatus } from '~/shared/types/project'

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
const { projects, loading, error, fetchProjects, retryFetch } = useProjects()

/** Until first fetch runs — covers gap before onMounted when loading is still false */
const projectsRouteHydrating = ref(true)

const isAdminProjectsUi = computed(() =>
  ['admin', 'super_admin'].includes(auth.user?.role ?? '')
)

const isClient = computed(() => auth.user?.role === 'client')

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
  return list.filter(p => p.status === st)
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
      <Button v-if="isClient" disabled class="gap-2">
        <span>{{ $t('project.create_project') }}</span>
      </Button>
    </div>

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
    />

    <EmptyState
      v-else-if="showFilteredEmpty"
      icon="folder"
      title="project.filter_empty_title"
      description="project.filter_empty_description"
    />

    <div v-else-if="showProjects" class="grid gap-4 lg:grid-cols-2">
      <ProjectCard
        v-for="project in displayProjects"
        :key="project.id"
        :project="project"
      />
    </div>
  </div>
</template>
