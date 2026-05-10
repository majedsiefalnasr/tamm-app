<script setup lang="ts">
import FieldEngineerDashboard from '~/components/dashboard/FieldEngineerDashboard.vue'

definePageMeta({
  roles: ['field_engineer'],
  pageTitle: 'dashboard.fieldEngineer.title',
})
</script>

<template>
  <div class="px-4 pt-6 pb-16 md:px-8 md:pt-8 md:pb-20">
    <FieldEngineerDashboard />
  </div>
</template>
