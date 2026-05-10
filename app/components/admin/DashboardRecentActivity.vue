<script setup lang="ts">
import {
  FolderPlus,
  CheckCircle,
  Banknote,
  UserPlus,
  Briefcase,
  Rocket,
  ClipboardList,
} from 'lucide-vue-next'
import { Skeleton } from '../ui/skeleton'
import type { RecentEvent, RecentEventType } from '~/shared/types/admin'
import { formatDate } from '~/utils/formatters'

interface Props {
  events: RecentEvent[]
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false,
})

const { t } = useI18n()

function iconForType(type: RecentEventType) {
  const map: Record<RecentEventType, typeof FolderPlus> = {
    project_created: FolderPlus,
    milestone_approved: CheckCircle,
    payment_released: Banknote,
    user_created: UserPlus,
    contractor_selected: Briefcase,
    bidding_opened: Rocket,
    milestone_under_review: ClipboardList,
  }
  return map[type] ?? ClipboardList
}
</script>

<template>
  <div
    class="bg-card border-border shadow-card rounded-2xl border p-6"
    data-testid="recent-activity-section"
  >
    <h3 class="text-foreground mb-4 text-lg font-extrabold">
      {{ t('admin.dashboard.recent_activity.title') }}
    </h3>

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 5" :key="`ev-sk-${i}`" class="flex gap-3">
        <Skeleton class="h-10 w-10 shrink-0 rounded-full" />
        <div class="flex-1 space-y-2">
          <Skeleton class="h-4 w-full" />
          <Skeleton class="h-3 w-2/3" />
        </div>
      </div>
    </div>

    <ul v-else-if="events.length > 0" class="space-y-4">
      <li
        v-for="ev in events"
        :key="ev.id"
        class="flex gap-3 text-start"
        :data-testid="`recent-event-${ev.id}`"
      >
        <span
          class="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          aria-hidden="true"
        >
          <component :is="iconForType(ev.type)" class="h-5 w-5" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="text-foreground font-semibold">
            {{ ev.title }}
          </p>
          <p v-if="ev.subtitle" class="text-muted-foreground mt-0.5 text-sm">
            {{ ev.subtitle }}
          </p>
          <p class="text-muted-foreground mt-1 text-xs">
            <template v-if="ev.related_name">
              {{ ev.related_name }} · {{ formatDate(ev.timestamp) }}
            </template>
            <template v-else>
              {{ formatDate(ev.timestamp) }}
            </template>
          </p>
        </div>
      </li>
    </ul>

    <p v-else class="text-muted-foreground py-8 text-center text-sm">
      {{ t('admin.dashboard.recent_activity.empty') }}
    </p>
  </div>
</template>
