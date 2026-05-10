<script setup lang="ts">
import { useAdminProjects } from '~/composables/useAdminProjects'
import { usePermission } from '~/composables/usePermission'
import ProjectOverviewCards from '~/components/admin/ProjectOverviewCards.vue'
import ProjectSearch from '~/components/admin/ProjectSearch.vue'
import ProjectOverviewTable from '~/components/admin/ProjectOverviewTable.vue'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { AlertTriangle } from 'lucide-vue-next'
import PageContentSkeleton from '~/components/common/PageContentSkeleton.vue'

const { t } = useI18n()
const { can } = usePermission()

onBeforeMount(() => {
  if (!can('view_admin_projects')) {
    navigateTo('/403')
  }
})

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

const showInitialSkeleton = computed(
  () => loading.value && projects.value.length === 0 && !error.value
)

onMounted(() => {
  fetchProjects()
})

const handleRetry = () => {
  fetchProjects()
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-ink text-3xl font-extrabold">
        {{ t('admin.projects.page_title') }}
      </h1>
    </div>

    <PageContentSkeleton
      v-if="showInitialSkeleton"
      :show-cards="true"
      :rows="6"
    />

    <template v-else>
      <ProjectOverviewCards :summary="summaryCards" :loading="loading" />

      <Alert
        v-if="error"
        variant="destructive"
        class="border-destructive/50 bg-destructive/5"
      >
        <AlertTriangle class="h-4 w-4" />
        <AlertTitle>{{ t('admin.projects.error') }}</AlertTitle>
        <AlertDescription>
          <div class="mt-2 flex gap-2">
            <button
              type="button"
              class="bg-destructive hover:bg-destructive/90 rounded-md px-3 py-1 text-sm text-white"
              @click="handleRetry"
            >
              {{ t('admin.projects.retry') }}
            </button>
          </div>
        </AlertDescription>
      </Alert>

      <ProjectSearch
        :status-filter="statusFilter"
        :search-query="searchQuery"
        :loading="loading"
        @update:status-filter="handleStatusFilter"
        @update:search="handleSearch"
      />

      <ProjectOverviewTable
        :projects="projects"
        :loading="loading"
        :pagination="pagination"
        :current-page="currentPage"
        @page-change="handlePageChange"
      />
    </template>
  </div>
</template>
