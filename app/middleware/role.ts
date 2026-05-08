export default defineNuxtRouteMiddleware(to => {
  const auth = useAuthStore()

  // Get required roles from route meta
  const requiredRoles = to.meta.roles as string[] | undefined

  // If no roles specified, route is accessible to all authenticated users
  if (!requiredRoles) {
    return
  }

  // Check if user's role is in the required roles list
  const userRole = auth.user?.role ?? ''
  if (!requiredRoles.includes(userRole)) {
    // Redirect to 403 Forbidden page
    return navigateTo('/403')
  }
})
