<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAdminUsers } from '~/composables/useAdminUsers'
import { useAdminUserListPreset } from '~/composables/useAdminUserListPreset'
import { usePermission } from '~/composables/usePermission'
import { useAuthStore } from '~/stores/auth'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '~/components/ui/sheet'
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group'
import { Label } from '~/components/ui/label'
import { Users, Columns2 } from 'lucide-vue-next'
import UserTable from '~/components/admin/UserTable.vue'
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

const { t } = useI18n()
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

const { preset, setPreset } = useAdminUserListPreset()
const presetSheetOpen = ref(false)

function handlePresetChange(value: string | undefined) {
  if (value === 'default' || value === 'compact' || value === 'minimal') {
    setPreset(value)
  }
}

function handleMobilePresetChange(value: string) {
  handlePresetChange(value)
  presetSheetOpen.value = false
}

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

const handleCreateUserDialogClose = () => {
  showCreateDialog.value = false
  editingUserId.value = null
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
        <div class="hidden md:block">
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="outline" size="sm" class="gap-2">
                <Columns2 class="h-4 w-4" aria-hidden="true" />
                {{ t('admin.users.list_preset.menu_label') }}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-56">
              <DropdownMenuLabel>{{
                t('admin.users.list_preset.menu_label')
              }}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                :model-value="preset"
                @update:model-value="handlePresetChange"
              >
                <DropdownMenuRadioItem
                  value="default"
                  class="flex-col items-start gap-0 py-2"
                >
                  <span class="font-medium">{{
                    t('admin.users.list_preset.preset_default')
                  }}</span>
                  <span class="text-muted-foreground text-xs font-normal">{{
                    t('admin.users.list_preset.preset_default_hint')
                  }}</span>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="compact"
                  class="flex-col items-start gap-0 py-2"
                >
                  <span class="font-medium">{{
                    t('admin.users.list_preset.preset_compact')
                  }}</span>
                  <span class="text-muted-foreground text-xs font-normal">{{
                    t('admin.users.list_preset.preset_compact_hint')
                  }}</span>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="minimal"
                  class="flex-col items-start gap-0 py-2"
                >
                  <span class="font-medium">{{
                    t('admin.users.list_preset.preset_minimal')
                  }}</span>
                  <span class="text-muted-foreground text-xs font-normal">{{
                    t('admin.users.list_preset.preset_minimal_hint')
                  }}</span>
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div class="md:hidden">
          <Sheet v-model:open="presetSheetOpen">
            <SheetTrigger as-child>
              <Button
                variant="outline"
                size="sm"
                class="gap-2"
                :aria-label="t('admin.users.list_preset.open_sheet')"
              >
                <Columns2 class="h-4 w-4 shrink-0" aria-hidden="true" />
                <span class="truncate text-sm">{{
                  t('admin.users.list_preset.menu_label')
                }}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="end" class="flex flex-col gap-6">
              <SheetHeader class="text-start">
                <SheetTitle>{{
                  t('admin.users.list_preset.sheet_title')
                }}</SheetTitle>
                <SheetDescription>{{
                  t('admin.users.list_preset.sheet_description')
                }}</SheetDescription>
              </SheetHeader>
              <RadioGroup
                class="flex flex-col gap-3"
                :model-value="preset"
                @update:model-value="handleMobilePresetChange"
              >
                <div class="border-border flex gap-3 rounded-lg border p-3">
                  <RadioGroupItem id="preset-default" value="default" />
                  <div class="grid flex-1 gap-1">
                    <Label
                      for="preset-default"
                      class="cursor-pointer font-medium"
                      >{{ t('admin.users.list_preset.preset_default') }}</Label
                    >
                    <p class="text-muted-foreground text-xs">
                      {{ t('admin.users.list_preset.preset_default_hint') }}
                    </p>
                  </div>
                </div>
                <div class="border-border flex gap-3 rounded-lg border p-3">
                  <RadioGroupItem id="preset-compact" value="compact" />
                  <div class="grid flex-1 gap-1">
                    <Label
                      for="preset-compact"
                      class="cursor-pointer font-medium"
                      >{{ t('admin.users.list_preset.preset_compact') }}</Label
                    >
                    <p class="text-muted-foreground text-xs">
                      {{ t('admin.users.list_preset.preset_compact_hint') }}
                    </p>
                  </div>
                </div>
                <div class="border-border flex gap-3 rounded-lg border p-3">
                  <RadioGroupItem id="preset-minimal" value="minimal" />
                  <div class="grid flex-1 gap-1">
                    <Label
                      for="preset-minimal"
                      class="cursor-pointer font-medium"
                      >{{ t('admin.users.list_preset.preset_minimal') }}</Label
                    >
                    <p class="text-muted-foreground text-xs">
                      {{ t('admin.users.list_preset.preset_minimal_hint') }}
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </SheetContent>
          </Sheet>
        </div>

        <Button @click="handleAddUser">
          {{ t('admin.users.add_button') }}
        </Button>
      </div>
    </div>

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
        :density-preset="preset"
        @edit-user="handleEditUser"
        @toggle-status="handleToggleStatus"
      />
    </div>

    <div
      v-if="error"
      class="border-destructive bg-destructive/10 rounded-lg border p-4"
    >
      <p class="text-destructive text-sm">{{ error }}</p>
    </div>

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
  </div>
</template>
