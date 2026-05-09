<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Skeleton } from '~/components/ui/skeleton'
import { AlertTriangle } from 'lucide-vue-next'
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

const { t } = useI18n()
const router = useRouter()

const handleSubmitReport = (
  projectId: string | undefined,
  milestoneId: string
) => {
  if (!projectId) return
  router.push(`/projects/${projectId}/milestones/${milestoneId}/report/new`)
}

const skeletonItems = computed(() => Array(3).fill(null))
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
    <div
      v-if="hasError"
      class="border-destructive/30 bg-destructive/5 flex items-start gap-3 rounded-2xl border p-4"
    >
      <AlertTriangle class="text-destructive mt-0.5 h-4 w-4 flex-shrink-0" />
      <div class="flex-1">
        <p class="text-destructive font-semibold">
          {{ $t('errors.failed_to_load') }}
        </p>
        <p class="text-muted-foreground mt-1 text-sm">
          {{ errorMessage }}
        </p>
        <Button size="sm" variant="outline" class="mt-3" @click="emit('retry')">
          {{ $t('buttons.retry') }}
        </Button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="space-y-3">
      <Skeleton
        v-for="i in skeletonItems"
        :key="i"
        class="h-32 w-full rounded-2xl"
      />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!milestones || milestones.length === 0"
      class="border-border/50 flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center"
    >
      <div class="text-muted-foreground">
        <svg
          class="mx-auto h-10 w-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <p class="text-muted-foreground text-sm font-medium">
        {{ $t('dashboard.fieldEngineer.noActiveAssignments') }}
      </p>
    </div>

    <!-- Milestones Grid -->
    <div v-else class="space-y-3">
      <div
        v-for="milestone in milestones"
        :key="milestone.id"
        class="border-border bg-card shadow-card hover:shadow-elevated rounded-2xl border p-4 transition-shadow"
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
      </div>
    </div>
  </div>
</template>
