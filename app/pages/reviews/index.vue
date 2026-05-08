<script setup lang="ts">
definePageMeta({
  roles: ['supervisor_engineer'],
  pageTitle: 'pages.reviews',
})
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold">{{ $t('pages.reviews') }}</h1>
    <p class="text-muted-foreground mt-2">
      {{ $t('common.feature_coming_soon') }}
    </p>
  </div>
</template>
