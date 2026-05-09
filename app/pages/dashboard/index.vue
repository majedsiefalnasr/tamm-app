<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'dashboard-hub'],
  pageTitle: 'pages.contractor_dashboard',
})
</script>

<template>
  <ContractorDashboardPage />
</template>
