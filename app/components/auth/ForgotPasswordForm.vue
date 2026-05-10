<script setup lang="ts">
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

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
        {{ t('auth.forgotPasswordTitle') }}
      </h1>
      <p class="text-muted-foreground mb-6 text-center text-sm">
        {{ t('auth.forgotPasswordHint') }}
      </p>

      <div
        v-if="successMessage"
        class="border-border bg-muted/40 text-foreground mb-6 rounded-xl border p-4 text-center text-sm"
        role="status"
      >
        {{ successMessage }}
      </div>

      <form v-else class="space-y-6" @submit="onSubmit">
        <div class="space-y-2">
          <Label for="identifier" class="text-start text-xs font-semibold">
            {{ t('auth.email') }}
          </Label>
          <Input
            id="identifier"
            v-model="identifier"
            type="email"
            autocomplete="email"
            :placeholder="t('auth.emailPlaceholder')"
            :aria-invalid="!!identifierError"
            class="border-input rounded-xl border"
            :disabled="isSubmitting"
          />
          <p v-if="identifierError" class="text-destructive mt-1 text-xs">
            {{ identifierError }}
          </p>
          <p v-if="serverError" class="text-destructive mt-1 text-xs">
            {{ serverError }}
          </p>
        </div>

        <Button
          type="submit"
          :disabled="isSubmitting"
          class="bg-primary text-primary-foreground shadow-cta w-full rounded-full px-6 py-3 text-sm font-bold transition-shadow hover:shadow-none"
        >
          <span v-if="!isSubmitting">{{ t('auth.sendResetLink') }}</span>
          <span v-else>{{ t('auth.sendingResetLink') }}</span>
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
