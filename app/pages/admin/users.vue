<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAdminUsers } from '../../composables/useAdminUsers'
import { usePermission } from '../../composables/usePermission'
import { useAuth } from '../../composables/useAuth'
import { Button } from '../../components/ui/button'
import { Users } from 'lucide-vue-next'
import UserTable from '../../components/admin/UserTable.vue'
import type { Role } from '#shared/types/user'

definePageMeta({
  middleware: 'auth',
})

const { $t } = useI18n()
const router = useRouter()
const { can } = usePermission()
const { user: authUser } = useAuth()

// Access control
if (!can('view_admin_panel')) {
  navigateTo('/403')
}

const {
  users,
  loading,
  error,
  selectedRole,
  userCountByRole,
  toggleUserStatus,
  refetch,
} = useAdminUsers()

const showCreateDialog = ref(false)
const editingUserId = ref<string | null>(null)

const filterTabs = computed(() => {
  const tabs = [
    { id: 'all', label: $t('admin.users.filter_all') },
    { id: 'contractor', label: $t('admin.users.filter_contractors') },
    {
      id: 'engineer',
      label: $t('admin.users.filter_engineers'),
    },
    { id: 'client', label: $t('admin.users.filter_clients') },
  ]

  // Super admin cannot filter by admin role — they see all
  if (authUser.value?.role !== 'super_admin') {
    tabs.push({ id: 'admin', label: $t('admin.users.filter_admins') })
  }

  return tabs
})

const hasEmptyResults = computed(
  () => !loading.value && users.value.length === 0
)

const handleAddUser = () => {
  showCreateDialog.value = true
  editingUserId.value = null
}

const handleEditUser = (userId: string) => {
  editingUserId.value = userId
  showCreateDialog.value = true
}

const handleToggleStatus = async (userId: string) => {
  if (!can('toggle_user_status')) {
    return
  }
  await toggleUserStatus(userId)
}

const handleCreateUserDialogClose = () => {
  showCreateDialog.value = false
  editingUserId.value = null
}

// TODO: Wire CreateUserDialog when Story 06-02 is merged
const handleUserCreated = () => {
  showCreateDialog.value = false
  editingUserId.value = null
  refetch()
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-ink text-3xl font-extrabold">
        {{ $t('admin.users.title') }}
      </h1>
      <Button @click="handleAddUser">
        {{ $t('admin.users.add_button') }}
      </Button>
    </div>

    <!-- Filter Tabs -->
    <div class="border-border flex gap-x-2 border-b">
      <button
        v-for="tab in filterTabs"
        :key="tab.id"
        :class="[
          'border-b-2 py-3 ps-4 pe-4 text-sm font-medium transition',
          selectedRole === tab.id
            ? 'border-primary text-primary'
            : 'text-muted-foreground hover:text-foreground border-transparent',
        ]"
        @click="selectedRole = tab.id as Role | 'all'"
      >
        {{ tab.label }}
        <span class="ms-2 text-xs opacity-60">
          ({{ userCountByRole[tab.id as keyof typeof userCountByRole] }})
        </span>
      </button>
    </div>

    <!-- Empty State -->
    <div
      v-if="hasEmptyResults"
      class="border-border bg-muted/30 flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-12"
    >
      <Users class="text-muted-foreground mb-3 h-8 w-8" />
      <p class="text-muted-foreground text-sm">
        {{ $t('admin.users.empty_state') }}
      </p>
    </div>

    <!-- User Table or Skeleton -->
    <div v-else>
      <UserTable
        :users="users"
        :loading="loading"
        @edit-user="handleEditUser"
        @toggle-status="handleToggleStatus"
      />
    </div>

    <!-- Error Message -->
    <div
      v-if="error"
      class="border-destructive bg-destructive/10 rounded-lg border p-4"
    >
      <p class="text-destructive text-sm">{{ error }}</p>
    </div>

    <!-- Create User Dialog (Story 06-02) — wiring added when component is available -->
  </div>
</template>
