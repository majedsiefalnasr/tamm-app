<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Field, FieldError, FieldLabel } from '~/components/ui/field'

interface Props {
  open: boolean
  isSubmitting?: boolean
  availableBalance: number
}

interface WithdrawalFormData {
  amount: number
  iban: string
  notes?: string
}

const props = withDefaults(defineProps<Props>(), {
  isSubmitting: false,
})

const emit = defineEmits<{
  close: []
  submit: [data: WithdrawalFormData]
}>()

const { t } = useI18n()

const handleOpenChange = (isOpen: boolean) => {
  if (!isOpen) {
    emit('close')
  }
}

const withdrawalSchema = toTypedSchema(
  z.object({
    amount: z
      .number()
      .positive(t('validation.amount_required'))
      .refine(
        value => value <= props.availableBalance,
        t('validation.amount_exceeds_available')
      ),
    iban: z
      .string()
      .min(15, t('validation.invalid_iban'))
      .max(34, t('validation.invalid_iban'))
      .regex(/^SA[0-9]{2}[0-9]{20}$/, t('validation.invalid_iban')),
    notes: z.string().optional(),
  })
)

const {
  handleSubmit,
  errors,
  isSubmitting: formIsSubmitting,
  resetForm,
  values,
} = useForm({
  validationSchema: withdrawalSchema,
  initialValues: {
    amount: 0,
    iban: '',
    notes: '',
  },
})

const onSubmit = handleSubmit(data => {
  emit('submit', {
    amount: data.amount,
    iban: data.iban,
    notes: data.notes,
  })
})

// Reset form when dialog opens/closes
watch(
  () => props.open,
  isOpen => {
    if (!isOpen) {
      resetForm()
    }
  }
)
</script>

<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{{ t('withdrawal.request.title') }}</DialogTitle>
      </DialogHeader>

      <form class="space-y-4" @submit="onSubmit">
        <!-- Amount Field -->
        <Field class="gap-2 space-y-2">
          <FieldLabel for="amount">{{
            t('withdrawal.form.amount')
          }}</FieldLabel>
          <div class="flex items-center gap-2">
            <Input
              id="amount"
              v-model.number="values.amount"
              type="number"
              :placeholder="t('withdrawal.form.amount_placeholder')"
              step="0.01"
              min="0"
              :max="availableBalance"
              :aria-invalid="!!errors.amount"
            />
            <span
              class="text-muted-foreground text-sm font-medium whitespace-nowrap"
            >
              {{ t('withdrawal.form.currency') }}
            </span>
          </div>
          <FieldError :errors="[errors.amount]" class="text-xs" />
        </Field>

        <!-- IBAN Field -->
        <Field class="gap-2 space-y-2">
          <FieldLabel for="iban">{{ t('withdrawal.form.iban') }}</FieldLabel>
          <Input
            id="iban"
            v-model="values.iban"
            type="text"
            :placeholder="t('withdrawal.form.iban_placeholder')"
            :aria-invalid="!!errors.iban"
          />
          <FieldError :errors="[errors.iban]" class="text-xs" />
        </Field>

        <!-- Notes Field -->
        <Field class="gap-2 space-y-2">
          <FieldLabel for="notes">{{ t('withdrawal.form.notes') }}</FieldLabel>
          <Textarea
            id="notes"
            v-model="values.notes"
            :placeholder="t('withdrawal.form.notes_placeholder')"
            rows="3"
          />
        </Field>

        <!-- Footer -->
        <DialogFooter class="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            :disabled="formIsSubmitting || props.isSubmitting"
            @click="$emit('close')"
          >
            {{ t('withdrawal.form.cancel') }}
          </Button>
          <Button
            type="submit"
            :disabled="formIsSubmitting || props.isSubmitting"
            :aria-busy="formIsSubmitting || props.isSubmitting"
          >
            {{
              formIsSubmitting || props.isSubmitting
                ? t('withdrawal.form.loading')
                : t('withdrawal.form.submit')
            }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
