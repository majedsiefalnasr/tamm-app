<script setup lang="ts">
import { Skeleton } from '~/components/ui/skeleton'
import { Button } from '~/components/ui/button'
import ProjectCard from '~/components/project/ProjectCard.vue'
import EmptyState from '~/components/common/EmptyState.vue'
import ErrorState from '~/components/common/ErrorState.vue'
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

// Check if client role to show create button
const isClient = computed(() => auth.user?.role === 'client')

/** Parses `?filter=status:active` (story 08-01) or legacy `?status=active`. */
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

// Fetch projects on mount
onMounted(async () => {
  await fetchProjects()
})

// Computed properties for UI states
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
const showLoading = computed(() => loading.value)
</script>

<template>
  <div class="space-y-6 px-4 py-6 md:px-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">{{ $t('pages.projects') }}</h1>
        <p class="text-muted-foreground mt-2">
          {{ $t('project.subtitle') }}
        </p>
      </div>
      <!-- Create Project Button (Client Only) -->
      <Button v-if="isClient" disabled class="gap-2">
        <span>{{ $t('project.create_project') }}</span>
      </Button>
    </div>

    <!-- Loading State: Skeleton Cards -->
    <div v-if="showLoading" class="grid gap-4 lg:grid-cols-2">
      <Skeleton class="h-80 rounded-2xl" />
      <Skeleton class="h-80 rounded-2xl" />
      <Skeleton class="h-80 rounded-2xl" />
    </div>

    <!-- Error State -->
    <ErrorState
      v-if="showError"
      :message="error || undefined"
      @retry="retryFetch"
    />

    <!-- Empty State -->
    <EmptyState
      v-if="showEmpty"
      icon="📁"
      title="project.no_projects"
      description="project.no_projects_description"
    />

    <!-- Filtered empty (dashboard deep links) -->
    <EmptyState
      v-if="showFilteredEmpty"
      icon="📁"
      title="project.filter_empty_title"
      description="project.filter_empty_description"
    />

    <!-- Projects Grid -->
    <div v-if="showProjects" class="grid gap-4 lg:grid-cols-2">
      <ProjectCard
        v-for="project in displayProjects"
        :key="project.id"
        :project="project"
      />
    </div>
  </div>
</template>
