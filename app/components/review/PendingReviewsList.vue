<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Milestone } from '~/shared/types/project'
import ReviewListItem from './ReviewListItem.vue'
import EmptyState from '~/components/common/EmptyState.vue'
import PageSkeleton from '~/components/common/PageSkeleton.vue'
import ErrorState from '~/components/common/ErrorState.vue'

interface Props {
  items: Milestone[]
  loading: boolean
  error: string | null
}

interface Emits {
  (e: 'retry'): void
  (e: 'action-complete'): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

const isOpen = ref<Record<string, boolean>>({})

const toggleItem = (milestoneId: string) => {
  isOpen.value[milestoneId] = !isOpen.value[milestoneId]
}

const hasItems = computed(
  () => Array.isArray(props.items) && props.items.length > 0
)
</script>

<template>
  <div class="space-y-4">
    <!-- Loading state -->
    <PageSkeleton v-if="loading" />

    <!-- Error state -->
    <ErrorState
      v-else-if="error"
      :message="error"
      :action-label="$t('common.retry')"
      @action="$emit('retry')"
    />

    <!-- Empty state -->
    <EmptyState
      v-else-if="!hasItems"
      icon="inbox"
      :title="$t('pages.reviews.empty.title')"
      :description="$t('pages.reviews.empty.description')"
    />

    <!-- List of pending reviews -->
    <div v-else class="space-y-3">
      <ReviewListItem
        v-for="milestone in props.items"
        :key="milestone.id"
        :milestone="milestone"
        :is-expanded="isOpen[milestone.id] || false"
        @toggle="toggleItem(milestone.id)"
        @action-complete="$emit('action-complete')"
      />
    </div>
  </div>
</template>
