// Mock withdrawal data for development
// TODO: Replace with actual POST /withdrawals and GET /withdrawals endpoints

import type { Withdrawal, ContractorBalance } from '~/shared/types/payment'

let withdrawalIdCounter = 1

const mockWithdrawals: Withdrawal[] = [
  {
    id: 'wd-001',
    contractor_id: 'ctr-123',
    amount: 50000,
    iban: 'SA1234567890123456',
    notes: 'Equipment purchase',
    status: 'pending',
    requested_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    approved_at: null,
    paid_at: null,
    rejection_reason: null,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export const mockFetchWithdrawals = async (): Promise<Withdrawal[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500))
  return mockWithdrawals
}

export const mockSubmitWithdrawalRequest = async (
  amount: number,
  iban: string,
  notes?: string
): Promise<Withdrawal> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800))

  const newWithdrawal: Withdrawal = {
    id: `wd-${String(withdrawalIdCounter++).padStart(3, '0')}`,
    contractor_id: 'ctr-123', // Would come from auth in real app
    amount,
    iban,
    notes: notes || null,
    status: 'pending',
    requested_at: new Date().toISOString(),
    approved_at: null,
    paid_at: null,
    rejection_reason: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  mockWithdrawals.unshift(newWithdrawal)
  return newWithdrawal
}

export const mockGetContractorBalance = (
  milestones: any[]
): ContractorBalance => {
  // Calculate from mock milestones
  const earned = milestones
    .filter(m => ['paid_out', 'ready_for_payout'].includes(m.payment_status))
    .reduce((sum, m) => sum + (m.amount || 0), 0)

  const locked = mockWithdrawals
    .filter(w => ['pending', 'approved'].includes(w.status))
    .reduce((sum, w) => sum + w.amount, 0)

  const available = Math.max(0, earned - locked)

  return { earned, locked, available }
}

export const mockGetWithdrawalCountdown = (approvedAt: string): number => {
  const now = Date.now()
  const approvedTime = new Date(approvedAt).getTime()
  const threeDaysMs = 3 * 24 * 60 * 60 * 1000
  const endTime = approvedTime + threeDaysMs
  const daysRemaining = Math.ceil((endTime - now) / (24 * 60 * 60 * 1000))
  return Math.max(0, daysRemaining)
}
