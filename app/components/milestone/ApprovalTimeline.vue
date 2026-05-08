<script setup lang="ts">
import { computed } from 'vue'
import type { Milestone, MilestoneStatus } from '~/shared/types/project'
import { formatDate } from '~/utils/formatters'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/vue/24/outline'

interface TimelineEntry {
  status: MilestoneStatus
  timestamp: string
  action: string
  person?: {
    name: string
    role: string
  }
  reason?: string
}

interface Props {
  milestone: Milestone
}

const props = defineProps<Props>()
const { t } = useI18n()

// Build timeline from milestone status and data
// This is a simplified version - in a real app, you'd have full timeline data from API
const timeline = computed(() => {
  const entries: TimelineEntry[] = []

  if (props.milestone.created_at) {
    entries.push({
      status: 'not_started',
      timestamp: props.milestone.created_at,
      action: t('milestone.timeline.created'),
      person: undefined,
    })
  }

  // Note: Full timeline would come from API in a real implementation
  // For now, we're building a simplified view based on current milestone status
  if (props.milestone.status !== 'not_started') {
    entries.push({
      status: 'in_progress',
      timestamp: props.milestone.updated_at || props.milestone.created_at,
      action: t('milestone.timeline.inProgress'),
      person: undefined,
    })
  }

  if (
    ['under_review', 'supervisor_approved', 'approved', 'rejected'].includes(
      props.milestone.status
    )
  ) {
    entries.push({
      status: 'under_review',
      timestamp: props.milestone.updated_at || props.milestone.created_at,
      action: t('milestone.timeline.underReview'),
      person: props.milestone.latest_report?.submitted_by,
    })
  }

  if (
    ['supervisor_approved', 'approved', 'rejected'].includes(
      props.milestone.status
    )
  ) {
    entries.push({
      status: 'supervisor_approved',
      timestamp: props.milestone.updated_at || props.milestone.created_at,
      action: t('milestone.timeline.supervisorApproved'),
      person: undefined,
    })
  }

  if (props.milestone.status === 'approved') {
    entries.push({
      status: 'approved',
      timestamp: props.milestone.updated_at || props.milestone.created_at,
      action: t('milestone.timeline.clientApproved'),
      person: undefined,
    })
  }

  if (props.milestone.status === 'rejected') {
    entries.push({
      status: 'rejected',
      timestamp: props.milestone.updated_at || props.milestone.created_at,
      action: t('milestone.timeline.rejected'),
      person: undefined,
      reason: t('milestone.timeline.rejectionReason'),
    })
  }

  return entries
})

const getStatusColor = (status: MilestoneStatus): string => {
  const colors: Record<MilestoneStatus, string> = {
    not_started: 'bg-muted',
    in_progress: 'bg-accent',
    under_review: 'bg-info',
    supervisor_approved: 'bg-primary',
    approved: 'bg-primary',
    rejected: 'bg-destructive',
  }
  return colors[status] || 'bg-muted'
}

const getIcon = (status: MilestoneStatus) => {
  if (status === 'approved') return CheckCircleIcon
  if (status === 'rejected') return XCircleIcon
  return undefined
}
</script>

<template>
  <div class="bg-card rounded-lg border p-6">
    <h2 class="mb-8 text-xl font-bold">{{ t('milestone.timeline.title') }}</h2>

    <div v-if="timeline.length > 0" class="relative">
      <!-- Timeline entries -->
      <div class="space-y-6">
        <div
          v-for="(entry, index) in timeline"
          :key="`${entry.status}-${index}`"
          class="flex gap-4"
        >
          <!-- Timeline indicator -->
          <div class="flex flex-col items-center">
            <div
              :class="{
                'flex h-10 w-10 items-center justify-center rounded-full font-bold text-white': true,
                [getStatusColor(entry.status)]: true,
              }"
            >
              <component
                :is="getIcon(entry.status)"
                v-if="getIcon(entry.status)"
                class="h-6 w-6"
              />
              <span v-else class="text-sm">{{ index + 1 }}</span>
            </div>

            <!-- Connector line (not last) -->
            <div
              v-if="index < timeline.length - 1"
              class="bg-border mt-2 h-12 w-0.5"
            />
          </div>

          <!-- Timeline content -->
          <div class="flex-1 pt-1">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-ink font-semibold">{{ entry.action }}</p>
                <p class="text-muted-foreground mt-1 text-sm">
                  {{ formatDate(entry.timestamp) }}
                </p>
              </div>
            </div>

            <!-- Person info (if available) -->
            <div v-if="entry.person" class="text-muted-foreground mt-2 text-sm">
              <span class="font-medium">{{ entry.person.name }}</span>
              <span> ({{ entry.person.role }})</span>
            </div>

            <!-- Rejection reason (if applicable) -->
            <div
              v-if="entry.reason"
              class="bg-destructive/10 border-destructive/20 mt-3 rounded-lg border p-3"
            >
              <p class="text-destructive mb-1 text-xs font-semibold uppercase">
                {{ t('milestone.timeline.rejectionReason') }}
              </p>
              <p class="text-foreground text-sm">{{ entry.reason }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-muted/20 rounded-lg p-8 text-center">
      <p class="text-muted-foreground">{{ t('milestone.timeline.empty') }}</p>
    </div>
  </div>
</template>
