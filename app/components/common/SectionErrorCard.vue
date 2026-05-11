<script setup lang="ts">
import { computed } from 'vue'
import { AlertTriangle, RotateCw } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Card } from '~/components/ui/card'

const props = withDefaults(
  defineProps<{
    titleKey?: string
    detail?: string
    retryLabelKey?: string
  }>(),
  {
    titleKey: 'errors.failed_to_load',
    retryLabelKey: 'common.retry',
  }
)

defineEmits<{
  retry: []
}>()

const { t, te } = useI18n()

const resolvedTitle = computed(() =>
  te(props.titleKey) ? t(props.titleKey) : props.titleKey
)

const resolvedRetry = computed(() =>
  te(props.retryLabelKey) ? t(props.retryLabelKey) : props.retryLabelKey
)
</script>

<template>
  <Card
    role="alert"
    aria-live="polite"
    class="border-destructive/25 bg-destructive/6 shadow-card flex flex-row items-start gap-4 rounded-2xl border p-4"
  >
    <div
      class="bg-destructive/15 text-destructive flex size-11 shrink-0 items-center justify-center rounded-full"
      aria-hidden="true"
    >
      <AlertTriangle class="size-5" />
    </div>
    <div class="min-w-0 flex-1 space-y-1 text-start">
      <p class="text-foreground leading-snug font-semibold">
        {{ resolvedTitle }}
      </p>
      <p
        v-if="detail"
        class="text-muted-foreground text-sm leading-relaxed wrap-break-word"
      >
        {{ detail }}
      </p>
      <Button
        variant="secondary"
        size="sm"
        type="button"
        class="mt-3 gap-2"
        @click="$emit('retry')"
      >
        <RotateCw class="size-3.5 shrink-0" aria-hidden="true" />
        {{ resolvedRetry }}
      </Button>
    </div>
  </Card>
</template>
