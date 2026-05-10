<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'default' | 'primary' | 'accent' | 'destructive' | 'secondary' | 'muted'
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  compact: false,
})

const variantClasses = computed(() => {
  const baseClasses = props.compact
    ? 'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium'
    : 'inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium'

  const variantMap: Record<string, string> = {
    default: 'bg-secondary text-secondary-foreground',
    primary: 'bg-primary text-primary-foreground',
    accent: 'bg-accent text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    muted: 'bg-muted text-muted-foreground',
  }

  return `${baseClasses} ${variantMap[props.variant] || variantMap.default}`
})
</script>

<template>
  <span :class="variantClasses">
    <slot />
  </span>
</template>
