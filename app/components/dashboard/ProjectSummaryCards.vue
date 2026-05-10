<script setup lang="ts">
import { computed } from 'vue'
import { Skeleton } from '~/components/ui/skeleton'
import { Card } from '~/components/ui/card'
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

    <!-- Loading skeleton -->
    <div v-if="isLoading" class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Skeleton v-for="n in 3" :key="n" class="h-28 rounded-2xl md:h-32" />
    </div>

    <!-- 3-column StatCard grid -->
    <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <!-- Total Projects -->
      <NuxtLink to="/projects" class="block">
        <Card
          class="hover:bg-muted shadow-card gap-0 rounded-2xl p-4 shadow-none transition-colors md:p-6"
        >
          <p class="text-muted-foreground text-xs font-semibold uppercase">
            {{ $t('dashboard.client.totalProjects') }}
          </p>
          <p class="text-primary mt-3 text-2xl font-extrabold md:text-3xl">
            {{ totalCount }}
          </p>
        </Card>
      </NuxtLink>

      <!-- Active Projects -->
      <NuxtLink to="/projects?filter=status:active" class="block">
        <Card
          class="hover:bg-muted shadow-card gap-0 rounded-2xl p-4 shadow-none transition-colors md:p-6"
        >
          <p class="text-muted-foreground text-xs font-semibold uppercase">
            {{ $t('dashboard.client.activeProjects') }}
          </p>
          <p class="text-accent mt-3 text-2xl font-extrabold md:text-3xl">
            {{ activeCount }}
          </p>
        </Card>
      </NuxtLink>

      <!-- Completed Projects -->
      <NuxtLink to="/projects?filter=status:completed" class="block">
        <Card
          class="hover:bg-muted shadow-card gap-0 rounded-2xl p-4 shadow-none transition-colors md:p-6"
        >
          <p class="text-muted-foreground text-xs font-semibold uppercase">
            {{ $t('dashboard.client.completedProjects') }}
          </p>
          <p class="text-primary mt-3 text-2xl font-extrabold md:text-3xl">
            {{ completedCount }}
          </p>
        </Card>
      </NuxtLink>
    </div>
  </div>
</template>
