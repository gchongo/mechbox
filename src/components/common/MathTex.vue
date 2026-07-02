<template>
  <component :is="block ? 'div' : 'span'" ref="container" :class="block ? 'math-block' : 'math-inline'" />
</template>

<script setup>
import katex from 'katex'
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  expr: { type: String, default: '' },
  block: { type: Boolean, default: false },
})

const container = ref(null)

function render() {
  if (!container.value || !props.expr) {
    if (container.value) container.value.textContent = ''
    return
  }
  katex.render(props.expr, container.value, {
    throwOnError: false,
    displayMode: props.block,
    strict: 'ignore',
  })
}

watch(() => [props.expr, props.block], render)
onMounted(render)
</script>

<style scoped>
.math-block {
  display: block;
  overflow-x: auto;
  padding: 0.5rem 0;
  text-align: center;
}

.math-inline {
  display: inline;
}

.math-inline :deep(.katex) {
  font-size: 1.05em;
}
</style>
