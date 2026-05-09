import {
  getDisplayNameForRole,
  getHomePageForRole,
  getNavigationForRole,
  isAdminRole,
} from '~/utils/roleRoutes'

export const useRoleRoutes = () => ({
  getHomePageForRole,
  getNavigationForRole,
  getDisplayNameForRole,
  isAdminRole,
})
