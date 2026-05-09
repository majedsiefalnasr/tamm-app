<script setup lang="ts">
import { computed, onMounted } from 'vue'
import type { Project } from '~/shared/types/project'
import { useMilestones } from '~/composables/useMilestones'
import { useProjects } from '~/composables/useProjects'
import ReviewListItem from '~/components/review/ReviewListItem.vue'
import EmptyState from '~/components/common/EmptyState.vue'
import PageSkeleton from '~/components/common/PageSkeleton.vue'
import ErrorState from '~/components/common/ErrorState.vue'
import { Badge } from '~/components/ui/badge'
import { formatDate } from '~/utils/formatters'

const {
  refreshPendingReviews,
  pendingReviews,
  pendingReviewsCount,
  supervisorRecentDecisionsTop,
  supervisorApprovedThisMonthCount,
  loading,
  error,
} = useMilestones()

const { projects, loading: projectsLoading, fetchProjects } = useProjects()

const operationalStatuses = new Set<Project['status']>([
  'active',
  'contractor_selected',
  'on_hold',
])

const supervisorProjects = computed(() =>
  (projects.value ?? []).filter(p => operationalStatuses.has(p.status))
)

const activeProjectsCount = computed(() => supervisorProjects.value.length)

const pendingLoading = computed(() => loading.value)

const pendingErrorMessage = computed(() => {
  const err = error.value
  if (!err) return ''
  return typeof err === 'string' ? err : String(err)
})

const showPendingBanner = computed(() => pendingReviews.value.length > 0)

// TODO: replace mock — GET supervisor/field-team (or derive from milestones/reports API)
/** Mock field-team summary until endpoint exists */
const fieldTeamRows = computed(() => [
  {
    engineerName: 'Mohammed Hassan',
    projectName: 'Villa Project A',
    lastReportAt: '2026-05-08T08:00:00Z',
  },
  {
    engineerName: 'Youssef Ali',
    projectName: 'Villa Project A',
    lastReportAt: '2026-05-08T09:15:00Z',
  },
])

onMounted(async () => {
  await fetchProjects()
})

function progressPercent(p: Project): number {
  if (!p.total_milestones) return 0
  return Math.round((p.completed_milestones / p.total_milestones) * 100)
}

const handleReviewActionComplete = async () => {
  await refreshPendingReviews()
}
</script>

<template>
  <div class="space-y-8">
    <div class="space-y-2">
      <h1 class="text-ink text-2xl font-extrabold md:text-3xl">
        {{ $t('pages.supervisor_dashboard') }}
      </h1>
      <p class="text-muted-foreground text-sm">
        {{ $t('pages.supervisor_dashboard_subtitle') }}
      </p>
    </div>

    <!-- KPI row -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div
        class="border-border bg-card shadow-card rounded-2xl border p-5 md:p-6"
      >
        <p class="text-muted-foreground text-xs font-semibold uppercase">
          {{ $t('dashboard.supervisor.statPending') }}
        </p>
        <p
          class="mt-3 text-2xl font-extrabold md:text-[28px]"
          :class="
            pendingReviewsCount > 0
              ? 'text-rose-700 dark:text-rose-400'
              : 'text-ink'
          "
        >
          {{ pendingReviewsCount }}
        </p>
      </div>
      <div
        class="border-border bg-card shadow-card rounded-2xl border p-5 md:p-6"
      >
        <p class="text-muted-foreground text-xs font-semibold uppercase">
          {{ $t('dashboard.supervisor.statActiveProjects') }}
        </p>
        <p class="text-primary mt-3 text-2xl font-extrabold md:text-[28px]">
          {{ projectsLoading ? '—' : activeProjectsCount }}
        </p>
      </div>
      <div
        class="border-border bg-card shadow-card rounded-2xl border p-5 md:p-6"
      >
        <p class="text-muted-foreground text-xs font-semibold uppercase">
          {{ $t('dashboard.supervisor.statApprovedMonth') }}
        </p>
        <p class="text-accent mt-3 text-2xl font-extrabold md:text-[28px]">
          {{ supervisorApprovedThisMonthCount }}
        </p>
      </div>
    </div>

    <!-- Pending reviews -->
    <section>
      <div
        :class="
          showPendingBanner
            ? 'border-danger/30 bg-danger/5 rounded-2xl border p-5 md:p-6'
            : 'border-border bg-card shadow-card rounded-2xl border p-5 md:p-6'
        "
      >
        <div
          class="border-border mb-4 flex flex-wrap items-end justify-between gap-3 border-b pb-4"
        >
          <div>
            <h2 class="text-ink text-lg font-extrabold">
              {{ $t('dashboard.supervisor.pendingTitle') }}
            </h2>
            <p class="text-muted-foreground mt-0.5 text-xs">
              {{ $t('dashboard.supervisor.pendingSubtitle') }}
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <Badge
              v-if="pendingReviewsCount > 0"
              variant="destructive"
              class="touch-target"
            >
              {{ pendingReviewsCount }}
            </Badge>
            <NuxtLink
              to="/reviews"
              class="border-border text-foreground hover:border-primary hover:text-primary bg-card inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-xs font-bold transition"
            >
              {{ $t('dashboard.supervisor.fullQueue') }}
            </NuxtLink>
          </div>
        </div>

        <PageSkeleton v-if="pendingLoading && pendingReviews.length === 0" />

        <ErrorState
          v-else-if="pendingErrorMessage"
          :message="pendingErrorMessage"
          :action-label="$t('common.retry')"
          @action="refreshPendingReviews"
        />

        <EmptyState
          v-else-if="pendingReviews.length === 0"
          icon="inbox"
          :title="$t('dashboard.supervisor.pendingEmptyTitle')"
          :description="$t('dashboard.supervisor.pendingEmptyDescription')"
        />

        <div v-else class="space-y-3">
          <ReviewListItem
            v-for="milestone in pendingReviews"
            :key="milestone.id"
            :milestone="milestone"
            @action-complete="handleReviewActionComplete"
          />
        </div>
      </div>
    </section>

    <!-- Recent decisions -->
    <section
      class="border-border bg-card shadow-card rounded-2xl border p-5 md:p-6"
    >
      <div
        class="border-border mb-4 flex flex-wrap items-end justify-between gap-3 border-b pb-4"
      >
        <div>
          <h2 class="text-ink text-lg font-extrabold">
            {{ $t('dashboard.supervisor.recentTitle') }}
          </h2>
          <p class="text-muted-foreground mt-0.5 text-xs">
            {{ $t('dashboard.supervisor.recentSubtitle') }}
          </p>
        </div>
      </div>

      <div
        v-if="supervisorRecentDecisionsTop.length === 0"
        class="border-border rounded-2xl border border-dashed p-10 text-center"
      >
        <p class="text-ink text-sm font-bold">
          {{ $t('dashboard.supervisor.recentEmpty') }}
        </p>
      </div>
      <ul v-else class="divide-border divide-y">
        <li
          v-for="row in supervisorRecentDecisionsTop"
          :key="`${row.milestoneId}-${row.decidedAt}`"
          class="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
        >
          <div class="min-w-0 flex-1">
            <p class="text-ink text-sm font-semibold">
              {{ row.milestoneName }}
            </p>
            <p class="text-muted-foreground text-xs">
              {{ row.projectName }}
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <Badge
              :variant="row.decision === 'approved' ? 'default' : 'destructive'"
            >
              {{ $t(`dashboard.supervisor.decision.${row.decision}`) }}
            </Badge>
            <span class="text-muted-foreground text-xs">{{
              formatDate(row.decidedAt)
            }}</span>
          </div>
        </li>
      </ul>
    </section>

    <!-- My projects -->
    <section
      class="border-border bg-card shadow-card rounded-2xl border p-5 md:p-6"
    >
      <div
        class="border-border mb-4 flex flex-wrap items-end justify-between gap-3 border-b pb-4"
      >
        <div>
          <h2 class="text-ink text-lg font-extrabold">
            {{ $t('dashboard.supervisor.projectsTitle') }}
          </h2>
          <p class="text-muted-foreground mt-0.5 text-xs">
            {{ $t('dashboard.supervisor.projectsSubtitle') }}
          </p>
        </div>
        <NuxtLink
          to="/projects"
          class="text-primary text-xs font-bold hover:underline"
        >
          {{ $t('dashboard.supervisor.viewProjects') }}
        </NuxtLink>
      </div>

      <PageSkeleton v-if="projectsLoading && supervisorProjects.length === 0" />

      <EmptyState
        v-else-if="supervisorProjects.length === 0"
        icon="folder"
        :title="$t('dashboard.supervisor.projectsEmpty')"
        :description="$t('dashboard.supervisor.projectsEmptyHint')"
      />

      <ul v-else class="space-y-4">
        <li
          v-for="p in supervisorProjects"
          :key="p.id"
          class="border-border rounded-2xl border p-4"
        >
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0">
              <NuxtLink
                :to="`/projects/${p.id}`"
                class="text-ink text-sm font-semibold hover:underline"
              >
                {{ p.name }}
              </NuxtLink>
              <p class="text-muted-foreground text-xs">
                {{ p.city }}
              </p>
            </div>
            <Badge variant="outline">{{
              $t(`project.status.${p.status}`)
            }}</Badge>
          </div>
          <div class="mt-3">
            <div
              class="bg-muted h-2.5 overflow-hidden rounded-full"
              role="progressbar"
              :aria-valuenow="progressPercent(p)"
              aria-valuemin="0"
              aria-valuemax="100"
            >
              <div
                class="from-primary bg-gradient-to-[inline-start] h-full rounded-full to-emerald-400"
                :style="{ width: `${progressPercent(p)}%` }"
              />
            </div>
            <p class="text-muted-foreground mt-1 text-[11px]">
              {{
                $t('dashboard.supervisor.progressLabel', {
                  done: p.completed_milestones,
                  total: p.total_milestones,
                })
              }}
            </p>
          </div>
        </li>
      </ul>
    </section>

    <!-- Field team -->
    <section
      class="border-border bg-card shadow-card rounded-2xl border p-5 md:p-6"
    >
      <div class="border-border mb-4 border-b pb-4">
        <h2 class="text-ink text-lg font-extrabold">
          {{ $t('dashboard.supervisor.fieldTeamTitle') }}
        </h2>
        <p class="text-muted-foreground mt-0.5 text-xs">
          {{ $t('dashboard.supervisor.fieldTeamSubtitle') }}
        </p>
      </div>

      <ul class="divide-border divide-y">
        <li
          v-for="(row, idx) in fieldTeamRows"
          :key="idx"
          class="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
        >
          <div>
            <p class="text-ink text-sm font-semibold">{{ row.engineerName }}</p>
            <p class="text-muted-foreground text-xs">{{ row.projectName }}</p>
          </div>
          <span class="text-muted-foreground text-xs">{{
            formatDate(row.lastReportAt)
          }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.touch-target {
  min-height: 44px;
  min-width: 44px;
}
</style>
