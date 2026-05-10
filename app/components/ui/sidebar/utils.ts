import type { ComputedRef, Ref } from "vue"
import { createContext } from "reka-ui"

export const SIDEBAR_COOKIE_NAME = "sidebar_state"
export const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
/** Matches shadcn-vue dashboard-01 shell (`calc(var(--spacing) * 72)`). */
export const SIDEBAR_WIDTH = "calc(var(--spacing) * 72)"
export const SIDEBAR_WIDTH_MOBILE = "18rem"
/** Header band height — dashboard-01 (`calc(var(--spacing) * 12)`). */
export const HEADER_HEIGHT = "calc(var(--spacing) * 12)"
export const SIDEBAR_WIDTH_ICON = "3rem"
export const SIDEBAR_KEYBOARD_SHORTCUT = "b"

export const [useSidebar, provideSidebarContext] = createContext<{
  state: ComputedRef<"expanded" | "collapsed">
  open: Ref<boolean>
  setOpen: (value: boolean) => void
  isMobile: Ref<boolean>
  openMobile: Ref<boolean>
  setOpenMobile: (value: boolean) => void
  toggleSidebar: () => void
}>("Sidebar")
