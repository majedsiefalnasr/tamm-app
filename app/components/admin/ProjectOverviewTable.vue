<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight, FolderOpen, Check } from 'lucide-vue-next'
import { Skeleton } from '../ui/skeleton'
import type { AdminProjectOverviewItem } from '#shared/types/project'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { Button } from '../ui/button'

interface Props {
  projects: AdminProjectOverviewItem[]
  loading?: boolean
  pagination?: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  }
  currentPage?: number
}

interface Emits {
  'page-change': [page: number]
}

withDefaults(defineProps<Props>(), {
  loading: false,
  currentPage: 1,
  pagination: () => ({
    current_page: 1,
    per_page: 20,
    total: 0,
    total_pages: 0,
  }),
})

const emit = defineEmits<Emits>()

const { $t } = useI18n()
const router = useRouter()

const { getProjectProgress } = useAdminProjects()

const showEmptyState = computed(
  () => !props.loading && props.projects.length === 0
)
const showTable = computed(() => !props.loading && props.projects.length > 0)

const statusTone = (status: string) => {
  switch (status) {
    case 'new':
      return 'bg-primary/10 text-primary'
    case 'active':
    case 'contractor_selected':
      return 'bg-green-100/50 text-green-700'
    case 'on_hold':
      return 'bg-amber-100/50 text-amber-700'
    case 'completed':
      return 'bg-muted text-muted-foreground'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

const statusLabel = (status: string) => {
  return $t(`status.${status}`)
}

const { locale } = useI18n()

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
  }).format(value)
}

const formatDate = (date: string) => {
  try {
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) {
      return ''
    }
    const localeString = locale.value === 'ar' ? 'ar-EG' : 'en-US'
    return new Intl.DateTimeFormat(localeString, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(dateObj)
  } catch {
    return ''
  }
}

const handleNavigateToProject = (id: string) => {
  router.push(`/projects/${id}`)
}

const handlePreviousPage = () => {
  if (props.pagination && props.pagination.current_page > 1) {
    emit('page-change', props.pagination.current_page - 1)
  }
}

const handleNextPage = () => {
  if (
    props.pagination &&
    props.pagination.current_page < props.pagination.total_pages
  ) {
    emit('page-change', props.pagination.current_page + 1)
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Skeleton Loading State -->
    <div v-if="loading" class="border-border space-y-2 rounded-lg border p-4">
      <div v-for="i in 5" :key="i" class="flex items-center gap-4">
        <Skeleton class="h-12 flex-1" />
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="showEmptyState"
      class="border-border bg-muted/30 flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-12"
    >
      <FolderOpen class="text-muted-foreground mb-4 h-8 w-8" />
      <h3 class="text-ink mb-1 text-center text-sm font-medium">
        {{ $t('admin.projects.empty_state') }}
      </h3>
      <p class="text-muted-foreground text-center text-sm">
        {{ $t('admin.projects.empty_state_subtitle') }}
      </p>
    </div>

    <!-- Projects Table -->
    <div
      v-else-if="showTable"
      class="border-border overflow-hidden rounded-lg border"
    >
      <Table>
        <TableHeader>
          <TableRow class="bg-muted/50">
            <TableHead class="text-start">
              {{ $t('admin.projects.table.project_number') }}
            </TableHead>
            <TableHead class="text-start">
              {{ $t('admin.projects.table.name') }}
            </TableHead>
            <TableHead class="text-start">
              {{ $t('admin.projects.table.client') }}
            </TableHead>
            <TableHead class="text-start">
              {{ $t('admin.projects.table.contractor') }}
            </TableHead>
            <TableHead class="text-start">
              {{ $t('admin.projects.table.status') }}
            </TableHead>
            <TableHead class="text-start">
              {{ $t('admin.projects.table.milestones_progress') }}
            </TableHead>
            <TableHead class="text-start">
              {{ $t('admin.projects.table.total_value') }}
            </TableHead>
            <TableHead class="text-start">
              {{ $t('admin.projects.table.created_date') }}
            </TableHead>
            <TableHead class="text-center">
              {{ $t('admin.projects.table.action') }}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            v-for="(project, idx) in projects"
            :key="`${project.id}-${idx}`"
            class="hover:bg-muted/50 cursor-pointer transition"
            @click="handleNavigateToProject(project.id)"
          >
            <!-- Project Number -->
            <TableCell class="text-start text-sm font-medium">
              {{ project.project_number }}
            </TableCell>

            <!-- Project Name -->
            <TableCell class="text-start text-sm">
              {{ project.name }}
            </TableCell>

            <!-- Client -->
            <TableCell class="text-start text-sm">
              {{ project.client.name }}
            </TableCell>

            <!-- Contractor -->
            <TableCell class="text-start text-sm">
              {{
                project.contractor
                  ? project.contractor.name
                  : $t('admin.projects.unassigned')
              }}
            </TableCell>

            <!-- Status -->
            <TableCell class="text-start">
              <span
                :class="[
                  'inline-block rounded-full px-3 py-1 text-xs font-medium',
                  statusTone(project.status),
                ]"
              >
                {{ statusLabel(project.status) }}
              </span>
            </TableCell>

            <!-- Milestone Progress -->
            <TableCell class="text-start">
              <div class="flex items-center gap-2">
                <div
                  class="bg-muted relative h-2 w-24 overflow-hidden rounded-full"
                >
                  <div
                    :style="{
                      width: `${getProjectProgress(project).percent}%`,
                    }"
                    class="from-primary h-full bg-gradient-to-r to-blue-500 transition-all"
                  />
                </div>
                <span class="text-muted-foreground text-xs whitespace-nowrap">
                  {{ getProjectProgress(project).completed }} /
                  {{ getProjectProgress(project).total }}
                </span>
              </div>
            </TableCell>

            <!-- Total Value -->
            <TableCell class="text-start text-sm font-medium">
              {{ formatCurrency(project.total_value) }}
            </TableCell>

            <!-- Created Date -->
            <TableCell class="text-muted-foreground text-start text-sm">
              {{ formatDate(project.created_at) }}
            </TableCell>

            <!-- Action -->
            <TableCell class="text-center" @click.stop>
              <button
                class="text-primary hover:bg-primary/10 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition"
                @click="handleNavigateToProject(project.id)"
              >
                {{ $t('admin.projects.table.view') }}
              </button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Pagination -->
    <div
      v-if="showTable && pagination && pagination.total_pages > 1"
      class="border-border bg-muted/30 flex items-center justify-between rounded-lg border px-4 py-3"
    >
      <span class="text-muted-foreground text-sm">
        {{
          $t('admin.projects.pagination', {
            current: pagination.current_page,
            total: pagination.total_pages,
          })
        }}
        •
        {{ pagination.total }}
        {{ $t('admin.projects.table.project_number') }}
      </span>

      <div class="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="pagination.current_page === 1"
          class="gap-1"
          @click="handlePreviousPage"
        >
          <ChevronRight class="h-4 w-4" />
          {{ $t('common.previous') }}
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="pagination.current_page === pagination.total_pages"
          class="gap-1"
          @click="handleNextPage"
        >
          {{ $t('common.next') }}
          <ChevronLeft class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>
