<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '~/components/ui/breadcrumb'
import { Separator } from '~/components/ui/separator'
import { SidebarTrigger } from '~/components/ui/sidebar'
import NotificationBell from './NotificationBell.vue'
import { useAuthStore } from '~/stores/auth'
import { getHomePageForRole } from '~/utils/roleRoutes'

const auth = useAuthStore()
const route = useRoute()

const homeHref = computed(() => getHomePageForRole(auth.user?.role ?? 'client'))

const pageTitleKey = computed(() => {
  const metaTitle = route.meta.pageTitle as string | undefined
  return metaTitle ?? 'nav.overview'
})
</script>

<template>
  <header
    class="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)"
  >
    <div class="flex w-full min-w-0 items-center gap-1 px-4 lg:gap-2 lg:px-6">
      <SidebarTrigger class="-ms-1 shrink-0" />
      <Separator
        orientation="vertical"
        class="mx-2 hidden shrink-0 data-[orientation=vertical]:h-4 sm:block"
      />
      <Breadcrumb class="min-w-0 flex-1">
        <BreadcrumbList class="flex-wrap">
          <BreadcrumbItem class="hidden sm:flex">
            <BreadcrumbLink as-child>
              <NuxtLink
                :to="homeHref"
                class="hover:text-foreground transition-colors"
                >{{ $t('nav.home') }}</NuxtLink
              >
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator class="hidden sm:flex" />
          <BreadcrumbItem>
            <BreadcrumbPage class="truncate">{{
              $t(pageTitleKey)
            }}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div class="ms-auto flex shrink-0 items-center gap-3">
        <NotificationBell />
      </div>
    </div>
  </header>
</template>
