<template>
  <dt :class="[labelClass, 'result-label']"><MathContent :text="enriched" /></dt>
</template>

<script setup>
import { computed } from 'vue'
import { enrichMathText } from '@/utils/math-label'

const props = defineProps({
  text: { type: String, default: '' },
  labelClass: { type: String, default: '' },
})

const enriched = computed(() => enrichMathText(props.text))
</script>

<style scoped>
.result-label {
  @apply shrink-0 whitespace-nowrap;
}

:deep(.math-content) {
  display: inline;
}

:deep(.math-inline),
:deep(.math-inline .katex) {
  display: inline;
  white-space: nowrap;
}
</style>
