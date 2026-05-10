<script setup lang="ts">
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/solid'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const token = computed(() => {
  const raw = route.query.token
  return typeof raw === 'string' ? raw : ''
})

const showPassword = ref(false)
const showConfirm = ref(false)

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, t('auth.passwordRequired'))
      .min(8, t('auth.passwordMinLength')),
    password_confirmation: z.string().min(1, t('auth.confirmPasswordRequired')),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.password_confirmation) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t('auth.passwordsMustMatch'),
        path: ['password_confirmation'],
      })
    }
  })

const { handleSubmit, isSubmitting } = useForm({
  validationSchema: toTypedSchema(resetPasswordSchema),
})

const { value: password, errorMessage: passwordError } =
  useField<string>('password')
const { value: passwordConfirmation, errorMessage: confirmationError } =
  useField<string>('password_confirmation')

const serverError = ref<string | null>(null)

const onSubmit = handleSubmit(async values => {
  serverError.value = null
  if (!token.value) {
    serverError.value = t('auth.invalidResetToken')
    return
  }
  try {
    const response = await useApi<{ message?: string }>(
      '/auth/reset-password',
      {
        method: 'POST',
        body: {
          token: token.value,
          password: values.password,
          password_confirmation: values.password_confirmation,
        },
      }
    )
    if (response.success) {
      await router.push('/login')
      return
    }
    serverError.value = response.error?.message ?? t('auth.resetPasswordFailed')
  } catch {
    serverError.value = t('auth.connectionError')
  }
})
</script>

<template>
  <div class="w-full max-w-md">
    <div
      class="border-border bg-card shadow-elevated rounded-3xl border p-8 md:p-10"
    >
      <div class="mb-8 flex justify-center">
        <img
          src="/logo.svg"
          alt="TAMM"
          width="160"
          height="40"
          class="h-12 w-auto"
        />
      </div>

      <h1 class="text-foreground mb-2 text-center text-xl font-bold">
        {{ t('auth.resetPasswordTitle') }}
      </h1>
      <p class="text-muted-foreground mb-6 text-center text-sm">
        {{ t('auth.resetPasswordHint') }}
      </p>

      <div
        v-if="!token"
        class="border-destructive/30 bg-destructive/5 text-destructive mb-6 rounded-xl border p-4 text-center text-sm"
        role="alert"
      >
        {{ t('auth.invalidResetToken') }}
      </div>

      <form v-else class="space-y-6" @submit="onSubmit">
        <div class="space-y-2">
          <Label for="password" class="text-start text-xs font-semibold">
            {{ t('auth.newPassword') }}
          </Label>
          <div class="relative">
            <Input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
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
        </div>

        <div class="space-y-2">
          <Label
            for="password_confirmation"
            class="text-start text-xs font-semibold"
          >
            {{ t('auth.confirmNewPassword') }}
          </Label>
          <div class="relative">
            <Input
              id="password_confirmation"
              v-model="passwordConfirmation"
              :type="showConfirm ? 'text' : 'password'"
              autocomplete="new-password"
              :placeholder="t('auth.passwordPlaceholder')"
              :aria-invalid="!!confirmationError"
              class="border-input rounded-xl border pe-10"
              :disabled="isSubmitting"
            />
            <button
              type="button"
              class="text-muted-foreground hover:text-foreground absolute end-3 top-1/2 -translate-y-1/2 transition-colors"
              :aria-label="
                showConfirm ? t('auth.hidePassword') : t('auth.showPassword')
              "
              :disabled="isSubmitting"
              @click="showConfirm = !showConfirm"
            >
              <EyeSlashIcon v-if="showConfirm" class="h-5 w-5" />
              <EyeIcon v-else class="h-5 w-5" />
            </button>
          </div>
          <p v-if="confirmationError" class="text-destructive mt-1 text-xs">
            {{ confirmationError }}
          </p>
          <p v-if="serverError" class="text-destructive mt-1 text-xs">
            {{ serverError }}
          </p>
        </div>

        <Button
          type="submit"
          :disabled="isSubmitting || !token"
          class="bg-primary text-primary-foreground shadow-cta w-full rounded-full px-6 py-3 text-sm font-bold transition-shadow hover:shadow-none"
        >
          <span v-if="!isSubmitting">{{ t('auth.resetPasswordSubmit') }}</span>
          <span v-else>{{ t('auth.resettingPassword') }}</span>
        </Button>
      </form>

      <div class="mt-6 text-center">
        <NuxtLink
          to="/login"
          class="text-muted-foreground hover:text-foreground text-sm transition-colors"
        >
          {{ t('auth.backToLogin') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
