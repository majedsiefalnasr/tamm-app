<script setup lang="ts">
import type { Report } from '~/shared/types/project'
import { formatDate } from '~/utils/formatters'

interface Props {
  report: Report
}

const props = defineProps<Props>()
const { t } = useI18n()
</script>

<template>
  <div class="bg-card rounded-lg border p-6">
    <!-- Report Metadata -->
    <div
      class="mb-6 flex flex-col gap-4 border-b pb-4 md:flex-row md:items-center md:justify-between"
    >
      <div>
        <p class="text-muted-foreground text-sm">
          {{ t('milestone.report.submittedAt') }}
          {{ report.submitted_at ? formatDate(report.submitted_at) : '—' }}
        </p>
        <p v-if="report.submitted_by" class="text-muted-foreground text-sm">
          {{ t('milestone.report.submittedBy') }}:
          {{ report.submitted_by.name }}
        </p>
      </div>
      <span
        :class="{
          'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium': true,
          'bg-yellow-100 text-yellow-800': report.status === 'draft',
          'bg-blue-100 text-blue-800': report.status === 'submitted',
          'bg-green-100 text-green-800': report.status === 'approved',
          'bg-red-100 text-red-800': report.status === 'rejected',
        }"
      >
        {{ t(`milestone.report.status.${report.status}`) }}
      </span>
    </div>

    <!-- Report Content -->
    <div class="mb-6">
      <h3 class="text-muted-foreground mb-2 text-sm font-semibold uppercase">
        {{ t('milestone.report.content') }}
      </h3>
      <p class="text-ink whitespace-pre-wrap">{{ report.content }}</p>
    </div>

    <!-- Report Images -->
    <div v-if="report.images.length > 0">
      <h3 class="text-muted-foreground mb-4 text-sm font-semibold uppercase">
        {{ t('milestone.report.images') }} ({{ report.images.length }})
      </h3>
      <div class="grid grid-cols-2 gap-2 md:grid-cols-3">
        <div
          v-for="(image, index) in report.images"
          :key="index"
          class="bg-muted aspect-video overflow-hidden rounded-xl"
        >
          <img
            :src="image"
            :alt="`Report image ${index + 1}`"
            class="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  </div>
</template>
