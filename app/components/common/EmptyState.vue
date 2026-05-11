<script setup lang="ts">
import type { Component, HTMLAttributes } from 'vue'
import { computed } from 'vue'
import {
  Bell,
  ClipboardList,
  CreditCard,
  FolderOpen,
  History,
  Inbox,
  Scale,
} from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '~/components/ui/empty'

const ICON_ALIASES: Record<
  string,
  'inbox' | 'folder' | 'history' | 'scale' | 'card' | 'clipboard' | 'bell'
> = {
  '📁': 'folder',
  '⚖️': 'scale',
  '💳': 'card',
  '📋': 'clipboard',
  inbox: 'inbox',
  folder: 'folder',
  history: 'history',
  scale: 'scale',
  card: 'card',
  clipboard: 'clipboard',
  bell: 'bell',
}

const ICON_COMPONENTS = {
  inbox: Inbox,
  folder: FolderOpen,
  history: History,
  scale: Scale,
  card: CreditCard,
  clipboard: ClipboardList,
  bell: Bell,
} as const

type IconPreset = keyof typeof ICON_COMPONENTS

const props = withDefaults(
  defineProps<{
    title?: string
    /** i18n key; omit or leave empty to hide description */
    description?: string
    /** Preset name, legacy emoji alias, or a Lucide Vue component */
    icon?: string | Component
    class?: HTMLAttributes['class']
  }>(),
  {
    title: 'common.no_data',
    description: undefined,
    icon: undefined,
  }
)

const { t } = useI18n()

const preset = computed((): IconPreset => {
  const raw = props.icon
  if (raw == null) return 'clipboard'
  if (typeof raw !== 'string') return 'clipboard'
  const byExact = ICON_ALIASES[raw]
  if (byExact) return byExact
  const lower = raw.toLowerCase()
  const byLower = ICON_ALIASES[lower]
  if (byLower) return byLower
  if (lower in ICON_COMPONENTS) return lower as IconPreset
  return 'clipboard'
})

const customIcon = computed(() =>
  props.icon != null && typeof props.icon !== 'string'
    ? (props.icon as Component)
    : null
)

const resolvedIcon = computed(
  () => customIcon.value ?? ICON_COMPONENTS[preset.value]
)
</script>

<template>
  <Empty
    :class="
      cn(
        'border-border bg-card/50 border-2 border-dashed shadow-none',
        props.class
      )
    "
  >
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <component
          :is="resolvedIcon"
          class="size-6 shrink-0"
          aria-hidden="true"
        />
      </EmptyMedia>
      <EmptyTitle>{{ t(title) }}</EmptyTitle>
      <EmptyDescription v-if="description">
        {{ t(description) }}
      </EmptyDescription>
    </EmptyHeader>
    <EmptyContent v-if="$slots.default">
      <slot />
    </EmptyContent>
  </Empty>
</template>
