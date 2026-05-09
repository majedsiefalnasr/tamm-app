<script setup lang="ts">
import { computed } from 'vue'
import type { Project } from '~/shared/types/project'

interface Props {
  projects?: Project[]
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  projects: () => [],
  isLoading: false,
})

const { projects, isLoading } = props

const totalCount = computed(() => projects.length)
const activeCount = computed(
  () => projects.filter(p => p.status === 'active').length
)
const completedCount = computed(
  () => projects.filter(p => p.status === 'completed').length
)
</script>

<template>
  <div class="space-y-4">
    <!-- Section title -->
    <h2 class="text-ink text-lg font-extrabold">
      {{ $t('dashboard.client.projectsSection') }}
    </h2>

    <!-- 3-column StatCard grid -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <!-- Total Projects -->
      <NuxtLink
        to="/projects"
        class="border-border bg-card shadow-card hover:bg-muted rounded-2xl border p-4 transition-colors md:p-6"
      >
        <p class="text-muted-foreground text-xs font-semibold uppercase">
          {{ $t('dashboard.client.totalProjects') }}
        </p>
        <p class="text-primary mt-3 text-2xl font-extrabold md:text-3xl">
          {{ totalCount }}
        </p>
      </NuxtLink>

      <!-- Active Projects -->
      <NuxtLink
        to="/projects?status=active"
        class="border-border bg-card shadow-card hover:bg-muted rounded-2xl border p-4 transition-colors md:p-6"
      >
        <p class="text-muted-foreground text-xs font-semibold uppercase">
          {{ $t('dashboard.client.activeProjects') }}
        </p>
        <p class="text-accent mt-3 text-2xl font-extrabold md:text-3xl">
          {{ activeCount }}
        </p>
      </NuxtLink>

      <!-- Completed Projects -->
      <NuxtLink
        to="/projects?status=completed"
        class="border-border bg-card shadow-card hover:bg-muted rounded-2xl border p-4 transition-colors md:p-6"
      >
        <p class="text-muted-foreground text-xs font-semibold uppercase">
          {{ $t('dashboard.client.completedProjects') }}
        </p>
        <p class="text-primary mt-3 text-2xl font-extrabold md:text-3xl">
          {{ completedCount }}
        </p>
      </NuxtLink>
    </div>
  </div>
</template>
