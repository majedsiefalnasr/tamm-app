<script setup lang="ts">
import { Badge } from '~/components/ui/badge'
import { Skeleton } from '~/components/ui/skeleton'
import EmptyState from '~/components/common/EmptyState.vue'
import { Card } from '~/components/ui/card'
import type { ReportData } from '~/composables/useReports'
import { formatDate } from '~/utils/formatters'

interface Props {
  reports: ReportData[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const { t } = useI18n()
const router = useRouter()

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'under_review':
      return 'secondary'
    case 'supervisor_approved':
      return 'default'
    case 'approved':
      return 'default'
    default:
      return 'secondary'
  }
}

const getStatusLabel = (status: string) => {
  const key = `status.${status}`
  return t(key)
}

const handleReportClick = (projectId: string, milestoneId: string) => {
  router.push(`/projects/${projectId}/milestones/${milestoneId}`)
}
</script>

<template>
  <div class="space-y-4">
    <!-- Section Title -->
    <h2 class="text-ink text-lg font-semibold">
      {{ $t('dashboard.fieldEngineer.recentReports') }}
    </h2>

    <!-- Loading State -->
    <div v-if="loading" class="space-y-3">
      <Skeleton
        v-for="n in 2"
        :key="'fe-rep-sk-' + n"
        class="h-24 w-full rounded-2xl"
      />
    </div>

    <!-- Empty State -->
    <EmptyState
      v-else-if="!reports || reports.length === 0"
      icon="clipboard"
      class="rounded-2xl py-8"
      title="dashboard.fieldEngineer.noRecentReports"
    />

    <!-- Reports List -->
    <div v-else class="space-y-3">
      <Card
        v-for="report in reports"
        :key="report.id"
        class="border-border/50 hover:shadow-elevated cursor-pointer gap-0 rounded-2xl p-4 shadow-none transition-shadow"
        @click="handleReportClick(report.project_id, report.milestone_id)"
      >
        <!-- Milestone & Project Info -->
        <div class="mb-2 flex flex-col gap-1">
          <p class="text-ink text-sm font-semibold">
            {{ report.milestone_name }}
          </p>
          <p class="text-muted-foreground text-xs">
            {{ report.project_name }}
          </p>
        </div>

        <!-- Submission Date -->
        <p class="text-muted-foreground mb-3 text-xs">
          {{
            $t('dashboard.fieldEngineer.reportSubmittedOn', {
              date: formatDate(report.submitted_at),
            })
          }}
        </p>

        <!-- Status Badge -->
        <Badge
          :variant="getStatusBadgeVariant(report.current_milestone_status)"
        >
          {{ getStatusLabel(report.current_milestone_status) }}
        </Badge>
      </Card>
    </div>
  </div>
</template>
