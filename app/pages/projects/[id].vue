<script setup lang="ts">
import { computed } from 'vue'
import type { ProjectDetail } from '~/shared/types/project'
import { formatCurrency } from '~/utils/formatters'

definePageMeta({
  layout: 'default',
  roles: [
    'client',
    'contractor',
    'field_engineer',
    'supervisor_engineer',
    'admin',
    'super_admin',
  ],
})

const route = useRoute()
const { can } = usePermission()
const auth = useAuthStore()

const id = computed(() => {
  const param = route.params.id as string
  if (!param || param.trim() === '') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid project ID' })
  }
  return param
})

const {
  data: project,
  pending,
  error,
  refresh,
} = await useAsyncData(
  () => `project-${id.value}`,
  () => useProjects().getProjectById(id.value)
)

const isAdmin = computed(() => {
  const role = auth.user?.role
  return role === 'admin' || role === 'super_admin'
})

const progressPercent = computed(() => {
  const milestones = project.value?.milestones || []
  if (!milestones.length) return 0
  const completed = milestones.filter(m => m.status === 'approved').length
  return Math.round((completed / milestones.length) * 100)
})

const showFinancial = computed(
  () => (project.value?.milestones?.length ?? 0) > 0
)

const canAddMilestone = computed(() => {
  if (!project.value) return false
  if (['admin', 'super_admin'].includes(auth.user?.role || '')) return true
  if (
    auth.user?.role === 'contractor' &&
    auth.user?.id &&
    auth.user.id === project.value?.contractor_id
  ) {
    return true
  }
  return false
})

const showContractor = computed(() => {
  if (!project.value) return false
  return ['contractor_selected', 'active', 'on_hold', 'completed'].includes(
    project.value.status
  )
})

const showEngineers = computed(() => {
  if (!project.value) return false
  return ['contractor_selected', 'active', 'on_hold', 'completed'].includes(
    project.value.status
  )
})

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    villa: 'Villa',
    apartment: 'Apartment',
    commercial: 'Commercial',
    other: 'Other',
  }
  return labels[type] || type
}

const getMilestoneStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    not_started: 'Not Started',
    in_progress: 'In Progress',
    under_review: 'Under Review',
    supervisor_approved: 'Supervisor Approved',
    approved: 'Approved',
    rejected: 'Rejected',
  }
  return labels[status] || status
}

const remainingAmount = computed(() => {
  if (!project.value) return 0
  return Math.max(0, project.value.total_amount - project.value.total_paid)
})
</script>

<template>
  <!-- Loading state -->
  <div v-if="pending" class="min-h-screen space-y-6 p-4 md:p-8">
    <div class="space-y-3">
      <div class="bg-muted-foreground/20 h-10 w-1/3 rounded-lg" />
      <div class="bg-muted-foreground/20 h-4 w-1/2 rounded-lg" />
    </div>
    <div class="grid gap-6 md:grid-cols-2">
      <div class="bg-muted-foreground/20 h-40 rounded-2xl" />
      <div class="bg-muted-foreground/20 h-40 rounded-2xl" />
    </div>
  </div>

  <!-- Error state -->
  <div v-else-if="error" class="min-h-screen">
    <ErrorState
      :error="`Failed to load project: ${error?.message || 'Unknown error'}`"
      @retry="refresh()"
    />
  </div>

  <!-- Main content -->
  <div v-else-if="project" class="space-y-6 p-4 md:p-8">
    <!-- Header card -->
    <div
      class="border-border bg-card shadow-card rounded-3xl border p-6 md:p-8"
      :style="{
        background: `linear-gradient(to inline-start, rgba(var(--color-primary-rgb), 0.1), var(--color-card))`,
      }"
    >
      <div class="flex flex-col gap-4 md:gap-6">
        <h1 class="text-ink text-2xl font-extrabold md:text-3xl">
          {{ project.name }}
        </h1>

        <!-- Meta information -->
        <div class="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <p class="text-muted-foreground text-xs">Client</p>
            <p class="text-ink text-sm font-semibold">
              {{ project.client_name || 'N/A' }}
            </p>
          </div>
          <div>
            <p class="text-muted-foreground text-xs">Address</p>
            <p class="text-ink text-sm font-semibold">
              {{ project.city || 'N/A' }}
            </p>
          </div>
          <div>
            <p class="text-muted-foreground text-xs">Type</p>
            <p class="text-ink text-sm font-semibold">
              {{ getTypeLabel(project.type) }}
            </p>
          </div>
          <div>
            <p class="text-muted-foreground text-xs">Area</p>
            <p class="text-ink text-sm font-semibold">
              {{ project.area_m2 }} m²
            </p>
          </div>
        </div>

        <!-- Progress bar -->
        <div v-if="showFinancial" class="space-y-2">
          <div class="flex items-center justify-between">
            <p class="text-ink text-sm font-semibold">Progress</p>
            <p class="text-muted-foreground text-xs">{{ progressPercent }}%</p>
          </div>
          <div class="bg-muted-foreground/20 h-2 w-full rounded-full">
            <div
              class="bg-primary h-2 rounded-full transition-all duration-300"
              :style="{ width: progressPercent + '%' }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Contractor section -->
    <div
      v-if="showContractor"
      class="border-border bg-card shadow-card rounded-2xl border p-4"
    >
      <h2 class="text-ink mb-3 text-lg font-bold">Contractor</h2>
      <p class="text-ink text-sm font-semibold">
        {{ project.contractor_name || 'N/A' }}
      </p>
    </div>

    <!-- Awaiting contractor badge -->
    <div
      v-else
      class="border-border bg-card shadow-card rounded-2xl border p-4"
    >
      <h2 class="text-ink mb-3 text-lg font-bold">Contractor</h2>
      <div
        class="border-primary/30 bg-primary/10 inline-flex rounded-full border px-3 py-1"
      >
        <p class="text-primary text-xs font-semibold">
          Awaiting contractor selection
        </p>
      </div>
    </div>

    <!-- Engineers section -->
    <div
      v-if="showEngineers"
      class="border-border bg-card shadow-card rounded-2xl border p-4"
    >
      <h2 class="text-ink mb-3 text-lg font-bold">Team</h2>
      <div class="space-y-2">
        <div v-if="project.supervisor_name">
          <p class="text-muted-foreground text-xs">Supervisor Engineer</p>
          <p class="text-ink text-sm font-semibold">
            {{ project.supervisor_name }}
          </p>
        </div>
        <div v-if="project.field_engineer_name">
          <p class="text-muted-foreground text-xs">Field Engineer</p>
          <p class="text-ink text-sm font-semibold">
            {{ project.field_engineer_name }}
          </p>
        </div>
        <div v-if="!project.supervisor_name && !project.field_engineer_name">
          <p class="text-muted-foreground text-xs font-semibold">
            Not yet assigned
          </p>
        </div>
      </div>
    </div>

    <!-- Not yet assigned -->
    <div
      v-else
      class="border-border bg-card shadow-card rounded-2xl border p-4"
    >
      <h2 class="text-ink mb-3 text-lg font-bold">Team</h2>
      <div
        class="border-muted-foreground/30 bg-muted-foreground/10 inline-flex rounded-full border px-3 py-1"
      >
        <p class="text-muted-foreground text-xs font-semibold">
          Not yet assigned
        </p>
      </div>
    </div>

    <!-- Financial summary -->
    <div
      v-if="showFinancial"
      class="border-border bg-card shadow-card rounded-2xl border p-4"
    >
      <h2 class="text-ink mb-4 text-lg font-bold">Financial Summary</h2>
      <div class="grid gap-4 sm:grid-cols-3">
        <div>
          <p class="text-muted-foreground text-xs">Total Amount</p>
          <p class="text-ink mt-1 text-lg font-bold">
            {{ formatCurrency(project.total_amount) }}
          </p>
        </div>
        <div>
          <p class="text-muted-foreground text-xs">Paid Amount</p>
          <p class="text-success mt-1 text-lg font-bold">
            {{ formatCurrency(project.total_paid) }}
          </p>
        </div>
        <div>
          <p class="text-muted-foreground text-xs">Remaining</p>
          <p class="text-warning mt-1 text-lg font-bold">
            {{ formatCurrency(remainingAmount) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Milestones section -->
    <div class="border-border bg-card shadow-card rounded-2xl border p-4">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-ink text-lg font-bold">Milestones</h2>
        <Button
          v-if="canAddMilestone"
          size="sm"
          variant="outline"
          aria-label="Add a new milestone"
        >
          Add Milestone
        </Button>
      </div>

      <div
        v-if="!project.milestones?.length"
        class="border-border rounded-lg border-2 border-dashed p-8 text-center"
      >
        <p class="text-muted-foreground text-sm">No milestones yet</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="milestone in project.milestones"
          :key="milestone.id || `milestone-${Math.random()}`"
          class="border-border flex items-center justify-between rounded-lg border p-3"
        >
          <div class="flex-1">
            <h3 class="text-ink text-sm font-semibold">{{ milestone.name }}</h3>
            <p class="text-muted-foreground text-xs">
              {{ formatCurrency(milestone.amount) }}
            </p>
          </div>
          <div
            class="bg-muted-foreground/10 inline-flex rounded-full px-2 py-1"
          >
            <span class="text-muted-foreground text-xs font-semibold">
              {{ getMilestoneStatusLabel(milestone.status) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Admin actions (placeholder for Story 02-05) -->
    <div
      v-if="isAdmin"
      class="border-border bg-card shadow-card rounded-2xl border p-4"
    >
      <h2 class="text-ink mb-4 text-lg font-bold">Admin Actions</h2>
      <p class="text-muted-foreground text-sm">
        Admin actions will be available here (Story 02-05)
      </p>
    </div>
  </div>
</template>
