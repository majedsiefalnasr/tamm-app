<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { UserPlus } from 'lucide-vue-next'
import type {
  ProjectCreationRequest,
  ProjectCreationRequestSupervisorOption,
} from '#shared/types/projectCreationRequest'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'

const props = defineProps<{
  open: boolean
  request: ProjectCreationRequest | null
  supervisorOptions: ProjectCreationRequestSupervisorOption[]
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  accepted: [payload: { requestId: string; supervisorId: string }]
  rejected: [requestId: string]
}>()

const { t, locale } = useI18n()
const { notify } = useNotifications()

const selectedSupervisorId = ref('')

watch(
  () => props.open,
  isOpen => {
    if (isOpen && props.supervisorOptions.length > 0) {
      selectedSupervisorId.value = props.supervisorOptions[0]!.id
    }
    if (!isOpen) {
      selectedSupervisorId.value = ''
    }
  }
)

const budgetLabel = computed(() => {
  if (!props.request) return ''
  try {
    return new Intl.NumberFormat(locale.value === 'ar' ? 'ar-SA' : 'en-SA', {
      style: 'currency',
      currency: props.request.currency,
      maximumFractionDigits: 0,
    }).format(props.request.budget_amount)
  } catch {
    return String(props.request.budget_amount)
  }
})

const createdLabel = computed(() => {
  if (!props.request) return ''
  try {
    const d = new Date(props.request.created_at)
    if (Number.isNaN(d.getTime())) return ''
    return new Intl.DateTimeFormat(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d)
  } catch {
    return ''
  }
})

function close() {
  emit('update:open', false)
}

/** Reject: `DialogClose` closes the dialog; we only run side effects after tick. */
function handleRejectClick() {
  if (!props.request) return
  const id = props.request.id
  void nextTick(() => {
    emit('rejected', id)
    notify.info(t('admin.projects.creation_requests.toast_rejected_demo'))
  })
}

function handleAccept() {
  if (!props.request || selectedSupervisorId.value.length === 0) {
    notify.error(t('admin.projects.creation_requests.supervisor_required'))
    return
  }
  const payload = {
    requestId: props.request.id,
    supervisorId: selectedSupervisorId.value,
  }
  close()
  void nextTick(() => {
    emit('accepted', payload)
    notify.success(t('admin.projects.creation_requests.toast_accepted_demo'))
  })
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent
      class="max-h-[min(90vh,48rem)] overflow-y-auto sm:max-w-xl"
      :show-close-button="true"
    >
      <template v-if="request">
        <DialogHeader>
          <DialogTitle>
            {{ t('admin.projects.creation_requests.dialog_title') }}
          </DialogTitle>
          <DialogDescription>
            {{
              t('admin.projects.creation_requests.dialog_subtitle', {
                number: request.project_number,
                owner: request.owner_name,
                date: createdLabel,
              })
            }}
          </DialogDescription>
        </DialogHeader>

        <form @submit.prevent="handleAccept">
          <div class="grid gap-4">
            <div class="grid gap-2">
              <h3 class="text-foreground text-lg font-semibold">
                {{ request.title }}
              </h3>
              <div class="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" class="font-normal">
                  {{
                    t(
                      `admin.projects.creation_requests.status.${request.status}`
                    )
                  }}
                </Badge>
                <span class="text-muted-foreground text-sm">{{
                  request.city
                }}</span>
              </div>
            </div>

            <div
              class="grid grid-cols-1 gap-3 sm:grid-cols-3"
              data-testid="creation-request-meta-grid"
            >
              <div
                class="bg-muted/50 border-border/60 grid gap-1 rounded-lg border px-3 py-3"
              >
                <p class="text-muted-foreground text-xs font-medium">
                  {{ t('admin.projects.creation_requests.type_label') }}
                </p>
                <p class="text-foreground text-sm font-semibold">
                  {{
                    t(
                      `admin.projects.creation_requests.types.${request.type_key}`
                    )
                  }}
                </p>
              </div>
              <div
                class="bg-muted/50 border-border/60 grid gap-1 rounded-lg border px-3 py-3"
              >
                <p class="text-muted-foreground text-xs font-medium">
                  {{ t('admin.projects.creation_requests.budget_label') }}
                </p>
                <p class="text-foreground text-sm font-semibold">
                  {{ budgetLabel }}
                </p>
              </div>
              <div
                class="bg-muted/50 border-border/60 grid gap-1 rounded-lg border px-3 py-3"
              >
                <p class="text-muted-foreground text-xs font-medium">
                  {{ t('admin.projects.creation_requests.area_label') }}
                </p>
                <p class="text-foreground text-sm font-semibold">
                  {{
                    t('admin.projects.creation_requests.area_value', {
                      sqm: request.area_sqm,
                    })
                  }}
                </p>
              </div>
            </div>

            <div
              class="border-border bg-card/40 grid gap-3 rounded-lg border p-4"
            >
              <div
                class="text-foreground flex items-center gap-2 font-semibold"
              >
                <UserPlus
                  class="text-primary size-5 shrink-0"
                  aria-hidden="true"
                />
                {{ t('admin.projects.creation_requests.assign_title') }}
              </div>
              <div class="grid gap-2">
                <Label
                  for="creation-request-supervisor"
                  class="text-muted-foreground sr-only"
                >
                  {{ t('admin.projects.creation_requests.supervisor_label') }}
                </Label>
                <Select v-model="selectedSupervisorId">
                  <SelectTrigger
                    id="creation-request-supervisor"
                    class="bg-background w-full"
                  >
                    <SelectValue
                      :placeholder="
                        t(
                          'admin.projects.creation_requests.supervisor_placeholder'
                        )
                      "
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="opt in supervisorOptions"
                      :key="opt.id"
                      :value="opt.id"
                    >
                      {{ opt.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p class="text-muted-foreground text-xs leading-relaxed">
                {{
                  t(
                    'admin.projects.creation_requests.default_contractor_note',
                    {
                      name: request.default_contractor_name,
                    }
                  )
                }}
              </p>
            </div>
          </div>

          <DialogFooter class="mt-4 gap-2 sm:mt-6">
            <DialogClose as-child>
              <Button
                type="button"
                variant="outline"
                @click="handleRejectClick"
              >
                {{ t('admin.projects.creation_requests.reject') }}
              </Button>
            </DialogClose>
            <Button type="submit">
              {{ t('admin.projects.creation_requests.accept') }}
            </Button>
          </DialogFooter>
        </form>
      </template>
    </DialogContent>
  </Dialog>
</template>
