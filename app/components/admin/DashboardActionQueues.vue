<script setup lang="ts">
import { Skeleton } from '../ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import type { ActionQueues } from '~/shared/types/admin'

interface Props {
  queues: ActionQueues
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false,
})

const { t } = useI18n()

function queueSectionTitle(
  key: 'open_bidding' | 'assign_engineers' | 'release_payment'
) {
  const titles = {
    open_bidding: 'admin.dashboard.action_queues.open_bidding_title',
    assign_engineers: 'admin.dashboard.action_queues.assign_engineers_title',
    release_payment: 'admin.dashboard.action_queues.release_payment_title',
  }
  return t(titles[key])
}

function emptyLabel(
  key: 'open_bidding' | 'assign_engineers' | 'release_payment'
) {
  const keys = {
    open_bidding: 'admin.dashboard.action_queues.empty_open_bidding',
    assign_engineers: 'admin.dashboard.action_queues.empty_assign_engineers',
    release_payment: 'admin.dashboard.action_queues.empty_release_payment',
  }
  return t(keys[key])
}
</script>

<template>
  <Card
    class="shadow-card gap-4 rounded-2xl py-6 shadow-none"
    data-testid="action-queues-section"
  >
    <CardHeader>
      <CardTitle class="text-foreground text-lg font-extrabold">
        {{ t('admin.dashboard.action_queues.title') }}
      </CardTitle>
    </CardHeader>

    <CardContent v-if="loading" class="space-y-4">
      <Skeleton class="h-24 w-full" />
      <Skeleton class="h-24 w-full" />
    </CardContent>

    <CardContent v-else class="space-y-8">
      <section data-testid="action-queue-open-bidding">
        <h4 class="text-muted-foreground mb-2 text-sm font-semibold">
          {{ queueSectionTitle('open_bidding') }}
        </h4>
        <ul v-if="queues.open_bidding.length > 0" class="space-y-3">
          <li
            v-for="item in queues.open_bidding"
            :key="item.id"
            class="border-border flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="min-w-0 flex-1 text-start">
              <p class="text-foreground font-semibold">
                {{ item.title }}
              </p>
              <p class="text-muted-foreground mt-0.5 text-sm">
                {{ item.subtitle }}
              </p>
            </div>
            <NuxtLink
              :to="item.action_href"
              class="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 shrink-0 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition"
            >
              {{ t(item.action_label_key) }}
            </NuxtLink>
          </li>
        </ul>
        <p v-else class="text-muted-foreground py-4 text-center text-sm">
          {{ emptyLabel('open_bidding') }}
        </p>
      </section>

      <section data-testid="action-queue-assign-engineers">
        <h4 class="text-muted-foreground mb-2 text-sm font-semibold">
          {{ queueSectionTitle('assign_engineers') }}
        </h4>
        <ul v-if="queues.assign_engineers.length > 0" class="space-y-3">
          <li
            v-for="item in queues.assign_engineers"
            :key="item.id"
            class="border-border flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="min-w-0 flex-1 text-start">
              <p class="text-foreground font-semibold">
                {{ item.title }}
              </p>
              <p class="text-muted-foreground mt-0.5 text-sm">
                {{ item.subtitle }}
              </p>
            </div>
            <NuxtLink
              :to="item.action_href"
              class="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 shrink-0 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition"
            >
              {{ t(item.action_label_key) }}
            </NuxtLink>
          </li>
        </ul>
        <p v-else class="text-muted-foreground py-4 text-center text-sm">
          {{ emptyLabel('assign_engineers') }}
        </p>
      </section>

      <section data-testid="action-queue-release-payment">
        <h4 class="text-muted-foreground mb-2 text-sm font-semibold">
          {{ queueSectionTitle('release_payment') }}
        </h4>
        <ul v-if="queues.release_payment.length > 0" class="space-y-3">
          <li
            v-for="item in queues.release_payment"
            :key="item.id"
            class="border-border flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="min-w-0 flex-1 text-start">
              <p class="text-foreground font-semibold">
                {{ item.title }}
              </p>
              <p class="text-muted-foreground mt-0.5 text-sm">
                {{ item.subtitle }}
              </p>
            </div>
            <NuxtLink
              :to="item.action_href"
              class="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 shrink-0 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition"
            >
              {{ t(item.action_label_key) }}
            </NuxtLink>
          </li>
        </ul>
        <p v-else class="text-muted-foreground py-4 text-center text-sm">
          {{ emptyLabel('release_payment') }}
        </p>
      </section>
    </CardContent>
  </Card>
</template>
