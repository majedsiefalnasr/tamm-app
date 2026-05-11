<script setup lang="ts">
import { onMounted } from 'vue'
import PageContentSkeleton from '~/components/common/PageContentSkeleton.vue'
import ErrorState from '~/components/common/ErrorState.vue'
import EmptyState from '~/components/common/EmptyState.vue'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'

definePageMeta({
  roles: ['admin', 'super_admin'],
  pageTitle: 'pages.admin_workflow_title',
})

const { can } = usePermission()

if (!can('view_admin_panel')) {
  await navigateTo('/403')
}

const { rules, loading, error, fetchRules } = useWorkflowRulesWorkspace()

onMounted(() => {
  void fetchRules()
})

function retry() {
  void fetchRules()
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold">
        {{ $t('pages.admin_workflow_title') }}
      </h1>
      <p class="text-muted-foreground mt-2">
        {{ $t('pages.admin_workflow_description') }}
      </p>
    </div>

    <PageContentSkeleton
      v-if="loading && rules.length === 0"
      :show-cards="true"
      :rows="4"
    />

    <ErrorState v-else-if="error" :message="error" @action="retry" />

    <template v-else>
      <Card class="shadow-none">
        <CardHeader class="pb-3">
          <CardTitle class="text-base font-semibold">
            {{ $t('pages.admin_workflow_rules_title') }}
          </CardTitle>
        </CardHeader>
        <CardContent class="pt-0">
          <EmptyState
            v-if="rules.length === 0"
            icon="clipboard"
            title="pages.admin_workflow_rules_empty_title"
            description="pages.admin_workflow_rules_empty_description"
          >
            <Button as-child variant="outline" class="mt-1">
              <NuxtLink to="/projects">{{ $t('nav.projects') }}</NuxtLink>
            </Button>
          </EmptyState>
        </CardContent>
      </Card>
    </template>
  </div>
</template>
