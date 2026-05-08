<script setup lang="ts">
import { computed } from 'vue'
import type { Project } from '~/shared/types/project'
import { formatCurrency } from '~/utils/formatters'
import { usePayments } from '~/composables/usePayments'

interface Props {
  projectId: string
  project?: Project
}

const props = defineProps<Props>()

const { projects } = useProjects()
const { getProjectFinancials } = usePayments()

const projectData = computed(
  () => props.project || projects.value.find(p => p.id === props.projectId)
)

const financials = computed(() =>
  projectData.value ? getProjectFinancials(projectData.value.id) : null
)
</script>

<template>
  <div v-if="financials" class="space-y-4">
    <!-- Section heading -->
    <h2 class="text-foreground text-lg font-extrabold">
      {{ $t('payment.project.financial_summary') }}
    </h2>

    <!-- 2x2 grid or 4-column depending on space -->
    <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
      <div class="border-border bg-card rounded-lg border p-4">
        <p class="text-muted-foreground text-xs font-semibold uppercase">
          {{ $t('payment.project.value') }}
        </p>
        <p class="text-foreground mt-2 text-xl font-extrabold md:text-2xl">
          {{ formatCurrency(financials.value) }}
        </p>
      </div>

      <div class="border-border bg-card rounded-lg border p-4">
        <p class="text-muted-foreground text-xs font-semibold uppercase">
          {{ $t('payment.project.paid') }}
        </p>
        <p class="text-primary mt-2 text-xl font-extrabold md:text-2xl">
          {{ formatCurrency(financials.paid) }}
        </p>
      </div>

      <div class="border-border bg-card rounded-lg border p-4">
        <p class="text-muted-foreground text-xs font-semibold uppercase">
          {{ $t('payment.project.in_escrow') }}
        </p>
        <p
          class="mt-2 text-xl font-extrabold text-blue-600 md:text-2xl dark:text-blue-400"
        >
          {{ formatCurrency(financials.inEscrow) }}
        </p>
      </div>

      <div class="border-border bg-card rounded-lg border p-4">
        <p class="text-muted-foreground text-xs font-semibold uppercase">
          {{ $t('payment.project.remaining') }}
        </p>
        <p class="text-accent mt-2 text-xl font-extrabold md:text-2xl">
          {{ formatCurrency(financials.remaining) }}
        </p>
      </div>
    </div>
  </div>
</template>
