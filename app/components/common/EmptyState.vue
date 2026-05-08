<script setup lang="ts">
interface Props {
  title?: string
  description?: string
  icon?: string
}

withDefaults(defineProps<Props>(), {
  title: 'common.empty_state',
  description: 'common.no_items',
  icon: '📋',
})
</script>

<template>
  <div
    class="border-border bg-card/50 flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-16 text-center"
  >
    <div class="mb-4 text-5xl">{{ icon }}</div>
    <h3 class="text-ink mb-2 text-lg font-semibold">
      {{ $t(title) }}
    </h3>
    <p class="text-muted-foreground text-sm">
      {{ $t(description) }}
    </p>
  </div>
</template>
