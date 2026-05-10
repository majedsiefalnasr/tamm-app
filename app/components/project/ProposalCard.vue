<script setup lang="ts">
import type { ProposalData } from '~/shared/types/project'
import { Pill } from '~/components/ui/pill'
import { formatCurrency, formatDate } from '~/utils/formatters'

interface Props {
  proposal: ProposalData
  isSelected?: boolean
  isSelecting?: boolean
  canSelect?: boolean
}

const props = defineProps<Props>()

defineEmits<{
  'select-clicked': []
}>()

const { t } = useI18n()

const showFullNotes = ref(false)
const notes = computed(() => props.proposal.notes || '')
const isNotesLong = computed(() => notes.value.length > 150)

const contractorName = computed(() => props.proposal.contractorName)
</script>

<template>
  <div
    class="border-border bg-card shadow-card rounded-2xl border p-5"
    :class="{ 'opacity-60': isSelected && !canSelect }"
  >
    <!-- Contractor name and price -->
    <div class="space-y-3">
      <h3 class="text-ink text-start text-base font-extrabold">
        {{ contractorName }}
      </h3>
      <p class="text-primary text-start text-2xl font-extrabold">
        {{ formatCurrency(proposal.price) }}
      </p>
    </div>

    <!-- Timeline -->
    <p class="text-muted-foreground mt-2 text-start text-sm">
      {{ proposal.estimatedDays }} {{ t('projects.proposals.daysFormat') }}
    </p>

    <!-- Notes section -->
    <div v-if="notes" class="mt-3">
      <p class="text-foreground/80 text-start text-sm">
        <span v-if="!showFullNotes && isNotesLong">
          {{ notes.substring(0, 150) }}...
          <button
            type="button"
            class="text-primary ps-1 text-sm hover:underline"
            @click="showFullNotes = true"
          >
            {{ t('common.showMore') }}
          </button>
        </span>
        <span v-else>{{ notes }}</span>
      </p>
      <button
        v-if="showFullNotes && isNotesLong"
        type="button"
        class="text-primary mt-1 ps-1 text-sm hover:underline"
        @click="showFullNotes = false"
      >
        {{ t('common.showLess') }}
      </button>
    </div>

    <!-- Submission date -->
    <p class="text-muted-foreground mt-3 text-start text-[11px]">
      {{ t('projects.proposals.submitDate') }}
      {{ formatDate(proposal.createdAt) }}
    </p>

    <!-- Footer: Button or Badge -->
    <div class="mt-4 flex items-center justify-start">
      <template v-if="canSelect && !isSelected">
        <Button
          :disabled="isSelecting"
          class="min-h-11"
          @click="$emit('select-clicked')"
        >
          <span v-if="isSelecting" class="inline-flex items-center gap-2">
            <span class="i-heroicons-arrow-path h-4 w-4 animate-spin" />
            {{ t('projects.proposals.selectingMessage') }}
          </span>
          <span v-else>{{ t('projects.proposals.selectButtonLabel') }}</span>
        </Button>
      </template>
      <template v-else-if="isSelected">
        <Pill variant="primary" class="text-sm">
          {{ t('projects.proposals.selectedBadge') }}
        </Pill>
      </template>
      <template v-else>
        <Pill variant="muted" class="text-sm">
          {{ t('projects.proposals.notSelectedBadge') }}
        </Pill>
      </template>
    </div>
  </div>
</template>
