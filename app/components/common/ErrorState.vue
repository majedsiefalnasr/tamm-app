<script setup lang="ts">
import { computed } from 'vue'
import { AlertTriangle, RotateCw } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'

interface Props {
  message?: string
  actionLabel?: string
  titleKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  titleKey: 'common.error_occurred',
})

interface Emits {
  (e: 'action'): void
}

defineEmits<Emits>()

const { t, te } = useI18n()

const resolvedTitle = computed(() =>
  te(props.titleKey) ? t(props.titleKey) : props.titleKey
)

const resolvedActionLabel = computed(() => {
  if (!props.actionLabel) return t('common.retry')
  return te(props.actionLabel) ? t(props.actionLabel) : props.actionLabel
})

const detailText = computed(
  () => props.message ?? t('common.error_description')
)
</script>

<template>
  <div
    role="alert"
    aria-live="polite"
    class="border-destructive/25 bg-destructive/6 shadow-card mx-auto flex w-full max-w-lg flex-col items-center rounded-2xl border px-6 py-12 text-center sm:px-10 sm:py-14"
  >
    <div
      class="bg-destructive/15 text-destructive mb-6 flex size-16 items-center justify-center rounded-full"
      aria-hidden="true"
    >
      <AlertTriangle class="size-8 shrink-0" />
    </div>
    <h3 class="text-foreground mb-2 text-lg font-semibold tracking-tight">
      {{ resolvedTitle }}
    </h3>
    <p
      class="text-muted-foreground mx-auto max-w-md text-sm leading-relaxed wrap-break-word"
    >
      {{ detailText }}
    </p>
    <Button
      variant="default"
      type="button"
      class="mt-8 gap-2"
      @click="$emit('action')"
    >
      <RotateCw class="size-4 shrink-0" aria-hidden="true" />
      {{ resolvedActionLabel }}
    </Button>
  </div>
</template>
