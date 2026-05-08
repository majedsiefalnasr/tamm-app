<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { Milestone, ProjectDetail } from '~/shared/types/project'
import { formatCurrency } from '~/utils/formatters'
import { usePermission } from '~/composables/usePermission'
import { useI18n } from 'vue-i18n'
import { ChevronDownIcon } from '@heroicons/vue/24/outline'
import StatusTag from '~/components/common/StatusTag.vue'
import { Button } from '~/components/ui/button'
import MilestoneActions from './MilestoneActions.vue'

interface Props {
  milestone: Milestone
  project: ProjectDetail
  onRefresh?: () => Promise<void>
}

const props = withDefaults(defineProps<Props>(), {
  onRefresh: undefined,
})

const router = useRouter()
const { t } = useI18n()
const { can } = usePermission()

const isExpanded = ref(false)
const isLoading = ref(false)

const statusTones = {
  not_started: 'muted',
  in_progress: 'accent',
  under_review: 'info',
  supervisor_approved: 'info',
  approved: 'primary',
  rejected: 'danger',
} as const

const statusTone = computed(() => {
  return statusTones[props.milestone.status] || 'muted'
})

const hasActions = computed(() => {
  return (
    can('submit_report', props.milestone.allowed_actions) ||
    can('view_report', props.milestone.allowed_actions) ||
    can('approve_milestone', props.milestone.allowed_actions) ||
    can('reject_milestone', props.milestone.allowed_actions) ||
    can('pay_milestone', props.milestone.allowed_actions)
  )
})

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

const navigateToDetail = () => {
  router.push(`/projects/${props.project.id}/milestones/${props.milestone.id}`)
}

const handleCardClick = (e: MouseEvent) => {
  // Only navigate if clicking on the card body (not buttons)
  const target = e.target as HTMLElement
  if (!target.closest('button')) {
    navigateToDetail()
  }
}

const handleRefresh = async () => {
  if (props.onRefresh) {
    isLoading.value = true
    try {
      await props.onRefresh()
    } finally {
      isLoading.value = false
    }
  }
}

const cardClasses = computed(() => {
  const base = 'rounded-2xl border bg-card p-4 transition cursor-pointer'
  return isExpanded.value
    ? `${base} border-primary/40 shadow-card`
    : `${base} border-border`
})
</script>

<template>
  <div :class="cardClasses" @click="handleCardClick">
    <!-- Header Row (Always Visible) -->
    <div class="flex items-center gap-3">
      <!-- Phase Number Badge -->
      <div
        class="bg-muted flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
      >
        {{ milestone.order }}
      </div>

      <!-- Phase Name -->
      <h3 class="text-ink flex-1 text-start text-sm font-extrabold">
        {{ milestone.name }}
      </h3>

      <!-- Budget/Amount -->
      <span class="text-muted-foreground text-xs font-bold whitespace-nowrap">
        {{ formatCurrency(milestone.amount) }}
      </span>

      <!-- Status Pill -->
      <StatusTag :status="milestone.status" :tone="statusTone" />

      <!-- Expand Chevron -->
      <button
        class="text-muted-foreground hover:text-foreground shrink-0 transition-transform"
        :class="{ 'rotate-180': isExpanded }"
        :aria-label="isExpanded ? $t('common.collapse') : $t('common.expand')"
        @click.stop="toggleExpand"
      >
        <ChevronDownIcon class="h-5 w-5" />
      </button>
    </div>

    <!-- Progress Bar (Conditional) -->
    <div
      v-if="
        milestone.status === 'in_progress' ||
        milestone.status === 'under_review' ||
        milestone.status === 'supervisor_approved' ||
        milestone.status === 'approved'
      "
      class="bg-muted mt-3 h-1.5 w-full overflow-hidden rounded-full"
    >
      <div
        class="bg-primary/60 h-full rounded-full transition-all"
        :style="{ width: '65%' }"
      />
    </div>

    <!-- Expanded Content -->
    <div v-if="isExpanded" class="border-border mt-4 space-y-4 border-t pt-4">
      <!-- Task List -->
      <div v-if="milestone.tasks.length > 0" class="space-y-2">
        <h4 class="text-muted-foreground text-xs font-bold uppercase">
          {{ $t('milestone.section.tasks') }}
        </h4>
        <div class="space-y-1">
          <div
            v-for="task in milestone.tasks"
            :key="task.id"
            class="flex items-start gap-2 text-sm"
          >
            <input
              type="checkbox"
              :checked="task.completed"
              disabled
              class="mt-0.5"
            />
            <span class="flex-1">{{ task.title }}</span>
            <span
              v-if="task.contractor"
              class="bg-muted text-muted-foreground rounded px-2 py-1 text-xs whitespace-nowrap"
            >
              {{ task.contractor.name }}
            </span>
          </div>
        </div>
      </div>

      <div v-else class="text-muted-foreground text-sm">
        {{ $t('milestone.emptyState.noTasks') }}
      </div>

      <!-- Latest Report Summary (Conditional) -->
      <div v-if="milestone.latest_report" class="bg-muted/30 rounded-lg p-3">
        <p class="text-muted-foreground mb-2 text-xs font-bold">
          {{ $t('milestone.section.latestReport') }}
        </p>
        <p class="line-clamp-3 text-sm">
          {{ milestone.latest_report.content }}
        </p>
        <p
          v-if="milestone.latest_report.submitted_at"
          class="text-muted-foreground mt-2 text-xs"
        >
          {{
            new Date(milestone.latest_report.submitted_at).toLocaleDateString()
          }}
        </p>
      </div>

      <!-- Action Buttons -->
      <MilestoneActions
        :milestone="milestone"
        :project="project"
        :is-loading="isLoading"
        @action-complete="handleRefresh"
      />

      <!-- Payment Status Badge (Conditional) -->
      <div
        v-if="can('view_payment_status', milestone.allowed_actions)"
        class="border-border flex items-center gap-2 border-t pt-2"
      >
        <span class="text-muted-foreground text-xs font-bold">{{
          $t('milestone.section.paymentStatus')
        }}</span>
        <span class="bg-muted text-muted-foreground rounded px-2 py-1 text-xs">
          {{ $t(`payment.status.${milestone.payment_status}`) }}
        </span>
      </div>
    </div>
  </div>
</template>
