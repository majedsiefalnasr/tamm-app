<script setup lang="ts">
import { useAdminProjects } from '~/composables/useAdminProjects'
import { usePermission } from '~/composables/usePermission'
import ProjectCreationRequestsSection from '~/components/admin/ProjectCreationRequestsSection.vue'
import ProjectOverviewCards from '~/components/admin/ProjectOverviewCards.vue'
import ProjectSearch from '~/components/admin/ProjectSearch.vue'
import ProjectOverviewTable from '~/components/admin/ProjectOverviewTable.vue'
import SectionErrorCard from '~/components/common/SectionErrorCard.vue'
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

    <ProjectCreationRequestsSection />

    <PageContentSkeleton
      v-if="showInitialSkeleton"
      :show-cards="true"
      :rows="6"
    />

    <template v-else>
      <ProjectOverviewCards :summary="summaryCards" :loading="loading" />

      <SectionErrorCard
        v-if="error"
        title-key="admin.projects.error"
        :detail="error || undefined"
        retry-label-key="admin.projects.retry"
        @retry="handleRetry"
      />

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
