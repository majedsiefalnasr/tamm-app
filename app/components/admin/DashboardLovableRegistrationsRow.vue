<script setup lang="ts">
import type {
  AdminLovableRegistrationRow,
  AdminLovableWeeklyBar,
} from '~/shared/types/admin'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

interface Props {
  latest: AdminLovableRegistrationRow[]
  weekly: AdminLovableWeeklyBar[]
  weeklyTotal: number
  weeklyDeltaPercent: number
}

defineProps<Props>()

const { t } = useI18n()

const barColors: Record<number, string> = {
  0: 'bg-emerald-500',
  1: 'bg-amber-500',
  2: 'bg-blue-500',
  3: 'bg-pink-500',
}

function relativeLabel(minutes: number): string {
  if (minutes < 120) {
    return t('time.minutes_ago', { count: minutes })
  }
  const h = Math.round(minutes / 60)
  return t('time.hours_ago', { count: h })
}

function barWidth(count: number, max: number): string {
  if (!max) return '0%'
  return `${Math.max(8, Math.round((count / max) * 100))}%`
}
</script>

<template>
  <div
    class="grid grid-cols-1 gap-4 lg:grid-cols-2"
    data-testid="dashboard-lovable-registrations"
  >
    <Card class="shadow-card gap-4 rounded-2xl py-6 shadow-none">
      <CardHeader>
        <CardTitle class="text-foreground text-lg font-extrabold">
          {{ t('admin.dashboard.lovable.registrations.latest_title') }}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul class="divide-border divide-y">
          <li
            v-for="row in latest"
            :key="row.id"
            class="flex flex-col gap-0.5 py-3 first:pt-0"
          >
            <span class="text-foreground font-semibold">{{
              t(row.name_key)
            }}</span>
            <span class="text-muted-foreground text-sm">
              {{ t(row.role_key) }} · {{ relativeLabel(row.minutes_ago) }}
            </span>
          </li>
        </ul>
      </CardContent>
    </Card>

    <Card class="shadow-card gap-4 rounded-2xl py-6 shadow-none">
      <CardHeader>
        <CardTitle class="text-foreground text-lg font-extrabold">
          {{ t('admin.dashboard.lovable.registrations.weekly_title') }}
        </CardTitle>
        <p class="text-muted-foreground text-sm">
          {{
            t('admin.dashboard.lovable.registrations.weekly_sub', {
              total: weeklyTotal,
              pct: weeklyDeltaPercent,
            })
          }}
        </p>
      </CardHeader>
      <CardContent class="space-y-4">
        <div v-for="(b, idx) in weekly" :key="b.role_key" class="space-y-1.5">
          <div class="flex justify-between text-sm">
            <span class="text-foreground font-medium">{{ t(b.role_key) }}</span>
            <span class="text-muted-foreground tabular-nums">{{
              b.count
            }}</span>
          </div>
          <div class="bg-muted h-2 w-full overflow-hidden rounded-full">
            <div
              class="h-full rounded-full transition-all"
              :class="barColors[idx] ?? 'bg-primary'"
              :style="{
                width: barWidth(
                  b.count,
                  Math.max(...weekly.map(x => x.count), 1)
                ),
              }"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
