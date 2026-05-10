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
    class="border-border bg-background/95 sticky top-0 z-40 flex h-16 w-full shrink-0 items-center gap-2 border-b backdrop-blur-xl"
  >
    <div class="flex w-full min-w-0 items-center gap-2 px-4 md:px-6">
      <SidebarTrigger class="-ms-1 shrink-0" />
      <Separator
        orientation="vertical"
        class="me-2 hidden h-4 shrink-0 sm:block"
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
