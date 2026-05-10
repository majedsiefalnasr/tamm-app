<script setup lang="ts">
import type { Milestone } from '~/shared/types/project'
import { useI18n } from 'vue-i18n'
import { formatCurrency } from '~/utils/formatters'
import PaymentStatusTag from '~/components/payment/PaymentStatusTag.vue'
import FieldContextHint from '~/components/common/FieldContextHint.vue'

interface Props {
  milestone: Milestone
}

const props = defineProps<Props>()
const { t } = useI18n()
</script>

<template>
  <div class="bg-card rounded-lg border p-6">
    <h2 class="mb-6 text-xl font-bold">{{ t('milestone.detail.details') }}</h2>

    <!-- Milestone Metadata Grid -->
    <div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
      <!-- Phase/Order -->
      <div>
        <p class="text-muted-foreground mb-2 text-xs font-semibold uppercase">
          {{ t('milestone.detail.phase') }}
        </p>
        <p class="text-ink text-lg font-bold">
          {{ t('milestone.detail.phaseNumber', { number: milestone.order }) }}
        </p>
      </div>

      <!-- Status -->
      <div>
        <div class="mb-2 flex items-center gap-2">
          <p class="text-muted-foreground text-xs font-semibold uppercase">
            {{ t('milestone.detail.status') }}
          </p>
          <FieldContextHint
            hint-key="contextHelpers.milestone.statusVsPayment"
            aria-label-key="common.field_help_status_payment"
          />
        </div>
        <p class="text-ink text-lg font-bold capitalize">
          {{ t(`milestone.status.${milestone.status}`) }}
        </p>
      </div>

      <!-- Budget -->
      <div>
        <p class="text-muted-foreground mb-2 text-xs font-semibold uppercase">
          {{ t('milestone.detail.budget') }}
        </p>
        <p class="text-primary text-lg font-bold">
          {{ formatCurrency(milestone.amount) }}
        </p>
      </div>

      <!-- Payment Status -->
      <div>
        <div class="mb-2 flex items-center gap-2">
          <p class="text-muted-foreground text-xs font-semibold uppercase">
            {{ t('milestone.detail.paymentStatus') }}
          </p>
          <FieldContextHint
            hint-key="contextHelpers.milestone.statusVsPayment"
            aria-label-key="common.field_help_status_payment"
          />
        </div>
        <PaymentStatusTag :milestone="milestone" />
      </div>
    </div>

    <!-- Tasks Section -->
    <div>
      <h3 class="mb-4 text-lg font-bold">{{ t('milestone.detail.tasks') }}</h3>
      <div v-if="milestone.tasks.length > 0" class="space-y-3">
        <div
          v-for="task in milestone.tasks"
          :key="task.id"
          class="bg-muted/30 border-border/50 flex items-start gap-3 rounded-lg border p-3"
        >
          <div class="flex-1 pt-1">
            <p class="text-ink font-medium">{{ task.title }}</p>
            <p
              v-if="task.contractor"
              class="text-muted-foreground mt-1 text-sm"
            >
              {{
                t('milestone.detail.assignedTo', { name: task.contractor.name })
              }}
            </p>
          </div>
          <div v-if="task.completed" class="flex-shrink-0">
            <span
              class="bg-primary/20 text-primary inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
            >
              {{ t('common.completed') }}
            </span>
          </div>
        </div>
      </div>
      <div v-else class="bg-muted/20 rounded-lg p-4 text-center">
        <p class="text-muted-foreground">{{ t('milestone.detail.noTasks') }}</p>
      </div>
    </div>
  </div>
</template>
