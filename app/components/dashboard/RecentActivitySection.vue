<script setup lang="ts">
import { computed } from 'vue'
import {
  FolderIcon,
  CheckCircleIcon,
  CreditCardIcon,
  UserIcon,
} from '@heroicons/vue/20/solid'
import type { ActivityEvent } from '~/composables/useActivity'
import RecentActivityListSkeleton from '~/components/dashboard/RecentActivityListSkeleton.vue'
import EmptyState from '~/components/common/EmptyState.vue'
import ErrorState from '~/components/common/ErrorState.vue'
import { formatDate } from '~/utils/formatters'

interface Props {
  activities?: ActivityEvent[]
  isLoading?: boolean
  hasError?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  activities: () => [],
  isLoading: false,
  hasError: false,
})

const emit = defineEmits<{
  retry: []
}>()

const { activities, isLoading, hasError } = props

const iconMap = {
  folder: FolderIcon,
  check: CheckCircleIcon,
  'credit-card': CreditCardIcon,
  'user-check': UserIcon,
}

const hasActivities = computed(() => activities.length > 0)
const getIcon = (iconType: string) =>
  iconMap[iconType as keyof typeof iconMap] || FolderIcon

const formatActivityDate = (date: Date) => formatDate(date.toISOString())
</script>

<template>
  <div class="space-y-4">
    <!-- Section title -->
    <h2 class="text-ink text-lg font-extrabold">
      {{ $t('dashboard.client.activitySection') }}
    </h2>

    <!-- Loading state -->
    <RecentActivityListSkeleton v-if="isLoading" />

    <!-- Error state -->
    <ErrorState
      v-else-if="hasError"
      :message="$t('errors.activity_load_failed')"
      action-label="common.retry"
      @action="emit('retry')"
    />

    <!-- Empty state -->
    <EmptyState
      v-else-if="!hasActivities"
      icon="history"
      :title="$t('dashboard.client.noActivity')"
      :description="$t('dashboard.client.noActivityDescription')"
    />

    <!-- Activity list -->
    <div v-else class="space-y-3">
      <NuxtLink
        v-for="activity in activities"
        :key="activity.id"
        :to="`/projects/${activity.projectId}`"
        class="border-border bg-card hover:bg-muted flex items-start gap-4 rounded-2xl border p-4 transition-colors"
      >
        <!-- Icon -->
        <div class="text-primary shrink-0 pt-0.5">
          <component :is="getIcon(activity.icon)" class="h-5 w-5" />
        </div>

        <!-- Content -->
        <div class="min-w-0 flex-1">
          <p class="text-foreground text-sm">
            {{ $t(`activities.${activity.title}`) }}
          </p>
          <p class="text-ink mt-1 font-semibold">
            {{ activity.projectName }}
          </p>
          <p class="text-muted-foreground text-[11px]">
            {{ formatActivityDate(activity.timestamp) }}
          </p>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
