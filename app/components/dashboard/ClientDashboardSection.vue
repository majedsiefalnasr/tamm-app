<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import ApprovalQueueWidget from '~/components/client/ApprovalQueueWidget.vue'
import DashboardPaymentSummary from '~/components/dashboard/DashboardPaymentSummary.vue'
import ProjectSummaryCards from '~/components/dashboard/ProjectSummaryCards.vue'
import RecentActivitySection from '~/components/dashboard/RecentActivitySection.vue'
import RoleDashboardPrimaryChart from '~/components/dashboard/RoleDashboardPrimaryChart.vue'
import { useProjects } from '~/composables/useProjects'
import { useActivity } from '~/composables/useActivity'
import type { ChartConfig } from '~/components/ui/chart'
import { buildClientProjectProgressChart } from '~/utils/roleDashboardCharts'

const { projects, loading: projectsLoading, fetchProjects } = useProjects()
const {
  recentActivity,
  loading: activityLoading,
  error: activityError,
  getRecentActivity,
} = useActivity()

onMounted(async () => {
  try {
    await Promise.all([fetchProjects(), getRecentActivity()])
  } finally {
    projectsHydrating.value = false
  }
})

const projectsList = computed(() => projects.value || [])

/** True until first client-dashboard bootstrap completes — hides zeros before fetchProjects runs */
const projectsHydrating = ref(true)

const { t } = useI18n()

const chartDefinition = computed(() =>
  buildClientProjectProgressChart(projectsList.value)
)

const chartConfig = computed<ChartConfig>(() => ({
  progress: {
    label: t('dashboard.chart.series.progress'),
    color: 'var(--color-chart-1)',
  },
}))
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-ink text-3xl font-bold">
        {{ $t('pages.client_dashboard') }}
      </h1>
      <p class="text-muted-foreground mt-1">
        {{ $t('pages.client_dashboard_subtitle') }}
      </p>
    </div>

    <div class="grid gap-6">
      <RoleDashboardPrimaryChart
        :loading="projectsLoading || projectsHydrating"
        :definition="chartDefinition"
        :chart-config="chartConfig"
        title-key="dashboard.chart.client.title"
        description-key="dashboard.chart.client.description"
        empty-title-key="dashboard.chart.client.emptyTitle"
        empty-description-key="dashboard.chart.client.emptyDescription"
        empty-action-href="/projects/new"
        empty-action-label-key="dashboard.chart.client.emptyAction"
      />

      <div class="border-border bg-card rounded-2xl border p-6">
        <ApprovalQueueWidget />
      </div>

      <DashboardPaymentSummary
        :loading="projectsLoading || projectsHydrating"
      />

      <ProjectSummaryCards
        :projects="projectsList"
        :is-loading="projectsLoading || projectsHydrating"
      />

      <RecentActivitySection
        :activities="recentActivity"
        :is-loading="activityLoading"
        :has-error="!!activityError"
        @retry="getRecentActivity"
      />
    </div>
  </div>
</template>
