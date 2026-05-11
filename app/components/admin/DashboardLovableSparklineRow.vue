<script setup lang="ts">
import { Card } from '~/components/ui/card'
import { Skeleton } from '~/components/ui/skeleton'
import DashboardLovableMiniSparkline from '~/components/admin/DashboardLovableMiniSparkline.vue'
import type { AdminLovableSparklineKpi } from '~/shared/types/admin'

interface Props {
  items: AdminLovableSparklineKpi[]
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false,
})

const { t } = useI18n()

function sparklineValueLabel(item: AdminLovableSparklineKpi): string {
  if (item.value_display_key) {
    return t(item.value_display_key)
  }
  if (item.value_label_params) {
    return t(item.value_label_key, item.value_label_params)
  }
  return t(item.value_label_key)
}

const toneLine: Record<AdminLovableSparklineKpi['tone'], string> = {
  warning: 'text-amber-500',
  primary: 'text-blue-500',
  success: 'text-emerald-500',
}
</script>

<template>
  <div
    class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
    data-testid="dashboard-lovable-sparklines"
  >
    <template v-if="loading">
      <Card
        v-for="i in 4"
        :key="`sp-skel-${i}`"
        class="rounded-2xl p-4 shadow-none"
      >
        <Skeleton class="h-4 w-32" />
        <Skeleton class="mt-2 h-6 w-16" />
        <Skeleton class="mt-2 h-8 w-full" />
      </Card>
    </template>
    <NuxtLink
      v-for="item in items"
      v-else
      :key="item.id"
      :to="item.href"
      class="block"
    >
      <Card
        class="hover:border-border rounded-2xl p-4 shadow-none transition hover:shadow-md"
      >
        <p class="text-muted-foreground text-sm font-medium">
          {{ t(item.title_key) }}
        </p>
        <p class="text-foreground mt-1 text-lg font-bold tabular-nums">
          {{ sparklineValueLabel(item) }}
        </p>
        <div class="text-muted-foreground mt-2">
          <DashboardLovableMiniSparkline
            :series="item.series"
            :tone-class="toneLine[item.tone] ?? toneLine.primary"
          />
        </div>
      </Card>
    </NuxtLink>
  </div>
</template>
