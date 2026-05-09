export const usePermission = () => {
  const auth = useAuthStore()

  const can = (action: string, allowedActions?: string[]): boolean => {
    const role = auth.user?.role

    if (!role) return false

    // API-driven: milestone/report allowed_actions from backend
    if (Array.isArray(allowedActions) && allowedActions.length > 0) {
      return allowedActions.includes(action)
    }

    // Permission matrix based on role
    const permissions: Record<string, string[]> = {
      super_admin: [
        'view_projects',
        'create_project',
        'edit_project',
        'delete_project',
        'create_milestone',
        'edit_milestone',
        'delete_milestone',
        'approve_milestone',
        'manage_team_assignment',
        'view_proposals',
        'manage_proposal_status',
        'view_payment_status',
        'release_payment',
        'view_admin_panel',
        'view_admin_projects',
        'assign_engineers',
      ],
      admin: [
        'view_projects',
        'create_milestone',
        'edit_milestone',
        'delete_milestone',
        'approve_milestone',
        'manage_team_assignment',
        'view_proposals',
        'manage_proposal_status',
        'view_payment_status',
        'release_payment',
        'view_admin_panel',
        'view_admin_projects',
        'assign_engineers',
      ],
      client: [
        'view_projects',
        'create_project',
        'view_proposals',
        'select_contractor',
        'approve_milestone',
        'pay_milestone',
        'view_payment_status',
      ],
      contractor: [
        'view_projects',
        'create_milestone',
        'submit_proposal',
        'submit_report',
        'view_payment_status',
      ],
      field_engineer: ['view_projects', 'submit_report'],
      supervisor_engineer: [
        'view_projects',
        'approve_milestone',
        'reject_milestone',
        'review_milestone',
        'submit_report',
      ],
    }

    const rolePermissions = permissions[role] || []
    return rolePermissions.includes(action)
  }

  return {
    can,
  }
}
