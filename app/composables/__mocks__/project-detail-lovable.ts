import type {
  ProjectDetailActivityItem,
  ProjectDetailFieldReportItem,
  ProjectDetailScheduleItem,
} from '#shared/types/projectDetailLovable'

/** TODO: replace mock — GET /projects/:id/activity, field-reports, schedule when contracts exist. */

export const MOCK_PROJECT_DETAIL_CLIENT_CONTACT = {
  email: 'ahmad.shami@example.com',
  phone: '+967 777 123 456',
} as const

export const MOCK_PROJECT_DETAIL_ACTIVITIES: ProjectDetailActivityItem[] = [
  {
    id: 'a1',
    titleKey: 'offer_submitted',
    date: '2026-02-20',
    tone: 'orange',
    icon: 'file-text',
    actorKey: 'contractor',
  },
  {
    id: 'a2',
    titleKey: 'client_payment',
    date: '2026-02-25',
    tone: 'blue',
    icon: 'banknote',
    actorKey: 'client',
  },
  {
    id: 'a3',
    titleKey: 'payment_verified',
    date: '2026-02-26',
    tone: 'green',
    icon: 'check',
    actorKey: 'platform',
  },
  {
    id: 'a4',
    titleKey: 'engineer_assigned',
    date: '2026-02-27',
    tone: 'purple',
    icon: 'user',
    actorKey: 'supervisor_engineer',
  },
  {
    id: 'a5',
    titleKey: 'execution_started',
    date: '2026-02-28',
    tone: 'orange',
    icon: 'link',
    actorKey: 'site_team',
  },
  {
    id: 'a6',
    titleKey: 'foundations_done',
    date: '2026-03-27',
    tone: 'green',
    icon: 'check',
    actorKey: 'field_engineer',
  },
  {
    id: 'a7',
    titleKey: 'structure_done',
    date: '2026-04-26',
    tone: 'green',
    icon: 'check',
    actorKey: 'field_engineer',
  },
]

export const MOCK_PROJECT_DETAIL_FIELD_REPORTS: ProjectDetailFieldReportItem[] =
  [
    {
      id: 'r1',
      titleKey: 'report_floor',
      date: '2026-04-22',
      statusKey: 'approved',
    },
    {
      id: 'r2',
      titleKey: 'report_structure',
      date: '2026-04-18',
      statusKey: 'pending',
    },
    {
      id: 'r3',
      titleKey: 'report_foundations',
      date: '2026-03-25',
      statusKey: 'approved',
    },
  ]

export const MOCK_PROJECT_DETAIL_SCHEDULE: ProjectDetailScheduleItem[] = [
  { id: 's1', titleKey: 'milestone_foundations', statusKey: 'completed' },
  { id: 's2', titleKey: 'milestone_structure', statusKey: 'completed' },
  { id: 's3', titleKey: 'milestone_brickwork', statusKey: 'in_progress' },
]
