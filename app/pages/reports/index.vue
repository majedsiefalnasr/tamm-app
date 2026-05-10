<script setup lang="ts">
import PageContentSkeleton from '~/components/common/PageContentSkeleton.vue'
import ErrorState from '~/components/common/ErrorState.vue'
import EmptyState from '~/components/common/EmptyState.vue'
import { Badge } from '~/components/ui/badge'
import { formatDate } from '~/utils/formatters'

definePageMeta({
  roles: [
    'client',
    'contractor',
    'field_engineer',
    'supervisor_engineer',
    'admin',
    'super_admin',
  ],
  pageTitle: 'pages.reports_title',
})

const { reports, loading, error, fetchReportsWorkspace } = useReports()

onMounted(() => {
  fetchReportsWorkspace()
})

const retryFetch = () => {
  fetchReportsWorkspace()
}

const showSkeleton = computed(() => loading.value && reports.value.length === 0)

const showEmpty = computed(
  () => !loading.value && !error.value && reports.value.length === 0
)

function formatReportStatus(status: string) {
  return status.replace(/_/g, ' ')
}
</script>

<template>
  <div class="space-y-6 px-4 py-6 md:px-6">
    <div>
      <h1 class="text-3xl font-bold">{{ $t('pages.reports_title') }}</h1>
      <p class="text-muted-foreground mt-2">
        {{ $t('pages.reports_subtitle') }}
      </p>
    </div>

    <PageContentSkeleton v-if="showSkeleton" :rows="6" />

    <ErrorState v-else-if="error" :message="error" @action="retryFetch" />

    <EmptyState
      v-else-if="showEmpty"
      icon="📋"
      title="pages.reports_empty_title"
      description="pages.reports_empty_description"
    />

    <div
      v-else
      class="border-border divide-y overflow-hidden rounded-xl border"
    >
      <div
        v-for="r in reports"
        :key="r.id"
        class="hover:bg-muted/40 flex flex-col gap-2 px-4 py-4 transition md:flex-row md:items-center md:justify-between"
      >
        <div class="min-w-0 flex-1 space-y-1">
          <p class="text-foreground font-semibold">
            {{ r.milestone_name }}
          </p>
          <p class="text-muted-foreground text-sm">
            {{ r.project_name }}
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2 md:justify-end">
          <Badge variant="secondary" class="capitalize">
            {{ formatReportStatus(r.status) }}
          </Badge>
          <span class="text-muted-foreground text-xs tabular-nums">
            {{ formatDate(r.submitted_at) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
