<script setup lang="ts">
import { computed } from 'vue'
import { useMilestones } from '~/composables/useMilestones'
import { useReports } from '~/composables/useReports'
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
const { t } = useI18n()

const engineerId = computed(() => auth.user?.id)

// Fetch active milestones
const {
  data: activeMilestones,
  loading: activeMilestonesLoading,
  error: milestonesError,
} = useMilestones().getMilestonesByFieldEngineer('in_progress')

// Fetch recent reports
const { data: recentReports, loading: reportsLoading } =
  useReports().getReportsByFieldEngineer(engineerId.value, 5)

const handleRetryMilestones = () => {
  // Retry logic will be added when actual API calls are used
}
</script>

<template>
  <div class="space-y-6 px-4 pt-6 pb-16 md:px-8 md:pt-8 md:pb-20">
    <!-- Page Title -->
    <div class="mb-8">
      <h1 class="text-ink text-2xl font-extrabold md:text-3xl">
        {{ $t('dashboard.fieldEngineer.title') }}
      </h1>
    </div>

    <!-- Active Milestones Section -->
    <FieldEngineerActiveMilestones
      :milestones="activeMilestones"
      :loading="activeMilestonesLoading"
      :has-error="!!milestonesError"
      :error-message="milestonesError?.message"
      @retry="handleRetryMilestones"
    />

    <!-- Recent Reports Section -->
    <FieldEngineerRecentReports
      :reports="recentReports"
      :loading="reportsLoading"
    />
  </div>
</template>
