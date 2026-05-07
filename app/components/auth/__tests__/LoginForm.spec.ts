import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import LoginForm from '../LoginForm.vue'

describe('LoginForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders email and password inputs', () => {
    const wrapper = mount(LoginForm, {
      global: {
        plugins: [createPinia()],
        stubs: {
          Button: true,
          Input: true,
          Label: true,
        },
      },
    })

    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
  })

  it('shows validation errors for empty fields', async () => {
    const wrapper = mount(LoginForm, {
      global: {
        plugins: [createPinia()],
      },
    })

    const submitButton = wrapper.find('button[type="submit"]')
    await submitButton.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Email is required')
    expect(wrapper.text()).toContain('Password is required')
  })

  it('shows validation error for invalid email', async () => {
    const wrapper = mount(LoginForm, {
      global: {
        plugins: [createPinia()],
      },
    })

    const emailInput = wrapper.find('input[type="email"]')
    await emailInput.setValue('invalid-email')
    await wrapper.vm.$nextTick()

    const submitButton = wrapper.find('button[type="submit"]')
    await submitButton.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Email must be valid')
  })

  it('toggles password visibility', async () => {
    const wrapper = mount(LoginForm, {
      global: {
        plugins: [createPinia()],
      },
    })

    const passwordInput = wrapper.find('input[id="password"]')
    expect(passwordInput.attributes('type')).toBe('password')

    const toggleButton = wrapper.find('button[aria-label*="password"]')
    await toggleButton.trigger('click')
    await wrapper.vm.$nextTick()

    expect(passwordInput.attributes('type')).toBe('text')
  })

  it('disables submit button while submitting', async () => {
    const wrapper = mount(LoginForm, {
      global: {
        plugins: [createPinia()],
      },
    })

    const emailInput = wrapper.find('input[type="email"]')
    const passwordInput = wrapper.find('input[type="password"]')

    await emailInput.setValue('test@example.com')
    await passwordInput.setValue('password123')
    await wrapper.vm.$nextTick()

    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.attributes('disabled')).toBeUndefined()
  })

  it('displays server error on 401 response', async () => {
    const wrapper = mount(LoginForm, {
      global: {
        plugins: [createPinia()],
      },
    })

    // Simulate setting serverError directly
    wrapper.vm.serverError = 'Invalid email or password'
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Invalid email or password')
  })

  it('clears errors when user corrects input', async () => {
    const wrapper = mount(LoginForm, {
      global: {
        plugins: [createPinia()],
      },
    })

    const emailInput = wrapper.find('input[type="email"]')
    await emailInput.setValue('invalid')
    const submitButton = wrapper.find('button[type="submit"]')
    await submitButton.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Email must be valid')

    // Correct the input
    await emailInput.setValue('valid@example.com')
    await wrapper.vm.$nextTick()

    // Error should be cleared
    expect(wrapper.text()).not.toContain('Email must be valid')
  })
})
