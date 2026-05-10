<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
})

const auth = useAuthStore()
const { getHomePageForRole } = useRoleRoutes()
const role = auth.user?.role ?? 'client'

await navigateTo(getHomePageForRole(role), { replace: true })
</script>

<template>
  <div
    class="text-muted-foreground flex min-h-[50vh] items-center justify-center text-sm"
  >
    {{ $t('common.redirecting') }}
  </div>
</template>
