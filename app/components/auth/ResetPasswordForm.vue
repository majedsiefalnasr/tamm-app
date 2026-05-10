<script setup lang="ts">
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/solid'
import { Button } from '~/components/ui/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'

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
  <Card class="border-border/60 bg-card/95 shadow-sm backdrop-blur-sm">
    <CardHeader class="text-center">
      <CardTitle class="text-2xl">
        {{ t('auth.resetPasswordTitle') }}
      </CardTitle>
      <CardDescription class="text-sm text-balance">
        {{ t('auth.resetPasswordHint') }}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <form class="flex flex-col gap-6" @submit="onSubmit">
        <FieldGroup>
          <div
            v-if="!token"
            class="border-destructive/30 bg-destructive/5 text-destructive rounded-xl border p-4 text-center text-sm"
            role="alert"
          >
            {{ t('auth.invalidResetToken') }}
          </div>

          <template v-else>
            <Field>
              <FieldLabel for="password">
                {{ t('auth.newPassword') }}
              </FieldLabel>
              <div class="relative w-full">
                <Input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  :placeholder="t('auth.passwordPlaceholder')"
                  :aria-invalid="!!passwordError || !!serverError"
                  class="pe-10"
                  :disabled="isSubmitting"
                />
                <button
                  type="button"
                  class="text-muted-foreground hover:text-foreground absolute inset-e-3 top-1/2 -translate-y-1/2 transition-colors"
                  :aria-label="
                    showPassword
                      ? t('auth.hidePassword')
                      : t('auth.showPassword')
                  "
                  :disabled="isSubmitting"
                  @click="showPassword = !showPassword"
                >
                  <EyeSlashIcon v-if="showPassword" class="h-5 w-5" />
                  <EyeIcon v-else class="h-5 w-5" />
                </button>
              </div>
              <FieldError v-if="passwordError">
                {{ passwordError }}
              </FieldError>
            </Field>

            <Field>
              <FieldLabel for="password_confirmation">
                {{ t('auth.confirmNewPassword') }}
              </FieldLabel>
              <div class="relative w-full">
                <Input
                  id="password_confirmation"
                  v-model="passwordConfirmation"
                  :type="showConfirm ? 'text' : 'password'"
                  autocomplete="new-password"
                  :placeholder="t('auth.passwordPlaceholder')"
                  :aria-invalid="!!confirmationError"
                  class="pe-10"
                  :disabled="isSubmitting"
                />
                <button
                  type="button"
                  class="text-muted-foreground hover:text-foreground absolute inset-e-3 top-1/2 -translate-y-1/2 transition-colors"
                  :aria-label="
                    showConfirm
                      ? t('auth.hidePassword')
                      : t('auth.showPassword')
                  "
                  :disabled="isSubmitting"
                  @click="showConfirm = !showConfirm"
                >
                  <EyeSlashIcon v-if="showConfirm" class="h-5 w-5" />
                  <EyeIcon v-else class="h-5 w-5" />
                </button>
              </div>
              <FieldError v-if="confirmationError">
                {{ confirmationError }}
              </FieldError>
              <FieldError v-if="serverError">
                {{ serverError }}
              </FieldError>
            </Field>

            <Field>
              <Button
                type="submit"
                class="w-full"
                :disabled="isSubmitting || !token"
              >
                <span v-if="!isSubmitting">{{
                  t('auth.resetPasswordSubmit')
                }}</span>
                <span v-else>{{ t('auth.resettingPassword') }}</span>
              </Button>
            </Field>
          </template>

          <div class="text-center">
            <NuxtLink
              to="/login"
              class="text-muted-foreground text-sm underline-offset-4 hover:underline"
            >
              {{ t('auth.backToLogin') }}
            </NuxtLink>
          </div>
        </FieldGroup>
      </form>
    </CardContent>
  </Card>
</template>
