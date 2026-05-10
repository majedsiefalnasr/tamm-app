<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Kbd } from '~/components/ui/kbd'

definePageMeta({
  pageTitle: 'settings.title',
})

const { t } = useI18n()
</script>

<template>
  <div class="flex flex-1 flex-col gap-6 p-4 md:p-6">
    <div>
      <h1 class="text-foreground text-2xl font-semibold tracking-tight">
        {{ t('settings.title') }}
      </h1>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>{{ t('settings.keyboardShortcuts') }}</CardTitle>
      </CardHeader>
      <CardContent class="flex flex-col gap-4">
        <div
          class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p class="text-foreground font-medium">
              {{ t('settings.shortcut_palette_label') }}
            </p>
            <p class="text-muted-foreground text-sm">
              {{ t('settings.shortcut_palette_desc') }}
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-1">
            <Kbd>{{ t('commandPalette.modMeta') }}</Kbd>
            <span class="text-muted-foreground text-xs">/</span>
            <Kbd>{{ t('commandPalette.modCtrl') }}</Kbd>
            <span class="text-muted-foreground text-xs">+</span>
            <Kbd>K</Kbd>
          </div>
        </div>
        <p class="text-muted-foreground text-sm">
          {{ t('settings.shortcut_palette_detail') }}
        </p>
      </CardContent>
    </Card>
  </div>
</template>
