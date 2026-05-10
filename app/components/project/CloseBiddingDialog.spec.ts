import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CloseBiddingDialog from './CloseBiddingDialog.vue'

const dialogStub = {
  template: '<div data-testid="close-bidding-dialog"><slot /></div>',
}

describe('CloseBiddingDialog', () => {
  beforeEach(() => {
    vi.stubGlobal('useI18n', () => ({
      t: (key: string) => key,
    }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders when isOpen is true', () => {
    const wrapper = mount(CloseBiddingDialog, {
      props: {
        projectId: 'proj-001',
        projectName: 'Test Project',
        proposalCount: 3,
        isOpen: true,
      },
      global: {
        stubs: {
          Dialog: dialogStub,
          DialogContent: { template: '<div><slot /></div>' },
          DialogHeader: { template: '<div><slot /></div>' },
          DialogTitle: { template: '<div><slot /></div>' },
          DialogFooter: { template: '<div><slot /></div>' },
          Button: { template: '<button><slot /></button>' },
        },
      },
    })

    expect(wrapper.find('[data-testid="close-bidding-dialog"]').exists()).toBe(
      true
    )
  })

  it('emits update:isOpen when cancel button is clicked', async () => {
    const wrapper = mount(CloseBiddingDialog, {
      props: {
        projectId: 'proj-001',
        projectName: 'Test Project',
        proposalCount: 3,
        isOpen: true,
      },
      global: {
        stubs: {
          Dialog: dialogStub,
          DialogContent: { template: '<div><slot /></div>' },
          DialogHeader: { template: '<div><slot /></div>' },
          DialogTitle: { template: '<div><slot /></div>' },
          DialogFooter: { template: '<div><slot /></div>' },
          Button: {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
        },
      },
    })

    const cancelButton = wrapper.findAll('button')[0]
    await cancelButton.trigger('click')

    expect(wrapper.emitted('update:isOpen')).toBeTruthy()
    expect(wrapper.emitted('update:isOpen')?.[0]).toEqual([false])
  })

  it('displays proposal count correctly', () => {
    const wrapper = mount(CloseBiddingDialog, {
      props: {
        projectId: 'proj-001',
        projectName: 'Test Project',
        proposalCount: 5,
        isOpen: true,
      },
      global: {
        stubs: {
          Dialog: dialogStub,
          DialogContent: { template: '<div><slot /></div>' },
          DialogHeader: { template: '<div><slot /></div>' },
          DialogTitle: { template: '<div><slot /></div>' },
          DialogFooter: { template: '<div><slot /></div>' },
          Button: { template: '<button><slot /></button>' },
        },
      },
    })

    expect(wrapper.text()).toContain('5')
  })

  it('emits confirmed when confirm button is clicked', async () => {
    const wrapper = mount(CloseBiddingDialog, {
      props: {
        projectId: 'proj-001',
        projectName: 'Test Project',
        proposalCount: 3,
        isOpen: true,
      },
      global: {
        stubs: {
          Dialog: { template: '<div><slot /></div>' },
          DialogContent: { template: '<div><slot /></div>' },
          DialogHeader: { template: '<div><slot /></div>' },
          DialogTitle: { template: '<div><slot /></div>' },
          DialogFooter: { template: '<div><slot /></div>' },
          Button: {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
        },
      },
    })

    const confirmButton = wrapper.findAll('button')[1]
    await confirmButton.trigger('click')

    expect(wrapper.emitted('confirmed')).toBeTruthy()
  })

  it('disables buttons and shows spinner when confirmPending is true', () => {
    const wrapper = mount(CloseBiddingDialog, {
      props: {
        projectId: 'proj-001',
        projectName: 'Test Project',
        proposalCount: 3,
        isOpen: true,
        confirmPending: true,
      },
      global: {
        stubs: {
          Dialog: { template: '<div><slot /></div>' },
          DialogContent: { template: '<div><slot /></div>' },
          DialogHeader: { template: '<div><slot /></div>' },
          DialogTitle: { template: '<div><slot /></div>' },
          DialogFooter: { template: '<div><slot /></div>' },
          Button: {
            template:
              '<button :disabled="disabled" data-role="btn"><slot /></button>',
            props: ['disabled'],
          },
        },
      },
    })

    const buttons = wrapper.findAll('[data-role="btn"]')
    expect(buttons.length).toBeGreaterThanOrEqual(2)
    expect(buttons.every(b => b.attributes('disabled') !== undefined)).toBe(
      true
    )
    expect(wrapper.find('svg').exists()).toBe(true)
  })
})
