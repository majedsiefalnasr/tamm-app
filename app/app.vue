<script setup lang="ts">
const { locale } = useI18n()

/**
 * Drive `<html lang/dir>` from the active locale code, not `localeProperties.dir`.
 * The dir field has been unreliable for `en` (sidebar flex order + `side` prop drifted).
 */
useHead(() => {
  const code = locale.value
  const resolvedDir: 'ltr' | 'rtl' = code === 'ar' ? 'rtl' : 'ltr'
  return {
    htmlAttrs: {
      lang: code,
      dir: resolvedDir,
    },
  }
})
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
