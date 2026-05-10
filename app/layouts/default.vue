<script setup lang="ts">
import AppSidebar from '~/components/layout/AppSidebar.vue'
import Topbar from '~/components/layout/Topbar.vue'
import { SidebarInset, SidebarProvider } from '~/components/ui/sidebar'
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset class="min-h-0">
      <Topbar />
      <div class="flex min-h-0 flex-1 flex-col overflow-auto">
        <div class="@container/main flex min-h-0 flex-1 flex-col gap-2">
          <slot />
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
