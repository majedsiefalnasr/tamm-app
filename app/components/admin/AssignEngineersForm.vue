<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Skeleton } from '../ui/skeleton'
import { useAdminUsers } from '~/composables/useAdminUsers'
import { useProjects } from '~/composables/useProjects'
import { usePermission } from '~/composables/usePermission'
import { toast } from 'vue-sonner'
import type {
  ProjectDetail,
  AssignEngineersPayload,
} from '~/shared/types/project'

interface Props {
  projectId: string
  project: ProjectDetail
}

type Emits = {
  success: []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { $t } = useI18n()
const { can } = usePermission()
const { assignEngineers } = useProjects()
const { fetchEngineersByRole } = useAdminUsers()

const supervisorEngineers = ref<Array<{ id: string; name: string }>>([])
const fieldEngineers = ref<Array<{ id: string; name: string }>>([])
const loadingEngineers = ref(false)
const assigningEngineers = ref(false)

// Validation schema with cross-field validation
const assignEngineersSchema = z
  .object({
    supervisor_engineer_id: z.string().min(1, $t('errors.supervisor_required')),
    field_engineer_id: z.string().min(1, $t('errors.field_required')),
  })
  .refine(data => data.supervisor_engineer_id !== data.field_engineer_id, {
    message: $t('errors.same_engineer'),
    path: ['field_engineer_id'],
  })

const { values, handleSubmit, errors, setFieldError, resetForm } =
  useForm<AssignEngineersPayload>({
    validationSchema: toTypedSchema(assignEngineersSchema),
    initialValues: {
      supervisor_engineer_id: props.project?.supervisor_engineer_id || '',
      field_engineer_id: props.project?.field_engineer_id || '',
    },
  })

// Fetch engineers on mount
onMounted(async () => {
  loadingEngineers.value = true
  try {
    // Fetch both engineer lists in parallel
    const [supervisors, fields] = await Promise.all([
      fetchEngineersByRole('supervisor_engineer' as any),
      fetchEngineersByRole('field_engineer' as any),
    ])

    supervisorEngineers.value = supervisors
    fieldEngineers.value = fields

    // Update form initial values with current project assignments
    if (
      supervisorEngineers.value.length === 0 ||
      fieldEngineers.value.length === 0
    ) {
      toast.error($t('errors.failed_to_load_engineers'))
    }
  } catch (error) {
    console.error('Failed to load engineers:', error)
    toast.error($t('errors.failed_to_load_engineers'))
  } finally {
    loadingEngineers.value = false
  }
})

const onSubmit = handleSubmit(async (formValues: AssignEngineersPayload) => {
  // Permission check
  if (!can('assign_engineers')) {
    toast.error($t('errors.permission_denied'))
    return
  }

  assigningEngineers.value = true
  try {
    const result = await assignEngineers(
      props.projectId,
      formValues.supervisor_engineer_id,
      formValues.field_engineer_id
    )

    if (result.success) {
      toast.success($t('errors.engineers_assigned'))
      emit('success')
    } else {
      toast.error(result.error || $t('errors.engineers_assignment_failed'))
    }
  } catch (error: any) {
    if (error?.data?.error?.errors) {
      Object.entries(error.data.error.errors).forEach(([field, messages]) => {
        setFieldError(field, (messages as string[])[0])
      })
    } else {
      toast.error($t('errors.engineers_assignment_failed'))
    }
  } finally {
    assigningEngineers.value = false
  }
})

const handleCancel = () => {
  resetForm()
  emit('close')
}
</script>

<template>
  <form class="space-y-4" @submit="onSubmit">
    <!-- Supervisor Engineer Select -->
    <div class="space-y-1.5">
      <Label for="supervisor" class="text-start">{{
        $t('admin.projects.assign_engineers.supervisor_label')
      }}</Label>
      <div v-if="loadingEngineers" class="space-y-2">
        <Skeleton class="h-10 w-full" />
      </div>
      <div
        v-else-if="supervisorEngineers.length === 0"
        class="text-muted-foreground text-sm"
      >
        {{ $t('errors.failed_to_load_engineers') }}
      </div>
      <Select v-else v-model="values.supervisor_engineer_id">
        <SelectTrigger
          id="supervisor"
          :class="{ 'border-destructive': errors.supervisor_engineer_id }"
        >
          <SelectValue
            :placeholder="
              $t('admin.projects.assign_engineers.supervisor_placeholder')
            "
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="engineer in supervisorEngineers"
            :key="engineer.id"
            :value="engineer.id"
          >
            {{ engineer.name }}
          </SelectItem>
        </SelectContent>
      </Select>
      <div
        v-if="errors.supervisor_engineer_id"
        class="text-destructive text-start text-xs"
        :aria-describedby="`supervisor-error`"
      >
        {{ errors.supervisor_engineer_id }}
      </div>
    </div>

    <!-- Field Engineer Select -->
    <div class="space-y-1.5">
      <Label for="field" class="text-start">{{
        $t('admin.projects.assign_engineers.field_label')
      }}</Label>
      <div v-if="loadingEngineers" class="space-y-2">
        <Skeleton class="h-10 w-full" />
      </div>
      <div
        v-else-if="fieldEngineers.length === 0"
        class="text-muted-foreground text-sm"
      >
        {{ $t('errors.failed_to_load_engineers') }}
      </div>
      <Select v-else v-model="values.field_engineer_id">
        <SelectTrigger
          id="field"
          :class="{ 'border-destructive': errors.field_engineer_id }"
        >
          <SelectValue
            :placeholder="
              $t('admin.projects.assign_engineers.field_placeholder')
            "
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="engineer in fieldEngineers"
            :key="engineer.id"
            :value="engineer.id"
          >
            {{ engineer.name }}
          </SelectItem>
        </SelectContent>
      </Select>
      <div
        v-if="errors.field_engineer_id"
        class="text-destructive text-start text-xs"
        :aria-describedby="`field-error`"
      >
        {{ errors.field_engineer_id }}
      </div>
    </div>

    <!-- Form Actions -->
    <div class="flex gap-3 pt-4">
      <Button
        type="button"
        variant="ghost"
        class="flex-1"
        :disabled="assigningEngineers"
        @click="handleCancel"
      >
        {{ $t('admin.projects.assign_engineers.cancel') }}
      </Button>
      <Button
        type="submit"
        class="flex-1"
        :disabled="assigningEngineers || loadingEngineers"
        :loading="assigningEngineers"
      >
        {{ $t('admin.projects.assign_engineers.submit') }}
      </Button>
    </div>
  </form>
</template>
