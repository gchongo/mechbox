<template>
  <MathContent :text="enriched" class="form-math-label" />
</template>

<script setup>
import { computed } from 'vue'
import MathContent from './MathContent.vue'
import { enrichMathText } from '@/utils/math-label'

const props = defineProps({
  text: { type: String, default: '' },
})

const enriched = computed(() => enrichMathText(props.text))
</script>

<style scoped>
.form-math-label {
  display: inline;
  line-height: 1.4;
}

.form-math-label :deep(.katex) {
  font-size: 1em;
}
</style>
