<script setup lang="ts">
import { AlertCircle, CheckCircle, Zap } from 'lucide-vue-next'

interface Props {
  newProjects: number
  pendingPayments: number
  disputes: number
}

defineProps<Props>()

const { $t } = useI18n()
</script>

<template>
  <div class="space-y-3">
    <!-- New Projects Banner -->
    <div
      v-if="newProjects > 0"
      class="border-primary/30 bg-card shadow-card rounded-2xl border p-4"
    >
      <div class="flex items-start justify-between">
        <div class="flex items-start gap-3">
          <AlertCircle class="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
          <div>
            <p class="text-foreground font-semibold">
              {{ $t('admin.dashboard.banners.new_projects_title') }}
            </p>
            <p class="text-muted-foreground text-sm">
              {{
                $t('admin.dashboard.banners.new_projects_subtitle', {
                  count: newProjects,
                })
              }}
            </p>
          </div>
        </div>
        <NuxtLink
          to="/admin/projects?status=new"
          class="text-primary hover:text-primary/80 text-sm font-medium whitespace-nowrap"
        >
          {{ $t('admin.dashboard.banners.view') }}
        </NuxtLink>
      </div>
    </div>

    <!-- Pending Payments Banner -->
    <div
      v-if="pendingPayments > 0"
      class="border-accent/30 bg-card shadow-card rounded-2xl border p-4"
    >
      <div class="flex items-start justify-between">
        <div class="flex items-start gap-3">
          <Zap class="text-accent mt-0.5 h-4 w-4 flex-shrink-0" />
          <div>
            <p class="text-foreground font-semibold">
              {{ $t('admin.dashboard.banners.pending_payments_title') }}
            </p>
            <p class="text-muted-foreground text-sm">
              {{
                $t('admin.dashboard.banners.pending_payments_subtitle', {
                  count: pendingPayments,
                })
              }}
            </p>
          </div>
        </div>
        <NuxtLink
          to="/admin/payments?status=awaiting_release"
          class="text-accent hover:text-accent/80 text-sm font-medium whitespace-nowrap"
        >
          {{ $t('admin.dashboard.banners.view') }}
        </NuxtLink>
      </div>
    </div>

    <!-- Disputes Banner -->
    <div
      v-if="disputes > 0"
      class="border-destructive/30 bg-card shadow-card rounded-2xl border p-4"
    >
      <div class="flex items-start justify-between">
        <div class="flex items-start gap-3">
          <AlertCircle class="text-destructive mt-0.5 h-4 w-4 flex-shrink-0" />
          <div>
            <p class="text-foreground font-semibold">
              {{ $t('admin.dashboard.banners.disputes_title') }}
            </p>
            <p class="text-muted-foreground text-sm">
              {{
                $t('admin.dashboard.banners.disputes_subtitle', {
                  count: disputes,
                })
              }}
            </p>
          </div>
        </div>
        <NuxtLink
          to="/admin/disputes"
          class="text-destructive hover:text-destructive/80 text-sm font-medium whitespace-nowrap"
        >
          {{ $t('admin.dashboard.banners.view') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
