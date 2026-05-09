<script setup lang="ts">
/**
 * Legacy URL — canonical contractor overview lives at `/dashboard`.
 */
definePageMeta({
  middleware: ['auth'],
})

await navigateTo('/dashboard', { replace: true })
</script>

<template>
  <div />
</template>
