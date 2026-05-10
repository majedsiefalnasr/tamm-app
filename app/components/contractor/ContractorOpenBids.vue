<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { Button } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'
import { Badge } from '~/components/ui/badge'
import type { Project, ProposalData } from '~/shared/types/project'

interface Props {
  projects: Project[]
  proposals?: ProposalData[]
  loading?: boolean
  hasError?: boolean
  errorMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  hasError: false,
})

const emit = defineEmits<{
  retry: []
}>()

const router = useRouter()
const { user } = useAuth()

const getProposalStatus = (projectId: string) => {
  const uid = user.value?.id
  return (props.proposals || []).some(
    p => p.projectId === projectId && (!!uid ? p.contractorId === uid : false)
  )
}

const handleSubmitProposal = (projectId: string) => {
  router.push(`/projects/${projectId}/submit-proposal`)
}

const handleViewProposal = (projectId: string) => {
  router.push(`/projects/${projectId}/proposal`)
}

const handleRetry = () => {
  emit('retry')
}
</script>

<template>
  <div class="space-y-4">
    <!-- Section Header -->
    <h2 class="text-ink text-lg font-extrabold">
      {{ $t('dashboard.contractor.openBids') }}
    </h2>

    <!-- Skeleton Loading State -->
    <div v-if="loading" class="grid gap-4 md:grid-cols-2">
      <div
        v-for="i in 2"
        :key="i"
        class="border-border bg-card rounded-2xl border p-4"
      >
        <Skeleton class="mb-3 h-4 w-40" />
        <Skeleton class="h-8 w-24" />
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="hasError"
      class="border-destructive/30 bg-destructive/5 rounded-2xl border p-4"
    >
      <p class="text-destructive mb-3 text-sm font-medium">
        {{ errorMessage || $t('errors.failed_to_load') }}
      </p>
      <Button variant="outline" size="sm" @click="handleRetry">
        {{ $t('common.retry') }}
      </Button>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="projects.length === 0"
      class="border-border/50 bg-card/50 rounded-2xl border p-6 text-center"
    >
      <p class="text-muted-foreground text-sm">
        {{ $t('dashboard.contractor.noOpenBids') }}
      </p>
    </div>

    <!-- Open Bids Grid -->
    <div v-else class="grid gap-4 md:grid-cols-2">
      <div
        v-for="project in projects"
        :key="project.id"
        class="border-border bg-card shadow-card rounded-2xl border p-4"
      >
        <div class="flex flex-col gap-3">
          <!-- Project Header -->
          <div>
            <p class="text-ink text-sm font-semibold">
              {{ project.name }}
            </p>
            <p
              v-if="project.address || project.city"
              class="text-muted-foreground mt-1 text-xs"
            >
              {{ project.address || project.city }}
            </p>
          </div>

          <!-- Proposal Status -->
          <div class="flex items-center justify-between">
            <Badge
              :variant="getProposalStatus(project.id) ? 'default' : 'secondary'"
              :class="
                getProposalStatus(project.id)
                  ? 'bg-primary/15 text-primary'
                  : 'bg-muted text-muted-foreground'
              "
            >
              {{
                getProposalStatus(project.id)
                  ? $t('dashboard.contractor.proposalSubmitted')
                  : $t('dashboard.contractor.proposalNotSubmitted')
              }}
            </Badge>
          </div>

          <!-- Action Button -->
          <Button
            v-if="!getProposalStatus(project.id)"
            variant="default"
            size="sm"
            class="w-full"
            @click="handleSubmitProposal(project.id)"
          >
            {{ $t('dashboard.contractor.submitProposal') }}
          </Button>
          <Button
            v-else
            variant="outline"
            size="sm"
            class="w-full"
            @click="handleViewProposal(project.id)"
          >
            {{ $t('dashboard.contractor.viewProposal') }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
