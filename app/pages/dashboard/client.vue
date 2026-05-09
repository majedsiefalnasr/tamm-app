<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import ApprovalQueueWidget from '~/components/client/ApprovalQueueWidget.vue'
import DashboardPaymentSummary from '~/components/dashboard/DashboardPaymentSummary.vue'
import ProjectSummaryCards from '~/components/dashboard/ProjectSummaryCards.vue'
import RecentActivitySection from '~/components/dashboard/RecentActivitySection.vue'
import { useProjects } from '~/composables/useProjects'
import { useActivity } from '~/composables/useActivity'

definePageMeta({
  roles: ['client'],
  pageTitle: 'pages.client_dashboard',
})

const { projects, loading: projectsLoading } = useProjects()
const {
  recentActivity,
  loading: activityLoading,
  error: activityError,
  getRecentActivity,
} = useActivity()

onMounted(async () => {
  await getRecentActivity()
})

const projectsList = computed(() => projects.value || [])
</script>

<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div>
      <h1 class="text-ink text-3xl font-bold">
        {{ $t('pages.client_dashboard') }}
      </h1>
      <p class="text-muted-foreground mt-1">
        {{ $t('pages.client_dashboard_subtitle') }}
      </p>
    </div>

    <!-- Main content -->
    <div class="grid gap-6">
      <!-- Milestones Awaiting Approval (Highest Priority) -->
      <div class="border-border bg-card rounded-2xl border p-6">
        <ApprovalQueueWidget />
      </div>

      <!-- Payment Summary -->
      <DashboardPaymentSummary />

      <!-- Project Summary Cards -->
      <ProjectSummaryCards
        :projects="projectsList"
        :is-loading="projectsLoading"
      />

      <!-- Recent Activity Section -->
      <RecentActivitySection
        :activities="recentActivity"
        :is-loading="activityLoading"
        :has-error="!!activityError"
      />
    </div>
  </div>
</template>
