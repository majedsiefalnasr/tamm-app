<script setup lang="ts">
import { Skeleton } from '../ui/skeleton'
import type { RecentProject } from '~/shared/types/admin'

interface Props {
  projects: RecentProject[]
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false,
})

const { $t } = useI18n()

const statusToneMap = {
  new: 'primary',
  open_for_bids: 'default',
  under_review: 'default',
  contractor_selected: 'accent',
  active: 'success',
  in_progress: 'success',
  on_hold: 'warning',
  completed: 'default',
}

function getStatusTone(status: string) {
  return statusToneMap[status as keyof typeof statusToneMap] || 'default'
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    notation: 'compact',
  }).format(value)
}
</script>

<template>
  <div class="bg-card border-border shadow-card rounded-2xl border p-6">
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-foreground text-lg font-extrabold">
        {{ $t('admin.dashboard.projects.title') }}
      </h3>
      <NuxtLink
        to="/admin/projects"
        class="text-primary hover:text-primary/80 text-sm font-medium transition"
      >
        {{ $t('admin.dashboard.projects.view_all') }}
      </NuxtLink>
    </div>

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
                {{ $t('admin.dashboard.projects.columns.project_number') }}
              </th>
              <th
                class="text-muted-foreground px-3 py-3 text-start font-semibold"
              >
                {{ $t('admin.dashboard.projects.columns.name') }}
              </th>
              <th
                class="text-muted-foreground px-3 py-3 text-start font-semibold"
              >
                {{ $t('admin.dashboard.projects.columns.city') }}
              </th>
              <th
                class="text-muted-foreground px-3 py-3 text-start font-semibold"
              >
                {{ $t('admin.dashboard.projects.columns.owner') }}
              </th>
              <th
                class="text-muted-foreground px-3 py-3 text-start font-semibold"
              >
                {{ $t('admin.dashboard.projects.columns.progress') }}
              </th>
              <th
                class="text-muted-foreground px-3 py-3 text-start font-semibold"
              >
                {{ $t('admin.dashboard.projects.columns.status') }}
              </th>
              <th
                class="text-muted-foreground px-3 py-3 text-start font-semibold"
              >
                {{ $t('admin.dashboard.projects.columns.action') }}
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
                {{ project.name }}
              </td>
              <td class="text-muted-foreground px-3 py-3 text-start">
                {{ project.city }}
              </td>
              <td class="text-muted-foreground px-3 py-3 text-start">
                {{ project.client_name }}
              </td>
              <td class="px-3 py-3 text-start">
                <div class="flex items-center gap-2">
                  <div class="bg-muted h-1.5 w-16 overflow-hidden rounded-full">
                    <div
                      class="bg-primary h-full transition-all"
                      :style="{ width: `${project.progress_percentage}%` }"
                    />
                  </div>
                  <span class="text-muted-foreground w-8 text-xs">
                    {{ project.progress_percentage }}%
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
                  {{ $t(`status.${project.status}`) }}
                </span>
              </td>
              <td class="px-3 py-3 text-start">
                <NuxtLink
                  :to="`/projects/${project.id}`"
                  class="text-primary hover:text-primary/80 font-medium transition"
                >
                  {{ $t('common.view') }}
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
        {{ $t('admin.dashboard.empty_states.projects') }}
      </p>
    </template>
  </div>
</template>
