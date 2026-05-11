import { useI18n } from 'vue-i18n'
import type { Notification } from '~/shared/types/notification'

export function getMockNotifications(): Notification[] {
  const { t } = useI18n()

  const baseTime = new Date('2026-05-09T10:00:00Z').getTime()

  return [
    {
      id: 'notif-1',
      user_id: 123,
      title: t('notif.events.report_submitted.title'),
      message: 'Foundation Work — Shopping Mall Project',
      data: {
        resource_type: 'milestones',
        resource_id: 1,
        action_url: '/projects/proj-001/milestones/m-001',
        actor_name: 'System',
      },
      created_at: new Date(baseTime - 2 * 60 * 1000).toISOString(),
      read_at: null,
    },
    {
      id: 'notif-2',
      user_id: 123,
      title: t('notif.events.review_approved.title'),
      message: 'Electrical Work — awaiting your approval',
      data: {
        resource_type: 'milestones',
        resource_id: 2,
        action_url: '/projects/proj-001/milestones/m-002',
        actor_name: 'System',
      },
      created_at: new Date(baseTime - 1 * 60 * 60 * 1000).toISOString(),
      read_at: null,
    },
    {
      id: 'notif-3',
      user_id: 123,
      title: t('notif.events.supervisor_rejected.title'),
      message: 'Plumbing Work — Quality standards not met. Please resubmit.',
      data: {
        resource_type: 'milestones',
        resource_id: 3,
        action_url: '/projects/proj-002/milestones/m-003',
        actor_name: 'System',
      },
      created_at: new Date(baseTime - 3 * 60 * 60 * 1000).toISOString(),
      read_at: null,
    },
    {
      id: 'notif-4',
      user_id: 123,
      title: t('notif.events.client_approved.title'),
      message: 'Structural Framework — payment pending',
      data: {
        resource_type: 'milestones',
        resource_id: 4,
        action_url: '/projects/proj-001/milestones/m-004',
        actor_name: 'System',
      },
      created_at: new Date(baseTime - 6 * 60 * 60 * 1000).toISOString(),
      read_at: new Date(baseTime - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif-5',
      user_id: 123,
      title: t('notif.events.client_rejected.title'),
      message:
        'Roof Installation — Alignment issues detected. Please review and adjust.',
      data: {
        resource_type: 'milestones',
        resource_id: 5,
        action_url: '/projects/proj-003/milestones/m-005',
        actor_name: 'System',
      },
      created_at: new Date(baseTime - 12 * 60 * 60 * 1000).toISOString(),
      read_at: new Date(baseTime - 11 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif-6',
      user_id: 123,
      title: t('notif.events.payment_released.title'),
      message: 'SAR 125,000 released for Concrete Pouring',
      data: {
        resource_type: 'payments',
        resource_id: 6,
        action_url: '/payments',
        actor_name: 'System',
      },
      created_at: new Date(baseTime - 1 * 24 * 60 * 60 * 1000).toISOString(),
      read_at: new Date(baseTime - 23 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif-7',
      user_id: 123,
      title: t('notif.events.project_created.title'),
      message: 'Downtown Commercial Center',
      data: {
        resource_type: 'projects',
        resource_id: 7,
        action_url: '/projects/proj-004',
        actor_name: 'System',
      },
      created_at: new Date(baseTime - 3 * 24 * 60 * 60 * 1000).toISOString(),
      read_at: new Date(baseTime - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]
}

export const mockNotifications: Notification[] = []
