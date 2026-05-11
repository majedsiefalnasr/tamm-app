<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '~/components/ui/empty'
import { ClipboardCheck } from 'lucide-vue-next'
import type { Milestone } from '~/shared/types/project'

interface Props {
  milestones: Array<
    Milestone & {
      project_name?: string
      project_address?: string
      order_number?: number
    }
  >
  loading?: boolean
  hasError?: boolean
  errorMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  hasError: false,
})

const { t } = useI18n()
const router = useRouter()

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'in_progress':
      return 'secondary'
    case 'under_review':
      return 'default'
    case 'supervisor_approved':
      return 'default'
    case 'approved':
      return 'default'
    default:
      return 'secondary'
  }
}

const getStatusLabel = (status: string) => {
  const key = `status.${status}`
  return t(key)
}

const handleSubmitReport = (
  projectId: string | undefined,
  milestoneId: string
) => {
  if (!projectId) return
  router.push(`/projects/${projectId}/milestones/${milestoneId}/report/new`)
}

const handleViewReport = (
  projectId: string | undefined,
  milestoneId: string
) => {
  if (!projectId) return
  router.push(`/projects/${projectId}/milestones/${milestoneId}/report`)
}

const handleCardClick = (
  projectId: string | undefined,
  milestoneId: string
) => {
  if (!projectId) return
  router.push(`/projects/${projectId}/milestones/${milestoneId}`)
}

const isActive = (status: string) => status === 'in_progress'

const emptyStateKey = computed(() => {
  // Determine which empty state message to show based on current filter
  // This will be determined by parent component tracking
  return 'pages.assignments.noAssignmentsActive'
})
</script>

<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Skeleton
        v-for="n in 3"
        :key="'asg-sk-' + n"
        class="h-40 w-full rounded-2xl"
      />
    </div>

    <!-- Empty State -->
    <Empty
      v-else-if="!milestones || milestones.length === 0"
      class="border-border bg-card"
    >
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ClipboardCheck />
        </EmptyMedia>
        <EmptyTitle>{{ $t(emptyStateKey) }}</EmptyTitle>
        <EmptyDescription>{{ $t('common.none') }}</EmptyDescription>
      </EmptyHeader>
    </Empty>

    <!-- Assignment Grid -->
    <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div
        v-for="milestone in milestones"
        :key="milestone.id"
        class="border-border bg-card shadow-card hover:shadow-elevated cursor-pointer rounded-2xl border p-4 transition-shadow"
        @click="handleCardClick(milestone.project_id, milestone.id)"
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
          <div class="flex items-center gap-2">
            <p class="text-foreground text-sm font-medium">
              {{ milestone.name }}
            </p>
            <span
              v-if="milestone.order_number"
              class="text-muted-foreground text-xs"
            >
              #{{ milestone.order_number }}
            </span>
          </div>
        </div>

        <!-- Status Badge -->
        <div class="mb-4">
          <Badge :variant="getStatusBadgeVariant(milestone.status)">
            {{ getStatusLabel(milestone.status) }}
          </Badge>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-2">
          <Button
            v-if="isActive(milestone.status)"
            size="sm"
            class="flex-1"
            @click.stop="handleSubmitReport(milestone.project_id, milestone.id)"
          >
            {{ $t('pages.assignments.submitReport') }}
          </Button>
          <Button
            v-else
            size="sm"
            variant="outline"
            class="flex-1"
            @click.stop="handleViewReport(milestone.project_id, milestone.id)"
          >
            {{ $t('pages.assignments.viewReport') }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
