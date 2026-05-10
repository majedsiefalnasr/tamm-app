<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { InformationCircleIcon } from '@heroicons/vue/24/outline'
import { cn } from '~/lib/utils'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '~/components/ui/hover-card'

const props = withDefaults(
  defineProps<{
    hintKey: string
    ariaLabelKey?: string
    class?: HTMLAttributes['class']
  }>(),
  { ariaLabelKey: 'common.field_help' }
)

const { t } = useI18n()
</script>

<template>
  <span :class="cn('inline-flex shrink-0', props.class)">
    <HoverCard :open-delay="200">
      <HoverCardTrigger as-child>
        <button
          type="button"
          class="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex shrink-0 rounded-full focus-visible:ring-2 focus-visible:outline-none"
          :aria-label="t(props.ariaLabelKey)"
          @click.stop
        >
          <InformationCircleIcon class="size-4" aria-hidden="true" />
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        class="w-72 max-w-[min(18rem,calc(100vw-2rem))] text-start text-sm"
      >
        {{ t(hintKey) }}
      </HoverCardContent>
    </HoverCard>
  </span>
</template>
