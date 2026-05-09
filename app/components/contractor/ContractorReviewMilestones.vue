<script setup lang="ts">
import { Skeleton } from '~/components/ui/skeleton'
import { Badge } from '~/components/ui/badge'
import type { Milestone } from '~/shared/types/project'

interface Props {
  milestones: Milestone[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const { t } = useI18n()

const reviewerLabel = (milestone: Milestone) => {
  if (milestone.status === 'supervisor_approved') {
    return t('dashboard.contractor.awaitingClientApproval')
  }
  return t('dashboard.contractor.awaitingReview', {
    supervisorName: milestone.supervisor_name || 'Supervisor',
  })
}

const badgeVariant = (status: string) => {
  return status === 'supervisor_approved' ? 'secondary' : 'outline'
}

const badgeClass = (status: string) => {
  if (status === 'supervisor_approved') {
    return 'bg-accent/15 text-accent'
  }
  return 'bg-info/15 text-info'
}
</script>

<template>
  <div class="space-y-4">
    <!-- Section Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-ink text-lg font-extrabold">
        {{ $t('dashboard.contractor.underReview') }}
      </h2>
    </div>

    <!-- Skeleton Loading State -->
    <div v-if="loading" class="space-y-3">
      <div
        v-for="i in 2"
        :key="i"
        class="border-border bg-card rounded-2xl border p-4"
      >
        <Skeleton class="mb-2 h-4 w-40" />
        <Skeleton class="h-3 w-32" />
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="milestones.length === 0"
      class="border-border/50 bg-card/50 rounded-2xl border p-6 text-center"
    >
      <p class="text-muted-foreground text-sm">
        {{ $t('dashboard.contractor.noUnderReview') }}
      </p>
    </div>

    <!-- Review Milestones List -->
    <div v-else class="space-y-3">
      <div
        v-for="milestone in milestones"
        :key="milestone.id"
        class="border-border/50 bg-card rounded-2xl border p-4 opacity-75"
      >
        <div class="flex flex-col gap-2">
          <!-- Header: Milestone Name & Project -->
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1">
              <p class="text-ink text-sm font-semibold">
                {{ milestone.name }}
              </p>
              <p class="text-muted-foreground mt-1 text-sm">
                {{ milestone.project_name || t('common.project') }}
              </p>
            </div>
          </div>

          <!-- Reviewer Info & Status -->
          <div class="flex items-center justify-between gap-2">
            <p class="text-muted-foreground text-xs">
              {{ reviewerLabel(milestone) }}
            </p>
            <Badge
              :variant="badgeVariant(milestone.status)"
              :class="badgeClass(milestone.status)"
            >
              {{ $t(`status.${milestone.status}`) }}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
