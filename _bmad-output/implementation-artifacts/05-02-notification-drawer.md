# Story 05-02 — Notification Drawer

**Status:** ready-for-dev  
**Epic:** 05 — In-App Notifications  
**Story ID:** 5.2  
**Priority:** 🟡 MEDIUM — Core UX feature; enables viewing and acting on notifications  
**Complexity:** Medium  
**Estimated Effort:** 8–10 hours  
**Created:** 2026-05-09
**Dependencies:** Story 05-01 (notification bell must exist and poll unread count)

---

## 📋 User Story

**As a** user,  
**I want to** open my notifications and see a list of recent events,  
**so that** I can act on them quickly.

---

## ✅ Acceptance Criteria

### Drawer Mechanics

- [ ] Clicking `NotificationBell` component opens a `shadcn-vue` `Sheet` component
- [ ] Sheet slides in from the **inline-end** (right in LTR, left in RTL) using `side="end"`
- [ ] Sheet width: `w-[380px]` on mobile-up, `md:w-[420px]` on medium screens and above
- [ ] Sheet closes on `Esc` key or click outside the drawer
- [ ] Sheet has a semi-transparent backdrop that detects outside clicks

### Drawer Header

- [ ] Header section: `px-4 py-4` padding, `border-b border-border`
- [ ] Title: `text-lg font-extrabold` — "Notifications" (uses i18n key `notif.drawer.title`)
- [ ] "Mark all as read" button: **ghost variant**, `text-sm`, positioned **end-aligned**
- [ ] Button hidden entirely when all notifications are already read
- [ ] Button label uses i18n key: `notif.drawer.mark_all_read`
- [ ] Button is interactive and styled in primary color (no background)

### Notification List

- [ ] List shows notifications sorted by **newest first** (by `created_at` descending)
- [ ] Each notification item is a clickable row: `flex items-start gap-3 px-4 py-3`
- [ ] Unread items have background: `bg-primary-50/40` (subtle light primary, NOT primary color itself)
- [ ] Read items have `bg-white` / `bg-background`
- [ ] Item border: `border-b border-border` on each item, last item has `last:border-0`
- [ ] Hover state: `hover:bg-muted/50` transition effect on both read and unread items

### Notification Item Content

Each item displays:

1. **Unread indicator dot:**
   - Size: `h-2 w-2 rounded-full bg-primary`
   - Position: `shrink-0 mt-1.5` (start side, vertically aligned with title)
   - Hidden entirely if notification is read (`is_read: true`)

2. **Title:**
   - Font: `text-sm font-semibold text-ink`
   - Single line, no wrap
   - Content from notification's `title` field (string from API)

3. **Body:**
   - Font: `text-xs text-muted-foreground`
   - Multi-line clamped: `line-clamp-2` (max 2 lines)
   - Content from notification's `body` field (string from API)
   - Top margin: `mt-0.5` separator from title

4. **Relative time:**
   - Font: `text-[10px] text-muted-foreground`
   - Top margin: `mt-1` separator from body
   - Format: "2m ago", "1h ago", "3d ago" (use `formatRelativeTime()` from utils)
   - Source: `created_at` timestamp from API

### Item Interactions

- [ ] Clicking anywhere on item → calls `POST /notifications/:id/read` (marks as read on backend)
- [ ] Optimistic update: item immediately loses unread indicator dot, count in badge decrements
- [ ] Item background changes from `bg-primary-50/40` to `bg-white`
- [ ] Navigate to `notification.link` URL (from API response)
- [ ] Close drawer after navigation
- [ ] No rollback on read action (fire-and-forget acceptable per story 05-03)

### Mark All as Read

- [ ] "Mark all as read" button calls `POST /notifications/read-all`
- [ ] Optimistic update: **all items immediately lose unread dot**, background changes to `bg-white`
- [ ] Unread count badge updates to 0
- [ ] Button hides after action (all items now read)
- [ ] No rollback needed (fire-and-forget acceptable)

### Empty State

- [ ] When list is empty (`notifications.length === 0`), render `EmptyState` component
- [ ] Icon: Use existing EmptyState component pattern (defined in design-spec.md §5.6)
- [ ] Title: `text-sm text-muted-foreground` — "No notifications yet" (i18n key: `notif.drawer.empty`)
- [ ] Positioned: centered in drawer using flexbox

### Scrolling

- [ ] List is scrollable if notifications exceed drawer height
- [ ] Header "sticks" at top when scrolling (use CSS `sticky` if needed)
- [ ] Custom scrollbar styling optional (follow design-spec.md)

### RTL Layout

- [ ] Sheet `side="end"` opens from **left in RTL** (inline-end semantics)
- [ ] Unread dot: positioned start-side (left in RTL, right in LTR) — use `shrink-0` only, no directional class
- [ ] All spacing uses logical properties: `ps-*`, `pe-*`, `ms-*`, `me-*`
- [ ] Text alignment: body uses `text-start` to respect RTL flow
- [ ] Button "Mark all as read" end-aligned within header (end-side = left in RTL)
- [ ] Visually verified: test drawer in both Arabic (RTL) and English (LTR)

### Notification Data Type

Use existing `Notification` type from `shared/types/notification.ts`:

```typescript
export type Notification = {
  id: string
  user_id: string
  title: string           // e.g. "Report submitted"
  body: string            // e.g. "[Milestone name] — [Project name]"
  link: string            // e.g. "/projects/123/milestones/456"
  is_read: boolean
  created_at: string      // ISO datetime
  read_at: string | null  // ISO datetime or null
}
```

### API Contracts

**Endpoints used:**

1. `GET /notifications` — fetches list (already mocked from story 05-01)
   - Returns: `{ data: Notification[] }`
   - Called by polling in NotificationBell

2. `POST /notifications/:id/read` — marks single notification as read
   - Request body: none (or `{}`)
   - Response: `{ data: Notification }` (updated notification)
   - Status: 200 OK on success

3. `POST /notifications/read-all` — marks all notifications as read
   - Request body: none (or `{}`)
   - Response: `{ message: string }` or `{ data: Notification[] }`
   - Status: 200 OK on success

**Until endpoints are available:** Create mocks in `app/composables/__mocks__/useNotifications.ts`.

### i18n Requirements

Add keys to both `i18n/ar.json` and `i18n/en.json`:

```json
{
  "notif": {
    "drawer": {
      "title": "Notifications",
      "mark_all_read": "Mark all as read",
      "empty": "No notifications yet"
    }
  }
}
```

---

## 🏗️ Developer Context

### What This Story Does

Story 05-02 adds the **notification drawer UI** — a sliding sidebar that opens when the bell is clicked. It displays a scrollable list of notifications, allows marking individual notifications as read by clicking them, and provides a "mark all" button for bulk operations. This is the interface through which users interact with notifications and navigate to relevant pages (e.g., clicking a milestone report approval notification navigates to the milestone detail page).

### Files Affected

| File | Change | Why |
|------|--------|-----|
| `app/components/notifications/NotificationDrawer.vue` | CREATE | Drawer UI component |
| `app/components/layout/NotificationBell.vue` | UPDATE | Add click handler to open drawer |
| `app/composables/useNotifications.ts` | UPDATE | Add methods for reading notifications |
| `i18n/ar.json` | UPDATE | Add notification drawer i18n keys |
| `i18n/en.json` | UPDATE | Add notification drawer i18n keys |
| `app/components/notifications/NotificationDrawer.spec.ts` | CREATE | Component unit tests |
| `utils/formatters.ts` | UPDATE | Add `formatRelativeTime()` if not already present |

### Critical Context from Story 05-01

**The notification bell is already implemented and polling.**

Key facts:
- `NotificationBell.vue` exists and is mounted in `Topbar.vue`
- `useNotifications()` composable already has:
  - `unreadCount: Ref<number>` — updated every 30 seconds via polling
  - `startPolling()` / `stopPolling()` methods
  - `decrementUnreadCount()` method (called when marking as read)
- `visibilitychange` listener already pauses/resumes polling based on tab visibility
- Mock API for `GET /notifications` is in place

**What you inherit:**
- The bell already fetches notifications and updates the count
- The composable's polling mechanism is proven
- Type definitions for `Notification` exist
- i18n structure is established

### Component Architecture

**NotificationDrawer should be a controlled component:**

```vue
<script setup lang="ts">
const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [boolean]
  'notification-click': [notification: Notification]
}>()

const { notifications, markAsRead, markAllAsRead } = useNotifications()
</script>

<template>
  <Sheet :open="open" @update:open="emit('update:open', $event)">
    <!-- drawer content -->
  </Sheet>
</template>
```

**NotificationBell updates:**

```vue
<script setup lang="ts">
const drawerOpen = ref(false)

const handleBellClick = () => {
  drawerOpen.value = true
}
</script>

<template>
  <button @click="handleBellClick">
    <!-- bell icon + badge -->
  </button>
  <NotificationDrawer :open="drawerOpen" @update:open="v => drawerOpen = v" />
</template>
```

### State Management

**In `useNotifications()` composable, add:**

```typescript
const markAsRead = async (notificationId: string) => {
  // Find the notification
  const notification = notifications.value.find(n => n.id === notificationId)
  if (!notification) return

  // Optimistic update
  notification.is_read = true
  unreadCount.value = Math.max(0, unreadCount.value - 1)

  // API call (fire-and-forget acceptable)
  try {
    await useApi(`/notifications/${notificationId}/read`, { method: 'POST' })
  } catch (error) {
    // No rollback needed per story 05-03
    notify.error(t('errors.mark_read_failed'))
  }
}

const markAllAsRead = async () => {
  // Optimistic update
  notifications.value.forEach(n => n.is_read = true)
  unreadCount.value = 0

  // API call (fire-and-forget acceptable)
  try {
    await useApi('/notifications/read-all', { method: 'POST' })
  } catch (error) {
    // No rollback needed
    notify.error(t('errors.mark_all_read_failed'))
  }
}
```

### Relative Time Formatting

**If `formatRelativeTime()` doesn't exist in `utils/formatters.ts`, add it:**

```typescript
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return date.toLocaleDateString()
}
```

(Or use a library like `date-fns` if already installed.)

### Design System Integration

**Styling precedent from epic 05:**

- **Unread background:** `bg-primary-50/40` — NOT solid primary, but a very light tint with 40% opacity
- **Border color:** Consistently `border-border` throughout
- **Text colors:** Use semantic tokens: `text-ink` (body), `text-muted-foreground` (secondary), `text-destructive` (alerts)
- **Hover effects:** `hover:bg-muted/50` for interactive rows (not a link color change)

**Verify in design-spec.md §5.3 for exact color definitions.**

### Browser Testing

Before marking done:

1. **Drawer opens/closes:**
   - Click bell → drawer slides in from right (LTR) or left (RTL)
   - Click outside → drawer closes
   - Press `Esc` → drawer closes

2. **Item interactions:**
   - Click item → mark as read (dot disappears), navigate to link
   - Background changes from light primary to white

3. **Mark all:**
   - Click "Mark all" → all items lose dots, backgrounds turn white, button hides

4. **Empty state:**
   - When notifications are empty, verify EmptyState renders
   - Text is centered and clearly visible

5. **Scrolling:**
   - Add 10+ notifications in mock data
   - Verify scrolling works, header stays visible (if sticky)

6. **RTL verification:**
   - Switch language to Arabic
   - Drawer opens from **left** (inline-end)
   - Dot positioned on left (start-side in RTL)
   - Mark all button on right (end-side in RTL)
   - Text flows RTL naturally

---

## 📌 Previous Story Learnings (Story 05-01)

### What Worked Well

- **Polling with document.hidden check** — robust, no edge cases discovered
- **Logical CSS properties (`-end-1`, not `-right-1`)** — RTL just works, no override hacks needed
- **Manual `setInterval` approach** — cleaner than useAsyncData for this use case
- **Pinia store for unreadCount** — updates propagate automatically to all components

### Potential Gotchas

- **Badge over-renders if not guarded:** Make sure to use `v-if="unreadCount > 0"` to hide badge entirely, not just `opacity-0`
- **Cleanup on unmount is critical:** Test that polling stops when component unmounts (DevTools > Performance > leave page and check for lingering timers)
- **Mock data structure:** The mock returns `{ data: Notification[] }`, not just `Notification[]`. Make sure to unwrap it in the composable.

### Code Patterns to Follow

From 05-01 implementation:

```typescript
// Always use Math.max guard when decrementing
unreadCount.value = Math.max(0, unreadCount.value - 1)

// Always remove listeners on unmount
onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})

// Always use useApi wrapper, never direct $fetch
const { data } = await useApi('/notifications')
```

---

## 🔌 Composable Methods Required

**Add to `useNotifications()`:**

### markAsRead(notificationId: string)
- Finds notification by ID in `notifications` array
- Sets `is_read = true` optimistically
- Decrements `unreadCount`
- Calls `POST /notifications/:id/read`
- Fire-and-forget (no rollback)

### markAllAsRead()
- Sets all items in `notifications` array to `is_read = true`
- Sets `unreadCount = 0`
- Calls `POST /notifications/read-all`
- Fire-and-forget (no rollback)

### notifications: Ref<Notification[]>
- Already exposed (fetched by polling)
- Drawer reads this directly

---

## 🎨 Design System Tokens

From `docs/design-spec.md`:

| Token | Usage | Value |
|-------|-------|-------|
| `bg-primary-50` | Unread item background (light tint) | OKLCH light primary |
| `border-border` | Divider lines | CSS variable |
| `text-ink` | Strong text | Primary text color |
| `text-muted-foreground` | Secondary text | Neutral secondary |
| `bg-destructive` | Alert backgrounds (not used in drawer, but in badge from bell) | Red/destructive |

---

## ✨ Success Criteria Checklist

### Implementation
- [ ] `NotificationDrawer.vue` created with all sub-elements
- [ ] Click bell opens drawer, click outside closes
- [ ] List sorted newest-first
- [ ] Unread items have dot + light background
- [ ] Read items have white background, no dot
- [ ] Clicking item marks as read + navigates
- [ ] "Mark all" button marks all + hides
- [ ] Empty state renders when list is empty
- [ ] Drawer scrolls when needed

### Quality
- [ ] RTL fully verified (Arabic language test)
- [ ] LTR verified (English language test)
- [ ] All hardcoded text uses i18n
- [ ] Logical CSS properties only
- [ ] No console errors or warnings
- [ ] TypeScript: no `any`, no type errors
- [ ] Composable `markAsRead()` / `markAllAsRead()` methods added
- [ ] `formatRelativeTime()` utility added or verified
- [ ] Unit tests for drawer interactions
- [ ] Manual browser test: all interactions work

### API Integration
- [ ] `POST /notifications/:id/read` endpoint wired
- [ ] `POST /notifications/read-all` endpoint wired
- [ ] Mocks created for missing endpoints
- [ ] Update `docs/api-contracts.md` when endpoints available

### Handoff
- [ ] Sprint status updated to `review`
- [ ] Story marked complete in sprint-status.yaml
- [ ] No dead code or TODO comments left

---

## 📚 Reference Files

- **Story 05-01:** `_bmad-output/implementation-artifacts/05-01-notification-bell-and-unread-count.md`
- **Epic 05:** `_bmad-output/planning-artifacts/epic-05-notifications.md`
- **Design spec (notification UI):** `docs/design-spec.md` §4.3 (bell), §5.3 (drawer)
- **Design spec (EmptyState):** `docs/design-spec.md` §5.6
- **Composable reference:** `app/composables/useNotifications.ts`
- **shadcn-vue Sheet docs:** Check installed component in `app/components/ui/sheet/`

---

**Created:** 2026-05-09  
**Ready for:** Developer implementation (dev-story)  
**Next story:** 05-03 (Mark notification as read) — depends on this being complete
