export type WithdrawalStatus =
  | 'pending'
  | 'approved'
  | 'withdrawable'
  | 'rejected'
  | 'paid'

export interface Withdrawal {
  id: string
  contractor_id: string
  amount: number
  iban: string
  notes: string | null
  status: WithdrawalStatus
  requested_at: string
  approved_at: string | null
  paid_at: string | null
  rejection_reason: string | null
  created_at: string
  updated_at: string
}

export interface ContractorBalance {
  earned: number
  locked: number
  available: number
}

export interface WithdrawalResponse {
  success: boolean
  data?: Withdrawal
  message?: string
  errors?: Record<string, string[]>
}

export interface WithdrawalsListResponse {
  success: boolean
  data: Withdrawal[]
  message?: string
}
