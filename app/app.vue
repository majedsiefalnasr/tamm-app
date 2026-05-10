<script setup lang="ts">
const auth = useAuthStore()

onMounted(async () => {
  await auth.init()
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
