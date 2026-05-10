<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useForm, Field as FormField } from 'vee-validate'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { Loader2 } from 'lucide-vue-next'
import type { Milestone } from '~/shared/types/project'
import type { MilestoneInput } from '~/composables/useMilestones'
import FieldContextHint from '~/components/common/FieldContextHint.vue'

interface Props {
  open: boolean
  mode?: 'add' | 'edit'
  milestone?: Milestone
  nextOrder?: number
  isSubmitting?: boolean
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'submit', data: MilestoneInput): void
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'add',
  nextOrder: 1,
  isSubmitting: false,
})

const emit = defineEmits<Emits>()

const { t } = useI18n()

// Validation schema
const validationSchema = toTypedSchema(
  z.object({
    title: z
      .string()
      .min(3, t('validation.milestone.title_min'))
      .max(100, t('validation.milestone.title_max')),
    description: z
      .string()
      .max(500, t('validation.milestone.description_max'))
      .optional()
      .or(z.literal('')),
    amount: z.number().positive(t('validation.milestone.amount_positive')),
    order: z
      .number()
      .int()
      .positive(t('validation.milestone.order_positive'))
      .default(props.nextOrder),
  })
)

const { handleSubmit, resetForm, values } = useForm<MilestoneInput>({
  validationSchema,
  initialValues: {
    title: props.milestone?.name || '',
    description: props.milestone?.description || '',
    amount: props.milestone?.amount || 0,
    order: props.milestone?.order || props.nextOrder,
  },
})

// Reset form when dialog opens/closes
watch(
  () => props.open,
  newOpen => {
    if (newOpen && props.mode === 'add') {
      resetForm()
    } else if (newOpen && props.mode === 'edit' && props.milestone) {
      resetForm({
        values: {
          title: props.milestone.name,
          description: props.milestone.description,
          amount: props.milestone.amount,
          order: props.milestone.order,
        },
      })
    }
  }
)

const onSubmit = handleSubmit(async data => {
  emit('submit', data)
})

const closeDialog = () => {
  emit('update:open', false)
  resetForm()
}

const dialogTitle = computed(() => {
  return props.mode === 'add'
    ? t('forms.add_milestone')
    : t('forms.edit_milestone')
})
</script>

<template>
  <Dialog :open="open" @update:open="closeDialog">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ dialogTitle }}</DialogTitle>
      </DialogHeader>

      <form class="space-y-4" @submit="onSubmit">
        <!-- Title field -->
        <FormField v-slot="{ componentField }" name="title">
          <FormItem>
            <FormLabel>{{ t('forms.milestone.title') }}</FormLabel>
            <FormControl>
              <Input
                type="text"
                placeholder="e.g., Foundation & Structure"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Description field -->
        <FormField v-slot="{ componentField }" name="description">
          <FormItem>
            <FormLabel
              >{{ t('forms.milestone.description') }} ({{
                t('optional')
              }})</FormLabel
            >
            <FormControl>
              <Textarea
                placeholder="e.g., Excavation, foundation, concrete structure"
                class="min-h-24"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Amount field -->
        <FormField v-slot="{ componentField }" name="amount">
          <FormItem>
            <div class="flex items-center gap-2">
              <FormLabel>{{ t('forms.milestone.amount') }}</FormLabel>
              <FieldContextHint hint-key="contextHelpers.milestone.amount" />
            </div>
            <FormControl>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Order field -->
        <FormField v-slot="{ componentField }" name="order">
          <FormItem>
            <div class="flex items-center gap-2">
              <FormLabel>{{ t('forms.milestone.order') }}</FormLabel>
              <FieldContextHint hint-key="contextHelpers.milestone.order" />
            </div>
            <FormControl>
              <Input type="number" min="1" step="1" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Buttons -->
        <DialogFooter class="gap-3 pt-4 sm:flex sm:gap-3">
          <Button
            type="button"
            variant="outline"
            :disabled="isSubmitting"
            @click="closeDialog"
          >
            {{ t('buttons.cancel') }}
          </Button>
          <Button type="submit" :disabled="isSubmitting">
            <span v-if="!isSubmitting">
              {{
                mode === 'add'
                  ? t('buttons.add_milestone')
                  : t('buttons.save_milestone')
              }}
            </span>
            <span v-else class="flex items-center gap-2">
              <Loader2 class="h-4 w-4 animate-spin" />
              {{ t('loading') }}
            </span>
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
