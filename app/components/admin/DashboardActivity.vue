<script setup lang="ts">
import { Skeleton } from '../ui/skeleton'
import type { ActivityChartData } from '~/shared/types/admin'

interface Props {
  data: ActivityChartData | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const { t } = useI18n()

// Calculate chart dimensions and scale
const chartWidth = 600
const chartHeight = 300
const padding = 40

const computedData = computed(() => {
  if (!props.data || props.data.data.length === 0)
    return { points: [], maxValue: 0 }

  const values = props.data.data.map(d => d.milestones + d.projects)
  const maxValue = values.length > 0 ? Math.max(...values) : 10

  const points = props.data.data.map((item, idx) => {
    const xFraction =
      props.data!.data.length === 1 ? 0.5 : idx / (props.data!.data.length - 1)
    const x = padding + xFraction * (chartWidth - 2 * padding)
    const y =
      chartHeight -
      padding -
      ((item.milestones + item.projects) / maxValue) *
        (chartHeight - 2 * padding)
    return { x, y, value: item.milestones + item.projects, ...item }
  })

  return { points, maxValue }
})

const pathD = computed(() => {
  const { points } = computedData.value
  if (points.length === 0) return ''

  let path = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x} ${points[i].y}`
  }
  return path
})

const areaPathD = computed(() => {
  const { points } = computedData.value
  if (points.length === 0) return ''

  let path = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x} ${points[i].y}`
  }
  path += ` L ${points[points.length - 1].x} ${chartHeight - padding}`
  path += ` L ${points[0].x} ${chartHeight - padding} Z`
  return path
})

const hoveredIdx = ref<number | null>(null)
</script>

<template>
  <div class="bg-card border-border shadow-card rounded-2xl border p-6">
    <h3 class="text-foreground mb-4 text-lg font-extrabold">
      {{ t('admin.dashboard.activity.title') }}
    </h3>

    <!-- Loading state -->
    <div v-if="loading" class="space-y-3">
      <Skeleton class="h-64 w-full" />
    </div>

    <!-- Chart -->
    <template v-else-if="data && data.data.length > 0">
      <div class="overflow-x-auto">
        <svg :width="chartWidth" :height="chartHeight" class="mx-auto">
          <!-- Grid lines -->
          <line
            :x1="padding"
            :y1="chartHeight - padding"
            :x2="chartWidth - padding"
            :y2="chartHeight - padding"
            class="stroke-border"
            stroke-width="1"
          />

          <!-- Area -->
          <path :d="areaPathD" class="fill-primary/20" />

          <!-- Line -->
          <path
            :d="pathD"
            class="stroke-primary"
            stroke-width="2"
            fill="none"
          />

          <!-- Points -->
          <template
            v-for="(point, idx) in computedData.points"
            :key="`point-${idx}`"
          >
            <circle
              :cx="point.x"
              :cy="point.y"
              :r="hoveredIdx === idx ? 5 : 3"
              :class="[
                'transition-all',
                hoveredIdx === idx ? 'fill-primary' : 'fill-primary/60',
              ]"
              @mouseenter="hoveredIdx = idx"
              @mouseleave="hoveredIdx = null"
            />

            <!-- Tooltip -->
            <g v-if="hoveredIdx === idx" :key="`tooltip-${idx}`">
              <rect
                :x="point.x - 40"
                :y="point.y - 35"
                width="80"
                height="30"
                rx="4"
                ry="4"
                class="fill-foreground"
              />
              <text
                :x="point.x"
                :y="point.y - 15"
                text-anchor="middle"
                fill="white"
                font-size="12"
                font-weight="bold"
                :aria-label="`${point.month}: ${point.value} items`"
              >
                {{ point.value }}
              </text>
            </g>
          </template>

          <!-- X-axis labels -->
          <template v-for="(month, idx) in data.months" :key="`label-${idx}`">
            <text
              :x="
                data.months.length === 1
                  ? chartWidth / 2
                  : padding +
                    (idx / (data.months.length - 1)) *
                      (chartWidth - 2 * padding)
              "
              :y="chartHeight - padding + 20"
              text-anchor="middle"
              fill="currentColor"
              font-size="12"
              class="fill-muted-foreground"
            >
              {{ month ? month.substring(0, 3) : 'N/A' }}
            </text>
          </template>
        </svg>
      </div>
    </template>

    <!-- Empty state -->
    <template v-else>
      <p class="text-muted-foreground py-8 text-center">
        {{ t('common.no_data') }}
      </p>
    </template>
  </div>
</template>
