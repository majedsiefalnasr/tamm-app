<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ProjectCreationRequest } from '#shared/types/projectCreationRequest'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import ProjectCreationRequestReviewDialog from '~/components/admin/ProjectCreationRequestReviewDialog.vue'

const { t, locale } = useI18n()

const { requests, pendingCount, supervisorOptions, removeRequest } =
  useAdminProjectCreationRequests()

const dialogOpen = ref(false)
const selectedRequest = ref<ProjectCreationRequest | null>(null)

function openReview(request: ProjectCreationRequest) {
  selectedRequest.value = request
  dialogOpen.value = true
}

function onAccepted(payload: { requestId: string; supervisorId: string }) {
  void payload.supervisorId
  removeRequest(payload.requestId)
  selectedRequest.value = null
}

function onRejected(requestId: string) {
  removeRequest(requestId)
  selectedRequest.value = null
}

watch(dialogOpen, isOpen => {
  if (!isOpen) {
    selectedRequest.value = null
  }
})

function formatBudget(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(locale.value === 'ar' ? 'ar-SA' : 'en-SA', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return String(amount)
  }
}
</script>

<template>
  <div class="space-y-3" data-testid="project-creation-requests-section">
    <Card v-if="pendingCount > 0" class="border-border shadow-none">
      <CardHeader class="space-y-1 pb-2">
        <CardTitle class="text-lg font-bold">
          {{
            t('admin.projects.creation_requests.section_title', {
              count: pendingCount,
            })
          }}
        </CardTitle>
        <CardDescription class="text-muted-foreground text-sm">
          {{ t('admin.projects.creation_requests.section_subtitle') }}
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-3 pt-0">
        <div
          v-for="req in requests"
          :key="req.id"
          role="button"
          tabindex="0"
          class="border-border hover:bg-muted/40 bg-card/30 flex cursor-pointer flex-col gap-4 rounded-xl border p-4 transition sm:flex-row sm:items-center sm:justify-between"
          data-testid="creation-request-row"
          @click="openReview(req)"
          @keydown.enter.prevent="openReview(req)"
          @keydown.space.prevent="openReview(req)"
        >
          <div class="min-w-0 flex-1 space-y-2 text-start">
            <div class="flex flex-wrap items-center gap-2">
              <Badge variant="outline" class="font-mono text-xs font-semibold">
                #{{ req.project_number }}
              </Badge>
              <Badge variant="secondary" class="text-xs font-medium">
                {{ t(`admin.projects.creation_requests.status.${req.status}`) }}
              </Badge>
            </div>
            <p class="text-foreground text-base font-bold">
              {{ req.title }}
            </p>
            <p class="text-muted-foreground text-sm">
              {{ req.owner_name }}
              <span class="text-muted-foreground/80" aria-hidden="true">
                •
              </span>
              {{ req.city }}
              <span class="text-muted-foreground/80" aria-hidden="true">
                •
              </span>
              {{ formatBudget(req.budget_amount, req.currency) }}
            </p>
          </div>
          <div class="flex shrink-0 justify-end sm:ps-4">
            <Button
              type="button"
              class="pointer-events-auto"
              @click.stop="openReview(req)"
            >
              {{ t('admin.projects.creation_requests.review') }}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <ProjectCreationRequestReviewDialog
      v-model:open="dialogOpen"
      :request="selectedRequest"
      :supervisor-options="supervisorOptions"
      @accepted="onAccepted"
      @rejected="onRejected"
    />
  </div>
</template>
