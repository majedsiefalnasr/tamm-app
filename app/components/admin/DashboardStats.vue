<script setup lang="ts">
import {
  FolderOpen,
  AlertCircle,
  ClipboardList,
  Banknote,
  UserPlus,
  Briefcase,
} from 'lucide-vue-next'
import { Skeleton } from '../ui/skeleton'
import { Card } from '../ui/card'
import type { DashboardStatCard } from '~/composables/useAdminDashboard'

interface Props {
  stats: DashboardStatCard[]
  disputesStat: DashboardStatCard | null
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false,
})

const { t, locale } = useI18n()

const iconMap = {
  FolderOpen,
  AlertCircle,
  ClipboardList,
  Banknote,
  UserPlus,
  Briefcase,
}

function getIcon(iconName: string) {
  const icon = iconMap[iconName as keyof typeof iconMap]
  if (!icon) {
    console.error(
      `[DashboardStats] Unknown icon: "${iconName}", using AlertCircle`
    )
    return AlertCircle
  }
  return icon
}

const toneClasses = {
  primary: 'text-primary',
  default: 'text-muted-foreground',
  accent: 'text-accent',
  danger: 'text-destructive',
  success: 'text-green-600',
  warning: 'text-amber-600',
}

function formatValue(value: number, isCurrency?: boolean) {
  if (isCurrency) {
    return new Intl.NumberFormat(locale.value, {
      style: 'currency',
      currency: 'EGP',
      notation: 'compact',
      maximumFractionDigits: 0,
    }).format(value)
  }
  return new Intl.NumberFormat(locale.value).format(value)
}

const gridClass =
  'grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6'
</script>

<template>
  <div :class="gridClass">
    <template v-if="loading">
      <Card
        v-for="i in 5"
        :key="`stat-skel-${i}`"
        class="shadow-card gap-3 rounded-2xl p-4 shadow-none"
        :data-testid="`stat-skeleton-${i}`"
      >
        <Skeleton class="h-4 w-24" />
        <Skeleton class="h-8 w-16" />
      </Card>
      <Card
        class="shadow-card gap-3 rounded-2xl p-4 shadow-none"
        data-testid="stat-skeleton-disputes"
      >
        <Skeleton class="h-4 w-28" />
        <Skeleton class="h-8 w-12" />
      </Card>
    </template>

    <template v-else>
      <NuxtLink
        v-for="stat in stats"
        :key="stat.testId"
        :to="stat.link"
        :data-testid="stat.testId"
        class="block"
      >
        <Card
          class="shadow-card gap-3 rounded-2xl p-4 shadow-none transition hover:shadow-md"
        >
          <div class="flex items-start justify-between">
            <p class="text-muted-foreground text-sm font-medium">
              {{ t(stat.titleKey) }}
            </p>
            <component
              :is="getIcon(stat.icon)"
              :class="['h-4 w-4', toneClasses[stat.tone]]"
            />
          </div>
          <p class="text-ink text-2xl font-extrabold">
            {{ formatValue(stat.value, stat.isCurrency) }}
          </p>
        </Card>
      </NuxtLink>

      <NuxtLink
        v-if="disputesStat"
        :to="disputesStat.link"
        :data-testid="disputesStat.testId"
        class="block"
      >
        <Card
          class="shadow-card gap-3 rounded-2xl p-4 shadow-none transition hover:shadow-md"
        >
          <div class="flex items-start justify-between">
            <p class="text-muted-foreground text-sm font-medium">
              {{ t(disputesStat.titleKey) }}
            </p>
            <component
              :is="getIcon(disputesStat.icon)"
              :class="['h-4 w-4', toneClasses[disputesStat.tone]]"
            />
          </div>
          <p class="text-ink text-2xl font-extrabold">
            {{ formatValue(disputesStat.value) }}
          </p>
        </Card>
      </NuxtLink>
    </template>
  </div>
</template>
