<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Milestone } from '~/shared/types/project'
import { usePermission } from '~/composables/usePermission'
import { useI18n } from 'vue-i18n'
import { Button } from '~/components/ui/button'
import ApprovalFlow from '~/components/milestone/ApprovalFlow.vue'
import { formatDate } from '~/utils/formatters'

interface Props {
  milestone: Milestone
  isExpanded?: boolean
}

interface Emits {
  (e: 'toggle'): void
  (e: 'action-complete'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()
const { can } = usePermission()
const showApprovalDialog = ref(false)

const canReview = computed(() =>
  can('review_milestone', props.milestone.allowed_actions)
)

const handleActionComplete = () => {
  showApprovalDialog.value = false
  emit('action-complete')
}

const projectId = computed(
  () => props.milestone.project_id ?? props.milestone.project?.id ?? ''
)

const projectLabel = computed(
  () => props.milestone.project?.name ?? t('milestone.project_unknown')
)

const submittedAtSource = computed(
  () =>
    props.milestone.latest_report?.submitted_at ??
    props.milestone.updated_at ??
    props.milestone.created_at
)
</script>

<template>
  <div class="bg-card hover:shadow-card mb-3 rounded-lg border p-4 transition">
    <!-- Header row -->
    <div class="flex items-start justify-between gap-4">
      <!-- Left side: milestone info -->
      <div class="min-w-0 flex-1">
        <div class="mb-1 flex flex-wrap items-baseline gap-2">
          <NuxtLink
            v-if="projectId"
            :to="`/projects/${projectId}`"
            class="text-ink text-sm font-semibold hover:underline"
          >
            {{ projectLabel }}
          </NuxtLink>
          <span v-else class="text-ink text-sm font-semibold">{{
            projectLabel
          }}</span>
          <span class="text-muted-foreground text-sm">›</span>
          <NuxtLink
            v-if="projectId"
            :to="`/projects/${projectId}/milestones/${props.milestone.id}`"
            class="text-foreground text-sm hover:underline"
          >
            {{ props.milestone.name }}
          </NuxtLink>
          <span v-else class="text-foreground text-sm">{{
            props.milestone.name
          }}</span>
        </div>

        <!-- Metadata row -->
        <div class="text-muted-foreground flex flex-wrap gap-x-2 text-xs">
          <span>{{
            $t('dashboard.supervisor.submittedAt', {
              date: formatDate(submittedAtSource),
            })
          }}</span>
          <span v-if="props.milestone.field_engineer?.name">{{
            $t('dashboard.supervisor.byEngineer', {
              name: props.milestone.field_engineer.name,
            })
          }}</span>
        </div>
      </div>

      <!-- Right side: action button -->
      <div class="flex-shrink-0">
        <Button
          v-if="canReview"
          variant="default"
          size="sm"
          class="touch-target"
          @click="showApprovalDialog = true"
        >
          {{ $t('milestone.actions.viewReport') }}
        </Button>
      </div>
    </div>

    <!-- Approval flow dialog -->
    <ApprovalFlow
      :open="showApprovalDialog"
      :milestone="props.milestone"
      @update:open="showApprovalDialog = $event"
      @approved="handleActionComplete"
      @rejected="handleActionComplete"
    />
  </div>
</template>

<style scoped>
.touch-target {
  min-height: 44px;
  min-width: 44px;
}
</style>
