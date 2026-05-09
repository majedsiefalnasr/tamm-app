<script setup lang="ts">
import { Badge } from '~/components/ui/badge'

interface Props {
  currentTab: string
  counts: {
    all: number
    active: number
    underReview: number
    completed: number
  }
}

withDefaults(defineProps<Props>(), {})

const emit = defineEmits<{
  'update:tab': [tab: string]
}>()

const { t } = useI18n()

const tabs = [
  { id: 'all', label: 'pages.assignments.tabAll', count: 'all' },
  { id: 'active', label: 'pages.assignments.tabActive', count: 'active' },
  {
    id: 'under_review',
    label: 'pages.assignments.tabUnderReview',
    count: 'underReview',
  },
  {
    id: 'completed',
    label: 'pages.assignments.tabCompleted',
    count: 'completed',
  },
]
</script>

<template>
  <div class="border-border mb-6 border-b">
    <div class="flex gap-1 md:gap-4">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="hover:text-foreground relative px-3 py-3 text-sm font-medium transition-colors md:px-4"
        :class="[
          currentTab === tab.id
            ? 'text-foreground border-primary border-b-2'
            : 'text-muted-foreground',
        ]"
        @click="emit('update:tab', tab.id)"
      >
        <span class="flex items-center gap-2">
          {{ $t(tab.label) }}
          <Badge
            v-if="counts[tab.count as keyof typeof counts]"
            variant="secondary"
            class="text-xs"
          >
            {{ counts[tab.count as keyof typeof counts] }}
          </Badge>
        </span>
      </button>
    </div>
  </div>
</template>
