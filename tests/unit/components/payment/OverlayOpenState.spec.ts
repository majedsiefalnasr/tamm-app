import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PaymentConfirmDialog from '~/components/payment/PaymentConfirmDialog.vue'
import WithdrawalRequestDialog from '~/components/payment/WithdrawalRequestDialog.vue'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

const globalConfig = {
  stubs: {
    Dialog: {
      template:
        '<div><button data-testid="dialog-open" @click="$emit(\'update:open\', true)" /><button data-testid="dialog-close" @click="$emit(\'update:open\', false)" /><slot /></div>',
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
    Field: {
      template: '<div><slot /></div>',
    },
    FieldLabel: {
      template: '<label><slot /></label>',
    },
    FieldError: {
      template: '<p><slot /></p>',
    },
    Button: {
      template: '<button><slot /></button>',
    },
    Input: {
      template: '<input />',
    },
    Textarea: {
      template: '<textarea />',
    },
  },
  mocks: {
    $t: (key: string) => key,
  },
}

describe('Overlay open-state consistency', () => {
  it('PaymentConfirmDialog only emits close when dialog closes', async () => {
    const wrapper = mount(PaymentConfirmDialog, {
      props: {
        open: true,
        milestone: {
          id: 'm1',
          name: 'Milestone 1',
          amount: 1200,
        },
      },
      global: globalConfig,
    })

    await wrapper.get('[data-testid="dialog-open"]').trigger('click')

    expect(wrapper.emitted('close')).toBeUndefined()

    await wrapper.get('[data-testid="dialog-close"]').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('WithdrawalRequestDialog only emits close when dialog closes', async () => {
    const wrapper = mount(WithdrawalRequestDialog, {
      props: {
        open: true,
        availableBalance: 1500,
      },
      global: globalConfig,
    })

    await wrapper.get('[data-testid="dialog-open"]').trigger('click')

    expect(wrapper.emitted('close')).toBeUndefined()

    await wrapper.get('[data-testid="dialog-close"]').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})
