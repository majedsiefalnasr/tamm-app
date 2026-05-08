<script setup lang="ts">
import { computed } from 'vue'
import { useAdminProjects } from '../../composables/useAdminProjects'
import { usePermission } from '../../composables/usePermission'
import ProjectOverviewCards from '../../components/admin/ProjectOverviewCards.vue'
import ProjectSearch from '../../components/admin/ProjectSearch.vue'
import ProjectOverviewTable from '../../components/admin/ProjectOverviewTable.vue'
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert'
import { AlertTriangle } from 'lucide-vue-next'

definePageMeta({
  middleware: 'auth',
})

const { $t } = useI18n()
const router = useRouter()
const { can } = usePermission()

// Access control
if (!can('view_admin_projects')) {
  navigateTo('/403')
}

const {
  projects,
  loading,
  error,
  statusFilter,
  searchQuery,
  currentPage,
  pagination,
  summaryCards,
  handleSearch,
  handleStatusFilter,
  handlePageChange,
  fetchProjects,
} = useAdminProjects()

// Fetch projects on mount
onMounted(() => {
  fetchProjects()
})

const handleRetry = () => {
  fetchProjects()
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div>
      <h1 class="text-ink text-3xl font-extrabold">
        {{ $t('admin.projects.page_title') }}
      </h1>
    </div>

    <!-- Summary Cards -->
    <ProjectOverviewCards :summary="summaryCards" :loading="loading" />

    <!-- Error State -->
    <Alert
      v-if="error"
      variant="destructive"
      class="border-destructive/50 bg-destructive/5"
    >
      <AlertTriangle class="h-4 w-4" />
      <AlertTitle>{{ $t('admin.projects.error') }}</AlertTitle>
      <AlertDescription>
        <div class="mt-2 flex gap-2">
          <button
            class="bg-destructive hover:bg-destructive/90 rounded-md px-3 py-1 text-sm text-white"
            @click="handleRetry"
          >
            {{ $t('admin.projects.retry') }}
          </button>
        </div>
      </AlertDescription>
    </Alert>

    <!-- Search & Filter -->
    <ProjectSearch
      :status-filter="statusFilter"
      :search-query="searchQuery"
      :loading="loading"
      @update:status-filter="handleStatusFilter"
      @update:search="handleSearch"
    />

    <!-- Projects Table -->
    <ProjectOverviewTable
      :projects="projects"
      :loading="loading"
      :pagination="pagination"
      :current-page="currentPage"
      @page-change="handlePageChange"
    />
  </div>
</template>
