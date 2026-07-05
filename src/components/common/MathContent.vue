<template>
  <component :is="block ? 'div' : 'span'" class="math-content" :class="{ 'math-content-block': block }">
    <template v-for="(part, i) in parts" :key="i">
      <MathTex v-if="part.type === 'math'" :expr="part.content" :block="part.block" />
      <strong v-else-if="part.type === 'bold'" class="math-content-bold">{{ part.content }}</strong>
      <span v-else>{{ part.content }}</span>
    </template>
  </component>
</template>

<script setup>
import { computed } from 'vue'
import MathTex from './MathTex.vue'
import { parseMathContent } from '@/utils/parse-math-content'
import { enrichMathText } from '@/utils/math-label'
import { normalizeHelpText } from '@/utils/help-text-normalize'
import { useLocale } from '@/composables/useLocale'

const props = defineProps({
  text: { type: String, default: '' },
  block: { type: Boolean, default: false },
  /** 覆盖全局 locale（帮助页一般跟随设置） */
  locale: { type: String, default: '' },
})

const { locale: globalLocale } = useLocale()

const activeLocale = computed(() => props.locale || globalLocale.value || 'zh')

function flattenParts(segments) {
  const out = []
  for (const seg of segments) {
    if (seg.type === 'math') {
      out.push(seg)
      continue
    }
    const enriched = enrichMathText(seg.content)
    if (!/\$/.test(enriched)) {
      out.push({ type: seg.type, content: enriched })
      continue
    }
    for (const piece of parseMathContent(enriched)) {
      if (piece.type === 'math') {
        out.push(piece)
      } else {
        out.push({ type: seg.type, content: piece.content })
      }
    }
  }
  return out
}

const parts = computed(() => {
  const normalized = normalizeHelpText(props.text, activeLocale.value)
  return flattenParts(parseMathContent(normalized))
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

.math-content-bold {
  font-weight: 600;
}
</style>
