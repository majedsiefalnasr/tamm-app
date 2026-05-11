# Story 11.07: Navigation dead-link and permission audit

Status: done

## Summary

- **Dead routes fixed**: Super Admin sidebar entries `system-flags` and `system-logs` pointed to missing pages → added `app/pages/system/flags.vue` and `app/pages/system/logs.vue` with `definePageMeta({ roles: ['super_admin'] })` so `auth.global` sends non–super-admin users to `/403`.
- **Field engineer parity**: `field_engineer` nav omitted **Assignments** while `/assignments` was a valid page → added `assignments` item to `app/utils/roleRoutes.ts` (`/assignments`, `nav.assignments`, `UserPlus` icon).
- **Route guard**: Existing global middleware continues to enforce `meta.roles` for all updated routes.

## Files touched

- `app/pages/system/flags.vue`, `app/pages/system/logs.vue`
- `app/utils/roleRoutes.ts`
