export type Notification = {
  id: string
  user_id: string
  title: string
  body: string
  link: string
  is_read: boolean
  created_at: string
  read_at: string | null
}

export type NotificationResponse = {
  data: Notification[]
}
