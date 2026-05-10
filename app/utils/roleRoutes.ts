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
        href: '/dashboard',
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
        href: '/dashboard',
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
        href: '/dashboard',
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
        href: '/dashboard',
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
        href: '/dashboard',
      },
      {
        key: 'projects',
        label: 'nav.projects',
        icon: 'Building2',
        href: '/projects',
      },
      {
        key: 'payments',
        label: 'nav.payments',
        icon: 'CreditCard',
        href: '/payments',
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
      { key: 'users', label: 'nav.users', icon: 'Users', href: '/users' },
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
        href: '/dashboard',
      },
      {
        key: 'projects',
        label: 'nav.projects',
        icon: 'Building2',
        href: '/projects',
      },
      {
        key: 'payments',
        label: 'nav.payments',
        icon: 'CreditCard',
        href: '/payments',
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
      { key: 'users', label: 'nav.users', icon: 'Users', href: '/users' },
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
        href: '/system/flags',
        group: 'system',
      },
      {
        key: 'system-logs',
        label: 'nav.system_logs',
        icon: 'FileText',
        href: '/system/logs',
        group: 'system',
      },
    ],
  }
  return baseNav[role] ?? []
}

export const getHomePageForRole = (_role: string): string => {
  return '/dashboard'
}

export const isAdminRole = (role: string): boolean => {
  return ['admin', 'super_admin'].includes(role)
}

export const getDisplayNameForRole = (role: string): string => {
  /** Leaf keys — locales nest labels under `roles.<role>.label`. */
  const roleNameMap: Record<string, string> = {
    client: 'roles.client.label',
    contractor: 'roles.contractor.label',
    field_engineer: 'roles.field_engineer.label',
    supervisor_engineer: 'roles.supervisor_engineer.label',
    admin: 'roles.admin.label',
    super_admin: 'roles.super_admin.label',
  }
  return roleNameMap[role] ?? 'roles.unknown.label'
}
