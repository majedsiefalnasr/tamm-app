<script setup lang="ts">
import { Badge } from '~/components/ui/badge'
import { Skeleton } from '~/components/ui/skeleton'
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
    <div
      v-else-if="!reports || reports.length === 0"
      class="border-border/50 flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center"
    >
      <div class="text-muted-foreground">
        <svg
          class="mx-auto h-10 w-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
      </div>
      <p class="text-muted-foreground text-sm font-medium">
        {{ $t('dashboard.fieldEngineer.noRecentReports') }}
      </p>
    </div>

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
