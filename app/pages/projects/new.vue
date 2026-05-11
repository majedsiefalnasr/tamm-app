<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { usePermission } from '~/composables/usePermission'

definePageMeta({
  roles: ['client'],
  pageTitle: 'pages.new_project_title',
})

const { can } = usePermission()

if (!can('create_project')) {
  await navigateTo('/403')
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold">
        {{ $t('pages.new_project_title') }}
      </h1>
      <p class="text-muted-foreground mt-2">
        {{ $t('pages.new_project_description') }}
      </p>
    </div>

    <div class="flex flex-wrap gap-3">
      <Button variant="outline" as-child>
        <NuxtLink to="/projects">
          {{ $t('pages.new_project_back') }}
        </NuxtLink>
      </Button>
    </div>
  </div>
</template>
