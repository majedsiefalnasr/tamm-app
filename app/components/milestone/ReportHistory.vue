<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Report } from '~/shared/types/project'
import { formatDate } from '~/utils/formatters'
import { ChevronDownIcon } from '@heroicons/vue/24/outline'

interface Props {
  reports: Report[]
}

const props = defineProps<Props>()
const { t } = useI18n()

// Sort reports by submitted_at (newest first)
const sortedReports = computed(() => {
  return [...props.reports].sort((a, b) => {
    const dateA = a.submitted_at ? new Date(a.submitted_at).getTime() : 0
    const dateB = b.submitted_at ? new Date(b.submitted_at).getTime() : 0
    return dateB - dateA
  })
})

// Track which reports are expanded
const expandedReports = ref<Record<string, boolean>>({})

const toggleExpand = (reportId: string) => {
  expandedReports.value[reportId] = !expandedReports.value[reportId]
}

const getPreview = (content: string, maxLength: number = 100): string => {
  return content.length > maxLength
    ? `${content.substring(0, maxLength)}...`
    : content
}
</script>

<template>
  <div class="bg-card rounded-lg border p-6">
    <h2 class="mb-6 text-xl font-bold">{{ t('milestone.history.title') }}</h2>

    <div v-if="sortedReports.length > 0" class="space-y-3">
      <div
        v-for="report in sortedReports"
        :key="report.id"
        class="bg-muted/20 overflow-hidden rounded-lg border"
      >
        <!-- Report Summary (Always Visible) -->
        <button
          class="hover:bg-muted/30 flex w-full items-center justify-between p-4 text-start transition"
          @click="toggleExpand(report.id)"
        >
          <div class="min-w-0 flex-1">
            <div class="mb-2 flex items-center gap-3">
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
              <span class="text-muted-foreground text-sm">
                {{
                  report.submitted_at ? formatDate(report.submitted_at) : '—'
                }}
              </span>
            </div>
            <p class="text-muted-foreground truncate text-sm">
              {{ getPreview(report.content) }}
            </p>
          </div>
          <ChevronDownIcon
            :class="{
              'text-muted-foreground ms-4 h-5 w-5 flex-shrink-0 transition': true,
              'rotate-180': expandedReports[report.id],
            }"
          />
        </button>

        <!-- Report Details (Expanded) -->
        <div
          v-if="expandedReports[report.id]"
          class="bg-background border-t p-4"
        >
          <div class="mb-4">
            <p
              v-if="report.submitted_by"
              class="text-muted-foreground mb-2 text-sm"
            >
              {{ t('milestone.report.submittedBy') }}:
              {{ report.submitted_by.name }}
            </p>
            <p class="text-ink text-sm whitespace-pre-wrap">
              {{ report.content }}
            </p>
          </div>

          <!-- Images Grid (if expanded) -->
          <div v-if="report.images.length > 0" class="mt-4">
            <p
              class="text-muted-foreground mb-3 text-xs font-semibold uppercase"
            >
              {{ t('milestone.report.images') }} ({{ report.images.length }})
            </p>
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
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-muted/20 rounded-lg p-8 text-center">
      <p class="text-muted-foreground">{{ t('milestone.history.empty') }}</p>
    </div>
  </div>
</template>
