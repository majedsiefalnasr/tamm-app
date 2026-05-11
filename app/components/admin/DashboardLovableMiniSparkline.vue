<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  series: number[]
  toneClass: string
}

const props = defineProps<Props>()

const pathD = computed(() => {
  const s = props.series
  if (!s.length) return ''
  const min = Math.min(...s)
  const max = Math.max(...s)
  const pad = 2
  const w = 100 - pad * 2
  const h = 28 - pad * 2
  const span = max - min || 1
  return s
    .map((v, i) => {
      const x = pad + (i / Math.max(s.length - 1, 1)) * w
      const y = pad + h - ((v - min) / span) * h
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
})
</script>

<template>
  <svg
    class="w-full overflow-visible text-current"
    viewBox="0 0 100 28"
    height="28"
    width="100%"
    aria-hidden="true"
  >
    <path
      :d="pathD"
      fill="none"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
      stroke-linejoin="round"
      :class="toneClass"
    />
  </svg>
</template>
