<script setup lang="ts">
import { onMounted } from 'vue'
import PageContentSkeleton from '~/components/common/PageContentSkeleton.vue'
import ErrorState from '~/components/common/ErrorState.vue'
import EmptyState from '~/components/common/EmptyState.vue'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Badge } from '~/components/ui/badge'

definePageMeta({
  roles: ['super_admin'],
  pageTitle: 'pages.system_logs_title',
})

const { logs, loading, error, fetchLogs } = useSystemLogsWorkspace()

onMounted(() => {
  void fetchLogs()
})

function retry() {
  void fetchLogs()
}

const levelVariant = (
  level: string
): 'default' | 'secondary' | 'destructive' => {
  if (level === 'error') return 'destructive'
  if (level === 'warning') return 'secondary'
  return 'default'
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold">
        {{ $t('pages.system_logs_title') }}
      </h1>
      <p class="text-muted-foreground mt-2">
        {{ $t('pages.system_logs_description') }}
      </p>
    </div>

    <PageContentSkeleton v-if="loading && logs.length === 0" :rows="6" />

    <ErrorState v-else-if="error" :message="error" @action="retry" />

    <EmptyState
      v-else-if="logs.length === 0"
      icon="clipboard"
      title="pages.system_logs_empty_title"
      description="pages.system_logs_empty_description"
    />

    <div v-else class="border-border overflow-x-auto rounded-xl border">
      <p class="text-muted-foreground px-4 pt-4 text-sm font-medium">
        {{ $t('pages.system_logs_table_title') }}
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-[1%] text-start whitespace-nowrap">
              {{ $t('pages.system_logs_col_level') }}
            </TableHead>
            <TableHead class="text-start">
              {{ $t('pages.system_logs_col_message') }}
            </TableHead>
            <TableHead class="text-start">
              {{ $t('pages.system_logs_col_source') }}
            </TableHead>
            <TableHead class="text-start">
              {{ $t('pages.system_logs_col_time') }}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="row in logs" :key="row.id">
            <TableCell>
              <Badge :variant="levelVariant(row.level)">
                {{ $t(`pages.system_logs_level.${row.level}`) }}
              </Badge>
            </TableCell>
            <TableCell class="max-w-md">
              {{ row.message }}
            </TableCell>
            <TableCell class="text-muted-foreground text-sm">
              {{ row.source }}
            </TableCell>
            <TableCell class="text-muted-foreground text-sm">
              {{ row.createdAt }}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
