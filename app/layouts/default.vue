<script setup lang="ts">
import AppSidebar from '~/components/layout/AppSidebar.vue'
import Topbar from '~/components/layout/Topbar.vue'
import { SidebarInset, SidebarProvider } from '~/components/ui/sidebar'
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <Topbar />
      <div class="flex flex-1 flex-col overflow-auto">
        <slot />
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
