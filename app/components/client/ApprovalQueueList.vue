<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Milestone } from '~/shared/types/project'
import { useI18n } from 'vue-i18n'
import { useMilestones } from '~/composables/useMilestones'
import { useNotifications } from '~/composables/useNotifications'
import ApprovalQueueItem from './ApprovalQueueItem.vue'
import ClientApprovalFlow from '~/components/milestone/ClientApprovalFlow.vue'
import EmptyState from '~/components/common/EmptyState.vue'
import PageSkeleton from '~/components/common/PageSkeleton.vue'
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

const { t } = useI18n()
const { removePendingApproval } = useMilestones()
const { notify } = useNotifications()

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

const handleApprovalSuccess = () => {
  if (selectedMilestone.value) {
    removePendingApproval(selectedMilestone.value.id)
    notify.success(t('success.milestone_approved'))
  }
  showApprovalDialog.value = false
  selectedMilestone.value = null
  emit('action-complete')
}

const handleApprovalError = () => {
  showApprovalDialog.value = false
}
</script>

<template>
  <div class="space-y-4">
    <!-- Loading state -->
    <PageSkeleton v-if="loading" />

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
      @approved="handleApprovalSuccess"
      @rejected="handleApprovalError"
    />
  </div>
</template>
