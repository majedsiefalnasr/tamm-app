<script setup lang="ts">
const auth = useAuthStore()

onMounted(async () => {
  await auth.init()
})
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>
