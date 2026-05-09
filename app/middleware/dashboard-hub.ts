/**
 * `/dashboard` is the contractor overview hub.
 * Other roles are redirected to their role-specific dashboard URLs.
 */
export default defineNuxtRouteMiddleware(() => {
  const auth = useAuthStore()
  const { can } = usePermission()
  const role = auth.user?.role ?? ''

  if (can('view_contractor_dashboard')) {
    return
  }

  if (role === 'contractor') {
    return navigateTo('/403')
  }

  if (role === 'client') {
    return navigateTo('/dashboard/client')
  }

  if (role === 'field_engineer') {
    return navigateTo('/dashboard/field')
  }

  if (role === 'supervisor_engineer') {
    return navigateTo('/dashboard/supervisor')
  }

  if (role === 'admin' || role === 'super_admin') {
    return navigateTo('/admin/dashboard')
  }

  return navigateTo('/403')
})
