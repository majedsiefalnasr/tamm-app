<script setup lang="ts">
definePageMeta({
  roles: ['admin', 'super_admin'],
  pageTitle: 'pages.admin_dashboard',
})
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold">{{ $t('pages.admin_dashboard') }}</h1>
    <p class="text-muted-foreground mt-2">
      {{ $t('common.feature_coming_soon') }}
    </p>
  </div>
</template>
