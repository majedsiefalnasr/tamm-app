<script setup lang="ts">
import { Folder, CheckCircle, AlertCircle, Check } from 'lucide-vue-next'
import { Skeleton } from '../ui/skeleton'

interface SummaryCards {
  total: number
  active: number
  onHold: number
  completed: number
}

interface Props {
  summary: SummaryCards
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const { t } = useI18n()

const cards = computed(() => {
  return [
    {
      id: 'total',
      label: t('admin.projects.total_projects'),
      count: props.summary.total,
      icon: Folder,
      tone: 'primary',
    },
    {
      id: 'active',
      label: t('admin.projects.active_projects'),
      count: props.summary.active,
      icon: CheckCircle,
      tone: 'success',
    },
    {
      id: 'on_hold',
      label: t('admin.projects.on_hold_projects'),
      count: props.summary.onHold,
      icon: AlertCircle,
      tone: 'warning',
    },
    {
      id: 'completed',
      label: t('admin.projects.completed_projects'),
      count: props.summary.completed,
      icon: Check,
      tone: 'default',
    },
  ]
})
</script>

<template>
  <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
    <div
      v-for="card in cards"
      :key="card.id"
      class="border-border bg-card rounded-xl border p-4 shadow-sm transition hover:shadow-md"
    >
      <div class="space-y-2">
        <!-- Loading state -->
        <div v-if="loading" class="space-y-3">
          <Skeleton class="h-4 w-24" />
          <Skeleton class="h-8 w-16" />
        </div>

        <!-- Content -->
        <template v-else>
          <div class="flex items-start justify-between">
            <p class="text-muted-foreground text-sm font-medium">
              {{ card.label }}
            </p>
            <component
              :is="card.icon"
              :class="[
                'h-4 w-4',
                card.tone === 'primary' && 'text-primary',
                card.tone === 'success' && 'text-green-600',
                card.tone === 'warning' && 'text-amber-600',
                card.tone === 'default' && 'text-muted-foreground',
              ]"
            />
          </div>
          <p class="text-ink text-2xl font-bold">
            {{ card.count }}
          </p>
        </template>
      </div>
    </div>
  </div>
</template>
