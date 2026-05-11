<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from '~/composables/useAuth'
import SectionErrorCard from '~/components/common/SectionErrorCard.vue'
import { Button } from '~/components/ui/button'
import { Card } from '~/components/ui/card'
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
      <Card v-for="i in 2" :key="i" class="gap-0 rounded-2xl p-4 shadow-none">
        <Skeleton class="mb-3 h-4 w-40" />
        <Skeleton class="h-8 w-24" />
      </Card>
    </div>

    <!-- Error State -->
    <SectionErrorCard
      v-else-if="hasError"
      title-key="common.error_occurred"
      :detail="errorMessage || $t('errors.failed_to_load')"
      @retry="handleRetry"
    />

    <!-- Empty State -->
    <Card
      v-else-if="projects.length === 0"
      class="border-border/50 bg-card/50 gap-0 rounded-2xl p-6 text-center shadow-none"
    >
      <p class="text-muted-foreground text-sm">
        {{ $t('dashboard.contractor.noOpenBids') }}
      </p>
    </Card>

    <!-- Open Bids Grid -->
    <div v-else class="grid gap-4 md:grid-cols-2">
      <Card
        v-for="project in projects"
        :key="project.id"
        class="shadow-card gap-0 rounded-2xl p-4 shadow-none"
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
      </Card>
    </div>
  </div>
</template>
