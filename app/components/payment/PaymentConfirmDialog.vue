<script setup lang="ts">
import { ref, computed, watch } from 'vue'
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
import { formatCurrency } from '~/utils/formatters'
import type { Milestone, PaymentPayload } from '~/composables/useMilestones'
import FieldContextHint from '~/components/common/FieldContextHint.vue'

const props = defineProps<{
  milestone: Milestone
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  submit: [payload: PaymentPayload]
}>()

const { t } = useI18n()
const selectedFile = ref<File | null>(null)
const filePreviewUrl = ref<string | null>(null)

const handleOpenChange = (isOpen: boolean) => {
  if (!isOpen) {
    emit('close')
  }
}

const paymentSchema = toTypedSchema(
  z.object({
    bank_name: z.string().min(2, t('validation.required')).max(100),
    transaction_reference: z.string().min(5, t('validation.required')).max(50),
    notes: z.string().max(500).optional(),
  })
)

const { handleSubmit, errors, isSubmitting, resetForm, values, setFieldError } =
  useForm({
    validationSchema: paymentSchema,
    initialValues: {
      bank_name: '',
      transaction_reference: '',
      notes: '',
    },
  })

const setReceiptError = (message?: string) => {
  setFieldError('receipt_image', message)
}

// File upload handler
const handleFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  // Validate file type and extension
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    setReceiptError(t('validation.file.invalid_type'))
    selectedFile.value = null
    filePreviewUrl.value = null
    return
  }

  if (!/\.(jpg|jpeg|png)$/i.test(file.name)) {
    setReceiptError(t('validation.file.invalid_extension'))
    selectedFile.value = null
    filePreviewUrl.value = null
    return
  }

  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    setReceiptError(t('validation.file.too_large'))
    selectedFile.value = null
    filePreviewUrl.value = null
    return
  }

  selectedFile.value = file
  setReceiptError(undefined)

  // Create preview
  const reader = new FileReader()
  reader.onload = e => {
    filePreviewUrl.value = e.target?.result as string
  }
  reader.onerror = () => {
    setReceiptError(t('validation.file.read_error'))
    filePreviewUrl.value = null
  }
  reader.readAsDataURL(file)
}

// Check if form is valid and ready to submit
const isFormValid = computed(() => {
  return (
    values &&
    values.bank_name &&
    values.transaction_reference &&
    selectedFile.value &&
    !Object.keys(errors.value).length
  )
})

// Format currency with locale
const formattedAmount = computed(() => {
  const amount = props.milestone?.amount
  if (amount === null || amount === undefined || amount <= 0) {
    return t('validation.amount_invalid')
  }
  return formatCurrency(amount)
})

// Submit form
const onSubmit = handleSubmit(async () => {
  // Prevent double-submit
  if (isSubmitting.value) return

  // Re-validate file exists before submission
  if (!selectedFile.value) {
    setReceiptError(t('validation.required'))
    return
  }

  try {
    const payload: PaymentPayload = {
      payment_method: 'bank_transfer',
      bank_name: values.bank_name || '',
      transaction_reference: values.transaction_reference || '',
      receipt_image: selectedFile.value,
      notes: values.notes || '',
    }

    emit('submit', payload)

    // Reset form after success (with small delay for toast visibility per decision #1)
    setTimeout(() => {
      resetForm()
      selectedFile.value = null
      // Cleanup blob URL to prevent memory leak
      if (filePreviewUrl.value?.startsWith('blob:')) {
        URL.revokeObjectURL(filePreviewUrl.value)
      }
      filePreviewUrl.value = null
    }, 200)
  } catch (error) {
    console.error('Form submission error:', error)
  }
})

// Reset on close
watch(
  () => props.open,
  newVal => {
    if (!newVal) {
      resetForm()
      selectedFile.value = null
      // Cleanup blob URL to prevent memory leak
      if (filePreviewUrl.value?.startsWith('blob:')) {
        URL.revokeObjectURL(filePreviewUrl.value)
      }
      filePreviewUrl.value = null
    }
  }
)
</script>

<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>{{ t('payment.dialog.title') }}</DialogTitle>
      </DialogHeader>

      <div class="space-y-4">
        <!-- Milestone info -->
        <div class="text-center">
          <p class="text-muted-foreground mb-2 text-sm">
            {{ t('actions.view_details') }}
          </p>
          <p class="font-semibold">{{ milestone.name }}</p>
        </div>

        <!-- Amount -->
        <div class="text-center">
          <p class="text-primary my-4 text-center text-3xl font-extrabold">
            {{ formattedAmount }}
          </p>
          <p class="text-muted-foreground text-center text-sm">
            {{ t('payment.dialog.escrow_explanation') }}
          </p>
        </div>

        <!-- Form -->
        <form class="space-y-4" @submit="onSubmit">
          <!-- Bank name -->
          <Field class="gap-2 space-y-2">
            <div class="flex items-center gap-2">
              <FieldLabel class="mb-0" for="bank_name">
                {{ t('payment.dialog.bank_name') }}
              </FieldLabel>
              <FieldContextHint hint-key="contextHelpers.payment.bank_name" />
            </div>
            <Input
              id="bank_name"
              v-model="values.bank_name"
              :placeholder="t('payment.dialog.bank_name')"
              :disabled="isSubmitting"
              :class="{ 'border-destructive': errors.bank_name }"
            />
            <FieldError :errors="[errors.bank_name]" class="text-xs" />
          </Field>

          <!-- Transaction reference -->
          <Field class="gap-2 space-y-2">
            <div class="flex items-center gap-2">
              <FieldLabel class="mb-0" for="transaction_reference">
                {{ t('payment.dialog.transaction_reference') }}
              </FieldLabel>
              <FieldContextHint
                hint-key="contextHelpers.payment.transaction_reference"
              />
            </div>
            <Input
              id="transaction_reference"
              v-model="values.transaction_reference"
              :placeholder="t('payment.dialog.transaction_reference')"
              :disabled="isSubmitting"
              :class="{ 'border-destructive': errors.transaction_reference }"
            />
            <FieldError
              :errors="[errors.transaction_reference]"
              class="text-xs"
            />
          </Field>

          <!-- Receipt image -->
          <Field class="gap-2 space-y-2">
            <div class="flex items-center gap-2">
              <FieldLabel class="mb-0" for="receipt_image">
                {{ t('payment.dialog.receipt_image') }}
              </FieldLabel>
              <FieldContextHint
                hint-key="contextHelpers.payment.receipt_image"
              />
            </div>
            <Input
              id="receipt_image"
              type="file"
              accept="image/jpeg,image/png"
              :multiple="false"
              :disabled="isSubmitting"
              :class="{ 'border-destructive': errors.receipt_image }"
              @change="handleFileSelect"
            />
            <FieldError :errors="[errors.receipt_image]" class="text-xs" />

            <!-- File preview -->
            <img
              v-if="filePreviewUrl"
              :src="filePreviewUrl"
              :alt="t('payment.dialog.receipt_preview_alt')"
              class="aspect-video w-full rounded-xl object-cover"
            />
          </Field>

          <!-- Notes -->
          <Field class="gap-2 space-y-2">
            <div class="flex items-center gap-2">
              <FieldLabel class="mb-0" for="notes">
                {{ t('payment.dialog.notes') }}
              </FieldLabel>
              <FieldContextHint hint-key="contextHelpers.payment.notes" />
            </div>
            <Textarea
              id="notes"
              v-model="values.notes"
              :placeholder="t('optional')"
              :disabled="isSubmitting"
              class="resize-none"
            />
          </Field>
        </form>
      </div>

      <DialogFooter class="flex flex-row-reverse gap-2">
        <Button
          variant="outline"
          :disabled="isSubmitting"
          @click="$emit('close')"
        >
          {{ t('payment.dialog.cancel') }}
        </Button>
        <Button
          :disabled="!isFormValid || isSubmitting"
          :loading="isSubmitting"
          @click="onSubmit"
        >
          {{
            isSubmitting ? t('buttons.confirming') : t('payment.dialog.confirm')
          }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
