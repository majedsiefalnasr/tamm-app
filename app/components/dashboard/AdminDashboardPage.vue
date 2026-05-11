<script setup lang="ts">
import { computed } from 'vue'
import SectionErrorCard from '~/components/common/SectionErrorCard.vue'
import { useAdminDashboard } from '~/composables/useAdminDashboard'
import DashboardBanners from '~/components/admin/DashboardBanners.vue'
import DashboardStats from '~/components/admin/DashboardStats.vue'
import DashboardActivity from '~/components/admin/DashboardActivity.vue'
import DashboardProjects from '~/components/admin/DashboardProjects.vue'
import DashboardDisputes from '~/components/admin/DashboardDisputes.vue'
import DashboardActionQueues from '~/components/admin/DashboardActionQueues.vue'
import DashboardRecentActivity from '~/components/admin/DashboardRecentActivity.vue'
import DashboardSuperAdminSection from '~/components/admin/DashboardSuperAdminSection.vue'
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()

const {
  loading,
  error,
  data,
  bannerCounts,
  stats,
  disputesStat,
  actionQueues,
  recentEventsFeed,
  superAdminFlags,
  retry,
} = useAdminDashboard()

const { t, locale } = useI18n()

const showSuperAdminSection = computed(() => auth.user?.role === 'super_admin')

const welcomeDateFormatted = computed(() => {
  const loc = locale.value === 'ar' ? 'ar-EG' : 'en-US'
  return new Intl.DateTimeFormat(loc, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date())
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1
        class="text-foreground text-3xl font-extrabold"
        data-testid="dashboard-title"
      >
        {{ t('admin.dashboard.page_title') }}
      </h1>
      <p class="text-muted-foreground mt-1">
        {{ t('admin.dashboard.welcome', { date: welcomeDateFormatted }) }}
      </p>
    </div>

    <SectionErrorCard
      v-if="error"
      title-key="admin.dashboard.error"
      :detail="error"
      retry-label-key="admin.dashboard.retry"
      @retry="retry"
    />

    <DashboardBanners
      :new-projects="bannerCounts.newProjects"
      :pending-payments="bannerCounts.pendingPayments"
      :pending-reports="bannerCounts.pendingReports"
      :disputes="bannerCounts.disputes"
    />

    <DashboardStats
      :stats="stats"
      :disputes-stat="disputesStat"
      :loading="loading"
    />

    <DashboardActionQueues :queues="actionQueues" :loading="loading" />

    <DashboardRecentActivity :events="recentEventsFeed" :loading="loading" />

    <DashboardSuperAdminSection
      v-if="showSuperAdminSection"
      :flags="superAdminFlags"
    />

    <DashboardActivity :data="data?.activity_data ?? null" :loading="loading" />

    <DashboardProjects
      :projects="data?.recent_projects ?? []"
      :loading="loading"
    />

    <DashboardDisputes
      :disputes="data?.open_disputes ?? []"
      :loading="loading"
    />
  </div>
</template>
