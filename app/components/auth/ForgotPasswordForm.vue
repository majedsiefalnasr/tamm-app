<script setup lang="ts">
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '~/components/ui/field'
import { Input } from '~/components/ui/input'

const { t } = useI18n()

const forgotSchema = z.object({
  identifier: z
    .string()
    .min(1, t('auth.emailRequired'))
    .email(t('auth.emailInvalid')),
})

const { handleSubmit, isSubmitting } = useForm({
  validationSchema: toTypedSchema(forgotSchema),
})

const { value: identifier, errorMessage: identifierError } =
  useField<string>('identifier')

const serverError = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const onSubmit = handleSubmit(async values => {
  serverError.value = null
  successMessage.value = null
  try {
    const response = await useApi<{ message?: string }>(
      '/auth/forgot-password',
      {
        method: 'POST',
        body: { identifier: values.identifier },
      }
    )
    if (response.success) {
      successMessage.value =
        response.data?.message ?? t('auth.resetLinkSentGeneric')
    } else {
      serverError.value =
        response.error?.message ?? t('auth.resetRequestFailed')
    }
  } catch {
    serverError.value = t('auth.connectionError')
  }
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <FieldGroup v-if="successMessage">
      <div class="flex flex-col items-center gap-1 text-center">
        <h1 class="text-2xl font-bold">
          {{ t('auth.forgotPasswordTitle') }}
        </h1>
        <p class="text-muted-foreground text-sm text-balance">
          {{ t('auth.forgotPasswordHint') }}
        </p>
      </div>
      <div
        class="border-border bg-muted/40 text-foreground rounded-xl border p-4 text-center text-sm"
        role="status"
      >
        {{ successMessage }}
      </div>
      <Field>
        <Button
          variant="outline"
          class="w-full"
          type="button"
          @click="void navigateTo('/login')"
        >
          {{ t('auth.backToLogin') }}
        </Button>
      </Field>
    </FieldGroup>

    <form v-else class="flex flex-col gap-6" @submit="onSubmit">
      <FieldGroup>
        <div class="flex flex-col items-center gap-1 text-center">
          <h1 class="text-2xl font-bold">
            {{ t('auth.forgotPasswordTitle') }}
          </h1>
          <p class="text-muted-foreground text-sm text-balance">
            {{ t('auth.forgotPasswordHint') }}
          </p>
        </div>

        <Field>
          <FieldLabel for="identifier">
            {{ t('auth.email') }}
          </FieldLabel>
          <Input
            id="identifier"
            v-model="identifier"
            type="email"
            autocomplete="email"
            :placeholder="t('auth.emailPlaceholder')"
            :aria-invalid="!!identifierError"
            :disabled="isSubmitting"
          />
          <FieldError v-if="identifierError">
            {{ identifierError }}
          </FieldError>
          <FieldError v-if="serverError">
            {{ serverError }}
          </FieldError>
        </Field>

        <Field>
          <Button type="submit" class="w-full" :disabled="isSubmitting">
            <span v-if="!isSubmitting">{{ t('auth.sendResetLink') }}</span>
            <span v-else>{{ t('auth.sendingResetLink') }}</span>
          </Button>
        </Field>

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
  </div>
</template>
