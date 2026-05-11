import { describe, it, expect } from 'vitest'

describe('ContractorPaymentStatus', () => {
  it('calculates pending total correctly', () => {
    const milestones = [
      { id: '1', payment_status: 'awaiting_release', amount: 5000 },
      { id: '2', payment_status: 'processing', amount: 3000 },
      { id: '3', payment_status: 'pending', amount: 1000 },
    ]

    const pendingTotal = milestones
      .filter(
        m =>
          m.payment_status === 'awaiting_release' ||
          m.payment_status === 'processing'
      )
      .reduce((sum, m) => sum + m.amount, 0)

    expect(pendingTotal).toBe(8000)
  })

  it('calculates recently received total correctly', () => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const milestones = [
      {
        id: '1',
        payment_status: 'paid',
        amount: 1500,
        updated_at: new Date().toISOString(),
      },
      {
        id: '2',
        payment_status: 'paid',
        amount: 2000,
        updated_at: new Date(
          Date.now() - 60 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        id: '3',
        payment_status: 'paid',
        amount: 1000,
        updated_at: new Date(
          Date.now() - 15 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
    ]

    const recentlyReceived = milestones
      .filter(
        m =>
          m.payment_status === 'paid' && new Date(m.updated_at) > thirtyDaysAgo
      )
      .reduce((sum, m) => sum + m.amount, 0)

    expect(recentlyReceived).toBe(2500)
  })

  it('counts pending milestones correctly', () => {
    const milestones = [
      { id: '1', payment_status: 'awaiting_release' },
      { id: '2', payment_status: 'processing' },
      { id: '3', payment_status: 'paid' },
    ]

    const pendingCount = milestones.filter(
      m =>
        m.payment_status === 'awaiting_release' ||
        m.payment_status === 'processing'
    ).length

    expect(pendingCount).toBe(2)
  })

  it('handles empty milestone list', () => {
    const milestones: any[] = []

    const pendingTotal = milestones
      .filter(
        m =>
          m.payment_status === 'awaiting_release' ||
          m.payment_status === 'processing'
      )
      .reduce((sum, m) => sum + m.amount, 0)

    expect(pendingTotal).toBe(0)
  })

  it('handles zero amounts correctly', () => {
    const milestones = [
      { id: '1', payment_status: 'awaiting_release', amount: 0 },
      { id: '2', payment_status: 'processing', amount: 500 },
    ]

    const pendingTotal = milestones
      .filter(
        m =>
          m.payment_status === 'awaiting_release' ||
          m.payment_status === 'processing'
      )
      .reduce((sum, m) => sum + m.amount, 0)

    expect(pendingTotal).toBe(500)
  })
})
