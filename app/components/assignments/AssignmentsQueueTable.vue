<script setup lang="ts">
import type { AssignmentQueueRow } from '~/composables/useAssignmentsQueueWorkspace'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'

defineProps<{
  rows: AssignmentQueueRow[]
}>()

const { locale } = useI18n()

function formatDateTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}
</script>

<template>
  <div class="border-border overflow-x-auto rounded-xl border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead class="text-start">
            {{ $t('pages.assignment_queue.col_project') }}
          </TableHead>
          <TableHead class="text-start">
            {{ $t('pages.assignment_queue.col_milestone') }}
          </TableHead>
          <TableHead class="text-start">
            {{ $t('pages.assignment_queue.col_status') }}
          </TableHead>
          <TableHead class="text-start">
            {{ $t('pages.assignment_queue.col_updated') }}
          </TableHead>
          <TableHead class="w-[1%] text-end whitespace-nowrap">
            {{ $t('pages.assignment_queue.col_action') }}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="row in rows" :key="row.id">
          <TableCell class="font-medium">
            {{ row.projectName }}
          </TableCell>
          <TableCell class="text-muted-foreground">
            {{ row.milestoneName }}
          </TableCell>
          <TableCell>
            {{ $t(`pages.assignment_queue.status.${row.statusKey}`) }}
          </TableCell>
          <TableCell class="text-muted-foreground text-sm">
            {{ formatDateTime(row.updatedAt) }}
          </TableCell>
          <TableCell class="text-end">
            <NuxtLink
              class="text-primary text-sm font-medium hover:underline"
              :to="`/projects/${row.projectId}/milestones/${row.milestoneId}`"
            >
              {{ $t('pages.assignment_queue.open_milestone') }}
            </NuxtLink>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
