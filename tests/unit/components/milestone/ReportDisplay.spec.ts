import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ReportDisplay from '~/components/milestone/ReportDisplay.vue'
import type { Report } from '~/shared/types/project'
import { createI18n } from 'vue-i18n'

const i18n = createI18n({
  locale: 'en',
  messages: {
    en: {
      milestone: {
        report: {
          submittedAt: 'Submitted At',
          submittedBy: 'Submitted By',
          content: 'Content',
          images: 'Images',
          status: {
            draft: 'Draft',
            submitted: 'Submitted',
            approved: 'Approved',
            rejected: 'Rejected',
          },
        },
      },
    },
  },
})

describe('ReportDisplay Component', () => {
  let mockReport: Report

  beforeEach(() => {
    mockReport = {
      id: 'report-1',
      milestone_id: 'ms-1',
      content: 'Work is progressing well. All tasks completed on schedule.',
      images: [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
      ],
      status: 'submitted',
      submitted_at: '2026-05-08T10:00:00Z',
      submitted_by: {
        id: 'eng-1',
        name: 'Ahmed Hassan',
      },
    }
  })

  it('should render report content', () => {
    const wrapper = mount(ReportDisplay, {
      props: { report: mockReport },
      global: { plugins: [i18n] },
    })

    expect(wrapper.text()).toContain('Work is progressing well')
  })

  it('should render submission date', () => {
    const wrapper = mount(ReportDisplay, {
      props: { report: mockReport },
      global: { plugins: [i18n] },
    })

    expect(wrapper.text()).toMatch(
      /Submitted At|milestone\.report\.submittedAt/
    )
  })

  it('should render submitter name', () => {
    const wrapper = mount(ReportDisplay, {
      props: { report: mockReport },
      global: { plugins: [i18n] },
    })

    expect(wrapper.text()).toContain('Ahmed Hassan')
  })

  it('should render report status badge', () => {
    const wrapper = mount(ReportDisplay, {
      props: { report: mockReport },
      global: { plugins: [i18n] },
    })

    expect(wrapper.text()).toMatch(
      /Submitted|milestone\.report\.status\.submitted/
    )
  })

  it('should render all images in grid', () => {
    const wrapper = mount(ReportDisplay, {
      props: { report: mockReport },
      global: { plugins: [i18n] },
    })

    const images = wrapper.findAll('img')
    expect(images.length).toBe(2)
  })

  it('should display image count', () => {
    const wrapper = mount(ReportDisplay, {
      props: { report: mockReport },
      global: { plugins: [i18n] },
    })

    expect(wrapper.text()).toContain('(2)')
  })

  it('should handle draft status', () => {
    const draftReport = { ...mockReport, status: 'draft' }
    const wrapper = mount(ReportDisplay, {
      props: { report: draftReport },
      global: { plugins: [i18n] },
    })

    expect(wrapper.text()).toMatch(/Draft|milestone\.report\.status\.draft/)
  })

  it('should handle approved status', () => {
    const approvedReport = { ...mockReport, status: 'approved' }
    const wrapper = mount(ReportDisplay, {
      props: { report: approvedReport },
      global: { plugins: [i18n] },
    })

    expect(wrapper.text()).toMatch(
      /Approved|milestone\.report\.status\.approved/
    )
  })

  it('should handle rejected status', () => {
    const rejectedReport = { ...mockReport, status: 'rejected' }
    const wrapper = mount(ReportDisplay, {
      props: { report: rejectedReport },
      global: { plugins: [i18n] },
    })

    expect(wrapper.text()).toMatch(
      /Rejected|milestone\.report\.status\.rejected/
    )
  })

  it('should handle report without images', () => {
    const noImageReport = { ...mockReport, images: [] }
    const wrapper = mount(ReportDisplay, {
      props: { report: noImageReport },
      global: { plugins: [i18n] },
    })

    const images = wrapper.findAll('img')
    expect(images.length).toBe(0)
  })

  it('should handle report without submitter', () => {
    const noSubmitterReport = { ...mockReport, submitted_by: undefined }
    const wrapper = mount(ReportDisplay, {
      props: { report: noSubmitterReport },
      global: { plugins: [i18n] },
    })

    expect(wrapper.text()).not.toContain('Ahmed Hassan')
  })
})
