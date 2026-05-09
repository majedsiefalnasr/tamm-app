<script setup lang="ts">
import type { ProposalData } from '~/shared/types/project'

interface Props {
  projectId: string
  proposals: ProposalData[]
  isLoading?: boolean
  hasError?: boolean
  canSelect?: boolean
  selectedProposalId?: string
}

const props = defineProps<Props>()
const { t } = useI18n()

const isSelecting = ref<string | null>(null)

const sortedProposals = computed(() => {
  // Sort by submission date ascending (oldest first)
  return [...props.proposals].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )
})

const emit = defineEmits<{
  'proposal-selected': [
    { proposalId: string; contractorId: string; price: number },
  ]
  'retry-load': []
}>()

const handleSelectClick = async (proposal: ProposalData) => {
  isSelecting.value = proposal.id
  emit('proposal-selected', {
    proposalId: proposal.id,
    contractorId: proposal.contractorId,
    price: proposal.price,
  })
}
</script>

<template>
  <section class="space-y-4">
    <!-- Section title -->
    <div class="flex items-center justify-between">
      <h2 class="text-ink text-lg font-extrabold">
        {{ t('projects.proposals.sectionTitle') }}
      </h2>
      <span
        v-if="!isLoading && !hasError"
        class="text-muted-foreground text-sm"
      >
        {{ proposals.length }}
        {{ proposals.length === 1 ? 'proposal' : 'proposals' }}
      </span>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="space-y-3">
      <PageSkeleton :count="3" />
    </div>

    <!-- Error state -->
    <div
      v-else-if="hasError"
      class="border-border bg-card rounded-2xl border p-6 text-center"
    >
      <p class="text-foreground/80 mb-4 text-sm">
        {{ t('projects.proposals.loadingError') }}
      </p>
      <Button variant="outline" @click="$emit('retry-load')">
        {{ t('projects.proposals.retryButton') }}
      </Button>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="sortedProposals.length === 0"
      class="border-border bg-card rounded-2xl border p-8 text-center"
    >
      <p class="text-muted-foreground text-sm">
        {{ t('projects.proposals.noProposals') }}
      </p>
    </div>

    <!-- Proposals list -->
    <div v-else class="grid gap-4">
      <ProposalCard
        v-for="proposal in sortedProposals"
        :key="proposal.id"
        :proposal="proposal"
        :is-selected="proposal.id === selectedProposalId"
        :is-selecting="isSelecting === proposal.id"
        :can-select="canSelect && proposal.id !== selectedProposalId"
        @select-clicked="handleSelectClick(proposal)"
      />
    </div>
  </section>
</template>
