<template>
  <aside
    class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/60"
    role="note"
  >
    <p class="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
      <span class="font-medium text-gray-600 dark:text-gray-300">{{ t('calc.common.disclaimerTitle') }}：</span>
      {{ t('calc.common.disclaimerBody') }}
    </p>
  </aside>
</template>

<script setup>
import { useLocale } from '@/composables/useLocale'

const { t } = useLocale()
</script>
