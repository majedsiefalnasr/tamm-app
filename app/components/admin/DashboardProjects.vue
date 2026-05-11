<script setup lang="ts">
import { Skeleton } from '../ui/skeleton'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '../ui/card'
import type { RecentProject } from '~/shared/types/admin'

interface Props {
  projects: RecentProject[]
  loading?: boolean
  /** i18n key for card title (default: admin dashboard projects table). */
  titleKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  titleKey: 'admin.dashboard.projects.title',
})

const { t } = useI18n()

const statusToneMap = {
  new: 'primary',
  open_for_bids: 'default',
  under_review: 'default',
  contractor_selected: 'accent',
  active: 'success',
  in_progress: 'success',
  on_hold: 'warning',
  waiting: 'warning',
  completed: 'default',
}

function getStatusTone(status: string) {
  const tone = statusToneMap[status as keyof typeof statusToneMap]
  if (!tone) {
    console.error(`[DashboardProjects] Unknown project status: "${status}"`)
    return 'default'
  }
  return tone
}

function clampProgress(percentage: number): number {
  return Math.max(0, Math.min(100, Math.round(percentage)))
}
</script>

<template>
  <Card
    class="shadow-card gap-4 rounded-2xl py-6 shadow-none"
    data-testid="projects-section"
  >
    <CardHeader>
      <CardTitle class="text-foreground text-lg font-extrabold">
        {{ t(props.titleKey) }}
      </CardTitle>
      <CardAction>
        <NuxtLink
          to="/projects"
          class="text-primary hover:text-primary/80 text-sm font-medium transition"
          data-testid="projects-view-all"
        >
          {{ t('admin.dashboard.projects.view_all') }}
        </NuxtLink>
      </CardAction>
    </CardHeader>

    <CardContent>
      <!-- Loading state -->
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 3" :key="`skeleton-${i}`" class="space-y-2 p-3">
          <Skeleton class="h-4 w-full" />
          <Skeleton class="h-4 w-3/4" />
        </div>
      </div>

      <!-- Table -->
      <template v-else-if="projects.length > 0">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-border border-b">
                <th
                  class="text-muted-foreground px-3 py-3 text-start font-semibold"
                >
                  {{ t('admin.dashboard.projects.columns.project_number') }}
                </th>
                <th
                  class="text-muted-foreground px-3 py-3 text-start font-semibold"
                >
                  {{ t('admin.dashboard.projects.columns.name') }}
                </th>
                <th
                  class="text-muted-foreground px-3 py-3 text-start font-semibold"
                >
                  {{ t('admin.dashboard.projects.columns.city') }}
                </th>
                <th
                  class="text-muted-foreground px-3 py-3 text-start font-semibold"
                >
                  {{ t('admin.dashboard.projects.columns.owner') }}
                </th>
                <th
                  class="text-muted-foreground px-3 py-3 text-start font-semibold"
                >
                  {{ t('admin.dashboard.projects.columns.progress') }}
                </th>
                <th
                  class="text-muted-foreground px-3 py-3 text-start font-semibold"
                >
                  {{ t('admin.dashboard.projects.columns.status') }}
                </th>
                <th
                  class="text-muted-foreground px-3 py-3 text-start font-semibold"
                >
                  {{ t('admin.dashboard.projects.columns.action') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="project in projects"
                :key="project.id"
                class="border-border/50 hover:bg-muted/30 border-b transition"
              >
                <td class="text-foreground px-3 py-3 text-start font-medium">
                  {{ project.project_number }}
                </td>
                <td class="text-foreground px-3 py-3 text-start">
                  {{ project.name_key ? t(project.name_key) : project.name }}
                </td>
                <td class="text-muted-foreground px-3 py-3 text-start">
                  {{ project.city_key ? t(project.city_key) : project.city }}
                </td>
                <td class="text-muted-foreground px-3 py-3 text-start">
                  {{
                    project.client_name_key
                      ? t(project.client_name_key)
                      : project.client_name
                  }}
                </td>
                <td class="px-3 py-3 text-start">
                  <div class="flex items-center gap-2">
                    <div
                      class="bg-muted h-1.5 w-16 overflow-hidden rounded-full"
                    >
                      <div
                        class="bg-primary h-full transition-all"
                        :style="{
                          width: `${clampProgress(project.progress_percentage)}%`,
                        }"
                      />
                    </div>
                    <span class="text-muted-foreground w-8 text-xs">
                      {{ clampProgress(project.progress_percentage) }}%
                    </span>
                  </div>
                </td>
                <td class="px-3 py-3 text-start">
                  <span
                    class="inline-flex items-center rounded-full px-2 py-1 text-xs font-bold"
                    :class="{
                      'bg-primary/15 text-primary':
                        getStatusTone(project.status) === 'primary',
                      'bg-green-100 text-green-700':
                        getStatusTone(project.status) === 'success',
                      'bg-amber-100 text-amber-700':
                        getStatusTone(project.status) === 'warning',
                      'bg-muted text-muted-foreground':
                        getStatusTone(project.status) === 'default',
                    }"
                  >
                    {{ t(`project.status.${project.status}`) }}
                  </span>
                </td>
                <td class="px-3 py-3 text-start">
                  <NuxtLink
                    :to="`/projects/${project.id}`"
                    class="text-primary hover:text-primary/80 font-medium transition"
                  >
                    {{ t('common.view') }}
                  </NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <!-- Empty state -->
      <template v-else>
        <p class="text-muted-foreground py-8 text-center">
          {{ t('admin.dashboard.empty_states.projects') }}
        </p>
      </template>
    </CardContent>
  </Card>
</template>
