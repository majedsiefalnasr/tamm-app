<script setup lang="ts">
import { Eye } from 'lucide-vue-next'
import { Skeleton } from '../ui/skeleton'
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
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
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 3" :key="`skeleton-${i}`" class="space-y-2 p-3">
          <Skeleton class="h-4 w-full" />
          <Skeleton class="h-4 w-3/4" />
        </div>
      </div>

      <template v-else-if="projects.length > 0">
        <div
          class="border-border max-h-[min(28rem,70vh)] overflow-hidden rounded-lg border"
          data-testid="projects-table-scroll"
        >
          <div class="max-h-full overflow-auto">
            <table class="w-full min-w-[720px] caption-bottom text-sm">
              <TableHeader>
                <TableRow class="bg-muted/50 hover:bg-muted/50 shadow-sm">
                  <TableHead
                    class="text-muted-foreground bg-muted/50 sticky top-0 z-20 font-semibold"
                  >
                    {{ t('admin.dashboard.projects.columns.project_number') }}
                  </TableHead>
                  <TableHead
                    class="text-muted-foreground bg-muted/50 sticky top-0 z-20 max-w-56 font-semibold"
                  >
                    {{ t('admin.dashboard.projects.columns.name') }}
                  </TableHead>
                  <TableHead
                    class="text-muted-foreground bg-muted/50 sticky top-0 z-20 font-semibold"
                  >
                    {{ t('admin.dashboard.projects.columns.city') }}
                  </TableHead>
                  <TableHead
                    class="text-muted-foreground bg-muted/50 sticky top-0 z-20 max-w-48 font-semibold"
                  >
                    {{ t('admin.dashboard.projects.columns.owner') }}
                  </TableHead>
                  <TableHead
                    class="text-muted-foreground bg-muted/50 sticky top-0 z-20 font-semibold"
                  >
                    {{ t('admin.dashboard.projects.columns.progress') }}
                  </TableHead>
                  <TableHead
                    class="text-muted-foreground bg-muted/50 sticky top-0 z-20 font-semibold"
                  >
                    {{ t('admin.dashboard.projects.columns.status') }}
                  </TableHead>
                  <TableHead
                    class="bg-muted/50 sticky inset-e-0 top-0 z-30 w-1 text-center font-semibold whitespace-nowrap"
                    scope="col"
                  >
                    <span class="sr-only">{{
                      t('admin.dashboard.projects.columns.view_aria')
                    }}</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow
                  v-for="project in projects"
                  :key="project.id"
                  class="group"
                >
                  <TableCell class="text-foreground font-medium">
                    {{ project.project_number }}
                  </TableCell>
                  <TableCell
                    class="text-foreground max-w-56 truncate"
                    :title="
                      project.name_key ? t(project.name_key) : project.name
                    "
                  >
                    {{ project.name_key ? t(project.name_key) : project.name }}
                  </TableCell>
                  <TableCell class="text-muted-foreground">
                    {{ project.city_key ? t(project.city_key) : project.city }}
                  </TableCell>
                  <TableCell
                    class="text-muted-foreground max-w-48 truncate"
                    :title="
                      project.client_name_key
                        ? t(project.client_name_key)
                        : project.client_name
                    "
                  >
                    {{
                      project.client_name_key
                        ? t(project.client_name_key)
                        : project.client_name
                    }}
                  </TableCell>
                  <TableCell>
                    <div class="flex items-center gap-2">
                      <div
                        class="bg-muted h-1.5 w-16 shrink-0 overflow-hidden rounded-full"
                      >
                        <div
                          class="bg-primary h-full transition-all"
                          :style="{
                            width: `${clampProgress(project.progress_percentage)}%`,
                          }"
                        />
                      </div>
                      <span class="text-muted-foreground w-8 shrink-0 text-xs">
                        {{ clampProgress(project.progress_percentage) }}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell
                    class="bg-background group-hover:bg-muted/50 sticky inset-e-0 z-10 w-1 text-center whitespace-nowrap"
                  >
                    <div class="text-center">
                      <NuxtLink
                        :to="`/projects/${project.id}`"
                        class="text-primary hover:bg-primary/10 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition"
                        :aria-label="
                          t('admin.dashboard.projects.columns.view_aria')
                        "
                      >
                        <Eye class="size-3.5 shrink-0" aria-hidden="true" />
                        {{ t('common.view') }}
                      </NuxtLink>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </table>
          </div>
        </div>
      </template>

      <template v-else>
        <p class="text-muted-foreground py-8 text-center">
          {{ t('admin.dashboard.empty_states.projects') }}
        </p>
      </template>
    </CardContent>
  </Card>
</template>
