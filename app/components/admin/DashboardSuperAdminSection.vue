<script setup lang="ts">
import { ShieldAlert } from 'lucide-vue-next'
import type { SuperAdminDashboardFlags } from '~/shared/types/admin'

interface Props {
  flags: SuperAdminDashboardFlags | null
}

defineProps<Props>()

const { t } = useI18n()
</script>

<template>
  <div
    v-if="flags && flags.pending_permission_requests > 0"
    class="border-primary/30 bg-primary/5 rounded-2xl border p-5"
    data-testid="super-admin-flags-section"
  >
    <div class="flex items-start gap-3">
      <ShieldAlert
        class="text-primary mt-0.5 h-6 w-6 shrink-0"
        aria-hidden="true"
      />
      <div class="min-w-0 flex-1 text-start">
        <h3 class="text-foreground font-extrabold">
          {{ t('admin.dashboard.super_admin.pending_permissions_title') }}
        </h3>
        <p class="text-muted-foreground mt-1 text-sm">
          {{
            t('admin.dashboard.super_admin.pending_permissions_subtitle', {
              count: flags.pending_permission_requests,
            })
          }}
        </p>
        <!-- TODO: replace mock — admin dashboard super-admin flags endpoint -->
        <p class="text-muted-foreground mt-2 text-xs">
          {{ t('admin.dashboard.super_admin.coordination_note') }}
        </p>
      </div>
    </div>
  </div>
</template>
