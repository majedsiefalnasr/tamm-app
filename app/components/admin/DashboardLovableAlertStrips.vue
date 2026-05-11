<script setup lang="ts">
import { FileText, Inbox } from 'lucide-vue-next'
import { Card } from '~/components/ui/card'

interface Props {
  fieldReports: number
  newProjectRequests: number
}

defineProps<Props>()

const { t } = useI18n()
</script>

<template>
  <div
    class="grid grid-cols-1 gap-3 md:grid-cols-2"
    data-testid="dashboard-lovable-alerts"
  >
    <Card class="border-blue-500/25 bg-blue-500/5 shadow-none" role="status">
      <div class="flex items-center justify-between gap-3 px-4 py-3">
        <div class="flex items-center gap-3">
          <FileText
            class="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400"
            aria-hidden="true"
          />
          <p class="text-foreground text-sm font-semibold">
            {{
              t('admin.dashboard.lovable.alerts.field_reports', {
                count: fieldReports,
              })
            }}
          </p>
        </div>
        <NuxtLink
          to="/reports"
          class="text-sm font-medium whitespace-nowrap text-blue-600 hover:underline dark:text-blue-400"
        >
          {{ t('admin.dashboard.banners.view') }}
        </NuxtLink>
      </div>
    </Card>

    <Card
      class="border-emerald-500/25 bg-emerald-500/5 shadow-none"
      role="status"
    >
      <div class="flex items-center justify-between gap-3 px-4 py-3">
        <div class="flex items-center gap-3">
          <Inbox
            class="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400"
            aria-hidden="true"
          />
          <p class="text-foreground text-sm font-semibold">
            {{
              t('admin.dashboard.lovable.alerts.new_projects', {
                count: newProjectRequests,
              })
            }}
          </p>
        </div>
        <NuxtLink
          to="/projects?status=new"
          class="text-sm font-medium whitespace-nowrap text-emerald-700 hover:underline dark:text-emerald-400"
        >
          {{ t('admin.dashboard.banners.view') }}
        </NuxtLink>
      </div>
    </Card>
  </div>
</template>
