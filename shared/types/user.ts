import { z } from 'zod'

export type Role =
  | 'super_admin'
  | 'admin'
  | 'client'
  | 'contractor'
  | 'field_engineer'
  | 'supervisor_engineer'

export interface User {
  id: string
  name: string
  email: string
  phone: string | null
  role: Role
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export const createUserSchema = z.object({
  name: z.string().min(1, 'الاسم مطلوب'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  role: z.enum([
    'admin',
    'client',
    'contractor',
    'field_engineer',
    'supervisor_engineer',
  ]),
  phone: z.string().optional().nullable(),
})

export type CreateUserPayload = z.infer<typeof createUserSchema>
