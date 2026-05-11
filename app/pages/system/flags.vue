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
  pageTitle: 'pages.system_flags_title',
})

const { flags, loading, error, fetchFlags } = useSystemFlagsWorkspace()

onMounted(() => {
  void fetchFlags()
})

function retry() {
  void fetchFlags()
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold">
        {{ $t('pages.system_flags_title') }}
      </h1>
      <p class="text-muted-foreground mt-2">
        {{ $t('pages.system_flags_description') }}
      </p>
    </div>

    <PageContentSkeleton v-if="loading && flags.length === 0" :rows="5" />

    <ErrorState v-else-if="error" :message="error" @action="retry" />

    <EmptyState
      v-else-if="flags.length === 0"
      icon="clipboard"
      title="pages.system_flags_empty_title"
      description="pages.system_flags_empty_description"
    />

    <div v-else class="border-border overflow-x-auto rounded-xl border">
      <p class="text-muted-foreground px-4 pt-4 text-sm font-medium">
        {{ $t('pages.system_flags_table_title') }}
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="text-start">
              {{ $t('pages.system_flags_col_key') }}
            </TableHead>
            <TableHead class="text-start">
              {{ $t('pages.system_flags_col_state') }}
            </TableHead>
            <TableHead class="text-start">
              {{ $t('pages.system_logs_col_message') }}
            </TableHead>
            <TableHead class="text-start">
              {{ $t('pages.assignment_queue.col_updated') }}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="f in flags" :key="f.id">
            <TableCell class="font-mono text-sm">
              {{ f.key }}
            </TableCell>
            <TableCell>
              <Badge :variant="f.enabled ? 'default' : 'secondary'">
                {{
                  f.enabled
                    ? $t('pages.system_flags_state_on')
                    : $t('pages.system_flags_state_off')
                }}
              </Badge>
            </TableCell>
            <TableCell class="text-muted-foreground text-sm">
              {{ f.description }}
            </TableCell>
            <TableCell class="text-muted-foreground text-sm">
              {{ f.updatedAt }}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
