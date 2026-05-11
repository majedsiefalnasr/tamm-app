<script setup lang="ts">
import { computed } from 'vue'
import type { AdminProjectStatus } from '#shared/types/project'

interface Props {
  statusFilter: AdminProjectStatus
  searchQuery: string
  loading?: boolean
}

interface Emits {
  'update:statusFilter': [value: AdminProjectStatus]
  'update:search': [value: string]
}

withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<Emits>()

const { t } = useI18n()

const statusTabs = computed(() => [
  { id: 'all' as const, label: t('admin.projects.filter_all') },
  { id: 'new' as const, label: t('admin.projects.filter_new') },
  {
    id: 'open_for_bids' as const,
    label: t('admin.projects.filter_open_for_bids'),
  },
  {
    id: 'under_review' as const,
    label: t('admin.projects.filter_under_review'),
  },
  {
    id: 'contractor_selected' as const,
    label: t('admin.projects.filter_contractor_selected'),
  },
  { id: 'active' as const, label: t('admin.projects.filter_active') },
  { id: 'on_hold' as const, label: t('admin.projects.filter_on_hold') },
  { id: 'completed' as const, label: t('admin.projects.filter_completed') },
])

const handleTabClick = (tab: AdminProjectStatus) => {
  emit('update:statusFilter', tab)
}
</script>

<template>
  <div class="space-y-4">
    <!-- Status Filter Tabs -->
    <div class="border-border flex gap-x-2 overflow-x-auto border-b">
      <button
        v-for="tab in statusTabs"
        :key="tab.id"
        :class="[
          'border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition',
          statusFilter === tab.id
            ? 'border-primary text-primary'
            : 'text-muted-foreground hover:text-foreground border-transparent',
        ]"
        :disabled="loading"
        @click="handleTabClick(tab.id)"
      >
        {{ tab.label }}
      </button>
    </div>
  </div>
</template>
