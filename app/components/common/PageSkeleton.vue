<script setup lang="ts">
import { Skeleton } from '~/components/ui/skeleton'
</script>

<template>
  <div class="space-y-6">
    <!-- Header Skeleton -->
    <div class="space-y-3">
      <Skeleton class="h-12 w-3/4" />
      <Skeleton class="h-4 w-1/2" />
    </div>

    <!-- Metadata Skeleton -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
      <Skeleton class="h-20" />
      <Skeleton class="h-20" />
      <Skeleton class="h-20" />
      <Skeleton class="h-20" />
    </div>

    <!-- Content Sections -->
    <div class="mt-8 space-y-6">
      <div class="space-y-3">
        <Skeleton class="h-6 w-1/4" />
        <Skeleton class="h-32" />
      </div>
      <div class="space-y-3">
        <Skeleton class="h-6 w-1/4" />
        <Skeleton class="h-40" />
      </div>
      <div class="space-y-3">
        <Skeleton class="h-6 w-1/4" />
        <Skeleton class="h-32" />
      </div>
    </div>
  </div>
</template>
