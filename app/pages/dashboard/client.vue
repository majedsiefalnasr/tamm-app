<script setup lang="ts">
import ApprovalQueueWidget from '~/components/client/ApprovalQueueWidget.vue'

definePageMeta({
  roles: ['client'],
  pageTitle: 'pages.client_dashboard',
})
</script>

<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div>
      <h1 class="text-ink text-3xl font-bold">
        {{ $t('pages.client_dashboard') }}
      </h1>
      <p class="text-muted-foreground mt-1">
        {{ $t('pages.client_dashboard_subtitle') }}
      </p>
    </div>

    <!-- Main content -->
    <div class="grid gap-6">
      <!-- Approval Queue Widget -->
      <div class="border-border bg-card rounded-lg border p-6">
        <ApprovalQueueWidget />
      </div>
    </div>
  </div>
</template>
