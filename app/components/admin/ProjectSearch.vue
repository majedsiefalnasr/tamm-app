<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, X } from 'lucide-vue-next'
import { Input } from '../ui/input'
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

defineEmits<Emits>()

const { $t } = useI18n()

const statusTabs = computed(() => [
  { id: 'all' as const, label: $t('admin.projects.filter_all') },
  { id: 'new' as const, label: $t('admin.projects.filter_new') },
  { id: 'active' as const, label: $t('admin.projects.filter_active') },
  { id: 'on_hold' as const, label: $t('admin.projects.filter_on_hold') },
  { id: 'completed' as const, label: $t('admin.projects.filter_completed') },
])

const handleSearch = (value: string) => {
  const truncated = value.slice(0, 100)
  emit('update:search', truncated)
}

const handleClearSearch = () => {
  emit('update:search', '')
}

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

    <!-- Search Box -->
    <div class="flex items-center gap-2">
      <div class="relative flex-1">
        <Search
          class="text-muted-foreground absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2"
        />
        <Input
          :model-value="searchQuery"
          :placeholder="$t('admin.projects.search_placeholder')"
          class="ps-10"
          :disabled="loading"
          @update:model-value="handleSearch"
        />
        <button
          v-if="searchQuery"
          class="text-muted-foreground hover:text-foreground absolute end-3 top-1/2 -translate-y-1/2 transition"
          :disabled="loading"
          :aria-label="$t('common.clear')"
          @click="handleClearSearch"
        >
          <X class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>
