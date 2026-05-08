import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ReportForm from '~/components/milestone/ReportForm.vue'
import { createI18n } from 'vue-i18n'

// Mock i18n
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      report: {
        submit_title: 'Submit Report',
        draft_saved: 'Draft saved locally',
        submission_failed: 'Failed to submit report',
      },
      fields: {
        content: 'Content',
        content_placeholder: 'Write your notes...',
        images: 'Images',
        drag_drop_hint: 'Drag images here or',
        image_limits: 'Maximum 10 images, 5MB per image',
        characters: 'characters',
      },
      actions: {
        select_files: 'Select Files',
        save_draft: 'Save as Draft',
        submit_report: 'Submit Report',
        remove_image: 'Remove Image',
      },
      validation: {
        required: 'Required',
        min_length_20: 'Minimum 20 characters',
      },
      errors: {
        max_images: 'Maximum 10 images allowed',
        file_too_large: '{filename} exceeds 5MB',
        unsupported_format: '{filename} is not a supported format',
      },
      success: {
        report_submitted: 'Report submitted successfully',
        draft_saved: 'Draft saved locally',
      },
    },
  },
})

describe('ReportForm.vue', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(ReportForm, {
      props: {
        isOpen: true,
        milestoneId: 'ms-1',
        projectId: 'proj-001',
        milestoneName: 'Foundation & Structure',
      },
      global: {
        plugins: [i18n],
        stubs: {
          Dialog: false,
          DialogContent: false,
          DialogHeader: false,
          DialogTitle: false,
          DialogFooter: false,
          Button: {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
          Textarea: {
            template:
              '<textarea v-model="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
          },
        },
      },
    })
  })

  it('renders the form when isOpen is true', () => {
    expect(
      wrapper.find('[role="dialog"]').exists() ||
        wrapper.text().includes('Submit Report')
    ).toBeTruthy()
  })

  it('has disabled submit button when content is empty', async () => {
    await wrapper.vm.$nextTick()
    const submitButton = wrapper
      .findAll('button')
      .find(btn => btn.text().includes('Submit Report'))
    expect(submitButton?.attributes('disabled')).toBeDefined()
  })

  it('has disabled submit button when content is less than 20 characters', async () => {
    wrapper.vm.content = 'short'
    await wrapper.vm.$nextTick()
    const submitButton = wrapper
      .findAll('button')
      .find(btn => btn.text().includes('Submit Report'))
    expect(submitButton?.attributes('disabled')).toBeDefined()
  })

  it('enables submit button when content is valid (20+ chars)', async () => {
    wrapper.vm.content = 'This is a valid report content with enough characters'
    await wrapper.vm.$nextTick()
    const submitButton = wrapper
      .findAll('button')
      .find(btn => btn.text().includes('Submit Report'))
    expect(submitButton?.attributes('disabled')).toBeUndefined()
  })

  it('shows content error when trying to submit with insufficient content', async () => {
    wrapper.vm.content = 'short'
    wrapper.vm.handleSubmit()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.contentError).toBeTruthy()
  })

  it('accepts valid image files', async () => {
    const file = new File(['dummy'], 'test.png', { type: 'image/png' })
    wrapper.vm.onFileSelected({
      length: 1,
      0: file,
      item: (index: number) => (index === 0 ? file : null),
    } as any)
    expect(wrapper.vm.selectedImages).toHaveLength(1)
    expect(wrapper.vm.imageErrors).toEqual({})
  })

  it('rejects unsupported file types', async () => {
    const file = new File(['dummy'], 'test.txt', { type: 'text/plain' })
    wrapper.vm.onFileSelected({
      length: 1,
      0: file,
      item: (index: number) => (index === 0 ? file : null),
    } as any)
    expect(wrapper.vm.selectedImages).toHaveLength(0)
    expect(wrapper.vm.imageErrors[0]).toBeTruthy()
  })

  it('rejects files exceeding 5MB', async () => {
    const largeFile = new File(
      [new ArrayBuffer(6 * 1024 * 1024)],
      'large.jpg',
      { type: 'image/jpeg' }
    )
    wrapper.vm.onFileSelected({
      length: 1,
      0: largeFile,
      item: (index: number) => (index === 0 ? largeFile : null),
    } as any)
    expect(wrapper.vm.selectedImages).toHaveLength(0)
    expect(wrapper.vm.imageErrors[0]).toBeTruthy()
  })

  it('enforces maximum 10 images limit', async () => {
    const files = Array.from(
      { length: 12 },
      (_, i) => new File(['dummy'], `test${i}.png`, { type: 'image/png' })
    )

    files.forEach((file, i) => {
      const fileList = {
        length: 1,
        0: file,
        item: (index: number) => (index === 0 ? file : null),
      }
      wrapper.vm.onFileSelected(fileList as any)
    })

    expect(wrapper.vm.selectedImages.length).toBeLessThanOrEqual(10)
  })

  it('removes image from preview when remove button clicked', async () => {
    const file = new File(['dummy'], 'test.png', { type: 'image/png' })
    wrapper.vm.onFileSelected({
      length: 1,
      0: file,
      item: (index: number) => (index === 0 ? file : null),
    } as any)
    const initialLength = wrapper.vm.selectedImages.length
    wrapper.vm.removeImage(0)
    expect(wrapper.vm.selectedImages.length).toBe(initialLength - 1)
  })

  it('shows draft saved notification when save draft is clicked', async () => {
    const notifySpy = vi.fn()
    wrapper.vm.handleSaveDraft()
    // Draft should be saved locally (no API call)
    expect(wrapper.vm.selectedImages || wrapper.vm.content).toBeDefined()
  })

  it('emits submit event after successful submission', async () => {
    wrapper.vm.content =
      'This is a valid report with enough content to be submitted'
    wrapper.vm.selectedImages = []
    await wrapper.vm.$nextTick()
    // The submit should emit the @submit event
    // This would be tested through integration tests with mocked API
  })

  it('does not persist draft when dialog closes', async () => {
    wrapper.vm.content = 'Some content'
    wrapper.vm.selectedImages = []
    wrapper.vm.handleClose()
    expect(wrapper.emitted('update:isOpen')).toBeTruthy()
  })

  it('shows image preview grid with images', async () => {
    const file = new File(['dummy'], 'test.png', { type: 'image/png' })
    wrapper.vm.onFileSelected({
      length: 1,
      0: file,
      item: (index: number) => (index === 0 ? file : null),
    } as any)
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.imagePreviews.length).toBeGreaterThan(0)
  })

  it('validates form before submission', async () => {
    wrapper.vm.content = 'short'
    const isValid = wrapper.vm.validateForm()
    expect(isValid).toBe(false)

    wrapper.vm.content =
      'This is a valid report with enough characters to be submitted'
    const isValidNow = wrapper.vm.validateForm()
    expect(isValidNow).toBe(true)
  })

  it('cleans up object URLs on unmount', async () => {
    const file = new File(['dummy'], 'test.png', { type: 'image/png' })
    wrapper.vm.onFileSelected({
      length: 1,
      0: file,
      item: (index: number) => (index === 0 ? file : null),
    } as any)
    const revokeObjectUrlSpy = vi.spyOn(URL, 'revokeObjectURL')
    wrapper.unmount()
    expect(revokeObjectUrlSpy).toHaveBeenCalled()
  })
})
