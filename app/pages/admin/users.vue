<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAdminUsers } from '../../composables/useAdminUsers'
import { usePermission } from '../../composables/usePermission'
import { Button } from '../../components/ui/button'
import CreateUserDialog from '../../components/admin/CreateUserDialog.vue'
import UserTable from '../../components/admin/UserTable.vue'
import type { Role } from '#shared/types/user'

definePageMeta({
  middleware: 'auth',
})

const { $t } = useI18n()
const router = useRouter()
const { can } = usePermission()

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

const filterTabs = computed(() => [
  { id: 'all', label: $t('admin.users.filter_all') },
  { id: 'contractor', label: $t('admin.users.filter_contractors') },
  {
    id: 'field_engineer',
    label: $t('admin.users.filter_engineers'),
  },
  { id: 'client', label: $t('admin.users.filter_clients') },
  { id: 'admin', label: $t('admin.users.filter_admins') },
])

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
  await toggleUserStatus(userId)
}

const handleCreateUserDialogClose = () => {
  showCreateDialog.value = false
  editingUserId.value = null
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-ink text-3xl font-extrabold">
          {{ $t('admin.users.title') }}
        </h1>
      </div>
      <Button class="ms-4" @click="handleAddUser">
        {{ $t('admin.users.add_button') }}
      </Button>
    </div>

    <!-- Filter Tabs -->
    <div class="border-border flex gap-x-2 border-b">
      <button
        v-for="tab in filterTabs"
        :key="tab.id"
        :class="[
          'border-b-2 px-4 py-3 text-sm font-medium transition',
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

    <!-- Create User Dialog (Story 06-02) -->
    <CreateUserDialog
      :open="showCreateDialog"
      @update:open="handleCreateUserDialogClose"
      @success="
        () => {
          handleCreateUserDialogClose()
          refetch()
        }
      "
    />
  </div>
</template>
