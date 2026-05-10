<script setup lang="ts">
import { computed } from 'vue'
import { ChevronUpDownIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '~/stores/auth'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '~/components/ui/sidebar'
import { getDisplayNameForRole } from '~/utils/roleRoutes'

const auth = useAuthStore()
const { isMobile } = useSidebar()

const userInitials = computed(() => {
  if (!auth.user?.name) return 'U'
  return auth.user.name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0]?.toUpperCase())
    .join('')
})

const getRoleDisplayNameForDisplay = (role: string): string => {
  return getDisplayNameForRole(role)
}

const handleLogout = async () => {
  await auth.logout()
}
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Avatar class="size-8 rounded-lg">
              <AvatarImage
                v-if="auth.user?.avatar_url"
                :src="auth.user.avatar_url"
                :alt="auth.user?.name ?? ''"
              />
              <AvatarFallback class="rounded-lg text-xs font-semibold">
                {{ userInitials }}
              </AvatarFallback>
            </Avatar>
            <div class="grid min-w-0 flex-1 text-start text-sm leading-tight">
              <span class="truncate font-medium">{{ auth.user?.name }}</span>
              <span class="text-muted-foreground truncate text-xs">{{
                auth.user?.email
              }}</span>
            </div>
            <ChevronUpDownIcon class="ms-auto size-4 shrink-0 opacity-70" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          class="min-w-56 rounded-lg"
          :side="isMobile ? 'bottom' : 'right'"
          align="end"
          :side-offset="4"
        >
          <DropdownMenuLabel class="flex flex-col gap-1 p-2 font-normal">
            <span class="truncate font-semibold">{{ auth.user?.name }}</span>
            <span class="text-muted-foreground truncate text-xs">{{
              auth.user?.email
            }}</span>
            <div
              class="bg-muted text-muted-foreground mt-1 inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
            >
              {{
                $t(getRoleDisplayNameForDisplay(auth.user?.role ?? 'client'))
              }}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            as-button
            class="text-destructive focus:bg-destructive/10 cursor-pointer"
            @click="handleLogout"
          >
            {{ $t('common.logout') }}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
