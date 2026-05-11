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
import type { RecentDispute } from '~/shared/types/admin'

interface Props {
  disputes: RecentDispute[]
  loading?: boolean
  titleKey?: string
  viewAllKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  titleKey: 'admin.dashboard.disputes.title',
  viewAllKey: 'admin.dashboard.disputes.view_all',
})

const { t, locale } = useI18n()

const statusToneMap = {
  open: 'danger',
  mediating: 'info',
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
  <Card
    class="shadow-card gap-4 rounded-2xl py-6 shadow-none"
    data-testid="disputes-section"
  >
    <CardHeader>
      <CardTitle class="text-foreground text-lg font-extrabold">
        {{ t(props.titleKey) }}
      </CardTitle>
      <CardAction>
        <NuxtLink
          to="/disputes"
          class="text-primary hover:text-primary/80 text-sm font-medium transition"
          data-testid="disputes-view-all"
        >
          {{ t(props.viewAllKey) }}
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

      <template v-else-if="disputes.length > 0">
        <div
          class="border-border max-h-[min(28rem,70vh)] overflow-hidden rounded-lg border"
          data-testid="disputes-table-scroll"
        >
          <div class="max-h-full overflow-auto">
            <table class="w-full min-w-[800px] caption-bottom text-sm">
              <TableHeader>
                <TableRow class="bg-muted/50 hover:bg-muted/50 shadow-sm">
                  <TableHead
                    class="text-muted-foreground bg-muted/50 sticky top-0 z-20 font-semibold"
                  >
                    {{ t('admin.dashboard.disputes.columns.dispute_number') }}
                  </TableHead>
                  <TableHead
                    class="text-muted-foreground bg-muted/50 sticky top-0 z-20 max-w-48 font-semibold"
                  >
                    {{ t('admin.dashboard.disputes.columns.project') }}
                  </TableHead>
                  <TableHead
                    class="text-muted-foreground bg-muted/50 sticky top-0 z-20 max-w-40 font-semibold"
                  >
                    {{ t('admin.dashboard.disputes.columns.requester') }}
                  </TableHead>
                  <TableHead
                    class="text-muted-foreground bg-muted/50 sticky top-0 z-20 max-w-56 font-semibold"
                  >
                    {{ t('admin.dashboard.disputes.columns.subject') }}
                  </TableHead>
                  <TableHead
                    class="text-muted-foreground bg-muted/50 sticky top-0 z-20 font-semibold"
                  >
                    {{ t('admin.dashboard.disputes.columns.status') }}
                  </TableHead>
                  <TableHead
                    class="text-muted-foreground bg-muted/50 sticky top-0 z-20 font-semibold"
                  >
                    {{ t('admin.dashboard.disputes.columns.created_date') }}
                  </TableHead>
                  <TableHead
                    class="bg-muted/50 sticky inset-e-0 top-0 z-30 w-1 text-center font-semibold whitespace-nowrap"
                    scope="col"
                  >
                    <span class="sr-only">{{
                      t('admin.dashboard.disputes.columns.view_aria')
                    }}</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow
                  v-for="dispute in disputes"
                  :key="dispute.id"
                  class="group"
                >
                  <TableCell class="text-foreground font-medium">
                    {{ dispute.dispute_number }}
                  </TableCell>
                  <TableCell
                    class="text-foreground max-w-48 truncate"
                    :title="
                      dispute.project_display_key
                        ? t(dispute.project_display_key)
                        : dispute.project_name
                    "
                  >
                    {{
                      dispute.project_display_key
                        ? t(dispute.project_display_key)
                        : dispute.project_name
                    }}
                  </TableCell>
                  <TableCell
                    class="text-muted-foreground max-w-40 truncate"
                    :title="
                      dispute.requester_label_key
                        ? t(dispute.requester_label_key)
                        : dispute.requester_name
                    "
                  >
                    {{
                      dispute.requester_label_key
                        ? t(dispute.requester_label_key)
                        : dispute.requester_name
                    }}
                  </TableCell>
                  <TableCell
                    class="text-muted-foreground max-w-56 truncate"
                    :title="
                      dispute.subject_key
                        ? t(dispute.subject_key)
                        : dispute.subject
                    "
                  >
                    {{
                      dispute.subject_key
                        ? t(dispute.subject_key)
                        : dispute.subject
                    }}
                  </TableCell>
                  <TableCell>
                    <span
                      class="inline-flex items-center rounded-full px-2 py-1 text-xs font-bold"
                      :class="{
                        'bg-red-100 text-red-700':
                          getStatusTone(dispute.status) === 'danger',
                        'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-200':
                          getStatusTone(dispute.status) === 'info',
                        'bg-primary/15 text-primary':
                          getStatusTone(dispute.status) === 'primary',
                      }"
                    >
                      {{ t(`dispute.status.${dispute.status}`) }}
                    </span>
                  </TableCell>
                  <TableCell class="text-muted-foreground">
                    {{ formatDate(dispute.created_at) }}
                  </TableCell>
                  <TableCell
                    class="bg-background group-hover:bg-muted/50 sticky inset-e-0 z-10 w-1 text-center whitespace-nowrap"
                  >
                    <div class="text-center">
                      <NuxtLink
                        :to="`/disputes/${dispute.id}`"
                        class="text-primary hover:bg-primary/10 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition"
                        :aria-label="
                          t('admin.dashboard.disputes.columns.view_aria')
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
          {{ t('admin.dashboard.empty_states.disputes') }}
        </p>
      </template>
    </CardContent>
  </Card>
</template>
