<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '~/components/ui/sidebar'
import { Label } from '~/components/ui/label'
import { Kbd } from '~/components/ui/kbd'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '~/components/ui/input-group'
import { Search } from 'lucide-vue-next'
import { tryUseCommandPalette } from '~/composables/useCommandPalette'
import type { NavItem } from '~/utils/roleRoutes'
import { getHomePageForRole } from '~/utils/roleRoutes'
import { useRoleRoutes } from '~/composables/useRoleRoutes'
import { getNavIcon } from '~/utils/navIcons'
import SidebarUserMenu from '~/components/layout/SidebarUserMenu.vue'

const auth = useAuthStore()
const route = useRoute()
const { getNavigationForRole } = useRoleRoutes()
const { setOpenMobile } = useSidebar()
const { t } = useI18n()
const palette = tryUseCommandPalette()

const sidebarSearchModel = ref('')

function openCommandPaletteFromSearch() {
  palette?.open()
}

watch(
  () => route.fullPath,
  () => {
    setOpenMobile(false)
  }
)

/**
 * `Sidebar.vue` maps `side="left"` to `start-0` (inline-start): dock at inline-start in LTR,
 * dock at inline-end in RTL (Arabic). Older locale hacks used physical directional Tailwind and were
 * removed in favor of logical properties (`ms-*`, `ps-*`, `start-*`, `end-*`).
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
      class="border-border flex shrink-0 flex-col justify-center border-b py-2 ps-3 pe-3"
    >
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child>
            <NuxtLink :to="homeHref" class="flex min-w-0 items-center gap-2">
              <img
                src="/tamm-logo.png"
                :alt="t('auth.appBrand')"
                class="object-start h-8 w-auto max-w-full object-contain select-none"
                width="200"
                height="40"
                decoding="async"
              />
            </NuxtLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      <form
        v-if="palette"
        role="search"
        class="group-data-[collapsible=icon]/sidebar-wrapper:hidden"
        @submit.prevent="openCommandPaletteFromSearch"
      >
        <SidebarGroup class="py-0">
          <SidebarGroupContent class="relative">
            <Label for="sidebar-nav-search" class="sr-only">{{
              t('commandPalette.open')
            }}</Label>
            <InputGroup
              class="border-sidebar-border bg-sidebar-accent/40 shadow-none"
            >
              <InputGroupInput
                id="sidebar-nav-search"
                v-model="sidebarSearchModel"
                type="search"
                name="sidebar-nav-search"
                readonly
                tabindex="0"
                autocomplete="off"
                :placeholder="t('commandPalette.searchPlaceholder')"
                :title="`${t('commandPalette.modMeta')}+K / ${t('commandPalette.modCtrl')}+K`"
                class="text-sidebar-foreground placeholder:text-muted-foreground cursor-pointer"
                @click="openCommandPaletteFromSearch"
                @keydown.enter.prevent="openCommandPaletteFromSearch"
              />
              <InputGroupAddon
                align="inline-start"
                class="border-0 bg-transparent ps-2"
                @click.stop="openCommandPaletteFromSearch"
              >
                <Search
                  class="text-muted-foreground size-4 shrink-0 opacity-50"
                  aria-hidden="true"
                />
              </InputGroupAddon>
              <InputGroupAddon
                align="inline-end"
                class="border-0 bg-transparent ps-2"
                dir="ltr"
                @click.stop="openCommandPaletteFromSearch"
              >
                <Kbd
                  class="text-muted-foreground h-5 min-w-0 px-1.5 font-mono text-[10px] leading-none"
                >
                  {{ t('commandPalette.modMeta') }} + K
                </Kbd>
              </InputGroupAddon>
            </InputGroup>
          </SidebarGroupContent>
        </SidebarGroup>
      </form>
    </SidebarHeader>

    <SidebarContent class="gap-4 py-3 ps-3 pe-3">
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

    <SidebarFooter class="border-border border-t ps-3 pe-3 pt-2 pb-3">
      <SidebarUserMenu />
    </SidebarFooter>
  </Sidebar>
</template>
