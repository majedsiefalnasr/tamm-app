<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    contentWidth?: 'xs' | 'sm'
  }>(),
  { contentWidth: 'xs' }
)

const { t } = useI18n()

const maxWidthClass = computed(() =>
  props.contentWidth === 'sm' ? 'max-w-sm' : 'max-w-xs'
)
</script>

<template>
  <div class="grid min-h-svh lg:grid-cols-2">
    <div class="flex flex-col gap-4 p-6 md:p-10">
      <div class="flex justify-center gap-2 md:justify-start">
        <NuxtLink to="/" class="flex items-center gap-2 font-medium">
          <span class="sr-only">{{ t('auth.appBrand') }}</span>
          <img src="/logo.svg" alt="" class="h-8 w-auto" aria-hidden="true" />
        </NuxtLink>
      </div>
      <div class="flex flex-1 items-center justify-center">
        <div class="w-full" :class="maxWidthClass">
          <slot />
        </div>
      </div>
    </div>
    <div class="bg-muted relative hidden lg:block">
      <img
        src="/placeholder.svg"
        alt=""
        class="absolute inset-0 h-full w-full object-cover dark:opacity-90"
      />
    </div>
  </div>
</template>
