<script setup lang="ts">
import { ref, computed } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { toast } from 'vue-sonner'
import * as z from 'zod'
import { useProposals } from '~/composables/useProposals'
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
import { Label } from '~/components/ui/label'

interface Props {
  projectId: string
  projectName: string
  isOpen: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  submitted: [value: { price: number; estimatedDays: number; notes?: string }]
}>()

const { t } = useI18n()
const { submitProposal } = useProposals()

const isSubmitting = ref(false)
const noteLength = ref(0)

const validationSchema = toTypedSchema(
  z.object({
    price: z.number().positive(t('projects.submitProposal.priceError')),
    estimatedDays: z
      .number()
      .int()
      .positive(t('projects.submitProposal.timelineError')),
    notes: z
      .string()
      .max(500, t('projects.submitProposal.notesError'))
      .optional(),
  })
)

const { handleSubmit, errors, values, resetForm } = useForm({
  validationSchema,
  initialValues: {
    price: 0,
    estimatedDays: 0,
    notes: '',
  },
})

const onOpenChange = (newOpen: boolean) => {
  if (!newOpen) {
    resetForm()
    noteLength.value = 0
  }
  emit('update:open', newOpen)
}

const updateNoteLength = (value: string) => {
  noteLength.value = value.length
}

const onSubmit = handleSubmit(async formValues => {
  isSubmitting.value = true
  try {
    const result = await submitProposal(props.projectId, {
      price: formValues.price,
      estimated_days: formValues.estimatedDays,
      notes: formValues.notes,
    })

    if (result.success) {
      toast.success(t('projects.submitProposal.successMessage'))
      onOpenChange(false)
      emit('submitted', formValues)
    } else {
      toast.error(result.error || t('projects.submitProposal.errorMessage'))
    }
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      t('projects.submitProposal.errorMessage')
    toast.error(errorMsg)
  } finally {
    isSubmitting.value = false
  }
})
</script>

<template>
  <Dialog :open="isOpen" @update:open="onOpenChange">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>
          {{ t('projects.submitProposal.dialogTitle') }} {{ projectName }}
        </DialogTitle>
      </DialogHeader>

      <form class="space-y-4" @submit.prevent="onSubmit">
        <!-- Price Field -->
        <div class="space-y-2">
          <Label for="price">{{
            t('projects.submitProposal.priceLabel')
          }}</Label>
          <Input
            id="price"
            v-model.number="values.price"
            type="number"
            :placeholder="t('projects.submitProposal.priceLabel')"
            :error="!!errors.price"
            inputmode="numeric"
          />
          <p v-if="errors.price" class="text-destructive text-sm">
            {{ errors.price }}
          </p>
        </div>

        <!-- Timeline Field -->
        <div class="space-y-2">
          <Label for="timeline">{{
            t('projects.submitProposal.timelineLabel')
          }}</Label>
          <Input
            id="timeline"
            v-model.number="values.estimatedDays"
            type="number"
            :placeholder="t('projects.submitProposal.timelineLabel')"
            :error="!!errors.estimatedDays"
            inputmode="numeric"
          />
          <p v-if="errors.estimatedDays" class="text-destructive text-sm">
            {{ errors.estimatedDays }}
          </p>
        </div>

        <!-- Notes Field -->
        <div class="space-y-2">
          <Label for="notes">{{
            t('projects.submitProposal.notesLabel')
          }}</Label>
          <Textarea
            id="notes"
            v-model="values.notes"
            :placeholder="t('projects.submitProposal.notesPlaceholder')"
            :maxlength="500"
            :error="!!errors.notes"
            @input="updateNoteLength"
          />
          <div class="text-muted-foreground flex justify-end text-[10px]">
            {{ noteLength }}/500
          </div>
          <p v-if="errors.notes" class="text-destructive text-sm">
            {{ errors.notes }}
          </p>
        </div>
      </form>

      <DialogFooter class="gap-2">
        <Button
          variant="outline"
          :disabled="isSubmitting"
          @click="() => onOpenChange(false)"
        >
          {{ t('projects.submitProposal.cancelButton') }}
        </Button>
        <Button
          :disabled="isSubmitting || Object.keys(errors).length > 0"
          class="gap-2"
          @click="onSubmit"
        >
          <span v-if="!isSubmitting">{{
            t('projects.submitProposal.confirmButton')
          }}</span>
          <span v-else class="inline-flex items-center gap-2">
            <svg
              class="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {{ t('projects.submitProposal.loadingMessage') }}
          </span>
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
