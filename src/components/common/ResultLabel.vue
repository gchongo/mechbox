<template>
  <dt :class="labelClass"><MathContent :text="enriched" /></dt>
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
:deep(.math-content) {
  display: inline;
}
</style>
