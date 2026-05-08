<script setup lang="ts">
definePageMeta({
  roles: ['client', 'contractor'],
  pageTitle: 'pages.projects',
})
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold">{{ $t('pages.projects') }}</h1>
    <p class="text-muted-foreground mt-2">
      {{ $t('common.feature_coming_soon') }}
    </p>
  </div>
</template>
