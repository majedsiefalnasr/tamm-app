<script setup lang="ts">
definePageMeta({
  roles: ['supervisor_engineer'],
  pageTitle: 'pages.supervisor_field_team_title',
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold">
        {{ $t('pages.supervisor_field_team_title') }}
      </h1>
      <p class="text-muted-foreground mt-2">
        {{ $t('pages.supervisor_field_team_description') }}
      </p>
    </div>
  </div>
</template>
