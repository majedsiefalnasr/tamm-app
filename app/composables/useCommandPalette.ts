import type { InjectionKey, Ref } from 'vue'
import { inject, provide, ref } from 'vue'

export interface CommandPaletteApi {
  /** Writable ref — bind to `CommandDialog` `v-model:open`; Topbar should call `open()` only. */
  isOpen: Ref<boolean>
  open: () => void
  close: () => void
  toggle: () => void
}

export const commandPaletteInjectionKey: InjectionKey<CommandPaletteApi> =
  Symbol('commandPalette')

export function provideCommandPalette(): CommandPaletteApi {
  const isOpen = ref(false)
  const api: CommandPaletteApi = {
    isOpen,
    open: () => {
      isOpen.value = true
    },
    close: () => {
      isOpen.value = false
    },
    toggle: () => {
      isOpen.value = !isOpen.value
    },
  }
  provide(commandPaletteInjectionKey, api)
  return api
}

export function useCommandPalette(): CommandPaletteApi {
  const ctx = inject(commandPaletteInjectionKey)
  if (!ctx) {
    throw new Error(
      'useCommandPalette() requires provideCommandPalette() ancestor'
    )
  }
  return ctx
}

/** Safe variant when palette is optional (e.g. Storybook); returns null outside provider. */
export function tryUseCommandPalette(): CommandPaletteApi | null {
  return inject(commandPaletteInjectionKey, null)
}
