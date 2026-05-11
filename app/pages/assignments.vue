<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { usePermission } from '~/composables/usePermission'
import FieldEngineerAssignmentsWorkspace from '~/components/assignments/FieldEngineerAssignmentsWorkspace.vue'
import AssignmentsQueueTable from '~/components/assignments/AssignmentsQueueTable.vue'
import PageContentSkeleton from '~/components/common/PageContentSkeleton.vue'
import ErrorState from '~/components/common/ErrorState.vue'
import EmptyState from '~/components/common/EmptyState.vue'
import { Button } from '~/components/ui/button'

definePageMeta({
  roles: ['field_engineer', 'admin', 'super_admin', 'supervisor_engineer'],
})

const auth = useAuthStore()
const route = useRoute()
const { can } = usePermission()

const role = computed(() => auth.user?.role ?? '')

if (
  ['admin', 'super_admin'].includes(auth.user?.role ?? '') &&
  !can('view_admin_panel')
) {
  await navigateTo('/403')
}

const pageTitleKeyByRole: Record<string, string> = {
  field_engineer: 'pages.assignments.title',
  admin: 'pages.admin_assignments_title',
  super_admin: 'pages.admin_assignments_title',
  supervisor_engineer: 'pages.supervisor_assignments_title',
}

watch(
  role,
  r => {
    const meta = route.meta as { pageTitle?: string }
    const key = pageTitleKeyByRole[r]
    if (key) meta.pageTitle = key
  },
  { immediate: true }
)

const queue = useAssignmentsQueueWorkspace()

const isQueueRole = computed(() =>
  ['admin', 'super_admin', 'supervisor_engineer'].includes(role.value)
)

const queueTitleKey = computed(() =>
  role.value === 'supervisor_engineer'
    ? 'pages.supervisor_assignments_title'
    : 'pages.admin_assignments_title'
)

const queueSubtitleKey = computed(() =>
  role.value === 'supervisor_engineer'
    ? 'pages.supervisor_assignments_description'
    : 'pages.admin_assignments_description'
)

const queueEmptyTitleKey = computed(() =>
  role.value === 'supervisor_engineer'
    ? 'pages.assignment_queue.empty_title_supervisor'
    : 'pages.assignment_queue.empty_title_admin'
)

const queueEmptyDescKey = computed(() =>
  role.value === 'supervisor_engineer'
    ? 'pages.assignment_queue.empty_desc_supervisor'
    : 'pages.assignment_queue.empty_desc_admin'
)

watch(
  isQueueRole,
  async active => {
    if (active) {
      await queue.fetchQueue()
    }
  },
  { immediate: true }
)

function retryQueue() {
  void queue.fetchQueue()
}
</script>

<template>
  <FieldEngineerAssignmentsWorkspace v-if="role === 'field_engineer'" />

  <div v-else-if="isQueueRole" class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold">
        {{ $t(queueTitleKey) }}
      </h1>
      <p class="text-muted-foreground mt-2">
        {{ $t(queueSubtitleKey) }}
      </p>
    </div>

    <PageContentSkeleton
      v-if="queue.loading && queue.rows.length === 0"
      :rows="6"
    />

    <ErrorState
      v-else-if="queue.error"
      :message="queue.error"
      @action="retryQueue"
    />

    <EmptyState
      v-else-if="queue.rows.length === 0"
      icon="clipboard"
      :title="queueEmptyTitleKey"
      :description="queueEmptyDescKey"
    >
      <Button as-child variant="outline" class="mt-1">
        <NuxtLink to="/projects">{{ $t('nav.projects') }}</NuxtLink>
      </Button>
    </EmptyState>

    <AssignmentsQueueTable v-else :rows="queue.rows" />
  </div>
</template>
