<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Bell, ChevronsUpDown, UserCircle } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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
import NotificationDrawer from '~/components/notifications/NotificationDrawer.vue'
import { useNotifications } from '~/composables/useNotifications'
import { getDisplayNameForRole } from '~/utils/roleRoutes'

const auth = useAuthStore()
const { isMobile } = useSidebar()
const { locale, t } = useI18n()

const notificationDrawerOpen = ref(false)
const { unreadCount, startPolling, stopPolling } = useNotifications()

const UNREAD_COUNT_THRESHOLD = 99
const notificationBadgeText = computed(() =>
  unreadCount.value > UNREAD_COUNT_THRESHOLD ? '99+' : String(unreadCount.value)
)

/** RTL + dock-right sidebar: avoid opening the menu past the viewport edge. */
const accountMenuSide = computed<'top' | 'right' | 'bottom' | 'left'>(() => {
  if (isMobile.value) return 'bottom'
  return locale.value === 'ar' ? 'left' : 'right'
})

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

function openNotifications() {
  notificationDrawerOpen.value = true
}

function goToAccount() {
  navigateTo('/settings')
}

const handleLogout = async () => {
  if (auth.isLoading) return
  await auth.logout()
}

onMounted(() => {
  startPolling()
})

onBeforeUnmount(() => {
  stopPolling()
})
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
            <ChevronsUpDown class="ms-auto size-4 shrink-0 opacity-70" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          class="min-w-56 rounded-lg"
          :side="accountMenuSide"
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
          <DropdownMenuGroup>
            <DropdownMenuItem class="cursor-pointer" @click="goToAccount">
              <UserCircle class="size-4 shrink-0" aria-hidden="true" />
              {{ t('nav.account') }}
            </DropdownMenuItem>
            <DropdownMenuItem class="cursor-pointer" @click="openNotifications">
              <Bell class="size-4 shrink-0" aria-hidden="true" />
              <span class="flex-1 text-start">{{
                $t('common.notifications')
              }}</span>
              <span
                v-if="unreadCount > 0"
                class="bg-destructive text-destructive-foreground ms-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold"
              >
                {{ notificationBadgeText }}
              </span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            class="cursor-pointer"
            :disabled="auth.isLoading"
            @click="handleLogout"
          >
            {{ $t('common.logout') }}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>

  <NotificationDrawer v-model:open="notificationDrawerOpen" />
</template>
