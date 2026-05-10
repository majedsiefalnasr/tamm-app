<script setup lang="ts">
throw createError({
  statusCode: 404,
  statusMessage: 'Page Not Found',
})
</script>

<!-- Required so Vue has a render function; setup throws before paint -->
<template>
  <div class="hidden" aria-hidden="true" />
</template>
