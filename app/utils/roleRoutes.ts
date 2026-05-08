// Single source of truth for role-to-route mapping
export interface NavItem {
  key: string
  label: string
  icon: string
  href: string
  group?: string
  badge?: number
}

export const getNavigationForRole = (role: string): NavItem[] => {
  const baseNav: Record<string, NavItem[]> = {
    client: [
      {
        key: 'overview',
        label: 'nav.overview',
        icon: 'LayoutDashboard',
        href: '/dashboard/client',
      },
      {
        key: 'projects',
        label: 'nav.projects',
        icon: 'Folder',
        href: '/projects',
      },
      {
        key: 'reports',
        label: 'nav.reports',
        icon: 'ClipboardList',
        href: '/reports',
      },
      {
        key: 'payments',
        label: 'nav.payments',
        icon: 'CreditCard',
        href: '/payments',
      },
      {
        key: 'messages',
        label: 'nav.messages',
        icon: 'MessageSquare',
        href: '/messages',
      },
      {
        key: 'settings',
        label: 'nav.settings',
        icon: 'Settings',
        href: '/settings',
      },
    ],
    contractor: [
      {
        key: 'overview',
        label: 'nav.overview',
        icon: 'LayoutDashboard',
        href: '/dashboard/contractor',
      },
      {
        key: 'projects',
        label: 'nav.projects',
        icon: 'Briefcase',
        href: '/projects',
      },
      {
        key: 'reports',
        label: 'nav.reports',
        icon: 'ClipboardList',
        href: '/reports',
      },
      {
        key: 'messages',
        label: 'nav.messages',
        icon: 'MessageSquare',
        href: '/messages',
      },
      {
        key: 'withdrawals',
        label: 'nav.withdrawals',
        icon: 'Wallet',
        href: '/payments',
      },
      {
        key: 'settings',
        label: 'nav.settings',
        icon: 'Settings',
        href: '/settings',
      },
    ],
    field_engineer: [
      {
        key: 'overview',
        label: 'nav.overview',
        icon: 'LayoutDashboard',
        href: '/dashboard/field',
      },
      {
        key: 'projects',
        label: 'nav.projects',
        icon: 'Folder',
        href: '/projects',
      },
      {
        key: 'reports',
        label: 'nav.reports',
        icon: 'ClipboardList',
        href: '/reports',
      },
      {
        key: 'messages',
        label: 'nav.messages',
        icon: 'MessageSquare',
        href: '/messages',
      },
      {
        key: 'settings',
        label: 'nav.settings',
        icon: 'Settings',
        href: '/settings',
      },
    ],
    supervisor_engineer: [
      {
        key: 'overview',
        label: 'nav.overview',
        icon: 'LayoutDashboard',
        href: '/dashboard/supervisor',
      },
      {
        key: 'projects',
        label: 'nav.projects',
        icon: 'Building2',
        href: '/projects',
      },
      {
        key: 'reports',
        label: 'nav.reports',
        icon: 'ClipboardList',
        href: '/reports',
      },
      {
        key: 'approvals',
        label: 'nav.approvals',
        icon: 'ClipboardCheck',
        href: '/reviews',
      },
      {
        key: 'messages',
        label: 'nav.messages',
        icon: 'MessageSquare',
        href: '/messages',
      },
      {
        key: 'settings',
        label: 'nav.settings',
        icon: 'Settings',
        href: '/settings',
      },
    ],
    admin: [
      {
        key: 'overview',
        label: 'nav.overview',
        icon: 'LayoutDashboard',
        href: '/admin/dashboard',
      },
      {
        key: 'projects',
        label: 'nav.projects',
        icon: 'Building2',
        href: '/admin/projects',
      },
      {
        key: 'payments',
        label: 'nav.payments',
        icon: 'CreditCard',
        href: '/admin/payments',
      },
      {
        key: 'reports',
        label: 'nav.reports',
        icon: 'ClipboardList',
        href: '/admin/reports',
      },
      {
        key: 'messages',
        label: 'nav.messages',
        icon: 'MessageSquare',
        href: '/messages',
      },
      { key: 'users', label: 'nav.users', icon: 'Users', href: '/admin/users' },
      {
        key: 'settings',
        label: 'nav.settings',
        icon: 'Settings',
        href: '/settings',
        group: 'other',
      },
    ],
    super_admin: [
      {
        key: 'overview',
        label: 'nav.overview',
        icon: 'LayoutDashboard',
        href: '/admin/dashboard',
      },
      {
        key: 'projects',
        label: 'nav.projects',
        icon: 'Building2',
        href: '/admin/projects',
      },
      {
        key: 'payments',
        label: 'nav.payments',
        icon: 'CreditCard',
        href: '/admin/payments',
      },
      {
        key: 'reports',
        label: 'nav.reports',
        icon: 'ClipboardList',
        href: '/admin/reports',
      },
      {
        key: 'messages',
        label: 'nav.messages',
        icon: 'MessageSquare',
        href: '/messages',
      },
      { key: 'users', label: 'nav.users', icon: 'Users', href: '/admin/users' },
      {
        key: 'settings',
        label: 'nav.settings',
        icon: 'Settings',
        href: '/settings',
        group: 'other',
      },
      {
        key: 'system-flags',
        label: 'nav.system_flags',
        icon: 'ShieldCheck',
        href: '/admin/system/flags',
        group: 'system',
      },
      {
        key: 'system-logs',
        label: 'nav.system_logs',
        icon: 'FileText',
        href: '/admin/system/logs',
        group: 'system',
      },
    ],
  }
  return baseNav[role] ?? []
}

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
