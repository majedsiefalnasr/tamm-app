<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import ApprovalQueueWidget from '~/components/client/ApprovalQueueWidget.vue'
import DashboardPaymentSummary from '~/components/dashboard/DashboardPaymentSummary.vue'
import ProjectSummaryCards from '~/components/dashboard/ProjectSummaryCards.vue'
import RecentActivitySection from '~/components/dashboard/RecentActivitySection.vue'
import { useProjects } from '~/composables/useProjects'
import { useActivity } from '~/composables/useActivity'

const { projects, loading: projectsLoading, fetchProjects } = useProjects()
const {
  recentActivity,
  loading: activityLoading,
  error: activityError,
  getRecentActivity,
} = useActivity()

onMounted(async () => {
  try {
    await Promise.all([fetchProjects(), getRecentActivity()])
  } finally {
    projectsHydrating.value = false
  }
})

const projectsList = computed(() => projects.value || [])

/** True until first client-dashboard bootstrap completes — hides zeros before fetchProjects runs */
const projectsHydrating = ref(true)
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-ink text-3xl font-bold">
        {{ $t('pages.client_dashboard') }}
      </h1>
      <p class="text-muted-foreground mt-1">
        {{ $t('pages.client_dashboard_subtitle') }}
      </p>
    </div>

    <div class="grid gap-6">
      <div class="border-border bg-card rounded-2xl border p-6">
        <ApprovalQueueWidget />
      </div>

      <DashboardPaymentSummary
        :loading="projectsLoading || projectsHydrating"
      />

      <ProjectSummaryCards
        :projects="projectsList"
        :is-loading="projectsLoading || projectsHydrating"
      />

      <RecentActivitySection
        :activities="recentActivity"
        :is-loading="activityLoading"
        :has-error="!!activityError"
        @retry="getRecentActivity"
      />
    </div>
  </div>
</template>
