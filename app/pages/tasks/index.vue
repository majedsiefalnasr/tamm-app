<script setup lang="ts">
import { computed, onMounted } from 'vue'
import PageContentSkeleton from '~/components/common/PageContentSkeleton.vue'
import ErrorState from '~/components/common/ErrorState.vue'
import EmptyState from '~/components/common/EmptyState.vue'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import type { ContractorTaskRow } from '~/composables/useContractorTasks'

definePageMeta({
  roles: ['contractor'],
  pageTitle: 'pages.contractor_tasks_title',
})

const { rows, loading, error, load } = useContractorTasks()

onMounted(() => {
  void load()
})

function retry() {
  void load()
}

const showSkeleton = computed(() => loading.value && rows.value.length === 0)

const showEmpty = computed(
  () => !loading.value && !error.value && rows.value.length === 0
)

function statusLabelKey(row: ContractorTaskRow): string {
  if (row.kind === 'milestone') {
    return `project.milestone.${row.statusKey}`
  }
  if (row.statusKey === 'pending') {
    return 'pages.contractor_tasks.task_pending'
  }
  if (row.statusKey === 'in_progress') {
    return 'status.in_progress'
  }
  if (row.statusKey === 'rejected') {
    return 'status.rejected'
  }
  return 'pages.contractor_tasks.task_pending'
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold">
        {{ $t('pages.contractor_tasks_title') }}
      </h1>
      <p class="text-muted-foreground mt-2">
        {{ $t('pages.contractor_tasks_subtitle') }}
      </p>
    </div>

    <PageContentSkeleton v-if="showSkeleton" :rows="8" />

    <ErrorState v-else-if="error" :message="error" @action="retry" />

    <EmptyState
      v-else-if="showEmpty"
      icon="clipboard"
      title="pages.contractor_tasks_empty_title"
      description="pages.contractor_tasks_empty_description"
    >
      <Button as-child variant="outline" class="mt-1">
        <NuxtLink to="/projects">{{
          $t('pages.contractor_tasks_empty_next')
        }}</NuxtLink>
      </Button>
    </EmptyState>

    <div
      v-else
      class="border-border divide-y overflow-hidden rounded-xl border"
    >
      <NuxtLink
        v-for="row in rows"
        :key="row.id"
        :to="`/projects/${row.projectId}/milestones/${row.milestoneId}`"
        class="hover:bg-muted/40 flex flex-col gap-2 px-4 py-4 transition md:flex-row md:items-center md:justify-between"
      >
        <div class="min-w-0 flex-1 space-y-1">
          <p class="text-foreground font-semibold">
            {{ row.title }}
          </p>
          <p class="text-muted-foreground text-sm">
            {{ row.detail }}
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2 md:justify-end">
          <Badge variant="secondary" class="capitalize">
            {{ $t(statusLabelKey(row)) }}
          </Badge>
          <span class="text-muted-foreground text-xs">
            {{
              row.kind === 'task'
                ? $t('pages.contractor_tasks.badge_task')
                : $t('pages.contractor_tasks.badge_milestone')
            }}
          </span>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
