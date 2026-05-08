export default defineNuxtRouteMiddleware(async (to, from) => {
  const auth = useAuthStore()

  // Initialize auth state if not already done
  if (!auth.user && auth.token) {
    await auth.init()
  }

  // Redirect authenticated users away from login to their role-based home
  if (auth.isAuthenticated && to.path === '/login') {
    const { getHomePageForRole } = useRoleRoutes()
    const homePage = getHomePageForRole(auth.user?.role ?? 'client')
    return navigateTo(homePage)
  }

  // Allow access to public routes (login, forgot-password, etc.)
  const publicRoutes = ['/login', '/forgot-password', '/reset-password']
  if (publicRoutes.some(route => to.path.startsWith(route))) {
    return
  }

  // Require authentication for protected routes
  if (!auth.isAuthenticated) {
    return navigateTo('/login')
  }

  // Check role-based access
  const requiredRoles = to.meta.roles as string[] | undefined
  if (requiredRoles && !requiredRoles.includes(auth.user?.role ?? '')) {
    return navigateTo('/403')
  }
})
