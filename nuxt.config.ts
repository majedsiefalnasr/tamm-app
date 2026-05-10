// https://nuxt.com/docs/api/configuration/nuxt-config

/** Laravel/API origin for local dev proxies — not Python `http.server` (POST → 501). */
const devApiProxyTarget =
  process.env.NUXT_DEV_PROXY_TARGET || 'http://127.0.0.1:8000'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  future: { compatibilityVersion: 4 }, // enables app/ directory
  devtools: { enabled: true },

  /**
   * Fonts via `<link>` (non-blocking) instead of CSS `@import` so first paint isn’t delayed.
   * Matches default locale `ar` (Cairo/Tajawal) + Latin UI (Inter).
   */
  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Tajawal:wght@400;500;700&display=swap',
        },
      ],
    },
  },

  /** Node context (`nuxt.config.*`): enable `process.env` etc. (see `.nuxt/tsconfig.node.json`). */
  typescript: {
    nodeTsConfig: {
      compilerOptions: {
        types: ['node'],
      },
    },
  },

  modules: [
    '@nuxtjs/tailwindcss',
    'shadcn-nuxt',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
  ],

  vite: {
    optimizeDeps: {
      include: [
        '@vueuse/core',
        'vee-validate',
        '@vee-validate/zod',
        'zod',
        '@heroicons/vue/24/solid',
        'class-variance-authority',
        'reka-ui',
        'clsx',
        'tailwind-merge',
      ],
    },
    /** Client `$fetch('/api/...')` hits Vite in dev — forward POSTs to the backend. */
    server: {
      proxy: {
        '/api': {
          target: devApiProxyTarget,
          changeOrigin: true,
        },
      },
    },
  },

  css: ['@/assets/css/main.css', '@/assets/css/tailwind.css'],

  /** Dev-only: SSR / Nitro-side `/api/...` → Laravel (pairs with vite.server.proxy). */
  nitro: {
    devProxy: {
      '/api': {
        target: devApiProxyTarget,
        changeOrigin: true,
      },
    },
  },

  runtimeConfig: {
    public: {
      // Leave empty in local dev so requests use `/api/v1/...` on the Nuxt origin (Vite + Nitro dev proxies).
      // Set to your API origin when the browser must call the API directly (production or LAN); then configure Laravel CORS.
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '',
    },
  },

  i18n: {
    locales: [
      { code: 'ar', dir: 'rtl', file: 'ar.json' },
      { code: 'en', dir: 'ltr', file: 'en.json' },
    ],
    defaultLocale: 'ar',
  },

  shadcn: {
    /**
     * Prefix for all the imported component.
     * @default "Ui"
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * Will respect the Nuxt aliases.
     * @link https://nuxt.com/docs/api/nuxt-config#alias
     * @default "@/components/ui"
     */
    componentDir: '@/components/ui',
  },
})
