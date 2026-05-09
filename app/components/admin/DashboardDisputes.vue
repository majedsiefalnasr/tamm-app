<script setup lang="ts">
import { Skeleton } from '../ui/skeleton'
import type { RecentDispute } from '~/shared/types/admin'

interface Props {
  disputes: RecentDispute[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const { t, locale } = useI18n()

const statusToneMap = {
  open: 'danger',
  mediating: 'accent',
  resolved: 'primary',
}

function getStatusTone(status: string) {
  const tone = statusToneMap[status as keyof typeof statusToneMap]
  if (!tone) {
    console.error(`[DashboardDisputes] Unknown dispute status: "${status}"`)
    return 'default'
  }
  return tone
}

function formatDate(dateStr: string) {
  try {
    if (!dateStr) return 'N/A'
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return 'N/A'
    return new Intl.DateTimeFormat(locale.value, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date)
  } catch {
    return 'N/A'
  }
}
</script>

<template>
  <div
    class="bg-card border-border shadow-card rounded-2xl border p-6"
    data-testid="disputes-section"
  >
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-foreground text-lg font-extrabold">
        {{ t('admin.dashboard.disputes.title') }}
      </h3>
      <NuxtLink
        to="/admin/disputes"
        class="text-primary hover:text-primary/80 text-sm font-medium transition"
        data-testid="disputes-view-all"
      >
        {{ t('admin.dashboard.disputes.view_all') }}
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
    <template v-else-if="disputes.length > 0">
      <div class="overflow-x-auto" data-testid="disputes-table">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-border border-b">
              <th
                class="text-muted-foreground px-3 py-3 text-start font-semibold"
              >
                {{ t('admin.dashboard.disputes.columns.dispute_number') }}
              </th>
              <th
                class="text-muted-foreground px-3 py-3 text-start font-semibold"
              >
                {{ t('admin.dashboard.disputes.columns.project') }}
              </th>
              <th
                class="text-muted-foreground px-3 py-3 text-start font-semibold"
              >
                {{ t('admin.dashboard.disputes.columns.requester') }}
              </th>
              <th
                class="text-muted-foreground px-3 py-3 text-start font-semibold"
              >
                {{ t('admin.dashboard.disputes.columns.subject') }}
              </th>
              <th
                class="text-muted-foreground px-3 py-3 text-start font-semibold"
              >
                {{ t('admin.dashboard.disputes.columns.status') }}
              </th>
              <th
                class="text-muted-foreground px-3 py-3 text-start font-semibold"
              >
                {{ t('admin.dashboard.disputes.columns.created_date') }}
              </th>
              <th
                class="text-muted-foreground px-3 py-3 text-start font-semibold"
              >
                {{ t('admin.dashboard.disputes.columns.action') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="dispute in disputes"
              :key="dispute.id"
              class="border-border/50 hover:bg-muted/30 border-b transition"
            >
              <td class="text-foreground px-3 py-3 text-start font-medium">
                {{ dispute.dispute_number }}
              </td>
              <td class="text-foreground px-3 py-3 text-start">
                {{ dispute.project_name }}
              </td>
              <td class="text-muted-foreground px-3 py-3 text-start">
                {{ dispute.requester_name }}
              </td>
              <td class="text-muted-foreground px-3 py-3 text-start">
                {{ dispute.subject }}
              </td>
              <td class="px-3 py-3 text-start">
                <span
                  class="inline-flex items-center rounded-full px-2 py-1 text-xs font-bold"
                  :class="{
                    'bg-red-100 text-red-700':
                      getStatusTone(dispute.status) === 'danger',
                    'bg-amber-100 text-amber-700':
                      getStatusTone(dispute.status) === 'accent',
                    'bg-primary/15 text-primary':
                      getStatusTone(dispute.status) === 'primary',
                  }"
                >
                  {{ t(`dispute.status.${dispute.status}`) }}
                </span>
              </td>
              <td class="text-muted-foreground px-3 py-3 text-start">
                {{ formatDate(dispute.created_at) }}
              </td>
              <td class="px-3 py-3 text-start">
                <NuxtLink
                  :to="`/admin/disputes/${dispute.id}`"
                  class="text-primary hover:text-primary/80 font-medium transition"
                >
                  {{ t('admin.dashboard.disputes.mediate') }}
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
        {{ t('admin.dashboard.empty_states.disputes') }}
      </p>
    </template>
  </div>
</template>
