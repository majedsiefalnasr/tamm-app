/** Mock-only rows for project detail “Lovable” overview until APIs exist. */
export type ProjectDetailActivityTone = 'blue' | 'green' | 'purple' | 'orange'

export type ProjectDetailActivityIcon =
  | 'plus'
  | 'banknote'
  | 'check'
  | 'user'
  | 'file-text'
  | 'link'

export interface ProjectDetailActivityItem {
  id: string
  /** i18n key under projects.detailLovable.activity */
  titleKey: string
  date: string
  /** Timeline icon circle colors */
  tone: ProjectDetailActivityTone
  /** Lucide icon id (resolved in UI) */
  icon: ProjectDetailActivityIcon
  /** i18n key under projects.detailLovable.activity_actor */
  actorKey: string
}

export interface ProjectDetailFieldReportItem {
  id: string
  titleKey: string
  date: string
  /** report row status i18n under projects.detailLovable.reportStatus */
  statusKey: 'approved' | 'pending'
}

export interface ProjectDetailScheduleItem {
  id: string
  titleKey: string
  /** milestone-style status for badge */
  statusKey: 'completed' | 'in_progress'
}
