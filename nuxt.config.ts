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
   * Loads Cairo/Tajawal for Arabic (default locale) and Inter when locale is English.
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
    resolve: {
      dedupe: ['vue'],
    },
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
    /** Resolved under module `restructureDir` (`i18n/`) → `i18n/locales/*.json` */
    langDir: 'locales',
    locales: [
      { code: 'en', dir: 'ltr', file: 'en.json' },
      { code: 'ar', dir: 'rtl', file: 'ar.json' },
    ],
    defaultLocale: 'ar',
    /** Same URLs for all locales; cookie `i18n_locale` overrides for returning users. */
    strategy: 'no_prefix',
    /** Cookie-only persistence is handled in `i18n/localeDetector.ts` + `i18n-locale-cookie.client.ts`. */
    detectBrowserLanguage: false,
    experimental: {
      /** SSR locale from `i18n_locale` cookie only (no Accept-Language). */
      localeDetector: 'localeDetector.ts',
    },
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
