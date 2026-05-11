<script setup lang="ts">
import type { Component } from 'vue'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type {
  ProjectDetailActivityIcon,
  ProjectDetailActivityTone,
} from '#shared/types/projectDetailLovable'
import type { Milestone, ProjectDetail } from '~/shared/types/project'
import {
  Activity,
  Banknote,
  Building2,
  CalendarDays,
  Check,
  Download,
  FileText,
  Layers,
  Link2,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  MessageSquarePlus,
  Phone,
  Plus,
  UserRound,
  Wallet,
} from 'lucide-vue-next'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Progress } from '~/components/ui/progress'
import { formatCurrency, formatDate } from '~/utils/formatters'
import {
  MOCK_PROJECT_DETAIL_ACTIVITIES,
  MOCK_PROJECT_DETAIL_CLIENT_CONTACT,
  MOCK_PROJECT_DETAIL_FIELD_REPORTS,
  MOCK_PROJECT_DETAIL_SCHEDULE,
} from '~/composables/__mocks__/project-detail-lovable'

const props = defineProps<{
  project: ProjectDetail
  progressPercent: number
  showFinancial: boolean
}>()

const { t } = useI18n()
const { notify } = useNotifications()

const activityIconMap: Record<ProjectDetailActivityIcon, Component> = {
  plus: Plus,
  banknote: Banknote,
  check: Check,
  user: UserRound,
  'file-text': FileText,
  link: Link2,
}

function activityToneWrapClass(tone: ProjectDetailActivityTone): string {
  if (tone === 'blue') {
    return 'flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 shadow-sm dark:bg-blue-950/55 dark:text-blue-300'
  }
  if (tone === 'green') {
    return 'flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-sm dark:bg-emerald-950/45 dark:text-emerald-300'
  }
  if (tone === 'purple') {
    return 'flex size-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 shadow-sm dark:bg-violet-950/50 dark:text-violet-300'
  }
  return 'flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800 shadow-sm dark:bg-amber-950/45 dark:text-amber-200'
}

function activityActorLabel(actorKey: string): string {
  const key = `projects.detailLovable.activity_actor.${actorKey}` as const
  const translated = t(key)
  return translated === key ? actorKey : translated
}

const projectNumberLabel = computed(() => `#PRJ-${String(props.project.id)}`)

function statusLabel(status: string) {
  const key = `project.status.${status}` as const
  const translated = t(key)
  return translated === key ? status : translated
}

function milestoneLabel(status: string) {
  const key = `project.milestone.${status}` as const
  const translated = t(key)
  return translated === key ? status : translated
}

function stageBucket(status: string): 'completed' | 'in_progress' | 'planned' {
  if (status === 'approved') return 'completed'
  if (
    [
      'in_progress',
      'under_review',
      'supervisor_approved',
      'submitted',
      'rejected',
    ].includes(status)
  ) {
    return 'in_progress'
  }
  return 'planned'
}

function milestoneProgressPercent(
  bucket: 'completed' | 'in_progress' | 'planned'
): number {
  if (bucket === 'completed') return 100
  if (bucket === 'in_progress') return 65
  return 4
}

function milestoneStatusPillClass(
  bucket: 'completed' | 'in_progress' | 'planned'
): string {
  if (bucket === 'completed') {
    return 'inline-flex items-center rounded-full px-2 py-1 text-xs font-bold bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-200'
  }
  if (bucket === 'in_progress') {
    return 'inline-flex items-center rounded-full px-2 py-1 text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100'
  }
  return 'inline-flex items-center rounded-full px-2 py-1 text-xs font-bold bg-muted text-muted-foreground'
}

function milestoneIconWrapClass(
  bucket: 'completed' | 'in_progress' | 'planned'
): string {
  if (bucket === 'completed') {
    return 'flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm dark:bg-emerald-600'
  }
  if (bucket === 'in_progress') {
    return 'flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-400 text-white shadow-sm dark:bg-amber-500'
  }
  return 'flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-muted-foreground/45 bg-background text-muted-foreground shadow-sm'
}

function milestoneBarFillClass(
  bucket: 'completed' | 'in_progress' | 'planned'
): string {
  if (bucket === 'completed') {
    return 'h-full max-w-full rounded-full bg-emerald-600 transition-all dark:bg-emerald-500'
  }
  if (bucket === 'in_progress') {
    return 'h-full max-w-full rounded-full bg-amber-400 transition-all dark:bg-amber-500'
  }
  return 'h-full max-w-full rounded-full bg-muted-foreground/25 transition-all'
}

function milestonePillText(
  bucket: 'completed' | 'in_progress' | 'planned',
  status: string
): string {
  if (bucket === 'planned') return t('projects.detailLovable.milestone_locked')
  return milestoneLabel(status)
}

function reportStatusPillClass(statusKey: 'approved' | 'pending'): string {
  if (statusKey === 'approved') {
    return 'inline-flex items-center rounded-full px-2 py-1 text-xs font-bold bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-200'
  }
  return 'inline-flex items-center rounded-full px-2 py-1 text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-200'
}

function scheduleStatusPillClass(
  statusKey: 'completed' | 'in_progress'
): string {
  if (statusKey === 'completed') {
    return 'inline-flex items-center rounded-full px-2 py-1 text-xs font-bold bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-200'
  }
  return 'inline-flex items-center rounded-full px-2 py-1 text-xs font-bold bg-red-100 text-red-700'
}

const clientMailtoHref = computed(
  () => `mailto:${MOCK_PROJECT_DETAIL_CLIENT_CONTACT.email}`
)

const clientTelHref = computed(() => {
  const raw = MOCK_PROJECT_DETAIL_CLIENT_CONTACT.phone
  const normalized = raw.replace(/[\s()-]/g, '')
  return `tel:${normalized}`
})

const sortedMilestones = computed(() =>
  [...props.project.milestones].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
)

function milestoneMeta(m: Milestone) {
  const start = m.created_at ? formatDate(m.created_at) : ''
  const end = m.updated_at ? formatDate(m.updated_at) : ''
  return { start, end }
}

function onDownloadReport() {
  notify.info(t('projects.detailLovable.download_demo'))
}

const remainingAmount = computed(
  () => props.project.total_amount - props.project.total_paid
)

const completedMilestonesCount = computed(
  () => props.project.milestones.filter(m => m.status === 'approved').length
)

const totalMilestonesCount = computed(() => props.project.milestones.length)

const milestoneTimelineRef = ref<HTMLElement | null>(null)
const activityTimelineRef = ref<HTMLElement | null>(null)
const milestoneSpineStyle = ref<Record<string, string>>({})
const activitySpineStyle = ref<Record<string, string>>({})

let milestoneResizeObserver: ResizeObserver | null = null
let activityResizeObserver: ResizeObserver | null = null

function updateMilestoneSpine() {
  const root = milestoneTimelineRef.value
  if (!root || sortedMilestones.value.length < 2) {
    milestoneSpineStyle.value = {}
    return
  }
  const icons = root.querySelectorAll<HTMLElement>('[data-timeline-icon]')
  if (icons.length < 2) {
    milestoneSpineStyle.value = {}
    return
  }
  const r = root.getBoundingClientRect()
  const first = icons[0]!.getBoundingClientRect()
  const last = icons[icons.length - 1]!.getBoundingClientRect()
  const top = first.top - r.top + first.height / 2
  const bottom = last.top - r.top + last.height / 2
  milestoneSpineStyle.value = {
    top: `${top}px`,
    height: `${Math.max(0, bottom - top)}px`,
  }
}

function updateActivitySpine() {
  const root = activityTimelineRef.value
  if (!root || MOCK_PROJECT_DETAIL_ACTIVITIES.length < 2) {
    activitySpineStyle.value = {}
    return
  }
  const icons = root.querySelectorAll<HTMLElement>('[data-timeline-icon]')
  if (icons.length < 2) {
    activitySpineStyle.value = {}
    return
  }
  const r = root.getBoundingClientRect()
  const first = icons[0]!.getBoundingClientRect()
  const last = icons[icons.length - 1]!.getBoundingClientRect()
  const top = first.top - r.top + first.height / 2
  const bottom = last.top - r.top + last.height / 2
  activitySpineStyle.value = {
    top: `${top}px`,
    height: `${Math.max(0, bottom - top)}px`,
  }
}

function updateTimelineSpines() {
  updateMilestoneSpine()
  updateActivitySpine()
}

function attachMilestoneResizeObserver() {
  milestoneResizeObserver?.disconnect()
  milestoneResizeObserver = null
  const el = milestoneTimelineRef.value
  if (!el || typeof ResizeObserver === 'undefined') return
  milestoneResizeObserver = new ResizeObserver(() => {
    updateMilestoneSpine()
  })
  milestoneResizeObserver.observe(el)
}

function attachActivityResizeObserver() {
  activityResizeObserver?.disconnect()
  activityResizeObserver = null
  const el = activityTimelineRef.value
  if (!el || typeof ResizeObserver === 'undefined') return
  activityResizeObserver = new ResizeObserver(() => {
    updateActivitySpine()
  })
  activityResizeObserver.observe(el)
}

watch(milestoneTimelineRef, () => {
  void nextTick(() => {
    updateMilestoneSpine()
    attachMilestoneResizeObserver()
  })
})

watch(activityTimelineRef, () => {
  void nextTick(() => {
    updateActivitySpine()
    attachActivityResizeObserver()
  })
})

onMounted(() => {
  void nextTick(() => {
    updateTimelineSpines()
    attachMilestoneResizeObserver()
    attachActivityResizeObserver()
  })
})

onBeforeUnmount(() => {
  milestoneResizeObserver?.disconnect()
  activityResizeObserver?.disconnect()
  milestoneResizeObserver = null
  activityResizeObserver = null
})

watch(
  sortedMilestones,
  () => {
    void nextTick(() => updateMilestoneSpine())
  },
  { deep: true }
)
</script>

<template>
  <div class="space-y-6">
    <!-- Hero -->
    <Card
      class="border-border shadow-card overflow-hidden rounded-3xl border"
      :style="{
        background:
          'linear-gradient(to inline-start, color-mix(in oklch, var(--primary) 14%, transparent), var(--card))',
      }"
    >
      <CardContent class="space-y-5 p-6 md:p-8">
        <div
          class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
        >
          <div class="flex flex-wrap items-center gap-2">
            <Badge
              class="border-primary/30 bg-primary/10 text-primary font-semibold"
            >
              {{ statusLabel(project.status) }}
            </Badge>
          </div>
          <div
            class="flex max-w-full flex-wrap gap-2 sm:ms-auto sm:justify-end rtl:sm:justify-start"
          >
            <Button type="button" variant="outline" class="gap-2" as-child>
              <NuxtLink to="/messages">
                <MessageSquarePlus class="size-4 shrink-0" aria-hidden="true" />
                {{ t('projects.detailLovable.start_chat') }}
              </NuxtLink>
            </Button>
            <Button type="button" variant="outline" class="gap-2" as-child>
              <NuxtLink to="/messages">
                <MessageSquare class="size-4 shrink-0" aria-hidden="true" />
                {{ t('projects.detailLovable.chats') }}
              </NuxtLink>
            </Button>
            <Button type="button" class="gap-2" @click="onDownloadReport">
              <Download class="size-4 shrink-0" aria-hidden="true" />
              {{ t('projects.detailLovable.download_report') }}
            </Button>
          </div>
        </div>

        <div class="space-y-2">
          <h1
            class="text-foreground text-2xl font-extrabold tracking-tight md:text-3xl"
          >
            {{ project.name }}
          </h1>
          <p class="text-muted-foreground font-mono text-sm">
            {{ projectNumberLabel }}
          </p>
        </div>

        <div
          class="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2 text-sm"
        >
          <span class="inline-flex items-center gap-1.5">
            <MapPin class="text-primary size-4 shrink-0" aria-hidden="true" />
            {{ project.city }}
          </span>
          <span
            v-if="project.contractor_name"
            class="inline-flex items-center gap-1.5"
          >
            <Building2
              class="text-primary size-4 shrink-0"
              aria-hidden="true"
            />
            {{ project.contractor_name }}
          </span>
          <span
            v-if="project.supervisor_name"
            class="inline-flex items-center gap-1.5"
          >
            <UserRound
              class="text-primary size-4 shrink-0"
              aria-hidden="true"
            />
            {{ project.supervisor_name }}
          </span>
        </div>

        <div v-if="showFinancial" class="space-y-2">
          <div class="flex items-center justify-between gap-2">
            <span class="text-foreground text-sm font-semibold">
              {{ t('project.details.progressLabel') }}
            </span>
            <span
              class="text-muted-foreground text-sm font-medium tabular-nums"
            >
              {{ progressPercent }}%
            </span>
          </div>
          <Progress
            :model-value="progressPercent"
            class="bg-primary/15 h-2.5"
          />
        </div>

        <slot name="adminActions" />
      </CardContent>
    </Card>

    <!-- Client contact -->
    <Card class="shadow-card rounded-2xl border shadow-none">
      <CardHeader class="pb-2">
        <CardTitle class="text-lg font-bold">
          {{ t('projects.detailLovable.client_section_title') }}
        </CardTitle>
        <CardDescription>
          {{ t('projects.detailLovable.client_section_subtitle') }}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid gap-3 sm:grid-cols-3">
          <div
            class="border-border bg-muted/30 flex items-start gap-3 rounded-xl border p-4"
          >
            <UserRound
              class="text-primary mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <div class="min-w-0">
              <p class="text-muted-foreground text-xs font-medium">
                {{ t('project.details.clientName') }}
              </p>
              <p class="text-foreground text-sm font-semibold">
                {{ project.client_name }}
              </p>
            </div>
          </div>
          <a
            :href="clientMailtoHref"
            class="border-border bg-muted/30 hover:border-primary/40 hover:bg-muted/50 focus-visible:ring-ring flex items-start gap-3 rounded-xl border p-4 transition-colors focus-visible:ring-2 focus-visible:outline-none"
            :aria-label="t('projects.detailLovable.client_email_action')"
          >
            <Mail
              class="text-primary mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <div class="min-w-0">
              <p class="text-muted-foreground text-xs font-medium">
                {{ t('projects.detailLovable.email') }}
              </p>
              <p class="text-foreground truncate text-sm font-semibold">
                {{ MOCK_PROJECT_DETAIL_CLIENT_CONTACT.email }}
              </p>
            </div>
          </a>
          <a
            :href="clientTelHref"
            class="border-border bg-muted/30 hover:border-primary/40 hover:bg-muted/50 focus-visible:ring-ring flex items-start gap-3 rounded-xl border p-4 transition-colors focus-visible:ring-2 focus-visible:outline-none"
            :aria-label="t('projects.detailLovable.client_phone_action')"
          >
            <Phone
              class="text-primary mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <div class="min-w-0">
              <p class="text-muted-foreground text-xs font-medium">
                {{ t('projects.detailLovable.phone') }}
              </p>
              <p class="text-foreground text-sm font-semibold" dir="ltr">
                {{ MOCK_PROJECT_DETAIL_CLIENT_CONTACT.phone }}
              </p>
            </div>
          </a>
        </div>
      </CardContent>
    </Card>

    <!-- Metrics -->
    <div v-if="showFinancial" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Card class="shadow-card rounded-2xl border py-0 shadow-none">
        <CardContent class="flex items-center justify-between gap-3 p-4">
          <div class="min-w-0">
            <p class="text-muted-foreground text-xs font-medium">
              {{ t('projects.detailLovable.metric_budget') }}
            </p>
            <p
              class="text-foreground text-2xl font-extrabold tracking-tight tabular-nums"
            >
              {{
                formatCurrency(project.total_amount, project.currency || 'EGP')
              }}
            </p>
          </div>
          <div
            class="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg"
          >
            <Wallet class="size-4" aria-hidden="true" />
          </div>
        </CardContent>
      </Card>
      <Card class="shadow-card rounded-2xl border py-0 shadow-none">
        <CardContent class="flex items-center justify-between gap-3 p-4">
          <div class="min-w-0">
            <p class="text-muted-foreground text-xs font-medium">
              {{ t('projects.detailLovable.metric_paid') }}
            </p>
            <p
              class="text-foreground text-2xl font-extrabold tracking-tight tabular-nums"
            >
              {{
                formatCurrency(project.total_paid, project.currency || 'EGP')
              }}
            </p>
          </div>
          <div
            class="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg"
          >
            <Layers class="size-4" aria-hidden="true" />
          </div>
        </CardContent>
      </Card>
      <Card class="shadow-card rounded-2xl border py-0 shadow-none">
        <CardContent class="flex items-center justify-between gap-3 p-4">
          <div class="min-w-0">
            <p class="text-muted-foreground text-xs font-medium">
              {{ t('projects.detailLovable.metric_remaining') }}
            </p>
            <p
              class="text-foreground text-2xl font-extrabold tracking-tight tabular-nums"
            >
              {{ formatCurrency(remainingAmount, project.currency || 'EGP') }}
            </p>
          </div>
          <div
            class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-800 dark:text-amber-200"
          >
            <CalendarDays class="size-4" aria-hidden="true" />
          </div>
        </CardContent>
      </Card>
      <Card class="shadow-card rounded-2xl border py-0 shadow-none">
        <CardContent class="flex items-center justify-between gap-3 p-4">
          <div class="min-w-0">
            <p class="text-muted-foreground text-xs font-medium">
              {{ t('projects.detailLovable.metric_stages') }}
            </p>
            <p
              class="text-foreground text-2xl font-extrabold tracking-tight tabular-nums"
            >
              {{ completedMilestonesCount }} / {{ totalMilestonesCount || '—' }}
            </p>
          </div>
          <div
            class="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg"
          >
            <Layers class="size-4" aria-hidden="true" />
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Stages / milestones -->
    <Card class="shadow-card rounded-2xl border shadow-none">
      <CardHeader>
        <CardTitle class="text-lg font-bold">
          {{ t('projects.detailLovable.stages_title') }}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <template v-if="sortedMilestones.length">
          <div ref="milestoneTimelineRef" class="relative space-y-4">
            <div
              v-if="sortedMilestones.length > 1"
              aria-hidden="true"
              class="border-muted-foreground/45 pointer-events-none absolute inset-s-[calc(1.125rem-1px)] w-0 border-s-2 border-dotted"
              :style="milestoneSpineStyle"
            />
            <div
              v-for="(m, idx) in sortedMilestones"
              :key="m.id"
              class="relative z-10 flex items-start gap-2 sm:gap-3"
            >
              <div
                class="bg-card flex w-9 shrink-0 justify-center rounded-full pt-0.5 sm:w-10"
              >
                <div
                  data-timeline-icon
                  :class="milestoneIconWrapClass(stageBucket(m.status))"
                >
                  <Check
                    v-if="stageBucket(m.status) === 'completed'"
                    class="size-4"
                  />
                  <Activity
                    v-else-if="stageBucket(m.status) === 'in_progress'"
                    class="size-4"
                  />
                  <Lock v-else class="size-3" />
                </div>
              </div>
              <article
                class="border-border bg-card text-card-foreground min-w-0 flex-1 overflow-hidden rounded-2xl border shadow-sm"
                :class="
                  stageBucket(m.status) === 'planned' &&
                  'opacity-95 saturate-75'
                "
              >
                <div class="space-y-3 p-4 sm:p-5">
                  <div
                    class="flex flex-wrap items-start justify-between gap-3 gap-y-2"
                  >
                    <div class="min-w-0 space-y-1">
                      <p
                        class="text-muted-foreground text-xs font-medium"
                        :class="
                          stageBucket(m.status) === 'planned' &&
                          'text-muted-foreground/80'
                        "
                      >
                        {{ t('projects.detailLovable.milestone_phase_value') }}
                      </p>
                      <p
                        class="text-foreground text-lg font-bold tabular-nums sm:text-xl"
                        :class="
                          stageBucket(m.status) === 'planned' &&
                          'text-muted-foreground'
                        "
                      >
                        {{
                          formatCurrency(m.amount, project.currency || 'EGP')
                        }}
                      </p>
                    </div>
                    <div
                      class="flex min-w-0 flex-col items-end gap-2 text-end sm:max-w-[55%]"
                    >
                      <p
                        class="text-muted-foreground text-xs font-medium tabular-nums"
                      >
                        {{
                          t('projects.detailLovable.milestone_phase_label', {
                            n: idx + 1,
                          })
                        }}
                      </p>
                      <span
                        :class="milestoneStatusPillClass(stageBucket(m.status))"
                      >
                        {{ milestonePillText(stageBucket(m.status), m.status) }}
                      </span>
                    </div>
                  </div>
                  <div class="space-y-1">
                    <h3
                      class="text-foreground text-base leading-snug font-bold sm:text-lg"
                      :class="
                        stageBucket(m.status) === 'planned' &&
                        'text-muted-foreground'
                      "
                    >
                      {{ m.name }}
                    </h3>
                    <p
                      v-if="milestoneMeta(m).start"
                      class="text-muted-foreground text-sm"
                      :class="
                        stageBucket(m.status) === 'planned' &&
                        'text-muted-foreground/80'
                      "
                    >
                      <template v-if="milestoneMeta(m).end">
                        {{ milestoneMeta(m).start }} —
                        {{ milestoneMeta(m).end }}
                      </template>
                      <template v-else>
                        {{ milestoneMeta(m).start }}
                      </template>
                    </p>
                  </div>
                </div>
                <div
                  class="border-border/80 bg-muted/20 space-y-2 border-t px-4 py-3 sm:px-5"
                >
                  <div
                    class="text-muted-foreground flex items-center justify-between gap-2 text-xs font-medium"
                  >
                    <span class="text-foreground tabular-nums">
                      {{ milestoneProgressPercent(stageBucket(m.status)) }}%
                    </span>
                    <span>
                      {{ t('projects.detailLovable.milestone_progress') }}
                    </span>
                  </div>
                  <div
                    class="bg-muted flex h-2.5 w-full justify-start overflow-hidden rounded-full"
                  >
                    <div
                      :class="milestoneBarFillClass(stageBucket(m.status))"
                      :style="{
                        width: `${milestoneProgressPercent(stageBucket(m.status))}%`,
                      }"
                    />
                  </div>
                </div>
              </article>
            </div>
          </div>
        </template>
        <p v-else class="text-muted-foreground py-6 text-center text-sm">
          {{ t('project.details.noMilestones') }}
        </p>
      </CardContent>
    </Card>

    <!-- Bottom: activity | reports | schedule -->
    <div class="grid gap-4 lg:grid-cols-3">
      <Card class="shadow-card rounded-2xl border shadow-none">
        <CardHeader class="pb-2">
          <CardTitle class="text-base font-bold">
            {{ t('projects.detailLovable.activity_title') }}
          </CardTitle>
          <CardDescription class="text-pretty">
            {{ t('projects.detailLovable.activity_subtitle') }}
          </CardDescription>
        </CardHeader>
        <CardContent class="pt-0">
          <div ref="activityTimelineRef" class="relative space-y-2">
            <div
              v-if="MOCK_PROJECT_DETAIL_ACTIVITIES.length > 1"
              aria-hidden="true"
              class="border-muted-foreground/35 pointer-events-none absolute inset-s-[calc(1rem-1px)] w-0 border-s-2 border-dotted"
              :style="activitySpineStyle"
            />
            <div
              v-for="ev in MOCK_PROJECT_DETAIL_ACTIVITIES"
              :key="ev.id"
              class="relative z-10 flex items-start gap-2"
            >
              <div
                class="bg-card flex w-8 shrink-0 justify-center rounded-full pt-0.5"
              >
                <div data-timeline-icon :class="activityToneWrapClass(ev.tone)">
                  <component
                    :is="activityIconMap[ev.icon]"
                    class="size-3 shrink-0"
                  />
                </div>
              </div>
              <div class="min-w-0 flex-1 space-y-1 pt-0.5 pb-0.5 text-start">
                <p class="text-foreground text-sm leading-snug font-bold">
                  {{ t(`projects.detailLovable.activity.${ev.titleKey}`) }}
                </p>
                <p
                  class="text-muted-foreground flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs"
                >
                  <CalendarDays
                    class="size-3 shrink-0 opacity-80"
                    aria-hidden="true"
                  />
                  <span class="tabular-nums">{{ formatDate(ev.date) }}</span>
                  <span class="text-muted-foreground/70" aria-hidden="true"
                    >·</span
                  >
                  <span>{{ activityActorLabel(ev.actorKey) }}</span>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="shadow-card rounded-2xl border shadow-none">
        <CardHeader class="pb-2">
          <CardTitle class="text-base font-bold">
            {{ t('projects.detailLovable.reports_title') }}
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
          <div
            v-for="r in MOCK_PROJECT_DETAIL_FIELD_REPORTS"
            :key="r.id"
            class="border-border space-y-2 rounded-lg border p-3"
          >
            <div class="flex flex-wrap items-start justify-between gap-2">
              <p class="text-foreground text-sm leading-snug font-medium">
                {{ t(`projects.detailLovable.reports.${r.titleKey}`) }}
              </p>
              <span :class="reportStatusPillClass(r.statusKey)">
                {{ t(`projects.detailLovable.reportStatus.${r.statusKey}`) }}
              </span>
            </div>
            <p class="text-muted-foreground text-xs tabular-nums">
              {{ formatDate(r.date) }}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card class="shadow-card rounded-2xl border shadow-none">
        <CardHeader class="pb-2">
          <CardTitle class="text-base font-bold">
            {{ t('projects.detailLovable.schedule_title') }}
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
          <div
            v-for="s in MOCK_PROJECT_DETAIL_SCHEDULE"
            :key="s.id"
            class="border-border flex items-center justify-between gap-2 rounded-lg border p-3"
          >
            <div class="flex min-w-0 items-center gap-2">
              <CalendarDays class="text-muted-foreground size-3.5 shrink-0" />
              <span class="text-foreground text-sm font-medium">
                {{ t(`projects.detailLovable.schedule.${s.titleKey}`) }}
              </span>
            </div>
            <span :class="scheduleStatusPillClass(s.statusKey)">
              {{
                s.statusKey === 'completed'
                  ? t('projects.detailLovable.schedule_status.completed')
                  : t('projects.detailLovable.schedule_status.in_progress')
              }}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
