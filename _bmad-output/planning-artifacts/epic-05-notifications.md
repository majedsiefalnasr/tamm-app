# Epic 05 — In-App Notifications

> **BMAD context:** In-app notifications only in MVP. No email, SMS, or push.
> Notifications are triggered by milestone and payment events — see `docs/status-flows.md §6`.
> Read `docs/coding-standards.md §12` for the polling implementation.

---

## Design reference

> Full spec: `docs/design-spec.md` — read §4.3 (topbar bell), §5.3 (Pill/badge).

### Notification bell (Story 05-01)

Located in the topbar, end side:

```
relative inline-flex h-10 w-10 items-center justify-center
rounded-full border border-border bg-background
text-foreground hover:border-primary hover:text-primary transition
```

Unread badge — positioned `absolute -top-1 -end-1` (logical, RTL-safe):
```
h-5 min-w-5 rounded-full bg-destructive
text-[9px] font-bold text-destructive-foreground
flex items-center justify-center px-1
```
Shows count, or `+99` when over 99. Hidden entirely when count is 0.

### Notification drawer (Story 05-02)

Use shadcn-vue `Sheet` with `side="end"` (opens from the inline-end — left in RTL, right in LTR).
- Header: `text-lg font-extrabold text-ink` title + "تعليم الكل كمقروء" ghost button (end-aligned)
- Width: `w-[380px] md:w-[420px]`

**Notification item:**
```
relative flex items-start gap-3 px-4 py-3 transition
hover:bg-muted/50 cursor-pointer
border-b border-border last:border-0
```
- Unread dot: `h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5` (hidden if read)
- Title: `text-sm font-semibold text-ink`
- Body: `text-xs text-muted-foreground mt-0.5 line-clamp-2`
- Time: `text-[10px] text-muted-foreground mt-1`
- Unread item background: `bg-primary-soft/40`

**Empty state:** centered illustration + "لا توجد إشعارات بعد" (`text-sm text-muted-foreground`).

### RTL notes

- `Sheet` with `side="end"` opens from the left in RTL (inline-end = left)
- Unread dot: `mt-1.5 shrink-0` — positional, no directional class needed
- Time text: `text-start` — reads naturally in RTL flow

---

## Epic goal

Every user is alerted to actions they need to take or events they should know about,
without needing to constantly refresh or navigate between pages.

---

## Stories

---

### Story 05-01 — Notification bell and unread count

**As a** logged-in user,
**I want to** see how many unread notifications I have at a glance,
**so that** I know when something needs my attention.

#### Acceptance criteria

- [ ] Bell icon in topbar, end side (start side in LTR)
- [ ] Red badge shows unread count when `unreadCount > 0`
- [ ] Badge disappears when `unreadCount === 0`
- [ ] Badge shows `99+` if count exceeds 99
- [ ] Count updates every 30 seconds via `useNotifications()` composable polling
- [ ] Polling pauses when tab is hidden (`document.hidden === true`)
- [ ] Polling resumes immediately when tab becomes active again
- [ ] Count updates immediately (optimistically) when a notification is marked read

---

### Story 05-02 — Notification drawer

**As a** user,
**I want to** open my notifications and see a list of recent events,
**so that** I can act on them quickly.

#### Acceptance criteria

- [ ] Clicking bell icon opens shadcn `Sheet` from the end side
- [ ] Sheet header: "Notifications" title + "Mark all as read" button (hidden if all read)
- [ ] List shows notifications sorted newest first
- [ ] Each item shows:
  - Unread indicator dot (colored, start side) — hidden if read
  - Notification title (font-medium)
  - Notification body (text-sm, text-neutral-500)
  - Relative time ("2m ago", "1h ago", "3d ago") — formatted
- [ ] Unread items have subtle background `bg-primary-50`
- [ ] Read items have `bg-white`
- [ ] Clicking an item → marks as read + navigates to `notification.link` + closes drawer
- [ ] "Mark all as read" → marks all unread as read, updates badge to 0
- [ ] Shows `EmptyState` ("No notifications yet") when list is empty
- [ ] Drawer closes on outside click or `Esc`
- [ ] Drawer is scrollable if list is long
- [ ] Full RTL layout verified

---

### Story 05-03 — Mark notification as read

**As a** user,
**I want** notifications to be marked as read when I interact with them,
**so that** my unread count stays accurate.

#### Acceptance criteria

- [ ] Clicking a notification item calls `POST /notifications/:id/read`
- [ ] Optimistic update: item immediately loses unread indicator, count decrements
- [ ] "Mark all" calls `POST /notifications/read-all`
- [ ] Optimistic update: all items lose unread indicator, count → 0
- [ ] No rollback needed on these actions (non-critical, fire-and-forget acceptable)

---

### Story 05-04 — Notification content per event

**As a** user,
**I want** notification messages to be clear and actionable,
**so that** I know exactly what happened and where to go.

#### Acceptance criteria

Each notification event produces a message following this format.
All strings use i18n keys. Links navigate to the correct page.

| Event | Title (i18n key) | Body | Link |
|---|---|---|---|
| Report submitted | `notif.report_submitted.title` | "[Milestone name] — [Project name]" | `/projects/:id/milestones/:mid` |
| Supervisor approved | `notif.supervisor_approved.title` | "[Milestone name] — awaiting your approval" | `/projects/:id/milestones/:mid` |
| Supervisor rejected | `notif.supervisor_rejected.title` | "[Milestone name] — [reason]" | `/projects/:id/milestones/:mid` |
| Client approved | `notif.client_approved.title` | "[Milestone name] — payment pending" | `/projects/:id/milestones/:mid` |
| Client rejected | `notif.client_rejected.title` | "[Milestone name] — [reason]" | `/projects/:id/milestones/:mid` |
| Payment released | `notif.payment_released.title` | "SAR [amount] released for [milestone]" | `/payments` |
| Project created | `notif.project_created.title` | "[Project name]" | `/projects/:id` |

- [ ] All title and body strings exist in both `ar.json` and `en.json`
- [ ] Interpolated values (milestone name, amount) work correctly in both locales
- [ ] Amount uses `formatCurrency()`

---

## Epic done when

- [ ] All 4 stories complete
- [ ] Polling tested: pauses on hidden tab, resumes on focus
- [ ] Unread count updates correctly after read/mark-all actions
- [ ] All notification types render with correct content
- [ ] Drawer RTL layout verified
- [ ] Mocks replaced as `GET /notifications`, `POST /notifications/:id/read`, `POST /notifications/read-all` become available
