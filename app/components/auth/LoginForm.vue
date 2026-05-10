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

function getFetchErrorStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) return undefined
  if (!('statusCode' in error)) return undefined
  const code = (error as { statusCode?: unknown }).statusCode
  return typeof code === 'number' ? code : undefined
}

const onSubmit = handleSubmit(async formValues => {
  serverError.value = null
  try {
    await auth.login(formValues.email, formValues.password)
  } catch (error: unknown) {
    if (getFetchErrorStatus(error) === 401) {
      serverError.value = t('auth.invalidCredentials')
    } else {
      serverError.value = t('auth.connectionError')
    }
  }
})
</script>

<template>
  <Card class="border-border/60 bg-card/95 shadow-sm backdrop-blur-sm">
    <CardHeader class="text-center">
      <CardTitle class="text-2xl">
        {{ t('auth.loginTitle') }}
      </CardTitle>
      <CardDescription class="text-sm text-balance">
        {{ t('auth.loginSubtitle') }}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <form class="flex flex-col gap-6" @submit="onSubmit">
        <FieldGroup>
          <Field>
            <FieldLabel for="email">
              {{ t('auth.email') }}
            </FieldLabel>
            <Input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              :placeholder="t('auth.emailPlaceholder')"
              :aria-invalid="!!emailError"
              :disabled="isSubmitting"
            />
            <FieldError v-if="emailError">
              {{ emailError }}
            </FieldError>
          </Field>

          <Field>
            <div class="flex w-full items-center gap-2">
              <FieldLabel for="password" class="flex-1">
                {{ t('auth.password') }}
              </FieldLabel>
              <NuxtLink
                to="/forgot-password"
                class="text-muted-foreground ms-auto text-sm underline-offset-4 hover:underline"
              >
                {{ t('auth.forgotPassword') }}
              </NuxtLink>
            </div>
            <div class="relative w-full">
              <Input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                :placeholder="t('auth.passwordPlaceholder')"
                :aria-invalid="!!passwordError || !!serverError"
                class="pe-10"
                :disabled="isSubmitting"
              />
              <button
                type="button"
                class="text-muted-foreground hover:text-foreground absolute inset-e-3 top-1/2 -translate-y-1/2 transition-colors"
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
            <FieldError v-if="passwordError">
              {{ passwordError }}
            </FieldError>
            <FieldError v-if="serverError">
              {{ serverError }}
            </FieldError>
          </Field>

          <Field>
            <Button type="submit" class="w-full" :disabled="isSubmitting">
              <span v-if="!isSubmitting">{{ t('auth.login') }}</span>
              <span v-else>{{ t('auth.loggingIn') }}</span>
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </CardContent>
  </Card>
</template>
