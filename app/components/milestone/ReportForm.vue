<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMilestones } from '~/composables/useMilestones'
import { useNotifications } from '~/composables/useNotifications'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import { Field, FieldError, FieldLabel } from '~/components/ui/field'

interface Props {
  milestoneId: string
  projectId: string
  milestoneName: string
  isOpen: boolean
}

interface Emits {
  (e: 'update:isOpen', value: boolean): void
  (e: 'submit'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()
const { submitReport } = useMilestones()
const { notify } = useNotifications()

// Form state
const content = ref('')
const selectedImages = ref<File[]>([])
const isSubmitting = ref(false)
const contentError = ref('')
const imageErrors = ref<Record<number, string>>({})
const imagePreviews = ref<string[]>([])

// File input ref
const fileInputRef = ref<HTMLInputElement | null>(null)

// Computed properties
const isFormValid = computed(() => {
  return (
    content.value.trim().length >= 20 &&
    Object.keys(imageErrors.value).length === 0
  )
})

const hasImages = computed(() => selectedImages.value.length > 0)
const canAddMoreImages = computed(() => selectedImages.value.length < 10)

// Methods
const onFileSelected = (files: FileList | null) => {
  if (!files) return

  const newFiles = Array.from(files)
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  const MAX_TOTAL_FILES = 10

  imageErrors.value = {}

  for (const file of newFiles) {
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      imageErrors.value[selectedImages.value.length] = t(
        'errors.unsupported_format'
      )
      continue
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      imageErrors.value[selectedImages.value.length] = t(
        'errors.file_too_large'
      )
      continue
    }

    // Check total count
    if (selectedImages.value.length >= MAX_TOTAL_FILES) {
      notify.error(t('errors.max_images'))
      break
    }

    selectedImages.value.push(file)
    imagePreviews.value.push(URL.createObjectURL(file))
  }

  // Reset file input
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const removeImage = (index: number) => {
  URL.revokeObjectURL(imagePreviews.value[index])
  selectedImages.value.splice(index, 1)
  imagePreviews.value.splice(index, 1)
  delete imageErrors.value[index]
}

const validateForm = (): boolean => {
  contentError.value = ''

  if (content.value.trim().length === 0) {
    contentError.value = t('validation.required')
    return false
  }

  if (content.value.trim().length < 20) {
    contentError.value = t('validation.min_length_20')
    return false
  }

  return Object.keys(imageErrors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  try {
    await notify.promise(
      () =>
        submitReport(props.projectId, props.milestoneId, {
          content: content.value,
          images: selectedImages.value,
        }),
      {
        loading: t('loading'),
        success: t('success.report_submitted'),
        error: err =>
          err instanceof Error ? err.message : t('errors.submission_failed'),
      }
    )
    content.value = ''
    selectedImages.value = []
    imagePreviews.value = []
    emit('submit')
    emit('update:isOpen', false)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : t('errors.submission_failed')
    contentError.value = message
  } finally {
    isSubmitting.value = false
  }
}

const handleSaveDraft = () => {
  notify.success(t('success.draft_saved'))
}

const handleClose = () => {
  emit('update:isOpen', false)
}

// Cleanup on unmount
onUnmounted(() => {
  imagePreviews.value.forEach(url => URL.revokeObjectURL(url))
})

// Drag and drop handlers
const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  onFileSelected(e.dataTransfer?.files || null)
}
</script>

<template>
  <Dialog :open="isOpen" @update:open="handleClose">
    <DialogContent class="max-h-screen w-full max-w-2xl overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {{ t('report.submit_title') }} — {{ milestoneName }}
        </DialogTitle>
      </DialogHeader>

      <div class="space-y-6 py-4">
        <!-- Content Field -->
        <Field class="gap-2 space-y-2">
          <FieldLabel class="text-sm font-semibold">
            {{ t('fields.content') }}
            <span class="text-destructive">*</span>
          </FieldLabel>
          <Textarea
            v-model="content"
            :placeholder="t('fields.content_placeholder')"
            class="min-h-32"
          />
          <div class="flex items-center justify-between">
            <FieldError :errors="[contentError]" class="text-xs" />
            <p class="text-muted-foreground text-xs">
              {{ content.length }} / 20 {{ t('fields.characters') }}
            </p>
          </div>
        </Field>

        <!-- Image Upload Zone -->
        <Field class="gap-2 space-y-2">
          <FieldLabel class="text-sm font-semibold">
            {{ t('fields.images') }}
          </FieldLabel>

          <!-- Upload Zone -->
          <div
            class="border-border hover:border-primary/50 rounded-2xl border-2 border-dashed p-6 text-center transition"
            @dragover="handleDragOver"
            @drop="handleDrop"
          >
            <input
              ref="fileInputRef"
              type="file"
              multiple
              accept="image/*"
              class="hidden"
              @change="onFileSelected($event.target.files)"
            />

            <div class="space-y-2">
              <p class="text-sm font-medium">
                {{ t('fields.drag_drop_hint') }}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                @click="triggerFileInput"
              >
                {{ t('actions.select_files') }}
              </Button>
              <p class="text-muted-foreground text-xs">
                {{ t('fields.image_limits') }}
              </p>
            </div>
          </div>

          <!-- Image Preview Grid -->
          <div v-if="hasImages" class="grid grid-cols-3 gap-2">
            <div
              v-for="(preview, idx) in imagePreviews"
              :key="idx"
              class="relative overflow-hidden rounded-xl"
            >
              <img
                :src="preview"
                :alt="`Preview ${idx + 1}`"
                class="aspect-square w-full object-cover"
              />
              <button
                type="button"
                class="bg-card/80 text-destructive hover:bg-destructive hover:text-destructive-foreground absolute inset-e-1 top-1 flex h-5 w-5 items-center justify-center rounded-full transition"
                :aria-label="t('actions.remove_image')"
                @click="removeImage(idx)"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- Image Errors -->
          <ul
            v-if="Object.keys(imageErrors).length > 0"
            class="text-destructive ms-4 flex list-disc flex-col gap-1 text-xs"
            role="alert"
          >
            <li
              v-for="(imageError, idx) in Object.values(imageErrors)"
              :key="idx"
            >
              {{ imageError }}
            </li>
          </ul>
        </Field>
      </div>

      <DialogFooter class="flex gap-2">
        <Button
          type="button"
          variant="outline"
          :disabled="isSubmitting"
          @click="handleSaveDraft"
        >
          {{ t('actions.save_draft') }}
        </Button>
        <Button
          type="button"
          :disabled="!isFormValid || isSubmitting"
          @click="handleSubmit"
        >
          <span v-if="isSubmitting" class="me-2 inline-block">⏳</span>
          {{ t('actions.submit_report') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
