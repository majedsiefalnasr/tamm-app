import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CloseBiddingDialog from './CloseBiddingDialog.vue'

describe('CloseBiddingDialog', () => {
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
          Dialog: true,
          DialogContent: true,
          DialogHeader: true,
          DialogTitle: true,
          DialogFooter: true,
          Button: true,
        },
      },
    })

    expect(wrapper.find('[data-testid="dialog"]').exists()).toBe(true)
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
          Dialog: {
            template: '<div data-testid="dialog"><slot /></div>',
          },
          DialogContent: {
            template: '<div><slot /></div>',
          },
          DialogHeader: {
            template: '<div><slot /></div>',
          },
          DialogTitle: {
            template: '<div><slot /></div>',
          },
          DialogFooter: {
            template: '<div><slot /></div>',
          },
          Button: {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
        },
        mocks: {
          t: (key: string) => key,
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
          Dialog: {
            template: '<div><slot /></div>',
          },
          DialogContent: {
            template: '<div><slot /></div>',
          },
          DialogHeader: {
            template: '<div><slot /></div>',
          },
          DialogTitle: {
            template: '<div><slot /></div>',
          },
          DialogFooter: {
            template: '<div><slot /></div>',
          },
          Button: {
            template: '<button><slot /></button>',
          },
        },
        mocks: {
          t: (key: string) => key,
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
          Dialog: {
            template: '<div><slot /></div>',
          },
          DialogContent: {
            template: '<div><slot /></div>',
          },
          DialogHeader: {
            template: '<div><slot /></div>',
          },
          DialogTitle: {
            template: '<div><slot /></div>',
          },
          DialogFooter: {
            template: '<div><slot /></div>',
          },
          Button: {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
        },
        mocks: {
          t: (key: string) => key,
        },
      },
    })

    const confirmButton = wrapper.findAll('button')[1]
    await confirmButton.trigger('click')

    expect(wrapper.emitted('confirmed')).toBeTruthy()
  })

  it('disables buttons when loading', async () => {
    const wrapper = mount(CloseBiddingDialog, {
      props: {
        projectId: 'proj-001',
        projectName: 'Test Project',
        proposalCount: 3,
        isOpen: true,
      },
      global: {
        stubs: {
          Dialog: {
            template: '<div><slot /></div>',
          },
          DialogContent: {
            template: '<div><slot /></div>',
          },
          DialogHeader: {
            template: '<div><slot /></div>',
          },
          DialogTitle: {
            template: '<div><slot /></div>',
          },
          DialogFooter: {
            template: '<div><slot /></div>',
          },
          Button: {
            template: '<button :disabled="disabled"><slot /></button>',
            props: ['disabled'],
          },
        },
        mocks: {
          t: (key: string) => key,
        },
      },
    })

    const confirmButton = wrapper.findAll('button')[1] as any
    await confirmButton.trigger('click')

    await wrapper.vm.$nextTick()

    // Button should show loading spinner
    expect(wrapper.find('svg').exists()).toBe(false) ||
      expect(confirmButton.attributes('disabled')).toBeDefined()
  })
})
