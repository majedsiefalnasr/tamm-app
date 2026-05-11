<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ProposalData } from '~/shared/types/project'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog'
import { formatCurrency } from '~/utils/formatters'

interface Props {
  projectId: string
  proposals: ProposalData[]
  isLoading?: boolean
  hasError?: boolean
  canSelect?: boolean
  selectedProposalId?: string
  confirmContractorSelection: (data: {
    proposalId: string
    contractorId: string
    price: number
  }) => Promise<{ success: boolean; errorMessage?: string }>
}

const props = defineProps<Props>()
const { t } = useI18n()

const emit = defineEmits<{
  'retry-load': []
}>()

const isSelecting = ref<string | null>(null)
const showConfirmDialog = ref(false)
const pendingProposal = ref<ProposalData | null>(null)
const isConfirming = ref(false)
const selectionDialogError = ref<string | null>(null)

const sortedProposals = computed(() => {
  // Sort by submission date ascending (oldest first)
  return [...props.proposals].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )
})

const onSelectionDialogOpenChange = (open: boolean) => {
  if (isConfirming.value) return
  showConfirmDialog.value = open
  if (!open) {
    pendingProposal.value = null
    selectionDialogError.value = null
    isConfirming.value = false
    isSelecting.value = null
  }
}

const handleSelectClick = (proposal: ProposalData) => {
  pendingProposal.value = proposal
  selectionDialogError.value = null
  showConfirmDialog.value = true
}

const handleConfirmSelection = async () => {
  if (!pendingProposal.value) return

  isConfirming.value = true
  selectionDialogError.value = null
  isSelecting.value = pendingProposal.value.id

  try {
    const result = await props.confirmContractorSelection({
      proposalId: pendingProposal.value.id,
      contractorId: pendingProposal.value.contractorId,
      price: pendingProposal.value.price,
    })

    if (result.success) {
      showConfirmDialog.value = false
      pendingProposal.value = null
      isSelecting.value = null
    } else {
      selectionDialogError.value =
        result.errorMessage ?? t('projects.proposals.selectionFailed')
      isSelecting.value = null
    }
  } catch {
    selectionDialogError.value = t('projects.proposals.selectErrors.network')
    isSelecting.value = null
  } finally {
    isConfirming.value = false
  }
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
      <Button variant="outline" @click="emit('retry-load')">
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

    <!-- Confirmation dialog for contractor selection -->
    <AlertDialog
      :open="showConfirmDialog"
      @update:open="onSelectionDialogOpenChange"
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {{ t('projects.proposals.selectTitle') }}
          </AlertDialogTitle>
        </AlertDialogHeader>

        <!-- Summary block -->
        <div v-if="pendingProposal" class="space-y-4 py-4">
          <div>
            <p class="text-ink text-start text-base font-extrabold">
              {{ pendingProposal.contractorName }}
            </p>
          </div>
          <div>
            <p class="text-primary text-start text-2xl font-extrabold">
              {{ formatCurrency(pendingProposal.price) }}
            </p>
          </div>
          <div>
            <p class="text-muted-foreground text-start text-sm">
              {{ pendingProposal.estimatedDays }}
              {{ t('projects.proposals.daysFormat') }}
            </p>
          </div>
          <div class="bg-alert/10 rounded-lg p-3">
            <p class="text-foreground text-start text-sm">
              {{ t('projects.proposals.selectWarning') }}
            </p>
          </div>
          <p
            v-if="selectionDialogError"
            class="text-destructive text-start text-sm font-medium"
            role="alert"
          >
            {{ selectionDialogError }}
          </p>
        </div>

        <div class="flex w-full flex-wrap items-center justify-between gap-2">
          <AlertDialogCancel
            :disabled="isConfirming"
            class="border-border text-foreground rounded-lg border px-4 py-2 text-sm font-medium"
          >
            {{ t('projects.proposals.selectCancel') }}
          </AlertDialogCancel>
          <AlertDialogAction
            :disabled="isConfirming"
            class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
            @click.prevent="handleConfirmSelection"
          >
            <span v-if="isConfirming" class="inline-flex items-center gap-2">
              <span class="i-heroicons-arrow-path h-4 w-4 animate-spin" />
              {{ t('projects.proposals.selectingContractor') }}
            </span>
            <span v-else-if="selectionDialogError">{{
              t('projects.proposals.selectRetry')
            }}</span>
            <span v-else>{{ t('projects.proposals.selectConfirm') }}</span>
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  </section>
</template>
