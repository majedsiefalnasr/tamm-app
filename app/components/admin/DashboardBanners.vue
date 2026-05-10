<script setup lang="ts">
import { AlertTriangle, Zap, Inbox, FileWarning } from 'lucide-vue-next'
import { Card } from '../ui/card'

interface Props {
  newProjects: number
  pendingPayments: number
  disputes: number
  pendingReports?: number
}

withDefaults(defineProps<Props>(), {
  pendingReports: 0,
})

const { t } = useI18n()
</script>

<template>
  <div class="space-y-3">
    <!-- New Projects Banner -->
    <Card
      v-if="newProjects > 0"
      class="border-primary/30 shadow-card gap-0 rounded-2xl p-4 shadow-none"
    >
      <div class="flex items-start justify-between">
        <div class="flex items-start gap-3">
          <Inbox
            class="text-primary mt-0.5 h-4 w-4 flex-shrink-0"
            aria-hidden="true"
          />
          <div>
            <p class="text-foreground font-semibold">
              {{ t('admin.dashboard.banners.new_projects_title') }}
            </p>
            <p class="text-muted-foreground text-sm">
              {{
                t('admin.dashboard.banners.new_projects_subtitle', {
                  count: newProjects,
                })
              }}
            </p>
          </div>
        </div>
        <NuxtLink
          to="/projects?status=new"
          class="text-primary hover:text-primary/80 text-sm font-medium whitespace-nowrap"
        >
          {{ t('admin.dashboard.banners.view') }}
        </NuxtLink>
      </div>
    </Card>

    <!-- Pending Payments Banner -->
    <Card
      v-if="pendingPayments > 0"
      class="border-accent/30 shadow-card gap-0 rounded-2xl p-4 shadow-none"
    >
      <div class="flex items-start justify-between">
        <div class="flex items-start gap-3">
          <Zap
            class="text-accent mt-0.5 h-4 w-4 flex-shrink-0"
            aria-hidden="true"
          />
          <div>
            <p class="text-foreground font-semibold">
              {{ t('admin.dashboard.banners.pending_payments_title') }}
            </p>
            <p class="text-muted-foreground text-sm">
              {{
                t('admin.dashboard.banners.pending_payments_subtitle', {
                  count: pendingPayments,
                })
              }}
            </p>
          </div>
        </div>
        <NuxtLink
          to="/projects?payment_release=1"
          class="text-accent hover:text-accent/80 text-sm font-medium whitespace-nowrap"
        >
          {{ t('admin.dashboard.banners.view') }}
        </NuxtLink>
      </div>
    </Card>

    <!-- Pending report reviews -->
    <Card
      v-if="pendingReports > 0"
      class="border-accent/30 shadow-card gap-0 rounded-2xl p-4 shadow-none"
    >
      <div class="flex items-start justify-between">
        <div class="flex items-start gap-3">
          <FileWarning
            class="text-accent mt-0.5 h-4 w-4 flex-shrink-0"
            aria-hidden="true"
          />
          <div>
            <p class="text-foreground font-semibold">
              {{ t('admin.dashboard.banners.pending_reports_title') }}
            </p>
            <p class="text-muted-foreground text-sm">
              {{
                t('admin.dashboard.banners.pending_reports_subtitle', {
                  count: pendingReports,
                })
              }}
            </p>
          </div>
        </div>
        <NuxtLink
          to="/projects?milestone_review=1"
          class="text-accent hover:text-accent/80 text-sm font-medium whitespace-nowrap"
          data-testid="banner-pending-reports-link"
        >
          {{ t('admin.dashboard.banners.view') }}
        </NuxtLink>
      </div>
    </Card>

    <!-- Disputes Banner -->
    <Card
      v-if="disputes > 0"
      class="border-destructive/30 shadow-card gap-0 rounded-2xl p-4 shadow-none"
    >
      <div class="flex items-start justify-between">
        <div class="flex items-start gap-3">
          <AlertTriangle
            class="text-destructive mt-0.5 h-4 w-4 flex-shrink-0"
            aria-hidden="true"
          />
          <div>
            <p class="text-foreground font-semibold">
              {{ t('admin.dashboard.banners.disputes_title') }}
            </p>
            <p class="text-muted-foreground text-sm">
              {{
                t('admin.dashboard.banners.disputes_subtitle', {
                  count: disputes,
                })
              }}
            </p>
          </div>
        </div>
        <NuxtLink
          to="/disputes"
          class="text-destructive hover:text-destructive/80 text-sm font-medium whitespace-nowrap"
        >
          {{ t('admin.dashboard.banners.view') }}
        </NuxtLink>
      </div>
    </Card>
  </div>
</template>
