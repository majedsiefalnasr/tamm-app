<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { MilestoneStatus } from '~/shared/types/project'
import Pill from './Pill.vue'

interface Props {
  status: MilestoneStatus
  tone?: 'primary' | 'accent' | 'info' | 'danger' | 'muted'
}

const props = withDefaults(defineProps<Props>(), {
  tone: 'muted',
})

const { t } = useI18n()

const statusLabel = computed(() => {
  const statusLabelMap: Record<MilestoneStatus, string> = {
    not_started: t('milestone.status.notStarted'),
    in_progress: t('milestone.status.inProgress'),
    under_review: t('milestone.status.underReview'),
    supervisor_approved: t('milestone.status.supervisorApproved'),
    approved: t('milestone.status.approved'),
    rejected: t('milestone.status.rejected'),
  }
  return statusLabelMap[props.status] || props.status
})
</script>

<template>
  <Pill :label="statusLabel" :tone="tone" />
</template>
