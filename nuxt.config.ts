// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  future: { compatibilityVersion: 4 }, // enables app/ directory
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    'shadcn-nuxt',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
  ],

  vite: {
    optimizeDeps: {
      include: ['@vueuse/core'],
    },
  },

  css: ['@/assets/css/main.css', '@/assets/css/tailwind.css'],

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
