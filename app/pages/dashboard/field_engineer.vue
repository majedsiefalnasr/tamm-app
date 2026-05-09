<script setup lang="ts">
import { onMounted, ref } from 'vue'
import FieldEngineerDashboard from '~/components/dashboard/FieldEngineerDashboard.vue'
import { useMilestones } from '~/composables/useMilestones'
import { useReports } from '~/composables/useReports'

definePageMeta({
  roles: ['field_engineer'],
  pageTitle: 'dashboard.fieldEngineer.title',
})

// Fetch data on mount
const milestonesError = ref(false)
const milestonesErrorMessage = ref('')

const handleRetry = async () => {
  milestonesError.value = false
  milestonesErrorMessage.value = ''
}

onMounted(async () => {
  // Data fetching is handled by composables in FieldEngineerDashboard
  handleRetry()
})
</script>

<template>
  <div class="px-4 pt-6 pb-16 md:px-8 md:pt-8 md:pb-20">
    <FieldEngineerDashboard />
  </div>
</template>
