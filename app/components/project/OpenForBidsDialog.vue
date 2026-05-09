<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAdminUsers } from '~/app/composables/useAdminUsers'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'

interface Props {
  projectId: string
  projectName: string
  isOpen: boolean
  prefilledContractorIds?: string[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  submitted: [contractorIds: string[]]
}>()

const { getContractorsList } = useAdminUsers()
const { t } = useI18n()

const contractors = ref<Array<{ id: string; name: string; email: string }>>([])
const selectedContractors = ref<string[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const validationError = ref<string | null>(null)
const isSubmitting = ref(false)
let abortController: AbortController | null = null
const loadTimeout = ref<NodeJS.Timeout | null>(null)

// Load contractors when dialog opens
watch(
  () => props.isOpen,
  async newIsOpen => {
    if (newIsOpen) {
      loading.value = true
      error.value = null
      abortController = new AbortController()

      loadTimeout.value = setTimeout(() => {
        if (loading.value) {
          loading.value = false
          error.value = t('errors.failed_to_load_contractors')
        }
      }, 30000)

      try {
        const list = await getContractorsList()
        if (abortController?.signal.aborted) return
        contractors.value = list

        // Pre-fill with existing invitations if provided
        if (
          props.prefilledContractorIds &&
          props.prefilledContractorIds.length > 0
        ) {
          selectedContractors.value = props.prefilledContractorIds
        }
      } catch (err) {
        if (!abortController?.signal.aborted) {
          error.value = t('errors.failed_to_load_contractors')
          console.error('Failed to load contractors:', err)
        }
      } finally {
        loading.value = false
        if (loadTimeout.value) clearTimeout(loadTimeout.value)
      }
    } else {
      // Reset when dialog closes
      abortController?.abort()
      if (loadTimeout.value) clearTimeout(loadTimeout.value)
      selectedContractors.value = []
      error.value = null
      validationError.value = null
    }
  }
)

const canConfirm = computed(
  () =>
    selectedContractors.value.length > 0 &&
    !loading.value &&
    !isSubmitting.value
)

const handleConfirm = async () => {
  validationError.value = null

  if (selectedContractors.value.length === 0) {
    validationError.value = t('projects.openForBids.validationError')
    return
  }

  if (isSubmitting.value) return
  isSubmitting.value = true

  try {
    emit('submitted', [...selectedContractors.value])
    // Dialog closes via parent after successful API call
  } finally {
    // isSubmitting will be reset by parent when dialog closes or on error
  }
}

const handleCancel = () => {
  emit('update:isOpen', false)
}

const toggleContractor = (contractorId: string) => {
  validationError.value = null
  const index = selectedContractors.value.indexOf(contractorId)
  if (index > -1) {
    selectedContractors.value.splice(index, 1)
  } else {
    selectedContractors.value.push(contractorId)
  }
}

const isSelected = (contractorId: string) => {
  return selectedContractors.value.includes(contractorId)
}
</script>

<template>
  <Dialog :open="isOpen" @update:open="emit('update:isOpen', $event)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>
          {{ t('projects.openForBids.dialogTitle') }}{{ projectName }}
        </DialogTitle>
        <p class="text-muted-foreground mt-2 text-sm">
          {{ t('projects.openForBids.selectContractorsSubtitle') }}
        </p>
      </DialogHeader>

      <div v-if="error" class="bg-danger/10 text-danger rounded-lg p-3 text-sm">
        {{
          error === t('errors.failed_to_load_contractors')
            ? error
            : t('errors.failed_to_load_contractors')
        }}
      </div>

      <div
        v-if="validationError"
        class="bg-warning/10 text-warning rounded-lg p-3 text-sm"
      >
        {{ validationError }}
      </div>

      <div class="space-y-4">
        <div>
          <p class="text-muted-foreground text-sm">
            {{ t('projects.openForBids.selectContractors') }}
          </p>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="space-y-2">
          <div class="bg-muted-foreground/20 h-10 w-full rounded-lg" />
        </div>

        <!-- Contractor list -->
        <div
          v-else
          class="border-border max-h-72 space-y-2 overflow-y-auto rounded-lg border p-3"
        >
          <div
            v-if="contractors.length === 0"
            class="text-muted-foreground text-center text-sm"
          >
            {{ t('projects.openForBids.noContractorsAvailable') }}
          </div>
          <div
            v-for="contractor in contractors"
            :key="contractor.id"
            class="hover:bg-muted flex items-center gap-3 rounded-lg p-2"
          >
            <Checkbox
              :id="`contractor-${contractor.id}`"
              :checked="isSelected(contractor.id)"
              @update:checked="toggleContractor(contractor.id)"
            />
            <label
              :for="`contractor-${contractor.id}`"
              class="flex-1 cursor-pointer"
            >
              <p class="text-ink text-sm font-medium">{{ contractor.name }}</p>
              <p class="text-muted-foreground text-xs">
                {{ contractor.email }}
              </p>
            </label>
          </div>
        </div>

        <!-- Helper text -->
        <p class="text-muted-foreground text-xs">
          {{ t('projects.openForBids.helperText') }}
          <span v-if="contractors.length > 0" class="ms-2">
            ({{ selectedContractors.length }}/{{ contractors.length }})
          </span>
        </p>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="handleCancel">
          {{ t('projects.openForBids.cancelButton') }}
        </Button>
        <Button
          :disabled="!canConfirm"
          :loading="isSubmitting"
          @click="handleConfirm"
        >
          {{ t('projects.openForBids.confirmButton') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
