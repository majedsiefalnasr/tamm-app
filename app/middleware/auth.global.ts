/**
 * Requires authentication for every route except explicit public paths.
 * Enforces `meta.roles` the same way the legacy `auth` + `role` middleware did.
 */
export default defineNuxtRouteMiddleware(async to => {
  const auth = useAuthStore()

  if (!auth.user && auth.token) {
    await auth.init()
  }

  const publicRoutes = ['/login', '/forgot-password', '/reset-password']
  const isPublic = publicRoutes.some(route => to.path.startsWith(route))

  if (auth.isAuthenticated && isPublic) {
    return navigateTo('/dashboard')
  }

  if (!auth.isAuthenticated && !isPublic) {
    return navigateTo('/login')
  }

  const requiredRoles = to.meta.roles as string[] | undefined
  if (
    requiredRoles &&
    auth.isAuthenticated &&
    !requiredRoles.includes(auth.user?.role ?? '')
  ) {
    return navigateTo('/403')
  }
})
