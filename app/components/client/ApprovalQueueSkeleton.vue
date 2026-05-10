<script setup lang="ts">
import { Skeleton } from '~/components/ui/skeleton'

withDefaults(
  defineProps<{
    rows?: number
  }>(),
  { rows: 3 }
)
</script>

<template>
  <div class="space-y-3" aria-busy="true">
    <div
      v-for="i in rows"
      :key="`approval-skel-${i}`"
      class="border-border bg-card flex gap-4 rounded-2xl border p-4"
    >
      <Skeleton class="size-12 shrink-0 rounded-xl" />
      <div class="min-w-0 flex-1 space-y-3">
        <Skeleton class="h-4 w-[min(100%,14rem)] rounded-md" />
        <Skeleton class="h-3 w-[min(100%,10rem)] rounded-md" />
        <div class="flex flex-wrap items-center gap-2 pt-1">
          <Skeleton class="h-8 w-24 rounded-md" />
          <Skeleton class="h-8 w-28 rounded-md" />
        </div>
      </div>
    </div>
  </div>
</template>
