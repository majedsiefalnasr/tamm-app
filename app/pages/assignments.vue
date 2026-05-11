<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMilestones } from '~/composables/useMilestones'

definePageMeta({
  roles: ['field_engineer'],
})

const currentTab = ref('active')

// Fetch all milestones assigned to this field engineer
const { data: allMilestones, loading } =
  useMilestones().getMilestonesByFieldEngineer(null)

// Filter milestones by status
const filteredMilestones = computed(() => {
  const data = allMilestones.value || []
  switch (currentTab.value) {
    case 'active':
      return data.filter(m => m.status === 'in_progress')
    case 'under_review':
      return data.filter(m => m.status === 'under_review')
    case 'completed':
      return data.filter(
        m => m.status === 'approved' || m.status === 'supervisor_approved'
      )
    default:
      return data
  }
})

// Count milestones by status
const counts = computed(() => {
  const data = allMilestones.value || []
  return {
    all: data.length,
    active: data.filter(m => m.status === 'in_progress').length,
    underReview: data.filter(m => m.status === 'under_review').length,
    completed: data.filter(
      m => m.status === 'approved' || m.status === 'supervisor_approved'
    ).length,
  }
})
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-ink text-2xl font-extrabold md:text-3xl">
        {{ $t('pages.assignments.title') }}
      </h1>
      <p class="text-muted-foreground mt-1">
        {{
          $t('pages.assignments.subtitle', {
            active: counts.active,
            total: counts.all,
          })
        }}
      </p>
    </div>

    <!-- Filter Tabs -->
    <AssignmentFilterTabs
      :current-tab="currentTab"
      :counts="counts"
      @update:tab="currentTab = $event"
    />

    <!-- Assignment Grid -->
    <AssignmentGrid :milestones="filteredMilestones" :loading="loading" />
  </div>
</template>
