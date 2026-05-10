<script setup lang="ts">
import { computed } from 'vue'
import { AlertTriangle } from 'lucide-vue-next'
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

definePageMeta({
  roles: ['admin', 'super_admin'],
  middleware: ['auth', 'role'],
  pageTitle: 'admin.dashboard.page_title',
})

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
    <!-- Page Title -->
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

    <!-- Error state -->
    <div
      v-if="error"
      class="border-destructive/30 bg-destructive/5 flex items-start gap-3 rounded-2xl border p-4"
    >
      <AlertTriangle class="text-destructive mt-0.5 h-4 w-4 shrink-0" />
      <div class="min-w-0 flex-1">
        <p class="text-destructive font-semibold">
          {{ t('admin.dashboard.error') }}
        </p>
        <p class="text-muted-foreground mt-1 text-sm">
          {{ error }}
        </p>
        <button
          type="button"
          class="text-destructive hover:text-destructive/80 mt-2 text-sm font-medium transition"
          @click="retry"
        >
          {{ t('admin.dashboard.retry') }}
        </button>
      </div>
    </div>

    <!-- Urgent Action Banners -->
    <DashboardBanners
      :new-projects="bannerCounts.newProjects"
      :pending-payments="bannerCounts.pendingPayments"
      :pending-reports="bannerCounts.pendingReports"
      :disputes="bannerCounts.disputes"
    />

    <!-- Summary KPIs -->
    <DashboardStats
      :stats="stats"
      :disputes-stat="disputesStat"
      :loading="loading"
    />

    <!-- Epic 08-05 action queues -->
    <DashboardActionQueues :queues="actionQueues" :loading="loading" />

    <!-- Recent platform events -->
    <DashboardRecentActivity :events="recentEventsFeed" :loading="loading" />

    <DashboardSuperAdminSection
      v-if="showSuperAdminSection"
      :flags="superAdminFlags"
    />

    <!-- Activity Chart -->
    <DashboardActivity :data="data?.activity_data ?? null" :loading="loading" />

    <!-- Recent Projects -->
    <DashboardProjects
      :projects="data?.recent_projects ?? []"
      :loading="loading"
    />

    <!-- Disputes Overview -->
    <DashboardDisputes
      :disputes="data?.open_disputes ?? []"
      :loading="loading"
    />
  </div>
</template>
