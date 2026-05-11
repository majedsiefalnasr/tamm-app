<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import { computed, onMounted, ref, watch } from 'vue'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '~/components/ui/command'
import { useAuthStore } from '~/stores/auth'
import type { NavItem } from '~/utils/roleRoutes'
import { useRoleRoutes } from '~/composables/useRoleRoutes'
import {
  readRecentHrefsFromStorage,
  recordRecentHref,
  shouldBlockPaletteShortcut,
} from '~/utils/commandPalette'
import { getNavIcon } from '~/utils/navIcons'
import { CornerDownLeft } from 'lucide-vue-next'
import { Kbd } from '~/components/ui/kbd'

const { t } = useI18n()
const palette = useCommandPalette()
const isOpen = palette.isOpen
const auth = useAuthStore()
const { getNavigationForRole } = useRoleRoutes()

const recentsHref = ref<string[]>([])

onMounted(() => {
  recentsHref.value = readRecentHrefsFromStorage()
})

watch(
  () => palette.isOpen.value,
  open => {
    if (open) recentsHref.value = readRecentHrefsFromStorage()
  }
)

const navItems = computed((): NavItem[] =>
  getNavigationForRole(auth.user?.role ?? '')
)

const allowedHrefs = computed(() => new Set(navItems.value.map(i => i.href)))

const navByHref = computed(() => {
  const m = new Map<string, NavItem>()
  for (const item of navItems.value) m.set(item.href, item)
  return m
})

/** Recents that still exist in the role navigation catalog */
const recentItems = computed((): NavItem[] => {
  const seen = new Set<string>()
  const out: NavItem[] = []
  for (const href of recentsHref.value) {
    if (!allowedHrefs.value.has(href)) continue
    const item = navByHref.value.get(href)
    if (!item || seen.has(href)) continue
    seen.add(href)
    out.push(item)
  }
  return out
})

const shortcutItems = computed((): NavItem[] => {
  const recentSet = new Set(recentItems.value.map(r => r.href))
  return navItems.value.filter(i => !recentSet.has(i.href))
})

function onSelectNav(item: NavItem) {
  recordRecentHref(item.href)
  recentsHref.value = readRecentHrefsFromStorage()
  palette.close()
  navigateTo(item.href)
}

useEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key !== 'k' && event.key !== 'K') return
  if (!(event.metaKey || event.ctrlKey)) return
  if (shouldBlockPaletteShortcut(event.target, palette.isOpen.value)) return
  event.preventDefault()
  palette.toggle()
})
</script>

<template>
  <CommandDialog
    v-model:open="isOpen"
    :title="t('commandPalette.title')"
    :description="t('commandPalette.description')"
  >
    <CommandInput :placeholder="t('commandPalette.searchPlaceholder')" />
    <CommandList>
      <CommandEmpty>{{ t('commandPalette.empty') }}</CommandEmpty>

      <CommandGroup
        v-if="recentItems.length > 0"
        :heading="t('commandPalette.groupRecents')"
      >
        <CommandItem
          v-for="item in recentItems"
          :key="`recent-${item.key}`"
          :value="item.href"
          @select="() => onSelectNav(item)"
        >
          <component :is="getNavIcon(item.icon)" class="size-4 shrink-0" />
          <span>{{ t(item.label) }}</span>
        </CommandItem>
      </CommandGroup>

      <CommandGroup
        v-if="shortcutItems.length > 0"
        :heading="t('commandPalette.groupShortcuts')"
      >
        <CommandItem
          v-for="item in shortcutItems"
          :key="`nav-${item.key}`"
          :value="item.href"
          @select="() => onSelectNav(item)"
        >
          <component :is="getNavIcon(item.icon)" class="size-4 shrink-0" />
          <span>{{ t(item.label) }}</span>
        </CommandItem>
      </CommandGroup>
    </CommandList>

    <div
      class="border-border bg-muted/60 text-muted-foreground flex w-full flex-nowrap items-center gap-3 overflow-x-auto border-t px-3 py-2.5 text-xs"
      aria-hidden="true"
    >
      <div class="flex shrink-0 items-center gap-2">
        <Kbd
          class="text-foreground/90 border-border bg-background h-6 gap-0 px-1.5 shadow-sm"
        >
          <CornerDownLeft class="size-3.5 shrink-0" aria-hidden="true" />
        </Kbd>
        <span class="text-foreground/90 whitespace-nowrap">{{
          t('commandPalette.footerGoToPage')
        }}</span>
      </div>
      <span class="bg-border block h-4 w-px shrink-0" aria-hidden="true" />
      <div class="ms-auto flex shrink-0 items-center gap-2">
        <Kbd
          class="text-foreground/90 border-border bg-background h-6 px-2 shadow-sm"
        >
          {{ t('settings.shortcut_escape_key') }}
        </Kbd>
        <span class="text-foreground/90 whitespace-nowrap">{{
          t('commandPalette.footerClose')
        }}</span>
      </div>
    </div>
  </CommandDialog>
</template>
