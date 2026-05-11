export type NotificationId = string
export type NotificationEntityId = number

export type NotificationData = {
  resource_type: string
  resource_id: NotificationEntityId
  action_url?: string
  actor_name?: string
}

export type Notification = {
  id: NotificationId
  user_id: NotificationEntityId
  type?: string
  title: string
  message: string
  data: NotificationData
  created_at: string
  read_at: string | null
}

export type NotificationResponse = {
  data: Notification[]
}
