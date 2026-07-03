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
  display: inline-block;
  width: auto;
  max-width: fit-content;
  flex: none;
  white-space: nowrap;
  vertical-align: baseline;
}

:deep(.math-content) {
  display: inline;
  white-space: inherit;
}

:deep(.math-inline),
:deep(.math-inline .katex) {
  display: inline;
  white-space: inherit;
}
</style>
