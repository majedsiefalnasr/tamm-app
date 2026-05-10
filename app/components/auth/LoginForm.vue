<script setup lang="ts">
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/solid'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()

const showPassword = ref(false)

const loginSchema = z.object({
  email: z
    .string()
    .min(1, t('auth.emailRequired'))
    .email(t('auth.emailInvalid')),
  password: z.string().min(1, t('auth.passwordRequired')),
})

const { handleSubmit, isSubmitting } = useForm({
  validationSchema: toTypedSchema(loginSchema),
})

const { value: email, errorMessage: emailError } = useField('email')
const { value: password, errorMessage: passwordError } = useField('password')
const serverError = ref<string | null>(null)

const onSubmit = handleSubmit(async formValues => {
  serverError.value = null
  try {
    await auth.login(formValues.email, formValues.password)
    await router.push('/dashboard')
  } catch (error: any) {
    if (error.statusCode === 401) {
      serverError.value = t('auth.invalidCredentials')
    } else {
      serverError.value = t('auth.connectionError')
    }
  }
})
</script>

<template>
  <div class="w-full max-w-md">
    <div
      class="border-border bg-card shadow-elevated rounded-3xl border p-8 md:p-10"
    >
      <!-- Logo -->
      <div class="mb-8 flex justify-center">
        <img
          src="/logo.svg"
          alt="TAMM"
          width="160"
          height="40"
          class="h-12 w-auto"
        />
      </div>

      <!-- Form -->
      <form class="space-y-6" @submit="onSubmit">
        <!-- Email Field -->
        <div class="space-y-2">
          <Label for="email" class="text-start text-xs font-semibold">
            {{ t('auth.email') }}
          </Label>
          <Input
            id="email"
            v-model="email"
            type="email"
            :placeholder="t('auth.emailPlaceholder')"
            :aria-invalid="!!emailError"
            class="border-input rounded-xl border"
            :disabled="isSubmitting"
          />
          <p v-if="emailError" class="text-destructive mt-1 text-xs">
            {{ emailError }}
          </p>
        </div>

        <!-- Password Field -->
        <div class="space-y-2">
          <Label for="password" class="text-start text-xs font-semibold">
            {{ t('auth.password') }}
          </Label>
          <div class="relative">
            <Input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              :placeholder="t('auth.passwordPlaceholder')"
              :aria-invalid="!!passwordError || !!serverError"
              class="border-input rounded-xl border pe-10"
              :disabled="isSubmitting"
            />
            <button
              type="button"
              class="text-muted-foreground hover:text-foreground absolute end-3 top-1/2 -translate-y-1/2 transition-colors"
              :aria-label="
                showPassword ? t('auth.hidePassword') : t('auth.showPassword')
              "
              :disabled="isSubmitting"
              @click="showPassword = !showPassword"
            >
              <EyeSlashIcon v-if="showPassword" class="h-5 w-5" />
              <EyeIcon v-else class="h-5 w-5" />
            </button>
          </div>
          <p v-if="passwordError" class="text-destructive mt-1 text-xs">
            {{ passwordError }}
          </p>
          <p v-if="serverError" class="text-destructive mt-1 text-xs">
            {{ serverError }}
          </p>
        </div>

        <!-- Submit Button -->
        <Button
          type="submit"
          :disabled="isSubmitting"
          class="bg-primary text-primary-foreground shadow-cta w-full rounded-full px-6 py-3 text-sm font-bold transition-shadow hover:shadow-none"
        >
          <span v-if="!isSubmitting">
            {{ t('auth.login') }}
          </span>
          <span v-else>
            {{ t('auth.loggingIn') }}
          </span>
        </Button>
      </form>

      <!-- Forgot Password Link -->
      <div class="mt-6 text-center">
        <NuxtLink
          to="/forgot-password"
          class="text-muted-foreground hover:text-foreground text-sm transition-colors"
        >
          {{ t('auth.forgotPassword') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
