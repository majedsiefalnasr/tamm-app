<script setup lang="ts">
const auth = useAuthStore()
const { getHomePageForRole } = useRoleRoutes()

const homePage = computed(() => {
  return getHomePageForRole(auth.user?.role ?? 'client')
})
</script>

<template>
  <div
    class="bg-background flex min-h-screen flex-1 items-center justify-center"
  >
    <div class="text-center">
      <h1 class="text-primary mb-4 text-6xl font-bold">403</h1>
      <p class="text-muted-foreground mb-8 text-xl">
        {{ $t('errors.forbidden') }}
      </p>
      <p class="text-muted-foreground mb-8 text-sm">
        {{ $t('errors.access_denied') }}
      </p>

      <Button as-link :to="homePage" class="gap-2">
        <svg
          class="h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
          />
        </svg>
        {{ $t('common.back_to_home') }}
      </Button>
    </div>
  </div>
</template>
