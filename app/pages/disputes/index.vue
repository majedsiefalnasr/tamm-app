<script setup lang="ts">
import EmptyState from '~/components/common/EmptyState.vue'

definePageMeta({
  roles: ['admin', 'super_admin'],
  pageTitle: 'pages.disputes_title',
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold">{{ $t('pages.disputes_title') }}</h1>
      <p class="text-muted-foreground mt-2">
        {{ $t('pages.disputes_subtitle') }}
      </p>
    </div>

    <EmptyState
      icon="scale"
      title="pages.disputes_empty_title"
      description="pages.disputes_empty_description"
    />
  </div>
</template>
