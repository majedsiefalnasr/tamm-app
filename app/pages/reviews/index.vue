<script setup lang="ts">
import { useAsyncData } from '#app'
import { useMilestones } from '~/composables/useMilestones'
import { useNotifications } from '~/composables/useNotifications'
import PendingReviewsList from '~/components/review/PendingReviewsList.vue'

definePageMeta({
  roles: ['supervisor_engineer'],
  pageTitle: 'pages.reviews.title',
})

const {
  getPendingReviews,
  refreshPendingReviews,
  pendingReviews,
  loading,
  error,
} = useMilestones()
const { showNotification } = useNotifications()

// Load pending reviews with caching
const { data: reviews, refresh } = await useAsyncData(
  'pending-reviews',
  () => getPendingReviews(),
  {
    transform: result => result || [],
  }
)

const handleRetry = async () => {
  await refresh()
}

const handleActionComplete = async () => {
  // Show success message
  showNotification({
    type: 'success',
    message: 'Action completed successfully',
    duration: 3000,
  })
  // Refresh the list
  await refreshPendingReviews()
  await refresh()
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div>
      <h1 class="text-3xl font-bold">{{ $t('pages.reviews') }}</h1>
      <p class="text-muted-foreground mt-1 text-sm">
        {{ pendingReviews.length }} {{ $t('pages.reviews.pending') }}
      </p>
    </div>

    <!-- Breadcrumb -->
    <nav class="text-muted-foreground flex items-center gap-2 text-sm">
      <NuxtLink to="/" class="hover:underline">{{
        $t('common.home')
      }}</NuxtLink>
      <span>›</span>
      <span class="text-foreground">{{ $t('pages.reviews') }}</span>
    </nav>

    <!-- Reviews list -->
    <PendingReviewsList
      :items="reviews || []"
      :loading="loading"
      :error="error"
      @retry="handleRetry"
      @action-complete="handleActionComplete"
    />
  </div>
</template>
