<script setup lang="ts">
import {
  Building2,
  Users,
  Coins,
  AlertTriangle,
  FolderOpen,
  ClipboardList,
  Banknote,
  Briefcase,
  UserPlus,
} from 'lucide-vue-next'
import { Card } from '~/components/ui/card'
import { Skeleton } from '~/components/ui/skeleton'
import type { AdminLovablePrimaryKpi } from '~/shared/types/admin'

interface Props {
  items: AdminLovablePrimaryKpi[]
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false,
})

const { t, locale } = useI18n()

const iconMap = {
  Building2,
  Users,
  Coins,
  AlertTriangle,
  FolderOpen,
  ClipboardList,
  Banknote,
  Briefcase,
  UserPlus,
}

function iconFor(name: string) {
  return iconMap[name as keyof typeof iconMap] ?? FolderOpen
}

const toneIcon = {
  primary: 'text-blue-600 dark:text-blue-400',
  default: 'text-muted-foreground',
  accent: 'text-amber-600 dark:text-amber-400',
  danger: 'text-red-600 dark:text-red-400',
  success: 'text-emerald-600 dark:text-emerald-400',
  warning: 'text-amber-600 dark:text-amber-400',
}

function formatValue(
  value: number,
  format: AdminLovablePrimaryKpi['format'] | undefined
) {
  if (format === 'compact_sar') {
    return new Intl.NumberFormat(locale.value === 'ar' ? 'ar-SA' : 'en-SA', {
      style: 'currency',
      currency: 'SAR',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value)
  }
  return new Intl.NumberFormat(locale.value).format(value)
}

function subtitleFor(k: AdminLovablePrimaryKpi): string {
  if (k.subtitle_params) {
    return t(k.subtitle_key, k.subtitle_params)
  }
  return t(k.subtitle_key)
}
</script>

<template>
  <div
    class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
    data-testid="dashboard-lovable-primary-kpis"
  >
    <template v-if="loading">
      <Card
        v-for="i in 4"
        :key="`pk-skel-${i}`"
        class="rounded-2xl p-4 shadow-none"
      >
        <Skeleton class="h-4 w-24" />
        <Skeleton class="mt-2 h-8 w-20" />
      </Card>
    </template>
    <NuxtLink v-for="k in items" v-else :key="k.id" :to="k.href" class="block">
      <Card
        class="hover:border-border rounded-2xl p-4 shadow-none transition hover:shadow-md"
      >
        <div class="flex items-start justify-between gap-2">
          <p class="text-muted-foreground text-sm font-medium">
            {{ t(k.title_key) }}
          </p>
          <component
            :is="iconFor(k.icon)"
            :class="[
              'h-5 w-5 shrink-0',
              toneIcon[k.tone as keyof typeof toneIcon],
            ]"
            aria-hidden="true"
          />
        </div>
        <p class="text-foreground mt-2 text-2xl font-extrabold tabular-nums">
          {{ formatValue(k.value, k.format) }}
        </p>
        <p class="text-muted-foreground mt-1 text-xs">
          {{ subtitleFor(k) }}
        </p>
      </Card>
    </NuxtLink>
  </div>
</template>
