<script setup lang="ts">
import { computed, watch } from 'vue'
import ContractorDashboardPage from '~/components/contractor/ContractorDashboardPage.vue'
import FieldEngineerDashboard from '~/components/dashboard/FieldEngineerDashboard.vue'
import SupervisorEngineerDashboard from '~/components/dashboard/SupervisorEngineerDashboard.vue'
import ClientDashboardSection from '~/components/dashboard/ClientDashboardSection.vue'
import AdminDashboardPage from '~/components/dashboard/AdminDashboardPage.vue'

const auth = useAuthStore()
const route = useRoute()
const { can } = usePermission()

if (auth.user?.role === 'contractor' && !can('view_contractor_dashboard')) {
  await navigateTo('/403')
}

const role = computed(() => auth.user?.role ?? '')

const pageTitleKeyByRole: Record<string, string> = {
  client: 'pages.client_dashboard',
  contractor: 'pages.contractor_dashboard',
  field_engineer: 'dashboard.fieldEngineer.title',
  supervisor_engineer: 'pages.supervisor_dashboard',
  admin: 'admin.dashboard.page_title',
  super_admin: 'admin.dashboard.page_title',
}

watch(
  role,
  r => {
    const meta = route.meta as { pageTitle?: string }
    meta.pageTitle = pageTitleKeyByRole[r] ?? 'pages.admin_dashboard'
  },
  { immediate: true }
)
</script>

<template>
  <ContractorDashboardPage v-if="role === 'contractor'" />
  <div
    v-else
    class="flex flex-col gap-4 px-4 py-4 pb-16 md:gap-6 md:py-6 md:pb-20 lg:px-6"
  >
    <ClientDashboardSection v-if="role === 'client'" />
    <FieldEngineerDashboard v-else-if="role === 'field_engineer'" />
    <SupervisorEngineerDashboard v-else-if="role === 'supervisor_engineer'" />
    <AdminDashboardPage
      v-else-if="role === 'admin' || role === 'super_admin'"
    />
    <div v-else class="text-muted-foreground text-sm">
      {{ $t('errors.access_denied') }}
    </div>
  </div>
</template>
