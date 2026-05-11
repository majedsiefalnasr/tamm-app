<script setup lang="ts">
import { computed } from 'vue'
import type { ProjectDetail, Milestone } from '~/shared/types/project'
import { formatCurrency, formatDate } from '~/utils/formatters'
import { ChevronLeftIcon } from '@heroicons/vue/24/outline'
import { Button } from '~/components/ui/button'
import StatusTag from '~/components/common/StatusTag.vue'
import MilestoneActions from '~/components/milestone/MilestoneActions.vue'
import ReportDisplay from '~/components/milestone/ReportDisplay.vue'
import ReportHistory from '~/components/milestone/ReportHistory.vue'
import ApprovalTimeline from '~/components/milestone/ApprovalTimeline.vue'
import MilestoneDetail from '~/components/milestone/MilestoneDetail.vue'
import PageSkeleton from '~/components/common/PageSkeleton.vue'
import ErrorState from '~/components/common/ErrorState.vue'

definePageMeta({
  layout: 'default',
  roles: [
    'client',
    'contractor',
    'field_engineer',
    'supervisor_engineer',
    'admin',
    'super_admin',
  ],
})

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const projectId = computed(() => route.params.id as string)
const milestoneId = computed(() => route.params.mid as string)

const milestonesComposable = useMilestones()

// Fetch project and milestone data (merge Pinia milestone overlay for trust timeline + actions)
const {
  data: project,
  pending: projectLoading,
  error: projectError,
  refresh: refreshProject,
} = await useAsyncData(
  () => `project-${projectId.value}`,
  async () => {
    await milestonesComposable.loadMilestones(projectId.value)
    return useProjects().getProjectById(projectId.value)
  },
  { watch: [projectId] }
)

const milestone = computed((): Milestone | undefined => {
  const base = project.value?.milestones?.find(m => m.id === milestoneId.value)
  const overlay = milestonesComposable
    .getMilestones(projectId.value)
    .find(m => m.id === milestoneId.value)
  if (!base && !overlay) return undefined
  if (!overlay) return base
  if (!base) return overlay
  return {
    ...base,
    ...overlay,
    tasks:
      overlay.tasks && overlay.tasks.length > 0
        ? overlay.tasks
        : (base.tasks ?? []),
    allowed_actions:
      overlay.allowed_actions && overlay.allowed_actions.length > 0
        ? overlay.allowed_actions
        : (base.allowed_actions ?? []),
  }
})

const isLoading = computed(() => projectLoading.value || !milestone.value)
const error = computed(() => projectError.value)

// Breadcrumb items
const breadcrumbItems = computed(() => [
  { label: t('nav.home'), href: '/' },
  { label: t('nav.projects'), href: '/projects' },
  { label: project.value?.name || '', href: `/projects/${projectId.value}` },
  { label: milestone.value?.name || '', href: '#' },
])

const pageTitle = computed(
  () => milestone.value?.name || t('milestone.detail.title')
)

// Report history (all past reports)
const reportHistory = computed(() => {
  if (!milestone.value?.latest_report) return []
  // For now, return just the latest report; in a real implementation,
  // this would be a separate API call to fetch all historical reports
  return [milestone.value.latest_report]
})

// Handle action completion
const handleActionComplete = async () => {
  await refreshProject()
}

const goBack = () => {
  router.push(`/projects/${projectId.value}`)
}
</script>

<template>
  <div class="container mx-auto">
    <!-- Loading State -->
    <PageSkeleton v-if="isLoading" />

    <!-- Error State -->
    <ErrorState
      v-else-if="error || !milestone"
      :message="error?.message || t('milestone.error.notFound')"
      @action="refreshProject()"
    />

    <!-- Content -->
    <template v-else>
      <!-- Breadcrumb -->
      <nav class="text-muted-foreground mb-6 flex items-center gap-2 text-sm">
        <a href="/" class="hover:text-foreground transition">
          {{ breadcrumbItems[0].label }}
        </a>
        <span>/</span>
        <a href="/projects" class="hover:text-foreground transition">
          {{ breadcrumbItems[1].label }}
        </a>
        <span>/</span>
        <a
          :href="`/projects/${projectId}`"
          class="hover:text-foreground transition"
        >
          {{ breadcrumbItems[2].label }}
        </a>
        <span>/</span>
        <span class="text-foreground font-medium">{{
          breadcrumbItems[3].label
        }}</span>
      </nav>

      <!-- Back Button -->
      <Button variant="ghost" size="sm" class="mb-6" @click="goBack">
        <ChevronLeftIcon class="me-2 h-4 w-4" />
        {{ t('common.back') }}
      </Button>

      <!-- Header Section -->
      <div class="mb-8 border-b pb-6">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <div class="mb-2 flex items-center gap-3">
              <div
                class="bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
              >
                {{ milestone.order }}
              </div>
              <h1 class="text-ink text-3xl font-bold">
                {{ milestone.name }}
              </h1>
            </div>
            <p v-if="milestone.description" class="text-muted-foreground mt-2">
              {{ milestone.description }}
            </p>
          </div>
          <StatusTag :status="milestone.status" />
        </div>

        <!-- Metadata Row -->
        <div class="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <p class="text-muted-foreground text-xs font-semibold uppercase">
              {{ t('milestone.detail.budget') }}
            </p>
            <p class="text-ink text-lg font-bold">
              {{ formatCurrency(milestone.amount) }}
            </p>
          </div>
          <div>
            <p class="text-muted-foreground text-xs font-semibold uppercase">
              {{ t('milestone.detail.status') }}
            </p>
            <p class="text-ink text-lg font-bold capitalize">
              {{ t(`milestone.status.${milestone.status}`) }}
            </p>
          </div>
          <div>
            <p class="text-muted-foreground text-xs font-semibold uppercase">
              {{ t('milestone.detail.createdAt') }}
            </p>
            <p class="text-ink text-sm">
              {{ formatDate(milestone.created_at) }}
            </p>
          </div>
          <div v-if="milestone.updated_at">
            <p class="text-muted-foreground text-xs font-semibold uppercase">
              {{ t('milestone.detail.updatedAt') }}
            </p>
            <p class="text-ink text-sm">
              {{ formatDate(milestone.updated_at) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Details Tabs/Sections -->
      <div class="grid gap-8">
        <!-- Milestone Details -->
        <MilestoneDetail :milestone="milestone" />

        <!-- Latest Report Section -->
        <div id="milestone-report-evidence">
          <h2 class="mb-4 text-xl font-bold">
            {{ t('milestone.report.title') }}
          </h2>
          <ReportDisplay
            v-if="milestone.latest_report"
            :report="milestone.latest_report"
          />
          <div
            v-else
            class="bg-muted/30 border-border rounded-lg border p-8 text-center"
          >
            <p class="text-muted-foreground">
              {{ t('milestone.detail.noReport') }}
            </p>
          </div>
        </div>

        <!-- Report History -->
        <ReportHistory :reports="reportHistory" />

        <!-- Trust timeline -->
        <ApprovalTimeline
          :milestone="milestone"
          :project="project ?? undefined"
          :reports="reportHistory"
          :pending="projectLoading"
        />

        <!-- Action Buttons -->
        <div
          class="bg-background sticky bottom-0 flex justify-end gap-2 border-t p-4"
        >
          <MilestoneActions
            :milestone="milestone"
            @action-complete="handleActionComplete"
          />
        </div>
      </div>
    </template>
  </div>
</template>
