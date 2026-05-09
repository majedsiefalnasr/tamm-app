<script setup lang="ts">
import { FolderOpen, Users, TrendingUp, AlertCircle } from 'lucide-vue-next'
import { Skeleton } from '../ui/skeleton'

interface Stat {
  title: string
  value: number
  icon: string
  tone: 'primary' | 'default' | 'accent' | 'danger'
  isCurrency?: boolean
  link?: string
}

interface Props {
  stats: Stat[]
  disputesStat: Stat | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const { t, locale } = useI18n()

const iconMap = {
  FolderOpen,
  Users,
  TrendingUp,
  AlertCircle,
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
</script>

<template>
  <div
    :class="[
      'grid gap-4',
      'grid-cols-1',
      'md:grid-cols-2',
      disputesStat ? 'lg:grid-cols-4' : 'lg:grid-cols-3',
    ]"
  >
    <NuxtLink
      v-for="stat in stats"
      :key="stat.title"
      :to="stat.link || '#'"
      :data-testid="`stat-link-${stat.title}`"
      class="border-border bg-card shadow-card rounded-2xl border p-4 transition hover:shadow-md"
    >
      <div class="space-y-3">
        <div v-if="loading" class="space-y-3">
          <Skeleton class="h-4 w-24" />
          <Skeleton class="h-8 w-16" />
        </div>

        <template v-else>
          <div class="flex items-start justify-between">
            <p class="text-muted-foreground text-sm font-medium">
              {{ $t(stat.title) }}
            </p>
            <component
              :is="getIcon(stat.icon)"
              :class="['h-4 w-4', toneClasses[stat.tone]]"
            />
          </div>
          <p class="text-ink text-2xl font-extrabold">
            {{ formatValue(stat.value, stat.isCurrency) }}
          </p>
        </template>
      </div>
    </NuxtLink>

    <!-- Disputes stat (optional, only show if count > 0) -->
    <NuxtLink
      v-if="disputesStat && !loading"
      :to="disputesStat.link || '#'"
      data-testid="stat-link-disputes"
      class="border-border bg-card shadow-card rounded-2xl border p-4 transition hover:shadow-md"
    >
      <div class="space-y-3">
        <div class="flex items-start justify-between">
          <p class="text-muted-foreground text-sm font-medium">
            {{ $t(disputesStat.title) }}
          </p>
          <component
            :is="getIcon(disputesStat.icon)"
            :class="['h-4 w-4', toneClasses[disputesStat.tone]]"
          />
        </div>
        <p class="text-ink text-2xl font-extrabold">
          {{ formatValue(disputesStat.value) }}
        </p>
      </div>
    </NuxtLink>
  </div>
</template>
