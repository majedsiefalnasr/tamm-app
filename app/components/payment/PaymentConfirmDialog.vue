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
import Label from '~/components/ui/label/Label.vue'
import { formatCurrency } from '~/utils/formatters'
import type { Milestone, PaymentPayload } from '~/composables/useMilestones'

const props = defineProps<{
  milestone: Milestone
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  submit: [payload: PaymentPayload]
}>()

const { t } = useI18n()
const isLoading = ref(false)
const selectedFile = ref<File | null>(null)
const filePreviewUrl = ref<string | null>(null)

const paymentSchema = toTypedSchema(
  z.object({
    bank_name: z.string().min(2, t('validation.required')).max(100),
    transaction_reference: z.string().min(5, t('validation.required')).max(50),
    notes: z.string().max(500).optional(),
  })
)

const { handleSubmit, errors, isSubmitting, resetForm, values } = useForm({
  validationSchema: paymentSchema,
  initialValues: {
    bank_name: '',
    transaction_reference: '',
    notes: '',
  },
})

// File upload handler
const handleFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  // Validate file type
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    errors.value.receipt_image = 'Only JPG/PNG accepted'
    selectedFile.value = null
    filePreviewUrl.value = null
    return
  }

  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    errors.value.receipt_image = 'Max 5MB'
    selectedFile.value = null
    filePreviewUrl.value = null
    return
  }

  selectedFile.value = file

  // Create preview
  const reader = new FileReader()
  reader.onload = e => {
    filePreviewUrl.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

// Check if form is valid and ready to submit
const isFormValid = computed(() => {
  return (
    values.bank_name &&
    values.transaction_reference &&
    selectedFile.value &&
    !Object.keys(errors.value).length
  )
})

// Format currency
const formattedAmount = computed(() => {
  return formatCurrency(props.milestone.amount)
})

// Submit form
const onSubmit = handleSubmit(async () => {
  if (!selectedFile.value) return

  isLoading.value = true

  try {
    const payload: PaymentPayload = {
      payment_method: 'bank_transfer',
      bank_name: values.bank_name || '',
      transaction_reference: values.transaction_reference || '',
      receipt_image: selectedFile.value,
      notes: values.notes || '',
    }

    emit('submit', payload)
    resetForm()
    selectedFile.value = null
    filePreviewUrl.value = null
  } finally {
    isLoading.value = false
  }
})

// Reset on close
watch(
  () => props.open,
  newVal => {
    if (!newVal) {
      resetForm()
      selectedFile.value = null
      filePreviewUrl.value = null
    }
  }
)
</script>

<template>
  <Dialog :open="open" @update:open="$emit('close')">
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
          <div class="space-y-2">
            <Label for="bank_name">
              {{ t('payment.dialog.bank_name') }}
            </Label>
            <Input
              id="bank_name"
              v-model="values.bank_name"
              :placeholder="t('payment.dialog.bank_name')"
              :disabled="isLoading"
              :class="{ 'border-destructive': errors.bank_name }"
            />
            <p v-if="errors.bank_name" class="text-destructive text-xs">
              {{ errors.bank_name }}
            </p>
          </div>

          <!-- Transaction reference -->
          <div class="space-y-2">
            <Label for="transaction_reference">
              {{ t('payment.dialog.transaction_reference') }}
            </Label>
            <Input
              id="transaction_reference"
              v-model="values.transaction_reference"
              :placeholder="t('payment.dialog.transaction_reference')"
              :disabled="isLoading"
              :class="{ 'border-destructive': errors.transaction_reference }"
            />
            <p
              v-if="errors.transaction_reference"
              class="text-destructive text-xs"
            >
              {{ errors.transaction_reference }}
            </p>
          </div>

          <!-- Receipt image -->
          <div class="space-y-2">
            <Label for="receipt_image">
              {{ t('payment.dialog.receipt_image') }}
            </Label>
            <Input
              id="receipt_image"
              type="file"
              accept="image/jpeg,image/png"
              :disabled="isLoading"
              :class="{ 'border-destructive': errors.receipt_image }"
              @change="handleFileSelect"
            />
            <p v-if="errors.receipt_image" class="text-destructive text-xs">
              {{ errors.receipt_image }}
            </p>

            <!-- File preview -->
            <img
              v-if="filePreviewUrl"
              :src="filePreviewUrl"
              alt="Receipt preview"
              class="aspect-video w-full rounded-xl object-cover"
            />
          </div>

          <!-- Notes -->
          <div class="space-y-2">
            <Label for="notes">
              {{ t('payment.dialog.notes') }}
            </Label>
            <Textarea
              id="notes"
              v-model="values.notes"
              :placeholder="t('optional')"
              :disabled="isLoading"
              class="resize-none"
            />
          </div>
        </form>
      </div>

      <DialogFooter class="gap-2">
        <Button variant="outline" :disabled="isLoading" @click="$emit('close')">
          {{ t('payment.dialog.cancel') }}
        </Button>
        <Button
          :disabled="!isFormValid || isLoading"
          :loading="isLoading"
          @click="onSubmit"
        >
          {{
            isLoading ? t('buttons.confirming') : t('payment.dialog.confirm')
          }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
