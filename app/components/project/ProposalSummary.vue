<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ProposalData } from '~/shared/types/project'
import { formatCurrency, formatDate } from '~/utils/formatters'
import { Button } from '~/components/ui/button'

interface Props {
  proposal: ProposalData
}

defineProps<Props>()

const { t } = useI18n()

const isNotesExpanded = ref(false)
const maxNotesLength = 100

const truncatedNotes = computed(() => {
  if (!props.proposal.notes) return ''
  if (props.proposal.notes.length <= maxNotesLength) return props.proposal.notes
  return props.proposal.notes.slice(0, maxNotesLength) + '...'
})

const shouldShowToggle = computed(() => {
  return props.proposal.notes && props.proposal.notes.length > maxNotesLength
})
</script>

<template>
  <div class="border-border bg-card space-y-3 rounded-lg border p-4 shadow-sm">
    <h3 class="text-foreground text-sm font-semibold">
      {{ t('projects.submitProposal.proposalSummary') }}
    </h3>

    <!-- Price -->
    <div class="flex items-start justify-between">
      <span class="text-muted-foreground text-xs">{{
        t('projects.submitProposal.priceLabel')
      }}</span>
      <span class="text-primary text-start text-base font-bold">
        {{ formatCurrency(proposal.price) }}
      </span>
    </div>

    <!-- Timeline -->
    <div class="flex items-start justify-between">
      <span class="text-muted-foreground text-xs">{{
        t('projects.submitProposal.timelineLabel')
      }}</span>
      <span class="text-foreground/80 text-start text-sm">
        {{ proposal.estimatedDays }} {{ t('common.days') }}
      </span>
    </div>

    <!-- Notes (if provided) -->
    <div v-if="proposal.notes" class="space-y-1">
      <span class="text-muted-foreground text-xs">{{
        t('projects.submitProposal.notesLabel')
      }}</span>
      <p class="text-foreground/80 text-start text-sm">
        {{ isNotesExpanded ? proposal.notes : truncatedNotes }}
      </p>
      <Button
        v-if="shouldShowToggle"
        variant="ghost"
        size="sm"
        class="text-primary hover:text-primary/80 h-auto p-0 text-xs"
        @click="isNotesExpanded = !isNotesExpanded"
      >
        {{ isNotesExpanded ? t('common.showLess') : t('common.showMore') }}
      </Button>
    </div>

    <!-- Submitted Date -->
    <div class="border-border flex items-start justify-between border-t pt-3">
      <span class="text-muted-foreground text-[10px]">{{
        t('common.submitted')
      }}</span>
      <span class="text-muted-foreground text-[10px]">
        {{ formatDate(proposal.createdAt) }}
      </span>
    </div>
  </div>
</template>
