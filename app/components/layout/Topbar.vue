<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { BellIcon } from '@heroicons/vue/24/outline'
import { getDisplayNameForRole } from '~/utils/roleRoutes'

const auth = useAuthStore()
const route = useRoute()

// Compute page title from route meta or utility function
const pageTitle = computed(() => {
  const metaTitle = route.meta.pageTitle as string | undefined
  return metaTitle || 'common.home'
})

// Get user initials for avatar
const userInitials = computed(() => {
  if (!auth.user?.name) return 'U'
  return auth.user.name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0]?.toUpperCase())
    .join('')
})

// Get role display name from i18n key
const getRoleDisplayNameForDisplay = (role: string): string => {
  return getDisplayNameForRole(role)
}

// Handle logout
const handleLogout = async () => {
  await auth.logout()
  // Auth store redirects to /login
}
</script>

<template>
  <div
    class="border-border bg-background/95 sticky top-0 z-40 h-20 w-full border-b backdrop-blur-xl"
  >
    <div class="flex h-full items-center justify-between gap-4 px-6">
      <!-- Left side: Logo + Page title -->
      <div class="flex min-w-0 items-center gap-4">
        <!-- Logo -->
        <div class="flex items-center justify-center">
          <span class="text-primary text-2xl font-bold">TAMM</span>
        </div>

        <!-- Divider -->
        <div class="border-border hidden h-8 border-s sm:block" />

        <!-- Page Title -->
        <div class="hidden sm:block">
          <h1 class="text-foreground text-lg font-semibold whitespace-nowrap">
            {{ $t(pageTitle) }}
          </h1>
        </div>
      </div>

      <!-- Right side: Notification bell + Avatar menu -->
      <div class="ms-auto flex items-center gap-4">
        <!-- Notification Bell (placeholder for future story) -->
        <Button
          variant="ghost"
          size="icon"
          class="rounded-full"
          @click="$emit('notification-click')"
        >
          <BellIcon class="h-5 w-5" />
        </Button>

        <!-- Avatar Dropdown Menu -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button
              variant="ghost"
              class="bg-primary-soft text-primary flex h-9 w-9 items-center justify-center rounded-full p-0 text-sm font-bold"
            >
              {{ userInitials }}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" class="w-56">
            <!-- User Info -->
            <DropdownMenuLabel class="flex flex-col gap-1">
              <div class="text-foreground font-semibold">
                {{ auth.user?.name }}
              </div>
              <div class="text-muted-foreground text-xs">
                {{ auth.user?.email }}
              </div>
            </DropdownMenuLabel>

            <!-- Role Label (Pill style) -->
            <div class="px-2 py-2">
              <div
                class="bg-muted text-muted-foreground inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
              >
                {{
                  $t(getRoleDisplayNameForDisplay(auth.user?.role ?? 'client'))
                }}
              </div>
            </div>

            <DropdownMenuSeparator />

            <!-- Logout Button -->
            <DropdownMenuItem
              as-button
              class="text-destructive focus:bg-destructive/10 cursor-pointer"
              @click="handleLogout"
            >
              {{ $t('common.logout') }}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </div>
</template>
