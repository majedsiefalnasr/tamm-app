<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '~/components/ui/button'
import { Card } from '~/components/ui/card'
import { Skeleton } from '~/components/ui/skeleton'
import { Badge } from '~/components/ui/badge'
import type { Milestone } from '~/shared/types/project'

interface Props {
  milestones: Milestone[]
  loading?: boolean
  hasError?: boolean
  errorMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  hasError: false,
})

const emit = defineEmits<{
  retry: []
}>()

const router = useRouter()

const sortedMilestones = computed(() => {
  return [...(props.milestones || [])]
})

const handleMilestoneClick = (projectId: string, milestoneId: string) => {
  if (!projectId || !milestoneId) {
    console.warn('Cannot navigate: missing projectId or milestoneId')
    return
  }
  router.push(`/projects/${projectId}/milestones/${milestoneId}`)
}

const handleRetry = () => {
  emit('retry')
}
</script>

<template>
  <div class="space-y-4">
    <!-- Section Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-ink text-lg font-extrabold">
        {{ $t('dashboard.contractor.activeMilestones') }}
      </h2>
    </div>

    <!-- Skeleton Loading State -->
    <div v-if="loading" class="space-y-3">
      <div
        v-for="i in 3"
        :key="i"
        class="border-border bg-card rounded-2xl border p-4"
      >
        <Skeleton class="mb-2 h-4 w-40" />
        <Skeleton class="h-3 w-32" />
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="hasError"
      class="border-destructive/30 bg-destructive/5 rounded-2xl border p-4"
    >
      <p class="text-destructive mb-3 text-sm font-medium">
        {{ errorMessage || $t('errors.failed_to_load') }}
      </p>
      <Button variant="outline" size="sm" @click="handleRetry">
        {{ $t('common.retry') }}
      </Button>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="sortedMilestones.length === 0"
      class="border-border/50 bg-card/50 rounded-2xl border p-6 text-center"
    >
      <p class="text-muted-foreground text-sm">
        {{ $t('dashboard.contractor.noActiveMilestones') }}
      </p>
    </div>

    <!-- Active Milestones List -->
    <div v-else class="space-y-3">
      <div
        v-for="milestone in sortedMilestones"
        :key="milestone.id"
        class="border-border bg-card shadow-card hover:shadow-elevated cursor-pointer rounded-2xl border p-4 transition-shadow"
        @click="handleMilestoneClick(milestone.project_id || '', milestone.id)"
      >
        <div class="flex flex-col gap-2">
          <!-- Header: Project & Milestone Names -->
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1">
              <p class="text-ink text-sm font-semibold">
                {{ milestone.project?.name || $t('common.project') }}
              </p>
              <p class="text-foreground mt-1 text-sm font-medium">
                {{ milestone.name }}
              </p>
            </div>
          </div>

          <!-- Engineer & Status -->
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <p class="text-muted-foreground text-xs">
                {{
                  $t('dashboard.contractor.engineer', {
                    name: milestone.field_engineer?.name || 'N/A',
                  })
                }}
              </p>
            </div>
            <Badge variant="secondary" class="bg-accent/15 text-accent">
              {{ $t(`status.${milestone.status}`) }}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
