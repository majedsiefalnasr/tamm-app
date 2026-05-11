<script setup lang="ts">
import type { DropdownMenuRootEmits, DropdownMenuRootProps } from "reka-ui"
import { DropdownMenuRoot, useForwardPropsEmits } from "reka-ui"

const props = defineProps<DropdownMenuRootProps>()
const emits = defineEmits<DropdownMenuRootEmits>()

const forwarded = useForwardPropsEmits(props, emits)
const { locale } = useI18n()
const localeDir = computed<"rtl" | "ltr">(() =>
  locale.value.replace("_", "-").toLowerCase().startsWith("ar")
    ? "rtl"
    : "ltr",
)
const rootDir = computed<"rtl" | "ltr">(() => props.dir ?? localeDir.value)
</script>

<template>
  <DropdownMenuRoot
    v-slot="slotProps"
    data-slot="dropdown-menu"
    v-bind="forwarded"
    :dir="rootDir"
  >
    <slot v-bind="slotProps" />
  </DropdownMenuRoot>
</template>
