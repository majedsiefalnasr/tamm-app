<script setup lang="ts">
const { localeProperties } = useI18n()

useHead(() => {
  const { code, dir } = localeProperties.value
  const resolvedDir =
    dir ?? (code === 'ar' ? 'rtl' : code === 'en' ? 'ltr' : 'ltr')
  return {
    htmlAttrs: {
      lang: code,
      dir: resolvedDir as 'ltr' | 'rtl',
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
