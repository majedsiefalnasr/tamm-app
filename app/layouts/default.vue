<script setup lang="ts">
import Topbar from '~/components/layout/Topbar.vue'
</script>

<template>
  <div class="bg-background flex min-h-screen flex-col">
    <!-- Topbar (sticky at top) -->
    <Topbar />

    <!-- Page content -->
    <main class="flex-1 overflow-auto">
      <slot />
    </main>
  </div>
</template>
