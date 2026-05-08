<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ProjectDetail } from '~/shared/types/project'
import type { MilestoneInput } from '~/composables/useMilestones'
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
const { t } = useI18n()
const { can } = usePermission()
const auth = useAuthStore()
const milestones = useMilestones()

const id = computed(() => {
  const param = route.params.id as string
  if (!param || param.trim() === '') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid project ID' })
  }
  return param
})

const dialogOpen = ref(false)
const isSubmitting = ref(false)

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
  if (!project.value?.milestones) return 0
  const milestones = project.value.milestones
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

const showFinancialSummary = computed(() => {
  const role = auth.user?.role
  if (!project.value?.milestones?.length) return false
  if (role === 'field_engineer' || role === 'supervisor_engineer') return false
  return true
})

const remainingAmount = computed(() => {
  if (!project.value) return 0
  return Math.max(0, project.value.total_amount - project.value.total_paid)
})

const getMilestoneStatusTone = (status: string) => {
  const tones: Record<string, string> = {
    not_started: 'muted',
    in_progress: 'accent',
    under_review: 'info',
    supervisor_approved: 'info',
    approved: 'primary',
    rejected: 'danger',
  }
  return tones[status] || 'muted'
}

const isProjectLocked = computed(() => {
  return project.value?.status === 'active'
})

const canAddMilestoneButton = computed(() => {
  return (
    canAddMilestone.value &&
    !isProjectLocked.value &&
    project.value?.status === 'contractor_selected'
  )
})

const nextMilestoneOrder = computed(() => {
  if (!project.value?.milestones?.length) return 1
  return Math.max(...project.value.milestones.map(m => m.order)) + 1
})

const handleAddMilestone = async (data: MilestoneInput) => {
  if (!project.value) return

  isSubmitting.value = true
  try {
    await milestones.addMilestone(project.value.id, data)

    // Refresh project data to get updated milestones
    await refresh()

    dialogOpen.value = false
    // Show success notification using existing toast system
    // This will be integrated with the notification composable
  } catch (err) {
    console.error('Failed to add milestone:', err)
    // Error message will be shown via toast notification
  } finally {
    isSubmitting.value = false
  }
}
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
      :error="`${t('errors.failed_to_load')}: ${error?.message || t('errors.unknown_error')}`"
      @retry="refresh()"
    />
  </div>

  <!-- Main content -->
  <div v-else-if="project" class="space-y-6 p-4 md:p-8">
    <!-- Header card -->
    <div
      class="border-border bg-card shadow-card rounded-3xl border p-6 md:p-8"
      :style="{
        background: `linear-gradient(to left, rgba(var(--color-primary), 0.1), var(--color-card))`,
      }"
    >
      <div class="flex flex-col gap-4 md:gap-6">
        <div
          class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
        >
          <h1 class="text-ink text-2xl font-extrabold md:text-3xl">
            {{ project.name }}
          </h1>
          <Pill
            :tone="getMilestoneStatusTone(project.status)"
            :label="t(`project.status.${project.status}`)"
          />
        </div>

        <!-- Meta information grid -->
        <div class="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <p class="text-muted-foreground text-xs">
              {{ t('project.details.clientName') }}
            </p>
            <p class="text-ink mt-1 text-sm font-semibold">
              {{ project.client_name || t('project.details.nA') }}
            </p>
          </div>
          <div>
            <p class="text-muted-foreground text-xs">
              {{ t('project.details.address') }}
            </p>
            <p class="text-ink mt-1 text-sm font-semibold">
              {{ project.city || t('project.details.nA') }}
            </p>
          </div>
          <div>
            <p class="text-muted-foreground text-xs">
              {{ t('project.details.type') }}
            </p>
            <p class="text-ink mt-1 text-sm font-semibold">
              {{ t(`project.types.${project.type}`) || project.type }}
            </p>
          </div>
          <div>
            <p class="text-muted-foreground text-xs">
              {{ t('project.details.area') }}
            </p>
            <p class="text-ink mt-1 text-sm font-semibold">
              {{ project.area_m2 }} m²
            </p>
          </div>
        </div>

        <!-- Progress bar (only when milestones exist) -->
        <div v-if="showFinancial" class="space-y-2">
          <div class="flex items-center justify-between">
            <p class="text-ink text-sm font-semibold">
              {{ t('project.details.progressLabel') }}
            </p>
            <p class="text-muted-foreground text-xs">{{ progressPercent }}%</p>
          </div>
          <div class="bg-muted h-2 w-full overflow-hidden rounded-full">
            <div
              class="bg-gradient-to-[inline-start] from-primary h-full rounded-full to-emerald-400 transition-all duration-300"
              :style="{ width: progressPercent + '%' }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Contractor section -->
    <div class="border-border bg-card shadow-card rounded-2xl border p-4">
      <h2 class="text-ink mb-3 text-lg font-bold">
        {{ t('project.details.contractor') }}
      </h2>
      <div v-if="showContractor">
        <p class="text-ink text-sm font-semibold">
          {{ project.contractor_name || t('project.details.nA') }}
        </p>
      </div>
      <div v-else>
        <Pill tone="accent" :label="t('project.details.awaitingContractor')" />
      </div>
    </div>

    <!-- Team section -->
    <div class="border-border bg-card shadow-card rounded-2xl border p-4">
      <h2 class="text-ink mb-3 text-lg font-bold">
        {{ t('project.details.team') }}
      </h2>
      <div v-if="showEngineers" class="space-y-3">
        <div v-if="project.supervisor_name">
          <p class="text-muted-foreground text-xs">
            {{ t('project.details.supervisorEngineer') }}
          </p>
          <p class="text-ink mt-1 text-sm font-semibold">
            {{ project.supervisor_name }}
          </p>
        </div>
        <div v-if="project.field_engineer_name">
          <p class="text-muted-foreground text-xs">
            {{ t('project.details.fieldEngineer') }}
          </p>
          <p class="text-ink mt-1 text-sm font-semibold">
            {{ project.field_engineer_name }}
          </p>
        </div>
        <div v-if="!project.supervisor_name && !project.field_engineer_name">
          <p class="text-muted-foreground text-xs font-semibold">
            {{ t('project.details.notAssigned') }}
          </p>
        </div>
      </div>
      <div v-else>
        <Pill tone="muted" :label="t('project.details.notAssigned')" />
      </div>
    </div>

    <!-- Financial summary (only for client, contractor, admin) -->
    <div
      v-if="showFinancialSummary"
      class="border-border bg-card shadow-card rounded-2xl border p-4"
    >
      <h2 class="text-ink mb-4 text-lg font-bold">
        {{ t('project.details.financialSummary') }}
      </h2>
      <div class="grid gap-4 sm:grid-cols-3">
        <div>
          <p class="text-muted-foreground text-xs">
            {{ t('project.details.totalAmount') }}
          </p>
          <p class="text-ink mt-1 text-lg font-bold">
            {{ formatCurrency(project.total_amount) }}
          </p>
        </div>
        <div>
          <p class="text-muted-foreground text-xs">
            {{ t('project.details.paidAmount') }}
          </p>
          <p class="text-success mt-1 text-lg font-bold">
            {{ formatCurrency(project.total_paid) }}
          </p>
        </div>
        <div>
          <p class="text-muted-foreground text-xs">
            {{ t('project.details.remainingAmount') }}
          </p>
          <p class="text-warning mt-1 text-lg font-bold">
            {{ formatCurrency(remainingAmount) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Milestones section -->
    <div class="border-border bg-card shadow-card rounded-2xl border p-4">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-ink text-lg font-bold">
          {{ t('project.details.milestones') }}
        </h2>
        <Button
          v-if="canAddMilestoneButton"
          size="sm"
          variant="outline"
          :aria-label="t('project.details.addMilestone')"
          :disabled="isSubmitting"
          @click="dialogOpen = true"
        >
          {{ t('project.details.addMilestone') }}
        </Button>
      </div>

      <div
        v-if="!project.milestones?.length"
        class="border-border bg-card rounded-lg border-2 border-dashed p-8 text-center"
      >
        <p class="text-muted-foreground text-sm">
          {{ t('project.details.noMilestones') }}
        </p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="milestone in project.milestones"
          :key="milestone.id"
          class="border-border flex items-center justify-between rounded-lg border p-3"
        >
          <div class="flex-1">
            <h3 class="text-ink text-sm font-semibold">{{ milestone.name }}</h3>
            <p class="text-muted-foreground mt-1 text-xs">
              {{ formatCurrency(milestone.amount) }}
            </p>
          </div>
          <Pill
            :tone="getMilestoneStatusTone(milestone.status)"
            :label="t(`project.milestone.${milestone.status}`)"
          />
        </div>
      </div>
    </div>

    <!-- Milestone Dialog -->
    <MilestoneDialog
      :open="dialogOpen"
      mode="add"
      :next-order="nextMilestoneOrder"
      :is-submitting="isSubmitting"
      @update:open="dialogOpen = $event"
      @submit="handleAddMilestone"
    />
  </div>
</template>
