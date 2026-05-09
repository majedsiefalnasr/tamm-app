<script setup lang="ts">
import { useAsyncData } from '#app'
import SupervisorEngineerDashboard from '~/components/dashboard/SupervisorEngineerDashboard.vue'
import { useMilestones } from '~/composables/useMilestones'

definePageMeta({
  roles: ['supervisor_engineer'],
  pageTitle: 'pages.supervisor_dashboard',
})

const { getPendingReviews } = useMilestones()

await useAsyncData('pending-reviews', () => getPendingReviews(), {
  server: false,
})
</script>

<template>
  <div class="px-4 pt-6 pb-16 md:px-8 md:pt-8 md:pb-20">
    <SupervisorEngineerDashboard />
  </div>
</template>
