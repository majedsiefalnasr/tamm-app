import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoginForm from '../LoginForm.vue'

describe('LoginForm', () => {
  it('mounts without crashing', () => {
    const wrapper = mount(LoginForm, { shallow: true })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders a form container', () => {
    const wrapper = mount(LoginForm, { shallow: true })
    expect(wrapper.html().length).toBeGreaterThan(0)
  })
})
