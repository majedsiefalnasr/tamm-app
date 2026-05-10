<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useMilestones } from '~/composables/useMilestones'
import { useI18n } from 'vue-i18n'
import ApprovalQueueList from './ApprovalQueueList.vue'

const { getPendingApprovals, pendingApprovals, loading, error } =
  useMilestones()
const { t: $t } = useI18n()

const localError = ref<string | null>(null)

/** True until first fetch finishes — prevents empty-state flash before onMounted */
const approvalsBootstrapping = ref(true)

const count = computed(() => pendingApprovals.value.length)

const countBadgeClass = computed(() =>
  count.value > 2
    ? 'bg-destructive text-destructive-foreground'
    : 'bg-primary text-primary-foreground'
)

onMounted(async () => {
  try {
    await getPendingApprovals()
  } catch (err) {
    localError.value =
      err instanceof Error ? err.message : 'Failed to load approvals'
  } finally {
    approvalsBootstrapping.value = false
  }
})

const handleRetry = async () => {
  localError.value = null
  try {
    await getPendingApprovals()
  } catch (err) {
    localError.value =
      err instanceof Error ? err.message : 'Failed to load approvals'
  }
}

const handleActionComplete = async () => {
  try {
    await getPendingApprovals()
  } catch (err) {
    localError.value =
      err instanceof Error ? err.message : 'Failed to refresh approvals'
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Widget header -->
    <div class="flex items-center justify-between">
      <h2 class="text-ink text-lg font-bold">
        {{ $t('approval_queue.title') }}
      </h2>
      <div
        v-if="count > 0"
        :class="[
          countBadgeClass,
          'inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-bold',
        ]"
      >
        {{ count }}
      </div>
    </div>

    <!-- List or state -->
    <ApprovalQueueList
      :items="pendingApprovals"
      :loading="loading || approvalsBootstrapping"
      :error="localError || error || null"
      @retry="handleRetry"
      @action-complete="handleActionComplete"
    />
  </div>
</template>
