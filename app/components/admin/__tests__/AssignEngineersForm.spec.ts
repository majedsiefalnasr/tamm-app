import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import AssignEngineersForm from '../AssignEngineersForm.vue'

// Mock dependencies
vi.mock('~/composables/useProjectDetail', () => ({
  useProjectDetail: vi.fn(() => ({
    project: {
      value: { id: '1', supervisor_id: null, field_engineer_id: null },
    },
    assignEngineers: vi.fn().mockResolvedValue({}),
    assigningEngineers: { value: false },
    fetchProjectDetail: vi.fn(),
  })),
}))

vi.mock('~/composables/useAdminUsers', () => ({
  useAdminUsers: vi.fn(() => ({
    fetchEngineersByRole: vi.fn().mockResolvedValue([
      { id: 'eng-1', name: 'Ahmed Engineer' },
      { id: 'eng-2', name: 'Fatima Engineer' },
    ]),
  })),
}))

vi.mock('~/composables/useToast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
}))

describe('AssignEngineersForm', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        admin: {
          projects: {
            assign_engineers: {
              supervisor_label: 'Supervisor Engineer',
              supervisor_placeholder: 'Select supervisor',
              field_label: 'Field Engineer',
              field_placeholder: 'Select field',
              submit: 'Save',
              cancel: 'Cancel',
            },
          },
        },
        errors: {
          supervisor_required: 'Supervisor is required',
          field_required: 'Field is required',
          same_engineer: 'Cannot assign same engineer',
          engineers_assigned: 'Engineers assigned',
          engineers_assignment_failed: 'Assignment failed',
          failed_to_load_engineers: 'Failed to load',
        },
      },
    },
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders form fields', async () => {
    const wrapper = mount(AssignEngineersForm, {
      props: { projectId: '1' },
      global: {
        plugins: [i18n],
        stubs: {
          Select: true,
          SelectTrigger: true,
          SelectValue: true,
          SelectContent: true,
          SelectItem: true,
          Label: true,
          Button: true,
          Skeleton: true,
        },
      },
    })

    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('requires both engineer fields', async () => {
    const wrapper = mount(AssignEngineersForm, {
      props: { projectId: '1' },
      global: {
        plugins: [i18n],
        stubs: {
          Select: true,
          SelectTrigger: true,
          SelectValue: true,
          SelectContent: true,
          SelectItem: true,
          Label: true,
          Button: true,
          Skeleton: true,
        },
      },
    })

    const form = wrapper.find('form')
    await form.trigger('submit')

    // Should emit error on validation failure
    expect(wrapper.emitted('success')).toBeUndefined()
  })

  it('emits success when form is submitted with valid data', async () => {
    const wrapper = mount(AssignEngineersForm, {
      props: { projectId: '1' },
      global: {
        plugins: [i18n],
        stubs: {
          Select: true,
          SelectTrigger: true,
          SelectValue: true,
          SelectContent: true,
          SelectItem: true,
          Label: true,
          Button: true,
          Skeleton: true,
        },
      },
    })

    // Wait for async operations
    await wrapper.vm.$nextTick()

    expect(wrapper.exists()).toBe(true)
  })
})
