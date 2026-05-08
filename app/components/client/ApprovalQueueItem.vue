<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Milestone } from '~/shared/types/project'
import { useI18n } from 'vue-i18n'
import { Button } from '~/components/ui/button'

interface Props {
  milestone: Milestone
}

interface Emits {
  (e: 'approve'): void
  (e: 'view-details'): void
}

defineProps<Props>()
defineEmits<Emits>()

const { t, d } = useI18n()
const approving = ref(false)

const supervisorInfo = computed(() => {
  if (milestone.supervisor && milestone.supervisor_approved_at) {
    const date = new Date(milestone.supervisor_approved_at)
    return t('approval_queue.supervisor_approved', {
      name: milestone.supervisor.name,
      date: d(date, 'short'),
    })
  }
  return ''
})

const formattedAmount = computed(() => {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
  }).format(milestone.amount)
})

const handleApprove = async () => {
  approving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 100))
  } finally {
    approving.value = false
  }
}
</script>

<template>
  <div
    class="border-border bg-card flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-start sm:justify-between"
  >
    <!-- Left side: project + milestone info -->
    <div class="min-w-0 flex-1">
      <p class="text-muted-foreground text-xs font-bold">
        {{ milestone.project?.name || 'Project' }}
      </p>
      <p class="text-ink truncate text-sm font-bold">{{ milestone.name }}</p>
      <p class="text-muted-foreground mt-1 text-xs">✓ {{ supervisorInfo }}</p>
    </div>

    <!-- Right side: amount + buttons -->
    <div class="flex flex-col items-start gap-2 sm:shrink-0 sm:items-end">
      <p class="text-primary text-lg font-extrabold">{{ formattedAmount }}</p>
      <div class="flex w-full gap-2 sm:w-auto">
        <Button
          variant="outline"
          size="sm"
          class="flex-1 sm:flex-none"
          @click="$emit('view-details')"
        >
          {{ $t('actions.view_details') }}
        </Button>
        <Button
          size="sm"
          :loading="approving"
          class="flex-1 sm:flex-none"
          @click="$emit('approve')"
        >
          {{ $t('actions.approve') }}
        </Button>
      </div>
    </div>
  </div>
</template>
