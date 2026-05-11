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
import DashboardLovableAlertStrips from '~/components/admin/DashboardLovableAlertStrips.vue'
import DashboardLovablePrimaryKpis from '~/components/admin/DashboardLovablePrimaryKpis.vue'
import DashboardLovableSparklineRow from '~/components/admin/DashboardLovableSparklineRow.vue'
import DashboardLovableProjectDonut from '~/components/admin/DashboardLovableProjectDonut.vue'
import DashboardLovablePlatformActivity from '~/components/admin/DashboardLovablePlatformActivity.vue'
import DashboardLovableRegistrationsRow from '~/components/admin/DashboardLovableRegistrationsRow.vue'
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
  lovableOverview,
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

const donutTotal = computed(
  () => data.value?.summary_stats?.active_projects ?? 124
)
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

    <template v-if="lovableOverview">
      <DashboardLovableAlertStrips
        :field-reports="lovableOverview.alert_field_reports"
        :new-project-requests="lovableOverview.alert_new_project_requests"
      />

      <DashboardLovablePrimaryKpis
        :items="lovableOverview.primary_kpis"
        :loading="loading"
      />

      <DashboardLovableSparklineRow
        :items="lovableOverview.sparkline_kpis"
        :loading="loading"
      />

      <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <DashboardLovableProjectDonut
          :slices="lovableOverview.project_distribution"
          :total-projects="donutTotal"
        />
        <DashboardLovablePlatformActivity
          :points="lovableOverview.platform_activity"
        />
      </div>

      <DashboardProjects
        :projects="data?.recent_projects ?? []"
        :loading="loading"
        title-key="admin.dashboard.lovable.projects_table_title"
      />

      <DashboardDisputes
        :disputes="data?.open_disputes ?? []"
        :loading="loading"
        title-key="admin.dashboard.disputes.title"
        view-all-key="admin.dashboard.disputes.view_full_record"
      />

      <DashboardLovableRegistrationsRow
        :latest="lovableOverview.latest_registrations"
        :weekly="lovableOverview.weekly_registrations"
        :weekly-total="lovableOverview.weekly_registrations_total"
        :weekly-delta-percent="
          lovableOverview.weekly_registrations_delta_percent
        "
      />

      <DashboardSuperAdminSection
        v-if="showSuperAdminSection"
        :flags="superAdminFlags"
      />

      <DashboardActionQueues :queues="actionQueues" :loading="loading" />

      <p class="text-muted-foreground text-center text-xs">
        {{ t('admin.dashboard.lovable.demo_footer') }}
      </p>
    </template>

    <template v-else>
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

      <DashboardActivity
        :data="data?.activity_data ?? null"
        :loading="loading"
      />

      <DashboardProjects
        :projects="data?.recent_projects ?? []"
        :loading="loading"
      />

      <DashboardDisputes
        :disputes="data?.open_disputes ?? []"
        :loading="loading"
      />
    </template>
  </div>
</template>
