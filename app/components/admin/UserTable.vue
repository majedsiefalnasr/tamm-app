<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { Skeleton } from '../ui/skeleton'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { ChevronDown } from 'lucide-vue-next'
import UserActionMenu from './UserActionMenu.vue'
import type { User } from '../../composables/useAdminUsers'
import type { AdminUserListTablePreset } from '~/composables/useAdminUserListPreset'

const { t } = useI18n()

// Calculate skeleton rows based on viewport height
const skeletonRowCount = ref(5)
onMounted(() => {
  const rowHeight = 48
  const availableHeight = Math.max(window.innerHeight - 400, 300)
  skeletonRowCount.value = Math.max(5, Math.floor(availableHeight / rowHeight))
})

interface Props {
  users?: User[]
  loading?: boolean
  densityPreset?: AdminUserListTablePreset
  togglingStatusIds?: Set<string>
}

const props = withDefaults(defineProps<Props>(), {
  users: () => [],
  loading: false,
  densityPreset: 'default',
  togglingStatusIds: () => new Set<string>(),
})

const emit = defineEmits<{
  'edit-user': [userId: string]
  'toggle-status': [userId: string]
}>()

const showOptionalColumns = computed(() => props.densityPreset !== 'minimal')

const headerDensityClass = computed(() =>
  props.densityPreset === 'compact' ? '[&_th]:py-2 [&_th]:text-xs' : ''
)

const bodyRowDensityClass = computed(() => {
  if (props.densityPreset === 'compact') {
    return '[&_td]:py-2 [&_td]:text-xs'
  }
  return ''
})

const skeletonWidths = computed(() =>
  showOptionalColumns.value
    ? ['w-24', 'w-32', 'w-20', 'w-16', 'w-20', 'w-8']
    : ['w-24', 'w-20', 'w-16', 'w-8']
)

const tableSearch = ref('')
const columnVisibility = ref({
  name: true,
  email: true,
  role: true,
  status: true,
  created: true,
  actions: true,
})

const formattedUsers = computed(() => {
  return props.users.map(user => ({
    ...user,
    createdAgo: formatRelativeTime(user.created_at),
  }))
})

const filteredUsers = computed(() => {
  const q = tableSearch.value.trim().toLowerCase()
  if (!q) return formattedUsers.value
  return formattedUsers.value.filter(user => {
    const roleLabel = t(`roles.${user.role}.label`).toLowerCase()
    return (
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q) ||
      roleLabel.includes(q)
    )
  })
})

const showColumn = (
  key: 'name' | 'email' | 'role' | 'status' | 'created' | 'actions'
) => {
  if ((key === 'email' || key === 'created') && !showOptionalColumns.value) {
    return false
  }
  return columnVisibility.value[key]
}

const visibleColumnCount = computed(() => {
  let count = 0
  if (showColumn('name')) count++
  if (showColumn('email')) count++
  if (showColumn('role')) count++
  if (showColumn('status')) count++
  if (showColumn('created')) count++
  if (showColumn('actions')) count++
  return count
})

const roleToneClass = (role: string) => {
  switch (role) {
    case 'super_admin':
      return 'bg-primary/10 text-primary'
    case 'admin':
      return 'bg-amber-100/50 text-amber-700'
    case 'client':
      return 'bg-blue-100/50 text-blue-700'
    case 'contractor':
      return 'bg-green-100/50 text-green-700'
    case 'field_engineer':
      return 'bg-sky-100/50 text-sky-700'
    case 'supervisor_engineer':
      return 'bg-violet-100/50 text-violet-700'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

const statusToneClass = (status: string) => {
  return status === 'active'
    ? 'bg-green-100/50 text-green-700'
    : 'bg-muted text-muted-foreground'
}

function formatRelativeTime(dateString: string): string {
  if (!dateString || isNaN(new Date(dateString).getTime())) {
    return t('time.unknown')
  }

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return t('time.today')
  if (diffDays === 1) return t('time.yesterday')
  if (diffDays < 7) return t('time.days_ago', { count: diffDays })
  if (diffDays < 30)
    return t('time.weeks_ago', { count: Math.floor(diffDays / 7) })
  if (diffDays < 365)
    return t('time.months_ago', { count: Math.floor(diffDays / 30) })
  return t('time.years_ago', { count: Math.floor(diffDays / 365) })
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-wrap items-center gap-2">
      <Input
        v-model="tableSearch"
        class="w-full sm:max-w-sm"
        :placeholder="t('admin.users.search_placeholder')"
      />
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline" size="sm" class="ms-auto">
            {{ t('admin.users.table.columns_toggle') }}
            <ChevronDown class="ms-2 size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuCheckboxItem
            :model-value="columnVisibility.name"
            @update:model-value="columnVisibility.name = Boolean($event)"
          >
            {{ t('admin.users.table.name') }}
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            :disabled="!showOptionalColumns"
            :model-value="showColumn('email')"
            @update:model-value="columnVisibility.email = Boolean($event)"
          >
            {{ t('admin.users.table.email') }}
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            :model-value="columnVisibility.role"
            @update:model-value="columnVisibility.role = Boolean($event)"
          >
            {{ t('admin.users.table.role') }}
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            :model-value="columnVisibility.status"
            @update:model-value="columnVisibility.status = Boolean($event)"
          >
            {{ t('admin.users.table.status') }}
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            :disabled="!showOptionalColumns"
            :model-value="showColumn('created')"
            @update:model-value="columnVisibility.created = Boolean($event)"
          >
            {{ t('admin.users.table.created') }}
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <div class="border-border overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow class="bg-muted/50" :class="headerDensityClass">
            <TableHead v-if="showColumn('name')" class="text-start">{{
              t('admin.users.table.name')
            }}</TableHead>
            <TableHead v-if="showColumn('email')" class="text-start">{{
              t('admin.users.table.email')
            }}</TableHead>
            <TableHead v-if="showColumn('role')" class="text-start">{{
              t('admin.users.table.role')
            }}</TableHead>
            <TableHead v-if="showColumn('status')" class="text-start">{{
              t('admin.users.table.status')
            }}</TableHead>
            <TableHead v-if="showColumn('created')" class="text-start">{{
              t('admin.users.table.created')
            }}</TableHead>
            <TableHead
              v-if="showColumn('actions')"
              class="bg-muted/50 sticky inset-e-0 z-20 w-1 text-start whitespace-nowrap"
            >
              <span class="sr-only">{{ t('admin.users.table.actions') }}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="loading">
            <TableRow
              v-for="i in skeletonRowCount"
              :key="`skeleton-${i}`"
              :class="bodyRowDensityClass"
            >
              <TableCell v-for="(w, idx) in skeletonWidths" :key="idx">
                <Skeleton class="h-4" :class="w" />
              </TableCell>
            </TableRow>
          </template>

          <template v-else>
            <TableRow v-if="filteredUsers.length === 0">
              <TableCell :colspan="visibleColumnCount" class="h-24 text-center">
                {{ t('admin.users.empty_state') }}
              </TableCell>
            </TableRow>
            <TableRow
              v-for="user in filteredUsers"
              :key="user.id"
              class="group hover:bg-muted/50 transition"
              :class="bodyRowDensityClass"
            >
              <TableCell
                v-if="showColumn('name')"
                class="text-ink text-start font-medium"
                :class="densityPreset === 'compact' ? '' : 'text-sm'"
              >
                {{ user.name }}
              </TableCell>
              <TableCell
                v-if="showColumn('email')"
                class="text-muted-foreground text-start text-sm"
              >
                {{ user.email }}
              </TableCell>
              <TableCell v-if="showColumn('role')" class="text-start">
                <span
                  :class="[
                    'inline-block rounded-full px-3 py-1 text-xs font-medium',
                    roleToneClass(user.role),
                  ]"
                >
                  {{ t(`roles.${user.role}.label`) }}
                </span>
              </TableCell>
              <TableCell v-if="showColumn('status')" class="text-start">
                <span
                  :class="[
                    'inline-block rounded-full px-3 py-1 text-xs font-medium',
                    statusToneClass(user.status),
                  ]"
                >
                  {{ t(`admin.users.status.${user.status}`) }}
                </span>
              </TableCell>
              <TableCell
                v-if="showColumn('created')"
                class="text-muted-foreground text-start text-sm"
              >
                {{ user.createdAgo }}
              </TableCell>
              <TableCell
                v-if="showColumn('actions')"
                class="bg-background group-hover:bg-muted/50 sticky inset-e-0 z-10 w-1 text-start whitespace-nowrap"
              >
                <UserActionMenu
                  :user="user"
                  :toggling="props.togglingStatusIds.has(user.id)"
                  @edit="emit('edit-user', user.id)"
                  @toggle-status="emit('toggle-status', user.id)"
                />
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
