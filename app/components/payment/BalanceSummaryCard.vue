<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '~/components/ui/button'
import { formatCurrency } from '~/utils/formatters'

interface Props {
  earned: number
  locked: number
  available: number
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
})

const emit = defineEmits<{
  requestWithdrawal: []
}>()

const { t } = useI18n()

const balanceItems = computed(() => [
  {
    label: t('withdrawal.balance.earned'),
    value: props.earned,
    isDimmed: false,
  },
  {
    label: t('withdrawal.balance.locked'),
    value: props.locked,
    isDimmed: true,
  },
  {
    label: t('withdrawal.balance.available'),
    value: props.available,
    isDimmed: false,
    isHighlight: true,
  },
])
</script>

<template>
  <div
    class="bg-card shadow-elevated rounded-3xl border p-6"
    :class="{ 'opacity-60': isLoading }"
  >
    <!-- Balance Items -->
    <div class="space-y-6">
      <template v-for="(item, idx) in balanceItems" :key="idx">
        <div
          :class="[
            'flex flex-col gap-1',
            idx !== balanceItems.length - 1 && 'border-border border-b pb-4',
          ]"
        >
          <span
            :class="[
              'text-sm',
              item.isDimmed
                ? 'text-muted-foreground'
                : 'text-foreground font-medium',
            ]"
          >
            {{ item.label }}
          </span>
          <span
            :class="[
              item.isHighlight
                ? 'text-primary text-3xl font-extrabold'
                : 'text-ink text-sm',
            ]"
          >
            {{ formatCurrency(item.value) }}
          </span>
        </div>
      </template>
    </div>

    <!-- Request Withdrawal Button -->
    <Button
      class="mt-6 w-full"
      :disabled="isLoading || available <= 0"
      @click="emit('requestWithdrawal')"
    >
      {{ t('withdrawal.form.submit') }} →
    </Button>
  </div>
</template>
