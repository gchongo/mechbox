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
  // 块级用 \\displaystyle 放大，不用 katex displayMode（避免多余滚动条）
  const src = props.block ? `\\displaystyle ${props.expr}` : props.expr
  katex.render(src, container.value, {
    throwOnError: false,
    displayMode: false,
    strict: 'ignore',
  })
}

watch(() => [props.expr, props.block], render)
onMounted(render)
</script>

<style scoped>
.math-block {
  display: block;
  overflow: visible;
  margin: 0.15em 0;
  text-align: left;
  line-height: 1.45;
}

.math-block :deep(.katex) {
  font-size: 1.05em;
  white-space: normal;
}

.math-inline {
  display: inline;
}

.math-inline :deep(.katex) {
  font-size: 1.05em;
}
</style>
