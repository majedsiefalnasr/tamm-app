import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    /** DOM needed for @vue/test-utils `mount()`; pure-node suites can use `// @vitest-environment node`. */
    environment: 'happy-dom',
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './app'),
      '@': path.resolve(__dirname, './app'),
    },
  },
})
