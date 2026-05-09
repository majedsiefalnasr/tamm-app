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
import { Badge } from '../ui/badge'
import UserActionMenu from './UserActionMenu.vue'
import type { User } from '../../composables/useAdminUsers'

const { $t } = useI18n()

// Calculate skeleton rows based on viewport height
const skeletonRowCount = ref(5)
onMounted(() => {
  // Estimate: ~48px per table row (adjust if needed)
  const rowHeight = 48
  const availableHeight = Math.max(window.innerHeight - 400, 300) // Leave 400px for header/footer
  skeletonRowCount.value = Math.max(5, Math.floor(availableHeight / rowHeight))
})

interface Props {
  users?: User[]
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  users: () => [],
  loading: false,
})

const emit = defineEmits<{
  'edit-user': [userId: string]
  'toggle-status': [userId: string]
}>()

const formattedUsers = computed(() => {
  return props.users.map(user => ({
    ...user,
    createdAgo: formatRelativeTime(user.created_at),
  }))
})

function formatRelativeTime(dateString: string): string {
  if (!dateString || isNaN(new Date(dateString).getTime())) {
    return $t('time.unknown')
  }

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return $t('time.today')
  if (diffDays === 1) return $t('time.yesterday')
  if (diffDays < 7) return $t('time.days_ago', { count: diffDays })
  if (diffDays < 30)
    return $t('time.weeks_ago', { count: Math.floor(diffDays / 7) })
  if (diffDays < 365)
    return $t('time.months_ago', { count: Math.floor(diffDays / 30) })
  return $t('time.years_ago', { count: Math.floor(diffDays / 365) })
}
</script>

<template>
  <div class="overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow class="bg-muted/50">
          <TableHead class="text-start">{{
            $t('admin.users.table.name')
          }}</TableHead>
          <TableHead class="text-start">{{
            $t('admin.users.table.email')
          }}</TableHead>
          <TableHead class="text-start">{{
            $t('admin.users.table.role')
          }}</TableHead>
          <TableHead class="text-start">{{
            $t('admin.users.table.status')
          }}</TableHead>
          <TableHead class="text-start">{{
            $t('admin.users.table.created')
          }}</TableHead>
          <TableHead class="text-start">{{
            $t('admin.users.table.actions')
          }}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <!-- Skeleton rows while loading -->
        <template v-if="loading">
          <TableRow v-for="i in skeletonRowCount" :key="`skeleton-${i}`">
            <TableCell><Skeleton class="h-4 w-24" /></TableCell>
            <TableCell><Skeleton class="h-4 w-32" /></TableCell>
            <TableCell><Skeleton class="h-6 w-20" /></TableCell>
            <TableCell><Skeleton class="h-6 w-16" /></TableCell>
            <TableCell><Skeleton class="h-4 w-20" /></TableCell>
            <TableCell><Skeleton class="h-8 w-8" /></TableCell>
          </TableRow>
        </template>

        <!-- User rows -->
        <template v-else>
          <TableRow
            v-for="user in formattedUsers"
            :key="user.id"
            class="hover:bg-muted/50 transition"
          >
            <TableCell class="text-ink text-start font-medium">
              {{ user.name }}
            </TableCell>
            <TableCell class="text-muted-foreground text-start text-sm">
              {{ user.email }}
            </TableCell>
            <TableCell class="text-start">
              <Badge :variant="getRoleVariant(user.role)">
                {{ $t(`roles.${user.role}.label`) }}
              </Badge>
            </TableCell>
            <TableCell class="text-start">
              <Badge
                :variant="user.status === 'active' ? 'default' : 'secondary'"
              >
                {{ $t(`admin.users.status.${user.status}`) }}
              </Badge>
            </TableCell>
            <TableCell class="text-muted-foreground text-start text-sm">
              {{ user.createdAgo }}
            </TableCell>
            <TableCell class="text-start">
              <UserActionMenu
                :user="user"
                @edit="emit('edit-user', user.id)"
                @toggle-status="emit('toggle-status', user.id)"
              />
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>
  </div>
</template>

<script lang="ts">
function getRoleVariant(role: string): string {
  const roleVariants: Record<string, string> = {
    super_admin: 'destructive',
    admin: 'default',
    client: 'outline',
    contractor: 'secondary',
    field_engineer: 'secondary',
    supervisor_engineer: 'secondary',
  }
  return roleVariants[role] || 'default'
}
</script>
