<script setup lang="ts">
import EmptyState from '~/components/common/EmptyState.vue'

definePageMeta({
  roles: ['admin', 'super_admin'],
  pageTitle: 'pages.disputes_title',
})
</script>

<template>
  <div class="space-y-6 px-4 py-6 md:px-6">
    <EmptyState
      icon="⚖️"
      title="pages.disputes_title"
      description="pages.disputes_detail_placeholder"
    />
  </div>
</template>
