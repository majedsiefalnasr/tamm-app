<script setup lang="ts">
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

const { t } = useI18n()

const handleRetry = () => {
  emit('retry')
}

const reviewerLabel = (milestone: Milestone) => {
  if (milestone.status === 'supervisor_approved') {
    return t('dashboard.contractor.awaitingClientApproval')
  }
  const supervisorName =
    milestone.supervisor?.name ??
    milestone.supervisor_name ??
    t('dashboard.supervisorReviewerFallback')
  return t('dashboard.contractor.awaitingReview', {
    supervisorName,
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
      <Card v-for="i in 2" :key="i" class="gap-0 rounded-2xl p-4 shadow-none">
        <Skeleton class="mb-2 h-4 w-40" />
        <Skeleton class="h-3 w-32" />
      </Card>
    </div>

    <!-- Error State -->
    <Card
      v-else-if="hasError"
      class="border-destructive/30 bg-destructive/5 gap-0 rounded-2xl p-4 shadow-none"
    >
      <p class="text-destructive mb-3 text-sm font-medium">
        {{ errorMessage || $t('errors.failed_to_load') }}
      </p>
      <Button variant="outline" size="sm" @click="handleRetry">
        {{ $t('common.retry') }}
      </Button>
    </Card>

    <!-- Empty State -->
    <Card
      v-else-if="milestones.length === 0"
      class="border-border/50 bg-card/50 gap-0 rounded-2xl p-6 text-center shadow-none"
    >
      <p class="text-muted-foreground text-sm">
        {{ $t('dashboard.contractor.noUnderReview') }}
      </p>
    </Card>

    <!-- Review Milestones List -->
    <div v-else class="space-y-3">
      <Card
        v-for="milestone in milestones"
        :key="milestone.id"
        class="border-border/50 gap-0 rounded-2xl p-4 opacity-75 shadow-none"
      >
        <div class="flex flex-col gap-2">
          <!-- Header: Milestone Name & Project -->
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1">
              <p class="text-ink text-sm font-semibold">
                {{ milestone.name }}
              </p>
              <p class="text-muted-foreground mt-1 text-sm">
                {{ milestone.project?.name || t('common.project') }}
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
      </Card>
    </div>
  </div>
</template>
