<script setup lang="ts">
import { computed } from "vue"
import { reactiveOmit } from "@vueuse/core"
import type { SelectRootEmits, SelectRootProps } from "reka-ui"
import { SelectRoot, useForwardPropsEmits } from "reka-ui"

const props = defineProps<SelectRootProps>()
const emits = defineEmits<SelectRootEmits>()

const { locale } = useI18n()

/** RTL for Arabic (default app locale); explicit `dir` on Select still wins. */
const resolvedDir = computed(
  () =>
    props.dir ??
    (locale.value === "ar" || locale.value.startsWith("ar") ? "rtl" : "ltr"),
)

const delegatedProps = reactiveOmit(props, "dir")
const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <SelectRoot
    v-slot="slotProps"
    data-slot="select"
    v-bind="forwarded"
    :dir="resolvedDir"
  >
    <slot v-bind="slotProps" />
  </SelectRoot>
</template>
