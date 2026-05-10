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
      <CardContent class="flex flex-col gap-6">
        <div
          class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="min-w-0 flex-1 text-start">
            <p class="text-foreground font-medium">
              {{ t('settings.shortcut_palette_label') }}
            </p>
            <p class="text-muted-foreground text-sm">
              {{ t('settings.shortcut_palette_desc') }}
            </p>
            <p class="text-muted-foreground mt-1 text-sm">
              {{ t('settings.shortcut_palette_detail') }}
            </p>
          </div>
          <div
            dir="ltr"
            class="flex shrink-0 flex-wrap items-center gap-1"
            aria-hidden="true"
          >
            <Kbd>{{ t('commandPalette.modMeta') }}</Kbd>
            <span class="text-muted-foreground text-xs">/</span>
            <Kbd>{{ t('commandPalette.modCtrl') }}</Kbd>
            <span class="text-muted-foreground text-xs">+</span>
            <Kbd>K</Kbd>
          </div>
        </div>

        <div
          class="flex flex-col gap-2 border-t pt-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="min-w-0 flex-1 text-start">
            <p class="text-foreground font-medium">
              {{ t('settings.shortcut_sidebar_label') }}
            </p>
            <p class="text-muted-foreground text-sm">
              {{ t('settings.shortcut_sidebar_desc') }}
            </p>
            <p class="text-muted-foreground mt-1 text-sm">
              {{ t('settings.shortcut_sidebar_detail') }}
            </p>
          </div>
          <div
            dir="ltr"
            class="flex shrink-0 flex-wrap items-center gap-1"
            aria-hidden="true"
          >
            <Kbd>{{ t('commandPalette.modMeta') }}</Kbd>
            <span class="text-muted-foreground text-xs">/</span>
            <Kbd>{{ t('commandPalette.modCtrl') }}</Kbd>
            <span class="text-muted-foreground text-xs">+</span>
            <Kbd>B</Kbd>
          </div>
        </div>

        <div
          class="flex flex-col gap-2 border-t pt-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="min-w-0 flex-1 text-start">
            <p class="text-foreground font-medium">
              {{ t('settings.shortcut_escape_label') }}
            </p>
            <p class="text-muted-foreground text-sm">
              {{ t('settings.shortcut_escape_desc') }}
            </p>
            <p class="text-muted-foreground mt-1 text-sm">
              {{ t('settings.shortcut_escape_detail') }}
            </p>
          </div>
          <div
            dir="ltr"
            class="flex shrink-0 flex-wrap items-center gap-1"
            aria-hidden="true"
          >
            <Kbd>{{ t('settings.shortcut_escape_key') }}</Kbd>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
