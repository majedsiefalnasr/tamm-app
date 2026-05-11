<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Skeleton } from '~/components/ui/skeleton'
import { Card } from '~/components/ui/card'
import EmptyState from '~/components/common/EmptyState.vue'
import SectionErrorCard from '~/components/common/SectionErrorCard.vue'
import type { Milestone } from '~/shared/types/project'

interface Props {
  milestones: Array<
    Milestone & { project_name?: string; project_address?: string }
  >
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

const handleSubmitReport = (
  projectId: string | undefined,
  milestoneId: string
) => {
  if (!projectId) return
  router.push(`/projects/${projectId}/milestones/${milestoneId}/report/new`)
}
</script>

<template>
  <div class="space-y-4">
    <!-- Section Title -->
    <div class="flex items-center justify-between">
      <h2 class="text-ink text-lg font-semibold">
        {{ $t('dashboard.fieldEngineer.activeAssignments') }}
      </h2>
      <Badge v-if="!loading && milestones.length" variant="secondary">
        {{ milestones.length }}
      </Badge>
    </div>

    <!-- Error State -->
    <SectionErrorCard
      v-if="hasError"
      :detail="errorMessage"
      @retry="emit('retry')"
    />

    <!-- Loading State -->
    <div v-else-if="loading" class="space-y-3">
      <Skeleton
        v-for="n in 3"
        :key="'fe-active-sk-' + n"
        class="h-32 w-full rounded-2xl"
      />
    </div>

    <!-- Empty State -->
    <EmptyState
      v-else-if="!milestones || milestones.length === 0"
      icon="clipboard"
      class="rounded-2xl py-8"
      title="dashboard.fieldEngineer.noActiveAssignments"
    />

    <!-- Milestones Grid -->
    <div v-else class="space-y-3">
      <Card
        v-for="milestone in milestones"
        :key="milestone.id"
        class="hover:shadow-elevated shadow-card gap-0 rounded-2xl p-4 shadow-none transition-shadow"
      >
        <!-- Project Info -->
        <div class="mb-3 flex flex-col gap-1">
          <p class="text-ink text-sm font-semibold">
            {{ milestone.project_name }}
          </p>
          <p
            v-if="milestone.project_address"
            class="text-muted-foreground text-xs"
          >
            {{ milestone.project_address }}
          </p>
        </div>

        <!-- Milestone Info -->
        <div class="mb-3 flex flex-col gap-1">
          <p class="text-foreground text-sm font-medium">
            {{ milestone.name }}
          </p>
        </div>

        <!-- Status Badge -->
        <div class="mb-4 flex items-center gap-2">
          <Badge
            class="bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-200"
          >
            {{ $t('status.in_progress') }}
          </Badge>
        </div>

        <!-- Submit Report Button -->
        <Button
          class="w-full"
          @click="handleSubmitReport(milestone.project_id, milestone.id)"
        >
          {{ $t('dashboard.fieldEngineer.submitReport') }}
        </Button>
      </Card>
    </div>
  </div>
</template>
