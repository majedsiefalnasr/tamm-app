<script setup lang="ts">
import { computed } from 'vue'
import type { Milestone, ProjectDetail, Report } from '~/shared/types/project'
import { formatDate } from '~/utils/formatters'
import {
  buildMilestoneTrustTimeline,
  type MilestoneTrustTimelineEvent,
} from '~/utils/milestoneTrustTimeline'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/vue/24/outline'
import { Badge } from '~/components/ui/badge'
import { Separator } from '~/components/ui/separator'
import { Skeleton } from '~/components/ui/skeleton'
import { usePermission } from '~/composables/usePermission'

interface Props {
  milestone: Milestone
  project?: ProjectDetail | null
  reports?: Report[]
  pending?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  project: null,
  reports: () => [],
  pending: false,
})

const { t } = useI18n()
const { can } = usePermission()

const canViewPayment = computed(() => can('view_payment_status'))

const timeline = computed((): MilestoneTrustTimelineEvent[] => {
  return buildMilestoneTrustTimeline({
    milestone: props.milestone,
    project: props.project ?? undefined,
    reports:
      props.reports.length > 0
        ? props.reports
        : props.milestone.latest_report
          ? [props.milestone.latest_report]
          : [],
    canViewPayment: canViewPayment.value,
  })
})

const eventTitleKey = (kind: MilestoneTrustTimelineEvent['kind']): string =>
  `milestone.trustTimeline.events.${kind}`

const badgeVariantForKind = (
  kind: MilestoneTrustTimelineEvent['kind']
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  if (kind === 'decision_rejected') return 'destructive'
  if (kind === 'payout_completed' || kind === 'client_approved')
    return 'default'
  if (kind === 'payment_confirmed') return 'secondary'
  return 'outline'
}

const getIcon = (kind: MilestoneTrustTimelineEvent['kind']) => {
  if (kind === 'client_approved') return CheckCircleIcon
  if (kind === 'decision_rejected') return XCircleIcon
  return undefined
}

const actorLabel = (entry: MilestoneTrustTimelineEvent): string => {
  const a = entry.actor
  if (!a || a.kind === 'system') {
    return t('milestone.trustTimeline.actor.system')
  }
  const role = a.roleKey ? t(a.roleKey) : ''
  if (a.name && role) return `${a.name} (${role})`
  return a.name || role || t('milestone.trustTimeline.actor.system')
}
</script>

<template>
  <div class="bg-card rounded-lg border p-6">
    <h2 class="mb-8 text-xl font-bold">
      {{ t('milestone.trustTimeline.title') }}
    </h2>

    <div v-if="pending" class="space-y-5">
      <div v-for="n in 4" :key="n" class="flex gap-4">
        <Skeleton class="h-10 w-10 shrink-0 rounded-full" />
        <div class="flex-1 space-y-2 pt-1">
          <Skeleton class="h-4 w-full max-w-xs" />
          <Skeleton class="h-3 w-full max-w-[14rem]" />
          <Skeleton class="h-3 w-full max-w-md" />
        </div>
      </div>
    </div>

    <div v-else class="relative">
      <div class="space-y-4">
        <template v-for="(entry, index) in timeline" :key="entry.id">
          <Separator v-if="index > 0" />
          <div class="flex gap-4">
            <div class="flex flex-col items-center">
              <div
                class="border-border bg-muted text-muted-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-full border font-bold"
              >
                <component
                  :is="getIcon(entry.kind)"
                  v-if="getIcon(entry.kind)"
                  class="text-foreground h-6 w-6"
                />
                <span v-else class="text-sm">{{ index + 1 }}</span>
              </div>
            </div>

            <div class="min-w-0 flex-1 pt-1">
              <div class="flex flex-wrap items-start justify-between gap-2">
                <div class="flex min-w-0 flex-wrap items-center gap-2">
                  <p class="text-ink font-semibold">
                    {{ t(eventTitleKey(entry.kind)) }}
                  </p>
                  <Badge :variant="badgeVariantForKind(entry.kind)">
                    {{ t(`milestone.trustTimeline.badges.${entry.kind}`) }}
                  </Badge>
                </div>
              </div>
              <p class="text-muted-foreground mt-1 text-sm">
                {{ formatDate(entry.timestamp) }}
              </p>
              <p class="text-muted-foreground mt-2 text-sm">
                {{ actorLabel(entry) }}
              </p>

              <div v-if="entry.evidenceAnchor" class="mt-3">
                <a
                  class="text-primary text-sm underline-offset-4 hover:underline"
                  :href="entry.evidenceAnchor"
                >
                  {{ t('milestone.trustTimeline.evidenceLink') }}
                </a>
              </div>

              <div
                v-if="
                  entry.kind === 'decision_rejected' && entry.rejection_reason
                "
                class="border-destructive/20 bg-destructive/10 mt-3 rounded-lg border p-3"
              >
                <p
                  class="text-destructive mb-1 text-xs font-semibold uppercase"
                >
                  {{ t('milestone.trustTimeline.rejectionCaption') }}
                </p>
                <p class="text-foreground text-sm whitespace-pre-wrap">
                  {{ entry.rejection_reason }}
                </p>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
