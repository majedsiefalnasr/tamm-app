<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '~/components/ui/sidebar'
import type { NavItem } from '~/utils/roleRoutes'
import { getHomePageForRole } from '~/utils/roleRoutes'
import { useRoleRoutes } from '~/composables/useRoleRoutes'
import { getNavIcon } from '~/utils/navIcons'
import SidebarUserMenu from '~/components/layout/SidebarUserMenu.vue'

const auth = useAuthStore()
const route = useRoute()
const { getNavigationForRole } = useRoleRoutes()
const { setOpenMobile } = useSidebar()

watch(
  () => route.fullPath,
  () => {
    setOpenMobile(false)
  }
)

/**
 * `Sidebar.vue` maps `side="left"` to `start-0` (inline-start): dock left in LTR,
 * dock right in RTL (Arabic). Locale-specific flipping was for the old physical
 * `left-*` / `right-*` positioning and inverted after logical properties.
 */
const SIDEBAR_DOCK: 'left' | 'right' = 'left'

const navItems = computed((): NavItem[] => {
  const role = auth.user?.role ?? ''
  return getNavigationForRole(role)
})

const homeHref = computed(() => getHomePageForRole(auth.user?.role ?? 'client'))

const groupedNav = computed(() => {
  const items = navItems.value
  const main: NavItem[] = []
  const other: NavItem[] = []
  const system: NavItem[] = []
  for (const item of items) {
    if (item.group === 'system') system.push(item)
    else if (item.group === 'other') other.push(item)
    else main.push(item)
  }
  return { main, other, system }
})

function isItemActive(href: string): boolean {
  const path = route.path
  if (path === href) return true
  if (href !== '/' && path.startsWith(`${href}/`)) return true
  return false
}
</script>

<template>
  <Sidebar :side="SIDEBAR_DOCK" variant="inset" collapsible="offcanvas">
    <SidebarHeader
      class="border-border flex shrink-0 flex-col justify-center border-b px-3 py-2"
    >
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child>
            <NuxtLink :to="homeHref" class="flex items-center gap-2">
              <div
                class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
              >
                <img
                  src="/logo.svg"
                  alt=""
                  class="size-5"
                  width="20"
                  height="20"
                />
              </div>
              <div class="grid min-w-0 flex-1 text-start text-sm leading-tight">
                <span class="truncate font-semibold">{{
                  $t('auth.appBrand')
                }}</span>
              </div>
            </NuxtLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>

    <SidebarContent class="gap-4 px-3 py-3">
      <SidebarGroup v-if="groupedNav.main.length">
        <SidebarGroupLabel>{{ $t('nav.sections.platform') }}</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem v-for="item in groupedNav.main" :key="item.key">
            <SidebarMenuButton
              as-child
              :tooltip="$t(item.label)"
              :is-active="isItemActive(item.href)"
            >
              <NuxtLink :to="item.href" class="flex items-center gap-2">
                <component
                  :is="getNavIcon(item.icon)"
                  class="size-4 shrink-0"
                />
                <span>{{ $t(item.label) }}</span>
              </NuxtLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup v-if="groupedNav.other.length">
        <SidebarGroupLabel>{{ $t('nav.sections.other') }}</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem v-for="item in groupedNav.other" :key="item.key">
            <SidebarMenuButton
              as-child
              :tooltip="$t(item.label)"
              :is-active="isItemActive(item.href)"
            >
              <NuxtLink :to="item.href" class="flex items-center gap-2">
                <component
                  :is="getNavIcon(item.icon)"
                  class="size-4 shrink-0"
                />
                <span>{{ $t(item.label) }}</span>
              </NuxtLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup v-if="groupedNav.system.length">
        <SidebarGroupLabel>{{ $t('nav.sections.system') }}</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem v-for="item in groupedNav.system" :key="item.key">
            <SidebarMenuButton
              as-child
              :tooltip="$t(item.label)"
              :is-active="isItemActive(item.href)"
            >
              <NuxtLink :to="item.href" class="flex items-center gap-2">
                <component
                  :is="getNavIcon(item.icon)"
                  class="size-4 shrink-0"
                />
                <span>{{ $t(item.label) }}</span>
              </NuxtLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>

    <SidebarFooter class="border-border border-t px-3 pt-2 pb-3">
      <SidebarUserMenu />
    </SidebarFooter>
  </Sidebar>
</template>
