<script setup lang="ts">
import AppSidebar from '~/components/layout/AppSidebar.vue'
import GlobalCommandPalette from '~/components/layout/GlobalCommandPalette.vue'
import Topbar from '~/components/layout/Topbar.vue'
import { Toaster } from '~/components/ui/sonner'
import { provideCommandPalette } from '~/composables/useCommandPalette'
import { SidebarInset, SidebarProvider } from '~/components/ui/sidebar'
import 'vue-sonner/style.css'

provideCommandPalette()
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset class="min-h-0">
      <Topbar />
      <div class="flex min-h-0 flex-1 flex-col overflow-auto">
        <div class="@container/main flex min-h-0 flex-1 flex-col gap-2">
          <div
            class="flex min-h-0 flex-1 flex-col gap-4 px-4 py-4 pb-16 md:gap-6 md:py-6 md:pb-20 lg:px-6"
          >
            <slot />
          </div>
        </div>
      </div>
      <GlobalCommandPalette />
      <Toaster />
    </SidebarInset>
  </SidebarProvider>
</template>
