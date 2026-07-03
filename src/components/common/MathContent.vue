<template>
  <component :is="block ? 'div' : 'span'" class="math-content" :class="{ 'math-content-block': block }">
    <template v-for="(part, i) in parts" :key="i">
      <MathTex v-if="part.type === 'math'" :expr="part.content" :block="part.block" />
      <span v-else>{{ part.content }}</span>
    </template>
  </component>
</template>

<script setup>
import { computed } from 'vue'
import MathTex from './MathTex.vue'

const props = defineProps({
  text: { type: String, default: '' },
  block: { type: Boolean, default: false },
})

/** 解析 `$...$` 行内公式与 `$$...$$` 块级公式 */
const parts = computed(() => {
  const input = props.text ?? ''
  if (!input) return []

  const result = []
  const regex = /\$\$([\s\S]+?)\$\$|\$([^$]+?)\$/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      result.push({ type: 'text', content: input.slice(lastIndex, match.index) })
    }
    if (match[1] != null) {
      result.push({ type: 'math', content: match[1].trim(), block: true })
    } else {
      result.push({ type: 'math', content: match[2].trim(), block: false })
    }
    lastIndex = regex.lastIndex
  }

  if (lastIndex < input.length) {
    result.push({ type: 'text', content: input.slice(lastIndex) })
  }

  if (!result.length) {
    result.push({ type: 'text', content: input })
  }

  return result
})
</script>

<style scoped>
.math-content:not(.math-content-block) {
  display: inline;
  white-space: normal;
}

.math-content:not(.math-content-block) :deep(.katex) {
  display: inline;
  white-space: nowrap;
}

.math-content-block {
  display: block;
  line-height: 1.8;
}
</style>
