<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Milestone, ProjectDetail } from '~/shared/types/project'
import { usePermission } from '~/composables/usePermission'
import { useMilestones } from '~/composables/useMilestones'
import { Button } from '~/components/ui/button'

interface Props {
  milestone: Milestone
  project: ProjectDetail
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
})

const emits = defineEmits<{
  actionComplete: []
  submitReport: []
}>()

const { t } = useI18n()
const { can } = usePermission()
const { approveMilestone, rejectMilestone } = useMilestones()

const visibleActions = computed(() => {
  const actions = []
  const { milestone } = props

  // Submit Report (field_engineer, in_progress only)
  if (
    milestone.status === 'in_progress' &&
    can('submit_report', milestone.allowed_actions)
  ) {
    actions.push({
      type: 'submit_report',
      label: t('milestone.actions.submitReport'),
      variant: 'default',
    })
  }

  // View Report (supervisor_engineer, under_review only)
  if (
    milestone.status === 'under_review' &&
    can('view_report', milestone.allowed_actions)
  ) {
    actions.push({
      type: 'view_report',
      label: t('milestone.actions.viewReport'),
      variant: 'outline',
    })
  }

  // Approve (supervisor_engineer, under_review only)
  if (
    milestone.status === 'under_review' &&
    can('approve_milestone', milestone.allowed_actions)
  ) {
    actions.push({
      type: 'approve_supervisor',
      label: t('milestone.actions.approveMilestone'),
      variant: 'default',
    })
  }

  // Reject (supervisor_engineer, under_review only)
  if (
    milestone.status === 'under_review' &&
    can('reject_milestone', milestone.allowed_actions)
  ) {
    actions.push({
      type: 'reject_supervisor',
      label: t('milestone.actions.rejectMilestone'),
      variant: 'destructive',
    })
  }

  // Approve (client, supervisor_approved only)
  if (
    milestone.status === 'supervisor_approved' &&
    can('approve_milestone', milestone.allowed_actions)
  ) {
    actions.push({
      type: 'approve_client',
      label: t('milestone.actions.approveMilestone'),
      variant: 'default',
    })
  }

  // Reject (client, supervisor_approved only)
  if (
    milestone.status === 'supervisor_approved' &&
    can('reject_milestone', milestone.allowed_actions)
  ) {
    actions.push({
      type: 'reject_client',
      label: t('milestone.actions.rejectMilestone'),
      variant: 'destructive',
    })
  }

  // Pay Milestone (client, not_started only)
  if (
    milestone.status === 'not_started' &&
    can('pay_milestone', milestone.allowed_actions)
  ) {
    actions.push({
      type: 'pay_milestone',
      label: t('milestone.actions.payMilestone'),
      variant: 'default',
    })
  }

  return actions
})

const handleAction = async (actionType: string) => {
  try {
    switch (actionType) {
      case 'approve_supervisor':
      case 'approve_client':
        await approveMilestone(
          props.milestone.id,
          actionType.includes('supervisor') ? 'supervisor_engineer' : 'client'
        )
        emits('actionComplete')
        break
      case 'reject_supervisor':
      case 'reject_client':
        // For now, use empty reason; Story 03-04/03-05 will add dialogs
        await rejectMilestone(props.milestone.id, 'Rejected by user')
        emits('actionComplete')
        break
      case 'submit_report':
        emits('submitReport')
        break
      case 'view_report':
        // Story 03-02 will implement detail page
        console.log('View report action - to be implemented in Story 03-02')
        break
      case 'pay_milestone':
        // Story 04-01 will implement payment
        console.log('Pay milestone action - to be implemented in Story 04-01')
        break
    }
  } catch (error) {
    console.error(`Error executing action ${actionType}:`, error)
  }
}
</script>

<template>
  <div v-if="visibleActions.length > 0" class="flex flex-wrap gap-2">
    <Button
      v-for="action in visibleActions"
      :key="action.type"
      :variant="action.variant"
      :disabled="isLoading"
      size="sm"
      class="text-xs"
      @click="handleAction(action.type)"
    >
      {{ action.label }}
    </Button>
  </div>
</template>
