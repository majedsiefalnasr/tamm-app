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
  const statusLabelMap: Partial<Record<MilestoneStatus, string>> = {
    draft: t('status.draft'),
    submitted: t('status.submitted'),
    under_review: t('milestone.status.underReview'),
    approved: t('milestone.status.approved'),
    rejected: t('milestone.status.rejected'),
    in_progress: t('status.in_progress'),
  }
  return statusLabelMap[props.status] || props.status
})
</script>

<template>
  <Pill :label="statusLabel" :tone="tone" />
</template>
