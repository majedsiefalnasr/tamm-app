<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  label: string
  tone?: 'primary' | 'accent' | 'info' | 'danger' | 'muted'
}

const props = withDefaults(defineProps<Props>(), {
  tone: 'muted',
})

const toneClasses = computed(() => {
  const tones: Record<string, string> = {
    primary: 'bg-primary-soft text-primary',
    accent: 'bg-accent/15 text-accent',
    info: 'bg-sky-100 text-sky-700',
    danger: 'bg-rose-100 text-rose-700',
    muted: 'bg-muted text-foreground/70',
  }
  return tones[props.tone] || tones.muted
})
</script>

<template>
  <div
    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold"
    :class="toneClasses"
  >
    {{ label }}
  </div>
</template>
