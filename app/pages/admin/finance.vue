<script setup lang="ts">
import { computed, onMounted } from 'vue'
import PageContentSkeleton from '~/components/common/PageContentSkeleton.vue'
import ErrorState from '~/components/common/ErrorState.vue'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { formatCurrency } from '~/utils/formatters'

definePageMeta({
  roles: ['admin', 'super_admin'],
  pageTitle: 'pages.admin_finance_title',
})

const { can } = usePermission()

if (!can('view_admin_panel')) {
  await navigateTo('/403')
}

const { stats, loading, error, fetchOverview } = useFinanceOverviewWorkspace()

onMounted(() => {
  void fetchOverview()
})

function retry() {
  void fetchOverview()
}

const revenue = computed(() => stats.value?.platformRevenueEgp ?? 0)
const pendingWithdrawals = computed(
  () => stats.value?.pendingWithdrawalsEgp ?? 0
)
const settled = computed(() => stats.value?.settledPayoutsEgp ?? 0)
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold">
        {{ $t('pages.admin_finance_title') }}
      </h1>
      <p class="text-muted-foreground mt-2">
        {{ $t('pages.admin_finance_description') }}
      </p>
    </div>

    <PageContentSkeleton
      v-if="loading && !stats"
      :show-cards="true"
      :rows="4"
    />

    <ErrorState v-else-if="error" :message="error" @action="retry" />

    <template v-else-if="stats">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card class="shadow-none">
          <CardHeader class="pb-2">
            <CardTitle class="text-muted-foreground text-sm font-medium">
              {{ $t('pages.admin_finance_stat_revenue') }}
            </CardTitle>
          </CardHeader>
          <CardContent class="pt-0">
            <p class="text-foreground text-2xl font-extrabold">
              {{ formatCurrency(revenue) }}
            </p>
          </CardContent>
        </Card>
        <Card class="shadow-none">
          <CardHeader class="pb-2">
            <CardTitle class="text-muted-foreground text-sm font-medium">
              {{ $t('pages.admin_finance_stat_pending_withdrawals') }}
            </CardTitle>
          </CardHeader>
          <CardContent class="pt-0">
            <p class="text-foreground text-2xl font-extrabold">
              {{ formatCurrency(pendingWithdrawals) }}
            </p>
          </CardContent>
        </Card>
        <Card class="shadow-none">
          <CardHeader class="pb-2">
            <CardTitle class="text-muted-foreground text-sm font-medium">
              {{ $t('pages.admin_finance_stat_settled') }}
            </CardTitle>
          </CardHeader>
          <CardContent class="pt-0">
            <p class="text-foreground text-2xl font-extrabold">
              {{ formatCurrency(settled) }}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card class="shadow-none">
        <CardHeader class="pb-3">
          <CardTitle class="text-base font-semibold">
            {{ $t('pages.admin_finance_activity_title') }}
          </CardTitle>
        </CardHeader>
        <CardContent class="pt-0">
          <p class="text-muted-foreground py-8 text-center text-sm">
            {{ $t('pages.admin_finance_activity_empty') }}
          </p>
        </CardContent>
      </Card>
    </template>
  </div>
</template>
