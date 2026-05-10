<script setup lang="ts">
await navigateTo('/dashboard', { replace: true })
</script>

<template>
  <div
    class="text-muted-foreground flex min-h-[50vh] items-center justify-center text-sm"
  >
    {{ $t('common.redirecting') }}
  </div>
</template>
