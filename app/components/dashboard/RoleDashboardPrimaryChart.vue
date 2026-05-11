<script setup lang="ts">
import { computed } from 'vue'
import { VisXYContainer, VisLine, VisAxis } from '@unovis/vue'
import { FitMode, TrimMode, TextAlign } from '@unovis/ts'
import type { ChartConfig } from '~/components/ui/chart'
import { ChartContainer } from '~/components/ui/chart'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Skeleton } from '~/components/ui/skeleton'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '~/components/ui/empty'
import { ChartSpline } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import type {
  RoleDashboardChartDefinition,
  RoleDashboardChartPoint,
} from '~/shared/types/role-dashboard-chart'

interface Props {
  loading?: boolean
  definition: RoleDashboardChartDefinition | null
  chartConfig: ChartConfig
  titleKey: string
  descriptionKey?: string
  emptyTitleKey: string
  emptyDescriptionKey: string
  emptyActionHref: string
  emptyActionLabelKey: string
  /** Root card test id (e.g. admin `activity-section`). */
  cardTestId?: string
  /** Wrapper around Vis/Unovis canvas for e2e (e.g. `activity-chart`). */
  chartAreaTestId?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  cardTestId: 'role-dashboard-primary-chart',
})

const { t, locale } = useI18n()

const rows = computed(() => [...(props.definition?.points ?? [])])

const xTickValues = computed(() => rows.value.map(r => r.x))

function formatXTick(xv: number): string {
  const row = rows.value.find(r => r.x === xv)
  const raw = row?.xLabel ?? String(xv)
  const kind = props.definition?.xTickKind
  if (kind === 'iso_month' && /^\d{4}-\d{2}$/.test(raw)) {
    const [y, m] = raw.split('-').map(Number)
    const loc = locale.value === 'ar' ? 'ar-EG' : 'en-US'
    return new Intl.DateTimeFormat(loc, {
      month: 'short',
      year: '2-digit',
      timeZone: 'UTC',
    }).format(new Date(Date.UTC(y, m - 1, 1)))
  }
  return raw
}

const yAccessors = computed(() => {
  const keys = props.definition?.seriesKeys ?? []
  return keys.map(key => (d: (typeof rows.value)[number]) => d.values[key] ?? 0)
})

const lineColors = computed(() => {
  const keys = props.definition?.seriesKeys ?? []
  return keys.map(k => props.chartConfig[k]?.color ?? 'var(--color-chart-1)')
})

function xAccessor(d: RoleDashboardChartPoint): number {
  return d.x
}
</script>

<template>
  <Card
    class="shadow-card gap-4 rounded-2xl py-6 shadow-none"
    :data-testid="cardTestId"
  >
    <CardHeader>
      <CardTitle class="text-foreground text-lg font-extrabold">
        {{ t(titleKey) }}
      </CardTitle>
      <CardDescription v-if="descriptionKey" class="text-muted-foreground">
        {{ t(descriptionKey) }}
      </CardDescription>
    </CardHeader>

    <CardContent>
      <div v-if="loading" class="space-y-3">
        <Skeleton class="aspect-video w-full rounded-xl" />
      </div>

      <div
        v-else-if="definition && rows.length > 0"
        class="chart-ltr w-full overflow-x-auto"
        :data-testid="chartAreaTestId"
      >
        <ChartContainer
          :config="chartConfig"
          class="min-h-[260px] w-full min-w-[280px]"
        >
          <template #default>
            <VisXYContainer :data="rows" :height="280">
              <VisLine
                :x="xAccessor"
                :y="yAccessors"
                :color="
                  (_d: unknown, i: number) =>
                    lineColors[i] ?? 'var(--color-chart-1)'
                "
              />
              <VisAxis
                type="x"
                :tick-values="xTickValues"
                :tick-format="formatXTick"
                :tick-text-angle="-35"
                :tick-text-align="TextAlign.Right"
                :tick-text-fit-mode="FitMode.Trim"
                :tick-text-trim-type="TrimMode.End"
                :tick-text-width="72"
                :grid-line="false"
                :domain-line="true"
              />
              <VisAxis
                type="y"
                :num-ticks="5"
                :grid-line="true"
                :tick-format="(v: number) => `${Math.round(v)}`"
              />
            </VisXYContainer>
          </template>
        </ChartContainer>
      </div>

      <Empty v-else class="border-border border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ChartSpline class="size-6 shrink-0" aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>{{ t(emptyTitleKey) }}</EmptyTitle>
          <EmptyDescription>{{ t(emptyDescriptionKey) }}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" size="sm" as-child>
            <NuxtLink :to="emptyActionHref">
              {{ t(emptyActionLabelKey) }}
            </NuxtLink>
          </Button>
        </EmptyContent>
      </Empty>
    </CardContent>
  </Card>
</template>

<style scoped>
.chart-ltr {
  direction: ltr;
}
</style>
