<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ProjectDetail } from '~/shared/types/project'

interface Props {
  project: ProjectDetail
  isSubmitting?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{ transition: [status: string] }>()

const { t } = useI18n()
const auth = useAuthStore()

const dialogOpen = ref(false)
const selectedAction = ref<string | null>(null)
const isLoading = ref(false)

const canManageStatus = computed(() => {
  const role = auth.user?.role
  return role === 'admin' || role === 'super_admin'
})

const canActivate = computed(() => {
  if (!props.project) return false
  const hasMilestones = (props.project.milestones?.length ?? 0) > 0
  const hasEngineers =
    !!props.project.supervisor_name && !!props.project.field_engineer_name
  return hasMilestones && hasEngineers
})

const activateDisabledReason = computed(() => {
  if (!props.project) return ''
  const hasMilestones = (props.project.milestones?.length ?? 0) > 0
  const hasEngineers =
    !!props.project.supervisor_name && !!props.project.field_engineer_name

  if (!hasMilestones && !hasEngineers) {
    return t('project.errors.requirementsNotMet')
  }
  if (!hasMilestones) {
    return t('project.errors.milestonesNotDefined')
  }
  if (!hasEngineers) {
    return t('project.errors.engineersNotAssigned')
  }
  return ''
})

const visibleActions = computed(() => {
  if (!canManageStatus.value || !props.project) return []

  const status = props.project.status
  const actions: Array<{
    id: string
    label: string
    transitionTo: string
    disabled?: boolean
    disabledReason?: string
  }> = []

  if (status === 'new') {
    actions.push({
      id: 'openForBids',
      label: t('project.actions.openForBids'),
      transitionTo: 'open_for_bids',
      disabled: true, // Placeholder — Epic 07 not yet ready
      disabledReason: t('project.errors.featureNotReady'),
    })
  } else if (status === 'contractor_selected') {
    actions.push({
      id: 'activate',
      label: t('project.actions.activateProject'),
      transitionTo: 'active',
      disabled: !canActivate.value,
      disabledReason: !canActivate.value ? activateDisabledReason.value : '',
    })
  } else if (status === 'active') {
    actions.push({
      id: 'pause',
      label: t('project.actions.pauseProject'),
      transitionTo: 'on_hold',
    })
  } else if (status === 'on_hold') {
    actions.push({
      id: 'resume',
      label: t('project.actions.resumeProject'),
      transitionTo: 'active',
    })
  }

  return actions
})

const getConfirmationMessage = (actionId: string | null): string => {
  if (!actionId) return ''
  const messageKey = `project.confirmations.${actionId}`
  return t(messageKey)
}

const showConfirmation = (action: (typeof visibleActions.value)[0]) => {
  selectedAction.value = action.id
  dialogOpen.value = true
}

const handleConfirm = () => {
  if (!selectedAction.value) return

  const action = visibleActions.value.find(a => a.id === selectedAction.value)
  if (!action) return

  isLoading.value = true
  dialogOpen.value = false
  emit('transition', action.transitionTo)
}

const handleDialogClose = () => {
  if (!isLoading.value) {
    dialogOpen.value = false
  }
}
</script>

<template>
  <div v-if="canManageStatus && visibleActions.length > 0" class="space-y-3">
    <div
      v-for="action in visibleActions"
      :key="action.id"
      class="flex flex-col gap-1"
    >
      <div class="flex gap-2">
        <Button
          :disabled="action.disabled || isSubmitting"
          variant="outline"
          size="sm"
          :aria-label="action.label"
          :title="action.disabledReason"
          @click="showConfirmation(action)"
        >
          {{ action.label }}
        </Button>
      </div>
      <p v-if="action.disabledReason" class="text-muted-foreground text-xs">
        {{ action.disabledReason }}
      </p>
    </div>
  </div>

  <!-- Confirmation Dialog -->
  <Dialog :open="dialogOpen" @update:open="handleDialogClose">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{
          t(`project.confirmations.${selectedAction}Title`)
        }}</DialogTitle>
      </DialogHeader>

      <p class="text-muted-foreground text-sm">
        {{ getConfirmationMessage(selectedAction) }}
      </p>

      <DialogFooter>
        <Button
          variant="outline"
          :disabled="isLoading"
          @click="dialogOpen = false"
        >
          {{ t('buttons.cancel') }}
        </Button>
        <Button :disabled="isLoading" @click="handleConfirm">
          {{ isLoading ? t('buttons.confirming') : t('buttons.confirm') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
