<script setup lang="ts">
/**
 * Generic page skeleton using shadcn-vue Skeleton
 * @see https://www.shadcn-vue.com/docs/components/skeleton
 */
import { Skeleton } from '~/components/ui/skeleton'

withDefaults(
  defineProps<{
    /** Number of body rows/blocks below the header */
    rows?: number
    showCards?: boolean
  }>(),
  {
    rows: 4,
    showCards: false,
  }
)
</script>

<template>
  <div class="space-y-6" aria-busy="true">
    <div class="space-y-2">
      <Skeleton class="h-9 w-48 max-w-[min(100%,18rem)] rounded-md" />
      <Skeleton class="h-4 w-full max-w-md rounded-md" />
    </div>
    <div
      v-if="showCards"
      class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <Skeleton v-for="i in 4" :key="`sk-card-${i}`" class="h-24 rounded-xl" />
    </div>
    <div class="space-y-3">
      <Skeleton
        v-for="i in rows"
        :key="`sk-row-${i}`"
        class="h-12 rounded-lg"
      />
    </div>
  </div>
</template>
