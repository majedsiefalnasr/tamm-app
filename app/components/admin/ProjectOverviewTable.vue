<script setup lang="ts">
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from '@tanstack/vue-table'
import {
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import { computed, h, ref } from 'vue'
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Eye,
} from 'lucide-vue-next'
import type { AdminProjectOverviewItem } from '#shared/types/project'
import { valueUpdater } from '../ui/table/utils'
import { Skeleton } from '../ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import EmptyState from '~/components/common/EmptyState.vue'

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

const props = withDefaults(defineProps<Props>(), {
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

const { t, locale } = useI18n()
const router = useRouter()
const { getProjectProgress } = useAdminProjects()

const showEmptyState = computed(
  () => !props.loading && props.projects.length === 0
)
const showTable = computed(() => !props.loading && props.projects.length > 0)

const sorting = ref<SortingState>([{ id: 'created_at', desc: true }])
const columnFilters = ref<ColumnFiltersState>([])
const columnVisibility = ref<VisibilityState>({})

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
  }).format(value)

const formatDate = (date: string) => {
  try {
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) return ''
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

const statusLabel = (status: string) => t(`status.${status}`)
const handleNavigateToProject = (id: string) => router.push(`/projects/${id}`)

const columnLabels: Record<string, string> = {
  project_number: 'admin.projects.table.project_number',
  name: 'admin.projects.table.name',
  client: 'admin.projects.table.client',
  contractor: 'admin.projects.table.contractor',
  status: 'admin.projects.table.status',
  milestones_progress: 'admin.projects.table.milestones_progress',
  total_value: 'admin.projects.table.total_value',
  created_at: 'admin.projects.table.created_date',
}

const columns = computed<ColumnDef<AdminProjectOverviewItem>[]>(() => [
  {
    accessorKey: 'project_number',
    enableHiding: true,
    header: ({ column }) =>
      h(
        Button,
        {
          variant: 'ghost',
          class: 'h-auto p-0 font-semibold',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => [
          t('admin.projects.table.project_number'),
          h(ArrowUpDown, { class: 'ms-1 size-3.5' }),
        ]
      ),
    cell: ({ row }) =>
      h('span', { class: 'text-sm font-medium' }, row.original.project_number),
  },
  {
    id: 'name',
    accessorFn: row => row.name,
    enableHiding: true,
    filterFn: (row, _id, value) => {
      const q = String(value ?? '')
        .trim()
        .toLowerCase()
      if (!q) return true
      const r = row.original
      return (
        r.project_number.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.client.name.toLowerCase().includes(q) ||
        (r.contractor?.name ?? '').toLowerCase().includes(q)
      )
    },
    header: ({ column }) =>
      h(
        Button,
        {
          variant: 'ghost',
          class: 'h-auto p-0 font-semibold',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => [
          t('admin.projects.table.name'),
          h(ArrowUpDown, { class: 'ms-1 size-3.5' }),
        ]
      ),
    cell: ({ row }) => h('span', { class: 'text-sm' }, row.original.name),
  },
  {
    id: 'client',
    accessorFn: row => row.client.name,
    enableHiding: true,
    header: ({ column }) =>
      h(
        Button,
        {
          variant: 'ghost',
          class: 'h-auto p-0 font-semibold',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => [
          t('admin.projects.table.client'),
          h(ArrowUpDown, { class: 'ms-1 size-3.5' }),
        ]
      ),
    cell: ({ row }) =>
      h('span', { class: 'text-sm' }, row.original.client.name),
  },
  {
    id: 'contractor',
    accessorFn: row => row.contractor?.name ?? '',
    enableHiding: true,
    header: ({ column }) =>
      h(
        Button,
        {
          variant: 'ghost',
          class: 'h-auto p-0 font-semibold',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => [
          t('admin.projects.table.contractor'),
          h(ArrowUpDown, { class: 'ms-1 size-3.5' }),
        ]
      ),
    cell: ({ row }) =>
      h(
        'span',
        { class: 'text-sm' },
        row.original.contractor
          ? row.original.contractor.name
          : t('admin.projects.unassigned')
      ),
  },
  {
    id: 'status',
    accessorFn: row => row.status,
    enableHiding: true,
    header: ({ column }) =>
      h(
        Button,
        {
          variant: 'ghost',
          class: 'h-auto p-0 font-semibold',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => [
          t('admin.projects.table.status'),
          h(ArrowUpDown, { class: 'ms-1 size-3.5' }),
        ]
      ),
    cell: ({ row }) =>
      h(
        'span',
        {
          class: `inline-block rounded-full px-3 py-1 text-xs font-medium ${statusTone(row.original.status)}`,
        },
        statusLabel(row.original.status)
      ),
  },
  {
    id: 'milestones_progress',
    enableSorting: false,
    enableHiding: true,
    header: () => t('admin.projects.table.milestones_progress'),
    cell: ({ row }) => {
      const progress = getProjectProgress(row.original)
      return h('div', { class: 'flex items-center gap-2' }, [
        h(
          'div',
          {
            class: 'bg-muted relative h-1.5 w-24 overflow-hidden rounded-full',
          },
          [
            h('div', {
              class: 'bg-primary h-full transition-all',
              style: { width: `${progress.percent}%` },
            }),
          ]
        ),
        h(
          'span',
          { class: 'text-muted-foreground text-xs whitespace-nowrap' },
          `${progress.completed} / ${progress.total}`
        ),
      ])
    },
  },
  {
    id: 'total_value',
    accessorFn: row => row.total_value,
    enableHiding: true,
    header: ({ column }) =>
      h(
        Button,
        {
          variant: 'ghost',
          class: 'h-auto p-0 font-semibold',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => [
          t('admin.projects.table.total_value'),
          h(ArrowUpDown, { class: 'ms-1 size-3.5' }),
        ]
      ),
    cell: ({ row }) =>
      h(
        'span',
        { class: 'text-sm font-medium' },
        formatCurrency(row.original.total_value)
      ),
  },
  {
    id: 'created_at',
    accessorFn: row => row.created_at,
    enableHiding: true,
    header: ({ column }) =>
      h(
        Button,
        {
          variant: 'ghost',
          class: 'h-auto p-0 font-semibold',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => [
          t('admin.projects.table.created_date'),
          h(ArrowUpDown, { class: 'ms-1 size-3.5' }),
        ]
      ),
    cell: ({ row }) =>
      h(
        'span',
        { class: 'text-muted-foreground text-sm' },
        formatDate(row.original.created_at)
      ),
  },
  {
    id: 'action',
    enableSorting: false,
    enableHiding: false,
    header: () =>
      h('span', { class: 'sr-only' }, t('admin.projects.table.action')),
    cell: ({ row }) =>
      h(
        'div',
        { class: 'text-center' },
        h(
          'button',
          {
            type: 'button',
            class:
              'text-primary hover:bg-primary/10 inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition',
            onClick: (e: Event) => {
              e.stopPropagation()
              handleNavigateToProject(row.original.id)
            },
          },
          [
            h(Eye, { class: 'size-3.5 shrink-0', 'aria-hidden': 'true' }),
            t('admin.projects.table.view'),
          ]
        )
      ),
  },
])

const table = useVueTable({
  get data() {
    return props.projects
  },
  get columns() {
    return columns.value
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  onSortingChange: updaterOrValue => valueUpdater(updaterOrValue, sorting),
  onColumnFiltersChange: updaterOrValue =>
    valueUpdater(updaterOrValue, columnFilters),
  onColumnVisibilityChange: updaterOrValue =>
    valueUpdater(updaterOrValue, columnVisibility),
  state: {
    get sorting() {
      return sorting.value
    },
    get columnFilters() {
      return columnFilters.value
    },
    get columnVisibility() {
      return columnVisibility.value
    },
  },
})

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
    <div v-if="loading" class="border-border space-y-2 rounded-lg border p-4">
      <div v-for="i in 5" :key="i" class="flex items-center gap-4">
        <Skeleton class="h-12 flex-1" />
      </div>
    </div>

    <EmptyState
      v-else-if="showEmptyState"
      icon="folder"
      class="py-12"
      title="admin.projects.empty_state"
      description="admin.projects.empty_state_subtitle"
    />

    <div v-else-if="showTable" class="space-y-3">
      <div class="flex flex-wrap items-center gap-2">
        <Input
          class="w-full sm:max-w-sm"
          :placeholder="t('admin.projects.search_placeholder')"
          :model-value="table.getColumn('name')?.getFilterValue() as string"
          @update:model-value="table.getColumn('name')?.setFilterValue($event)"
        />

        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline" size="sm" class="ms-auto">
              {{ t('admin.projects.table.columns_toggle') }}
              <ChevronDown class="ms-2 size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuCheckboxItem
              v-for="column in table
                .getAllColumns()
                .filter(column => column.getCanHide())"
              :key="column.id"
              :model-value="column.getIsVisible()"
              @update:model-value="
                value => column.toggleVisibility(Boolean(value))
              "
            >
              {{ t(columnLabels[column.id] ?? column.id) }}
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div class="border-border overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow
              v-for="headerGroup in table.getHeaderGroups()"
              :key="headerGroup.id"
              class="bg-muted/50"
            >
              <TableHead
                v-for="header in headerGroup.headers"
                :key="header.id"
                :class="
                  header.column.id === 'action'
                    ? 'bg-muted/50 sticky inset-e-0 z-20 w-1 text-center whitespace-nowrap'
                    : 'text-start'
                "
              >
                <FlexRender
                  v-if="!header.isPlaceholder"
                  :render="header.column.columnDef.header"
                  :props="header.getContext()"
                />
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            <template v-if="table.getRowModel().rows.length">
              <TableRow
                v-for="row in table.getRowModel().rows"
                :key="row.id"
                class="group hover:bg-muted/50 cursor-pointer transition"
                @click="handleNavigateToProject(row.original.id)"
              >
                <TableCell
                  v-for="cell in row.getVisibleCells()"
                  :key="cell.id"
                  :class="
                    cell.column.id === 'action'
                      ? 'bg-background group-hover:bg-muted/50 sticky inset-e-0 z-10 w-1 text-center whitespace-nowrap'
                      : 'text-start'
                  "
                >
                  <FlexRender
                    :render="cell.column.columnDef.cell"
                    :props="cell.getContext()"
                  />
                </TableCell>
              </TableRow>
            </template>

            <TableRow v-else>
              <TableCell
                :colspan="table.getVisibleLeafColumns().length"
                class="text-muted-foreground h-24 text-center"
              >
                {{ t('admin.projects.table.no_results') }}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>

    <div
      v-if="showTable && pagination && pagination.total_pages > 1"
      class="border-border bg-muted/30 flex items-center justify-between rounded-lg border px-4 py-3"
    >
      <span class="text-muted-foreground text-sm">
        {{
          t('admin.projects.pagination', {
            current: pagination.current_page,
            total: pagination.total_pages,
          })
        }}
        •
        {{ pagination.total }}
        {{ t('admin.projects.table.project_number') }}
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
          {{ t('common.previous') }}
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="pagination.current_page === pagination.total_pages"
          class="gap-1"
          @click="handleNextPage"
        >
          {{ t('common.next') }}
          <ChevronLeft class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>
