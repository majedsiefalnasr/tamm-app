import type { Component } from 'vue'
import {
  BriefcaseIcon,
  BuildingOffice2Icon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
  DocumentTextIcon,
  FolderIcon,
  ListBulletIcon,
  PlusIcon,
  QueueListIcon,
  ShieldCheckIcon,
  Squares2X2Icon,
  UserPlusIcon,
  UserGroupIcon,
  UsersIcon,
  WalletIcon,
  Cog6ToothIcon,
} from '@heroicons/vue/24/outline'

const iconMap: Record<string, Component> = {
  LayoutDashboard: Squares2X2Icon,
  Folder: FolderIcon,
  ClipboardList: ClipboardDocumentListIcon,
  CreditCard: CreditCardIcon,
  MessageSquare: ChatBubbleLeftRightIcon,
  Settings: Cog6ToothIcon,
  Briefcase: BriefcaseIcon,
  Wallet: WalletIcon,
  Building2: BuildingOffice2Icon,
  ClipboardCheck: ClipboardDocumentCheckIcon,
  Users: UsersIcon,
  ShieldCheck: ShieldCheckIcon,
  FileText: DocumentTextIcon,
  UserPlus: UserPlusIcon,
  UserGroup: UserGroupIcon,
  ListBullet: ListBulletIcon,
  Plus: PlusIcon,
  QueueList: QueueListIcon,
  ChartBar: ChartBarIcon,
}

export function getNavIcon(name: string): Component {
  return iconMap[name] ?? Squares2X2Icon
}
