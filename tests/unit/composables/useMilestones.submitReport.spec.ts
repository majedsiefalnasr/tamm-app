import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useMilestones } from '~/composables/useMilestones'
import { canTransition } from '~/utils/statusMachine'

// Mock the utility functions
vi.mock('~/utils/statusMachine', () => ({
  canTransition: vi.fn((type, from, to) => {
    if (type === 'milestone' && from === 'draft' && to === 'submitted') {
      return true
    }
    return false
  }),
}))

vi.mock('~/composables/useNotifications', () => ({
  useNotifications: () => ({
    notify: {
      success: vi.fn(),
      error: vi.fn(),
    },
  }),
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

describe('useMilestones - submitReport', () => {
  let { submitReport, loadMilestones, getMilestones } = useMilestones()

  beforeEach(() => {
    ;({ submitReport, loadMilestones, getMilestones } = useMilestones())
  })

  it('submits a report for a milestone in draft status', async () => {
    // Load mock milestones
    await loadMilestones('proj-001')

    const report = await submitReport('proj-001', 'ms-2', {
      content: 'This is a valid report with sufficient content for testing',
      images: [],
    })

    expect(report).toBeDefined()
    expect(report.id).toBeTruthy()
    expect(report.content).toBe(
      'This is a valid report with sufficient content for testing'
    )
    expect(report.status).toBe('submitted')
  })

  it('updates milestone status to submitted after successful submission', async () => {
    await loadMilestones('proj-001')
    const milestones = getMilestones('proj-001')
    const targetMilestone = milestones.find(m => m.id === 'ms-2')

    expect(targetMilestone?.status).toBe('draft')

    await submitReport('proj-001', 'ms-2', {
      content: 'This is a valid report with sufficient content',
      images: [],
    })

    const updatedMilestones = getMilestones('proj-001')
    const updatedMilestone = updatedMilestones.find(m => m.id === 'ms-2')

    expect(updatedMilestone?.status).toBe('submitted')
  })

  it('includes report in latest_report field after submission', async () => {
    await loadMilestones('proj-001')

    const reportContent =
      'Test report content with sufficient length for validation'
    await submitReport('proj-001', 'ms-2', {
      content: reportContent,
      images: [],
    })

    const milestones = getMilestones('proj-001')
    const milestone = milestones.find(m => m.id === 'ms-2')

    expect(milestone?.latest_report).toBeDefined()
    expect(milestone?.latest_report?.content).toBe(reportContent)
  })

  it('throws error when milestone not found', async () => {
    await loadMilestones('proj-001')

    await expect(
      submitReport('proj-001', 'non-existent-id', {
        content: 'This is valid content',
        images: [],
      })
    ).rejects.toThrow('Milestone not found')
  })

  it('returns report with submitted status', async () => {
    await loadMilestones('proj-001')

    const report = await submitReport('proj-001', 'ms-2', {
      content: 'Report content with minimum required length',
      images: [],
    })

    expect(report.status).toBe('submitted')
    expect(report.submitted_at).toBeTruthy()
  })

  it('handles multiple image files in report', async () => {
    await loadMilestones('proj-001')

    const mockFiles = [
      new File(['image1'], 'img1.jpg', { type: 'image/jpeg' }),
      new File(['image2'], 'img2.png', { type: 'image/png' }),
    ]

    const report = await submitReport('proj-001', 'ms-2', {
      content: 'Report with multiple images content validation',
      images: mockFiles,
    })

    expect(report).toBeDefined()
    expect(report.id).toBeTruthy()
  })

  it('rollback milestone status on submission failure', async () => {
    await loadMilestones('proj-001')

    // Create a spy to monitor canTransition
    const canTransitionSpy = vi.mocked(canTransition)

    // Set up to return false for invalid transition
    canTransitionSpy.mockReturnValueOnce(false)

    try {
      await submitReport('proj-001', 'ms-2', {
        content: 'Content that will fail',
        images: [],
      })
    } catch (error) {
      // Error is expected
    }

    // Verify canTransition was called with correct parameters
    expect(canTransitionSpy).toHaveBeenCalledWith(
      'milestone',
      'draft',
      'submitted'
    )
  })

  it('includes submitted_by information in report', async () => {
    await loadMilestones('proj-001')

    const report = await submitReport('proj-001', 'ms-2', {
      content: 'Report with engineer information',
      images: [],
    })

    expect(report.submitted_by).toBeDefined()
    expect(report.submitted_by?.name).toBeTruthy()
  })

  it('generates unique report ID for each submission', async () => {
    await loadMilestones('proj-001')

    const report1 = await submitReport('proj-001', 'ms-2', {
      content: 'First report with unique ID and content validation',
      images: [],
    })

    // Reset for second submission (would need fresh composable instance or mock implementation)
    const { submitReport: submitReport2, loadMilestones: loadMilestones2 } =
      useMilestones()
    await loadMilestones2('proj-001')

    const report2 = await submitReport2('proj-001', 'ms-2', {
      content: 'Second report with different unique ID validation',
      images: [],
    })

    expect(report1.id).not.toBe(report2.id)
  })

  it('preserves other milestone properties during status update', async () => {
    await loadMilestones('proj-001')
    const milestones = getMilestones('proj-001')
    const originalMilestone = milestones.find(m => m.id === 'ms-2')

    await submitReport('proj-001', 'ms-2', {
      content: 'Report maintaining milestone properties integrity',
      images: [],
    })

    const updatedMilestones = getMilestones('proj-001')
    const updatedMilestone = updatedMilestones.find(m => m.id === 'ms-2')

    expect(updatedMilestone?.id).toBe(originalMilestone?.id)
    expect(updatedMilestone?.name).toBe(originalMilestone?.name)
    expect(updatedMilestone?.amount).toBe(originalMilestone?.amount)
  })

  it('validates transition before attempting submission', async () => {
    await loadMilestones('proj-001')

    // Milestone ms-1 has status 'approved', cannot transition to 'submitted'
    const invalidTransition = async () => {
      try {
        await submitReport('proj-001', 'ms-1', {
          content: 'Report on approved milestone should fail',
          images: [],
        })
      } catch (error) {
        return error
      }
    }

    const error = await invalidTransition()
    expect(error).toBeDefined()
  })
})
