<script setup lang="ts">
import { watch, computed } from 'vue'
import RoleDashboardPrimaryChart from '~/components/dashboard/RoleDashboardPrimaryChart.vue'
import type { ChartConfig } from '~/components/ui/chart'
import { useMilestones } from '~/composables/useMilestones'
import { useReports } from '~/composables/useReports'
import { useAuthStore } from '~/stores/auth'
import { buildFieldEngineerMonthlyReportsChart } from '~/utils/roleDashboardCharts'
import { Button } from '~/components/ui/button'

const auth = useAuthStore()

const {
  data: activeMilestones,
  loading: activeMilestonesLoading,
  error: milestonesError,
} = useMilestones().getMilestonesByFieldEngineer('in_progress')

const reportsApi = useReports()

watch(
  () => auth.user?.id,
  userId => {
    reportsApi.getReportsByFieldEngineer(userId, 5)
  },
  { immediate: true }
)

const recentReports = computed(() => reportsApi.reports.value)
const reportsLoading = computed(() => reportsApi.loading.value)

const handleRetryMilestones = () => {
  // TODO: wire refresh when field-engineer milestones endpoint exists
}

const { t } = useI18n()

const reportsChartDefinition = computed(() =>
  buildFieldEngineerMonthlyReportsChart(recentReports.value)
)

const reportsChartConfig = computed<ChartConfig>(() => ({
  reports: {
    label: t('dashboard.chart.series.reports'),
    color: 'var(--color-chart-1)',
  },
}))

const chartLoading = computed(
  () => activeMilestonesLoading.value || reportsLoading.value
)
</script>

<template>
  <div class="space-y-6">
    <!-- Page Title -->
    <div class="mb-8">
      <h1 class="text-ink text-2xl font-extrabold md:text-3xl">
        {{ $t('dashboard.fieldEngineer.title') }}
      </h1>
    </div>

    <div
      class="border-border bg-muted/30 flex flex-wrap gap-2 rounded-xl border px-4 py-3"
    >
      <Button variant="outline" size="sm" as-child>
        <NuxtLink to="/assignments">{{ $t('nav.assignments') }}</NuxtLink>
      </Button>
      <Button variant="outline" size="sm" as-child>
        <NuxtLink to="/reports">{{ $t('nav.reports') }}</NuxtLink>
      </Button>
    </div>

    <RoleDashboardPrimaryChart
      :loading="chartLoading"
      :definition="reportsChartDefinition"
      :chart-config="reportsChartConfig"
      title-key="dashboard.chart.fieldEngineer.title"
      description-key="dashboard.chart.fieldEngineer.description"
      empty-title-key="dashboard.chart.fieldEngineer.emptyTitle"
      empty-description-key="dashboard.chart.fieldEngineer.emptyDescription"
      empty-action-href="/assignments"
      empty-action-label-key="dashboard.chart.fieldEngineer.emptyAction"
    />

    <!-- Active Milestones Section -->
    <FieldEngineerActiveMilestones
      :milestones="activeMilestones"
      :loading="activeMilestonesLoading"
      :has-error="!!milestonesError"
      :error-message="
        typeof milestonesError === 'string' ? milestonesError : ''
      "
      @retry="handleRetryMilestones"
    />

    <!-- Recent Reports Section -->
    <FieldEngineerRecentReports
      :reports="recentReports"
      :loading="reportsLoading"
    />
  </div>
</template>
