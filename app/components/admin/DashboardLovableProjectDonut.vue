<script setup lang="ts">
import { computed } from 'vue'
import type { AdminLovableProjectSlice } from '~/shared/types/admin'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

interface Props {
  slices: AdminLovableProjectSlice[]
  totalProjects: number
}

const props = defineProps<Props>()

const { t } = useI18n()

const sliceHex: Record<string, string> = {
  'bg-emerald-500': '#10b981',
  'bg-amber-500': '#f59e0b',
  'bg-blue-500': '#3b82f6',
  'bg-red-500': '#ef4444',
}

const donutStyle = computed(() => {
  let acc = 0
  const parts: string[] = []
  for (const s of props.slices) {
    const hex = sliceHex[s.color_class] ?? '#94a3b8'
    const start = acc
    acc += s.percent
    parts.push(`${hex} ${start}% ${acc}%`)
  }
  if (acc < 100) {
    parts.push(`transparent ${acc}% 100%`)
  }
  return { background: `conic-gradient(${parts.join(', ')})` }
})
</script>

<template>
  <Card
    class="shadow-card gap-2 rounded-2xl py-4 shadow-none"
    data-testid="dashboard-lovable-project-donut"
  >
    <CardHeader>
      <CardTitle class="text-foreground text-lg font-extrabold">
        {{ t('admin.dashboard.lovable.distribution.title') }}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div
        class="flex flex-col items-center gap-2 md:flex-row md:items-center md:justify-between"
      >
        <div
          class="relative flex h-44 w-44 shrink-0 items-center justify-center"
        >
          <div
            class="absolute inset-0 rounded-full"
            :style="donutStyle"
            aria-hidden="true"
          />
          <div
            class="bg-card border-border relative flex h-28 w-28 flex-col items-center justify-center rounded-full border-4 shadow-inner"
          >
            <span class="text-muted-foreground text-xs font-medium">
              {{ t('admin.dashboard.lovable.distribution.center_label') }}
            </span>
            <span class="text-foreground text-2xl font-extrabold tabular-nums">
              {{ totalProjects }}
            </span>
          </div>
        </div>
        <ul class="grid w-full max-w-sm gap-3 text-sm md:ms-4">
          <li
            v-for="(s, idx) in slices"
            :key="idx"
            class="flex items-center justify-between gap-2"
          >
            <span class="flex items-center gap-2">
              <span
                class="h-2.5 w-2.5 shrink-0 rounded-full"
                :class="s.color_class"
              />
              <span class="text-foreground font-medium">{{
                t(s.label_key)
              }}</span>
            </span>
            <span class="text-muted-foreground tabular-nums"
              >{{ s.percent }}%</span
            >
          </li>
        </ul>
      </div>
    </CardContent>
  </Card>
</template>
