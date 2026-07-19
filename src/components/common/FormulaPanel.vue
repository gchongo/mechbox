<template>
  <div class="formula-panel">
    <div class="formula-panel__eqs" :class="eqClass">
      <slot />
    </div>
    <div v-if="$slots.hints" class="formula-panel__hints">
      <slot name="hints" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  /** 1 = 单列；2 = 宽屏双列 */
  columns: { type: [Number, String], default: 2 },
})

const eqClass = computed(() =>
  Number(props.columns) >= 2 ? 'formula-panel__eqs--cols' : 'formula-panel__eqs--stack',
)
</script>

<style scoped>
.formula-panel {
  @apply mt-4 overflow-visible rounded-md border border-gray-200 bg-gray-50/80 p-3 text-sm dark:border-gray-700 dark:bg-gray-900/40;
}

.formula-panel__eqs {
  @apply gap-x-8 gap-y-1;
}

.formula-panel__eqs--stack {
  @apply flex flex-col items-stretch;
}

.formula-panel__eqs--stack :deep(.math-block) {
  text-align: left;
  margin: 0.15em 0;
}

.formula-panel__eqs--cols {
  @apply grid grid-cols-1 sm:grid-cols-2;
}

.formula-panel__eqs--cols :deep(.math-block) {
  text-align: left;
  margin: 0.12em 0;
}

.formula-panel__hints {
  @apply mt-3 space-y-1 border-t border-gray-200/90 pt-2 text-left text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400;
}

.formula-panel__hints :deep(ul) {
  @apply m-0 list-disc space-y-1 pl-5;
}
</style>
