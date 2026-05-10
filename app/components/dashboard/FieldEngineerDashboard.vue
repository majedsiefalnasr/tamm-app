<script setup lang="ts">
import { watch, computed } from 'vue'
import { useMilestones } from '~/composables/useMilestones'
import { useReports } from '~/composables/useReports'
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()

const {
  data: activeMilestones,
  loading: activeMilestonesLoading,
  error: milestonesError,
} = useMilestones().getMilestonesByFieldEngineer('in_progress')

const reportsApi = useReports()

watch(
  () => auth.user?.id,
  userId => {
    reportsApi.getReportsByFieldEngineer(userId, 5)
  },
  { immediate: true }
)

const recentReports = computed(() => reportsApi.reports.value)
const reportsLoading = computed(() => reportsApi.loading.value)

const handleRetryMilestones = () => {
  // TODO: wire refresh when field-engineer milestones endpoint exists
}
</script>

<template>
  <div class="space-y-6">
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
      :error-message="
        typeof milestonesError === 'string' ? milestonesError : ''
      "
      @retry="handleRetryMilestones"
    />

    <!-- Recent Reports Section -->
    <FieldEngineerRecentReports
      :reports="recentReports"
      :loading="reportsLoading"
    />
  </div>
</template>
