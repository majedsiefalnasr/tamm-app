<script setup lang="ts">
import { computed } from 'vue'
import SectionErrorCard from '~/components/common/SectionErrorCard.vue'
import { Card } from '~/components/ui/card'
import { Skeleton } from '~/components/ui/skeleton'
import { Badge } from '~/components/ui/badge'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '~/components/ui/empty'
import { ClipboardList } from 'lucide-vue-next'
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

function milestoneSortKey(m: Milestone): number {
  if (!m.deadline) return Number.POSITIVE_INFINITY
  const t = new Date(m.deadline).getTime()
  return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t
}

const sortedMilestones = computed(() => {
  const list = [...(props.milestones || [])]
  list.sort((a, b) => milestoneSortKey(a) - milestoneSortKey(b))
  return list
})

const handleMilestoneClick = (projectId: string, milestoneId: string) => {
  if (!projectId || !milestoneId) {
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
      <Card v-for="i in 3" :key="i" class="gap-0 rounded-2xl p-4 shadow-none">
        <Skeleton class="mb-2 h-4 w-40" />
        <Skeleton class="h-3 w-32" />
      </Card>
    </div>

    <!-- Error State -->
    <SectionErrorCard
      v-else-if="hasError"
      title-key="common.error_occurred"
      :detail="errorMessage || $t('errors.failed_to_load')"
      @retry="handleRetry"
    />

    <!-- Empty State -->
    <Empty
      v-else-if="sortedMilestones.length === 0"
      class="border-border bg-card"
    >
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ClipboardList />
        </EmptyMedia>
        <EmptyTitle>{{
          $t('dashboard.contractor.noActiveMilestones')
        }}</EmptyTitle>
        <EmptyDescription>{{ $t('common.none') }}</EmptyDescription>
      </EmptyHeader>
    </Empty>

    <!-- Active Milestones List -->
    <div v-else class="space-y-3">
      <Card
        v-for="milestone in sortedMilestones"
        :key="milestone.id"
        class="hover:shadow-elevated shadow-card cursor-pointer gap-0 rounded-2xl p-4 shadow-none transition-shadow"
        @click="
          handleMilestoneClick(
            milestone.project_id || milestone.project?.id || '',
            milestone.id
          )
        "
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
                    name: milestone.field_engineer?.name || $t('common.nA'),
                  })
                }}
              </p>
            </div>
            <Badge variant="secondary" class="bg-accent/15 text-accent">
              {{ $t(`status.${milestone.status}`) }}
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>
