<script setup lang="ts">
import { computed, onMounted } from 'vue'
import PageContentSkeleton from '~/components/common/PageContentSkeleton.vue'
import ErrorState from '~/components/common/ErrorState.vue'
import EmptyState from '~/components/common/EmptyState.vue'
import { Button } from '~/components/ui/button'

definePageMeta({
  roles: [
    'client',
    'contractor',
    'field_engineer',
    'supervisor_engineer',
    'admin',
    'super_admin',
  ],
  pageTitle: 'pages.messages_title',
})

const { conversations, loading, error, fetchWorkspace } = useMessagesWorkspace()

onMounted(() => {
  void fetchWorkspace()
})

function retryFetch() {
  void fetchWorkspace()
}

const showSkeleton = computed(
  () => loading.value && conversations.value.length === 0
)

const showEmpty = computed(
  () => !loading.value && !error.value && conversations.value.length === 0
)
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold">{{ $t('pages.messages_title') }}</h1>
      <p class="text-muted-foreground mt-2">
        {{ $t('pages.messages_subtitle') }}
      </p>
    </div>

    <PageContentSkeleton v-if="showSkeleton" :rows="6" />

    <ErrorState v-else-if="error" :message="error" @action="retryFetch" />

    <EmptyState
      v-else-if="showEmpty"
      icon="inbox"
      title="pages.messages_empty_title"
      description="pages.messages_empty_description"
    >
      <Button as-child variant="outline" class="mt-1">
        <NuxtLink to="/dashboard">{{
          $t('pages.messages_empty_next')
        }}</NuxtLink>
      </Button>
    </EmptyState>

    <div
      v-else
      class="border-border divide-y overflow-hidden rounded-xl border"
    >
      <div
        v-for="c in conversations"
        :key="c.id"
        class="hover:bg-muted/40 flex flex-col gap-1 px-4 py-4 transition"
      >
        <p class="text-foreground font-semibold">{{ c.title }}</p>
        <p class="text-muted-foreground line-clamp-2 text-sm">
          {{ c.lastMessagePreview }}
        </p>
      </div>
    </div>
  </div>
</template>
