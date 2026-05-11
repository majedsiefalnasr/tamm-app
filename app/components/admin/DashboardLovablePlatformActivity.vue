<script setup lang="ts">
import { computed } from 'vue'
import type { AdminLovablePlatformPoint } from '~/shared/types/admin'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'

interface Props {
  points: AdminLovablePlatformPoint[]
}

const props = defineProps<Props>()

const { t, locale } = useI18n()

function formatMonth(iso: string) {
  const [y, m] = iso.split('-').map(Number)
  if (!y || !m) return iso
  const loc = locale.value === 'ar' ? 'ar-EG' : 'en-US'
  return new Intl.DateTimeFormat(loc, {
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(y, m - 1, 1)))
}

const chart = computed(() => {
  const pts = props.points
  if (!pts.length) return { lineD: '', areaD: '', ticks: [] as string[] }
  const values = pts.map(p => p.closed_projects)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const w = 320
  const h = 120
  const padX = 8
  const padY = 8
  const innerW = w - padX * 2
  const innerH = h - padY * 2
  const coords = values.map((v, i) => {
    const x = padX + (i / Math.max(values.length - 1, 1)) * innerW
    const y = padY + innerH - ((v - min) / span) * innerH
    return { x, y }
  })
  const lineD = coords
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(' ')
  const areaD = `${lineD} L ${coords[coords.length - 1]?.x.toFixed(1) ?? padX} ${padY + innerH} L ${coords[0]?.x.toFixed(1) ?? padX} ${padY + innerH} Z`
  const n = pts.length
  const tickIdx =
    n <= 6
      ? pts.map((_, i) => i)
      : [
          0,
          Math.floor(n / 5),
          Math.floor((2 * n) / 5),
          Math.floor((3 * n) / 5),
          Math.floor((4 * n) / 5),
          n - 1,
        ]
  const ticks = tickIdx.map(i => formatMonth(pts[i]?.month ?? ''))
  return { lineD, areaD, ticks }
})
</script>

<template>
  <Card
    class="shadow-card gap-4 rounded-2xl py-6 shadow-none"
    data-testid="dashboard-lovable-platform-activity"
  >
    <CardHeader>
      <CardTitle class="text-foreground text-lg font-extrabold">
        {{ t('admin.dashboard.lovable.activity.title') }}
      </CardTitle>
      <CardDescription>
        {{ t('admin.dashboard.lovable.activity.description') }}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div class="overflow-x-auto">
        <svg
          :viewBox="`0 0 320 140`"
          class="w-full min-w-[280px]"
          role="img"
          :aria-label="t('admin.dashboard.lovable.activity.title')"
        >
          <defs>
            <linearGradient id="adminActivityFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stop-color="rgb(16 185 129 / 0.35)" />
              <stop offset="100%" stop-color="rgb(16 185 129 / 0.02)" />
            </linearGradient>
          </defs>
          <path :d="chart.areaD" fill="url(#adminActivityFill)" stroke="none" />
          <path
            :d="chart.lineD"
            fill="none"
            stroke="#10b981"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <div
          class="text-muted-foreground mt-1 flex justify-between px-2 text-[10px] font-medium"
        >
          <span v-for="(lab, i) in chart.ticks" :key="i">{{ lab }}</span>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
