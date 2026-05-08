<script setup lang="ts">
import { computed } from 'vue'
import type { Project } from '~/shared/types/project'
import { Badge } from '~/components/ui/badge'
import { Progress } from '~/components/ui/progress'

interface Props {
  project: Project
}

const props = defineProps<Props>()

// Format currency for display
const formatCurrency = (amount: number, currency: string = 'EGP'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount)
}

// Get status variant for Badge component
const statusVariant = computed(() => {
  const { status } = props.project
  switch (status) {
    case 'new':
      return 'secondary'
    case 'active':
    case 'completed':
      return 'default'
    case 'on_hold':
      return 'outline'
    case 'open_for_bids':
    case 'under_review':
      return 'secondary'
    default:
      return 'secondary'
  }
})

// Calculate progress ratio (0-100)
const progressPercentage = computed(() => {
  if (props.project.total_milestones === 0) return 0
  return Math.round(
    (props.project.completed_milestones / props.project.total_milestones) * 100
  )
})

// Show progress bar only if milestones exist
const showProgress = computed(() => props.project.total_milestones > 0)
</script>

<template>
  <NuxtLink
    :to="`/projects/${project.id}`"
    class="group border-border bg-card shadow-card hover:border-primary/40 hover:shadow-elevated rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5"
  >
    <!-- Project Name -->
    <h3 class="text-ink mb-3 text-base font-extrabold">
      {{ project.name }}
    </h3>

    <!-- Status Badge -->
    <div class="mb-3">
      <Badge :variant="statusVariant">
        {{ $t(`project.status.${project.status}`) }}
      </Badge>
    </div>

    <!-- Metadata Row -->
    <div class="text-muted-foreground mb-4 flex items-center gap-2 text-xs">
      <span>{{ project.city }}</span>
      <span>•</span>
      <span>{{ formatCurrency(project.budget, project.currency) }}</span>
    </div>

    <!-- Progress Bar (if milestones exist) -->
    <div v-if="showProgress" class="mb-4">
      <div
        class="text-muted-foreground mb-1 flex items-center justify-between text-xs"
      >
        <span>{{ $t('project.progress') }}</span>
        <span>{{ progressPercentage }}%</span>
      </div>
      <Progress :value="progressPercentage" class="h-2" />
    </div>

    <!-- Bottom Row: Contractor + Link -->
    <div class="border-border flex items-center justify-between border-t pt-4">
      <div class="text-muted-foreground text-xs">
        <span v-if="project.contractor_name">
          {{ project.contractor_name }}
        </span>
        <span v-else>
          {{ $t('project.no_contractor') }}
        </span>
      </div>
      <span class="text-primary text-xs font-bold group-hover:underline">
        {{ $t('project.view_details') }}
      </span>
    </div>
  </NuxtLink>
</template>
