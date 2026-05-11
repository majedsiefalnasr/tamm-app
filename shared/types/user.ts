import { z } from 'zod'

export type Role =
  | 'super_admin'
  | 'admin'
  | 'client'
  | 'contractor'
  | 'field_engineer'
  | 'supervisor_engineer'

export type EntityId = number

export interface User {
  id: EntityId
  name: string
  email: string | null
  phone: string | null
  role: Role
  status: 'active' | 'suspended' | 'pending_verification' | 'banned'
  created_at: string
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
