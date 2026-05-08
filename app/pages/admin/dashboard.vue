<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next'
import { useAdminDashboard } from '~/composables/useAdminDashboard'

definePageMeta({
  roles: ['admin', 'super_admin'],
  pageTitle: 'admin.dashboard.page_title',
})

const { loading, error, data, bannerCounts, stats, disputesStat, retry } =
  useAdminDashboard()
const { $t } = useI18n()
</script>

<template>
  <div class="space-y-6">
    <!-- Page Title -->
    <div>
      <h1 class="text-foreground text-3xl font-extrabold">
        {{ $t('admin.dashboard.page_title') }}
      </h1>
      <p class="text-muted-foreground mt-1">
        {{
          $t('admin.dashboard.welcome', {
            date: new Date().toLocaleDateString('ar-EG'),
          })
        }}
      </p>
    </div>

    <!-- Error state -->
    <div
      v-if="error"
      class="border-destructive/30 bg-destructive/5 flex items-start gap-3 rounded-2xl border p-4"
    >
      <AlertTriangle class="text-destructive mt-0.5 h-4 w-4 flex-shrink-0" />
      <div class="flex-1">
        <p class="text-destructive font-semibold">
          {{ $t('admin.dashboard.error') }}
        </p>
        <p class="text-muted-foreground mt-1 text-sm">
          {{ error }}
        </p>
        <button
          class="text-destructive hover:text-destructive/80 mt-2 text-sm font-medium transition"
          @click="retry"
        >
          {{ $t('admin.dashboard.retry') }}
        </button>
      </div>
    </div>

    <!-- Urgent Action Banners -->
    <DashboardBanners
      :new-projects="bannerCounts.newProjects"
      :pending-payments="bannerCounts.pendingPayments"
      :disputes="bannerCounts.disputes"
    />

    <!-- Platform Stats -->
    <DashboardStats
      :stats="stats"
      :disputes-stat="disputesStat"
      :loading="loading"
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
