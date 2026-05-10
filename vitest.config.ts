import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    /** DOM needed for @vue/test-utils `mount()`; pure-node suites can use `// @vitest-environment node`. */
    environment: 'happy-dom',
    setupFiles: ['tests/setup/vitest.setup.ts'],
    include: [
      'app/**/*.spec.ts',
      'app/**/__tests__/**/*.spec.ts',
      'tests/unit/**/*.spec.ts',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.nuxt/**',
      '**/e2e/**',
      '**/tests/e2e/**',
      '**/tests/rtl/**',
      '**/tests/*.spec.ts',
    ],
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './app'),
      '@': path.resolve(__dirname, './app'),
      '~/i18n': path.resolve(__dirname, './i18n'),
      '~/shared': path.resolve(__dirname, './shared'),
      '#shared': path.resolve(__dirname, './shared'),
    },
  },
})
