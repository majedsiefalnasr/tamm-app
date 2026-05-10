<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Milestone } from '~/shared/types/project'
import { useMilestones } from '~/composables/useMilestones'
import ApprovalQueueItem from './ApprovalQueueItem.vue'
import ClientApprovalFlow from '~/components/milestone/ClientApprovalFlow.vue'
import EmptyState from '~/components/common/EmptyState.vue'
import ApprovalQueueSkeleton from '~/components/client/ApprovalQueueSkeleton.vue'
import ErrorState from '~/components/common/ErrorState.vue'

interface Props {
  items: Milestone[]
  loading: boolean
  error: string | null
}

interface Emits {
  (e: 'retry'): void
  (e: 'action-complete'): void
}

const { items, loading, error } = defineProps<Props>()
const emit = defineEmits<Emits>()

const { removePendingApproval } = useMilestones()
const selectedMilestone = ref<Milestone | null>(null)
const showApprovalDialog = ref(false)

const hasItems = computed(() => items.length > 0)

const handleApproveClick = (milestone: Milestone) => {
  selectedMilestone.value = milestone
  showApprovalDialog.value = true
}

const handleViewDetails = (milestone: Milestone) => {
  navigateTo(`/projects/${milestone.project_id}/milestones/${milestone.id}`)
}

/** Refresh queue after ClientApprovalFlow completes — toasts stay inside the flow */
const handleApprovalFinished = () => {
  if (selectedMilestone.value) {
    removePendingApproval(selectedMilestone.value.id)
  }
  showApprovalDialog.value = false
  selectedMilestone.value = null
  emit('action-complete')
}
</script>

<template>
  <div class="space-y-4">
    <!-- Loading state -->
    <ApprovalQueueSkeleton v-if="loading" />

    <!-- Error state -->
    <ErrorState
      v-else-if="error"
      :message="error"
      action-label="common.retry"
      @action="$emit('retry')"
    />

    <!-- Empty state -->
    <EmptyState
      v-else-if="!hasItems"
      icon="inbox"
      :title="$t('approval_queue.empty.title')"
      :description="$t('approval_queue.empty.description')"
    />

    <!-- List of pending approvals -->
    <div v-else class="space-y-3">
      <ApprovalQueueItem
        v-for="milestone in items"
        :key="milestone.id"
        :milestone="milestone"
        @approve="() => handleApproveClick(milestone)"
        @view-details="() => handleViewDetails(milestone)"
      />
    </div>

    <!-- Approval dialog -->
    <ClientApprovalFlow
      v-if="selectedMilestone"
      :open="showApprovalDialog"
      :milestone="selectedMilestone"
      @update:open="showApprovalDialog = $event"
      @approved="handleApprovalFinished"
      @rejected="handleApprovalFinished"
    />
  </div>
</template>
