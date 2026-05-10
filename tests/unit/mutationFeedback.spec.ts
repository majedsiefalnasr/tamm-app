import { describe, it, expect } from 'vitest'
import { milestoneMutationToastId } from '~/utils/mutationFeedback'

describe('milestoneMutationToastId', () => {
  it('builds stable ids per milestone', () => {
    expect(milestoneMutationToastId('pay', 'm-1')).toBe(
      'mutation:milestone:pay:m-1'
    )
  })
})
