// Single source of truth for role-to-route mapping
export const getHomePageForRole = (role: string): string => {
  const roleHomeMap: Record<string, string> = {
    client: '/projects',
    contractor: '/projects',
    field_engineer: '/assignments',
    supervisor_engineer: '/reviews',
    admin: '/admin/dashboard',
    super_admin: '/admin/dashboard',
  }
  return roleHomeMap[role] ?? '/projects'
}

export const isAdminRole = (role: string): boolean => {
  return ['admin', 'super_admin'].includes(role)
}

export const getDisplayNameForRole = (role: string): string => {
  // Used for i18n display
  const roleNameMap: Record<string, string> = {
    client: 'roles.client',
    contractor: 'roles.contractor',
    field_engineer: 'roles.field_engineer',
    supervisor_engineer: 'roles.supervisor_engineer',
    admin: 'roles.admin',
    super_admin: 'roles.super_admin',
  }
  return roleNameMap[role] ?? 'roles.unknown'
}
