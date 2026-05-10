<script setup lang="ts">
import { Skeleton } from '~/components/ui/skeleton'

withDefaults(
  defineProps<{
    rows?: number
  }>(),
  { rows: 4 }
)
</script>

<template>
  <div class="space-y-3" aria-busy="true">
    <div
      v-for="i in rows"
      :key="`activity-skel-${i}`"
      class="border-border bg-card flex items-start gap-4 rounded-2xl border p-4"
    >
      <Skeleton class="mt-0.5 size-5 shrink-0 rounded-full" />
      <div class="min-w-0 flex-1 space-y-2">
        <Skeleton class="h-4 w-full max-w-md rounded-md" />
        <Skeleton class="h-4 w-[min(100%,12rem)] rounded-md" />
        <Skeleton class="h-3 w-24 rounded-md" />
      </div>
    </div>
  </div>
</template>
