<script setup lang="ts">
import { computed } from 'vue'
import type { ActivityChartData } from '~/shared/types/admin'
import type { ChartConfig } from '~/components/ui/chart'
import RoleDashboardPrimaryChart from '~/components/dashboard/RoleDashboardPrimaryChart.vue'
import { buildAdminActivityChartDefinition } from '~/utils/roleDashboardCharts'

interface Props {
  data: ActivityChartData | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const { t } = useI18n()

const definition = computed(() => buildAdminActivityChartDefinition(props.data))

const chartConfig = computed<ChartConfig>(() => ({
  milestones: {
    label: t('dashboard.chart.series.milestones'),
    color: 'var(--color-chart-1)',
  },
  projects: {
    label: t('dashboard.chart.series.projects'),
    color: 'var(--color-chart-2)',
  },
}))
</script>

<template>
  <RoleDashboardPrimaryChart
    card-test-id="activity-section"
    chart-area-test-id="activity-chart"
    :loading="loading"
    :definition="definition"
    :chart-config="chartConfig"
    title-key="admin.dashboard.activity.title"
    empty-title-key="dashboard.chart.admin.emptyTitle"
    empty-description-key="dashboard.chart.admin.emptyDescription"
    empty-action-href="/projects"
    empty-action-label-key="dashboard.chart.admin.emptyAction"
  />
</template>
