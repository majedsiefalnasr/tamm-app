<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAdminUsers } from '~/composables/useAdminUsers'
import { usePermission } from '~/composables/usePermission'
import { useAuthStore } from '~/stores/auth'
import { Button } from '~/components/ui/button'
import { Users } from 'lucide-vue-next'
import SectionErrorCard from '~/components/common/SectionErrorCard.vue'
import UserTable from '~/components/admin/UserTable.vue'
import CreateUserDialog from '~/components/admin/CreateUserDialog.vue'
import { Badge } from '~/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog'
import type { Role } from '#shared/types/user'

definePageMeta({
  roles: ['admin', 'super_admin'],
  pageTitle: 'admin.users.title',
})

const { t, locale } = useI18n()

const { can } = usePermission()
const auth = useAuthStore()

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
    { id: 'all', label: t('admin.users.filter_all') },
    { id: 'contractor', label: t('admin.users.filter_contractors') },
    {
      id: 'engineer',
      label: t('admin.users.filter_engineers'),
    },
    { id: 'client', label: t('admin.users.filter_clients') },
  ]

  if (auth.user?.role !== 'super_admin') {
    tabs.push({ id: 'admin', label: t('admin.users.filter_admins') })
  }

  return tabs
})

function handleRoleTabClick(role: Role | 'all') {
  selectedRole.value = role
}

const hasEmptyResults = computed(
  () => !loading.value && users.value.length === 0
)

const editingUser = computed(() =>
  editingUserId.value
    ? (users.value.find(u => u.id === editingUserId.value) ?? null)
    : null
)

const handleAddUser = () => {
  showCreateDialog.value = true
  editingUserId.value = null
}

const handleEditUser = (userId: string) => {
  editingUserId.value = userId
  showCreateDialog.value = true
}

const deactivateAlertOpen = ref(false)
const deactivateTargetId = ref<string | null>(null)

const handleToggleStatus = (userId: string) => {
  if (!can('toggle_user_status')) {
    return
  }
  const user = users.value.find(u => u.id === userId)
  if (!user) return
  if (user.status === 'active') {
    deactivateTargetId.value = userId
    deactivateAlertOpen.value = true
    return
  }
  void toggleUserStatus(userId)
}

function onDeactivateAlertOpenChange(open: boolean) {
  deactivateAlertOpen.value = open
  if (!open) {
    deactivateTargetId.value = null
  }
}

async function confirmDeactivateUser() {
  const id = deactivateTargetId.value
  if (!id) return
  await toggleUserStatus(id)
  deactivateAlertOpen.value = false
  deactivateTargetId.value = null
}

const handleUserCreated = () => {
  showCreateDialog.value = false
  editingUserId.value = null
  refetch()
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-ink text-3xl font-extrabold">
        {{ t('admin.users.title') }}
      </h1>
      <div class="flex flex-wrap items-center gap-2">
        <Button @click="handleAddUser">
          {{ t('admin.users.add_button') }}
        </Button>
      </div>
    </div>

    <div
      class="border-border flex gap-x-2 overflow-x-auto border-b"
      role="tablist"
      :dir="locale === 'ar' ? 'rtl' : 'ltr'"
      :aria-label="t('admin.users.title')"
    >
      <button
        v-for="tab in filterTabs"
        :key="tab.id"
        type="button"
        role="tab"
        :aria-selected="selectedRole === tab.id"
        :class="[
          'group flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition',
          selectedRole === tab.id
            ? 'border-primary text-primary'
            : 'text-muted-foreground hover:text-foreground border-transparent',
        ]"
        @click="handleRoleTabClick(tab.id)"
      >
        <span class="whitespace-nowrap">{{ tab.label }}</span>
        <Badge
          variant="secondary"
          :class="[
            'min-w-6 justify-center border-transparent px-1.5 tabular-nums transition-colors',
            selectedRole === tab.id
              ? 'bg-primary/15 text-primary'
              : 'bg-muted-foreground/15 text-muted-foreground',
          ]"
        >
          {{ userCountByRole[tab.id as keyof typeof userCountByRole] }}
        </Badge>
      </button>
    </div>

    <div
      v-if="hasEmptyResults"
      class="border-border bg-muted/30 flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-12"
    >
      <Users class="text-muted-foreground mb-3 h-8 w-8" />
      <p class="text-muted-foreground text-sm">
        {{ t('admin.users.empty_state') }}
      </p>
    </div>

    <div v-else>
      <UserTable
        :users="users"
        :loading="loading"
        @edit-user="handleEditUser"
        @toggle-status="handleToggleStatus"
      />
    </div>

    <SectionErrorCard
      v-if="error"
      title-key="common.error_occurred"
      :detail="error"
      @retry="refetch"
    />

    <AlertDialog
      :open="deactivateAlertOpen"
      @update:open="onDeactivateAlertOpenChange"
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{{
            t('admin.users.deactivate_confirm.title')
          }}</AlertDialogTitle>
          <AlertDialogDescription>{{
            t('admin.users.deactivate_confirm.description')
          }}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{{
            t('admin.users.deactivate_confirm.cancel')
          }}</AlertDialogCancel>
          <AlertDialogAction as-child>
            <Button
              variant="destructive"
              @click.prevent="confirmDeactivateUser"
            >
              {{ t('admin.users.deactivate_confirm.confirm') }}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <CreateUserDialog
      :open="showCreateDialog"
      :user="editingUser"
      @update:open="
        open => {
          showCreateDialog = open
          if (!open) editingUserId = null
        }
      "
      @success="handleUserCreated"
    />
  </div>
</template>
