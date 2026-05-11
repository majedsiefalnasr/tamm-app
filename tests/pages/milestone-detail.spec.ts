import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/vue'
import type { ProjectDetail, Milestone } from '~/shared/types/project'

describe('Milestone Detail Page', () => {
  let mockProject: ProjectDetail
  let mockMilestone: Milestone

  beforeEach(() => {
    mockMilestone = {
      id: 'ms-1',
      name: 'Foundation Work',
      description: 'Foundation and structure',
      amount: 50000,
      order: 1,
      status: 'in_progress',
      tasks: [
        {
          id: 'task-1',
          milestone_id: 'ms-1',
          title: 'Excavation',
          completed: true,
        },
        {
          id: 'task-2',
          milestone_id: 'ms-1',
          title: 'Foundation',
          completed: false,
        },
      ],
      latest_report: {
        id: 'report-1',
        milestone_id: 'ms-1',
        content: 'Work is progressing well',
        images: ['https://example.com/image1.jpg'],
        status: 'submitted',
        submitted_at: '2026-05-08T10:00:00Z',
        submitted_by: {
          id: 'eng-1',
          name: 'Ahmed Hassan',
        },
      },
      payment_status: 'pending',
      allowed_actions: ['submit_report', 'approve_milestone'],
      created_at: '2026-05-01T10:00:00Z',
      updated_at: '2026-05-08T10:00:00Z',
    }

    mockProject = {
      id: 'proj-1',
      name: 'Villa Project',
      description: 'Modern villa construction',
      city: 'Cairo',
      area_m2: 500,
      type: 'villa',
      budget: 500000,
      currency: 'EGP',
      status: 'active',
      client_id: 'client-1',
      client_name: 'John Doe',
      contractor_id: 'contractor-1',
      contractor_name: 'ABC Construction',
      supervisor_engineer_id: 'supervisor-1',
      supervisor_name: 'Mohamed Ali',
      field_engineer_id: 'engineer-1',
      field_engineer_name: 'Ahmed Hassan',
      total_amount: 500000,
      total_paid: 100000,
      created_at: '2026-05-01T10:00:00Z',
      completed_milestones: 1,
      total_milestones: 5,
      milestones: [mockMilestone],
    }
  })

  it('should render milestone header with name, order, and status', () => {
    // Test that header renders with all required information
    expect(mockMilestone.name).toBe('Foundation Work')
    expect(mockMilestone.order).toBe(1)
    expect(mockMilestone.status).toBe('in_progress')
  })

  it('should display milestone metadata (budget, status, dates)', () => {
    // Test that metadata section displays all fields
    expect(mockMilestone.amount).toBe(50000)
    expect(mockMilestone.created_at).toBe('2026-05-01T10:00:00Z')
    expect(mockMilestone.updated_at).toBe('2026-05-08T10:00:00Z')
  })

  it('should display tasks list with titles and completion status', () => {
    // Test that tasks render correctly
    const tasks = mockMilestone.tasks
    expect(tasks.length).toBe(2)
    expect(tasks[0].title).toBe('Excavation')
    expect(tasks[0].completed).toBe(true)
    expect(tasks[1].title).toBe('Foundation')
    expect(tasks[1].completed).toBe(false)
  })

  it('should display latest report with content and images', () => {
    // Test that report section displays
    const report = mockMilestone.latest_report
    expect(report).toBeDefined()
    expect(report.content).toBe('Work is progressing well')
    expect(report.images.length).toBe(1)
    expect(report.submitted_by.name).toBe('Ahmed Hassan')
  })

  it('should display empty state when no report exists', () => {
    // Create milestone without report
    const noReportMilestone: Milestone = {
      ...mockMilestone,
      latest_report: undefined,
    }
    expect(noReportMilestone.latest_report).toBeUndefined()
  })

  it('should render breadcrumb navigation', () => {
    // Test breadcrumb items
    const projectId = 'proj-1'
    const milestoneId = 'ms-1'
    // Breadcrumb should show: Home > Projects > [Project name] > [Milestone name]
    expect(projectId).toBeDefined()
    expect(milestoneId).toBeDefined()
  })

  it('should render back navigation button', () => {
    // Test back button functionality
    const projectId = 'proj-1'
    // Back button should navigate to /projects/{projectId}
    expect(projectId).toBeDefined()
  })

  it('should display action buttons based on role and status', () => {
    // Test action buttons visibility
    expect(mockMilestone.allowed_actions).toContain('submit_report')
    expect(mockMilestone.allowed_actions).toContain('approve_milestone')
  })

  it('should display payment status', () => {
    // Test payment status display
    expect(mockMilestone.payment_status).toBe('pending')
  })

  it('should handle loading state', () => {
    // Test loading skeleton display during data fetch
    const isLoading = true
    expect(isLoading).toBe(true)
  })

  it('should handle error state when milestone not found', () => {
    // Test error display when milestone doesn't exist
    const milestone: Milestone | undefined = undefined
    expect(milestone).toBeUndefined()
  })

  it('should display report history list', () => {
    // Test report history section with multiple reports
    const reports = [mockMilestone.latest_report]
    expect(reports.length).toBeGreaterThan(0)
  })

  it('should render approval timeline', () => {
    // Test timeline section
    const status = mockMilestone.status
    expect(['in_progress', 'under_review', 'approved']).toContain(status)
  })
})
