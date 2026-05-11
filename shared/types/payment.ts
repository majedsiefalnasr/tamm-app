export type WithdrawalStatus =
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'processing'
  | 'completed'
  | 'rejected'
  | 'cancelled'

export type PaymentEntityId = number

export interface BankAccountDetails {
  bank_name: string
  account_holder: string
  iban: string
  swift_code: string
}

export interface Withdrawal {
  id: PaymentEntityId
  contractor_id: PaymentEntityId
  amount: number
  bank_account_details: BankAccountDetails
  notes: string | null
  status: WithdrawalStatus
  requested_at?: string
  approved_at: string | null
  paid_at?: string | null
  completed_at?: string | null
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
