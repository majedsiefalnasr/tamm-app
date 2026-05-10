<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import type { Engineer } from '~/shared/types/project'
import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import { Skeleton } from '~/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'

interface Props {
  isOpen: boolean
  projectId: string
  currentSupervisorId?: string
  currentFieldEngineerId?: string
}

interface Emits {
  (e: 'close'): void
  (e: 'assigned'): void
}

const props = withDefaults(defineProps<Props>(), {})
const emit = defineEmits<Emits>()

const { t } = useI18n()
const { assignEngineers } = useProjects()
const { notify } = useNotifications()

const selectedSupervisor = ref<string | null>(null)
const selectedFieldEngineer = ref<string | null>(null)
const supervisors = ref<Engineer[]>([])
const fieldEngineers = ref<Engineer[]>([])
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)

const canSave = computed(
  () => selectedSupervisor.value && selectedFieldEngineer.value
)

const fetchEngineers = async () => {
  loading.value = true
  error.value = null

  try {
    const [supervisorRes, fieldRes] = await Promise.all([
      useApi('/admin/users?role=supervisor_engineer'),
      useApi('/admin/users?role=field_engineer'),
    ])

    supervisors.value = supervisorRes.data || []
    fieldEngineers.value = fieldRes.data || []
  } catch (err) {
    error.value = t('projects.assignEngineers.loadingError')
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  if (!canSave.value) {
    error.value = t('projects.assignEngineers.selectBothError')
    return
  }

  saving.value = true
  error.value = null

  try {
    const result = await assignEngineers(
      props.projectId,
      selectedSupervisor.value!,
      selectedFieldEngineer.value!
    )

    if (result.success) {
      notify.success(t('projects.assignEngineers.successMessage'))
      emit('assigned')
      emit('close')
    } else {
      const msg = result.error || t('projects.assignEngineers.saveError')
      error.value = msg
      notify.error(msg)
    }
  } finally {
    saving.value = false
  }
}

const onOpenChange = (open: boolean) => {
  if (!open) {
    emit('close')
  }
}

watch(
  () => props.isOpen,
  async newVal => {
    if (newVal) {
      selectedSupervisor.value = props.currentSupervisorId || null
      selectedFieldEngineer.value = props.currentFieldEngineerId || null
      error.value = null
      await fetchEngineers()
    } else {
      selectedSupervisor.value = null
      selectedFieldEngineer.value = null
      error.value = null
    }
  }
)
</script>

<template>
  <Dialog :open="isOpen" @update:open="onOpenChange">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{{
          t('projects.assignEngineers.dialogTitle')
        }}</DialogTitle>
        <DialogDescription>
          {{ t('projects.assignEngineers.description') }}
        </DialogDescription>
      </DialogHeader>

      <div
        v-if="error"
        class="bg-destructive/10 text-destructive rounded-md p-3 text-sm"
      >
        {{ error }}
      </div>

      <div v-if="loading" class="space-y-4 py-4">
        <Skeleton class="h-10 w-full" />
        <Skeleton class="h-10 w-full" />
      </div>

      <div
        v-else-if="supervisors.length === 0 && fieldEngineers.length === 0"
        class="text-muted-foreground py-4 text-sm"
      >
        {{ t('projects.assignEngineers.emptyListsMessage') }}
      </div>

      <div v-else class="space-y-4 py-4">
        <div class="space-y-2">
          <Label for="supervisor">{{
            t('projects.assignEngineers.supervisorLabel')
          }}</Label>
          <Select v-model="selectedSupervisor">
            <SelectTrigger id="supervisor" :disabled="saving">
              <SelectValue
                :placeholder="t('projects.assignEngineers.selectPlaceholder')"
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="eng in supervisors"
                :key="eng.id"
                :value="eng.id"
              >
                {{ eng.name }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p
            v-if="supervisors.length === 0"
            class="text-muted-foreground text-xs"
          >
            {{ t('projects.assignEngineers.noSupervisorsMessage') }}
          </p>
        </div>

        <div class="space-y-2">
          <Label for="fieldEngineer">{{
            t('projects.assignEngineers.fieldLabel')
          }}</Label>
          <Select v-model="selectedFieldEngineer">
            <SelectTrigger id="fieldEngineer" :disabled="saving">
              <SelectValue
                :placeholder="t('projects.assignEngineers.selectPlaceholder')"
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="eng in fieldEngineers"
                :key="eng.id"
                :value="eng.id"
              >
                {{ eng.name }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p
            v-if="fieldEngineers.length === 0"
            class="text-muted-foreground text-xs"
          >
            {{ t('projects.assignEngineers.noFieldEngineersMessage') }}
          </p>
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-4">
        <Button variant="outline" :disabled="saving" @click="emit('close')">
          {{ t('buttons.cancel') }}
        </Button>
        <Button :disabled="!canSave || saving || loading" @click="handleSave">
          <template v-if="saving">
            <Loader2
              class="text-muted-foreground me-2 inline size-4 animate-spin"
            />
            {{ t('projects.assignEngineers.assigningMessage') }}
          </template>
          <template v-else>
            {{ t('projects.assignEngineers.saveButton') }}
          </template>
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
