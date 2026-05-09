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

interface Props {
  projectId: string
  projectName: string
  isOpen: boolean
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

// Load contractors when dialog opens
watch(
  () => props.isOpen,
  async newIsOpen => {
    if (newIsOpen) {
      loading.value = true
      error.value = null
      try {
        const list = await getContractorsList()
        contractors.value = list
      } catch (err) {
        error.value = 'Failed to load contractors'
        console.error('Failed to load contractors:', err)
      } finally {
        loading.value = false
      }
    } else {
      // Reset when dialog closes
      selectedContractors.value = []
      error.value = null
    }
  }
)

const canConfirm = computed(
  () => selectedContractors.value.length > 0 && !loading.value
)

const handleConfirm = () => {
  if (!canConfirm.value) return
  emit('submitted', selectedContractors.value)
}

const handleCancel = () => {
  emit('update:isOpen', false)
}

const toggleContractor = (contractorId: string) => {
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
      </DialogHeader>

      <div v-if="error" class="bg-danger/10 text-danger rounded-lg p-3 text-sm">
        {{ error }}
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
            No contractors available
          </div>
          <div
            v-for="contractor in contractors"
            :key="contractor.id"
            class="hover:bg-muted flex items-center gap-3 rounded-lg p-2"
          >
            <input
              :id="`contractor-${contractor.id}`"
              type="checkbox"
              :checked="isSelected(contractor.id)"
              class="border-border h-4 w-4 rounded"
              @change="toggleContractor(contractor.id)"
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
        <p
          v-if="!loading && contractors.length > 0"
          class="text-muted-foreground text-end text-xs"
        >
          {{ selectedContractors.length }}/{{ contractors.length }}
          {{ t('projects.openForBids.helperText') }}
        </p>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="handleCancel">
          {{ t('projects.openForBids.cancelButton') }}
        </Button>
        <Button :disabled="!canConfirm" @click="handleConfirm">
          {{ t('projects.openForBids.confirmButton') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
