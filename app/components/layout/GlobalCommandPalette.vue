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
  </CommandDialog>
</template>
