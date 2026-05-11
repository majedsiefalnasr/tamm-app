<script setup lang="ts">
import { computed } from 'vue'
import type { Milestone } from '~/shared/types/project'
import { useI18n } from 'vue-i18n'
import { CheckIcon } from '@heroicons/vue/20/solid'
import { Button } from '~/components/ui/button'

interface Props {
  milestone: Milestone
}

interface Emits {
  (e: 'approve'): void
  (e: 'view-details'): void
}

const { milestone } = defineProps<Props>()
defineEmits<Emits>()

const { t, d, locale } = useI18n()

const supervisorInfo = computed(() => {
  if (milestone.supervisor && milestone.supervisor_approved_at) {
    const date = new Date(milestone.supervisor_approved_at)
    const dateStr = date.toLocaleDateString(
      locale.value === 'ar' ? 'ar-EG' : 'en-US',
      {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: locale.value === 'ar',
      }
    )
    return t('approval_queue.review_approved', {
      name: milestone.supervisor.name,
      date: dateStr,
    })
  }
  return ''
})

const formattedAmount = computed(() => {
  const localeMap: Record<string, string> = { ar: 'ar-EG', en: 'en-US' }
  return new Intl.NumberFormat(localeMap[locale.value] || 'ar-EG', {
    style: 'currency',
    currency: 'EGP',
  }).format(milestone.amount)
})
</script>

<template>
  <div
    class="border-border bg-card flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-start sm:justify-between"
  >
    <!-- Left side: project + milestone info -->
    <div class="min-w-0 flex-1">
      <NuxtLink
        :to="`/projects/${milestone.project_id}`"
        class="text-muted-foreground hover:text-foreground text-xs font-bold transition-colors"
      >
        {{ milestone.project?.name || $t('milestone.project_unknown') }}
      </NuxtLink>
      <NuxtLink
        :to="`/projects/${milestone.project_id}/milestones/${milestone.id}`"
        class="text-ink hover:text-primary block truncate text-sm font-bold transition-colors"
      >
        {{ milestone.name }}
      </NuxtLink>
      <div class="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
        <CheckIcon class="h-4 w-4 shrink-0" />
        <span>{{ supervisorInfo }}</span>
      </div>
    </div>

    <!-- Right side: amount + buttons -->
    <div class="flex flex-col items-start gap-2 sm:shrink-0 sm:items-end">
      <p class="text-primary text-lg font-extrabold">{{ formattedAmount }}</p>
      <div class="flex w-full gap-2 sm:min-h-10 sm:w-auto">
        <Button
          variant="outline"
          size="sm"
          class="flex-1 sm:h-10 sm:flex-none"
          @click="$emit('view-details')"
        >
          {{ $t('actions.view_details') }}
        </Button>
        <Button
          size="sm"
          class="flex-1 sm:h-10 sm:flex-none"
          @click="$emit('approve')"
        >
          {{ $t('actions.approve') }}
        </Button>
      </div>
    </div>
  </div>
</template>
