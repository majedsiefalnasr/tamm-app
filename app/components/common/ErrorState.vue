<script setup lang="ts">
import { Button } from '~/components/ui/button'

interface Props {
  message?: string
  retryLabel?: string
}

defineProps<Props>()

interface Emits {
  retry: []
}

defineEmits<Emits>()
</script>

<template>
  <div
    class="border-destructive/20 bg-destructive/5 flex flex-col items-center justify-center rounded-lg border px-4 py-16 text-center"
  >
    <div class="mb-4 text-5xl">⚠️</div>
    <h3 class="text-destructive mb-2 text-lg font-semibold">
      {{ $t('common.error_occurred') }}
    </h3>
    <p class="text-muted-foreground mb-6 text-sm">
      {{ message || $t('common.error_description') }}
    </p>
    <Button variant="outline" @click="$emit('retry')">
      {{ retryLabel || $t('common.retry') }}
    </Button>
  </div>
</template>
